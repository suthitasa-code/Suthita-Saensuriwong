const AnnouncementRepository = require('./announcement.repository');

const calculateLabelStatus = (openDate, closeDate) => {
  if (!openDate || !closeDate) return "ไม่ระบุวันรับสมัคร";
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(openDate);
    if (isNaN(start.getTime())) return "ไม่ระบุวันรับสมัคร";
    start.setHours(0, 0, 0, 0);
    const end = new Date(closeDate);
    if (isNaN(end.getTime())) return "ไม่ระบุวันรับสมัคร";
    end.setHours(0, 0, 0, 0);
    if (today < start) return "รอเปิดรับ";
    if (today >= start && today <= end) return "กำลังเปิดรับ";
    return "ปิดรับแล้ว";
  } catch {
    return "ไม่ระบุวันรับสมัคร";
  }
};

const AnnouncementService = {
  createAnnouncement: (data, callback) => {
    AnnouncementRepository.save(data)
      .then(res => callback(null, res))
      .catch(err => callback(err, null));
  },

  getAllAnnouncements: (callback) => {
    AnnouncementRepository.findAll()
      .then(results => {
        const enriched = results.map(item => ({
          ...item,
          labelStatus: calculateLabelStatus(item.openDate, item.closeDate)
        }));
        callback(null, enriched);
      })
      .catch(err => callback(err, null));
  },

  getAnnouncementById: (id, callback) => {
    AnnouncementRepository.findById(id)
      .then(results => {
        if (!results || results.length === 0) return callback(null, null);
        const item = results[0];
        item.labelStatus = calculateLabelStatus(item.openDate, item.closeDate);
        callback(null, item);
      })
      .catch(err => callback(err, null));
  },

  updateAnnouncement: (id, mergedData, files, callback) => {
    AnnouncementRepository.update(id, mergedData)
      .then(res => callback(null, res))
      .catch(err => callback(err, null));
  },

  getAnnouncementForDelete: (id, callback) => {
    AnnouncementRepository.findById(id)
      .then(results => callback(null, results))
      .catch(err => callback(err, null));
  },

  deleteAnnouncement: (id, callback) => {
    AnnouncementRepository.delete(id)
      .then(res => callback(null, res))
      .catch(err => callback(err, null));
  }
};

module.exports = AnnouncementService;