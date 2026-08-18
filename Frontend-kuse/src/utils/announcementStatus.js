// ตรรกะเดียวกับฝั่งแอดมิน ให้สถานะตรงกันทุกหน้า
export const getLabelStatus = (item) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const start = new Date(item.openDate); start.setHours(0, 0, 0, 0);
  const end = new Date(item.closeDate); end.setHours(0, 0, 0, 0);
  if (isNaN(start) || isNaN(end)) return 'ไม่ระบุวันรับสมัคร';
  if (today < start) return 'รอเปิดรับ';
  if (today <= end) return 'กำลังเปิดรับ';
  return 'ปิดรับแล้ว';
};

export const statusBadgeClass = (label) => {
  if (label === 'กำลังเปิดรับ') return 'status-open';
  if (label === 'รอเปิดรับ') return 'status-waiting';
  if (label === 'ปิดรับแล้ว') return 'status-closed';
  return 'status-none';
};

export const formatDateTh = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return '-';
  return d.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ดึงเลขรอบที่แฝงอยู่ในชื่อ (เช่น "รอบที่ 3 Admission" -> 3) ใช้เรียงลำดับรอบ TCAS ให้เป็น 1 -> 2 -> 3 -> 4
// เสมอ ไม่ว่าแอดมินจะเพิ่มประกาศแต่ละรอบเข้าระบบตามลำดับไหนก็ตาม (ห้ามอิง announcementID/ลำดับที่เพิ่ม)
export const extractRoundNumber = (tcasRound) => {
  const match = (tcasRound || '').match(/\d+/);
  return match ? Number(match[0]) : Infinity;
};
