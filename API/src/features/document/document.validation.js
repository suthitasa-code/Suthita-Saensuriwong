// --- src/api/document/document.validation.js ---
const { body, validationResult } = require("express-validator");

const documentValidation = [
  body("adminID")
    .notEmpty()
    .withMessage("กรุณาระบุ adminID คนที่จัดการข้อมูลด้วยนะจ๊ะลูกวิป!"),
    
  // ตรวจสอบประเภทเอกสารให้รองรับตามกลุ่มประเภทหลักของระบบ
  body("fileCategory")
    .notEmpty()
    .withMessage("กรุณาระบุหมวดหมู่ประเภทเอกสารด้วยนะคะ!")
    .isIn(["COURSE", "TCAS", "MEDIA", "OTHER"])
    .withMessage("ประเภทหมวดหมู่เอกสารไม่ถูกต้องตามระบบกำหนดค่ะ!"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 400, message: errors.array()[0].msg });
    }
    next();
  }
];

module.exports = documentValidation;