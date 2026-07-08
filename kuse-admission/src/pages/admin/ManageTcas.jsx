import { useEffect, useState, useRef } from 'react';
import Swal from 'sweetalert2';
import '../../styles/manageTcas.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const UPLOAD_URL = `${API_BASE}/uploads/announcements`;

const ADMIN_ID = localStorage.getItem('admin_id') || 1;

const emptyForm = {
  title: '',
  subtitle: '',
  tcasRound: '',
  academicYear: '',
  candidateDetail: '',
  conditions: '',
  notes: '',
  openDate: '',
  closeDate: '',
  totalQuota: '',
  totalScholarships: '',
  status: '1',
};

const getLabelStatus = (item) => {
  if (item.labelStatus) return item.labelStatus;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const start = new Date(item.openDate); start.setHours(0, 0, 0, 0);
  const end = new Date(item.closeDate); end.setHours(0, 0, 0, 0);
  if (isNaN(start) || isNaN(end)) return 'ไม่ระบุวันรับสมัคร';
  if (today < start) return 'รอเปิดรับ';
  if (today <= end) return 'กำลังเปิดรับ';
  return 'ปิดรับแล้ว';
};

const statusBadge = (label) => {
  if (label === 'กำลังเปิดรับ') return 'badge-open';
  if (label === 'รอเปิดรับ') return 'badge-wait';
  if (label === 'ปิดรับแล้ว') return 'badge-closed';
  return 'badge-none';
};

// Image preview component
const ImagePreviewField = ({ label, icon, iconColor, inputId, files, setFiles, field }) => {
  const inputRef = useRef(null);
  const previews = files[field] || [];

  const handleChange = (e) => {
    const chosen = Array.from(e.target.files);
    setFiles(prev => ({ ...prev, [field]: chosen }));
  };

  const removeFile = (idx) => {
    setFiles(prev => {
      const updated = [...(prev[field] || [])];
      updated.splice(idx, 1);
      return { ...prev, [field]: updated };
    });
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="upload-card">
      <label className="upload-label">
        <i className={`fas ${icon} me-2`} style={{ color: iconColor }}></i>{label}
      </label>
      <input
        ref={inputRef}
        type="file"
        id={inputId}
        className="form-control filter-control mb-2"
        accept="image/*"
        multiple
        onChange={handleChange}
      />
      {previews.length > 0 && (
        <div className="preview-grid">
          {previews.map((f, i) => (
            <div key={i} className="preview-wrapper">
              <img src={URL.createObjectURL(f)} className="preview-img" alt="" />
              <button type="button" className="btn-remove-img" onClick={() => removeFile(i)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Existing image chips (for edit mode)
const ExistingImageChips = ({ label, icon, iconColor, value, fieldKey, onClear }) => {
  if (!value) return null;
  const names = value.split(',').filter(Boolean);
  return (
    <div className="existing-files">
      <small className="text-muted d-block mb-1"><i className={`fas ${icon} me-1`} style={{ color: iconColor }}></i>{label} (ไฟล์ปัจจุบัน)</small>
      {names.map((n, i) => (
        <span key={i} className="file-chip">
          <img src={`${UPLOAD_URL}/${n.trim()}`} className="chip-thumb" alt="" />
          {n.trim()}
        </span>
      ))}
      <button type="button" className="btn-clear-existing" onClick={() => onClear(fieldKey)}>
        <i className="fas fa-trash-alt me-1"></i>ล้างรูปเดิม
      </button>
    </div>
  );
};

const ExistingPdfChip = ({ label, icon, iconColor, value, fieldKey, onClear }) => {
  if (!value) return null;
  return (
    <div className="existing-files">
      <small className="text-muted"><i className={`fas ${icon} me-1`} style={{ color: iconColor }}></i>{label} (ไฟล์ปัจจุบัน)</small>
      <span className="file-chip pdf-chip">
        <i className="fas fa-file-pdf me-1 text-danger"></i>{value}
      </span>
      <button type="button" className="btn-clear-existing" onClick={() => onClear(fieldKey)}>
        <i className="fas fa-trash-alt me-1"></i>ล้างไฟล์เดิม
      </button>
    </div>
  );
};

export default function ManageTcas() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState({});
  const [existingFiles, setExistingFiles] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Filter state
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/announcement`);
      const json = await res.json();
      if (json.success) setAnnouncements(json.data);
    } catch {
      Swal.fire({ title: 'โหลดข้อมูลไม่สำเร็จ', icon: 'error', confirmButtonColor: '#800000' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Filtered list
  const getRoundNumber = (tcasRound) => {
    const m = (tcasRound || '').match(/รอบที่\s*(\d+)/);
    return m ? m[1] : '';
  };

  const filtered = announcements.filter(item => {
    const label = getLabelStatus(item);
    const haystack = [item.title, item.subtitle, item.tcasRound, item.academicYear, item.candidateDetail]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const matchSearch = haystack.includes(search.trim().toLowerCase());
    const matchYear = yearFilter === 'all' || String(item.academicYear) === yearFilter;
    const matchType = typeFilter === 'all' || getRoundNumber(item.tcasRound) === typeFilter;
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'open' && label === 'กำลังเปิดรับ') ||
      (statusFilter === 'waiting' && label === 'รอเปิดรับ') ||
      (statusFilter === 'closed' && label === 'ปิดรับแล้ว');
    return matchSearch && matchYear && matchType && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setFiles({});
    setExistingFiles({});
    setModalOpen(true);
  };

  const openEdit = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/announcement/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error();
      const d = json.data;
      setEditId(id);
      setForm({
        title: d.title || '',
        subtitle: d.subtitle || '',
        tcasRound: d.tcasRound || '',
        academicYear: d.academicYear || '',
        candidateDetail: d.candidateDetail || '',
        conditions: d.conditions || '',
        notes: d.notes || '',
        openDate: d.openDate ? d.openDate.slice(0, 10) : '',
        closeDate: d.closeDate ? d.closeDate.slice(0, 10) : '',
        totalQuota: d.totalQuota || '',
        totalScholarships: d.totalScholarships || '',
        status: d.status || '1',
      });
      setExistingFiles({
        posterImg: d.posterImg || '',
        scheduleImg: d.scheduleImg || '',
        majorTableImg: d.majorTableImg || '',
        manualPdf: d.manualPdf || '',
        announcementPdf: d.announcementPdf || '',
      });
      setFiles({});
      setModalOpen(true);
    } catch {
      Swal.fire({ title: 'โหลดข้อมูลไม่สำเร็จ', icon: 'error', confirmButtonColor: '#800000' });
    }
  };

  const clearExisting = (fieldKey) => {
    setExistingFiles(prev => ({ ...prev, [fieldKey]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.tcasRound || !form.academicYear || !form.openDate || !form.closeDate) {
      Swal.fire({ title: 'กรอกข้อมูลไม่ครบ', text: 'กรุณากรอกหัวข้อ, รอบ, ปีการศึกษา และวันเปิด-ปิดรับสมัครด้วยนะคะ!', icon: 'warning', confirmButtonColor: '#800000' });
      return;
    }

    setSubmitting(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append('adminID', ADMIN_ID);

    // Append new files
    ['posterImg', 'scheduleImg', 'majorTableImg'].forEach(field => {
      (files[field] || []).forEach(f => fd.append(field, f));
    });
    if (files['manualPdf']?.[0]) fd.append('manualPdf', files['manualPdf'][0]);
    if (files['announcementPdf']?.[0]) fd.append('announcementPdf', files['announcementPdf'][0]);

    // If editing and user cleared existing files, append empty string so backend keeps old or clears
    if (editId) {
      ['posterImg', 'scheduleImg', 'majorTableImg', 'manualPdf', 'announcementPdf'].forEach(field => {
        if (!existingFiles[field] && !files[field]?.length) {
          fd.append(`_clear_${field}`, '1');
        }
      });
    }

    try {
      const url = editId
        ? `${API_BASE}/api/announcement/${editId}`
        : `${API_BASE}/api/announcement`;
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, body: fd });
      const json = await res.json();

      if (json.success) {
        Swal.fire({ title: editId ? 'แก้ไขสำเร็จแล้วค่ะ!' : 'เพิ่มประกาศสำเร็จแล้วค่ะ!', icon: 'success', confirmButtonColor: '#800000' });
        setModalOpen(false);
        fetchAll();
      } else {
        throw new Error(json.message);
      }
    } catch (err) {
      Swal.fire({ title: 'บันทึกไม่สำเร็จ', text: err.message || 'กรุณาลองใหม่อีกครั้งค่ะ', icon: 'error', confirmButtonColor: '#800000' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id, title) => {
    Swal.fire({
      title: 'ยืนยันการลบข้อมูล',
      html: `คุณแน่ใจหรือไม่ที่จะลบประกาศ<br><b class="text-danger">"${title}"</b>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#800000',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'ยืนยันการลบ',
      cancelButtonText: 'ยกเลิก',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API_BASE}/api/announcement/${id}`, { method: 'DELETE' });
          const json = await res.json();
          if (json.success) {
            Swal.fire({ title: 'ลบสำเร็จ!', icon: 'success', confirmButtonColor: '#800000' });
            fetchAll();
          } else throw new Error(json.message);
        } catch (err) {
          Swal.fire({ title: 'ลบไม่สำเร็จ', text: err.message, icon: 'error', confirmButtonColor: '#800000' });
        }
      }
    });
  };

  const uniqueYears = [...new Set([
    '2569', '2568', '2567',
    ...announcements.map(a => String(a.academicYear)).filter(Boolean),
  ])].sort((a, b) => b - a);

  return (
    <div className="manage-tcas-wrapper">
      {/* Filter Box */}
      <div className="filter-container animate-in">
        <div className="filter-title">
          <i className="fas fa-search me-2"></i> ค้นหาและกรองข้อมูล
        </div>
        <div className="filter-row">
          <div className="filter-field field-search">
            <label className="filter-label">ค้นหาชื่อประกาศ (TCAS, Portfolio, ฯลฯ)</label>
            <input
              type="text"
              className="form-control filter-control"
              placeholder="พิมพ์เพื่อค้นหา..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="filter-field field-year">
            <label className="filter-label">ปีการศึกษา</label>
            <select className="form-select filter-control" value={yearFilter} onChange={e => { setYearFilter(e.target.value); setCurrentPage(1); }}>
              <option value="all">ทั้งหมด</option>
              {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="filter-field field-round">
            <label className="filter-label">รอบการรับสมัคร</label>
            <select className="form-select filter-control" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}>
              <option value="all">ทั้งหมด</option>
              <option value="1">รอบที่ 1 Portfolio</option>
              <option value="2">รอบที่ 2 Quota</option>
              <option value="3">รอบที่ 3 Admission</option>
              <option value="4">รอบที่ 4 รับอิสระ</option>
            </select>
          </div>
          <div className="filter-field field-status">
            <label className="filter-label">สถานะการแสดงผล</label>
            <select className="form-select filter-control" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
              <option value="all">ทั้งหมด</option>
              <option value="open">กำลังเปิดรับ</option>
              <option value="waiting">รอเปิดรับ</option>
              <option value="closed">ปิดรับแล้ว</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="report-section">
        <div className="section-header-row">
          <h5 className="section-title">
            <i className="fas fa-list me-2 text-danger"></i> รายการประกาศทั้งหมด
          </h5>
          <button className="btn-add-tcas" onClick={openAdd}>
            <i className="fas fa-plus-circle me-2"></i> เพิ่มประกาศใหม่
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner-border text-danger" role="status"></div>
            <p className="mt-3 text-muted">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle tcas-table">
              <thead>
                <tr>
                  <th>หัวข้อประกาศ</th>
                  <th>รอบ TCAS</th>
                  <th>ปีการศึกษา</th>
                  <th>วันรับสมัคร</th>
                  <th>สถานะ</th>
                  <th className="text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-row">
                      <i className="fas fa-inbox fa-2x mb-2 text-muted"></i>
                      <br />ไม่พบข้อมูลประกาศในระบบค่ะ
                    </td>
                  </tr>
                ) : paginated.map(item => {
                  const label = getLabelStatus(item);
                  return (
                    <tr key={item.announcementID}>
                      <td>
                        <div className="fw-semibold">{item.title}</div>
                        {item.subtitle && (
                          <small className="d-block text-muted">{item.subtitle}</small>
                        )}
                        {item.candidateDetail && (
                          <small className="text-muted">{item.candidateDetail.slice(0, 60)}{item.candidateDetail.length > 60 ? '...' : ''}</small>
                        )}
                      </td>
                      <td>{item.tcasRound || '-'}</td>
                      <td>{item.academicYear || '-'}</td>
                      <td>
                        {item.openDate ? (
                          <small>
                            {new Date(item.openDate).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
                            {' — '}
                            {new Date(item.closeDate).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </small>
                        ) : '-'}
                      </td>
                      <td>
                        <span className={`status-badge ${statusBadge(label)}`}>{label}</span>
                      </td>
                      <td className="text-center">
                        <button className="btn-action btn-edit" onClick={() => openEdit(item.announcementID)}>
                          <i className="fas fa-edit me-1"></i>แก้ไข
                        </button>
                        <button className="btn-action btn-del" onClick={() => handleDelete(item.announcementID, item.title)}>
                          <i className="fas fa-trash-alt me-1"></i>ลบ
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="section-header-row" style={{ marginBottom: 0, marginTop: '8px' }}>
          <div className="text-muted small">
            แสดง {filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} ถึง {Math.min(currentPage * rowsPerPage, filtered.length)} จากทั้งหมด {filtered.length} รายการ
          </div>
          <nav>
            <ul className="pagination pagination-sm m-0">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <li key={p} className={`page-item ${p === currentPage ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p)}>{p}</button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* ========== MODAL ========== */}
      {modalOpen && (
        <div className="tcas-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="tcas-modal-box">
            <div className="modal-head">
              <h5 className="modal-head-title">
                <i className={`fas ${editId ? 'fa-edit' : 'fa-plus-circle'} me-2`}></i>
                {editId ? 'แก้ไขรายละเอียดประกาศรับสมัคร' : 'เพิ่มรายละเอียดประกาศรับสมัครใหม่'}
              </h5>
              <button className="modal-close-btn" onClick={() => setModalOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body-scroll">
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  {/* Title + Year */}
                  <div className="form-col-9">
                    <label className="filter-label fw-bold text-dark">หัวข้อหลัก <span className="text-danger">*</span></label>
                    <input type="text" className="form-control filter-control" placeholder="เช่น รับสมัครนักศึกษาใหม่ รอบที่ 2"
                      value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
                  </div>
                  <div className="form-col-3">
                    <label className="filter-label fw-bold text-dark">ปีการศึกษา <span className="text-danger">*</span></label>
                    <input type="number" className="form-control filter-control" placeholder="เช่น 2569"
                      value={form.academicYear} onChange={e => setForm(p => ({ ...p, academicYear: e.target.value }))} required />
                  </div>

                  {/* Subtitle */}
                  <div className="form-col-12">
                    <label className="filter-label fw-bold text-dark">หัวข้อย่อย</label>
                    <input type="text" className="form-control filter-control" placeholder="เช่น โควตาภาคตะวันออกเฉียงเหนือ..."
                      value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} />
                  </div>

                  {/* tcasRound + status */}
                  <div className="form-col-6">
                    <label className="filter-label fw-bold text-dark">รอบ TCAS <span className="text-danger">*</span></label>
                    <select className="form-select filter-control" value={form.tcasRound} onChange={e => setForm(p => ({ ...p, tcasRound: e.target.value }))} required>
                      <option value="">-- เลือกรอบการรับสมัคร --</option>
                      <option value="รอบที่ 1 Portfolio">รอบที่ 1 Portfolio</option>
                      <option value="รอบที่ 2 Quota">รอบที่ 2 Quota</option>
                      <option value="รอบที่ 3 Admission">รอบที่ 3 Admission</option>
                      <option value="รอบที่ 4 รับอิสระ">รอบที่ 4 รับอิสระ</option>
                    </select>
                  </div>
                  <div className="form-col-6">
                    <label className="filter-label fw-bold text-dark">สถานะการแสดงผล</label>
                    <select className="form-select filter-control" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                      <option value="1">เปิดใช้งาน</option>
                      <option value="0">ปิดใช้งาน</option>
                    </select>
                  </div>

                  {/* Dates + Quota + Scholarship */}
                  <div className="form-col-3">
                    <label className="filter-label fw-bold" style={{ color: '#2563eb' }}>วันที่เริ่มสมัคร <span className="text-danger">*</span></label>
                    <input type="date" className="form-control filter-control"
                      value={form.openDate} onChange={e => setForm(p => ({ ...p, openDate: e.target.value }))} required />
                  </div>
                  <div className="form-col-3">
                    <label className="filter-label fw-bold" style={{ color: '#2563eb' }}>วันที่สิ้นสุดสมัคร <span className="text-danger">*</span></label>
                    <input type="date" className="form-control filter-control"
                      value={form.closeDate} onChange={e => setForm(p => ({ ...p, closeDate: e.target.value }))} required />
                  </div>
                  <div className="form-col-3">
                    <label className="filter-label fw-bold text-dark">จำนวนรับ (คน)</label>
                    <input type="number" className="form-control filter-control" placeholder="เช่น 540"
                      value={form.totalQuota} onChange={e => setForm(p => ({ ...p, totalQuota: e.target.value }))} />
                  </div>
                  <div className="form-col-3">
                    <label className="filter-label fw-bold text-dark">ทุนเรียนดี (ทุน)</label>
                    <input type="number" className="form-control filter-control" placeholder="เช่น 50"
                      value={form.totalScholarships} onChange={e => setForm(p => ({ ...p, totalScholarships: e.target.value }))} />
                  </div>

                  {/* Image uploads */}
                  <div className="form-col-4">
                    {editId && existingFiles.scheduleImg && (
                      <ExistingImageChips label="กำหนดการรับสมัคร" icon="fa-calendar-alt" iconColor="#f59e0b"
                        value={existingFiles.scheduleImg} fieldKey="scheduleImg" onClear={clearExisting} />
                    )}
                    <ImagePreviewField label="1. รูปภาพกำหนดการรับสมัคร" icon="fa-calendar-alt" iconColor="#f59e0b"
                      inputId="file_schedule" files={files} setFiles={setFiles} field="scheduleImg" />
                  </div>
                  <div className="form-col-4">
                    {editId && existingFiles.majorTableImg && (
                      <ExistingImageChips label="สาขาวิชาที่เปิดรับ" icon="fa-list-ul" iconColor="#06b6d4"
                        value={existingFiles.majorTableImg} fieldKey="majorTableImg" onClear={clearExisting} />
                    )}
                    <ImagePreviewField label="2. รูปภาพสาขาวิชาที่เปิดรับ" icon="fa-list-ul" iconColor="#06b6d4"
                      inputId="file_majors" files={files} setFiles={setFiles} field="majorTableImg" />
                  </div>
                  <div className="form-col-4">
                    {editId && existingFiles.posterImg && (
                      <ExistingImageChips label="โปสเตอร์ประชาสัมพันธ์" icon="fa-image" iconColor="#22c55e"
                        value={existingFiles.posterImg} fieldKey="posterImg" onClear={clearExisting} />
                    )}
                    <ImagePreviewField label="3. รูปภาพโปสเตอร์ประชาสัมพันธ์" icon="fa-image" iconColor="#22c55e"
                      inputId="file_poster" files={files} setFiles={setFiles} field="posterImg" />
                  </div>

                  {/* PDF uploads */}
                  <div className="form-col-6">
                    <div className="upload-card">
                      <label className="upload-label">
                        <i className="fas fa-file-pdf me-2 text-danger"></i>อัปโหลดประกาศรับสมัคร (PDF)
                      </label>
                      {editId && existingFiles.announcementPdf && (
                        <ExistingPdfChip label="ประกาศรับสมัคร" icon="fa-file-pdf" iconColor="#ef4444"
                          value={existingFiles.announcementPdf} fieldKey="announcementPdf" onClear={clearExisting} />
                      )}
                      <input type="file" className="form-control filter-control" accept=".pdf"
                        onChange={e => setFiles(p => ({ ...p, announcementPdf: [e.target.files[0]] }))} />
                      <small className="text-muted">ไฟล์ PDF (ไม่เกิน 50MB)</small>
                    </div>
                  </div>
                  <div className="form-col-6">
                    <div className="upload-card">
                      <label className="upload-label">
                        <i className="fas fa-book me-2 text-primary"></i>อัปโหลดคู่มือการสมัคร (PDF)
                      </label>
                      {editId && existingFiles.manualPdf && (
                        <ExistingPdfChip label="คู่มือการสมัคร" icon="fa-book" iconColor="#3b82f6"
                          value={existingFiles.manualPdf} fieldKey="manualPdf" onClear={clearExisting} />
                      )}
                      <input type="file" className="form-control filter-control" accept=".pdf"
                        onChange={e => setFiles(p => ({ ...p, manualPdf: [e.target.files[0]] }))} />
                      <small className="text-muted">ไฟล์ PDF (ไม่เกิน 50MB)</small>
                    </div>
                  </div>

                  {/* Text areas */}
                  <div className="form-col-6">
                    <label className="filter-label fw-bold text-danger">คุณสมบัติผู้สมัคร</label>
                    <textarea className="form-control filter-control" rows="4"
                      value={form.candidateDetail} onChange={e => setForm(p => ({ ...p, candidateDetail: e.target.value }))}
                      placeholder="เช่น เกรดเฉลี่ยสะสม 3.00 ขึ้นไป..."></textarea>
                  </div>
                  <div className="form-col-6">
                    <label className="filter-label fw-bold text-danger">เงื่อนไขการสมัคร</label>
                    <textarea className="form-control filter-control" rows="4"
                      value={form.conditions} onChange={e => setForm(p => ({ ...p, conditions: e.target.value }))}
                      placeholder="เช่น สมัครผ่านระบบ TCAS..."></textarea>
                  </div>
                  <div className="form-col-12">
                    <label className="filter-label fw-bold text-dark">หมายเหตุ</label>
                    <textarea className="form-control filter-control" rows="3"
                      value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}></textarea>
                  </div>

                  {/* Action buttons */}
                  <div className="form-col-12 modal-footer-row">
                    <button type="button" className="btn-cancel-tcas" onClick={() => setModalOpen(false)} disabled={submitting}>
                      ยกเลิก
                    </button>
                    <button type="submit" className="btn-add-tcas px-5" disabled={submitting}>
                      {submitting
                        ? <><span className="spinner-border spinner-border-sm me-2"></span>กำลังบันทึก...</>
                        : <><i className="fas fa-save me-2"></i>บันทึกข้อมูล</>}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}