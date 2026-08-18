const AnnouncementService = require('./announcement.service');
const fs = require('fs');
const path = require('path');

// ฟังก์ชันช่วยมัดรวมชื่อไฟล์กรณีมีหลายไฟล์ (ถ้ามีมากกว่า 1 ไฟล์จะคั่นด้วยเครื่องหมาย , )
const combineFileNames = (filesArray) => {
  if (!filesArray || filesArray.length === 0) return null;
  return filesArray.map(file => file.filename).join(',');
};

// 1. ฟังก์ชันสร้างประกาศใหม่ (Create)
exports.create = (req, res) => {
  const files = req.files || {};
  
  const announcementData = {
    ...req.body,
    posterImg: combineFileNames(files['posterImg']),
    scheduleImg: combineFileNames(files['scheduleImg']),
    majorTableImg: combineFileNames(files['majorTableImg']),
    manualPdf: files['manualPdf'] ? files['manualPdf'][0].filename : null,
    announcementPdf: files['announcementPdf'] ? files['announcementPdf'][0].filename : null
  };

  AnnouncementService.createAnnouncement(announcementData, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    
    const insertedId = result && result.insertId ? result.insertId : null;
    return res.status(201).json({ 
      success: true, 
      message: "สร้างประกาศสำเร็จ",
      id: insertedId 
    });
  });
};

// 2. ฟังก์ชันดึงข้อมูลทั้งหมด (Read All)
exports.getAll = (req, res) => {
  AnnouncementService.getAllAnnouncements((err, data) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    return res.status(200).json({ success: true, data: data || [] });
  });
};

// 3. ฟังก์ชันดึงข้อมูลเดี่ยวตาม ID (Read One)
exports.getById = (req, res) => {
  AnnouncementService.getAnnouncementById(req.params.id, (err, data) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (!data) return res.status(404).json({ success: false, message: "ไม่พบประกาศนี้" });
    return res.status(200).json({ success: true, data });
  });
};

// 4. ฟังก์ชันแก้ไขข้อมูลประกาศ (Update)
exports.update = (req, res) => {
  const id = req.params.id;
  const files = req.files || {};

  AnnouncementService.getAnnouncementForDelete(id, (err, results) => {
    if (err || !results || (Array.isArray(results) && results.length === 0)) {
      return res.status(404).json({ success: false, message: "ไม่พบประกาศที่ต้องการแก้ไข" });
    }
    
    const oldData = Array.isArray(results) ? results[0] : results;

    const announcementData = {
      ...req.body,
      posterImg: files['posterImg'] ? combineFileNames(files['posterImg']) : oldData.posterImg,
      scheduleImg: files['scheduleImg'] ? combineFileNames(files['scheduleImg']) : oldData.scheduleImg,
      majorTableImg: files['majorTableImg'] ? combineFileNames(files['majorTableImg']) : oldData.majorTableImg,
      manualPdf: files['manualPdf'] ? files['manualPdf'][0].filename : oldData.manualPdf,
      announcementPdf: files['announcementPdf'] ? files['announcementPdf'][0].filename : oldData.announcementPdf
    };

    AnnouncementService.updateAnnouncement(id, announcementData, files, (err) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      return res.status(200).json({ success: true, message: "แก้ไขประกาศเรียบร้อยแล้ว" });
    });
  });
};

// 5. ฟังก์ชันลบประกาศและเคลียร์ไฟล์ขยะ (Delete - แก้ไขแล้ว ✅)
exports.delete = (req, res) => {
  const id = req.params.id;

  // ✅ STEP 1: ดึงข้อมูลไฟล์ก่อน ตอนนี้ record ยังอยู่ใน DB
  AnnouncementService.getAnnouncementForDelete(id, (fetchErr, results) => {
    if (fetchErr) {
      return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด: " + fetchErr.message });
    }

    const oldData = (Array.isArray(results) ? results[0] : results) || null;

    if (!oldData) {
      return res.status(404).json({ success: false, message: "ไม่พบข้อมูลประกาศนี้ในระบบ" });
    }

    // ✅ STEP 2: ลบออกจาก DB
    AnnouncementService.deleteAnnouncement(id, (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการลบ: " + err.message });
      }

      if (result && result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "ไม่พบข้อมูลประกาศนี้ในระบบ" });
      }

      // ✅ STEP 3: ส่ง response กลับ Postman ทันที
      res.status(200).json({ success: true, message: "ลบประกาศออกจากระบบเรียบร้อยแล้ว" });

      // ✅ STEP 4: ลบไฟล์เบื้องหลัง ใช้ข้อมูลที่ดึงมาตั้งแต่ STEP 1 ได้เลย ไม่ต้องเรียก DB อีกรอบ
      const fileFields = ['posterImg', 'scheduleImg', 'majorTableImg', 'manualPdf', 'announcementPdf'];
      try {
        fileFields.forEach(field => {
          if (oldData[field] && typeof oldData[field] === 'string') {
            oldData[field].split(',').forEach(singleFileName => {
              if (singleFileName) {
                const filePath = path.join(__dirname, '../../../uploads/announcements', singleFileName.trim());
                if (fs.existsSync(filePath)) {
                  fs.unlinkSync(filePath);
                }
              }
            });
          }
        });
      } catch (fileError) {
        console.log("เคลียร์ไฟล์เบื้องหลังไม่สำเร็จ แต่ข้อมูลในเบสลบไปแล้วนะ:", fileError.message);
      }
    });
  });
};