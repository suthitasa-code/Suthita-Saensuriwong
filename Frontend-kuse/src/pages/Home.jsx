import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE, ENDPOINTS, unwrap } from '../config/api';
import HeroCarousel from '../components/HeroCarousel';
import AnnouncementCard from '../components/AnnouncementCard';
import AnnouncementFilterCard from '../components/AnnouncementFilterCard';
import { useAnnouncementFilters } from '../hooks/useAnnouncementFilters';
import '../styles/home.css';

const Home = () => {
  const [banners, setBanners] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [bannerRes, announcementRes] = await Promise.all([
          fetch(`${API_BASE}${ENDPOINTS.banners}?pageTarget=home`),
          fetch(`${API_BASE}${ENDPOINTS.announcements}`),
        ]);
        const bannerJson = await bannerRes.json();
        const announcementJson = await announcementRes.json();
        if (cancelled) return;
        setBanners(unwrap(bannerJson));
        setAnnouncements(unwrap(announcementJson));
      } catch (err) {
        console.error('โหลดข้อมูลหน้าแรกไม่สำเร็จ:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  // ประกาศรับสมัคร 4 รอบล่าสุด เรียงจากใหม่ไปเก่าตามลำดับที่เพิ่มเข้าระบบ
  const latestAnnouncements = useMemo(
    () => [...announcements]
      .sort((a, b) => (b.announcementID || 0) - (a.announcementID || 0))
      .slice(0, 4),
    [announcements]
  );

  const filters = useAnnouncementFilters(announcements);
  const { filteredAnnouncements, isFiltering } = filters;

  // ปกติโชว์แค่ 4 รอบล่าสุด แต่ถ้ากำลังค้นหา/กรองอยู่ ให้โชว์ผลลัพธ์ที่ตรงเงื่อนไขทั้งหมดแทน (ไม่จำกัดแค่ 4)
  const displayedAnnouncements = useMemo(() => {
    if (!isFiltering) return latestAnnouncements;
    return [...filteredAnnouncements].sort((a, b) => (b.announcementID || 0) - (a.announcementID || 0));
  }, [isFiltering, filteredAnnouncements, latestAnnouncements]);

  return (
    <>
      {banners.length > 0 && (
        <HeroCarousel banners={banners}>
          <Link to="/announcement" className="btn-kuse btn-kuse-red">
            ดูประกาศรับสมัคร <i className="fas fa-chevron-right"></i>
          </Link>
          <Link to="/curriculum" className="btn-kuse btn-kuse-dark">
            ดูข้อมูลหลักสูตร <i className="fas fa-chevron-right"></i>
          </Link>
        </HeroCarousel>
      )}

      <div className="container px-4">
        <div className="section-title">
          <h2>ประกาศรับสมัครล่าสุด</h2>
          <p>อัปเดตรอบรับสมัครนักศึกษาใหม่ล่าสุดของคณะวิทยาศาสตร์และวิศวกรรมศาสตร์</p>
        </div>

        <AnnouncementFilterCard {...filters} />

        {loading && <div className="home-loading">กำลังโหลดข้อมูลประกาศ...</div>}

        {!loading && displayedAnnouncements.length === 0 && (
          <div className="home-empty">
            {announcements.length === 0
              ? 'ยังไม่มีประกาศรับสมัครในระบบ'
              : 'ไม่พบข้อมูลที่ค้นหา กรุณาลองค้นหาใหม่อีกครั้ง'}
          </div>
        )}

        {!loading && displayedAnnouncements.length > 0 && (
          <>
            <div className="row g-4 mb-4">
              {displayedAnnouncements.map((item) => (
                <div className="col-md-6 col-lg-3" key={item.announcementID}>
                  <AnnouncementCard item={item} />
                </div>
              ))}
            </div>
            <div className="text-center mb-5">
              <Link to="/announcement" className="btn-view-all">
                ดูประกาศทั้งหมด <i className="fas fa-arrow-right ms-1"></i>
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Home;
