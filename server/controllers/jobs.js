const fs = require("fs");
const path = require("path");
const supabase = require("../services/supabase");
const logger = require("../utils/logger");
const { sanitizeFilename, SUBTITLE_STYLES } = require("../utils/helpers");

const BUCKET_UPLOADS = "uploads";

async function uploadVideo(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No video file provided" });
    }

    const style = req.body.subtitle_style || "classic";
    if (!SUBTITLE_STYLES.includes(style)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: `Invalid subtitle style. Must be one of: ${SUBTITLE_STYLES.join(", ")}` });
    }

    const remoteName = sanitizeFilename(req.file.originalname);
    const fileBuffer = fs.readFileSync(req.file.path);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_UPLOADS)
      .upload(remoteName, fileBuffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    fs.unlinkSync(req.file.path);

    if (uploadError) {
      logger.error("Supabase upload error:", uploadError);
      return res.status(500).json({ error: "Failed to upload video to storage" });
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_UPLOADS)
      .getPublicUrl(remoteName);

    const original_video_url = publicUrlData.publicUrl;

    const { data: job, error: dbError } = await supabase
      .rpc("create_job", {
        p_original_video_url: original_video_url,
        p_subtitle_style: style,
      });

    if (dbError) {
      logger.error("DB create_job error:", dbError);
      await supabase.storage.from(BUCKET_UPLOADS).remove([remoteName]);
      return res.status(500).json({ error: "Failed to create job" });
    }

    const jobRow = Array.isArray(job) ? job[0] : job;

    res.status(201).json(jobRow);
  } catch (err) {
    logger.error("Upload error:", err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}

async function listJobs(req, res) {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from("jobs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error("List jobs error:", error);
      return res.status(500).json({ error: "Failed to fetch jobs" });
    }

    res.json({ jobs: data, total: count, limit: Number(limit), offset: Number(offset) });
  } catch (err) {
    logger.error("List jobs error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}

async function getJob(req, res) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Job not found" });
      }
      logger.error("Get job error:", error);
      return res.status(500).json({ error: "Failed to fetch job" });
    }

    res.json(data);
  } catch (err) {
    logger.error("Get job error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}

async function processJob(req, res) {
  try {
    const { id } = req.params;

    const { data: job, error: fetchError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.status !== "queued") {
      return res.status(400).json({ error: `Cannot process job with status: ${job.status}` });
    }

    const { error: updateError } = await supabase.rpc("mark_job_processing", { p_job_id: id });

    if (updateError) {
      logger.error("Process job error:", updateError);
      return res.status(500).json({ error: "Failed to start processing" });
    }

    res.json({ message: "Processing started", job_id: id });
  } catch (err) {
    logger.error("Process job error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}

async function deleteJob(req, res) {
  try {
    const { id } = req.params;

    const { data: job, error: fetchError } = await supabase
      .from("jobs")
      .select("id, original_video_url, output_video_url")
      .eq("id", id)
      .single();

    if (fetchError || !job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const filesToRemove = [];

    if (job.original_video_url) {
      const originalName = job.original_video_url.split("/").pop();
      if (originalName) filesToRemove.push({ bucket: BUCKET_UPLOADS, name: originalName });
    }

    if (job.output_video_url) {
      const outputName = job.output_video_url.split("/").pop();
      if (outputName) filesToRemove.push({ bucket: "processed", name: outputName });
    }

    for (const file of filesToRemove) {
      await supabase.storage.from(file.bucket).remove([file.name]);
    }

    const { error: deleteError } = await supabase
      .from("jobs")
      .delete()
      .eq("id", id);

    if (deleteError) {
      logger.error("Delete job error:", deleteError);
      return res.status(500).json({ error: "Failed to delete job" });
    }

    res.json({ message: "Job deleted", id });
  } catch (err) {
    logger.error("Delete job error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}

module.exports = { uploadVideo, listJobs, getJob, processJob, deleteJob };
