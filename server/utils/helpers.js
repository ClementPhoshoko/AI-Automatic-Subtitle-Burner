const ALLOWED_MIMES = {
  "video/mp4": ".mp4",
  "video/quicktime": ".mov",
  "video/x-msvideo": ".avi",
  "video/x-matroska": ".mkv",
};

const ALLOWED_EXTENSIONS = [".mp4", ".mov", ".avi", ".mkv"];

const SUBTITLE_STYLES = ["classic", "tiktok", "minimal", "cinema", "apple", "netflix", "youtube"];

function isValidVideo(mimetype, originalname) {
  const ext = "." + originalname.split(".").pop().toLowerCase();
  return ALLOWED_MIMES[mimetype] === ext || ALLOWED_EXTENSIONS.includes(ext);
}

function sanitizeFilename(name) {
  const ext = name.split(".").pop().toLowerCase();
  const base = name.slice(0, -(ext.length + 1)).replace(/[^a-zA-Z0-9_-]/g, "_");
  return `${base}_${Date.now()}.${ext}`;
}

module.exports = {
  ALLOWED_MIMES,
  ALLOWED_EXTENSIONS,
  SUBTITLE_STYLES,
  isValidVideo,
  sanitizeFilename,
};
