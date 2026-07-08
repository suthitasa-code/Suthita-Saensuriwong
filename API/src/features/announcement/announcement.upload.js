const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../../uploads/announcements');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// ✅ แก้ fileFilter ใหม่ ไม่ใช้ regex .test() ซ้ำ
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|pdf/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

  const allowedMimetypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  const mimetype = allowedMimetypes.includes(file.mimetype);

  if (mimetype && extname) return cb(null, true);
  cb(new Error('รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG) และไฟล์เอกสาร (PDF) เท่านั้นน้า!'));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: fileFilter
});

const announcementUpload = upload.fields([
  { name: 'posterImg', maxCount: 2 },
  { name: 'scheduleImg', maxCount: 2 },
  { name: 'majorTableImg', maxCount: 2 },
  { name: 'manualPdf', maxCount: 1 },
  { name: 'announcementPdf', maxCount: 1 }
]);

module.exports = announcementUpload;