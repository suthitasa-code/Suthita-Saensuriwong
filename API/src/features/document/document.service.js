// --- src/api/document/document.service.js ---
const documentRepository = require("./document.repository");
const fs = require("fs");
const path = require("path");

const documentService = {
  getAllDocuments: async () => {
    return await documentRepository.findAll();
  },

  // รับค่าอัปโหลดและจับแยกชื่อไฟล์สุ่มกับชื่อไฟล์ไทยจริง
  createNewDocument: async (file, fileCategory, adminID) => {
    if (!file) {
      throw new Error("ไม่พบไฟล์ที่อัปโหลดจ้ะลูกวิป!");
    }

    const sizeInMB = parseFloat((file.size / (1024 * 1024)).toFixed(2));

    // 🔥 บั๊ก Fix: แปลงรหัสชื่อไฟล์จากละติน (ISO-8859-1) ให้กลับมาเป็นภาษาไทย (UTF-8) ที่ถูกต้อง
    const fixedThaiName = Buffer.from(file.originalname, 'ascii').toString('utf8');

    const documentData = {
      fileName: file.filename,             // ชื่ออังกฤษสุ่ม (สำหรับ backend ดึงไฟล์ปลอดภัย)
      originalFileName: fixedThaiName,     // ชื่อไทยเดิมที่แก้อักษรต่างด้าวแล้ว (สำหรับโชว์แอดมิน)
      fileType: file.mimetype,     
      fileSize: sizeInMB,          
      fileCategory: fileCategory || 'OTHER', 
      adminID: adminID             
    };

    const result = await documentRepository.create(documentData);
    return { documentID: result.insertId, ...documentData };
  },

  // เพิ่มการรองรับแก้ไขเปลี่ยนหมวดหมู่ไฟล์เดิม และบันทึกชื่อไทยใหม่หากมีการอัปโหลดไฟล์ทับ
  updateDocument: async (id, file, fileCategory, adminID) => {
    const oldDocument = await documentRepository.findByID(id);
    if (!oldDocument) {
      throw new Error("ไม่พบข้อมูลไฟล์เอกสารที่ต้องการแก้ไขจ้ะ!");
    }

    const updateData = {};

    // ถ้ามีการส่งไฟล์มาเปลี่ยนใหม่
    if (file) {
      const oldFilePath = path.join(process.cwd(), "uploads", "documents", oldDocument.fileName);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      const sizeInMB = parseFloat((file.size / (1024 * 1024)).toFixed(2));
      
      // 🔥 บั๊ก Fix: แปลงรหัสชื่อไฟล์ตัวใหม่ให้กลับมาเป็นภาษาไทยที่ถูกต้องด้วย
      const fixedThaiName = Buffer.from(file.originalname, 'ascii').toString('utf8');

      updateData.fileName = file.filename;
      updateData.originalFileName = fixedThaiName; // เก็บชื่อภาษาไทยไฟล์ใหม่แบบอ่านออก
      updateData.fileType = file.mimetype;
      updateData.fileSize = sizeInMB;
    }

    if (fileCategory) {
      updateData.fileCategory = fileCategory;
    }

    if (adminID) {
      updateData.adminID = adminID;
    }

    if (Object.keys(updateData).length === 0) {
      return oldDocument;
    }

    await documentRepository.update(id, updateData);
    return { documentID: id, ...oldDocument, ...updateData };
  },

  deleteDocument: async (id) => {
    const document = await documentRepository.findByID(id);
    if (!document) {
      throw new Error("ไม่พบข้อมูลไฟล์เอกสารที่ต้องการลบจ้ะ!");
    }

    const filePath = path.join(process.cwd(), "uploads", "documents", document.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await documentRepository.delete(id);
    return true;
  }
};

module.exports = documentService;