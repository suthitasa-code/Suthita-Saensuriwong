import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import '../styles/layout.css';

const NAV_ITEMS = [
  { path: '/', label: 'หน้าหลัก' },
  { path: '/announcement', label: 'ประกาศรับสมัคร' },
  { path: '/curriculum', label: 'หลักสูตร' },
  { path: '/about', label: 'เกี่ยวกับฉัน' },
  { path: '/contact', label: 'ติดต่อเรา' },
];

const PublicLayout = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // หน้ารายละเอียด (เช่น /curriculum/CS หรือ /announcement/12) ให้เมนู "หลักสูตร"/"ประกาศรับสมัคร" ยัง active อยู่ด้วย
  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  // ปิดเมนูมือถืออัตโนมัติทุกครั้งที่เปลี่ยนหน้า
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            <img src="/images/KUSE_Logo_2021.png" alt="KUSE Logo" />
            <div className="brand-text-content">
              <span className="brand-text-top">KUSE Admission</span>
              <span className="brand-text-bottom">
                มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร
              </span>
            </div>
          </Link>

          <button
            type="button"
            className="nav-toggle-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="เปิด/ปิดเมนู"
          >
            <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>

          <ul className={`navbar-nav align-items-center flex-row gap-2${menuOpen ? ' nav-menu-open' : ''}`}>
            {NAV_ITEMS.map((item) => (
              <li className="nav-item" key={item.path}>
                <Link
                  className={`nav-link${isActive(item.path) ? ' active' : ''}`}
                  to={item.path}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <Outlet />

      <footer className="site-footer">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 mb-4 mb-lg-0">
              <h2 className="footer-title-gold">KUSE Admission</h2>
              <p className="footer-text-white">ระบบข้อมูลการรับเข้าศึกษา</p>
              <p className="footer-text-white">คณะวิทยาศาสตร์และวิศวกรรมศาสตร์</p>
              <p className="footer-text-white">มหาวิทยาลัยเกษตรศาสตร์</p>
              <p className="footer-text-white">วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร</p>
            </div>
            <div className="col-lg-3 col-md-4 mb-4 mb-lg-0">
              <h3 className="footer-heading">ติดต่อเรา</h3>
              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>
                  59/5 ถนน วปรอ.66 หมู่ 1 ตำบลเชียงเครือ อำเภอเมืองสกลนคร
                  จังหวัดสกลนคร, Sakhon Nakhon, Thailand, 47000
                </span>
              </div>
              <div className="contact-item">
                <i className="fas fa-phone-alt"></i>
                <span>0 4272 5033, 08 1739 1541</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <span>admission@ku.ac.th</span>
              </div>
            </div>
            <div className="col-lg-3 col-md-4 mb-4 mb-lg-0">
              <h3 className="footer-heading">ลิงก์ด่วน</h3>
              <a
                className="footer-quick-link"
                href="https://misreg.csc.ku.ac.th/admission/"
                target="_blank"
                rel="noreferrer"
              >
                <i className="fas fa-arrow-up-right-from-square"></i>
                ระบบรับสมัครนิสิตใหม่
              </a>
              <a
                className="footer-quick-link"
                href="https://kuse.csc.ku.ac.th/"
                target="_blank"
                rel="noreferrer"
              >
                <i className="fas fa-arrow-up-right-from-square"></i>
                เว็บไซต์คณะ
              </a>
            </div>
            <div className="col-lg-2 col-md-4">
              <h3 className="footer-heading">ติดตามเราได้ที่</h3>
              <div className="social-links">
                <a href="https://www.facebook.com/share/19Adbow8nC/" target="_blank" rel="noreferrer">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="https://www.instagram.com/admission_kuse/" target="_blank" rel="noreferrer">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="https://www.tiktok.com/@admission_kuse" target="_blank" rel="noreferrer">
                  <i className="fab fa-tiktok"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom-line text-center">
            <small className="opacity-50">© {new Date().getFullYear() + 543} KUSE Kasetsart University. All rights reserved.</small>
          </div>
        </div>
      </footer>
    </>
  );
};

export default PublicLayout;
