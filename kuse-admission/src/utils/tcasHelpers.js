import Swal from './swal';

// ================================================================
// รวมฟังก์ชัน/ค่าคงที่ที่ใช้ร่วมกันระหว่างหน้า "จัดการประกาศรับสมัคร"
// (ManageTcas.jsx) กับ modal "ดูรายละเอียดประกาศ" (AnnouncementViewModal.jsx)
// แยกออกมาไว้ที่นี่ที่เดียว กันโค้ดซ้ำ 2 ที่
// ================================================================

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const UPLOAD_URL = `${API_BASE}/uploads/announcements`;

// ลิงก์ปุ่ม "สมัครออนไลน์" ที่ใช้เป็นค่าเริ่มต้นเมื่อประกาศนั้นไม่ได้ตั้ง applyLink ไว้เอง
// (ต้องตรงกับ fallback ที่ Frontend-kuse/src/pages/AnnouncementDetail.jsx ใช้จริง)
export const DEFAULT_APPLY_LINK = 'https://misreg.csc.ku.ac.th/admission/';

// เช็คว่าประกาศแต่ละอันตอนนี้ "เปิดรับ / รอเปิด / ปิดแล้ว" โดยเทียบวันที่ปัจจุบันกับ
// วันเปิด-ปิดรับสมัครที่แอดมินกรอกไว้ (ไม่ได้ให้แอดมินมากดปิดเอง ระบบคำนวณให้อัตโนมัติ)
export const getLabelStatus = (item) => {
  if (item.labelStatus) return item.labelStatus;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const start = new Date(item.openDate); start.setHours(0, 0, 0, 0);
  const end = new Date(item.closeDate); end.setHours(0, 0, 0, 0);
  if (isNaN(start) || isNaN(end)) return 'ไม่ระบุวันรับสมัคร';
  if (today < start) return 'รอเปิดรับ';
  if (today <= end) return 'กำลังเปิดรับ';
  return 'ปิดรับแล้ว';
};

export const statusBadge = (label) => {
  if (label === 'กำลังเปิดรับ') return 'badge-open';
  if (label === 'รอเปิดรับ') return 'badge-wait';
  if (label === 'ปิดรับแล้ว') return 'badge-closed';
  return 'badge-none';
};

// เปิดรูปแบบเต็มขนาดให้ดูว่าไฟล์ที่เลือก/อัปโหลดไปคือรูปอะไร
export const openImageLightbox = (url, label) => {
  Swal.fire({
    imageUrl: url,
    imageAlt: label || 'ตัวอย่างรูปภาพ',
    title: label || '',
    showConfirmButton: false,
    showCloseButton: true,
    background: 'transparent',
    customClass: { popup: 'kuse-lightbox-popup', title: 'kuse-lightbox-title' },
  });
};
