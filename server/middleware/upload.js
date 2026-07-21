const multer = require("multer");
const path = require("path");
const os = require("os");
const { isValidVideo } = require("../utils/helpers");

const maxFileSize = (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 500) * 1024 * 1024;

const storage = multer.diskStorage({
  destination: path.join(os.tmpdir(), "subtitle-burner"),
  filename(req, file, cb) {
    const name = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}_${name}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (isValidVideo(file.mimetype, file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: MP4, MOV, AVI, MKV`));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: maxFileSize },
  fileFilter,
});

module.exports = upload;
