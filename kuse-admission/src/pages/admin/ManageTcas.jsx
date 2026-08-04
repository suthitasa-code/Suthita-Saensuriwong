import { useEffect, useState, useRef } from 'react';
import Swal from 'sweetalert2';
import '../../styles/manageTcas.css';
import AnnouncementViewModal from '../../components/AnnouncementViewModal';
import { API_BASE, UPLOAD_URL, getLabelStatus, statusBadge, openImageLightbox } from '../../utils/tcasHelpers';

// ================================================================
// หน้านี้คือ "จัดการประกาศรับสมัคร" ใช้เพิ่ม/แก้ไข/ลบประกาศ TCAS
// แต่ละรอบ แล้วดึงมาโชว์เป็นตาราง มีช่องค้นหา+กรองข้อมูลด้วย
// (ตัว modal "ดูรายละเอียด" แบบอ่านอย่างเดียวแยกไปไว้ที่
// components/AnnouncementViewModal.jsx กันไฟล์นี้ยาวเกินไป)
// ================================================================

const ADMIN_ID = localStorage.getItem('admin_id') || 1;

// ค่าเริ่มต้นของฟอร์ม เวลากดปุ่ม "เพิ่มประกาศใหม่" จะรีเซ็ตฟอร์มกลับมาเป็นแบบนี้
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

// Image preview component
const ImagePreviewField = ({ label, icon, iconColor, inputId, files, setFiles, field, maxFiles }) => {
  const inputRef = useRef(null);
  const previews = files[field] || [];

  const handleChange = (e) => {
    let chosen = Array.from(e.target.files);
    if (maxFiles && chosen.length > maxFiles) {
      Swal.fire({
        icon: 'warning',
        title: 'เลือกรูปเกินจำนวนที่กำหนด',
        text: `เลือกได้สูงสุด ${maxFiles} รูป ระบบจะเก็บไว้ให้ ${maxFiles} รูปแรกเท่านั้นนะคะ`,
        confirmButtonColor: '#800000',
      });
      chosen = chosen.slice(0, maxFiles);
    }
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
              <img
                src={URL.createObjectURL(f)}
                className="preview-img"
                alt=""
                title="คลิกเพื่อดูรูปขนาดเต็ม"
                onClick={() => openImageLightbox(URL.createObjectURL(f), f.name)}
              />
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
          <img
            src={`${UPLOAD_URL}/${n.trim()}`}
            className="chip-thumb"
            alt=""
            title="คลิกเพื่อดูรูปขนาดเต็ม"
            onClick={() => openImageLightbox(`${UPLOAD_URL}/${n.trim()}`, n.trim())}
          />
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

// PDF upload field: shows the newly chosen file as a chip with an X button to remove it before submitting
const PdfUploadField = ({ label, icon, iconColor, inputId, files, setFiles, field, existingValue, onClearExisting }) => {
  const inputRef = useRef(null);
  const selected = files[field]?.[0];

  const handleChange = (e) => {
    setFiles(prev => ({ ...prev, [field]: e.target.files[0] ? [e.target.files[0]] : [] }));
  };

  const removeFile = () => {
    setFiles(prev => ({ ...prev, [field]: [] }));
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="upload-card">
      <label className="upload-label">
        <i className={`fas ${icon} me-2`} style={{ color: iconColor }}></i>{label}
      </label>
      {existingValue && (
        <ExistingPdfChip label={label} icon={icon} iconColor={iconColor}
          value={existingValue} fieldKey={field} onClear={onClearExisting} />
      )}
      <input
        ref={inputRef}
        type="file"
        id={inputId}
        className="form-control filter-control"
        accept=".pdf"
        onChange={handleChange}
      />
      {selected && (
        <div className="file-chip pdf-chip new-file-chip">
          <i className="fas fa-file-pdf me-1 text-danger"></i>{selected.name}
          <button type="button" className="btn-remove-chip" onClick={removeFile} title="เอาไฟล์ออก">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
      <small className="text-muted">ไฟล์ PDF (ไม่เกิน 50MB)</small>
    </div>
  );
};

export default function ManageTcas() {
  // ----- ตัวแปรเก็บข้อมูลหลักของหน้านี้ -----
  const [announcements, setAnnouncements] = useState([]);
  const [roundOptions, setRoundOptions] = useState([]); // รายชื่อรอบ TCAS ดึงจากหน้า "จัดการตัวเลือกระบบ" ไม่ต้องแก้โค้ดเวลามีรอบใหม่
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null); // ประกาศที่กำลังเปิดดูแบบอ่านอย่างเดียว (null = ไม่ได้เปิด)
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
  const rowsPerPage = 4;

  // ----- ดึงข้อมูลประกาศทั้งหมดจาก API มาเก็บไว้ใน state -----
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

  // ----- ดึงรายชื่อรอบ TCAS ที่เปิดใช้งานอยู่ (จัดการได้ที่หน้า "จัดการตัวเลือกระบบ") -----
  const fetchRoundOptions = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/lookups/tcas_round?active=1`);
      const json = await res.json();
      if (json.success) setRoundOptions(json.data);
    } catch {
      // เงียบไว้พอ ถ้าโหลดไม่ได้ dropdown จะว่างแค่นั้น ไม่ทำให้ทั้งหน้าใช้งานไม่ได้
    }
  };

  useEffect(() => { fetchAll(); fetchRoundOptions(); }, []);

  // ----- ส่วนค้นหา + กรองข้อมูล -----
  // กรองจาก announcements ที่โหลดมาแล้ว (ไม่ได้ยิง API ใหม่ทุกครั้งที่พิมพ์ค้นหา
  // เพราะข้อมูลทั้งหมดโหลดมาไว้แล้วตั้งแต่แรก กรองในเครื่องได้เลย เร็วกว่า)
  const filtered = announcements.filter(item => {
    const label = getLabelStatus(item);
    const haystack = [item.title, item.subtitle, item.tcasRound, item.academicYear, item.candidateDetail]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const matchSearch = haystack.includes(search.trim().toLowerCase());
    const matchYear = yearFilter === 'all' || String(item.academicYear) === yearFilter;
    const matchType = typeFilter === 'all' || item.tcasRound === typeFilter;
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'open' && label === 'กำลังเปิดรับ') ||
      (statusFilter === 'waiting' && label === 'รอเปิดรับ') ||
      (statusFilter === 'closed' && label === 'ปิดรับแล้ว');
    return matchSearch && matchYear && matchType && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // ----- เปิด modal "ดูรายละเอียด" แบบอ่านอย่างเดียว -----
  // ข้อมูลในตาราง (announcements) มีครบทุกฟิลด์อยู่แล้ว (backend ใช้ SELECT *)
  // เลยไม่ต้องยิง fetch ซ้ำ ใช้ item ที่มีอยู่ในมือได้เลย เปิดโมดัลได้ทันที
  const openView = (item) => setViewItem(item);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setFiles({});
    setExistingFiles({});
    setModalOpen(true);
  };

  // ----- เปิด modal โหมด "แก้ไข" โดยดึงข้อมูลของประกาศอันนั้นมาเติมลงฟอร์ม -----
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

  // ----- กดปุ่ม "บันทึกข้อมูล" ในฟอร์ม เพิ่มใหม่/แก้ไข ทำงานร่วมกันตรงนี้ -----
  // ใช้ FormData เพราะต้องส่งทั้งข้อความและไฟล์ (รูป/PDF) ไปพร้อมกันในคำขอเดียว
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

  // ----- กดปุ่ม "ลบ" ให้เด้งถามยืนยันก่อนลบจริงกันมือลั่น -----
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

  // ----- ส่วนแสดงผล (JSX) เริ่มจากตรงนี้ลงไป -----
  return (
    <div className="manage-tcas-wrapper">
      {/* กล่องค้นหา + กรองข้อมูล — search กรองจาก title/subtitle/รอบ/ปี/คุณสมบัติผู้สมัคร */}
      <div className="filter-container animate-in">
        <div className="filter-title">
          <i className="fas fa-search me-2"></i> ค้นหาและกรองข้อมูล
        </div>
        <div className="filter-row">
          <div className="filter-field field-search">
            <label className="filter-label">ค้นหาชื่อประกาศ (TCAS, Portfolio, ฯลฯ)</label>
            <div className="search-input-wrap">
              <i className="fas fa-search search-input-icon"></i>
              <input
                type="text"
                className="form-control filter-control search-input"
                placeholder="พิมพ์ชื่อประกาศ รอบ หรือปีการศึกษา..."
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              />
              {search && (
                <button
                  type="button"
                  className="search-clear-btn"
                  title="ล้างคำค้นหา"
                  onClick={() => { setSearch(''); setCurrentPage(1); }}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            {search && (
              <small className="search-result-hint">
                พบ {filtered.length} รายการ จากทั้งหมด {announcements.length} รายการ
              </small>
            )}
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
              {roundOptions.map(r => <option key={r.optionID} value={r.name}>{r.name}</option>)}
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
                        <div className="tcas-actions-row">
                          <button className="tcas-icon-btn icon-view" onClick={() => openView(item)} title="ดูรายละเอียด">
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="tcas-icon-btn icon-edit" onClick={() => openEdit(item.announcementID)} title="แก้ไข">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="tcas-icon-btn icon-del" onClick={() => handleDelete(item.announcementID, item.title)} title="ลบ">
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
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

                {/* หมวด 1: ข้อมูลหลักของประกาศ (หัวข้อ, ปี, รอบ, สถานะ) */}
                <div className="tcas-form-section">
                  <div className="tcas-form-section-title">
                    <span className="tcas-step-num">1</span>ข้อมูลหลักของประกาศ
                  </div>
                  <div className="form-grid">
                    <div className="form-col-9">
                      <label className="filter-label fw-bold">หัวข้อหลัก <span className="text-danger">*</span></label>
                      <input type="text" className="form-control filter-control" placeholder="เช่น รับสมัครนักศึกษาใหม่ รอบที่ 2"
                        value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
                    </div>
                    <div className="form-col-3">
                      <label className="filter-label fw-bold">ปีการศึกษา <span className="text-danger">*</span></label>
                      <input type="number" className="form-control filter-control" placeholder="เช่น 2569"
                        value={form.academicYear} onChange={e => setForm(p => ({ ...p, academicYear: e.target.value }))} required />
                    </div>

                    <div className="form-col-12">
                      <label className="filter-label fw-bold">หัวข้อย่อย</label>
                      <input type="text" className="form-control filter-control" placeholder="เช่น โควตาภาคตะวันออกเฉียงเหนือ..."
                        value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} />
                    </div>

                    <div className="form-col-6">
                      <label className="filter-label fw-bold">รอบ TCAS <span className="text-danger">*</span></label>
                      <select className="form-select filter-control" value={form.tcasRound} onChange={e => setForm(p => ({ ...p, tcasRound: e.target.value }))} required>
                        <option value="">-- เลือกรอบการรับสมัคร --</option>
                        {roundOptions.map(r => <option key={r.optionID} value={r.name}>{r.name}</option>)}
                      </select>
                    </div>
                    <div className="form-col-6">
                      <label className="filter-label fw-bold">สถานะการแสดงผล</label>
                      <select className="form-select filter-control" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                        <option value="1">เปิดใช้งาน</option>
                        <option value="0">ปิดใช้งาน</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* หมวด 2: วันรับสมัคร + จำนวนรับ/ทุน (ระบบใช้วันที่ตรงนี้คำนวณสถานะเปิด/ปิดรับอัตโนมัติ) */}
                <div className="tcas-form-section">
                  <div className="tcas-form-section-title">
                    <span className="tcas-step-num">2</span>วันรับสมัครและจำนวนรับ
                  </div>
                  <div className="form-grid">
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
                      <label className="filter-label fw-bold">จำนวนรับ (คน)</label>
                      <input type="number" className="form-control filter-control" placeholder="เช่น 540"
                        value={form.totalQuota} onChange={e => setForm(p => ({ ...p, totalQuota: e.target.value }))} />
                    </div>
                    <div className="form-col-3">
                      <label className="filter-label fw-bold">ทุนเรียนดี (ทุน)</label>
                      <input type="number" className="form-control filter-control" placeholder="เช่น 50"
                        value={form.totalScholarships} onChange={e => setForm(p => ({ ...p, totalScholarships: e.target.value }))} />
                    </div>
                  </div>
                </div>

                {/* หมวด 3: ไฟล์แนบ (รูปภาพ 3 ช่อง + PDF 2 ช่อง) */}
                <div className="tcas-form-section">
                  <div className="tcas-form-section-title">
                    <span className="tcas-step-num">3</span>ไฟล์แนบประกอบประกาศ
                  </div>
                  <div className="form-grid">
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
                      <ImagePreviewField label="3. รูปภาพโปสเตอร์ประชาสัมพันธ์ (สูงสุด 5 รูป)" icon="fa-image" iconColor="#22c55e"
                        inputId="file_poster" files={files} setFiles={setFiles} field="posterImg" maxFiles={5} />
                    </div>

                    <div className="form-col-6">
                      <PdfUploadField label="อัปโหลดประกาศรับสมัคร (PDF)" icon="fa-file-pdf" iconColor="#ef4444"
                        inputId="file_announcement_pdf" files={files} setFiles={setFiles} field="announcementPdf"
                        existingValue={editId ? existingFiles.announcementPdf : ''} onClearExisting={clearExisting} />
                    </div>
                    <div className="form-col-6">
                      <PdfUploadField label="อัปโหลดคู่มือการสมัคร (PDF)" icon="fa-book" iconColor="#3b82f6"
                        inputId="file_manual_pdf" files={files} setFiles={setFiles} field="manualPdf"
                        existingValue={editId ? existingFiles.manualPdf : ''} onClearExisting={clearExisting} />
                    </div>
                  </div>
                </div>

                {/* หมวด 4: รายละเอียดเพิ่มเติม (คุณสมบัติ, เงื่อนไข, หมายเหตุ) */}
                <div className="tcas-form-section">
                  <div className="tcas-form-section-title">
                    <span className="tcas-step-num">4</span>รายละเอียดเพิ่มเติม
                  </div>
                  <div className="form-grid">
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
                      <label className="filter-label fw-bold">หมายเหตุ</label>
                      <textarea className="form-control filter-control" rows="3"
                        value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}></textarea>
                    </div>
                  </div>
                </div>

                {/* ปุ่มยกเลิก / บันทึก */}
                <div className="modal-footer-row">
                  <button type="button" className="btn-cancel-tcas" onClick={() => setModalOpen(false)} disabled={submitting}>
                    ยกเลิก
                  </button>
                  <button type="submit" className="btn-add-tcas px-5" disabled={submitting}>
                    {submitting
                      ? <><span className="spinner-border spinner-border-sm me-2"></span>กำลังบันทึก...</>
                      : <><i className="fas fa-save me-2"></i>บันทึกข้อมูล</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========== VIEW MODAL (ดูรายละเอียด อ่านอย่างเดียว) ========== */}
      {viewItem && (
        <AnnouncementViewModal
          item={viewItem}
          onClose={() => setViewItem(null)}
          onEdit={() => {
            const id = viewItem.announcementID;
            setViewItem(null);
            openEdit(id);
          }}
        />
      )}
    </div>
  );
}