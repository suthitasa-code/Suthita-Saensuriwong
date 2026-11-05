const curriculumRepository = require("./curriculum.repository");

const curriculumService = {
  createCurriculum: async (body, files, adminID) => {
    const data = { ...body };
    data.adminID = adminID;

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

  updateCurriculum: async (id, body, files, adminID) => {
    const updateData = {};

    // adminID ที่ frontend ส่งมาตอนแก้ไข คือคนที่ "กำลังแก้ไขอยู่ตอนนี้" ไม่ใช่คนสร้าง
    // เลยไม่เขียนทับคอลัมน์ adminID (คนสร้างเดิม) อีกต่อไป แต่ไปลง updatedBy/updatedAt แทน
    // เพื่อให้ยังรู้เสมอว่าใครเป็นคนสร้างหลักสูตรนี้ตอนแรก
    // existing_pdfFiles เป็นแค่ฟิลด์ควบคุม (บอกว่าไฟล์ PDF เดิมไฟล์ไหนเหลืออยู่) ไม่ใช่คอลัมน์ในตาราง จัดการแยกด้านล่าง
    Object.keys(body).forEach(key => {
      if (key === "adminID" || key === "existing_pdfFiles") return;
      if (body[key] !== undefined && body[key] !== "") {
        updateData[key] = body[key];
      }
    });
    if (adminID) {
      updateData.updatedBy = adminID;
      updateData.updatedAt = new Date();
    }

    // วนลูปเช็คถ้าแอดมินมีการอัปโหลดไฟล์ใหม่เข้ามาเพิ่ม
    if (files) {
      if (files.Images) updateData.Images = files.Images[0].filename;
      if (files.shopPhoto) updateData.shopPhoto = files.shopPhoto[0].filename;

      // รวมไฟล์ PDF เดิมที่เหลืออยู่ (หลังผู้ใช้กดกากบาทลบบางไฟล์ออก) เข้ากับไฟล์ใหม่ที่เพิ่งอัปโหลดเพิ่ม
      // แทนที่จะทับของเดิมทั้งหมดทุกครั้งที่มีไฟล์ใหม่
      if (files.pdfFiles || body.existing_pdfFiles !== undefined) {
        const kept = (body.existing_pdfFiles || "").split(",").map(name => name.trim()).filter(Boolean);
        const added = files.pdfFiles ? files.pdfFiles.map(file => file.filename) : [];
        const combined = [...kept, ...added];
        updateData.pdfFiles = combined.length > 0 ? combined.join(",") : null;
      }
    }

    return await curriculumRepository.update(id, updateData);
  }
};

module.exports = curriculumService;