import '../styles/contact.css';

const About = () => (
  <div className="container px-4">
    <div className="page-header-section">
      <div className="title-group">
        <h1>เกี่ยวกับฉัน</h1>
        <p>ผู้พัฒนาเว็บแอปพลิเคชันนี้</p>
      </div>
      <img src="/images/KU_logo_62x62_th.svg" alt="ตรามหาวิทยาลัยเกษตรศาสตร์" className="page-header-logo" />
    </div>

    <div className="row justify-content-center contact-cards-row">
      <div className="col-lg-8">
        <div className="contact-card text-center">
          <i className="fas fa-user-circle fa-3x mb-3" style={{ color: 'var(--gold)' }}></i>
          <div className="contact-card-title">ข้อมูลกำลังจัดเตรียม</div>
          <div className="contact-card-subtitle" style={{ border: 'none', paddingBottom: 0 }}>
            เนื้อหาหน้านี้จะเพิ่มเติมในภายหลังค่ะ
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default About;
