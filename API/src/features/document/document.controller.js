// --- src/api/document/document.controller.js ---
const documentService = require("./document.service");

const documentController = {
  getDocuments: async (req, res) => {
    try {
      const documents = await documentService.getAllDocuments();
      res.status(200).json({ status: 200, success: true, data: documents });
    } catch (error) {
      res.status(500).json({ status: 500, success: false, message: error.message });
    }
  },

  createDocument: async (req, res) => {
    try {
      const { adminID, fileCategory } = req.body;
      const file = req.file; 
      
      const newDoc = await documentService.createNewDocument(file, fileCategory, adminID);
      res.status(201).json({ status: 201, success: true, message: "เพิ่มไฟล์ลงคลังสำเร็จ", data: newDoc });
    } catch (error) {
      res.status(500).json({ status: 500, success: false, message: error.message });
    }
  },

  updateDocument: async (req, res) => {
    try {
      const { id } = req.params;
      const { adminID, fileCategory } = req.body;
      const file = req.file;

      if (!fileCategory) {
        return res.status(400).json({ status: 400, success: false, message: "กรุณาระบุหมวดหมู่ประเภทเอกสาร" });
      }

      const updatedDoc = await documentService.updateDocument(id, file, fileCategory, adminID);
      res.status(200).json({ status: 200, success: true, message: "แก้ไขข้อมูลเอกสารสำเร็จ", data: updatedDoc });
    } catch (error) {
      res.status(500).json({ status: 500, success: false, message: error.message });
    }
  },

  deleteDocument: async (req, res) => {
    try {
      const { id } = req.params;
      await documentService.deleteDocument(id);
      res.status(200).json({ status: 200, success: true, message: "ลบไฟล์ออกจากคลังเรียบร้อยแล้ว" });
    } catch (error) {
      res.status(500).json({ status: 500, success: false, message: error.message });
    }
  }
};

module.exports = documentController;