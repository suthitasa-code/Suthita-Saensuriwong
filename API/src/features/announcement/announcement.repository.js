const { pool } = require('../../config/db'); 

const AnnouncementRepository = {
  // 1. บันทึกประกาศใหม่
  save: async (data) => {
    const query = `
      INSERT INTO announcement
      (title, subtitle, tcasRound, academicYear, totalQuota, totalScholarships, candidateDetail, conditions, notes, openDate, closeDate, status, posterImg, scheduleImg, majorTableImg, manualPdf, announcementPdf, adminID)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.title, data.subtitle || null, data.tcasRound, data.academicYear, data.totalQuota || null, data.totalScholarships || null,
      data.candidateDetail, data.conditions, data.notes, data.openDate, data.closeDate, data.status || '1',
      data.posterImg || null, data.scheduleImg || null, data.majorTableImg || null, data.manualPdf || null, data.announcementPdf || null,
      data.adminID
    ];
    const [res] = await pool.query(query, values);
    return res;
  },

  // 2. หาประกาศทั้งหมด
  // JOIN ตาราง admin 2 รอบ (คนละ alias) เพื่อดึงชื่อ "คนสร้าง" (adminID) กับ
  // "คนแก้ไขล่าสุด" (updatedBy) มาแสดงพร้อมกันในคำสั่งเดียว ไม่ต้องยิง query แยก
  findAll: async () => {
    const [rows] = await pool.query(`
      SELECT a.*,
        c.name AS creatorName, c.lastname AS creatorLastname,
        u.name AS updaterName, u.lastname AS updaterLastname
      FROM announcement a
      LEFT JOIN admin c ON a.adminID = c.adminID
      LEFT JOIN admin u ON a.updatedBy = u.adminID
      ORDER BY a.announcementID DESC
    `);
    return rows;
  },

  // 3. หาประกาศเดี่ยวด้วย ID
  findById: async (id) => {
    const [rows] = await pool.query(`
      SELECT a.*,
        c.name AS creatorName, c.lastname AS creatorLastname,
        u.name AS updaterName, u.lastname AS updaterLastname
      FROM announcement a
      LEFT JOIN admin c ON a.adminID = c.adminID
      LEFT JOIN admin u ON a.updatedBy = u.adminID
      WHERE a.announcementID = ?
    `, [id]);
    return rows;
  },

  // 4. อัปเดตข้อมูลประกาศ
  // หมายเหตุ: ไม่แก้ adminID (คนสร้าง) อีกต่อไป เพื่อให้ยังรู้ว่าใครเป็นคนสร้างประกาศนี้ตอนแรกเสมอ
  // ส่วนคนที่กำลังแก้ไขตอนนี้ (data.adminID ที่ส่งมาจาก frontend) จะถูกบันทึกลง updatedBy แทน
  // พร้อมเวลาแก้ไขล่าสุด (updatedAt) ทุกครั้งที่กดบันทึก
  update: async (id, data) => {
    const query = `
      UPDATE announcement SET
        title = ?, subtitle = ?, tcasRound = ?, academicYear = ?, totalQuota = ?, totalScholarships = ?,
        candidateDetail = ?, conditions = ?, notes = ?, openDate = ?, closeDate = ?,
        status = ?, posterImg = ?, scheduleImg = ?, majorTableImg = ?, manualPdf = ?, announcementPdf = ?,
        updatedBy = ?, updatedAt = NOW()
      WHERE announcementID = ?
    `;
    const values = [
      data.title, data.subtitle || null, data.tcasRound, data.academicYear, data.totalQuota || null, data.totalScholarships || null,
      data.candidateDetail, data.conditions, data.notes, data.openDate, data.closeDate,
      data.status, data.posterImg, data.scheduleImg, data.majorTableImg, data.manualPdf, data.announcementPdf,
      data.adminID,
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