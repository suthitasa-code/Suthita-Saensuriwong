const curriculumService = require("./curriculum.service");
const curriculumRepository = require("./curriculum.repository");

const curriculumController = {
  getCurriculums: async (req, res, next) => {
    try {
      const data = await curriculumRepository.findAll();
      res.json(data);
    } catch (err) { next(err); }
  },

  getCurriculumById: async (req, res, next) => {
    try {
      const data = await curriculumRepository.findById(req.params.id);
      if (!data) {
        return res.status(404).json({ success: false, message: "ไม่พบหลักสูตรนี้" });
      }
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  createCurriculum: async (req, res, next) => {
    try {
      const result = await curriculumService.createCurriculum(req.body, req.files, req.admin.adminID);
      res.status(201).json({ message: "Created!", id: result.insertId });
    } catch (err) { next(err); }
  },

  updateCurriculum: async (req, res, next) => {
    try {
      await curriculumService.updateCurriculum(req.params.id, req.body, req.files, req.admin.adminID);
      res.json({ message: "Updated!" });
    } catch (err) { next(err); }
  },

  deleteCurriculum: async (req, res, next) => {
    try {
      await curriculumRepository.delete(req.params.id);
      res.json({ message: "Deleted!" });
    } catch (err) { next(err); }
  }
};

module.exports = curriculumController;