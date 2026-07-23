const fs = require("fs");
const path = require("path");
const os = require("os");
const supabase = require("../services/supabase");
const logger = require("../utils/logger");
const { transcriptToSrt } = require("../services/srt");

async function downloadSubtitles(req, res) {
  try {
    const { id } = req.params;

    const { data: job, error } = await supabase
      .from("jobs")
      .select("id, transcript_json, original_filename")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Job not found" });
      }
      logger.error("Download subtitles error:", error);
      return res.status(500).json({ error: "Failed to fetch subtitles" });
    }

    if (!job.transcript_json || job.transcript_json.length === 0) {
      return res.status(404).json({ error: "No subtitles available for this job" });
    }

    const srtContent = transcriptToSrt(job.transcript_json);

    const baseName = job.original_filename
      ? path.parse(job.original_filename).name
      : job.id;
    const safeName = baseName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const fileName = `${safeName}.srt`;

    res.setHeader("Content-Type", "application/x-subrip");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(srtContent);
  } catch (err) {
    logger.error("Download subtitles error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}

module.exports = { downloadSubtitles };
