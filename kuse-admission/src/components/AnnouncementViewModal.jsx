import { UPLOAD_URL, DEFAULT_APPLY_LINK, getLabelStatus, statusBadge, openImageLightbox } from '../utils/tcasHelpers';
import '../styles/announcementView.css';


const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' })
  : '-';

const formatDateTime = (d) => d
  ? new Date(d).toLocaleString('th-TH', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '-';

const fullAdminName = (name, lastname) => (name ? `${name} ${lastname || ''}`.trim() : 'ไม่ทราบชื่อ');

const DetailRow = ({ icon, label, value }) => (
  <div className="view-detail-row">
    <div className="view-detail-label">
      {icon && <i className={`${icon} view-detail-label-icon`}></i>}
      {label}
    </div>
    <div className="view-detail-value">{value || <span className="view-empty">- ไม่ระบุ -</span>}</div>
  </div>
);

const ImageGroup = ({ icon, label, value }) => {
  if (!value) return null;
  const names = value.split(',').filter(Boolean);
  if (names.length === 0) return null;
  return (
    <div className="view-file-group">
      <div className="view-file-group-label">
        {icon && <i className={`${icon} view-detail-label-icon`}></i>}
        {label}
      </div>
      <div className="view-file-thumbs">
        {names.map((n, i) => (
          <img
            key={i}
            src={`${UPLOAD_URL}/${n.trim()}`}
            className="view-file-thumb"
            alt={label}
            title="คลิกเพื่อดูรูปขนาดเต็ม"
            onClick={() => openImageLightbox(`${UPLOAD_URL}/${n.trim()}`, label)}
          />
        ))}
      </div>
    </div>
  );
};

// ชิปลิงก์ไฟล์ PDF ที่แนบมากับประกาศ (เปิดในแท็บใหม่)
const PdfChip = ({ label, value }) => {
  if (!value) return null;
  return (
    <a
      className="view-pdf-chip"
      href={`${UPLOAD_URL}/${value}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <i className="fas fa-file-pdf me-2 text-danger"></i>
      <span>{label}</span>
    </a>
  );
};

export default function AnnouncementViewModal({ item, onClose, onEdit }) {
  if (!item) return null;
  const label = getLabelStatus(item);

  return (
    <div className="tcas-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="tcas-modal-box">
        <div className="modal-head">
          <h5 className="modal-head-title">
            <i className="fas fa-eye me-2"></i>รายละเอียดประกาศรับสมัคร
          </h5>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body-scroll">
          {/* หัวเรื่อง + สถานะ */}
          <div className="view-title-block">
            <h4 className="view-title">{item.title}</h4>
            {item.subtitle && <p className="view-subtitle">{item.subtitle}</p>}
            <span className={`status-badge ${statusBadge(label)}`}>{label}</span>
          </div>

          {/* หมวด 1: ข้อมูลหลัก */}
          <div className="tcas-form-section">
            <div className="tcas-form-section-title">
              <span className="tcas-step-num">1</span>ข้อมูลหลักของประกาศ
            </div>
            <div className="view-detail-grid">
              <DetailRow icon="fas fa-bullhorn" label="รอบ TCAS" value={item.tcasRound} />
              <DetailRow icon="fas fa-calendar-days" label="ปีการศึกษา" value={item.academicYear} />
              <DetailRow icon="fas fa-calendar-check" label="วันที่เริ่มสมัคร" value={formatDate(item.openDate)} />
              <DetailRow icon="fas fa-flag-checkered" label="วันที่สิ้นสุดสมัคร" value={formatDate(item.closeDate)} />
              <DetailRow icon="fas fa-users" label="จำนวนรับ (คน)" value={item.totalQuota} />
              <DetailRow icon="fas fa-award" label="ทุนเรียนดี (ทุน)" value={item.totalScholarships} />
              <DetailRow
                icon="fas fa-link"
                label='ลิงก์ปุ่ม "สมัครออนไลน์" ของประกาศนี้'
                value={
                  <a href={item.applyLink || DEFAULT_APPLY_LINK} target="_blank" rel="noreferrer">
                    {item.applyLink || DEFAULT_APPLY_LINK}
                  </a>
                }
              />
            </div>
          </div>

          {/* หมวด 2: รายละเอียดเพิ่มเติม (ข้อความยาว ให้เต็มความกว้างทีละบล็อก คั่นด้วยเส้นบางๆ) */}
          <div className="tcas-form-section">
            <div className="tcas-form-section-title">
              <span className="tcas-step-num">2</span>รายละเอียดเพิ่มเติม
            </div>
            <div className="view-block-list">
              <DetailRow icon="fas fa-user-check" label="คุณสมบัติผู้สมัคร" value={item.candidateDetail} />
              <DetailRow icon="fas fa-list-check" label="เงื่อนไขการสมัคร" value={item.conditions} />
              <DetailRow icon="fas fa-note-sticky" label="หมายเหตุ" value={item.notes} />
            </div>
          </div>

          {/* หมวด 3: ไฟล์แนบ */}
          <div className="tcas-form-section">
            <div className="tcas-form-section-title">
              <span className="tcas-step-num">3</span>ไฟล์แนบประกอบประกาศ
            </div>
            <div className="view-file-groups">
              <ImageGroup icon="fas fa-calendar-alt" label="กำหนดการรับสมัคร" value={item.scheduleImg} />
              <ImageGroup icon="fas fa-list-ul" label="สาขาวิชาที่เปิดรับ" value={item.majorTableImg} />
              <ImageGroup icon="fas fa-image" label="โปสเตอร์ประชาสัมพันธ์" value={item.posterImg} />
            </div>
            <div className="view-pdf-row">
              <PdfChip label="ประกาศรับสมัคร (PDF)" value={item.announcementPdf} />
              <PdfChip label="คู่มือการสมัคร (PDF)" value={item.manualPdf} />
              {!item.scheduleImg && !item.majorTableImg && !item.posterImg && !item.announcementPdf && !item.manualPdf && (
                <span className="view-empty">- ไม่มีไฟล์แนบ -</span>
              )}
            </div>
          </div>

          {/* หมวด 4: ข้อมูลการสร้าง/แก้ไข (ใครสร้าง เมื่อไหร่ / ใครแก้ไขล่าสุด เมื่อไหร่) */}
          <div className="tcas-form-section">
            <div className="tcas-form-section-title">
              <span className="tcas-step-num">4</span>ข้อมูลการสร้าง/แก้ไข
            </div>
            <div className="view-detail-grid">
              <DetailRow icon="fas fa-user-plus" label="สร้างโดย" value={fullAdminName(item.creatorName, item.creatorLastname)} />
              <DetailRow icon="fas fa-calendar-plus" label="วันที่สร้าง" value={formatDateTime(item.createdAt)} />
              {item.updatedAt && (
                <>
                  <DetailRow icon="fas fa-user-pen" label="แก้ไขล่าสุดโดย" value={fullAdminName(item.updaterName, item.updaterLastname)} />
                  <DetailRow icon="fas fa-clock-rotate-left" label="เวลาแก้ไขล่าสุด" value={formatDateTime(item.updatedAt)} />
                </>
              )}
            </div>
            {!item.updatedAt && (
              <small className="view-empty d-block mt-2">ยังไม่เคยมีการแก้ไขประกาศนี้</small>
            )}
          </div>

          {/* ปุ่มปิด / ไปแก้ไข */}
          <div className="modal-footer-row">
            <button type="button" className="btn-cancel-tcas" onClick={onClose}>
              ปิด
            </button>
            <button type="button" className="btn-add-tcas px-5" onClick={onEdit}>
              <i className="fas fa-edit me-2"></i>แก้ไขประกาศนี้
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
