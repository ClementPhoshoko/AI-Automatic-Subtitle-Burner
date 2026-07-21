const fs = require("fs");
const path = require("path");
const os = require("os");
const supabase = require("../services/supabase");
const { extractAudio } = require("../ffmpeg/extract");
const { transcribeAudio } = require("../services/gemini");
const { generateAss } = require("../services/subtitle");
const { burnSubtitles } = require("../ffmpeg/burn");

const POLL_INTERVAL_MS = 5000;
const isDev = process.env.NODE_ENV === "development";
let running = false;

function log(...args) {
  if (isDev) console.log(`[Worker]`, ...args);
}

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

    if (process.env.NODE_ENV === "development") {
      console.error(err);
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

async function poll() {
  if (running) return;
  running = true;

  try {
    const { data: jobs, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("status", "queued")
      .order("created_at", { ascending: true })
      .limit(1);

    if (error) {
      console.error("[Worker] Poll error:", error.message);
      return;
    }

    if (jobs && jobs.length > 0) {
      const job = jobs[0];

      const { error: markError } = await supabase.rpc("mark_job_processing", {
        p_job_id: job.id,
      });

      if (markError) {
        console.error(`[Worker] Failed to mark job ${job.id} as processing:`, markError.message);
        return;
      }

      await processJob(job);
    }
  } catch (err) {
    console.error("[Worker] Unexpected error:", err.message);
  } finally {
    running = false;
  }
}

function start() {
  log(`Worker started (polling every ${POLL_INTERVAL_MS / 1000}s)`);
  poll();
  setInterval(poll, POLL_INTERVAL_MS);
}

module.exports = { start };
