const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } = require("./carouselbanner.validation");

const uploadDir = path.resolve(process.cwd(), "uploads", "admin-images");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, file.originalname) // ชื่อตรงต้นฉบับจ้ะ
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"), false);
    }
    cb(null, true);
  }
});

module.exports = upload;