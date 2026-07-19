export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const ENDPOINTS = {
  curriculums: '/api/curriculum',
  announcements: '/api/announcement',
  banners: '/api/carouselbanner',
};

// รองรับทั้งรูปแบบ response ที่ห่อด้วย { success, data } และแบบส่ง array/object ตรงๆ
// (endpoint เก่าบางตัวยังไม่ได้ห่อ response ไว้)
export const unwrap = (json) => {
  if (Array.isArray(json)) return json;
  if (json && typeof json === 'object' && 'data' in json) return json.data;
  return json;
};

// relPath = path ต่อจาก /uploads/ เช่น 'admin-images/xxx.jpg', 'curriculum/images/xxx.jpg'
export const fileUrl = (relPath) =>
  relPath ? `${API_BASE}/uploads/${relPath}` : '';
