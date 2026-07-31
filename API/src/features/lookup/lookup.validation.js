const { CATEGORIES } = require("./lookup.repository");

function createValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

// เช็คว่าเป็นชื่อหมวดที่ระบบรู้จักจริง (tcas_round / degree_level / curriculum_type)
// กันไม่ให้ใครยิง category แปลกๆ เข้ามาสร้างขยะในตาราง
function validateCategory(category) {
  if (!CATEGORIES.includes(category)) {
    throw createValidationError(`Unknown category: ${category}`);
  }
  return category;
}

function validateId(id) {
  const numberId = Number(id);
  if (!Number.isInteger(numberId) || numberId <= 0) {
    throw createValidationError("Option id must be a positive number");
  }
  return numberId;
}

function validateOption(data) {
  if (!data.name || String(data.name).trim() === "") {
    throw createValidationError("name is required");
  }
  validateCategory(data.category);

  return {
    category: data.category,
    name: String(data.name).trim(),
    icon: data.icon ? String(data.icon).trim() : null,
    accentColor: data.accentColor ? String(data.accentColor).trim() : null,
    sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : 0,
    isActive: data.isActive !== undefined ? Number(data.isActive) : 1
  };
}

module.exports = { validateCategory, validateId, validateOption };
