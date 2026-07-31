const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const adminRepository = require("./admin.repository");
const {
  validateAdmin,
  validateId
} = require("./admin.validation");

// จำนวนรอบที่ใช้สับข้อมูลรหัสผ่าน ยิ่งเยอะยิ่งปลอดภัยแต่ยิ่งช้า 10 คือค่ามาตรฐานที่นิยมใช้กัน
const SALT_ROUNDS = 10;

// เอาข้อมูล admin ที่ดึงจาก DB มาตัดฟิลด์ password ทิ้งก่อนส่งกลับไปหน้าบ้าน
// กันไม่ให้ hash รหัสผ่านหลุดออกไปโดยไม่จำเป็น (แม้จะถอดกลับเป็นรหัสจริงไม่ได้ก็ตาม)
function omitPassword(admin) {
  const { password, ...rest } = admin;
  return rest;
}

// ดึงข้อมูล Admin ทั้งหมด (ตัด password หลุดออกก่อนส่งให้หน้าบ้านเสมอ)
async function getAllAdmins() {
  const admins = await adminRepository.getAllAdmins();
  return admins.map(omitPassword);
}

// ค้นหา Admin ด้วย ID แบบสาธารณะ (ไม่มี password ติดไปด้วย) ใช้ตอบกลับ controller
async function getAdminById(id) {
  const admin = await getAdminRecordById(id);
  return omitPassword(admin);
}

// เวอร์ชันภายใน ดึงข้อมูลดิบพร้อม password hash เอาไว้ใช้เทียบ/ต่อยอด logic เท่านั้น
// ห้ามส่งค่าที่ได้จากฟังก์ชันนี้กลับออกไปให้หน้าบ้านตรง ๆ เด็ดขาด
async function getAdminRecordById(id) {
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

  return omitPassword(admin);
}

// สร้าง Admin ใหม่
async function createAdmin(adminData) {
  const validData = validateAdmin(adminData, false); // false = โหมดสร้างใหม่

  // ห้ามเก็บรหัสผ่านตัวจริงลง DB เด็ดขาด สับ (hash) ให้เป็นรหัสที่ถอดกลับไม่ได้ก่อนเสมอ
  validData.password = await bcrypt.hash(validData.password, SALT_ROUNDS);

  const newAdminId = await adminRepository.createAdmin(validData);
  return getAdminById(newAdminId);
}

// อัปเดตข้อมูล Admin
async function updateAdmin(id, adminData) {
  const adminId = validateId(id);
  const currentAdmin = await getAdminRecordById(adminId); // ใช้เวอร์ชันดิบ เพราะต้องได้ password hash เดิมมาด้วย

  const validData = validateAdmin(adminData, true); // true = โหมดแก้ไขข้อมูล

  if (validData.password) {
    // มีการตั้งรหัสผ่านใหม่เข้ามา -> สับรหัสใหม่ก่อนเก็บ
    validData.password = await bcrypt.hash(validData.password, SALT_ROUNDS);
  } else {
    // ไม่ได้ส่งรหัสผ่านใหม่มา -> ใช้ hash เดิมจาก DB ต่อไป ไม่แตะต้อง
    validData.password = currentAdmin.password;
  }

  await adminRepository.updateAdmin(adminId, validData);
  return getAdminById(adminId);
}

// ตรวจสอบอีเมล+รหัสผ่านตอนล็อกอิน แล้วออกบัตรผ่าน (JWT token) ให้ถ้าถูกต้อง
// นี่คือจุดที่แทนที่ Firebase Auth เดิม เช็คเองทั้งหมดฝั่ง backend โดยไม่พึ่งบริการภายนอก
async function loginAdmin(email, password) {
  if (!email || !password) {
    const error = new Error("กรุณากรอกอีเมลและรหัสผ่าน");
    error.statusCode = 400;
    throw error;
  }

  const admin = await adminRepository.getAdminByEmail(String(email).trim());

  // ข้อความ error ตั้งใจให้เหมือนกันทั้ง 2 กรณี (ไม่เจออีเมล / รหัสผ่านผิด)
  // กันไม่ให้คนร้ายเดาได้ว่าอีเมลนี้มีอยู่ในระบบจริงไหมจากข้อความ error
  const wrongCredentialError = new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  wrongCredentialError.statusCode = 401;

  if (!admin) {
    throw wrongCredentialError;
  }

  // bcrypt.compare เอารหัสผ่านที่พิมพ์เข้ามาไป hash ด้วยวิธีเดียวกัน แล้วเทียบกับ hash ที่เก็บไว้
  // (ไม่มีการถอด hash กลับเป็นรหัสผ่านจริงเด็ดขาด เทียบได้ทางเดียว)
  const isPasswordMatch = await bcrypt.compare(password, admin.password);
  if (!isPasswordMatch) {
    throw wrongCredentialError;
  }

  // ออกบัตรผ่าน (JWT) แปะข้อมูลตัวตน+สิทธิ์ไปด้วย เอาไว้ให้ middleware ตรวจสอบทีหลังตอนยิง API อื่น ๆ
  const token = jwt.sign(
    { adminID: admin.adminID, email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  return { token, admin: omitPassword(admin) };
}

// ลบบัญชีแอดมินออกจากระบบถาวร (แยกจากการ "ระงับสิทธิ์" ซึ่งใช้ updateAdmin ตั้ง status = 0 แทน)
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
  deleteAdmin,
  loginAdmin
};