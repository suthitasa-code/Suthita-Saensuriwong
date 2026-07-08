const express = require("express");
const router = express.Router();
const curriculumController = require("./curriculum.controller");
const uploadCurriculum = require("./curriculum.upload");

// รับรูปภาพเดี่ยว (Images, shopPhoto) และ PDF ได้สูงสุด 5 ไฟล์พร้อมกันในฟิลด์ pdfFiles
const cpUpload = uploadCurriculum.fields([
  { name: "Images", maxCount: 1 },
  { name: "shopPhoto", maxCount: 1 },
  { name: "pdfFiles", maxCount: 5 }
]);

router.get("/", curriculumController.getCurriculums);
router.post("/", cpUpload, curriculumController.createCurriculum);
router.put("/:id", cpUpload, curriculumController.updateCurriculum);
router.delete("/:id", curriculumController.deleteCurriculum);

module.exports = router;