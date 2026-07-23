const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");

const FFMPEG = process.env.FFMPEG_PATH || "ffmpeg";

function generateThumbnail(videoPath, outputDir) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(outputDir, "thumbnail.jpg");

    const args = [
      "-i", videoPath,
      "-vf", "select=eq(n\\,0)",
      "-vframes", "1",
      "-q:v", "2",
      "-y",
      outputPath,
    ];

    const child = execFile(FFMPEG, args, { maxBuffer: 1024 * 1024 * 50 }, (err) => {
      if (err) {
        reject(new Error(`FFmpeg thumbnail failed: ${err.message}`));
        return;
      }
      if (!fs.existsSync(outputPath)) {
        reject(new Error("Thumbnail generation produced no output file"));
        return;
      }
      resolve(outputPath);
    });

    child.stderr.on("data", (data) => {
      if (process.env.NODE_ENV === "development") {
        process.stderr.write(data);
      }
    });
  });
}

module.exports = { generateThumbnail };
