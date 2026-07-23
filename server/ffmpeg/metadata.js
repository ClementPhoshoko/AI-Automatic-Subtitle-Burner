const { execFile } = require("child_process");
const path = require("path");

const FFPROBE = process.env.FFPROBE_PATH || "ffprobe";

function getVideoMetadata(filePath) {
  return new Promise((resolve, reject) => {
    const args = [
      "-v", "quiet",
      "-print_format", "json",
      "-show_format",
      "-show_streams",
      filePath,
    ];

    execFile(FFPROBE, args, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout) => {
      if (err) {
        reject(new Error(`FFprobe metadata failed: ${err.message}`));
        return;
      }

      try {
        const data = JSON.parse(stdout);

        const videoStream = (data.streams || []).find((s) => s.codec_type === "video");
        const format = data.format || {};

        const width = videoStream ? videoStream.width : null;
        const height = videoStream ? videoStream.height : null;
        const duration = parseFloat(format.duration) || 0;
        const fileSize = parseInt(format.size, 10) || 0;

        resolve({
          duration: Math.round(duration * 100) / 100,
          resolution: width && height ? `${width}x${height}` : null,
          fileSize,
        });
      } catch (parseErr) {
        reject(new Error(`Failed to parse ffprobe output: ${parseErr.message}`));
      }
    });
  });
}

module.exports = { getVideoMetadata };
