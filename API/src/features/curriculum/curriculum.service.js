const curriculumRepository = require("./curriculum.repository");

const curriculumService = {
  createCurriculum: async (body, files) => {
    const data = { ...body };

    // จัดการไฟล์อัปโหลด (รูปหน้าปก, รูปเสื้อช็อป, ไฟล์ PDF)
    if (files) {
      if (files.Images) data.Images = files.Images[0].filename;
      if (files.shopPhoto) data.shopPhoto = files.shopPhoto[0].filename;
      if (files.pdfFiles) {
        const fileNames = files.pdfFiles.map(file => file.filename);
        data.pdfFiles = fileNames.join(","); // รวมชื่อไฟล์ PDF คั่นด้วยเครื่องหมายจุลภาค ,
      }
    }

    return await curriculumRepository.create(data);
  },

  updateCurriculum: async (id, body, files) => {
    const updateData = {};

    // adminID ที่ frontend ส่งมาตอนแก้ไข คือคนที่ "กำลังแก้ไขอยู่ตอนนี้" ไม่ใช่คนสร้าง
    // เลยไม่เขียนทับคอลัมน์ adminID (คนสร้างเดิม) อีกต่อไป แต่ไปลง updatedBy/updatedAt แทน
    // เพื่อให้ยังรู้เสมอว่าใครเป็นคนสร้างหลักสูตรนี้ตอนแรก
    Object.keys(body).forEach(key => {
      if (key === "adminID") return;
      if (body[key] !== undefined && body[key] !== "") {
        updateData[key] = body[key];
      }
    });
    if (body.adminID) {
      updateData.updatedBy = body.adminID;
      updateData.updatedAt = new Date();
    }

    // วนลูปเช็คถ้าแอดมินมีการอัปโหลดไฟล์ใหม่เข้ามาเพิ่ม
    if (files) {
      if (files.Images) updateData.Images = files.Images[0].filename;
      if (files.shopPhoto) updateData.shopPhoto = files.shopPhoto[0].filename;
      if (files.pdfFiles) {
        const fileNames = files.pdfFiles.map(file => file.filename);
        updateData.pdfFiles = fileNames.join(",");
      }
    }

    return await curriculumRepository.update(id, updateData);
  }
};

module.exports = curriculumService;