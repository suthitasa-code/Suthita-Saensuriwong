const express = require("express");
const adminController = require("./admin.controller");
const { verifyToken, requireSuperAdmin } = require("../../middlewares/auth");

const router = express.Router();

// 2 เส้นทางนี้ต้องเปิดสาธารณะ (ไม่มี token) เพราะเป็นจุดเริ่มต้นก่อนจะมี token ให้ใช้
router.post("/login", adminController.login);
router.post("/check-profile", adminController.checkAdminProfile);

// ต้องอยู่เหนือ "/:id" เสมอ ไม่งั้น Express จะเข้าใจผิดว่า "passwords" คือค่า :id
// ดูรหัสผ่านจริงของทุกบัญชีพร้อมกัน -> Super Admin เท่านั้น
router.get("/passwords", verifyToken, requireSuperAdmin, adminController.revealAllPasswords);

// ตั้งแต่บรรทัดนี้ลงไป ต้องแนบ token ที่ได้จาก /login มาด้วยเสมอ ไม่งั้นโดนเตะออกด้วย 401
router.get("/", verifyToken, adminController.getAllAdmins);
router.get("/:id", verifyToken, adminController.getAdminById);
router.post("/", verifyToken, adminController.createAdmin);
router.put("/:id", verifyToken, adminController.updateAdmin);
router.delete("/:id", verifyToken, adminController.deleteAdmin);

// ดูรหัสผ่านจริงของแอดมินคนไหนก็ได้ -> ต้องล็อกอินอยู่ (verifyToken) และต้องเป็น Super Admin เท่านั้น (requireSuperAdmin)
router.get("/:id/password", verifyToken, requireSuperAdmin, adminController.revealPassword);

module.exports = router;