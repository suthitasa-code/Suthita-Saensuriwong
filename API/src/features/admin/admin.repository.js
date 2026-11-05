const { pool } = require("../../config/db");

// ฟิลด์ที่ต้องการดึงจากตาราง admin
const adminSelectFields = `
  adminID,
  name,
  lastname,
  email,
  password,
  role,
  status,
  createdAt
`;

// ดึงข้อมูล Admin ทั้งหมด
async function getAllAdmins() {
  const sql = `
    SELECT ${adminSelectFields}
    FROM admin
    ORDER BY adminID DESC
  `;

  const [rows] = await pool.query(sql);
  return rows;
}

// ค้นหา Admin ด้วย ID
async function getAdminById(id) {
  const sql = `
    SELECT ${adminSelectFields}
    FROM admin
    WHERE adminID = ?
  `;

  const [rows] = await pool.query(sql, [id]);
  return rows[0] || null;
}

// ค้นหา Admin ด้วย Email สำหรับเช็กสิทธิ์ระบบหลังบ้าน
// login ต้องค้นหาบัญชีที่ถูกระงับได้ด้วย เพื่อส่งข้อความแจ้งเตือนที่ถูกต้อง
async function getAdminByEmail(email, includeSuspended = false) {
  const statusCondition = includeSuspended ? "" : "AND status = 1";
  const sql = `
    SELECT ${adminSelectFields}
    FROM admin
    WHERE email = ? ${statusCondition}
    LIMIT 1
  `;

  const [rows] = await pool.query(sql, [email]);
  return rows[0] || null;
}

// เพิ่มข้อมูล Admin ใหม่
async function createAdmin(admin) {
  const sql = `
    INSERT INTO admin
      (name, lastname, email, password, role, status)
    VALUES
      (?, ?, ?, ?, ?, ?)
  `;

  const values = [
    admin.name,
    admin.lastname,
    admin.email,
    admin.password,
    admin.role || 'Admin', 
    admin.status !== undefined ? admin.status : 1
  ];

  const [result] = await pool.query(sql, values);
  return result.insertId;
}

// อัปเดตข้อมูล Admin
async function updateAdmin(id, admin) {
  const sql = `
    UPDATE admin
    SET
      name = ?,
      lastname = ?,
      email = ?,
      password = ?,
      role = ?,
      status = ?
    WHERE adminID = ?
  `;

  const values = [
    admin.name,
    admin.lastname,
    admin.email,
    admin.password,
    admin.role,
    admin.status,
    id
  ];

  const [result] = await pool.query(sql, values);
  return result.affectedRows;
}

// ลบบัญชีแอดมินออกจากฐานข้อมูลถาวร
// หมายเหตุ: ตาราง announcement / curriculum / carouselbanner / document ทุกตัว
// มี Foreign Key ชี้มาที่ adminID นี้แบบ RESTRICT ถ้าแอดมินคนนี้เคยสร้างข้อมูลไว้
// MySQL จะไม่ยอมให้ลบ (โยน error ER_ROW_IS_REFERENCED_2) ต้องไประงับสิทธิ์แทน
// ดูการดักจับ error นี้ให้ขึ้นข้อความสวยๆ ได้ที่ middlewares/errorHandler.js
async function deleteAdmin(id) {
  const sql = "DELETE FROM admin WHERE adminID = ?";
  const [result] = await pool.query(sql, [id]);
  return result.affectedRows;
}

module.exports = {
  getAllAdmins,
  getAdminById,
  getAdminByEmail,
  createAdmin,
  updateAdmin,
  deleteAdmin
};