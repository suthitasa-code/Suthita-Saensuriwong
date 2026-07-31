const express = require("express");
const cors = require("cors");
const path = require("path"); 
const adminRoutes = require("./features/admin/admin.routes");
const carouselbannerRoutes = require("./features/carouselbanner/carouselbanner.routes"); 
const curriculumRoutes = require("./features/curriculum/curriculum.routes"); 
const documentRoutes = require("./features/document/document.routes"); 
const announcementRoutes = require("./features/announcement/announcement.routes");
const lookupRoutes = require("./features/lookup/lookup.routes");

const { testConnection } = require("./config/db");
const { success } = require("./config/utils/response"); 
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.set('json spaces', 2); 

// 🌟 รับ 2 ฝั่ง: หลังบ้านแอดมิน (5173) และเว็บฝั่งผู้ใช้งานทั่วไป (5174)
// ปรับ/เพิ่มพอร์ตได้ผ่าน .env ด้วย CLIENT_URL="http://a.com,http://b.com"
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173,http://localhost:5174")
  .split(",")
  .map((url) => url.trim());

app.use(cors({
  origin: allowedOrigins
}));
app.use(express.json());

// --- การเปิดให้เข้าถึงไฟล์รูปภาพและเอกสาร ---
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.get("/api/health", (req, res) => {
  return success(res, "Server is running");
});

app.get("/api/db-health", async (req, res, next) => {
  try {
    await testConnection();
    return success(res, "Database connection is working");
  } catch (error) {
    return next(error);
  }
});

// ---  เปิดประตูกล่องสัญญาณเชื่อมต่อ Routes เข้ากับ URL ---
app.use("/api/admins", adminRoutes);
app.use("/api/carouselbanner", carouselbannerRoutes); 
app.use("/api/curriculum", curriculumRoutes); 
app.use("/api/document", documentRoutes); 
app.use("/api/announcement", announcementRoutes);
app.use("/api/lookups", lookupRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;