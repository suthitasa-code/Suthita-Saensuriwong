const AnnouncementRepository = require('./announcement.repository');

const announcementValidation = async (req, res, next) => {
  const { title, tcasRound, academicYear, openDate, closeDate, adminID } = req.body;

  // ตรวจฟิลด์ห้ามว่าง (Not Null) ตามกติกาฐานข้อมูล
  if (!title || !tcasRound || !academicYear || !openDate || !closeDate || !adminID) {
    return res.status(400).json({
      success: false,
      message: "กรอกข้อมูลช่องสำคัญไม่ครบถ้วน กรุณาตรวจสอบหัวข้อ วันเปิด-ปิดรับสมัคร และรหัสแอดมิน"
    });
  }

  // กันเพิ่ม/แก้ไขประกาศให้ซ้ำรอบ TCAS เดิมในปีการศึกษาเดียวกัน (ปกติแต่ละรอบเพิ่มประกาศได้แค่ 1 อันต่อปี)
  try {
    const excludeId = req.params.id || null;
    const duplicate = await AnnouncementRepository.findByRoundAndYear(tcasRound, academicYear, excludeId);
    if (duplicate.length > 0) {
      return res.status(409).json({
        success: false,
        message: `ประกาศ "${tcasRound}" ปีการศึกษา ${academicYear} ถูกเพิ่มเข้าระบบไปแล้ว ไม่สามารถเพิ่มซ้ำได้ กรุณาแก้ไขประกาศเดิมแทนหากต้องการเปลี่ยนแปลงข้อมูล`
      });
    }
  } catch {
    return res.status(500).json({ success: false, message: "ตรวจสอบข้อมูลซ้ำไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" });
  }

  next();
};

module.exports = announcementValidation;