const { pool } = require("../../config/db");

const CATEGORIES = ["tcas_round", "degree_level", "curriculum_type"];

// ดึงตัวเลือกทั้งหมดของหมวดหนึ่ง เรียงตามลำดับที่ตั้งไว้ (sortOrder) แล้วค่อยตามชื่อ
async function getByCategory(category) {
  const [rows] = await pool.query(
    "SELECT * FROM lookup_option WHERE category = ? ORDER BY sortOrder ASC, name ASC",
    [category]
  );
  return rows;
}

async function getById(id) {
  const [rows] = await pool.query("SELECT * FROM lookup_option WHERE optionID = ?", [id]);
  return rows[0] || null;
}

async function create(data) {
  const sql = `
    INSERT INTO lookup_option (category, name, icon, accentColor, sortOrder, isActive)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [
    data.category,
    data.name,
    data.icon || null,
    data.accentColor || null,
    data.sortOrder || 0,
    data.isActive !== undefined ? data.isActive : 1
  ];
  const [result] = await pool.query(sql, values);
  return result.insertId;
}

async function update(id, data) {
  const sql = `
    UPDATE lookup_option
    SET name = ?, icon = ?, accentColor = ?, sortOrder = ?, isActive = ?
    WHERE optionID = ?
  `;
  const values = [data.name, data.icon || null, data.accentColor || null, data.sortOrder || 0, data.isActive, id];
  const [result] = await pool.query(sql, values);
  return result.affectedRows;
}

module.exports = { CATEGORIES, getByCategory, getById, create, update };
