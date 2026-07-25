const supabase = require("../services/supabase");
const logger = require("../utils/logger");

const CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
const JOB_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
const BATCH_SIZE = 50;

let timer = null;

async function cleanupOnce() {
  const cutoff = new Date(Date.now() - JOB_TTL_MS).toISOString();

  const { data: expired, error: fetchError } = await supabase
    .from("jobs")
    .select("id, original_video_url, output_video_url, thumbnail_url")
    .lt("created_at", cutoff)
    .limit(BATCH_SIZE);

  if (fetchError) {
    logger.error("Cleanup: failed to fetch expired jobs", { error: fetchError.message });
    return;
  }

  if (!expired || expired.length === 0) return;

  logger.info("Cleanup: found expired jobs", { count: expired.length });

  let deleted = 0;

  for (const job of expired) {
    const filesToRemove = [];

    if (job.original_video_url) {
      const name = job.original_video_url.split("/").pop();
      if (name) filesToRemove.push({ bucket: "uploads", name });
    }

    if (job.output_video_url) {
      const name = job.output_video_url.split("/").pop();
      if (name) filesToRemove.push({ bucket: "processed", name });
    }

    if (job.thumbnail_url) {
      const name = job.thumbnail_url.split("/").pop();
      if (name) filesToRemove.push({ bucket: "thumbnails", name });
    }

    for (const file of filesToRemove) {
      await supabase.storage.from(file.bucket).remove([file.name]);
    }

    const { error: deleteError } = await supabase
      .from("jobs")
      .delete()
      .eq("id", job.id);

    if (deleteError) {
      logger.error("Cleanup: failed to delete job", { id: job.id, error: deleteError.message });
    } else {
      deleted++;
    }
  }

  logger.info("Cleanup: done", { deleted, total: expired.length });
}

function start() {
  logger.info("Cleanup worker started", { interval: CLEANUP_INTERVAL_MS / 1000, ttl: JOB_TTL_MS / 1000 / 60 });
  cleanupOnce();
  timer = setInterval(cleanupOnce, CLEANUP_INTERVAL_MS);
}

function stop() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

module.exports = { start, stop };
