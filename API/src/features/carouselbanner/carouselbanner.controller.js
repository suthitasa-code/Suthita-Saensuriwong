const carouselbannerRepository = require("./carouselbanner.repository");
const carouselbannerService = require("./carouselbanner.service");

const carouselbannerController = {
  getBanners: async (req, res, next) => {
    try {
      const data = await carouselbannerRepository.findAll();
      res.json(data);
    } catch (err) { next(err); }
  },

  createBanner: async (req, res, next) => {
    try {
      const result = await carouselbannerService.createBanner(req.body, req.file);
      res.status(201).json({ message: "Created!", id: result.insertId });
    } catch (err) { next(err); }
  },

  updateBanner: async (req, res, next) => {
    try {
      const updateData = {};
      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined && req.body[key] !== "") {
          updateData[key] = req.body[key];
        }
      });

      if (req.file) {
        updateData.imageFile = req.file.filename;
      }
      
      await carouselbannerService.updateBanner(req.params.id, updateData);
      res.json({ message: "Updated!" });
    } catch (err) { next(err); }
  },

  // 🌟 จุดสำคัญที่ขาดหายไป: เพิ่มฟังก์ชันลบแบนเนอร์เพื่อให้ระบบทำงานได้ครบลูป
  deleteBanner: async (req, res, next) => {
    try {
      await carouselbannerRepository.delete(req.params.id);
      res.json({ message: "Deleted successfully!" });
    } catch (err) { next(err); }
  }
};

module.exports = carouselbannerController;