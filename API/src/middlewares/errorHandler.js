const { error } = require("../config/utils/response"); 

function errorHandler(err, req, res, next) {
  console.error(err);

  // ✅ ปรับข้อความให้ตรงกับความเป็นจริง (ถ้าในโค้ดเราตั้งไว้ 5MB ก็แก้เป็น 5MB จ้ะ)
  if (err.code === "LIMIT_FILE_SIZE") {
    return error(res, "Image size must not exceed 5 MB", 400);
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return error(res, "Unexpected file field or too many images", 400);
  }

  // ✅ เพิ่มเคส Invalid File Type ที่แม่เขียนไว้ใน carouselbanner.upload.js
  if (err.message === "Invalid file type") {
    return error(res, "Only JPEG, JPG, PNG, and WEBP files are allowed", 400);
  }

  if (err.code === "ER_DUP_ENTRY") {
    return error(res, "This entry already exists in the database", 409);
  }

  // เกิดตอนพยายามลบแถวที่ยังมีตารางอื่นอ้างอิงอยู่ผ่าน Foreign Key (เช่น ลบแอดมิน
  // ที่เคยสร้างประกาศ/หลักสูตร/แบนเนอร์/เอกสารไว้) แนะนำให้ระงับสิทธิ์แทนการลบ
  if (err.code === "ER_ROW_IS_REFERENCED_2" || err.code === "ER_ROW_IS_REFERENCED") {
    return error(res, "ไม่สามารถลบบัญชีนี้ได้ เนื่องจากเคยมีการสร้างข้อมูล (ประกาศ/หลักสูตร/แบนเนอร์/เอกสาร) ไว้ในระบบ กรุณาระงับสิทธิ์การใช้งานแทนค่ะ", 409);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  return error(res, message, statusCode);
}

module.exports = errorHandler;