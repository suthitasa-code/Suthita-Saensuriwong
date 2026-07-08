const express = require("express");
const adminController = require("./admin.controller");

const router = express.Router();

router.post("/check-profile", adminController.checkAdminProfile);
router.get("/", adminController.getAllAdmins);
router.get("/:id", adminController.getAdminById);
router.post("/", adminController.createAdmin);
router.put("/:id", adminController.updateAdmin);
router.delete("/:id", adminController.deleteAdmin);

module.exports = router;