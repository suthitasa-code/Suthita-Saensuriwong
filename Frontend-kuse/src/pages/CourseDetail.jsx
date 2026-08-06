import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE, ENDPOINTS, unwrap, fileUrl } from '../config/api';
import CURRICULUM_SOCIAL_LINKS from '../config/curriculumSocialLinks';
import '../styles/courseDetail.css';

// แตกข้อความหลายบรรทัดในฟอร์มแอดมิน (กด Enter คั่นแต่ละหัวข้อ) ให้เป็นรายการ
// ถ้าแอดมินพิมพ์รวดเดียวไม่ขึ้นบรรทัดใหม่ ก็จะได้รายการเดียว แสดงเป็นย่อหน้าปกติ
const splitLines = (text) =>
  (text || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

// ชื่อไฟล์ที่อัปโหลดจะอยู่ในรูปแบบ pdfFiles-<timestamp>-<random>.pdf เราดึงเวลาที่แนบมา
// ในชื่อไฟล์ออกมาเทียบหาไฟล์ที่อัปโหลดล่าสุดให้เอง (ใช้แค่จัดลำดับ/ติดป้าย ไม่โชว์วันที่)
const parsePdfTimestamp = (filename) => {
  const match = (filename || '').match(/-(\d{10,})-/);
  return match ? Number(match[1]) : null;
};

// ดาวน์โหลดไฟล์ข้ามโดเมน (frontend / API คนละพอร์ตกัน) ต้องดึงมาเป็น blob ก่อน
// เพราะ attribute download เฉยๆ ใช้ไม่ได้กับลิงก์ข้ามโดเมน เบราว์เซอร์จะเปิดไฟล์แทนการดาวน์โหลด
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

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [shopLightboxOpen, setShopLightboxOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setCourse(null);

    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}${ENDPOINTS.curriculums}/${id}`);
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok || json.success === false) {
          setNotFound(true);
        } else {
          setCourse(unwrap(json));
        }
      } catch (err) {
        console.error('โหลดข้อมูลหลักสูตรไม่สำเร็จ:', err);
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [id]);

  const whatWeLearnItems = useMemo(() => splitLines(course?.whatWeLearn), [course]);
  const insideItems = useMemo(() => splitLines(course?.insideKuse), [course]);
  const careerPrivateItems = useMemo(() => splitLines(course?.careerPrivate), [course]);
  const careerGovItems = useMemo(() => splitLines(course?.careerGovernment), [course]);
  const pdfList = useMemo(() => {
    const names = (course?.pdfFiles || '').split(',').map((f) => f.trim()).filter(Boolean);
    const withMeta = names.map((filename) => ({ filename, timestamp: parsePdfTimestamp(filename) }));
    const latestTimestamp = Math.max(0, ...withMeta.map((f) => f.timestamp || 0));
    return withMeta
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .map((f) => ({ ...f, isLatest: withMeta.length > 1 && f.timestamp === latestTimestamp && f.timestamp !== null }));
  }, [course]);

  // เอฟเฟกต์ fade-in ทีละส่วนตอนเลื่อนจอลงมาเจอ (สังเกตด้วย IntersectionObserver)
  useEffect(() => {
    if (!course) return undefined;
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
  }, [course]);

  if (loading) {
    return (
      <div className="course-detail-loading">
        <div className="spinner-ring"></div>
        <p>กำลังโหลดข้อมูลหลักสูตร...</p>
      </div>
    );
  }

  if (notFound || !course) {
    return (
      <div className="container px-4 py-5 text-center course-detail-notfound">
        <i className="fas fa-triangle-exclamation fa-3x mb-3"></i>
        <h3>ไม่พบข้อมูลหลักสูตรนี้ค่ะ</h3>
        <Link to="/curriculum" className="btn-back-course mt-3">
          <i className="fas fa-chevron-left me-2"></i>กลับไปหน้าหลักสูตร
        </Link>
      </div>
    );
  }

  const coverUrl = course.Images ? fileUrl(`curriculum/images/${course.Images}`) : '';
  const shopUrl = course.shopPhoto ? fileUrl(`curriculum/images/${course.shopPhoto}`) : '';
  const hasCareerSection = Boolean(course.jobOpportunities) || careerPrivateItems.length > 0 || careerGovItems.length > 0;
  const socialLinks = CURRICULUM_SOCIAL_LINKS[course.deptNameTH] || [];

  return (
    <>
      <header
        className="course-hero"
        style={coverUrl ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.68)), url(${coverUrl})` } : undefined}
      >
        <Link to="/curriculum" className="course-back-btn">
          <i className="fas fa-chevron-left me-2"></i>กลับไปหน้าหลักสูตร
        </Link>
        <div className="container">
          <div className="course-hero-icon">
            <i className={course.icon || 'fas fa-graduation-cap'}></i>
          </div>
          <h1 className="course-hero-title">{course.curriculumName || 'ไม่ระบุชื่อหลักสูตร'}</h1>
          {course.deptNameTH && <h2 className="course-hero-dept">{course.deptNameTH}</h2>}
          {course.curriculumNameEN && <p className="course-hero-en">{course.curriculumNameEN}</p>}
          <div className="course-hero-badges">
            {course.degreeLevel && <span className="course-badge">{course.degreeLevel}</span>}
            {course.curriculumType && <span className="course-badge course-badge-gold">{course.curriculumType}</span>}
          </div>
        </div>
      </header>

      <nav className="course-subnav">
        <div className="container course-subnav-inner">
          {course.highlights && <a href="#highlights">จุดเด่น</a>}
          {whatWeLearnItems.length > 0 && <a href="#learn">เราเรียนอะไร</a>}
          {insideItems.length > 0 && <a href="#inside">INSIDE</a>}
          {hasCareerSection && <a href="#career">เส้นทางอาชีพ</a>}
          {shopUrl && <a href="#shop">เสื้อช็อป</a>}
          {pdfList.length > 0 && <a href="#docs">เอกสารหลักสูตร</a>}
          {socialLinks.length > 0 && <a href="#follow">ติดตามหลักสูตร</a>}
        </div>
      </nav>

      <div className="container px-4 section-padding">
        {course.highlights && (
          <section id="highlights" className="course-section reveal-on-scroll">
            <h3 className="course-sub-title"><i className="fas fa-star me-2"></i>จุดเด่นของหลักสูตร</h3>
            <p className="course-highlight-text">{course.highlights}</p>
          </section>
        )}

        {whatWeLearnItems.length > 0 && (
          <section id="learn" className="course-section reveal-on-scroll">
            <h3 className="course-sub-title"><i className="fas fa-book-open me-2"></i>เราเรียนอะไรกันบ้าง?</h3>
            <div className="row g-3">
              {whatWeLearnItems.map((item, i) => (
                <div className="col-md-6" key={item}>
                  <div className="course-content-box" style={{ transitionDelay: `${i * 60}ms` }}>
                    <i className="fas fa-circle-check"></i>
                    <span>{item}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {insideItems.length > 0 && (
          <section id="inside" className="course-section reveal-on-scroll">
            <h3 className="course-sub-title">
              <i className="fas fa-magnifying-glass me-2"></i>
              INSIDE {(course.curriculumName || '').toUpperCase()} ที่ มก.ฉกส.
            </h3>
            <div className="course-inside-list">
              {insideItems.map((item) => (
                <p key={item}><i className="fas fa-check-circle"></i>{item}</p>
              ))}
            </div>
          </section>
        )}

        {hasCareerSection && (
          <section id="career" className="course-section reveal-on-scroll">
            <h3 className="course-sub-title course-sub-title-center">
              <i className="fas fa-road me-2"></i>เส้นทางอาชีพในอนาคต
            </h3>
            {course.jobOpportunities && <p className="course-highlight-text mb-4">{course.jobOpportunities}</p>}
            <div className="row g-4">
              {careerPrivateItems.length > 0 && (
                <div className="col-md-6">
                  <h4 className="course-career-header course-career-header-private">
                    <i className="fas fa-briefcase"></i>สายงานเอกชน
                  </h4>
                  {careerPrivateItems.map((item) => (
                    <div className="course-career-card" key={item}>{item}</div>
                  ))}
                </div>
              )}
              {careerGovItems.length > 0 && (
                <div className="col-md-6">
                  <h4 className="course-career-header course-career-header-gov">
                    <i className="fas fa-landmark"></i>สายงานราชการ/รัฐวิสาหกิจ
                  </h4>
                  {careerGovItems.map((item) => (
                    <div className="course-career-card" key={item}>{item}</div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {shopUrl && (
          <section id="shop" className="course-section reveal-on-scroll text-center">
            <h3 className="course-sub-title course-sub-title-center"><i className="fas fa-shirt me-2"></i>เสื้อช็อปประจำสาขา</h3>
            <button
              type="button"
              className="course-shop-frame"
              onClick={() => setShopLightboxOpen(true)}
              title="คลิกเพื่อดูรูปขนาดเต็ม"
            >
              <img src={shopUrl} alt={`เสื้อช็อปประจำสาขา ${course.curriculumName || ''}`} />
              <span className="course-shop-zoom-hint"><i className="fas fa-magnifying-glass-plus me-2"></i>ดูรูปขนาดเต็ม</span>
            </button>
          </section>
        )}

        {pdfList.length > 0 && (
          <section id="docs" className="course-section reveal-on-scroll">
            <h3 className="course-sub-title course-sub-title-center"><i className="fas fa-file-lines me-2"></i>เอกสารหลักสูตร</h3>
            <div className="row g-3 justify-content-center">
              {pdfList.map(({ filename, isLatest }, i) => (
                <div className="col-md-6" key={filename}>
                  <a
                    href={fileUrl(`curriculum/documents/${filename}`)}
                    target="_blank"
                    rel="noreferrer"
                    className="course-pdf-card"
                  >
                    <span className="course-pdf-icon"><i className="fas fa-file-pdf"></i></span>
                    <span className="course-pdf-info">
                      <span className="course-pdf-name">
                        เอกสารหลักสูตร{pdfList.length > 1 ? ` ฉบับที่ ${i + 1}` : ''}
                        {isLatest && <span className="course-pdf-latest-badge">ฉบับล่าสุด</span>}
                      </span>
                      <span className="course-pdf-hint">คลิกเพื่อเปิดเอกสาร PDF</span>
                    </span>
                    <span className="course-pdf-arrow"><i className="fas fa-arrow-up-right-from-square"></i></span>
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {socialLinks.length > 0 && (
          <section id="follow" className="course-section reveal-on-scroll">
            <h3 className="course-sub-title course-sub-title-center"><i className="fas fa-heart me-2"></i>ติดตามข่าวสารหลักสูตร</h3>
            <div className="course-social-grid">
              {socialLinks.map((s) => (
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="course-social-card"
                  key={s.url}
                  style={{ '--card-gradient': s.gradient }}
                >
                  <span className="course-social-icon"><i className={s.icon}></i></span>
                  <span className="course-social-info">
                    <span className="course-social-label">{s.label}</span>
                    <span className="course-social-hint">คลิกเพื่อติดตามช่องทางนี้</span>
                  </span>
                  <span className="course-social-arrow"><i className="fas fa-arrow-up-right-from-square"></i></span>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>

      {shopLightboxOpen && (
        <div className="course-lightbox-overlay" onClick={() => setShopLightboxOpen(false)}>
          <div className="course-lightbox-box" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="course-lightbox-close"
              onClick={() => setShopLightboxOpen(false)}
              aria-label="ปิด"
            >
              <i className="fas fa-times"></i>
            </button>
            <img src={shopUrl} alt={`เสื้อช็อปประจำสาขา ${course.curriculumName || ''}`} />
            <button
              type="button"
              className="course-lightbox-download"
              onClick={() => downloadFile(shopUrl, `เสื้อช็อป-${course.curriculumName || course.curriculumID}.jpg`)}
            >
              <i className="fas fa-download me-2"></i>ดาวน์โหลดรูปนี้
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseDetail;
