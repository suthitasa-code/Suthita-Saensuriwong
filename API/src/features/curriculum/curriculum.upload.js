const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = "uploads/curriculum/";
    if (file.mimetype === "application/pdf") {
      dest = "uploads/curriculum/documents/";
    } else if (file.mimetype.startsWith("image/")) {
      dest = "uploads/curriculum/images/";
    }
    
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf" || file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("รองรับเฉพาะไฟล์ PDF และรูปภาพเท่านั้น"), false);
  }
};

const uploadCurriculum = multer({ storage: storage, fileFilter: fileFilter });
module.exports = uploadCurriculum;