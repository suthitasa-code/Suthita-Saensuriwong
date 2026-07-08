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
async function getAdminByEmail(email) {
  const sql = `
    SELECT ${adminSelectFields}
    FROM admin
    WHERE email = ? AND status = 1
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

// ระงับสิทธิ์บัญชีผู้ใช้ (Soft Delete แทนการลบจริงเพื่อป้องกัน Foreign Key Error)
async function deleteAdmin(id) {
  const sql = "UPDATE admin SET status = 0 WHERE adminID = ?";
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