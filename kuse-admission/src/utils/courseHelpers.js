// ================================================================
// รวมค่าคงที่/ฟังก์ชันที่ใช้ร่วมกันระหว่างหน้า "จัดการหลักสูตร"
// (Managecourse.jsx) กับ modal "ดูรายละเอียดหลักสูตร" (CourseViewModal.jsx)
// แยกออกมาไว้ที่นี่ที่เดียว กันโค้ดซ้ำ 2 ที่ (แพทเทิร์นเดียวกับ tcasHelpers.js)
// ================================================================

import { API_BASE } from '../config/api';

export { API_BASE };
export const API_URL = `${API_BASE}/api/curriculum`;
export const UPLOAD_URL = `${API_BASE}/uploads`;

// สร้าง URL เต็มของไฟล์ที่อัปโหลดแล้ว (รูป/PDF) จากชื่อไฟล์ที่เก็บใน DB
export const fileUrl = (filename, type) =>
    filename ? `${UPLOAD_URL}/curriculum/${type}/${filename}` : '';

// แปลงระดับการศึกษาเป็นคลาส CSS เพื่อให้ป้ายระดับแต่ละแบบมีโทนสีต่างกัน
export const degreeSlug = (level) => {
    if (level === 'ปริญญาตรี') return 'bachelor';
    if (level === 'ปริญญาโท') return 'master';
    if (level === 'ปริญญาเอก') return 'doctor';
    return 'other';
};
