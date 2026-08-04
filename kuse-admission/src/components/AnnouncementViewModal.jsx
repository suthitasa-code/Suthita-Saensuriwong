import { UPLOAD_URL, getLabelStatus, statusBadge, openImageLightbox } from '../utils/tcasHelpers';
import '../styles/announcementView.css';

// ================================================================
// Modal "ดูรายละเอียดประกาศ" — โหมดดูอย่างเดียว ไม่มีฟอร์มให้แก้ไข
// แยกออกมาจาก ManageTcas.jsx เพราะฟอร์มเพิ่ม/แก้ไขในไฟล์นั้นยาวอยู่แล้ว
// ถ้าอัดโค้ดดูรายละเอียดเข้าไปอีกจะยิ่งอ่านยาก แยกไฟล์ไว้จัดการง่ายกว่า
// ================================================================

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' })
  : '-';

// ใช้กับ createdAt/updatedAt ที่เป็น datetime เต็ม (โชว์ทั้งวันที่และเวลา)
const formatDateTime = (d) => d
  ? new Date(d).toLocaleString('th-TH', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '-';

// รวมชื่อ-นามสกุลแอดมิน ถ้าไม่มีข้อมูล (เช่น บัญชีถูกลบไปแล้ว) ให้ขึ้น "ไม่ทราบชื่อ"
const fullAdminName = (name, lastname) => (name ? `${name} ${lastname || ''}`.trim() : 'ไม่ทราบชื่อ');

// แถวข้อมูล label ซ้าย + value ขวา ใช้ซ้ำหลายจุดในหน้านี้
const DetailRow = ({ label, value }) => (
  <div className="view-detail-row">
    <div className="view-detail-label">{label}</div>
    <div className="view-detail-value">{value || <span className="view-empty">- ไม่ระบุ -</span>}</div>
  </div>
);

// การ์ดแสดงรูปภาพที่แนบมากับประกาศ (คลิกเพื่อดูขนาดเต็ม)
const ImageGroup = ({ label, value }) => {
  if (!value) return null;
  const names = value.split(',').filter(Boolean);
  if (names.length === 0) return null;
  return (
    <div className="view-file-group">
      <div className="view-file-group-label">{label}</div>
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
              <DetailRow label="รอบ TCAS" value={item.tcasRound} />
              <DetailRow label="ปีการศึกษา" value={item.academicYear} />
              <DetailRow label="วันที่เริ่มสมัคร" value={formatDate(item.openDate)} />
              <DetailRow label="วันที่สิ้นสุดสมัคร" value={formatDate(item.closeDate)} />
              <DetailRow label="จำนวนรับ (คน)" value={item.totalQuota} />
              <DetailRow label="ทุนเรียนดี (ทุน)" value={item.totalScholarships} />
            </div>
          </div>

          {/* หมวด 2: รายละเอียดเพิ่มเติม */}
          <div className="tcas-form-section">
            <div className="tcas-form-section-title">
              <span className="tcas-step-num">2</span>รายละเอียดเพิ่มเติม
            </div>
            <DetailRow label="คุณสมบัติผู้สมัคร" value={item.candidateDetail} />
            <DetailRow label="เงื่อนไขการสมัคร" value={item.conditions} />
            <DetailRow label="หมายเหตุ" value={item.notes} />
          </div>

          {/* หมวด 3: ไฟล์แนบ */}
          <div className="tcas-form-section">
            <div className="tcas-form-section-title">
              <span className="tcas-step-num">3</span>ไฟล์แนบประกอบประกาศ
            </div>
            <div className="view-file-groups">
              <ImageGroup label="กำหนดการรับสมัคร" value={item.scheduleImg} />
              <ImageGroup label="สาขาวิชาที่เปิดรับ" value={item.majorTableImg} />
              <ImageGroup label="โปสเตอร์ประชาสัมพันธ์" value={item.posterImg} />
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
              <DetailRow label="สร้างโดย" value={fullAdminName(item.creatorName, item.creatorLastname)} />
              <DetailRow label="วันที่สร้าง" value={formatDateTime(item.createdAt)} />
              {item.updatedAt && (
                <>
                  <DetailRow label="แก้ไขล่าสุดโดย" value={fullAdminName(item.updaterName, item.updaterLastname)} />
                  <DetailRow label="เวลาแก้ไขล่าสุด" value={formatDateTime(item.updatedAt)} />
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
