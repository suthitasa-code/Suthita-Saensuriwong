const lookupRepository = require("./lookup.repository");
const { validateCategory, validateId, validateOption } = require("./lookup.validation");

// ดึงลิสต์ตัวเลือกของหมวดหนึ่ง (เช่น รอบ TCAS, ระดับการศึกษา, ประเภทหลักสูตร)
// activeOnly = true ใช้ตอนหน้าฟอร์มดึงไปทำ dropdown (ไม่เอาตัวที่ถูกปิดใช้งานแล้วมาให้เลือก)
// activeOnly = false ใช้ตอนหน้า "จัดการตัวเลือกระบบ" ที่ Super Admin ต้องเห็นของที่ปิดไว้ด้วย เผื่อจะเปิดกลับ
async function getByCategory(category, activeOnly) {
  validateCategory(category);
  const options = await lookupRepository.getByCategory(category);
  if (!activeOnly) return options;
  return options.filter((o) => Number(o.isActive) === 1);
}

async function createOption(data) {
  const validData = validateOption(data);
  const newId = await lookupRepository.create(validData);
  return lookupRepository.getById(newId);
}

async function updateOption(id, data) {
  const optionId = validateId(id);
  const existing = await lookupRepository.getById(optionId);
  if (!existing) {
    const error = new Error("Option not found");
    error.statusCode = 404;
    throw error;
  }

  // อนุญาตแก้ได้แค่ ชื่อ/ไอคอน/สี/ลำดับ/เปิดปิดใช้งาน ห้ามย้ายข้ามหมวด (category คงเดิมเสมอ)
  const validData = validateOption({ ...existing, ...data, category: existing.category });
  await lookupRepository.update(optionId, validData);
  return lookupRepository.getById(optionId);
}

module.exports = { getByCategory, createOption, updateOption };
