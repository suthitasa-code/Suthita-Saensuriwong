import { useState, useEffect, useRef } from 'react';
import Swal from '../utils/swal';
import '../styles/manageBanner.css';

// 🌟 กล่องจัดการแบนเนอร์แบบใช้ซ้ำได้ — ควบคุมด้วย pageTarget ว่าเป็นแบนเนอร์ของหน้าไหน
// (เช่น 'home' = หน้าแรก, 'curriculum' = หน้ารวมหลักสูตร) ข้อมูลเก็บรวมกันในตาราง
// carouselbanner เดียวกัน แต่แต่ละหน้าแอดมินจะเห็น/แก้ไขเฉพาะแบนเนอร์ของ pageTarget ตัวเองเท่านั้น
const API_BASE_URL = 'http://localhost:5000/api/carouselbanner';
const IMAGE_BASE_URL = 'http://localhost:5000/uploads/admin-images';

const BannerManagerPanel = ({
    pageTarget,
    heading,
    addButtonLabel,
    modalTitleAdd,
    modalTitleEdit,
    emptyText,
}) => {
    const [banners, setBanners] = useState([]);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [bannerId, setBannerId] = useState(null);
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [displayOrder, setDisplayOrder] = useState(1);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    // 🔄 ฟังก์ชันดึงข้อมูลจาก Database จริงมาแสดงผลบนหน้าจอ (กรองเฉพาะ pageTarget ของหน้านี้)
    const fetchBanners = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}?pageTarget=${pageTarget}`);
            if (!response.ok) throw new Error('เรียกข้อมูลจากฐานข้อมูลล้มเหลว');
            const data = await response.json();
            setBanners(data);
        } catch (error) {
            console.error('Error fetching banners:', error);
        }
    };

    useEffect(() => {
        fetchBanners();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageTarget]);

    // 🖼️ สร้าง/เคลียร์ URL พรีวิวรูปที่เพิ่งเลือก ป้องกันหน่วยความจำรั่วเมื่อเปลี่ยนไฟล์
    useEffect(() => {
        if (!imageFile) {
            setImagePreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(imageFile);
        setImagePreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [imageFile]);

    const handleAddClick = () => {
        setBannerId(null);
        setTitle('');
        setSubtitle('');
        setDisplayOrder(banners.length + 1);
        setImageFile(null);
        setShowModal(true);
    };

    const handleEditClick = (banner) => {
        setBannerId(banner.bannerID); // ผูกไอดีตาม Primary Key ของตาราง (bannerID)
        setTitle(banner.title || '');
        setSubtitle(banner.subtitle || '');
        setDisplayOrder(banner.displayOrder || 1);
        setImageFile(null);
        setShowModal(true);
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // 💾 ฟังก์ชันบันทึกข้อมูลเข้า Database (ทั้งเพิ่มใหม่และแก้ไข)
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', title);
        formData.append('subtitle', subtitle);
        formData.append('displayOrder', displayOrder);
        formData.append('pageTarget', pageTarget);
        formData.append('bannerWidth', 1920);
        formData.append('bannerHeight', 600);
        formData.append('adminID', 1);

        if (imageFile) {
            formData.append('imageFile', imageFile);
        }

        try {
            let response;
            if (bannerId === null) {
                // เพิ่มข้อมูลใหม่ (POST)
                response = await fetch(API_BASE_URL, {
                    method: 'POST',
                    body: formData,
                });
            } else {
                // แก้ไขข้อมูลเก่าตาม ID (PUT)
                response = await fetch(`${API_BASE_URL}/${bannerId}`, {
                    method: 'PUT',
                    body: formData,
                });
            }

            if (!response.ok) {
                const result = await response.json().catch(() => ({}));
                throw new Error(result.message || 'ไม่สามารถบันทึกลงฐานข้อมูลได้');
            }

            Swal.fire({
                title: 'บันทึกข้อมูลสำเร็จ',
                text: 'บันทึกข้อมูลแบนเนอร์เรียบร้อยแล้ว',
                icon: 'success',
                confirmButtonColor: '#800000'
            });

            setShowModal(false);
            fetchBanners(); // รีเฟรชหน้าจอให้อัปเดตล่าสุดทันที
        } catch (error) {
            Swal.fire('เกิดข้อผิดพลาด', error.message, 'error');
        }
    };

    // ❌ ฟังก์ชันลบแบนเนอร์ออกจาก Database
    const handleDeleteClick = (id) => {
        Swal.fire({
            title: 'ยืนยันการลบ?',
            text: "คุณจะไม่สามารถกู้คืนรูปภาพแบนเนอร์นี้ได้",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#800000',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'ลบเลย',
            cancelButtonText: 'ยกเลิก'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`${API_BASE_URL}/${id}`, {
                        method: 'DELETE',
                    });
                    if (!response.ok) throw new Error('ลบข้อมูลล้มเหลว');

                    Swal.fire('ลบข้อมูลสำเร็จ', 'ลบแบนเนอร์ออกจากฐานข้อมูลเรียบร้อยแล้ว', 'success');
                    fetchBanners(); // รีเฟรชหน้าจอหลังจากลบเสร็จ
                } catch (error) {
                    Swal.fire('เกิดข้อผิดพลาด', error.message, 'error');
                }
            }
        });
    };

    return (
        <div className="banner-page-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold text-dark m-0"><i className="fas fa-images me-2 text-maroon"></i>{heading}</h4>
                <button className="btn-kuse-gold shadow-sm" onClick={handleAddClick}>
                    <i className="fas fa-plus me-2"></i>{addButtonLabel}
                </button>
            </div>

            <div className="size-alert-box">
                <i className="fas fa-info-circle fa-lg me-3 text-warning"></i>
                <div>
                    <strong className="d-block mb-1">คำแนะนำสำหรับขนาดรูปภาพ</strong>
                    <span className="small">แนะนำให้ใช้รูปภาพขนาดกว้าง <strong>1920px</strong> และสูง <strong>600px</strong> (สัดส่วน 16:5)</span>
                </div>
            </div>

            {/* Grid สำหรับวน Loop แสดงผลข้อมูลจากฐานข้อมูล */}
            <div className="banner-grid">
                {banners.length === 0 ? (
                    <div className="text-center w-100 py-5 text-muted">{emptyText}</div>
                ) : (
                    banners.map((banner) => (
                        <div className="banner-card shadow-sm" key={banner.bannerID}>
                            <div className="img-container">
                                <img
                                    src={`${IMAGE_BASE_URL}/${banner.imageFile}`}
                                    className="banner-img"
                                    alt={banner.title}
                                    onError={(e) => { e.target.src = 'https://placehold.co/1920x600?text=No+Image'; }}
                                />
                                <span className="order-badge">ลำดับที่ {banner.displayOrder}</span>
                            </div>
                            <div className="banner-info">
                                <h6 className="fw-bold text-truncate mb-1">{banner.title || 'ไม่มีหัวข้อ'}</h6>
                                <p className="text-muted small text-truncate mb-3">{banner.subtitle || 'ไม่มีรายละเอียด'}</p>
                                <div className="d-flex justify-content-end gap-2 border-top pt-2">
                                    <button className="btn-action-sm btn-edit" onClick={() => handleEditClick(banner)}>
                                        <i className="fas fa-pen"></i>
                                    </button>
                                    <button className="btn-action-sm btn-del" onClick={() => handleDeleteClick(banner.bannerID)}>
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pop-up Modal ฟอร์ม กรอก/แก้ไข ข้อมูล */}
            {showModal && (
                <div className="modal-wrapper">
                    <div className="modal-card">
                        <div className="modal-header-custom">
                            <h5 className="modal-title fw-bold m-0">
                                {bannerId === null ? modalTitleAdd : modalTitleEdit}
                            </h5>
                            <button className="btn-close-custom" onClick={() => setShowModal(false)}><i className="fas fa-times"></i></button>
                        </div>
                        <div className="modal-body-custom">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="small fw-bold form-label-dark mb-1">หัวข้อหลัก (Title)</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-custom"
                                        placeholder="กรอกชื่อหัวข้อหลัก"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="small fw-bold form-label-dark mb-1">คำบรรยายย่อย (Subtitle)</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-custom"
                                        placeholder="กรอกคำอธิบายย่อยสั้น ๆ"
                                        value={subtitle}
                                        onChange={(e) => setSubtitle(e.target.value)}
                                    />
                                </div>
                                <div className="row g-3 mb-4">
                                    <div className="col-12 col-sm-6">
                                        <label className="small fw-bold form-label-dark mb-1">ลำดับการแสดงผล</label>
                                        <input
                                            type="number"
                                            className="form-control form-control-custom"
                                            min="1"
                                            value={displayOrder}
                                            onChange={(e) => setDisplayOrder(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col-12 col-sm-6">
                                        <label className="small fw-bold form-label-dark mb-1">เลือกไฟล์รูปภาพ</label>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="form-control form-control-custom"
                                            accept="image/*"
                                            onChange={(e) => setImageFile(e.target.files[0] || null)}
                                            required={bannerId === null}
                                        />
                                        <span className="d-block small text-muted mt-1">แนะนำขนาด 1920 x 600 พิกเซล</span>
                                        {imageFile && (
                                            <div className="file-preview-chip">
                                                <img src={imagePreviewUrl} alt={imageFile.name} />
                                                <span className="file-preview-name" title={imageFile.name}>{imageFile.name}</span>
                                                <button type="button" className="btn-remove-file" onClick={handleRemoveImage}>
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-center mt-2">
                                    <button type="submit" className="btn-maroon shadow-sm">
                                        <i className="fas fa-save me-2"></i>บันทึกข้อมูล
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BannerManagerPanel;
