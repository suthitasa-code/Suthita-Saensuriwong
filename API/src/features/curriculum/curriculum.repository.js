const { pool } = require("../../config/db");

const curriculumRepository = {
  findAll: async () => {
    const [rows] = await pool.query("SELECT * FROM curriculum");
    return rows;
  },
  
  create: async (data) => {
    //  อัปเดตรายชื่อคอลัมน์ใหม่ให้ตรงตามฐานข้อมูลขเป๊ะๆ 
    // 🌟 เพิ่มคอลัมน์ icon เข้าไปในรายการ (ต้องรัน ALTER TABLE เพิ่มคอลัมน์นี้ในฐานข้อมูลก่อนด้วย)
    const sql = `INSERT INTO curriculum 
      (curriculumID, curriculumName, deptNameTH, deptNameEN, degreeLevel, highlights, whatWeLearn, insideKuse, jobOpportunities, careerPrivate, careerGovernment, Images, shopPhoto, pdfFiles, icon, adminID) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.query(sql, [
      data.curriculumID, data.curriculumName, data.deptNameTH, data.deptNameEN, data.degreeLevel,
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