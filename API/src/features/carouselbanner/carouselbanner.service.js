const carouselbannerRepository = require("./carouselbanner.repository");

const carouselbannerService = {
  createBanner: async (body, file) => {
    const data = { ...body, imageFile: file ? file.originalname : null };
    return await carouselbannerRepository.create(data);
  },

  updateBanner: async (id, body, file) => {
    // ถ้ามีการอัปโหลดรูปใหม่ ให้ใช้ชื่อใหม่ ถ้าไม่มีให้ใช้ชื่อเดิมที่ส่งมาจาก Body
    const data = { ...body };
    if (file) data.imageFile = file.originalname;
    return await carouselbannerRepository.update(id, data);
  }
};

module.exports = carouselbannerService;