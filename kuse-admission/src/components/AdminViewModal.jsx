import '../styles/adminView.css';

// ================================================================
// Modal "ดูรายละเอียดผู้ดูแลระบบ" — โหมดดูอย่างเดียว ไม่มีฟอร์มให้แก้ไข
// แยกออกมาจาก ManageAdmin.jsx เพื่อไม่ให้ไฟล์นั้นยาวเกิน (แพทเทิร์นเดียวกับ
// AnnouncementViewModal.jsx / CourseViewModal.jsx)
// ================================================================

const formatDateTime = (d) => d
  ? new Date(d).toLocaleString('th-TH', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '-';

const getRoleLabel = (role) => {
  if (role === 'Super Admin') return 'ผู้ดูแลระบบสารสนเทศสูงสุด';
  if (role === 'Admin') return 'ผู้ดูแลระบบ';
  return role;
};

const AdminDetailRow = ({ icon, label, value }) => (
  <div className="admin-view-row">
    <div className="admin-view-label">
      <i className={`${icon} admin-view-label-icon`}></i>
      {label}
    </div>
    <div className="admin-view-value">{value}</div>
  </div>
);

export default function AdminViewModal({ admin, onClose, onEdit, onViewPassword }) {
  if (!admin) return null;
  const isSuper = admin.role === 'Super Admin';
  const isActive = Number(admin.status) === 1;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-xl style-modal-custom">
          <div className="modal-header border-0 modal-custom-header py-3 px-4">
            <h5 className="modal-title fw-bold text-white mb-0">
              <i className="fas fa-eye me-2"></i>รายละเอียดผู้ดูแลระบบ
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-modal-light">
            {/* ----- การ์ดหลัก มีแถบไล่สีทอง-แดงด้านบน (ลายเซ็นของระบบ เหมือนการ์ดอื่นๆ ทั้งแอป) ----- */}
            <div className="admin-view-card">
              {/* ----- แถบโปรไฟล์ด้านบน ----- */}
              <div className="admin-view-profile">
                <div className={`admin-avatar admin-view-avatar ${isSuper ? 'avatar-super' : 'avatar-admin'}`}>
                  {admin.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="admin-view-name">{admin.name} {admin.lastname}</div>
                  <div className="admin-view-badges">
                    <span className={`badge-role ${isSuper ? 'bg-super' : 'bg-admin'}`}>
                      <i className={`fas ${isSuper ? 'fa-crown' : 'fa-user-shield'} me-1`}></i>{admin.role}
                    </span>
                    {isActive ? (
                      <span className="admin-status-badge status-ok"><i className="fas fa-check-circle me-1"></i>ปกติ</span>
                    ) : (
                      <span className="admin-status-badge status-suspend"><i className="fas fa-ban me-1"></i>ถูกระงับสิทธิ์</span>
                    )}
                  </div>
                </div>
              </div>

              {/* ----- รายละเอียดบัญชี ----- */}
              <div className="admin-view-block-list">
                <AdminDetailRow icon="fas fa-envelope" label="อีเมลแอดมิน" value={admin.email} />
                <AdminDetailRow icon="fas fa-user-tag" label="ระดับสิทธิ์" value={getRoleLabel(admin.role)} />
                <AdminDetailRow icon="fas fa-calendar-plus" label="วันที่สร้างบัญชี" value={formatDateTime(admin.createdAt)} />
                {onViewPassword && (
                  <AdminDetailRow
                    icon="fas fa-key"
                    label="รหัสผ่านปัจจุบัน"
                    value={(
                      <button type="button" className="admin-view-pass-chip" onClick={onViewPassword}>
                        <i className="fas fa-eye"></i>คลิกเพื่อดูรหัสผ่าน
                      </button>
                    )}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer border-0 d-flex justify-content-end gap-2 p-3">
            <button type="button" className="btn btn-cancel-premium" onClick={onClose}>ปิด</button>
            <button type="button" className="btn btn-save-premium" onClick={onEdit}>
              <i className="fas fa-edit me-2"></i>แก้ไขข้อมูล
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
