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

    Object.keys(body).forEach(key => {
      if (body[key] !== undefined && body[key] !== "") {
        updateData[key] = body[key];
      }
    });

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