const { pool } = require("../../config/db");

const carouselbannerRepository = {
  findAll: async () => {
    const [rows] = await pool.query("SELECT * FROM carouselbanner ORDER BY displayOrder ASC");
    return rows;
  },
  
  create: async (data) => {
    const sql = `INSERT INTO carouselbanner 
      (title, subtitle, imageFile, displayOrder, bannerWidth, bannerHeight, adminID) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.query(sql, [
      data.title, data.subtitle, data.imageFile, data.displayOrder,
      data.bannerWidth, data.bannerHeight, data.adminID
    ]);
    return result;
  },

  update: async (id, data) => {
    const keys = Object.keys(data);
    if (keys.length === 0) return null; 

    const setClause = keys.map(key => `${key}=?`).join(", ");
    const values = keys.map(key => data[key]);
    const sql = `UPDATE carouselbanner SET ${setClause} WHERE bannerID=?`;
    values.push(id);

    const [result] = await pool.query(sql, values);
    return result;
  },

  delete: async (id) => {
    return await pool.query("DELETE FROM carouselbanner WHERE bannerID=?", [id]);
  }
};

module.exports = carouselbannerRepository;