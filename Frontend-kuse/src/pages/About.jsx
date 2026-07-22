import { useEffect } from 'react';
import '../styles/about.css';

const ADVISORS = [
  {
    role: 'อาจารย์ที่ปรึกษาหลัก',
    name: 'ผศ. วไลลักษณ์ วงษ์รื่น',
    badgeClass: 'about-advisor-badge-primary',
  },
  {
    role: 'อาจารย์ที่ปรึกษาร่วม',
    name: 'ผศ.ดร. ศศิธร สุชัยยะ',
    badgeClass: 'about-advisor-badge-secondary',
  },
];

const About = () => {
  // เอฟเฟกต์ fade-in ทีละส่วนตอนเลื่อนจอลงมาเจอ
  useEffect(() => {
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
  }, []);

  return (
    <div className="about-page">
      <header className="about-hero">
        <div className="about-avatar-ring">
          <i className="fas fa-user"></i>
        </div>
        <h1 className="about-hero-name">น.ส.สุธิตา แสนสุริวงค์</h1>
        <p className="about-hero-role">นิสิตหลักสูตรวิทยาศาสตรบัณฑิต (วท.บ.) สาขาวิทยาการคอมพิวเตอร์</p>
        <p className="about-hero-tagline">ผู้พัฒนาเว็บแอปพลิเคชันนี้</p>
      </header>

      <div className="container px-4 about-content">
        <section className="about-section reveal-on-scroll">
          <h2 className="about-section-header">
            <span className="about-header-icon"><i className="fas fa-diagram-project"></i></span>
            เกี่ยวกับโครงงานนี้
          </h2>
          <div className="about-project-card">
            <div className="about-project-name">
              เว็บแอปพลิเคชันให้ข้อมูลการรับเข้าศึกษาในคณะวิทยาศาสตร์และวิศวกรรมศาสตร์ มก.ฉกส.
            </div>
            <p className="about-text-block">
              พัฒนาขึ้นเพื่อเป็นช่องทางกลางในการนำเสนอข้อมูลประกาศรับสมัครนักศึกษาใหม่และหลักสูตรต่าง ๆ
              ของคณะวิทยาศาสตร์และวิศวกรรมศาสตร์ ให้ผู้สนใจเข้าถึงข้อมูลได้ง่าย ทันสมัย และใช้งานสะดวก
              พร้อมระบบจัดการข้อมูลหลังบ้านสำหรับเจ้าหน้าที่ดูแลระบบ
            </p>
          </div>
        </section>

        <section className="about-section reveal-on-scroll">
          <h2 className="about-section-header">
            <span className="about-header-icon"><i className="fas fa-chalkboard-user"></i></span>
            อาจารย์ที่ปรึกษาโครงงาน
          </h2>
          <div className="row g-4">
            {ADVISORS.map((advisor) => (
              <div className="col-md-6" key={advisor.name}>
                <div className="about-advisor-card">
                  <div className="about-advisor-avatar">
                    <i className="fas fa-user-tie"></i>
                  </div>
                  <span className={`about-advisor-badge ${advisor.badgeClass}`}>{advisor.role}</span>
                  <div className="about-advisor-name">{advisor.name}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="about-section reveal-on-scroll">
          <div className="about-thanks-box">
            <i className="fas fa-heart about-thanks-icon"></i>
            <p className="about-text-block">
              ขอขอบพระคุณอาจารย์ที่ปรึกษาโครงงานทั้งสองท่าน ที่ให้คำแนะนำและช่วยเหลือด้วยดีมาโดยตลอด
              จนโครงงานนี้สำเร็จลุล่วงไปได้ด้วยดี
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
