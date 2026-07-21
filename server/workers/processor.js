const fs = require("fs");
const path = require("path");
const os = require("os");
const supabase = require("../services/supabase");
const { extractAudio } = require("../ffmpeg/extract");
const { transcribeAudio } = require("../services/gemini");
const { generateAss } = require("../services/subtitle");
const { burnSubtitles } = require("../ffmpeg/burn");

const POLL_INTERVAL_MS = 5000;
const STALE_SWEEP_MS = 60000;
const STALE_TIMEOUT_MIN = 10;
const MAX_CONCURRENCY = 2;
const isDev = process.env.NODE_ENV === "development";

const activeJobs = new Set();

function log(...args) {
  if (isDev) console.log(`[Worker]`, ...args);
}

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

    log(`[${jobId}] Downloading video...`);
    const videoPath = path.join(tmpDir, "input.mp4");
    await downloadFile(job.original_video_url, videoPath);

    log(`[${jobId}] Extracting audio...`);
    const audioPath = await extractAudio(videoPath, tmpDir);

    log(`[${jobId}] Transcribing with Gemini...`);
    const transcript = await transcribeAudio(audioPath);

    log(`[${jobId}] Generating subtitles...`);
    const assPath = await generateAss(transcript, job.subtitle_style, tmpDir);

    log(`[${jobId}] Burning subtitles...`);
    const outputPath = await burnSubtitles(videoPath, assPath, tmpDir);

    log(`[${jobId}] Uploading processed video...`);
    const fileName = `job_${jobId}_processed.mp4`;
    const fileStream = fs.createReadStream(outputPath);

    const { error: uploadError } = await supabase.storage
      .from("processed")
      .upload(fileName, fileStream, {
        contentType: "video/mp4",
        upsert: true,
      });

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

    const { data: publicUrlData } = supabase.storage
      .from("processed")
      .getPublicUrl(fileName);

    log(`[${jobId}] Updating job as completed...`);
    const { error: completeError } = await supabase.rpc("complete_job", {
      p_job_id: jobId,
      p_output_video_url: publicUrlData.publicUrl,
      p_transcript_json: transcript,
    });

    if (completeError) throw new Error(`Failed to complete job: ${completeError.message}`);

    log(`[${jobId}] Done.`);
  } catch (err) {
    log(`[${jobId}] Failed:`, err.message);

    const { error: failError } = await supabase.rpc("fail_job", {
      p_job_id: jobId,
      p_error_message: err.message,
    });

    if (failError) console.error(`[${jobId}] Failed to update error status:`, failError.message);

    if (isDev) {
      console.error(err);
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    activeJobs.delete(jobId);
  }
}

/* ─── Atomically claim and process a queued job ─── */

async function claimAndProcess() {
  // Claim the oldest queued job using a single RPC that returns the claimed row
  const { data: job, error } = await supabase
    .from("jobs")
    .update({ status: "processing" })
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(1)
    .select("*")
    .single();

  if (error) {
    if (error.code === "PGRST116") return; // no rows matched — normal
    console.error("[Worker] Claim error:", error.message);
    return;
  }

  activeJobs.add(job.id);
  log(`[${job.id}] Claimed (active: ${activeJobs.size})`);

  // Process in background — errors are handled inside processJob
  processJob(job).catch((err) => {
    console.error(`[${job.id}] Unhandled process error:`, err.message);
  });
}

/* ─── Poll for new work ─── */

async function poll() {
  const slots = MAX_CONCURRENCY - activeJobs.size;
  if (slots <= 0) return;

  // Claim up to `slots` jobs, one per poll cycle
  // (DB UPDATE returns at most 1 row per call, so we loop)
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
    console.error("[Worker] Stale check error:", error.message);
    return;
  }

  if (!stale || stale.length === 0) return;

  log(`Re-queuing ${stale.length} stale processing job(s)...`);

  for (const job of stale) {
    const { error: reqErr } = await supabase.rpc("requeue_job", {
      p_job_id: job.id,
    });
    if (reqErr) {
      // If requeue fails (e.g. retry_count >= 3), leave it as failed
      console.error(`[Worker] Failed to re-queue stale job ${job.id}:`, reqErr.message);
    }
  }
}

/* ─── Start ─── */

function start() {
  log(`Worker started (concurrency: ${MAX_CONCURRENCY}, poll: ${POLL_INTERVAL_MS / 1000}s)`);

  // Recover stale jobs on startup
  requeueStaleJobs();

  // Periodic stale sweep
  setInterval(requeueStaleJobs, STALE_SWEEP_MS);

  // Start polling
  poll();
  setInterval(poll, POLL_INTERVAL_MS);
}

module.exports = { start };
