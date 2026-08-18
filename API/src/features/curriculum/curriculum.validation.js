const { body, validationResult } = require("express-validator");

const curriculumValidation = [
  // 1. ด่านตรวจรหัสหลักสูตร (ต้องไม่เกิน 3 ตัวอักษร และเป็นภาษาอังกฤษเท่านั้น เช่น CE, CS)
  body("curriculumID")
    .optional({ checkFalsy: true })
    .isLength({ max: 3 }).withMessage("รหัสหลักสูตรต้องยาวไม่เกิน 3 ตัวอักษร")
    .matches(/^[A-Za-z]*$/).withMessage("รหัสหลักสูตรต้องเป็นตัวอักษรภาษาอังกฤษเท่านั้น"),
    
  // 2. ด่านตรวจชื่อหลักสูตร (ห้ามปล่อยว่าง)
  body("curriculumName")
    .notEmpty().withMessage("กรุณากรอกชื่อหลักสูตรภาษาไทย"),

  // 3. ด่านตรวจ ID แอดมินผู้ลงข้อมูล (ห้ามปล่อยว่าง)
  body("adminID")
    .notEmpty().withMessage("กรุณาระบุ adminID คนที่จัดการข้อมูล"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next(); 
  }
];

module.exports = curriculumValidation;