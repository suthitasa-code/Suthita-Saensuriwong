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

// ด่านเสริม ใช้ต่อจาก verifyToken เท่านั้น (ต้องรู้ req.admin.role ก่อน ถึงจะเช็คได้ว่าเป็น Super Admin จริงไหม)
// ใช้กับ endpoint ที่อ่อนไหวเป็นพิเศษ เช่น "ดูรหัสผ่านของแอดมินคนอื่น" ที่ Admin ธรรมดาไม่ควรเรียกได้
// ต่อให้แก้ frontend ซ่อน/โชว์ปุ่มยังไง คนร้ายก็ยิง API ตรงๆ ผ่านด่านนี้ไม่ได้ถ้าไม่ใช่ Super Admin จริง
function requireSuperAdmin(req, res, next) {
  if (req.admin?.role !== "Super Admin") {
    const error = new Error("เฉพาะ Super Admin เท่านั้นที่มีสิทธิ์ทำรายการนี้");
    error.statusCode = 403;
    return next(error);
  }
  next();
}

module.exports = { verifyToken, requireSuperAdmin };
