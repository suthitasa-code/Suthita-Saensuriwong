import '../styles/contact.css';

const SOCIAL_LINKS = [
  {
    key: 'facebook',
    icon: 'fab fa-facebook-f',
    name: 'Facebook',
    handle: 'คณะวิทยาศาสตร์และวิศวกรรมศาสตร์ มก.ฉกส.',
    desc: 'อัปเดตข่าวสาร ประกาศรับสมัคร และกิจกรรมล่าสุดของคณะแบบไว ๆ',
    url: 'https://www.facebook.com/share/19Adbow8nC/',
    gradient: 'linear-gradient(135deg, #1877f2 0%, #0a54c4 100%)',
  },
  {
    key: 'instagram',
    icon: 'fab fa-instagram',
    name: 'Instagram',
    handle: '@admission_kuse',
    desc: 'ภาพบรรยากาศ กิจกรรม และเรื่องราวดี ๆ ของนิสิตในรั้วมหาวิทยาลัย',
    url: 'https://www.instagram.com/admission_kuse/',
    gradient: 'linear-gradient(135deg, #f9ce34 0%, #ee2a7b 55%, #6228d7 100%)',
  },
  {
    key: 'tiktok',
    icon: 'fab fa-tiktok',
    name: 'TikTok',
    handle: '@admission_kuse',
    desc: 'คลิปสั้น เข้าใจง่าย ทันทุกความเคลื่อนไหวเรื่องการรับสมัคร',
    url: 'https://www.tiktok.com/@admission_kuse',
    gradient: 'linear-gradient(135deg, #25f4ee 0%, #1c1c1c 55%, #fe2c55 100%)',
  },
];

const Contact = () => (
  <div className="container px-4">
    <div className="page-header-section">
      <div className="title-group">
        <h1>ติดต่อเรา</h1>
        <p>ช่องทางการติดต่อคณะวิทยาศาสตร์และวิศวกรรมศาสตร์ มก.ฉกส.</p>
      </div>
      <img src="/images/KU_logo_62x62_th.svg" alt="ตรามหาวิทยาลัยเกษตรศาสตร์" className="page-header-logo" />
    </div>

    <div className="row g-4 contact-cards-row">
      <div className="col-lg-6">
        <div className="contact-card">
          <div className="contact-card-title">คณะวิทยาศาสตร์และวิศวกรรมศาสตร์</div>
          <div className="contact-card-subtitle">
            มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร
          </div>

          <div className="contact-row">
            <div className="contact-row-icon"><i className="fas fa-map-marker-alt"></i></div>
            <div className="contact-row-text">
              เลขที่ 59/5 หมู่ 1 ถนน วปรอ. 366 ตำบลเชียงเครือ อำเภอเมือง
              จังหวัดสกลนคร รหัสไปรษณีย์ 47000
            </div>
          </div>
          <div className="contact-row">
            <div className="contact-row-icon"><i className="fas fa-mobile-alt"></i></div>
            <div className="contact-row-text">โทรศัพท์เคลื่อนที่ 08-1739-1541</div>
          </div>
          <div className="contact-row">
            <div className="contact-row-icon"><i className="fas fa-fax"></i></div>
            <div className="contact-row-text">โทรสาร 042-725-034</div>
          </div>
        </div>
      </div>

      <div className="col-lg-6">
        <div className="contact-card">
          <div className="contact-card-title contact-card-title-en">Faculty of Science and Engineering</div>
          <div className="contact-card-subtitle contact-card-title-en">
            Kasetsart University, Chalermphrakiat Sakon Nakhon Province Campus
          </div>

          <div className="contact-row">
            <div className="contact-row-icon"><i className="fas fa-map-marker-alt"></i></div>
            <div className="contact-row-text en-text">
              59/5 Moo1 Chiangkrua Muang Sakon Nakhon 47000. THAILAND
            </div>
          </div>
          <div className="contact-row">
            <div className="contact-row-icon"><i className="fas fa-mobile-alt"></i></div>
            <div className="contact-row-text en-text">Telephone: +668-1739-1541</div>
          </div>
          <div className="contact-row">
            <div className="contact-row-icon"><i className="fas fa-fax"></i></div>
            <div className="contact-row-text en-text">Fax: 042-725-034</div>
          </div>
        </div>
      </div>
    </div>

    <div className="social-follow-section">
      <div className="social-follow-title">
        <h2>ติดตามเราได้ทุกช่องทาง</h2>
        <p>ไม่พลาดทุกข่าวสาร ประกาศรับสมัคร และกิจกรรมของคณะ</p>
      </div>
      <div className="row g-4">
        {SOCIAL_LINKS.map((s) => (
          <div className="col-md-4" key={s.key}>
            <a
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="social-follow-card"
              style={{ '--card-gradient': s.gradient }}
            >
              <span className="social-follow-icon"><i className={s.icon}></i></span>
              <div className="social-follow-name">{s.name}</div>
              <div className="social-follow-handle">{s.handle}</div>
              <p className="social-follow-desc">{s.desc}</p>
              <span className="social-follow-cta">
                ติดตามเลย <i className="fas fa-arrow-up-right-from-square ms-1"></i>
              </span>
            </a>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Contact;
