function createValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function validateId(id) {
  const numberId = Number(id);
  
  if (!Number.isInteger(numberId) || numberId <= 0) {
    throw createValidationError("Admin id must be a positive number");
  }

  return numberId;
}

function validateRequired(value, fieldName) {
  if (value === undefined || value === null || String(value).trim() === "") {
    throw createValidationError(`${fieldName} is required`);
  }
}

function validateAdmin(data, isUpdate = false) {
  if (!isUpdate) {
    validateRequired(data.name, "name");
    validateRequired(data.lastname, "lastname");
    validateRequired(data.email, "email");
  }

  // จะบังคับตรวจสอบรหัสผ่านเฉพาะตอนลงทะเบียน Admin ใหม่เท่านั้น
  if (!isUpdate) {
    validateRequired(data.password, "password");
  }

  if (data.email && !data.email.includes("@")) {
    throw createValidationError("Invalid email format");
  }

  // ตรวจสอบความยาวรหัสผ่านเฉพาะในกรณีที่มีค่าถูกส่งเข้ามาพิจารณา
  if (data.password && String(data.password).length < 6) {
    throw createValidationError("Password must be at least 6 characters long");
  }

  // เคลียร์และกรองสเปซหน้า-หลังของข้อมูลให้สะอาด
  const cleanedData = {
    name: data.name !== undefined ? String(data.name).trim() : undefined,
    lastname: data.lastname !== undefined ? String(data.lastname).trim() : undefined,
    email: data.email !== undefined ? String(data.email).trim() : undefined,
    role: data.role !== undefined
      ? String(data.role).trim()
      : (isUpdate ? undefined : 'Admin'),
    status: data.status !== undefined
      ? Number(data.status)
      : (isUpdate ? undefined : 1)
  };

  // แนบรหัสผ่านเข้าไปหากพบว่าฝั่งหน้าบ้านส่งค่าชุดใหม่มา
  if (data.password && String(data.password).trim() !== "") {
    cleanedData.password = String(data.password);
  }

  return cleanedData;
}

module.exports = {
  validateAdmin,
  validateId
};