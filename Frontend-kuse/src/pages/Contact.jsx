import '../styles/contact.css';

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
  </div>
);

export default Contact;
