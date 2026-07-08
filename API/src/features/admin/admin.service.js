const adminRepository = require("./admin.repository"); 
const {
  validateAdmin, 
  validateId
} = require("./admin.validation");

// ดึงข้อมูล Admin ทั้งหมด
async function getAllAdmins() {
  return adminRepository.getAllAdmins();
}

// ค้นหา Admin ด้วย ID
async function getAdminById(id) {
  const adminId = validateId(id);
  const admin = await adminRepository.getAdminById(adminId);

  if (!admin) {
    const error = new Error("Admin not found");
    error.statusCode = 404;
    throw error;
  }

  return admin;
}

// ค้นหา Admin ด้วย Email
async function getAdminByEmail(email) {
  if (!email || !email.includes("@")) {
    const error = new Error("Invalid email format");
    error.statusCode = 400;
    throw error;
  }

  const admin = await adminRepository.getAdminByEmail(email.trim());

  if (!admin) {
    const error = new Error("อีเมลนี้ไม่มีสิทธิ์เข้าใช้งานระบบจัดการหลังบ้านค่ะ");
    error.statusCode = 404;
    throw error;
  }

  return admin;
}

// สร้าง Admin ใหม่
async function createAdmin(adminData) {
  const validData = validateAdmin(adminData, false); // false = โหมดสร้างใหม่
  const newAdminId = await adminRepository.createAdmin(validData);
  return getAdminById(newAdminId);
}

// อัปเดตข้อมูล Admin
async function updateAdmin(id, adminData) {
  const adminId = validateId(id);
  const currentAdmin = await getAdminById(adminId); 

  const validData = validateAdmin(adminData, true); // true = โหมดแก้ไขข้อมูล
  
  // หากหน้าบ้านไม่มีการส่งรหัสผ่านชุดใหม่เข้ามา ให้ใช้รหัสผ่านดั้งเดิมในฐานข้อมูล
  if (!validData.password) {
    validData.password = currentAdmin.password;
  }

  await adminRepository.updateAdmin(adminId, validData);
  return getAdminById(adminId);
}

// ระงับสิทธิ์การใช้งานแอดมิน
async function deleteAdmin(id) {
  const adminId = validateId(id);
  await getAdminById(adminId); 
  return adminRepository.deleteAdmin(adminId);
}

module.exports = {
  getAllAdmins,
  getAdminById,
  getAdminByEmail,
  createAdmin,
  updateAdmin,
  deleteAdmin
};