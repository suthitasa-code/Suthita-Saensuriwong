const announcementValidation = (req, res, next) => {
  const { title, tcasRound, academicYear, openDate, closeDate, adminID } = req.body;

  // ตรวจฟิลด์ห้ามว่าง (Not Null) ตามกติกาฐานข้อมูลของหนูเลยลูก
  if (!title || !tcasRound || !academicYear || !openDate || !closeDate || !adminID) {
    return res.status(400).json({
      success: false,
      message: "กรอกข้อมูลช่องสำคัญไม่ครบถ้วนจ้า กรุณาเช็กพวกหัวข้อ, วันเปิด-ปิดรับสมัคร หรือรหัสแอดมินด้วยน้าลูก!"
    });
  }
  next();
};

module.exports = announcementValidation;