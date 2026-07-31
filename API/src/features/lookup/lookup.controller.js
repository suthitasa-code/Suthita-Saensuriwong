const lookupService = require("./lookup.service");
const { success } = require("../../config/utils/response");

// ?active=1 ใช้ตอน dropdown ทั่วไป, ไม่ใส่ query นี้ใช้ตอนหน้าจัดการที่ต้องเห็นของที่ปิดใช้งานด้วย
async function getByCategory(req, res, next) {
  try {
    const activeOnly = req.query.active === "1";
    const options = await lookupService.getByCategory(req.params.category, activeOnly);
    return success(res, "Options fetched successfully", options);
  } catch (error) {
    return next(error);
  }
}

async function createOption(req, res, next) {
  try {
    const option = await lookupService.createOption(req.body);
    return success(res, "Option created successfully", option, 201);
  } catch (error) {
    return next(error);
  }
}

async function updateOption(req, res, next) {
  try {
    const option = await lookupService.updateOption(req.params.id, req.body);
    return success(res, "Option updated successfully", option);
  } catch (error) {
    return next(error);
  }
}

module.exports = { getByCategory, createOption, updateOption };
