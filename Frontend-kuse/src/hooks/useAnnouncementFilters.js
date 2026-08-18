import { useMemo, useState } from 'react';
import { getLabelStatus, extractRoundNumber } from '../utils/announcementStatus';

const STATUS_KEY = {
  กำลังเปิดรับ: 'open',
  รอเปิดรับ: 'waiting',
  ปิดรับแล้ว: 'closed',
};

// ตรรกะค้นหา+กรองข้อมูลประกาศ ใช้ร่วมกันทั้งหน้าแรก (กรองการ์ดล่าสุด) และหน้าประกาศรับสมัครทั้งหมด (กรองแบบจัดกลุ่มปี)
export const useAnnouncementFilters = (announcements) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [roundFilter, setRoundFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const yearOptions = useMemo(
    () => [...new Set(announcements.map((a) => a.academicYear).filter(Boolean))].sort((a, b) => b - a),
    [announcements]
  );

  // เรียงตามเลขรอบที่แฝงอยู่ในชื่อ (เช่น "รอบที่ 1 Portfolio" -> 1) ไม่ใช่เรียงตามตัวอักษร
  // กันเคสที่ฐานข้อมูลคืนลำดับ 3,1,4,2 มา ให้ dropdown โชว์ 1 -> 2 -> 3 -> 4 เสมอ
  const roundOptions = useMemo(
    () => [...new Set(announcements.map((a) => a.tcasRound).filter(Boolean))]
      .sort((a, b) => extractRoundNumber(a) - extractRoundNumber(b) || a.localeCompare(b, 'th')),
    [announcements]
  );

  const isFiltering = Boolean(searchQuery) || yearFilter !== 'all' || roundFilter !== 'all' || statusFilter !== 'all';

  const filteredAnnouncements = useMemo(() => {
    // ตัดช่องว่างออกก่อนเทียบ เพื่อให้พิมพ์ "TCAS1" หรือ "รอบที่1" ติดกันแบบไม่มีเว้นวรรค
    // ก็ยังค้นเจอ "TCAS 1" / "รอบที่ 1" ในข้อมูลจริงได้
    const normalize = (s) => (s || '').toLowerCase().replace(/\s+/g, '');
    const q = normalize(searchQuery);
    return announcements.filter((item) => {
      const haystack = normalize(`${item.title || ''} ${item.tcasRound || ''}`);
      const matchSearch = !q || haystack.includes(q);
      const matchYear = yearFilter === 'all' || String(item.academicYear) === yearFilter;
      const matchRound = roundFilter === 'all' || item.tcasRound === roundFilter;
      const matchStatus = statusFilter === 'all' || STATUS_KEY[getLabelStatus(item)] === statusFilter;
      return matchSearch && matchYear && matchRound && matchStatus;
    });
  }, [announcements, searchQuery, yearFilter, roundFilter, statusFilter]);

  return {
    searchQuery, setSearchQuery,
    yearFilter, setYearFilter,
    roundFilter, setRoundFilter,
    statusFilter, setStatusFilter,
    yearOptions, roundOptions,
    filteredAnnouncements, isFiltering,
  };
};
