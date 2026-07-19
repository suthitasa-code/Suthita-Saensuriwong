import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

// 🌟 หัวข้อของแต่ละหน้า จะเปลี่ยนตาม path ที่กำลังใช้งานอยู่
const PAGE_HEADERS = {
    '/admin/dashboard': {
        title: 'สรุปข้อมูลประกาศรับสมัคร',
        subtitle: 'ยินดีต้อนรับเข้าสู่ระบบจัดการข้อมูล KUSE Admission',
    },
    '/admin/manage-tcas': {
        title: 'จัดการประกาศรับสมัคร',
        subtitle: 'ควบคุมข้อมูลที่แสดงในหน้า รายละเอียดการรับสมัคร',
    },
    '/admin/courses': {
        title: 'จัดการหลักสูตร',
        subtitle: 'จัดการข้อมูลรายสาขา จุดเด่น และไฟล์หลักสูตร (มคอ.)',
    },
    '/admin/banners': {
        title: 'จัดการรูปภาพหน้าแรก',
        subtitle: 'ควบคุมรูปภาพแบนเนอร์ที่แสดงในหน้าเว็บไซต์',
    },
    '/admin/documents': {
        title: 'คลังไฟล์เอกสาร',
        subtitle: 'จัดการไฟล์เอกสารทั้งหมดในระบบ',
    },
    '/admin/users': {
        title: 'บัญชีรายชื่อผู้ดูแลระบบทั้งหมด',
        subtitle: '',
    },
};

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [adminInfo, setAdminInfo] = useState({
        name: '',
        lastname: '',
        role: localStorage.getItem('admin_role') || '',
        email: '',
    });

    const pageHeader = PAGE_HEADERS[location.pathname] || PAGE_HEADERS['/admin/dashboard'];

    useEffect(() => {
        const name = localStorage.getItem('admin_name') || 'Suthita';
        const lastname = localStorage.getItem('admin_lastname') || 'Seansuriwong';
        const role = localStorage.getItem('admin_role') || 'Super Admin';
        const email = localStorage.getItem('admin_email') || '';
        const token = localStorage.getItem('token');

        if (!token && !localStorage.getItem('admin_name')) {
            navigate('/admin/login');
            return;
        }

        setAdminInfo({ name, lastname, role, email });
    }, [navigate]);

    const handleLogout = (e) => {
        e.preventDefault();
        Swal.fire({
            title: 'คุณต้องการออกจากระบบใช่หรือไม่?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#800000',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'ใช่, ออกจากระบบ',
            cancelButtonText: 'ยกเลิก',
            customClass: { popup: 'kuse-swal-popup', title: 'kuse-swal-title' }
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                navigate('/admin/login');
            }
        });
    };

    const getMenuClass = (path) =>
        location.pathname === path ? 'nav-link-custom active' : 'nav-link-custom';

    const getRoleLabel = (role) => {
        if (role === 'Super Admin') return 'ผู้ดูแลระบบสารสนเทศสูงสุด';
        if (role === 'Admin') return 'ผู้ดูแลระบบ';
        return role;
    };

    const isSuperAdmin = adminInfo.role === 'Super Admin';

    return (
        <div className="admin-layout-container">
            {/* ===== SIDEBAR ===== */}
            <aside className="sidebar">
                {/* Brand / Logo */}
                <div className="sidebar-brand">
                    <div className="brand-icon-wrapper">
                        <i className="fas fa-graduation-cap gold-cap"></i>
                    </div>
                    <h5 className="fw-bold brand-title">
                        KUSE ADMIN
                    </h5>
                    <small className="brand-subtitle">ระบบจัดการข้อมูล</small>
                </div>

                {/* Menu */}
                <div className="sidebar-menu-container">
                    <div className="nav-label">ข้อมูลวิเคราะห์</div>
                    <div
                        className={getMenuClass('/admin/dashboard')}
                        onClick={() => navigate('/admin/dashboard')}
                    >
                        <i className="fas fa-th-large me-2"></i> แดชบอร์ด
                    </div>

                    <div className="nav-label">ส่วนการจัดการ</div>
                    {/* 🌟 แม่ปรับ Path ตรงนี้ให้ตรงกับ App.jsx เพื่อแก้ปัญหาหน้าจอขาวให้แล้วจ้า */}
                    <div
                        className={getMenuClass('/admin/manage-tcas')}
                        onClick={() => navigate('/admin/manage-tcas')}
                    >
                        <i className="fas fa-bullhorn me-2"></i> จัดการประกาศรับสมัคร
                    </div>

                    <div
                        className={getMenuClass('/admin/courses')}
                        onClick={() => navigate('/admin/courses')}
                    >
                        <i className="fas fa-graduation-cap me-2"></i> จัดการหลักสูตร
                    </div>

                    <div
                        className={getMenuClass('/admin/banners')}
                        onClick={() => navigate('/admin/banners')}
                    >
                        <i className="fas fa-images me-2"></i> จัดการรูปภาพหน้าแรก
                    </div>

                    <div
                        className={getMenuClass('/admin/documents')}
                        onClick={() => navigate('/admin/documents')}
                    >
                        <i className="fas fa-file-archive me-2"></i> คลังไฟล์เอกสาร
                    </div>

                    {isSuperAdmin && (
                        <>
                            <div className="nav-label">บัญชีผู้ใช้</div>
                            <div
                                className={getMenuClass('/admin/users')}
                                onClick={() => navigate('/admin/users')}
                            >
                                <i className="fas fa-user-shield me-2"></i> ผู้ดูแลระบบ
                            </div>
                        </>
                    )}
                </div>

                {/* Logout */}
                <div className="sidebar-footer">
                    <div
                        className="nav-link-custom logout-btn"
                        onClick={handleLogout}
                    >
                        <i className="fas fa-power-off me-2"></i> ออกจากระบบ
                    </div>
                </div>
            </aside>

            {/* ===== MAIN CONTENT ===== */}
            <main className="main-content">
                {/* Header */}
                <div className="header-box">
                    <div className="title-area">
                        <h3 className="fw-bold m-0">{pageHeader.title}</h3>
                        <p className="text-muted m-0 subtitle-text">
                            {pageHeader.subtitle}
                        </p>
                    </div>

                    {/* Profile Chip */}
                    <div className="profile-chip">
                        <div className="text-end profile-info-wrapper">
                            <div className="profile-name">
                                {adminInfo.name} {adminInfo.lastname}
                            </div>
                            <div className="profile-role">
                                {getRoleLabel(adminInfo.role)}
                            </div>
                            <div className="profile-status">
                                <span className="status-dot">●</span> สถานะออนไลน์
                            </div>
                        </div>
                        <div className="avatar-wrapper">
                            <img
                                src={`https://ui-avatars.com/api/?name=${adminInfo.name}+${adminInfo.lastname}&background=800000&color=fff`}
                                className="rounded-circle profile-img"
                                width="40"
                                height="40"
                                alt="Avatar"
                            />
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;