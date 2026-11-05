const jwt = require("jsonwebtoken");
const adminRepository = require("./admin.repository");
const { encryptPassword, decryptPassword } = require("../../config/utils/passwordCrypto");
const {
  validateAdmin,
  validateId
} = require("./admin.validation");

// เอาข้อมูล admin ที่ดึงจาก DB มาตัดฟิลด์ password ทิ้งก่อนส่งกลับไปหน้าบ้าน
// กันไม่ให้รหัสผ่านที่เข้ารหัสไว้หลุดออกไปโดยไม่จำเป็น (ต้องเรียกผ่านช่องทาง "ดูรหัสผ่าน" โดยเฉพาะเท่านั้นถึงจะเห็นได้)
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
    const error = new Error("อีเมลนี้ไม่มีสิทธิ์เข้าใช้งานระบบจัดการหลังบ้าน");
    error.statusCode = 404;
    throw error;
  }

  return omitPassword(admin);
}

// สร้าง Admin ใหม่
async function createAdmin(adminData) {
  const validData = validateAdmin(adminData, false); // false = โหมดสร้างใหม่

  // เข้ารหัสผ่านแบบถอดกลับได้ก่อนเก็บลง DB เสมอ (ไม่เก็บเป็นตัวหนังสือธรรมดา)
  validData.password = encryptPassword(validData.password);

  const newAdminId = await adminRepository.createAdmin(validData);
  return getAdminById(newAdminId);
}

// อัปเดตข้อมูล Admin
async function updateAdmin(id, adminData) {
  const adminId = validateId(id);
  const currentAdmin = await getAdminRecordById(adminId); // ใช้เวอร์ชันดิบ เพราะต้องได้ค่ารหัสผ่านที่เข้ารหัสไว้เดิมมาด้วย

  const validData = validateAdmin(adminData, true); // true = โหมดแก้ไขข้อมูล

  // รองรับการเปลี่ยนเฉพาะ status เช่น Super Admin กดคืนสิทธิ์
  validData.name = validData.name || currentAdmin.name;
  validData.lastname = validData.lastname || currentAdmin.lastname;
  validData.email = validData.email || currentAdmin.email;
  validData.role = validData.role || currentAdmin.role;
  if (adminData.status === undefined) {
    validData.status = currentAdmin.status;
  }

  if (validData.password) {
    // มีการตั้งรหัสผ่านใหม่เข้ามา -> เข้ารหัสใหม่ก่อนเก็บ
    validData.password = encryptPassword(validData.password);
  } else {
    // ไม่ได้ส่งรหัสผ่านใหม่มา -> ใช้ค่าที่เข้ารหัสไว้เดิมจาก DB ต่อไป ไม่แตะต้อง
    validData.password = currentAdmin.password;
  }

  await adminRepository.updateAdmin(adminId, validData);
  return getAdminById(adminId);
}

// ถอดรหัสผ่านตัวจริงออกมาให้ดู ใช้เฉพาะตอน Super Admin กดปุ่ม "ดูรหัสผ่าน" ในเมนูผู้ดูแลระบบเท่านั้น
// การเช็คสิทธิ์ว่าต้องเป็น Super Admin จริงๆ ถึงเรียกจุดนี้ได้ ทำอยู่ที่ requireSuperAdmin middleware ก่อนถึง service ชั้นนี้แล้ว
async function revealAdminPassword(id) {
  const admin = await getAdminRecordById(id);
  return decryptPassword(admin.password);
}

// เหมือน revealAdminPassword แต่ถอดรหัสให้ดูทีเดียวทั้งบัญชี ใช้กับปุ่ม "ดูรหัสผ่านทั้งหมด"
async function revealAllPasswords() {
  const admins = await adminRepository.getAllAdmins();
  return admins.map((admin) => ({
    adminID: admin.adminID,
    name: admin.name,
    lastname: admin.lastname,
    email: admin.email,
    role: admin.role,
    password: decryptPassword(admin.password)
  }));
}

// ตรวจสอบอีเมล+รหัสผ่านตอนล็อกอิน แล้วออกบัตรผ่าน (JWT token) ให้ถ้าถูกต้อง
// นี่คือจุดที่แทนที่ Firebase Auth เดิม เช็คเองทั้งหมดฝั่ง backend โดยไม่พึ่งบริการภายนอก
async function loginAdmin(email, password) {
  if (!email || !password) {
    const error = new Error("กรุณากรอกอีเมลและรหัสผ่าน");
    error.statusCode = 400;
    throw error;
  }

  const admin = await adminRepository.getAdminByEmail(String(email).trim(), true);

  // ข้อความ error ตั้งใจให้เหมือนกันทั้ง 2 กรณี (ไม่เจออีเมล / รหัสผ่านผิด)
  // กันไม่ให้คนร้ายเดาได้ว่าอีเมลนี้มีอยู่ในระบบจริงไหมจากข้อความ error
  const wrongCredentialError = new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  wrongCredentialError.statusCode = 401;

  if (!admin) {
    throw wrongCredentialError;
  }

  if (Number(admin.status) !== 1) {
    const suspendedError = new Error("เข้าสู่ระบบไม่สำเร็จ บัญชีของท่านถูกระงับการใช้งาน");
    suspendedError.statusCode = 403;
    throw suspendedError;
  }

  // ถอดรหัสผ่านที่เก็บไว้ออกมา แล้วเทียบกับรหัสผ่านที่พิมพ์เข้ามาตรงๆ
  const decryptedPassword = decryptPassword(admin.password);
  if (decryptedPassword !== password) {
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
  loginAdmin,
  revealAdminPassword,
  revealAllPasswords
};