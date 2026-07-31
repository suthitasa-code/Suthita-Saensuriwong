const jwt = require("jsonwebtoken");

// ด่านตรวจบัตรผ่านก่อนเข้าทำอะไรกับข้อมูลแอดมิน (สร้าง/แก้ไข/ระงับสิทธิ์ ฯลฯ)
// ฝั่งหน้าบ้านจะแนบ token มากับ header แบบ "Authorization: Bearer <token>" ทุกครั้ง
// ฟังก์ชันนี้แกะ token ออกมาเช็คว่าของจริงไหม (เซ็นด้วย JWT_SECRET เดียวกันหรือเปล่า)
// ถ้าไม่มี token หรือ token ปลอม/หมดอายุ -> ตีกลับ 401 ทันที ไม่ให้ผ่านเข้าไปแตะฐานข้อมูล
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    const error = new Error("กรุณาเข้าสู่ระบบก่อนใช้งานส่วนนี้");
    error.statusCode = 401;
    return next(error);
  }

  try {
    // decode สำเร็จ = token ถูกเซ็นด้วยกุญแจลับของเราจริง ไม่ได้ถูกปลอมมา
    // แปะข้อมูลแอดมิน (adminID, role) ติดไปกับ req เผื่อ controller ถัดไปอยากรู้ว่าใครเป็นคนยิง request มา
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    const error = new Error("เซสชันหมดอายุหรือไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
    error.statusCode = 401;
    next(error);
  }
}

module.exports = { verifyToken };
