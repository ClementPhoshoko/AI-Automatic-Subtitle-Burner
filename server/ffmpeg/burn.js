const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");

const FFMPEG = process.env.FFMPEG_PATH || "ffmpeg";

function burnSubtitles(videoPath, assPath, outputDir) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(outputDir, "output.mp4");
    const assName = path.basename(assPath); // subtitles.ass

    // Use cwd=outputDir so we can reference the ASS file by relative name,
    // avoiding Windows colon-path issues in filter syntax.
    const args = [
      "-i", videoPath,
      "-c:v", "libx264",
      "-preset", "fast",
      "-crf", "23",
      "-c:a", "aac",
      "-b:a", "128k",
      "-vf", `subtitles=${assName}`,
      "-y",
      "output.mp4", // relative — written to cwd
    ];

    const child = execFile(FFMPEG, args, {
      cwd: outputDir,
      maxBuffer: 1024 * 1024 * 200,
    }, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(`FFmpeg burn failed: ${err.message}`));
        return;
      }
      if (!fs.existsSync(outputPath)) {
        reject(new Error("Burning produced no output file"));
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

module.exports = { burnSubtitles };
