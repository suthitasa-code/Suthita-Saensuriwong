const express = require("express");
const lookupController = require("./lookup.controller");
const { verifyToken, requireSuperAdmin } = require("../../middlewares/auth");

const router = express.Router();

// ใครก็อ่านได้ (ใช้เติม dropdown ในฟอร์มจัดการประกาศ/หลักสูตร) ไม่ต้องล็อกอินก็เรียกได้
router.get("/:category", lookupController.getByCategory);

// แก้ไข/เพิ่มตัวเลือกได้เฉพาะ Super Admin เท่านั้น (ล็อกอินอยู่ + สิทธิ์ Super Admin)
router.post("/", verifyToken, requireSuperAdmin, lookupController.createOption);
router.put("/:id", verifyToken, requireSuperAdmin, lookupController.updateOption);

module.exports = router;
