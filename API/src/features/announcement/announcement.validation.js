const announcementValidation = (req, res, next) => {
  const { title, tcasRound, academicYear, openDate, closeDate, adminID } = req.body;

  // ตรวจฟิลด์ห้ามว่าง (Not Null) ตามกติกาฐานข้อมูล
  if (!title || !tcasRound || !academicYear || !openDate || !closeDate || !adminID) {
    return res.status(400).json({
      success: false,
      message: "กรอกข้อมูลช่องสำคัญไม่ครบถ้วน กรุณาตรวจสอบหัวข้อ วันเปิด-ปิดรับสมัคร และรหัสแอดมิน"
    });
  }
  next();
};

module.exports = announcementValidation;