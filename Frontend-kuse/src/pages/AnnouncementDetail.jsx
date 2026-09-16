import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE, ENDPOINTS, unwrap, fileUrl } from '../config/api';
import { getLabelStatus, statusBadgeClass, formatDateTh } from '../utils/announcementStatus';
import '../styles/announcementDetail.css';

const parseFileList = (val) =>
  (val || '').split(',').map((s) => s.trim()).filter(Boolean);

const downloadFile = async (url, filename) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error('ดาวน์โหลดไฟล์ไม่สำเร็จ:', err);
  }
};

const statusLabelIcon = {
  กำลังเปิดรับ: 'fa-circle-check',
  รอเปิดรับ: 'fa-clock',
  ปิดรับแล้ว: 'fa-lock',
};

// รูปที่คลิกได้ทุกรูปในหน้านี้ (โปสเตอร์/กำหนดการ/สาขาที่เปิดรับ) ใช้ปุ่มซูม+ดาวน์โหลดชุดเดียวกัน
const ClickableImage = ({ src, alt, onZoom, className, style }) => (
  <button type="button" className={`ad-clickable-img ${className || ''}`} style={style} onClick={onZoom} title="คลิกเพื่อดูรูปขนาดเต็ม">
    <img src={src} alt={alt} />
    <span className="ad-zoom-hint"><i className="fas fa-magnifying-glass-plus me-2"></i>ดูรูปขนาดเต็ม</span>
  </button>
);

const AnnouncementDetail = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [posterIndex, setPosterIndex] = useState(0);
  const [posterPaused, setPosterPaused] = useState(false);
  const [lightbox, setLightbox] = useState(null); // { url, downloadName } | null
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setItem(null);
    setPosterIndex(0);

    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}${ENDPOINTS.announcements}/${id}`);
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok || json.success === false) {
          setNotFound(true);
        } else {
          setItem(unwrap(json));
        }
      } catch (err) {
        console.error('โหลดข้อมูลประกาศไม่สำเร็จ:', err);
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [id]);

  const posterList = useMemo(() => parseFileList(item?.posterImg), [item]);
  const scheduleList = useMemo(() => parseFileList(item?.scheduleImg), [item]);
  const majorList = useMemo(() => parseFileList(item?.majorTableImg), [item]);

  // โปสเตอร์เลื่อนเองได้ แต่หยุดชั่วคราวเวลาเอาเมาส์ไปวางเพื่อกดดูรูป/ดาวน์โหลด
  useEffect(() => {
    if (posterList.length <= 1 || posterPaused) return undefined;
    const timer = setInterval(() => {
      setPosterIndex((p) => (p + 1) % posterList.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [posterList.length, posterPaused]);

  useEffect(() => {
    if (!item) return undefined;
    const els = document.querySelectorAll('.reveal-on-scroll');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [item]);

  if (loading) {
    return (
      <div className="ad-loading">
        <div className="ad-spinner"></div>
        <p>กำลังโหลดข้อมูลประกาศ...</p>
      </div>
    );
  }

  if (notFound || !item) {
    return (
      <div className="container px-4 py-5 text-center ad-notfound">
        <i className="fas fa-triangle-exclamation fa-3x mb-3"></i>
        <h3>ไม่พบประกาศนี้</h3>
        <Link to="/announcement" className="ad-back-btn-fallback mt-3">
          <i className="fas fa-chevron-left me-2"></i>กลับไปหน้าประกาศรับสมัคร
        </Link>
      </div>
    );
  }

  const label = getLabelStatus(item);
  const posterUrl = (name) => fileUrl(`announcements/${name}`);
  // แต่ละประกาศกำหนดลิงก์สมัครออนไลน์ของตัวเองได้ (เช่น รอบที่ใช้ mytcas.com แทนระบบของ ม.เกษตรฯ)
  // ถ้าไม่ได้ตั้งไว้ (ส่วนใหญ่) ใช้ลิงก์เริ่มต้นของระบบรับสมัคร ม.เกษตรฯ
  const applyUrl = item.applyLink || 'https://misreg.csc.ku.ac.th/admission/';

  return (
    <div className="ad-page">
      <div className="ad-detail-wrapper">
      <header className="ad-hero">
        <div className="ad-hero-topbar">
          <Link to="/announcement" className="ad-back-link">
            <i className="fas fa-arrow-left me-2"></i>ย้อนกลับ
          </Link>
          <span className={`ad-status-badge ${statusBadgeClass(label)}`}>
            <i className={`fas ${statusLabelIcon[label] || 'fa-circle-info'} me-2`}></i>{label}
          </span>
        </div>

        <div className="ad-hero-inner">
          <h1>{item.title}</h1>
          {(item.subtitle || item.tcasRound || item.academicYear) && (
            <h5>{item.subtitle || [item.tcasRound, item.academicYear && `ปีการศึกษา ${item.academicYear}`].filter(Boolean).join(' · ')}</h5>
          )}

          <div className="ad-info-grid">
            <div className="ad-info-item">
              <span className="ad-info-label"><i className="far fa-calendar-alt me-2"></i>ระยะเวลาการรับสมัคร</span>
              <span className="ad-info-value">{formatDateTh(item.openDate)} – {formatDateTh(item.closeDate)}</span>
            </div>
            {item.totalQuota != null && item.totalQuota !== '' && (
              <div className="ad-info-item">
                <span className="ad-info-label"><i className="fas fa-users me-2"></i>จำนวนรับทั้งหมด</span>
                <span className="ad-info-value">{item.totalQuota} คน</span>
              </div>
            )}
            {item.totalScholarships != null && item.totalScholarships !== '' && (
              <div className="ad-info-item">
                <span className="ad-info-label"><i className="fas fa-graduation-cap me-2"></i>ทุนเรียนดี</span>
                <span className="ad-info-value">{item.totalScholarships} ทุน</span>
              </div>
            )}
          </div>

          <a
            href={applyUrl}
            target="_blank"
            rel="noreferrer"
            className="ad-hero-apply-btn"
          >
            <i className="fas fa-arrow-up-right-from-square me-2"></i>สมัครออนไลน์ที่นี่
          </a>
        </div>
      </header>

      <nav className="ad-subnav">
        <div className="ad-subnav-inner">
          {posterList.length > 0 && <a href="#poster" className={activeTab === 'poster' ? 'ad-subnav-active' : ''} onClick={() => setActiveTab('poster')}>โปสเตอร์</a>}
          {item.candidateDetail && <a href="#candidate" className={activeTab === 'candidate' ? 'ad-subnav-active' : ''} onClick={() => setActiveTab('candidate')}>คุณสมบัติผู้สมัคร</a>}
          {item.conditions && <a href="#conditions" className={activeTab === 'conditions' ? 'ad-subnav-active' : ''} onClick={() => setActiveTab('conditions')}>เงื่อนไขการสมัคร</a>}
          {scheduleList.length > 0 && <a href="#schedule" className={activeTab === 'schedule' ? 'ad-subnav-active' : ''} onClick={() => setActiveTab('schedule')}>กำหนดการ</a>}
          {majorList.length > 0 && <a href="#majors" className={activeTab === 'majors' ? 'ad-subnav-active' : ''} onClick={() => setActiveTab('majors')}>สาขาที่เปิดรับ</a>}
          {item.notes && <a href="#notes" className={activeTab === 'notes' ? 'ad-subnav-active' : ''} onClick={() => setActiveTab('notes')}>หมายเหตุ</a>}
          <a href="#downloads" className={activeTab === 'downloads' ? 'ad-subnav-active' : ''} onClick={() => setActiveTab('downloads')}>เอกสารดาวน์โหลด</a>
        </div>
      </nav>

      <div className="ad-content-padding">
        {posterList.length > 0 && (
          <section id="poster" className="ad-section reveal-on-scroll">
            <div className="ad-poster-carousel">
              <div
                className="ad-poster-frame"
                onMouseEnter={() => setPosterPaused(true)}
                onMouseLeave={() => setPosterPaused(false)}
              >
                {posterList.map((name, i) => (
                  <div className={`ad-poster-slide${i === posterIndex ? ' active' : ''}`} key={name}>
                    <ClickableImage
                      src={posterUrl(name)}
                      alt={`โปสเตอร์ประชาสัมพันธ์ ${item.title} ${i + 1}`}
                      onZoom={() => setLightbox({ url: posterUrl(name), downloadName: `โปสเตอร์-${item.title}-${i + 1}.jpg` })}
                    />
                  </div>
                ))}

                {posterList.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="ad-poster-arrow ad-poster-arrow-prev"
                      onClick={() => setPosterIndex((p) => (p - 1 + posterList.length) % posterList.length)}
                      aria-label="รูปก่อนหน้า"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <button
                      type="button"
                      className="ad-poster-arrow ad-poster-arrow-next"
                      onClick={() => setPosterIndex((p) => (p + 1) % posterList.length)}
                      aria-label="รูปถัดไป"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                    <div className="ad-poster-dots">
                      {posterList.map((name, i) => (
                        <button
                          key={name}
                          type="button"
                          className={i === posterIndex ? 'active' : ''}
                          onClick={() => setPosterIndex(i)}
                          aria-label={`ไปที่รูปที่ ${i + 1}`}
                        ></button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        )}

        {item.candidateDetail && (
          <section id="candidate" className="ad-section reveal-on-scroll">
            <h2 className="ad-section-header"><span className="ad-header-icon"><i className="fas fa-user-graduate"></i></span>คุณสมบัติผู้สมัคร</h2>
            <div className="ad-info-card ad-info-card-gold">
              <p className="ad-text-block">{item.candidateDetail}</p>
            </div>
          </section>
        )}

        {item.conditions && (
          <section id="conditions" className="ad-section reveal-on-scroll">
            <h2 className="ad-section-header"><span className="ad-header-icon"><i className="fas fa-file-signature"></i></span>เงื่อนไขการสมัครเข้าศึกษา</h2>
            <div className="ad-info-card ad-info-card-maroon">
              <p className="ad-text-block">{item.conditions}</p>
            </div>
          </section>
        )}

        {scheduleList.length > 0 && (
          <section id="schedule" className="ad-section reveal-on-scroll">
            <h2 className="ad-section-header"><span className="ad-header-icon"><i className="fas fa-calendar-days"></i></span>กำหนดการรับสมัคร</h2>
            <div className="ad-mini-gallery">
              {scheduleList.map((name, i) => (
                <ClickableImage
                  key={name}
                  className="ad-mini-img"
                  style={{ transitionDelay: `${i * 120}ms` }}
                  src={posterUrl(name)}
                  alt={`กำหนดการรับสมัคร ${i + 1}`}
                  onZoom={() => setLightbox({ url: posterUrl(name), downloadName: `กำหนดการรับสมัคร-${item.title}-${i + 1}.jpg` })}
                />
              ))}
            </div>
          </section>
        )}

        {majorList.length > 0 && (
          <section id="majors" className="ad-section reveal-on-scroll">
            <h2 className="ad-section-header"><span className="ad-header-icon"><i className="fas fa-gear"></i></span>สาขาวิชาที่เปิดรับสมัคร</h2>
            <div className="ad-mini-gallery">
              {majorList.map((name, i) => (
                <ClickableImage
                  key={name}
                  className="ad-mini-img"
                  style={{ transitionDelay: `${i * 120}ms` }}
                  src={posterUrl(name)}
                  alt={`สาขาวิชาที่เปิดรับสมัคร ${i + 1}`}
                  onZoom={() => setLightbox({ url: posterUrl(name), downloadName: `สาขาที่เปิดรับ-${item.title}-${i + 1}.jpg` })}
                />
              ))}
            </div>
          </section>
        )}

        {item.notes && (
          <section id="notes" className="ad-section reveal-on-scroll">
            <div className="ad-note-box">
              <i className="fas fa-thumbtack ad-note-icon-bg"></i>
              <div className="ad-note-title">
                <span className="ad-header-icon ad-header-icon-gold"><i className="fas fa-info-circle"></i></span>
                หมายเหตุ
              </div>
              <p className="ad-text-block ad-note-content">{item.notes}</p>
            </div>
          </section>
        )}

        <section id="downloads" className="ad-section reveal-on-scroll">
          <div className="ad-download-flex">
            <a
              href={applyUrl}
              target="_blank"
              rel="noreferrer"
              className="ad-dl-card ad-dl-card-primary"
            >
              <span className="ad-dl-icon"><i className="fas fa-arrow-up-right-from-square"></i></span>
              <span className="ad-dl-info">
                <span className="ad-dl-title">สมัครออนไลน์ผ่านเว็บไซต์</span>
                <span className="ad-dl-hint">ไปยังระบบรับสมัครของมหาวิทยาลัย</span>
              </span>
            </a>
            {item.manualPdf && (
              <a href={fileUrl(`announcements/${item.manualPdf}`)} target="_blank" rel="noreferrer" className="ad-dl-card ad-dl-card-info">
                <span className="ad-dl-icon"><i className="fas fa-book-open"></i></span>
                <span className="ad-dl-info">
                  <span className="ad-dl-title">คู่มือการสมัคร</span>
                  <span className="ad-dl-hint">ไฟล์ PDF ขั้นตอนการสมัคร</span>
                </span>
              </a>
            )}
            {item.announcementPdf && (
              <a href={fileUrl(`announcements/${item.announcementPdf}`)} target="_blank" rel="noreferrer" className="ad-dl-card ad-dl-card-accent">
                <span className="ad-dl-icon"><i className="fas fa-file-arrow-down"></i></span>
                <span className="ad-dl-info">
                  <span className="ad-dl-title">ดาวน์โหลดประกาศรับสมัคร</span>
                  <span className="ad-dl-hint">ไฟล์ PDF ประกาศฉบับเต็ม</span>
                </span>
              </a>
            )}
          </div>
        </section>
      </div>
      </div>

      {lightbox && (
        <div className="ad-lightbox-overlay" onClick={() => setLightbox(null)}>
          <div className="ad-lightbox-box" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="ad-lightbox-close" onClick={() => setLightbox(null)} aria-label="ปิด">
              <i className="fas fa-times"></i>
            </button>
            <img src={lightbox.url} alt={lightbox.downloadName} />
            <button type="button" className="ad-lightbox-download" onClick={() => downloadFile(lightbox.url, lightbox.downloadName)}>
              <i className="fas fa-download me-2"></i>ดาวน์โหลดรูปนี้
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementDetail;
