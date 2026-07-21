const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");

const FFMPEG = process.env.FFMPEG_PATH || "ffmpeg";

function extractAudio(inputPath, outputDir) {
  return new Promise((resolve, reject) => {
    const ext = path.extname(inputPath).toLowerCase();
    const base = path.basename(inputPath, ext);
    const outputPath = path.join(outputDir, `${base}_audio.mp3`);

    const args = [
      "-i", inputPath,
      "-vn",
      "-acodec", "libmp3lame",
      "-ac", "1",
      "-ar", "16000",
      "-q:a", "2",
      "-y",
      outputPath,
    ];

    const child = execFile(FFMPEG, args, { maxBuffer: 1024 * 1024 * 200 }, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(`FFmpeg audio extraction failed: ${err.message}`));
        return;
      }
      if (!fs.existsSync(outputPath)) {
        reject(new Error("Audio extraction produced no output file"));
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

module.exports = { extractAudio };
