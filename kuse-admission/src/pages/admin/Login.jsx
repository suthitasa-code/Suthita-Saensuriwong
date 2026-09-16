import { useState } from 'react';
import Swal from '../../utils/swal';
import '../../styles/login.css';
import { useNavigate } from 'react-router-dom'; // 👑 นำเข้า useNavigate เพื่อใช้เปลี่ยนหน้าแทน window.location.href
import axios from 'axios'; // 👑 นำเข้า axios เพื่อยิงหาหลังบ้าน
import { API_BASE } from '../../config/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate(); // 👑 เรียกใช้งานฟังก์ชันนำทางของ React Router

    const handleForgotPassword = (e) => {
        e.preventDefault();
        Swal.fire({
            icon: 'info',
            title: 'ลืมรหัสผ่าน?',
            text: 'กรุณาติดต่อผู้ดูแลระบบสูงสุด (Super Admin) เพื่อขอรีเซ็ตรหัสผ่านใหม่ให้กับบัญชีของท่าน',
            confirmButtonColor: '#800000',
            customClass: { popup: 'kuse-swal-popup', title: 'kuse-swal-title' }
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        Swal.fire({
            title: 'กำลังตรวจสอบข้อมูลของท่าน...',
            customClass: { popup: 'kuse-swal-popup', title: 'kuse-swal-title' },
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        try {
            // 👑 ยิงอีเมล+รหัสผ่านไปให้ backend เช็คเองทั้งหมด (ไม่ผ่าน Firebase แล้ว)
            // backend จะเทียบรหัสผ่านกับ hash ที่เก็บไว้ใน MySQL แล้วออก token (JWT) กลับมาให้ถ้าถูกต้อง
            const response = await axios.post(`${API_BASE}/api/admins/login`, {
                email,
                password
            });

            if (response.data.success) {
                const { token, admin: adminData } = response.data.data; // { token, admin: { adminID, name, lastname, role, ... } }

                // เก็บ token + ข้อมูลแอดมินไว้ใช้งานต่อทั้งระบบ (ยิง API อื่นก็แนบ token ตัวนี้ไปด้วยทุกครั้ง)
                localStorage.setItem('token', token);
                localStorage.setItem('admin_id', adminData.adminID);
                localStorage.setItem('admin_name', adminData.name);
                localStorage.setItem('admin_lastname', adminData.lastname);
                localStorage.setItem('admin_role', adminData.role); // เก็บค่าสิทธิ์จริงจาก DB เช่น 'Super Admin' หรือ 'Admin'

                Swal.fire({
                    icon: 'success',
                    title: 'เข้าสู่ระบบสำเร็จ',
                    text: `ยินดีต้อนรับผู้ดูแลระบบ KUSE: คุณ ${adminData.name} (${adminData.role})`,
                    customClass: {
                        popup: 'kuse-swal-popup',
                        title: 'kuse-swal-title',
                    },
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                    backdrop: `rgba(0,0,0,0.4)`
                }).then(() => {
                    navigate('/admin/dashboard');
                });
            }
        } catch (error) {
            console.error("Login Error Details:", error);

            // ถอดข้อความ error ที่ backend ส่งมา (เช่น "อีเมลหรือรหัสผ่านไม่ถูกต้อง") มาแสดงผล
            const errorMessage = error.response?.data?.message || 'อีเมลหรือรหัสผ่านของท่านไม่ถูกต้อง';

            Swal.fire({
                icon: 'error',
                title: 'เข้าสู่ระบบไม่สำเร็จ',
                text: errorMessage,
                customClass: { popup: 'kuse-swal-popup', title: 'kuse-swal-title' }
            });
        }
    };

    return (
        <div className="login-page-wrapper">
            <div className="login-container">
                {/* ฝั่งซ้าย: Brand Section */}
                <div className="brand-section">
                    <i className="fas fa-graduation-cap fa-5x"></i>
                    <h1 className="display-5 fw-bold mb-2">KUSE ADMISSION</h1>
                    <p className="lead">คณะวิทยาศาสตร์และวิศวกรรมศาสตร์</p>
                    <div style={{ background: 'var(--kuse-gold)', height: '4px', width: '60px', margin: '15px auto', borderRadius: '2px' }}></div>
                    <p className="lead small">มหาวิทยาลัยเกษตรศาสตร์<br />วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร</p>
                </div>

                {/* ฝั่งขวา: Form Section */}
                <div className="form-section">
                    <div className="login-card">
                        <div className="text-center">
                            <div className="logo-container">
                                <img src="/images/KUSE_Logo_2021.png" alt="KUSE Logo" />
                            </div>
                            <h4 className="welcome-text">ยินดีต้อนรับเข้าสู่ระบบจัดการ<br/>ข้อมูลการรับเข้าศึกษา</h4>
                            <div style={{ height: '2px', width: '50px', background: 'var(--kuse-gold)', margin: '5px auto 5px', borderRadius: '2px' }}></div>
                            <p className="text-muted small mb-4">โปรดระบุข้อมูลเพื่อเข้าสู่ระบบผู้ดูแล</p>
                        </div>

                        <form onSubmit={handleLogin}>
                            <div className="input-box">
                                <i className="fas fa-envelope input-icon"></i>
                                <input 
                                    type="email" 
                                    className="form-control-custom" 
                                    placeholder=" " 
                                    required 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <label>อีเมลผู้ใช้งาน (เช่น admin@ku.th)</label>
                            </div>

                            <div className="input-box">
                                <i className="fas fa-lock input-icon"></i>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className="form-control-custom" 
                                    placeholder=" " 
                                    required 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <label>รหัสผ่าน</label>
                                <i 
                                    className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} eye-icon`} 
                                    onClick={() => setShowPassword(!showPassword)}
                                ></i>
                            </div>

                            <div className="forgot-password-wrapper">
                                <a href="#!" className="forgot-password-link" onClick={handleForgotPassword}>ลืมรหัสผ่านใช่หรือไม่?</a>
                            </div>

                            <button type="submit" className="btn-login">
                                เข้าสู่ระบบ <i className="fas fa-shield-alt ms-1"></i>
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="login-credit-footer">
                <p>เว็บแอปพลิเคชันให้ข้อมูลการรับเข้าศึกษาในคณะวิทยาศาสตร์และวิศวกรรมศาสตร์ มก.ฉกส.</p>
                <p>พัฒนาโดย สุธิตา แสนสุริวงค์ นิสิตหลักสูตรวิทยาศาสตรบัณฑิต (วท.บ.) สาขาวิทยาการคอมพิวเตอร์</p>
            </div>
        </div>
    );
};

export default Login;