const express = require('express');
const router = express.Router();
const announcementController = require('./announcement.controller');
const announcementUpload = require('./announcement.upload'); 
const announcementValidation = require('./announcement.validation');

// ✅ Wrapper ครอบ multer เพื่อดัก error ไม่ให้ server ค้าง
const uploadMiddleware = (req, res, next) => {
  announcementUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: "อัปโหลดไฟล์ผิดพลาด: " + err.message });
    }
    next();
  });
};

router.post('/', uploadMiddleware, announcementValidation, announcementController.create);
router.get('/', announcementController.getAll);
router.get('/:id', announcementController.getById);
router.put('/:id', uploadMiddleware, announcementValidation, announcementController.update);
router.delete('/:id', announcementController.delete);

module.exports = router;