const express = require("express");
const adminController = require("./admin.controller");
const { verifyToken } = require("../../middlewares/auth");

const router = express.Router();

// 2 เส้นทางนี้ต้องเปิดสาธารณะ (ไม่มี token) เพราะเป็นจุดเริ่มต้นก่อนจะมี token ให้ใช้
router.post("/login", adminController.login);
router.post("/check-profile", adminController.checkAdminProfile);

// ตั้งแต่บรรทัดนี้ลงไป ต้องแนบ token ที่ได้จาก /login มาด้วยเสมอ ไม่งั้นโดนเตะออกด้วย 401
router.get("/", verifyToken, adminController.getAllAdmins);
router.get("/:id", verifyToken, adminController.getAdminById);
router.post("/", verifyToken, adminController.createAdmin);
router.put("/:id", verifyToken, adminController.updateAdmin);
router.delete("/:id", verifyToken, adminController.deleteAdmin);

module.exports = router;