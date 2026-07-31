import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import '../../styles/manageLookups.css';

// ================================================================
// หน้านี้คือ "จัดการตัวเลือกระบบ" เฉพาะ Super Admin เท่านั้นที่แก้ไขได้
// ใช้คุมรายชื่อที่โผล่เป็น dropdown ในฟอร์มอื่นๆ (รอบ TCAS / ระดับการศึกษา / ประเภทหลักสูตร)
// โดยไม่ต้องแก้โค้ดแล้ว deploy ใหม่ทุกครั้งที่มีรอบ/ระดับ/ประเภทใหม่เพิ่มมา
// ================================================================

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// แท็บหมวดที่จัดการได้ ต้องตรงกับค่า category ที่ backend รู้จัก (lookup.repository.js -> CATEGORIES)
const TABS = [
    { key: 'tcas_round', label: 'รอบ TCAS', icon: 'fas fa-bullhorn', hasIconColor: false },
    { key: 'degree_level', label: 'ระดับการศึกษา', icon: 'fas fa-user-graduate', hasIconColor: false },
    { key: 'curriculum_type', label: 'ประเภทหลักสูตร', icon: 'fas fa-graduation-cap', hasIconColor: true },
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
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'เปลี่ยนสถานะไม่สำเร็จ', confirmButtonColor: '#800000' });
        }
    };

    if (!isSuperAdmin) {
        return (
            <div className="lookup-no-access">
                <i className="fas fa-lock fa-2x mb-3"></i>
                <p>เฉพาะ Super Admin เท่านั้นที่เข้าหน้านี้ได้ค่ะ</p>
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
                        ตัวเลือกในหมวดนี้จะไปโผล่เป็น dropdown ในฟอร์มที่เกี่ยวข้องทันที ไม่ต้องแก้โค้ด
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
                                            placeholder="เช่น รอบที่ 5 รับตรงพิเศษ"
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
                                        <div className="row g-3 mb-3">
                                            <div className="col-7">
                                                <label className="lookup-form-label">ไอคอน (Font Awesome class)</label>
                                                <input
                                                    type="text"
                                                    className="form-control lookup-form-control"
                                                    value={form.icon}
                                                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                                                    placeholder="เช่น fas fa-flask"
                                                />
                                            </div>
                                            <div className="col-5">
                                                <label className="lookup-form-label">สีประจำ</label>
                                                <input
                                                    type="color"
                                                    className="form-control form-control-color w-100"
                                                    value={form.accentColor}
                                                    onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                                                />
                                            </div>
                                        </div>
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
