// --- src/api/document/document.upload.js ---
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ตั้งค่าที่เก็บไฟล์เอกสาร (ปรับให้สร้างโฟลเดอร์อัติโนมัติถ้าหาไม่เจอ)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ล็อกพิกัดให้ดิ่งตรงไปที่โฟลเดอร์ uploads/documents จากใจกลางโปรเจกต์
    const dir = path.join(process.cwd(), "uploads", "documents");
    
    // ถ้าคอมพิวเตอร์เดินไปแล้วไม่มีโฟลเดอร์นี้ ให้มันสร้างให้
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    
    // เปลี่ยนชื่อไฟล์เป็นรูปแบบปลอดภัย ป้องกันอักขระพิเศษภาษาไทยพังระบบ path และ Preview ได้เสถียร
    cb(null, `doc-${uniqueSuffix}${ext}`);
  }
});

// ตรวจสอบชนิดไฟล์ (รองรับ PDF, JPG, PNG)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("ระบบรองรับเฉพาะไฟล์นามสกุล .pdf, .jpg, .jpeg และ .png เท่านั้น"), false);
  }
};

const uploadDocument = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // ลิมิตขนาดไฟล์สูงสุด 100MB
});

module.exports = uploadDocument;