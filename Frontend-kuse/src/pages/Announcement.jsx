import { useEffect, useMemo, useState } from 'react';
import { API_BASE, ENDPOINTS, unwrap } from '../config/api';
import AnnouncementCard from '../components/AnnouncementCard';
import { getLabelStatus } from '../utils/announcementStatus';
import '../styles/announcement.css';

const STATUS_KEY = {
  กำลังเปิดรับ: 'open',
  รอเปิดรับ: 'waiting',
  ปิดรับแล้ว: 'closed',
};

const Announcement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [roundFilter, setRoundFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const yearOptions = useMemo(
    () => [...new Set(announcements.map((a) => a.academicYear).filter(Boolean))].sort((a, b) => b - a),
    [announcements]
  );

  const roundOptions = useMemo(
    () => [...new Set(announcements.map((a) => a.tcasRound).filter(Boolean))],
    [announcements]
  );

  // ปีการศึกษาล่าสุด อิงจากข้อมูลทั้งหมด (ไม่ใช่ผลที่ถูกกรองแล้ว) เพื่อให้ป้าย "ล่าสุด" คงที่เสมอ
  const latestYear = yearOptions[0];

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

  // จัดกลุ่มประกาศตามปีการศึกษา เรียงปีล่าสุดขึ้นก่อน แล้วเรียงรอบ TCAS จากใหม่ไปเก่าในแต่ละปี (4 การ์ดต่อแถวต่อปี)
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
        items: groups[year].sort((a, b) => (b.announcementID || 0) - (a.announcementID || 0)),
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

      <div className="filter-card">
        <div className="filter-label"><i className="fas fa-search me-2"></i> ค้นหาและกรองข้อมูล</div>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="small text-muted mb-1">ค้นหาชื่อประกาศ (TCAS, Portfolio, ฯลฯ)</label>
            <input
              type="text"
              className="form-control"
              placeholder="พิมพ์เพื่อค้นหา..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <label className="small text-muted mb-1">ปีการศึกษา</label>
            <select className="form-select" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
              <option value="all">ทั้งหมด</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="small text-muted mb-1">รอบ TCAS</label>
            <select className="form-select" value={roundFilter} onChange={(e) => setRoundFilter(e.target.value)}>
              <option value="all">ทั้งหมด</option>
              {roundOptions.map((round) => (
                <option key={round} value={round}>{round}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="small text-muted mb-1">สถานะ</label>
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">ทั้งหมด</option>
              <option value="open">กำลังเปิดรับ</option>
              <option value="waiting">รอเปิดรับ</option>
              <option value="closed">ปิดรับแล้ว</option>
            </select>
          </div>
        </div>
      </div>

      {loading && <div className="announcement-loading">กำลังโหลดข้อมูลประกาศ...</div>}

      {!loading && groupedByYear.length === 0 && (
        <div className="announcement-empty">
          {announcements.length === 0
            ? 'ยังไม่มีประกาศรับสมัครในระบบค่ะ'
            : 'ไม่พบข้อมูลที่ค้นหา ลองค้นหาใหม่อีกครั้งนะคะ'}
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
