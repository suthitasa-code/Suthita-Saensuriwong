// --- src/api/document/document.validation.js ---
const { body, validationResult } = require("express-validator");

const documentValidation = [
  body("adminID")
    .notEmpty()
    .withMessage("กรุณาระบุ adminID ของผู้จัดการข้อมูล"),

  // ตรวจสอบประเภทเอกสารให้รองรับตามกลุ่มประเภทหลักของระบบ
  body("fileCategory")
    .notEmpty()
    .withMessage("กรุณาระบุหมวดหมู่ประเภทเอกสาร")
    .isIn(["COURSE", "TCAS", "MEDIA", "OTHER"])
    .withMessage("ประเภทหมวดหมู่เอกสารไม่ถูกต้องตามที่ระบบกำหนด"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 400, message: errors.array()[0].msg });
    }
    next();
  }
];

module.exports = documentValidation;