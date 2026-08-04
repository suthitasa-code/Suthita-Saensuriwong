const { pool } = require("../../config/db");

const curriculumRepository = {
  // JOIN ตาราง admin 2 รอบ (คนละ alias) เพื่อดึงชื่อ "คนสร้าง" (adminID) กับ
  // "คนแก้ไขล่าสุด" (updatedBy) มาแสดงพร้อมกันในคำสั่งเดียว (แพทเทิร์นเดียวกับ announcement.repository.js)
  findAll: async () => {
    const [rows] = await pool.query(`
      SELECT c.*,
        cr.name AS creatorName, cr.lastname AS creatorLastname,
        up.name AS updaterName, up.lastname AS updaterLastname
      FROM curriculum c
      LEFT JOIN admin cr ON c.adminID = cr.adminID
      LEFT JOIN admin up ON c.updatedBy = up.adminID
    `);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.query(`
      SELECT c.*,
        cr.name AS creatorName, cr.lastname AS creatorLastname,
        up.name AS updaterName, up.lastname AS updaterLastname
      FROM curriculum c
      LEFT JOIN admin cr ON c.adminID = cr.adminID
      LEFT JOIN admin up ON c.updatedBy = up.adminID
      WHERE c.curriculumID = ?
    `, [id]);
    return rows[0] || null;
  },


  create: async (data) => {
    //  อัปเดตรายชื่อคอลัมน์ใหม่ให้ตรงตามฐานข้อมูลขเป๊ะๆ 
    // 🌟 เพิ่มคอลัมน์ icon เข้าไปในรายการ (ต้องรัน ALTER TABLE เพิ่มคอลัมน์นี้ในฐานข้อมูลก่อนด้วย)
    const sql = `INSERT INTO curriculum
      (curriculumID, curriculumName, curriculumNameEN, deptNameTH, deptNameEN, degreeLevel, curriculumType, highlights, whatWeLearn, insideKuse, jobOpportunities, careerPrivate, careerGovernment, Images, shopPhoto, pdfFiles, icon, adminID)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.query(sql, [
      data.curriculumID, data.curriculumName, data.curriculumNameEN, data.deptNameTH, data.deptNameEN, data.degreeLevel, data.curriculumType,
      data.highlights, data.whatWeLearn, data.insideKuse, data.jobOpportunities,
      data.careerPrivate, data.careerGovernment, data.Images, data.shopPhoto, data.pdfFiles, data.icon, data.adminID
    ]);
    return result;
  },

  update: async (id, data) => {
    const keys = Object.keys(data);
    if (keys.length === 0) return null;

    const setClause = keys.map(key => `${key}=?`).join(", ");
    const values = keys.map(key => data[key]);

    const sql = `UPDATE curriculum SET ${setClause} WHERE curriculumID=?`;
    values.push(id);

    const [result] = await pool.query(sql, values);
    return result;
  },

  delete: async (id) => {
    return await pool.query("DELETE FROM curriculum WHERE curriculumID=?", [id]);
  }
};

module.exports = curriculumRepository;