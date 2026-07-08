// --- src/api/document/document.repository.js ---
const { pool } = require("../../config/db");

const documentRepository = {
  findAll: async () => {
    const [rows] = await pool.query("SELECT * FROM document ORDER BY uploadDate DESC");
    return rows;
  },

  findByID: async (id) => {
    const [rows] = await pool.query("SELECT * FROM document WHERE documentID = ?", [id]);
    return rows[0];
  },
  
  // เพิ่ม fileCategory และ originalFileName ตอนบันทึกไฟล์ใหม่
  create: async (data) => {
    const sql = `INSERT INTO document (fileName, originalFileName, fileType, fileSize, fileCategory, adminID) VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.query(sql, [
      data.fileName,
      data.originalFileName, // บันทึกชื่อไฟล์ภาษาไทยดั้งเดิม
      data.fileType,
      data.fileSize,
      data.fileCategory,
      data.adminID
    ]);
    return result;
  },

  // รองรับการส่งข้อมูลมาอัปเดตแก้ไข
  update: async (id, data) => {
    const keys = Object.keys(data);
    if (keys.length === 0) return null;

    const setClause = keys.map(key => `${key} = ?`).join(", ");
    const values = keys.map(key => data[key]);

    const sql = `UPDATE document SET ${setClause} WHERE documentID = ?`;
    values.push(id);

    const [result] = await pool.query(sql, values);
    return result;
  },

  delete: async (id) => {
    const sql = "DELETE FROM document WHERE documentID = ?";
    const [result] = await pool.query(sql, [id]);
    return result;
  }
};

module.exports = documentRepository;