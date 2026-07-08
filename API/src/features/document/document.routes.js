const express = require("express");
const router = express.Router();
const documentController = require("./document.controller");
const uploadDocument = require("./document.upload");
const documentValidation = require("./document.validation"); // ✨ ล็อกพิกัดตรงนี้ให้ชัวร์

// 📌 1. ดึงไฟล์เอกสารทั้งหมดในคลัง (GET: http://localhost:5000/api/document)
router.get("/", documentController.getDocuments);

// 📌 2. อัปโหลดไฟล์ใหม่เข้าคลัง (POST: http://localhost:5000/api/document)
router.post("/", uploadDocument.single("file"), documentValidation, documentController.createDocument);

// 📌 3. แก้ไขไฟล์เดิมในคลังระบุตาม ID (PUT: http://localhost:5000/api/document/:id)
router.put("/:id", uploadDocument.single("file"), documentController.updateDocument);

// 📌 4. ลบไฟล์ออกจากคลังระบุตาม ID (DELETE: http://localhost:5000/api/document/:id)
router.delete("/:id", documentController.deleteDocument);

module.exports = router;