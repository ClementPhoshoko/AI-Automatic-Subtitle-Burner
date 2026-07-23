const fs = require("fs");
const path = require("path");
const os = require("os");
const supabase = require("../services/supabase");
const { extractAudio } = require("../ffmpeg/extract");
const { getVideoMetadata } = require("../ffmpeg/metadata");
const { generateThumbnail } = require("../ffmpeg/thumbnail");
const { transcribeAudio } = require("../services/gemini");
const { generateAss } = require("../services/subtitle");
const { burnSubtitles } = require("../ffmpeg/burn");
const logger = require("../utils/logger");

const POLL_INTERVAL_MS = 5000;
const STALE_SWEEP_MS = 60000;
const STALE_TIMEOUT_MIN = 10;
const MAX_CONCURRENCY = 2;

const activeJobs = new Set();

/* ─── Streaming download ─── */

async function downloadFile(url, dest) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);
  const writer = fs.createWriteStream(dest);
  const reader = response.body.getReader();
  const pump = async () => {
    while (true) {
      const { done, value } = await reader.read();
      if (done) { writer.end(); break; }
      writer.write(value);
    }
  };
  await pump();
  await new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
  return dest;
}

/* ─── Process a single job ─── */

async function processJob(job) {
  const jobId = job.id;
  const tmpDir = path.join(os.tmpdir(), "subtitle-burner", `job_${jobId}`);

  try {
    fs.mkdirSync(tmpDir, { recursive: true });

    logger.info(`[${jobId}] Downloading video...`);
    const videoPath = path.join(tmpDir, "input.mp4");
    await downloadFile(job.original_video_url, videoPath);

    let metadata = { duration: null, resolution: null, fileSize: null };
    let thumbnailUrl = null;

    try {
      logger.info(`[${jobId}] Extracting metadata...`);
      metadata = await getVideoMetadata(videoPath);
    } catch (metaErr) {
      logger.warn(`[${jobId}] Metadata extraction failed (non-blocking)`, { error: metaErr.message });
    }

    try {
      logger.info(`[${jobId}] Generating thumbnail...`);
      const thumbnailPath = await generateThumbnail(videoPath, tmpDir);

      const thumbFileName = `thumb_${jobId}.jpg`;
      const thumbBuffer = fs.readFileSync(thumbnailPath);
      const { error: thumbUploadError } = await supabase.storage
        .from("thumbnails")
        .upload(thumbFileName, thumbBuffer, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (!thumbUploadError) {
        const { data: thumbUrlData } = supabase.storage
          .from("thumbnails")
          .getPublicUrl(thumbFileName);
        thumbnailUrl = thumbUrlData.publicUrl;
      }
    } catch (thumbErr) {
      logger.warn(`[${jobId}] Thumbnail generation failed (non-blocking)`, { error: thumbErr.message });
    }

    const { error: metaError } = await supabase
      .from("jobs")
      .update({
        duration_seconds: metadata.duration,
        resolution: metadata.resolution,
        file_size: metadata.fileSize,
        thumbnail_url: thumbnailUrl,
      })
      .eq("id", jobId);

    if (metaError) {
      logger.error(`[${jobId}] Failed to store metadata`, { error: metaError.message });
    }

    logger.info(`[${jobId}] Extracting audio...`);
    const audioPath = await extractAudio(videoPath, tmpDir);

    logger.info(`[${jobId}] Transcribing with Gemini...`);
    const transcript = await transcribeAudio(audioPath);

    logger.info(`[${jobId}] Generating subtitles...`);
    const assPath = await generateAss(transcript, job.subtitle_style, tmpDir);

    logger.info(`[${jobId}] Burning subtitles...`);
    const outputPath = await burnSubtitles(videoPath, assPath, tmpDir);

    logger.info(`[${jobId}] Uploading processed video...`);
    const fileName = `job_${jobId}_processed.mp4`;
    const fileBuffer = fs.readFileSync(outputPath);

    const { error: uploadError } = await supabase.storage
      .from("processed")
      .upload(fileName, fileBuffer, {
        contentType: "video/mp4",
        upsert: true,
      });

    if (uploadError) {
      logger.error(`[${jobId}] Storage upload error`, { code: uploadError.code, message: uploadError.message });
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from("processed")
      .getPublicUrl(fileName);

    logger.info(`[${jobId}] Updating job as completed...`);
    const { error: completeError } = await supabase.rpc("complete_job", {
      p_job_id: jobId,
      p_output_video_url: publicUrlData.publicUrl,
      p_transcript_json: transcript,
    });

    if (completeError) throw new Error(`Failed to complete job: ${completeError.message}`);

    logger.info(`[${jobId}] Done.`);
  } catch (err) {
    logger.error(`[${jobId}] Failed`, { job: jobId, error: err.message });

    const { error: failError } = await supabase.rpc("fail_job", {
      p_job_id: jobId,
      p_error_message: err.message,
    });

    if (failError) {
      logger.error(`[${jobId}] Failed to update error status`, { error: failError.message });
      return;
    }

    const { data: jobRow } = await supabase
      .from("jobs")
      .select("retry_count")
      .eq("id", jobId)
      .single();

    const attempts = jobRow?.retry_count || 0;

    if (attempts < 3) {
      logger.warn(`[${jobId}] Retrying (attempt ${attempts}/3)...`);
      const { error: requeueError } = await supabase.rpc("requeue_job", {
        p_job_id: jobId,
      });
      if (requeueError) {
        logger.error(`[${jobId}] Failed to requeue`, { error: requeueError.message });
      }
    } else {
      logger.error(`[${jobId}] Terminated after ${attempts} failed attempts`);
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    activeJobs.delete(jobId);
  }
}

/* ─── Atomically claim and process a queued job ─── */

async function claimAndProcess() {
  const { data: job, error } = await supabase
    .from("jobs")
    .update({ status: "processing" })
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(1)
    .select("*")
    .single();

  if (error) {
    if (error.code === "PGRST116") return;
    logger.error("[Worker] Claim error", { error: error.message });
    return;
  }

  activeJobs.add(job.id);
  logger.info(`[${job.id}] Claimed`, { active: activeJobs.size });

  processJob(job).catch((err) => {
    logger.error(`[${job.id}] Unhandled process error`, { error: err.message });
  });
}

/* ─── Poll for new work ─── */

async function poll() {
  const slots = MAX_CONCURRENCY - activeJobs.size;
  if (slots <= 0) return;

  for (let i = 0; i < slots; i++) {
    await claimAndProcess();
  }
}

/* ─── Stale job recovery ─── */

async function requeueStaleJobs() {
  const cutoff = new Date(Date.now() - STALE_TIMEOUT_MIN * 60 * 1000).toISOString();

  const { data: stale, error } = await supabase
    .from("jobs")
    .select("id")
    .eq("status", "processing")
    .lt("created_at", cutoff);

  if (error) {
    logger.error("Stale check error", { error: error.message });
    return;
  }

  if (!stale || stale.length === 0) return;

  logger.info(`Re-queuing stale jobs`, { count: stale.length });

  for (const job of stale) {
    const { error: reqErr } = await supabase.rpc("requeue_job", {
      p_job_id: job.id,
    });
    if (reqErr) {
      logger.error("Failed to re-queue stale job", { job: job.id, error: reqErr.message });
    }
  }
}

/* ─── Start ─── */

function start() {
  logger.info("Worker started", { concurrency: MAX_CONCURRENCY, pollInterval: POLL_INTERVAL_MS / 1000 });

  requeueStaleJobs();

  setInterval(requeueStaleJobs, STALE_SWEEP_MS);

  poll();
  setInterval(poll, POLL_INTERVAL_MS);
}

module.exports = { start };
