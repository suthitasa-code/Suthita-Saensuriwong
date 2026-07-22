import { useEffect, useState } from 'react';
import { API_BASE, ENDPOINTS, unwrap } from '../config/api';
import AnnouncementSearchSection from '../components/AnnouncementSearchSection';
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

  return (
    <div className="container px-4">
      <div className="header-section">
        <div className="title-group">
          <h1>ประกาศรับสมัคร</h1>
          <p>ข้อมูลการรับสมัครนักศึกษาใหม่ทุกรอบ แยกตามปีการศึกษา</p>
        </div>
        <img src="/images/KU_logo_62x62_th.svg" alt="ตรามหาวิทยาลัยเกษตรศาสตร์" className="header-logo-svg" />
      </div>

      <AnnouncementSearchSection announcements={announcements} loading={loading} />
    </div>
  );
};

export default Announcement;
