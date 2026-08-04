import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Chart from 'react-apexcharts';
import '../../styles/manage-admin.css';
import axios from 'axios';
import AdminViewModal from '../../components/AdminViewModal';

// ================================================================
// หน้านี้คือ "จัดการบัญชีผู้ดูแลระบบ" เฉพาะ Super Admin เท่านั้นที่เข้าได้
// ใช้เพิ่ม/แก้ไข/ระงับสิทธิ์บัญชีแอดมินคนอื่น ๆ ในระบบ (ไม่มีปุ่มลบถาวรแล้ว)
// ================================================================

const ManageAdmin = () => {
    // เช็คสิทธิ์จาก localStorage ว่าคนที่ล็อกอินอยู่ตอนนี้เป็น Super Admin ไหม
    // ถ้าไม่ใช่ จะโดนกันไม่ให้เพิ่ม/แก้/ระงับสิทธิ์ใคร (ดูได้อย่างเดียว)
    const currentAdminRole = localStorage.getItem('admin_role') || 'Admin';
    const isSuperAdmin = currentAdminRole === 'Super Admin';

    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [viewAdmin, setViewAdmin] = useState(null); // แอดมินที่กำลังเปิดดูรายละเอียดแบบอ่านอย่างเดียว (null = ไม่ได้เปิด)
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [allowEditPass, setAllowEditPass] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Admin',
        status: 1
    });

    useEffect(() => {
        if (!isSuperAdmin) {
            Swal.fire({
                icon: 'error',
                title: 'ปฏิเสธการเข้าถึง',
                text: 'ขออภัยค่ะ เฉพาะบัญชีสิทธิ์ Super Admin เท่านั้นที่มีสิทธิ์เข้าจัดการระบบในส่วนนี้',
                confirmButtonColor: '#800000'
            });
            setLoading(false);
            return;
        }
        fetchAdmins();
    }, [isSuperAdmin]);

    // ----- ดึงรายชื่อแอดมินทั้งหมดจาก API มาโชว์ -----
    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/admins', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data && response.data.data) {
                setAdmins(response.data.data);
            }
        } catch (error) {
            console.error("Fetch Admins Error:", error);
            Swal.fire({
                icon: 'error',
                title: 'โหลดข้อมูลล้มเหลว',
                text: 'ไม่สามารถดึงข้อมูลผู้ดูแลระบบจากเซิร์ฟเวอร์ได้',
                confirmButtonColor: '#800000'
            });
        } finally {
            setLoading(false);
        }
    };

    // ----- เปิด modal โหมด "เพิ่มแอดมินใหม่" (ฟอร์มว่างเปล่า) -----
    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setEditId(null);
        setAllowEditPass(true);
        setFormData({
            name: '',
            lastname: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: 'Admin',
            status: 1
        });
        setShowModal(true);
    };

    // ----- เปิด modal โหมด "แก้ไข" โดยเติมข้อมูลแอดมินคนนั้นลงฟอร์ม -----
    const handleOpenEditModal = (admin) => {
        setIsEditMode(true);
        setEditId(admin.adminID);
        setAllowEditPass(false);
        setFormData({
            name: admin.name,
            lastname: admin.lastname,
            email: admin.email,
            // รหัสผ่านที่เก็บใน DB ตอนนี้เป็น hash แล้ว เอามาโชว์ไม่ได้ (ถอดกลับเป็นรหัสจริงไม่ได้)
            // ปล่อยว่างไว้ ถ้า Super Admin อยากเปลี่ยนค่อยเปิดสวิตช์แล้วพิมพ์รหัสใหม่เอง
            password: '',
            confirmPassword: '',
            role: admin.role,
            status: admin.status
        });
        setShowModal(true);
    };

    // ----- กดปุ่ม "บันทึกข้อมูลระบบ" ในฟอร์ม ใช้ทั้งเพิ่มใหม่และแก้ไข -----
    const handleSubmit = async (e) => {
        e.preventDefault();

        // ตรวจสอบความถูกต้องของรหัสผ่านกับการยืนยันรหัสผ่าน
        if ((!isEditMode || allowEditPass) && formData.password !== formData.confirmPassword) {
            Swal.fire({
                icon: 'warning',
                title: 'รหัสผ่านไม่ตรงกัน',
                text: 'กรุณากรอกรหัสผ่านและยืนยันรหัสผ่านให้ตรงกันอีกครั้ง',
                confirmButtonColor: '#d33'
            });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const payload = { ...formData };
            
            delete payload.confirmPassword;
            if (isEditMode && !allowEditPass) {
                delete payload.password;
            }

            if (isEditMode) {
                await axios.put(`http://localhost:5000/api/admins/${editId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire({ icon: 'success', title: 'อัปเดตข้อมูลสำเร็จ', timer: 1500, showConfirmButton: false });
            } else {
                await axios.post('http://localhost:5000/api/admins', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire({ icon: 'success', title: 'เพิ่มผู้ดูแลระบบสำเร็จ', timer: 1500, showConfirmButton: false });
            }
            setShowModal(false);
            fetchAdmins();
        } catch (error) {
            console.error("Submit Error:", error);
            const errorMsg = error.response?.data?.message || "กรุณาตรวจสอบข้อมูลที่กรอก";
            Swal.fire({
                icon: 'error',
                title: 'บันทึกข้อมูลไม่สำเร็จ',
                text: `สาเหตุ: ${errorMsg}`,
                confirmButtonColor: '#800000'
            });
        }
    };

    // ----- Super Admin กดดูรหัสผ่านปัจจุบันของแอดมินคนไหนก็ได้ -----
    // ยิงไป endpoint เฉพาะ /password ที่ backend เช็คสิทธิ์ Super Admin ซ้ำอีกชั้นเสมอ (ต่อให้แก้หน้าเว็บก็ข้ามไม่ได้)
    const handleViewPassword = async (admin) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/admins/${admin.adminID}/password`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const password = response.data.data.password;
            Swal.fire({
                icon: 'info',
                title: `รหัสผ่านของ ${admin.name} ${admin.lastname}`,
                text: password,
                confirmButtonText: 'ปิด',
                confirmButtonColor: '#800000',
                customClass: { popup: 'kuse-swal-popup', title: 'kuse-swal-title' }
            });
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'ไม่สามารถดูรหัสผ่านได้';
            Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: errorMsg, confirmButtonColor: '#800000' });
        }
    };

    // เอาไว้กันตัวอักษรพิเศษในชื่อ/อีเมล ไปทำโครงสร้าง HTML ของตารางพัง (escape ก่อนแปะลง innerHTML เสมอ)
    const escapeHtml = (str) => String(str ?? '').replace(/[&<>"']/g, (ch) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
    ));

    // ----- Super Admin กดดูรหัสผ่านของทุกบัญชีพร้อมกันทีเดียว -----
    const handleViewAllPasswords = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/admins/passwords', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const list = response.data.data;

            const rowsHtml = list.map((a) => `
                <tr>
                    <td style="padding:8px;text-align:left;border-bottom:1px solid #eee;">${escapeHtml(a.name)} ${escapeHtml(a.lastname)}</td>
                    <td style="padding:8px;text-align:left;border-bottom:1px solid #eee;color:#666;">${escapeHtml(a.email)}</td>
                    <td style="padding:8px;text-align:left;border-bottom:1px solid #eee;font-weight:700;">${escapeHtml(a.password)}</td>
                </tr>
            `).join('');

            Swal.fire({
                icon: 'info',
                title: 'รหัสผ่านปัจจุบันของทุกบัญชี',
                html: `
                    <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
                        <thead>
                            <tr>
                                <th style="padding:8px;text-align:left;border-bottom:2px solid #800000;">ชื่อ-นามสกุล</th>
                                <th style="padding:8px;text-align:left;border-bottom:2px solid #800000;">อีเมล</th>
                                <th style="padding:8px;text-align:left;border-bottom:2px solid #800000;">รหัสผ่าน</th>
                            </tr>
                        </thead>
                        <tbody>${rowsHtml}</tbody>
                    </table>
                `,
                width: 650,
                confirmButtonText: 'ปิด',
                confirmButtonColor: '#800000',
                customClass: { popup: 'kuse-swal-popup', title: 'kuse-swal-title' }
            });
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'ไม่สามารถดูรหัสผ่านได้';
            Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: errorMsg, confirmButtonColor: '#800000' });
        }
    };

    // ----- ระงับสิทธิ์ชั่วคราว -----
    // ใช้ PUT ตั้ง status = 0 (คนละอันกับปุ่ม "ลบ" ที่ลบข้อมูลออกจากฐานข้อมูลจริง)
    // ข้อมูลของแอดมินคนนี้ยังอยู่ครบ แค่ล็อกอินเข้าระบบไม่ได้ชั่วคราว คืนสิทธิ์ทีหลังได้
    const handleSuspend = (admin) => {
        if (!isSuperAdmin) return;

        Swal.fire({
            title: 'ยืนยันการระงับสิทธิ์?',
            text: `บัญชีของ คุณ ${admin.name} ${admin.lastname} จะไม่สามารถล็อกอินเข้าใช้งานระบบหลังบ้านได้ชั่วคราว (ข้อมูลยังอยู่ในระบบ คืนสิทธิ์ได้ภายหลัง)`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ระงับการใช้งาน',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true,
            customClass: {
                confirmButton: 'btn btn-danger px-4 rounded-pill mx-2 shadow',
                cancelButton: 'btn btn-light px-4 rounded-pill mx-2',
                popup: 'kuse-swal-popup',
                title: 'kuse-swal-title'
            },
            buttonsStyling: false
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('token');
                    const payload = {
                        name: admin.name,
                        lastname: admin.lastname,
                        email: admin.email,
                        role: admin.role,
                        status: 0
                    };
                    await axios.put(`http://localhost:5000/api/admins/${admin.adminID}`, payload, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    Swal.fire({ icon: 'success', title: 'ระงับสิทธิ์เรียบร้อยแล้ว', confirmButtonColor: '#800000' });
                    fetchAdmins();
                } catch (error) {
                    const errorMsg = error.response?.data?.message || 'เกิดข้อผิดพลาดจากระบบ';
                    Swal.fire({ icon: 'error', title: 'ระงับสิทธิ์ไม่สำเร็จ', text: errorMsg, confirmButtonColor: '#800000' });
                }
            }
        });
    };

    // ----- คืนสิทธิ์ให้บัญชีที่เคยถูกระงับไว้ (เปลี่ยน status กลับเป็น 1) -----
    const handleRestore = async (admin) => {
        if (!isSuperAdmin) return;

        Swal.fire({
            title: 'ยืนยันการคืนสิทธิ์?',
            text: `บัญชีของ คุณ ${admin.name} ${admin.lastname} จะกลับมาใช้งานระบบได้ตามปกติ`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'คืนสิทธิ์การใช้งาน',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true,
            customClass: {
                confirmButton: 'btn btn-success px-4 rounded-pill mx-2 shadow',
                cancelButton: 'btn btn-light px-4 rounded-pill mx-2',
                popup: 'kuse-swal-popup',
                title: 'kuse-swal-title'
            },
            buttonsStyling: false
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('token');
                    const payload = {
                        name: admin.name,
                        lastname: admin.lastname,
                        email: admin.email,
                        role: admin.role,
                        status: 1
                    };

                    await axios.put(`http://localhost:5000/api/admins/${admin.adminID}`, payload, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    Swal.fire({ icon: 'success', title: 'คืนสิทธิ์การใช้งานสำเร็จ', timer: 1500, showConfirmButton: false });
                    fetchAdmins();
                } catch (error) {
                    Swal.fire({ icon: 'error', title: 'ไม่สามารถคืนสิทธิ์ได้', confirmButtonColor: '#800000' });
                }
            }
        });
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-border text-danger" role="status">
                    <span className="visually-hidden">กำลังโหลด...</span>
                </div>
            </div>
        );
    }

    // ----- สรุปจำนวนตามระดับสิทธิ์และสถานะ สำหรับการ์ดสรุป + กราฟวงกลมด้านบน -----
    const superAdminCount = admins.filter((a) => a.role === 'Super Admin').length;
    const adminCount = admins.filter((a) => a.role !== 'Super Admin').length;
    const activeCount = admins.filter((a) => Number(a.status) === 1).length;
    const suspendedCount = admins.filter((a) => Number(a.status) === 0).length;

    const statusChartOptions = {
        chart: { type: 'donut', fontFamily: "'IBM Plex Sans Thai', 'Anuphan', sans-serif" },
        labels: ['ปกติ', 'ถูกระงับสิทธิ์'],
        colors: ['#2b8a3e', '#c0392b'],
        stroke: { width: 2, colors: ['#fff'] },
        legend: { position: 'right', fontSize: '12px', markers: { size: 6 }, itemMargin: { vertical: 4 }, offsetY: 8 },
        dataLabels: {
            enabled: true,
            style: { fontSize: '10px', fontWeight: 600 },
            formatter: (val) => `${val.toFixed(0)}%`,
            dropShadow: { enabled: false },
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'ทั้งหมด',
                            fontSize: '11px',
                            color: '#9aa0a6',
                            formatter: () => admins.length,
                        },
                        value: { fontSize: '16px', fontWeight: 700, color: '#1a1a2e' },
                    },
                },
            },
        },
        tooltip: { y: { formatter: (val) => `${val} บัญชี` } },
    };
    const statusChartSeries = [activeCount, suspendedCount];

    // ----- ส่วนแสดงผล (JSX) เริ่มจากตรงนี้ลงไป -----
    return (
        <div className="container-fluid manage-admin-container px-4 py-3">
            {/* การ์ดสรุปจำนวนตามระดับสิทธิ์ + กราฟวงกลมสถานะสิทธิ์ */}
            <div className="row g-3 mb-3 admin-summary-row">
                <div className="col-md-3">
                    <div className="admin-summary-card card-super-summary">
                        <div className="summary-icon-shape"><i className="fas fa-crown"></i></div>
                        <div>
                            <div className="summary-number">{superAdminCount}</div>
                            <div className="summary-label">Super Admin</div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="admin-summary-card card-admin-summary">
                        <div className="summary-icon-shape"><i className="fas fa-user-shield"></i></div>
                        <div>
                            <div className="summary-number">{adminCount}</div>
                            <div className="summary-label">Admin</div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="admin-summary-card card-status-chart">
                        <div className="summary-chart-title">สถานะสิทธิ์<br />การใช้งาน</div>
                        <div className="summary-chart-body">
                            <Chart options={statusChartOptions} series={statusChartSeries} type="donut" height={110} />
                        </div>
                    </div>
                </div>
            </div>

            {/* แถบหัวข้อ + ปุ่มเพิ่มแอดมินใหม่ (ปุ่มนี้จะโชว์เฉพาะ Super Admin เท่านั้น) */}
            <div className="report-section mb-4 admin-toolbar">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div className="admin-toolbar-title">
                        <h4 className="fw-bold mb-1 text-dark">บัญชีผู้ดูแลระบบ</h4>
                        <p className="text-muted small mb-0">
                            จัดการบัญชีและระดับสิทธิ์การเข้าใช้งานระบบควบคุมหลังบ้าน KUSE — ทั้งหมด {admins.length} บัญชี
                        </p>
                    </div>
                    {isSuperAdmin && (
                        <div className="d-flex gap-2">
                            <button className="btn btn-view-all-pass d-flex align-items-center gap-2" onClick={handleViewAllPasswords}>
                                <i className="fas fa-eye"></i> ดูรหัสผ่านทั้งหมด
                            </button>
                            <button className="btn btn-add-admin d-flex align-items-center gap-2" onClick={handleOpenAddModal}>
                                <i className="fas fa-plus-circle"></i> เพิ่มผู้ดูแลระบบใหม่
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* รายชื่อแอดมิน*/}
            <div className="report-section">
                <div className="table-responsive">
                    <table className="table admin-table align-middle mb-0">
                        <thead>
                            <tr>
                                <th>ชื่อ-นามสกุล</th>
                                <th>อีเมลแอดมิน</th>
                                <th>ระดับสิทธิ์</th>
                                <th>สถานะสิทธิ์</th>
                                <th className="text-center">การจัดการบัญชี</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-muted">ไม่พบข้อมูลบัญชีผู้ดูแลระบบในคลังข้อมูล</td>
                                </tr>
                            ) : (
                                admins.map((admin) => {
                                    const isActive = Number(admin.status) === 1;
                                    const isSuper = admin.role === 'Super Admin';
                                    return (
                                        <tr key={admin.adminID} className={!isActive ? 'is-suspended-row' : ''}>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className={`admin-avatar ${isSuper ? 'avatar-super' : 'avatar-admin'}`}>
                                                        {admin.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="fw-semibold text-dark">{admin.name} {admin.lastname}</span>
                                                </div>
                                            </td>
                                            <td className="text-muted">{admin.email}</td>
                                            <td>
                                                <span className={`badge-role ${isSuper ? 'bg-super' : 'bg-admin'}`}>
                                                    <i className={`fas ${isSuper ? 'fa-crown' : 'fa-user-shield'} me-1`}></i>
                                                    {admin.role}
                                                </span>
                                            </td>
                                            <td>
                                                {isActive ? (
                                                    <span className="admin-status-badge status-ok"><i className="fas fa-check-circle me-1"></i>ปกติ</span>
                                                ) : (
                                                    <span className="admin-status-badge status-suspend"><i className="fas fa-ban me-1"></i>ถูกระงับสิทธิ์</span>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                <div className="d-flex justify-content-center gap-2">
                                                    {isSuperAdmin && (
                                                        <button className="admin-action-btn action-view-detail" onClick={() => setViewAdmin(admin)} title="ดูรายละเอียด">
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                    )}
                                                    <button className="admin-action-btn action-edit" onClick={() => handleOpenEditModal(admin)} title="แก้ไขข้อมูล">
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    {isActive ? (
                                                        <button
                                                            className="admin-action-btn action-suspend"
                                                            onClick={() => handleSuspend(admin)}
                                                            disabled={!isSuperAdmin}
                                                            title="ระงับการใช้งานบัญชี"
                                                        >
                                                            <i className="fas fa-user-slash"></i>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="admin-action-btn action-restore"
                                                            onClick={() => handleRestore(admin)}
                                                            disabled={!isSuperAdmin}
                                                            title="คืนสิทธิ์การใช้งานบัญชี"
                                                        >
                                                            <i className="fas fa-user-check"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ส่วนแนะนำการจัดการบัญชี ดีไซน์หรูหราขึ้น */}
            <div className="card info-card-premium mt-4">
                <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-2">
                        <i className="fas fa-shield-alt text-danger fs-4"></i>
                        <h5 className="fw-bold text-dark mb-0">คำแนะนำการจัดการบัญชี</h5>
                    </div>
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="info-box-premium h-100 border-top-super">
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <span className="badge bg-super-premium"><i className="fas fa-crown"></i> Super Admin</span>
                                </div>
                                <p className="text-secondary small-text mb-0">มีสิทธิ์เต็มในการจัดการระบบทั้งหมด รวมถึงการจัดการบัญชีแอดมินรายอื่น</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="info-box-premium h-100 border-top-admin">
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <span className="badge bg-admin-premium"><i className="fas fa-user-shield"></i> Admin</span>
                                </div>
                                <p className="text-secondary small-text mb-0">สามารถจัดการข้อมูลทั่วไปในระบบได้ แต่ไม่สามารถจัดการบัญชีผู้ดูแลระบบอื่นได้</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="info-box-premium h-100 border-top-suspend">
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <span className="badge bg-suspend-premium"><i className="fas fa-ban"></i> การระงับการใช้งาน</span>
                                </div>
                                <p className="text-suspend-warning small-text mb-0">จะทำให้ผู้ดูแลระบบคนดังกล่าวไม่สามารถเข้าสู่ระบบเพื่อจัดการข้อมูลได้ทันที</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 shadow-xl style-modal-custom">
                            <div className="modal-header border-0 modal-custom-header py-3 px-4">
                                <h5 className="modal-title fw-bold text-white mb-0">
                                    <i className={`fas ${isEditMode ? 'fa-user-edit' : 'fa-user-plus'} me-2`}></i>
                                    {isEditMode ? 'แก้ไขข้อมูลผู้ดูแลระบบ' : 'เพิ่มผู้ดูแลระบบใหม่เข้าสู่ระบบ'}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body p-4 bg-modal-light">
                                <form onSubmit={handleSubmit} className="form-horizontal-custom">
                                    
                                    {/* แถว ชื่อจริง - นามสกุล */}
                                    <div className="form-row-group mb-3">
                                        <div className="form-row-half">
                                            <label className="form-label-left"><i className="fas fa-user text-muted me-2"></i>ชื่อจริง</label>
                                            <div className="form-input-right">
                                                <input type="text" className="form-control-kuse" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="กรอกชื่อจริง" />
                                            </div>
                                        </div>
                                        <div className="form-row-half">
                                            <label className="form-label-left"><i className="fas fa-address-card text-muted me-2"></i>นามสกุล</label>
                                            <div className="form-input-right">
                                                <input type="text" className="form-control-kuse" required value={formData.lastname} onChange={(e) => setFormData({...formData, lastname: e.target.value})} placeholder="กรอกนามสกุล" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* แถว อีเมลแอดมิน */}
                                    <div className="form-row-single mb-3">
                                        <label className="form-label-left"><i className="fas fa-envelope text-muted me-2"></i>อีเมลแอดมิน</label>
                                        <div className="form-input-right">
                                            <input type="email" className="form-control-kuse" required disabled={isEditMode} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="example@kuse.com" />
                                        </div>
                                    </div>

                                    {/* สวิตช์สลับปลดล็อกรหัสผ่านกรณีเป็นโหมดแก้ไข */}
                                    {isEditMode && (
                                        <div className="form-row-single mb-3">
                                            <div className="form-label-left"></div>
                                            <div className="form-input-right">
                                                <div className="form-check form-switch bg-switch-custom p-2 rounded ps-5">
                                                    <input className="form-check-input" type="checkbox" id="allowPass" checked={allowEditPass} onChange={(e) => setAllowEditPass(e.target.checked)} />
                                                    <label className="form-check-label small fw-bold text-dark" htmlFor="allowPass">ต้องการเปลี่ยนรหัสผ่านใหม่ของแอดมินท่านนี้</label>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* แถว รหัสผ่านระบบ */}
                                    {(!isEditMode || allowEditPass) && (
                                        <>
                                            <div className="form-row-single mb-3">
                                                <label className="form-label-left"><i className="fas fa-lock text-muted me-2"></i>รหัสผ่านระบบ {isEditMode && '(ใหม่)'}</label>
                                                <div className="form-input-right position-relative">
                                                    <input type={showPassword ? "text" : "password"} className="form-control-kuse pe-5" required={!isEditMode} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="ตั้งรหัสผ่านขั้นต่ำ 6 ตัวอักษร" />
                                                    <div className="pass-toggle-wrapper" onClick={() => setShowPassword(!showPassword)}>
                                                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* แถว ยืนยันรหัสผ่านใหม่ */}
                                            <div className="form-row-single mb-3">
                                                <label className="form-label-left"><i className="fas fa-shield-alt text-muted me-2"></i>ยืนยันรหัสผ่าน</label>
                                                <div className="form-input-right position-relative">
                                                    <input type={showConfirmPassword ? "text" : "password"} className="form-control-kuse pe-5" required={!isEditMode} value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} placeholder="กรอกรหัสผ่านซ้ำอีกครั้งเพื่อยืนยัน" />
                                                    <div className="pass-toggle-wrapper" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                        <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* แถว ระดับสิทธิ์ */}
                                    <div className="form-row-single mb-4">
                                        <label className="form-label-left"><i className="fas fa-user-tag text-muted me-2"></i>ระดับสิทธิ์</label>
                                        <div className="form-input-right">
                                            <select className="form-select-kuse" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                                                <option value="Admin">Admin (ผู้ดูแลระบบ)</option>
                                                <option value="Super Admin">Super Admin (ผู้ดูแลระบบสูงสุด)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="modal-footer border-0 p-0 d-flex justify-content-end gap-2 mt-4">
                                        <button type="button" className="btn btn-cancel-premium" onClick={() => setShowModal(false)}>ยกเลิก</button>
                                        <button type="submit" className="btn btn-save-premium">บันทึกข้อมูลระบบ</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========== VIEW MODAL (ดูรายละเอียด อ่านอย่างเดียว) ========== */}
            {viewAdmin && (
                <AdminViewModal
                    admin={viewAdmin}
                    onClose={() => setViewAdmin(null)}
                    onEdit={() => {
                        const admin = viewAdmin;
                        setViewAdmin(null);
                        handleOpenEditModal(admin);
                    }}
                    onViewPassword={isSuperAdmin ? () => handleViewPassword(viewAdmin) : null}
                />
            )}
        </div>
    );
};

export default ManageAdmin;