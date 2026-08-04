import { fileUrl } from '../utils/courseHelpers';
import '../styles/courseView.css';

// ================================================================
// Modal "ดูรายละเอียดหลักสูตร" — โหมดดูอย่างเดียว ไม่มีฟอร์มให้แก้ไข
// แยกออกมาจาก Managecourse.jsx เพราะฟอร์มเพิ่ม/แก้ไขในไฟล์นั้นยาวอยู่แล้ว
// (แพทเทิร์นเดียวกับ AnnouncementViewModal.jsx ของหน้าจัดการประกาศ)
// ================================================================

// ใช้กับ createdAt/updatedAt ที่เป็น datetime เต็ม (โชว์ทั้งวันที่และเวลา)
const formatDateTime = (d) => d
  ? new Date(d).toLocaleString('th-TH', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '-';

// รวมชื่อ-นามสกุลแอดมิน ถ้าไม่มีข้อมูล (เช่น บัญชีถูกลบไปแล้ว) ให้ขึ้น "ไม่ทราบชื่อ"
const fullAdminName = (name, lastname) => (name ? `${name} ${lastname || ''}`.trim() : 'ไม่ทราบชื่อ');

// แถวข้อมูล label ซ้าย + value ขวา ใช้ซ้ำหลายจุดในหน้านี้
const CourseDetailRow = ({ label, value }) => (
  <div className="course-view-row">
    <div className="course-view-label">{label}</div>
    <div className="course-view-value">{value || <span className="course-view-empty">- ไม่ระบุ -</span>}</div>
  </div>
);

export default function CourseViewModal({ course, onClose, onEdit }) {
  if (!course) return null;
  const pdfNames = course.pdfFiles ? course.pdfFiles.split(',').filter(Boolean) : [];

  return (
    <div className="kuse-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="kuse-modal-box">
        <div className="kuse-modal-header">
          <h5 className="m-0">
            <i className="fas fa-eye me-2"></i>รายละเอียดหลักสูตร
          </h5>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>

        <div className="kuse-modal-body">
          {/* ----- แถบรูปภาพด้านบน (แนวนอน แทนคอลัมน์ซ้ายแยกที่เคยเหลือพื้นที่ว่างด้านล่าง) ----- */}
          <div className="course-view-hero">
            <div className="course-view-hero-item course-view-hero-cover">
              <div className="course-view-hero-label">รูปหน้าปก</div>
              {course.Images ? (
                <img src={fileUrl(course.Images, 'images')} alt={course.curriculumName} className="course-view-cover" />
              ) : (
                <div className="course-view-cover-placeholder"><i className="fas fa-image"></i></div>
              )}
            </div>
            <div className="course-view-hero-item course-view-hero-shop">
              <div className="course-view-hero-label">เสื้อช็อปประจำสาขา</div>
              {course.shopPhoto ? (
                <img src={fileUrl(course.shopPhoto, 'images')} alt="เสื้อช็อป" className="course-view-cover" />
              ) : (
                <div className="course-view-cover-placeholder"><i className="fas fa-tshirt"></i></div>
              )}
            </div>
            <div className="course-view-hero-item course-view-hero-icon">
              <div className="course-view-hero-label">ไอคอนสาขา</div>
              <div className="course-view-icon-badge">
                <i className={course.icon || 'fas fa-graduation-cap'}></i>
              </div>
            </div>
          </div>

          {/* ----- รายละเอียดเรียงเต็มความกว้าง ทีละหัวข้อ ----- */}
          <div className="card border-0 shadow-sm p-3 gold-card bg-white mb-3">
            <h6 className="fw-bold mb-3 section-step-title"><span className="section-step-num">1</span>ข้อมูลพื้นฐาน</h6>
            <div className="course-view-grid">
              <CourseDetailRow label="รหัสหลักสูตร" value={course.curriculumID} />
              <CourseDetailRow label="ระดับการศึกษา" value={course.degreeLevel} />
              <CourseDetailRow label="ประเภทหลักสูตร" value={course.curriculumType} />
              <CourseDetailRow label="ชื่อหลักสูตร (ไทย)" value={course.curriculumName} />
              <CourseDetailRow label="ชื่อหลักสูตร (อังกฤษ)" value={course.curriculumNameEN} />
              <CourseDetailRow label="ภาควิชา (ไทย)" value={course.deptNameTH} />
              <CourseDetailRow label="ภาควิชา (อังกฤษ)" value={course.deptNameEN} />
            </div>
          </div>

          <div className="card border-0 shadow-sm p-3 gold-card bg-white mb-3">
            <h6 className="fw-bold mb-3 section-step-title"><span className="section-step-num">2</span>จุดเด่นและอาชีพ</h6>
            <div className="course-view-grid">
              <CourseDetailRow label="จุดเด่นของหลักสูตร" value={course.highlights} />
              <CourseDetailRow label="เราเรียนอะไร..." value={course.whatWeLearn} />
              <CourseDetailRow label="INSIDE ของสาขา มก. ฉกส." value={course.insideKuse} />
              <CourseDetailRow label="โอกาสในการทำงาน" value={course.jobOpportunities} />
              <CourseDetailRow label="เส้นทางอาชีพ: สายงานเอกชน" value={course.careerPrivate} />
              <CourseDetailRow label="เส้นทางอาชีพ: สายงานราชการ/รัฐวิสาหกิจ" value={course.careerGovernment} />
            </div>
          </div>

          <div className="card border-0 shadow-sm p-3 gold-card bg-white mb-3">
            <h6 className="fw-bold mb-3 section-step-title"><span className="section-step-num">3</span>ไฟล์ข้อมูลหลักสูตร</h6>
            {pdfNames.length > 0 ? (
              <div className="course-view-pdf-row">
                {pdfNames.map((name) => (
                  <a key={name} className="course-view-pdf-chip" href={fileUrl(name, 'documents')} target="_blank" rel="noreferrer">
                    <i className="far fa-file-pdf me-2 text-danger"></i>{name}
                  </a>
                ))}
              </div>
            ) : (
              <span className="course-view-empty">- ไม่มีไฟล์แนบ -</span>
            )}
          </div>

          <div className="card border-0 shadow-sm p-3 gold-card bg-white">
            <h6 className="fw-bold mb-3 section-step-title"><span className="section-step-num">4</span>ข้อมูลการสร้าง/แก้ไข</h6>
            <div className="course-view-grid">
              <CourseDetailRow label="สร้างโดย" value={fullAdminName(course.creatorName, course.creatorLastname)} />
              <CourseDetailRow label="วันที่สร้าง" value={formatDateTime(course.createdAt)} />
              {course.updatedAt && (
                <>
                  <CourseDetailRow label="แก้ไขล่าสุดโดย" value={fullAdminName(course.updaterName, course.updaterLastname)} />
                  <CourseDetailRow label="เวลาแก้ไขล่าสุด" value={formatDateTime(course.updatedAt)} />
                </>
              )}
            </div>
            {!course.updatedAt && (
              <small className="course-view-empty d-block mt-2">ยังไม่เคยมีการแก้ไขหลักสูตรนี้</small>
            )}
          </div>
        </div>

        <div className="kuse-modal-footer">
          <button type="button" className="btn btn-light rounded-pill px-4" onClick={onClose}>ปิด</button>
          <button type="button" className="btn-kuse px-5 shadow" onClick={onEdit}>
            <i className="fas fa-edit me-2"></i>แก้ไขหลักสูตรนี้
          </button>
        </div>
      </div>
    </div>
  );
}
