const express = require("express");
const router = express.Router();
const curriculumController = require("./curriculum.controller");
const uploadCurriculum = require("./curriculum.upload");
const { verifyToken } = require("../../middlewares/auth");

// รับรูปภาพเดี่ยว (Images, shopPhoto) และ PDF ได้สูงสุด 5 ไฟล์พร้อมกันในฟิลด์ pdfFiles
const cpUpload = uploadCurriculum.fields([
  { name: "Images", maxCount: 1 },
  { name: "shopPhoto", maxCount: 1 },
  { name: "pdfFiles", maxCount: 5 }
]);

router.get("/", curriculumController.getCurriculums);
router.get("/:id", curriculumController.getCurriculumById);
router.post("/", verifyToken, cpUpload, curriculumController.createCurriculum);
router.put("/:id", verifyToken, cpUpload, curriculumController.updateCurriculum);
router.delete("/:id", verifyToken, curriculumController.deleteCurriculum);

module.exports = router;