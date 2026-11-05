import { useEffect, useState } from 'react';
import Swal from '../../utils/swal';
import axios from 'axios';
import { API_BASE } from '../../config/api';
import '../../styles/manageLookups.css';

// หน้านี้คือ "จัดการตัวเลือกระบบ" เฉพาะ Super Admin เท่านั้นที่แก้ไขได้
// ใช้คุมรายชื่อที่โผล่เป็น dropdown ในฟอร์มอื่นๆ (รอบ TCAS / ระดับการศึกษา / ประเภทหลักสูตร)

const TABS = [
    { key: 'tcas_round', label: 'รอบ TCAS', icon: 'fas fa-bullhorn', hasIconColor: false, namePlaceholder: 'เช่น รอบที่ 5 รับตรงพิเศษ' },
    { key: 'degree_level', label: 'ระดับการศึกษา', icon: 'fas fa-user-graduate', hasIconColor: false, namePlaceholder: 'เช่น ประกาศนียบัตรบัณฑิต' },
    { key: 'curriculum_type', label: 'ประเภทหลักสูตร', icon: 'fas fa-graduation-cap', hasIconColor: true, namePlaceholder: 'เช่น หลักสูตรวิศวกรรมศาสตรบัณฑิต (วศ.บ.)' },
];

const ICON_CHOICES = [
    'fas fa-hard-hat',
    'fas fa-flask',
    'fas fa-user-graduate',
    'fas fa-graduation-cap',
    'fas fa-microscope',
    'fas fa-laptop-code',
    'fas fa-atom',
    'fas fa-book',
    'fas fa-award',
    'fas fa-building-columns',
];

const emptyForm = { name: '', icon: '', accentColor: '#800000', sortOrder: 0 };

const ManageLookups = () => {
    const currentAdminRole = localStorage.getItem('admin_role') || 'Admin';
    const isSuperAdmin = currentAdminRole === 'Super Admin';

    const [activeTab, setActiveTab] = useState('tcas_round');
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const activeTabMeta = TABS.find((t) => t.key === activeTab);

    const fetchOptions = async (category) => {
        try {
            setLoading(true);
            // ไม่ใส่ ?active=1 เพราะหน้านี้ต้องเห็นตัวที่ปิดใช้งานไว้ด้วย เผื่ออยากเปิดกลับ
            const res = await axios.get(`${API_BASE}/api/lookups/${category}`);
            setOptions(res.data.data || []);
        } catch (error) {
            console.error('โหลดตัวเลือกไม่สำเร็จ:', error);
            Swal.fire({ icon: 'error', title: 'โหลดข้อมูลล้มเหลว', confirmButtonColor: '#800000' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOptions(activeTab);
    }, [activeTab]);

    const handleOpenAdd = () => {
        setEditingId(null);
        setForm({ ...emptyForm, sortOrder: options.length + 1 });
        setShowModal(true);
    };

    const handleOpenEdit = (option) => {
        setEditingId(option.optionID);
        setForm({
            name: option.name,
            icon: option.icon || '',
            accentColor: option.accentColor || '#800000',
            sortOrder: option.sortOrder,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                category: activeTab,
                name: form.name,
                sortOrder: Number(form.sortOrder) || 0,
                icon: activeTabMeta.hasIconColor ? form.icon : null,
                accentColor: activeTabMeta.hasIconColor ? form.accentColor : null,
            };
            const headers = { Authorization: `Bearer ${token}` };

            if (editingId) {
                await axios.put(`${API_BASE}/api/lookups/${editingId}`, payload, { headers });
            } else {
                await axios.post(`${API_BASE}/api/lookups`, payload, { headers });
            }
            Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ', timer: 1200, showConfirmButton: false });
            setShowModal(false);
            fetchOptions(activeTab);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'กรุณาตรวจสอบข้อมูลที่กรอก';
            Swal.fire({ icon: 'error', title: 'บันทึกไม่สำเร็จ', text: errorMsg, confirmButtonColor: '#800000' });
        }
    };

    // เปิด/ปิดใช้งาน ไม่ลบทิ้งจริง กันพังกับข้อมูลเก่าที่เคยใช้ชื่อนี้อยู่ (เหมือนหลักการระงับสิทธิ์แอดมิน)
    const handleToggleActive = async (option) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_BASE}/api/lookups/${option.optionID}`,
                {
                    category: option.category,
                    name: option.name,
                    icon: option.icon,
                    accentColor: option.accentColor,
                    sortOrder: option.sortOrder,
                    isActive: Number(option.isActive) === 1 ? 0 : 1,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchOptions(activeTab);
        } catch {
            Swal.fire({ icon: 'error', title: 'เปลี่ยนสถานะไม่สำเร็จ', confirmButtonColor: '#800000' });
        }
    };

    // ลบตัวเลือกออกจากระบบถาวร (คนละอันกับปุ่มเปิด/ปิดใช้งาน)
    const handleDelete = (option) => {
        Swal.fire({
            title: 'ยืนยันการลบตัวเลือกนี้?',
            text: `"${option.name}" จะถูกลบออกจากระบบถาวร ประกาศ/หลักสูตรเก่าที่เคยใช้ชื่อนี้จะไม่หายไป แค่จะไม่มีในตัวเลือกให้เลือกอีก`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ยืนยันการลบ',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#c0392b',
            cancelButtonColor: '#6c757d',
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_BASE}/api/lookups/${option.optionID}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                Swal.fire({ icon: 'success', title: 'ลบสำเร็จ', timer: 1200, showConfirmButton: false });
                fetchOptions(activeTab);
            } catch (error) {
                const errorMsg = error.response?.data?.message || 'ลบไม่สำเร็จ';
                Swal.fire({ icon: 'error', title: 'ลบไม่สำเร็จ', text: errorMsg, confirmButtonColor: '#800000' });
            }
        });
    };

    if (!isSuperAdmin) {
        return (
            <div className="lookup-no-access">
                <i className="fas fa-lock fa-2x mb-3"></i>
                <p>เฉพาะ Super Admin เท่านั้นที่เข้าหน้านี้ได้</p>
            </div>
        );
    }

    return (
        <div className="container-fluid manage-lookups-container px-4 py-3">
            <div className="lookup-tabs">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        className={`lookup-tab-btn${activeTab === tab.key ? ' active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        <i className={`${tab.icon} me-2`}></i>{tab.label}
                    </button>
                ))}
            </div>

            <div className="report-section">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <p className="text-muted small mb-0">
                        ตัวเลือกในหมวดนี้จะไปปรากฎใน Dropdown List ในแบบฟอร์มที่เกี่ยวข้อง
                    </p>
                    <button className="btn btn-add-lookup" onClick={handleOpenAdd}>
                        <i className="fas fa-plus-circle me-2"></i>เพิ่มตัวเลือกใหม่
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-4"><div className="spinner-border text-danger"></div></div>
                ) : (
                    <div className="table-responsive">
                        <table className="table lookup-table align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>ลำดับ</th>
                                    <th>ชื่อ</th>
                                    {activeTabMeta.hasIconColor && <th>ไอคอน/สี</th>}
                                    <th>สถานะ</th>
                                    <th className="text-center">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {options.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-4 text-muted">ยังไม่มีตัวเลือกในหมวดนี้</td></tr>
                                ) : (
                                    options.map((option) => (
                                        <tr key={option.optionID} className={Number(option.isActive) !== 1 ? 'is-inactive-row' : ''}>
                                            <td>{option.sortOrder}</td>
                                            <td>{option.name}</td>
                                            {activeTabMeta.hasIconColor && (
                                                <td>
                                                    {option.icon && (
                                                        <span className="lookup-icon-preview" style={{ background: option.accentColor || '#800000' }}>
                                                            <i className={option.icon}></i>
                                                        </span>
                                                    )}
                                                </td>
                                            )}
                                            <td>
                                                {Number(option.isActive) === 1 ? (
                                                    <span className="lookup-status-badge status-ok">ใช้งานอยู่</span>
                                                ) : (
                                                    <span className="lookup-status-badge status-off">ปิดใช้งาน</span>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button className="lookup-action-btn action-edit" onClick={() => handleOpenEdit(option)} title="แก้ไข">
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        className={`lookup-action-btn ${Number(option.isActive) === 1 ? 'action-suspend' : 'action-restore'}`}
                                                        onClick={() => handleToggleActive(option)}
                                                        title={Number(option.isActive) === 1 ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                                                    >
                                                        <i className={`fas ${Number(option.isActive) === 1 ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                    </button>
                                                    <button
                                                        className="lookup-action-btn action-delete"
                                                        onClick={() => handleDelete(option)}
                                                        title="ลบถาวร"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-xl lookup-modal-custom">
                            <div className="modal-header border-0 lookup-modal-header py-3 px-4">
                                <h5 className="modal-title fw-bold text-white mb-0">
                                    {editingId ? 'แก้ไขตัวเลือก' : 'เพิ่มตัวเลือกใหม่'} — {activeTabMeta.label}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="lookup-form-label">ชื่อ</label>
                                        <input
                                            type="text"
                                            className="form-control lookup-form-control"
                                            required
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder={activeTabMeta.namePlaceholder}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="lookup-form-label">ลำดับการแสดงผล</label>
                                        <input
                                            type="number"
                                            className="form-control lookup-form-control"
                                            value={form.sortOrder}
                                            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                                        />
                                    </div>
                                    {activeTabMeta.hasIconColor && (
                                        <>
                                            <div className="mb-3">
                                                <label className="lookup-form-label">ไอคอน</label>
                                                <div className="lookup-icon-picker">
                                                    {ICON_CHOICES.map((iconClass) => (
                                                        <button
                                                            type="button"
                                                            key={iconClass}
                                                            className={`lookup-icon-choice${form.icon === iconClass ? ' selected' : ''}`}
                                                            style={{ background: form.icon === iconClass ? form.accentColor : undefined }}
                                                            onClick={() => setForm({ ...form, icon: iconClass })}
                                                            title={iconClass}
                                                        >
                                                            <i className={iconClass}></i>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <label className="lookup-form-label">สีประจำ</label>
                                                <input
                                                    type="color"
                                                    className="form-control form-control-color"
                                                    value={form.accentColor}
                                                    onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                                                />
                                            </div>
                                        </>
                                    )}
                                    <div className="d-flex justify-content-end gap-2 mt-4">
                                        <button type="button" className="btn btn-cancel-lookup" onClick={() => setShowModal(false)}>ยกเลิก</button>
                                        <button type="submit" className="btn btn-save-lookup">บันทึก</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageLookups;
