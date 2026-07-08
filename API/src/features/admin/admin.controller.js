const adminService = require("./admin.service"); 
const { success } = require("../../config/utils/response");

async function getAllAdmins(req, res, next) {
  try {
    const admins = await adminService.getAllAdmins(); 
    return success(res, "Admins fetched successfully", admins);
  } catch (error) {
    return next(error);
  }
}

async function getAdminById(req, res, next) {
  try {
    const admin = await adminService.getAdminById(req.params.id);
    return success(res, "Admin fetched successfully", admin);
  } catch (error) {
    return next(error);
  }
}

async function createAdmin(req, res, next) {
  try {
    const admin = await adminService.createAdmin(req.body);
    return success(res, "Admin created successfully", admin, 201);
  } catch (error) {
    return next(error);
  }
}

async function updateAdmin(req, res, next) {
  try {
    const admin = await adminService.updateAdmin(req.params.id, req.body);
    return success(res, "Admin updated successfully", admin);
  } catch (error) {
    return next(error);
  }
}

async function deleteAdmin(req, res, next) {
  try {
    await adminService.deleteAdmin(req.params.id);
    return success(res, "Admin suspended successfully");
  } catch (error) {
    return next(error);
  }
}

async function checkAdminProfile(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      const error = new Error("Email is required");
      error.statusCode = 400;
      throw error;
    }
    const admin = await adminService.getAdminByEmail(email);
    return success(res, "Admin profile checked successfully", admin);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  checkAdminProfile
};