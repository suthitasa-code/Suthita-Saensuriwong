import { useEffect } from 'react';
import '../styles/about.css';

// ทีมโครงงานทั้งหมด 3 คน จัดเรียงในแถวเดียวกัน สไตล์รูปวงแหวนแบบเดียวกันทุกคน
// (มีสุธิตาคนเดียวที่มีรูปจริง อาจารย์อีก 2 ท่านใช้ไอคอนแทนแต่ทรงเดียวกัน)
const TEAM = [
  {
    key: 'student',
    role: 'ผู้จัดทำโครงงาน',
    name: 'น.ส.สุธิตา แสนสุริวงค์',
    photo: '/images/สุธิตา.jpg',
    tags: [
      { icon: 'fas fa-graduation-cap', label: 'นิสิตหลักสูตรวิทยาศาสตรบัณฑิต (วท.บ.)', variant: 'degree' },
      { icon: 'fas fa-laptop-code', label: 'สาขาวิทยาการคอมพิวเตอร์', variant: 'major' },
    ],
  },
  {
    key: 'advisor-main',
    role: 'อาจารย์ที่ปรึกษาหลัก',
    name: 'ผศ. วไลลักษณ์ วงษ์รื่น',
  },
  {
    key: 'advisor-co',
    role: 'อาจารย์ที่ปรึกษาร่วม',
    name: 'ผศ.ดร. ศศิธร สุชัยยะ',
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
    <div className="container px-4 about-page">
      <div className="about-page-header">
        <h1>เกี่ยวกับ</h1>
        <p>เว็บแอปพลิเคชันให้ข้อมูลการรับเข้าศึกษาในคณะวิทยาศาสตร์และวิศวกรรมศาสตร์ มก.ฉกส.</p>
      </div>

      <div className="about-team-section reveal-on-scroll">
        <div className="about-team-row">
          {TEAM.map((person) => (
            <div className="about-team-card" key={person.key}>
              <div className="about-photo-ring">
                <div className="about-photo-ring-inner">
                  <div className="about-person-photo">
                    {person.photo
                      ? <img src={person.photo} alt={person.name} />
                      : <i className="fas fa-user-tie"></i>}
                  </div>
                </div>
              </div>
              <div className="about-person-role">{person.role}</div>
              <div className="about-person-name">{person.name}</div>
              {person.tags && (
                <div className="about-student-tags">
                  {person.tags.map((tag) => (
                    <span className={`about-tag about-tag-${tag.variant}`} key={tag.label}>
                      <i className={tag.icon}></i>{tag.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <section className="about-section reveal-on-scroll">
        <h2 className="about-section-title"><i className="fas fa-diagram-project"></i>เกี่ยวกับโครงงานนี้</h2>
        <div className="about-plain-card">
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
        <div className="about-plain-card about-thanks-card">
          <i className="fas fa-quote-left about-thanks-quote-icon"></i>
          <p className="about-text-block">
            ขอขอบพระคุณอาจารย์ที่ปรึกษาโครงงานทั้งสองท่าน ที่ให้คำแนะนำและช่วยเหลือด้วยดีมาโดยตลอด
            จนโครงงานนี้สำเร็จลุล่วงไปได้ด้วยดี
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
