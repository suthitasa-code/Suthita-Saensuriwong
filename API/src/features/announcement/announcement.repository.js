const { pool } = require('../../config/db'); 

const AnnouncementRepository = {
  // 1. บันทึกประกาศใหม่
  save: async (data) => {
    const query = `
      INSERT INTO announcement 
      (title, tcasRound, academicYear, totalQuota, totalScholarships, candidateDetail, conditions, notes, openDate, closeDate, status, posterImg, scheduleImg, majorTableImg, manualPdf, announcementPdf, adminID) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.title, data.tcasRound, data.academicYear, data.totalQuota || null, data.totalScholarships || null,
      data.candidateDetail, data.conditions, data.notes, data.openDate, data.closeDate, data.status || '1',
      data.posterImg || null, data.scheduleImg || null, data.majorTableImg || null, data.manualPdf || null, data.announcementPdf || null,
      data.adminID
    ];
    const [res] = await pool.query(query, values);
    return res;
  },

  // 2. หาประกาศทั้งหมด
  findAll: async () => {
    const [rows] = await pool.query('SELECT * FROM announcement ORDER BY announcementID DESC');
    return rows;
  },

  // 3. หาประกาศเดี่ยวด้วย ID
  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM announcement WHERE announcementID = ?', [id]);
    return rows;
  },

  // 4. อัปเดตข้อมูลประกาศ
  update: async (id, data) => {
    const query = `
      UPDATE announcement SET 
        title = ?, tcasRound = ?, academicYear = ?, totalQuota = ?, totalScholarships = ?, 
        candidateDetail = ?, conditions = ?, notes = ?, openDate = ?, closeDate = ?, 
        status = ?, posterImg = ?, scheduleImg = ?, majorTableImg = ?, manualPdf = ?, announcementPdf = ?, adminID = ?
      WHERE announcementID = ?
    `;
    const values = [
      data.title, data.tcasRound, data.academicYear, data.totalQuota || null, data.totalScholarships || null,
      data.candidateDetail, data.conditions, data.notes, data.openDate, data.closeDate,
      data.status, data.posterImg, data.scheduleImg, data.majorTableImg, data.manualPdf, data.announcementPdf, data.adminID,
      id
    ];
    const [res] = await pool.query(query, values);
    return res;
  },

  // 5. ลบประกาศ
  delete: async (id) => {
    const [res] = await pool.query('DELETE FROM announcement WHERE announcementID = ?', [id]);
    return res;
  }
};

module.exports = AnnouncementRepository;