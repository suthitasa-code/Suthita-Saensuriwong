import { useEffect, useMemo, useState } from 'react';
import { API_BASE, ENDPOINTS, unwrap } from '../config/api';
import AnnouncementCard from '../components/AnnouncementCard';
import AnnouncementFilterCard from '../components/AnnouncementFilterCard';
import { useAnnouncementFilters } from '../hooks/useAnnouncementFilters';
import { extractRoundNumber } from '../utils/announcementStatus';
import '../styles/announcement.css';

const Announcement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}${ENDPOINTS.announcements}`);
        const json = await res.json();
        if (cancelled) return;
        setAnnouncements(unwrap(json));
      } catch (err) {
        console.error('โหลดข้อมูลประกาศรับสมัครไม่สำเร็จ:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const filters = useAnnouncementFilters(announcements);
  const { filteredAnnouncements, yearOptions } = filters;

  // ปีการศึกษาล่าสุด อิงจากข้อมูลทั้งหมด (ไม่ใช่ผลที่ถูกกรองแล้ว) เพื่อให้ป้าย "ล่าสุด" คงที่เสมอ
  const latestYear = yearOptions[0];

  // จัดกลุ่มประกาศตามปีการศึกษา เรียงปีล่าสุดขึ้นก่อน แล้วเรียงรอบ TCAS จากรอบล่าสุดไปเก่าสุด (4 -> 3 -> 2 -> 1)
  // ในแต่ละปี ให้รอบที่เพิ่งเปิดล่าสุด (เลขรอบสูงสุด) เป็นการ์ดแรกเสมอ
  // ยึดตามเลขรอบที่แฝงอยู่ใน tcasRound เสมอ ไม่ใช่ลำดับที่แอดมินกดเพิ่มประกาศเข้าระบบ (announcementID)
  // เพราะถ้าแอดมินเพิ่มรอบ 4 ก่อนรอบ 3 การเรียงตาม ID จะทำให้รอบ 3 (เพิ่มทีหลัง) ดันไปอยู่การ์ดแรกแทนที่จะเป็นรอบ 4
  const groupedByYear = useMemo(() => {
    const groups = {};
    filteredAnnouncements.forEach((item) => {
      const year = item.academicYear || 'ไม่ระบุปี';
      if (!groups[year]) groups[year] = [];
      groups[year].push(item);
    });

    return Object.keys(groups)
      .sort((a, b) => Number(b) - Number(a))
      .map((year) => ({
        year,
        items: groups[year].sort((a, b) => extractRoundNumber(b.tcasRound) - extractRoundNumber(a.tcasRound)),
      }));
  }, [filteredAnnouncements]);

  return (
    <div className="container px-4">
      <div className="header-section">
        <div className="title-group">
          <h1>ประกาศรับสมัคร</h1>
          <p>ข้อมูลการรับสมัครนักศึกษาใหม่ทุกรอบ แยกตามปีการศึกษา</p>
        </div>
        <img src="/images/KU_logo_62x62_th.svg" alt="ตรามหาวิทยาลัยเกษตรศาสตร์" className="header-logo-svg" />
      </div>

      <AnnouncementFilterCard {...filters} />

      {loading && <div className="announcement-loading">กำลังโหลดข้อมูลประกาศ...</div>}

      {!loading && groupedByYear.length === 0 && (
        <div className="announcement-empty">
          {announcements.length === 0
            ? 'ยังไม่มีประกาศรับสมัครในระบบ'
            : 'ไม่พบข้อมูลที่ค้นหา กรุณาลองค้นหาใหม่อีกครั้ง'}
        </div>
      )}

      {!loading && groupedByYear.map(({ year, items }) => (
        <div key={year} className="year-section">
          <h4 className="year-header">
            ปีการศึกษา {year}
            {String(year) === String(latestYear) && <span className="year-latest-tag">ล่าสุด</span>}
          </h4>
          <div className="row g-4 mb-5">
            {items.map((item) => (
              <div className="col-md-6 col-lg-3" key={item.announcementID}>
                <AnnouncementCard item={item} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Announcement;
