const express = require("express");
const router = express.Router();
const carouselbannerController = require("./carouselbanner.controller");
const upload = require("./carouselbanner.upload");

router.get("/", carouselbannerController.getBanners);
router.post("/", upload.single("imageFile"), carouselbannerController.createBanner);
router.put("/:id", upload.single("imageFile"), carouselbannerController.updateBanner);
router.delete("/:id", carouselbannerController.deleteBanner);

module.exports = router;