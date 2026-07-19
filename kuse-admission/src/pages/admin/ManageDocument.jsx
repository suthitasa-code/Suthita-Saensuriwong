// --- src/pages/admin/ManageDocument.jsx ---
import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import '../../styles/manageDocument.css';

const API_BASE_URL = 'http://localhost:5000/api/document';
const DOWNLOAD_BASE_URL = 'http://localhost:5000/uploads/documents'; 

const ManageDocument = () => {
    const [documents, setDocuments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const fileInputRef = useRef(null);

    // Form State 
    const [selectedDocId, setSelectedDocId] = useState(null);
    const [editFile, setEditFile] = useState(null);
    const [uploadCategory, setUploadCategory] = useState('COURSE'); 
    const [editCategory, setEditCategory] = useState('OTHER'); 

    // 🔍 🛠️ State สำหรับระบบค้นหาและตัวกรอง (Filters)
    const [activeTab, setActiveTab] = useState('ALL'); 
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedExtension, setSelectedExtension] = useState('ALL'); 

    // 🔄 ดึงไฟล์เอกสารจาก Database
    const fetchDocuments = async () => {
        try {
            const response = await fetch(API_BASE_URL);
            const result = await response.json();
            if (result.success) {
                setDocuments(result.data);
            }
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการโหลดคลังเอกสาร:", error);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const getCategoryDetails = (categoryCode) => {
        switch (categoryCode) {
            case 'COURSE':
                return { label: 'หลักสูตรสาขา', className: 'badge-course' };
            case 'TCAS':
                return { label: 'ประกาศรับสมัคร', className: 'badge-tcas' };
            case 'MEDIA':
                return { label: 'รูปภาพ', className: 'badge-media' };
            default:
                return { label: 'เอกสารทั่วไป', className: 'badge-other' };
        }
    };

    // 🎯 Logic การกรองข้อมูล - เปลี่ยนไปค้นหาจากฟิลด์ชื่อไทย (originalFileName) ทำให้แอดมินพิมพ์หาภาษาไทยได้เลย!
    const filteredDocuments = documents.filter((doc) => {
        const matchesTab = activeTab === 'ALL' || doc.fileCategory === activeTab;
        
        // 📌 ค้นหาจากชื่อไทยเดิม
        const targetName = doc.originalFileName ? doc.originalFileName.toLowerCase() : doc.fileName.toLowerCase();
        const matchesSearch = targetName.includes(searchQuery.toLowerCase());
        
        const fileExt = doc.fileName.substring(doc.fileName.lastIndexOf('.')).toLowerCase();
        const matchesExt = selectedExtension === 'ALL' || fileExt === selectedExtension.toLowerCase();

        return matchesTab && matchesSearch && matchesExt;
    });

    const handleAddFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileCategory', uploadCategory); 
        formData.append('adminID', 1);

        Swal.fire({ title: 'กำลังอัปโหลดไฟล์...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });

        try {
            const response = await fetch(API_BASE_URL, { method: 'POST', body: formData });
            const result = await response.json();

            if (result.success) {
                Swal.fire({ title: 'อัปโหลดสำเร็จ!', text: result.message, icon: 'success', confirmButtonColor: '#800000' });
                fetchDocuments();
                if (fileInputRef.current) fileInputRef.current.value = "";
            } else {
                Swal.fire('อัปโหลดล้มเหลว', result.message, 'error');
            }
        } catch (error) {
            Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
        }
    };

    const openEditModal = (doc) => {
        setSelectedDocId(doc.documentID);
        setEditCategory(doc.fileCategory || 'OTHER'); 
        setEditFile(null);
        setShowModal(true);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        if (editFile) {
            formData.append('file', editFile); 
        }
        formData.append('fileCategory', editCategory); 
        formData.append('adminID', 1);

        Swal.fire({ title: 'กำลังบันทึกข้อมูล...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });

        try {
            const response = await fetch(`${API_BASE_URL}/${selectedDocId}`, { method: 'PUT', body: formData });
            const result = await response.json();

            if (result.success) {
                Swal.fire({ title: 'แก้ไขสำเร็จ!', text: result.message, icon: 'success', confirmButtonColor: '#800000' });
                setShowModal(false);
                fetchDocuments();
            } else {
                Swal.fire('แก้ไขล้มเหลว', result.message, 'error');
            }
        } catch (error) {
            Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถแก้ไขข้อมูลได้', 'error');
        }
    };

    const handleDeleteClick = (id) => {
        Swal.fire({
            title: 'ยืนยันการลบไฟล์?',
            text: "เมื่อลบแล้วไฟล์ตัวจริงและข้อมูลในระบบจะหายไปทันที!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#800000',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'ใช่, ลบเลย',
            cancelButtonText: 'ยกเลิก'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
                    const data = await response.json();
                    if (data.success) {
                        Swal.fire('ลบเรียบร้อย!', data.message, 'success');
                        fetchDocuments();
                    } else {
                        Swal.fire('ลบล้มเหลว', data.message, 'error');
                    }
                } catch (error) {
                    Swal.fire('เกิดข้อผิดพลาด', 'ลบข้อมูลล้มเหลว', 'error');
                }
            }
        });
    };

    // 👁️ ใช้ชื่อไฟล์ภาษาอังกฤษฝั่งเซิร์ฟเวอร์วิ่งไปโหลดไฟล์ เพื่อป้องกันปัญหา URL พัง
    const handlePreviewFile = (realServerFileName, originalThaiName) => {
        const fileUrl = `${DOWNLOAD_BASE_URL}/${realServerFileName}`;
        const fileExt = realServerFileName.substring(realServerFileName.lastIndexOf('.')).toLowerCase();

        if (['.jpg', '.jpeg', '.png'].includes(fileExt)) {
            Swal.fire({
                title: originalThaiName || 'ตัวอย่างไฟล์รูปภาพ',
                imageUrl: fileUrl,
                imageAlt: realServerFileName,
                width: 'auto',
                maxWidth: '80%',
                confirmButtonColor: '#800000',
                confirmButtonText: 'ปิดหน้าต่าง'
            });
        } else if (fileExt === '.pdf') {
            Swal.fire({
                title: originalThaiName || 'ตัวอย่างไฟล์เอกสาร PDF',
                html: `<iframe src="${fileUrl}" width="100%" height="500px" style="border:none; border-radius:12px;"></iframe>`,
                width: '80%',
                confirmButtonColor: '#800000',
                confirmButtonText: 'ปิดหน้าต่าง'
            });
        } else {
            window.open(fileUrl, '_blank');
        }
    };

    const formatThaiDate = (dateString) => {
        const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleString('th-TH', options);
    };

    return (
        <div className="container-fluid px-4 py-4 animate__animated animate__fadeIn">

            {/* การ์ดแนะนำขั้นตอนการอัปโหลดเอกสาร */}
            <div className="doc-guide-card mb-4">
                <div className="doc-guide-step">
                    <div className="doc-guide-icon"><span>1</span></div>
                    <div className="doc-guide-text">
                        <div className="doc-guide-title">เลือกประเภทเอกสาร</div>
                        <div className="doc-guide-desc">เลือกหมวดหมู่ที่ตรงกับไฟล์ที่จะอัปโหลดจากเมนูด้านล่าง</div>
                    </div>
                </div>
                <div className="doc-guide-arrow"><i className="fas fa-chevron-right"></i></div>
                <div className="doc-guide-step">
                    <div className="doc-guide-icon"><span>2</span></div>
                    <div className="doc-guide-text">
                        <div className="doc-guide-title">อัปโหลดไฟล์</div>
                        <div className="doc-guide-desc">คลิกกล่องเส้นประเพื่อเลือกไฟล์จากเครื่องแล้วบันทึกเข้าสู่ระบบ</div>
                    </div>
                </div>
            </div>

            {/* 1. ส่วนกำหนดประเภท และกล่องอัปโหลดด้านบน */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card p-3 mb-3 border-0 shadow-sm" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
                        <label className="form-label fw-bold text-dark mb-2">
                            <i className="fas fa-tags me-2 text-maroon"></i>เลือกประเภทเอกสารที่ต้องการอัปโหลดก่อน
                        </label>
                        <select
                            className="form-select form-doc-control-custom"
                            value={uploadCategory}
                            onChange={(e) => setUploadCategory(e.target.value)}
                            style={{ maxWidth: '400px', cursor: 'pointer' }}
                        >
                            <option value="COURSE">🎓 เอกสารหลักสูตร</option>
                            <option value="TCAS">📢 ประกาศรับสมัคร / TCAS</option>
                            <option value="MEDIA">🖼️ รูปภาพ</option>
                            <option value="OTHER">📄 เอกสารทั่วไป / คู่มือการสมัคร</option>
                        </select>
                    </div>

                    <div className="upload-zone-card" onClick={() => fileInputRef.current.click()}>
                        <div className="upload-icon-wrapper"><i className="fas fa-cloud-upload-alt"></i></div>
                        <h5 className="fw-bold text-dark mb-1">คลิกตรงนี้เพื่อเลือกไฟล์บันทึกเข้าสู่ระบบ</h5>
                        <p className="text-muted small mb-3">ระบบจะเก็บชื่อไฟล์ภาษาไทยดั้งเดิมเพื่อให้คุณค้นหาง่าย และตั้งชื่อภาษาอังกฤษให้หลังบ้านเสถียร</p>
                        <button className="btn-maroon px-4 shadow-sm"><i className="fas fa-file-medical me-2"></i>เลือกไฟล์จากเครื่อง</button>
                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleAddFileChange} accept=".pdf, .jpg, .jpeg, .png" />
                    </div>
                </div>
            </div>

            {/* 2. บาร์ระบบกรองและค้นหาอัจฉริยะ (Smart Filters) */}
            <div className="filter-action-bar mb-4">
                <div className="category-tabs mb-3">
                    <button className={`tab-item ${activeTab === 'ALL' ? 'active' : ''}`} onClick={() => setActiveTab('ALL')}>📂 ทั้งหมด</button>
                    <button className={`tab-item ${activeTab === 'COURSE' ? 'active' : ''}`} onClick={() => setActiveTab('COURSE')}>🎓 ไฟล์หลักสูตร</button>
                    <button className={`tab-item ${activeTab === 'TCAS' ? 'active' : ''}`} onClick={() => setActiveTab('TCAS')}>📢 ประกาศรับสมัคร/TCAS</button>
                    <button className={`tab-item ${activeTab === 'MEDIA' ? 'active' : ''}`} onClick={() => setActiveTab('MEDIA')}>🖼️ รูปภาพ</button>
                    <button className={`tab-item ${activeTab === 'OTHER' ? 'active' : ''}`} onClick={() => setActiveTab('OTHER')}>📄 เอกสารทั่วไป</button>
                </div>

                <div className="row g-3">
                    <div className="col-md-8">
                        <div className="search-input-group">
                            <i className="fas fa-search"></i>
                            <input 
                                type="text" 
                                className="form-control form-doc-control-custom search-input-custom" 
                                placeholder="พิมพ์ชื่อไฟล์ภาษาไทยที่ต้องการค้นหาได้เลย..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <select 
                            className="form-select form-doc-control-custom"
                            value={selectedExtension}
                            onChange={(e) => setSelectedExtension(e.target.value)}
                        >
                            <option value="ALL">🔍 แสดงทุกประเภทนามสกุลไฟล์</option>
                            <option value=".pdf">📄 ไฟล์เอกสาร (.pdf)</option>
                            <option value=".jpg">🖼️ ไฟล์รูปภาพ (.jpg / .jpeg)</option>
                            <option value=".png">🖼️ ไฟล์รูปภาพพื้นหลังใส (.png)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 3. ตารางแสดงผล */}
            <div className="row">
                <div className="col-12">
                    <div className="custom-table-card">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="doc-filter-result">
                                <i className="fas fa-filter"></i>
                                ผลการกรอง: พบข้อมูลทั้งหมด <span className="doc-filter-count">{filteredDocuments.length}</span> จาก {documents.length} รายการ
                            </div>
                        </div>
                        
                        <div className="table-responsive">
                            <table className="table table-kuse align-middle">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40%' }}>ชื่อไฟล์เอกสาร</th>
                                        <th style={{ width: '15%' }} className="text-center">หมวดหมู่</th>
                                        <th style={{ width: '10%' }} className="text-center">ขนาด</th>
                                        <th style={{ width: '15%' }} className="text-center">วันที่บันทึก</th>
                                        <th style={{ width: '20%' }} className="text-center">การจัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDocuments.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5 text-muted">
                                                <i className="fas fa-search-minus d-block mb-2 fs-3"></i>ไม่พบไฟล์ที่ตรงกับเงื่อนไขการค้นหาของคุณในขณะนี้
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredDocuments.map((doc) => {
                                            const fileCat = getCategoryDetails(doc.fileCategory);
                                            // 📌 เลือกเอาชื่อไทยมาโชว์ ถ้าไม่มีจริงๆ ค่อยถอยไปใช้ชื่ออังกฤษกันพัง
                                            const displayName = doc.originalFileName || doc.fileName;

                                            return (
                                                <tr key={doc.documentID}>
                                                    <td className="fw-bold text-dark text-break">
                                                        <span 
                                                            style={{ cursor: 'pointer' }} 
                                                            className="text-hover-preview" 
                                                            onClick={() => handlePreviewFile(doc.fileName, displayName)}
                                                        >
                                                            <i className="far fa-file-alt text-maroon me-2"></i>{displayName}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        <span className={`badge-category ${fileCat.className}`}>
                                                            {fileCat.label}
                                                        </span>
                                                    </td>
                                                    <td className="text-center text-muted fw-semibold">
                                                        {doc.fileSize} MB
                                                    </td>
                                                    <td className="text-center text-muted">
                                                        {formatThaiDate(doc.uploadDate)}
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="d-inline-flex align-items-center justify-content-center">
                                                            <button 
                                                                type="button"
                                                                className="btn btn-sm btn-outline-primary rounded-pill px-3 me-2 text-nowrap" 
                                                                style={{ fontSize: '0.8rem' }}
                                                                onClick={() => handlePreviewFile(doc.fileName, displayName)}
                                                            >
                                                                <i className="fas fa-eye me-1"></i>ดูไฟล์
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-outline-warning rounded-pill px-2 me-2 text-nowrap" 
                                                                style={{ fontSize: '0.8rem' }} 
                                                                onClick={() => openEditModal(doc)}
                                                            >
                                                                แก้ไข
                                                            </button>
                                                            <button 
                                                                className="btn-delete-small" 
                                                                onClick={() => handleDeleteClick(doc.documentID)}
                                                            >
                                                                <i className="fas fa-times"></i>
                                                            </button>
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
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-custom-content animate__animated animate__zoomIn">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold m-0"><i className="fas fa-sync-alt text-warning me-2"></i>อัปเดตข้อมูล / หมวดหมู่เอกสาร</h5>
                            <button className="btn-close" onClick={() => setShowModal(false)}></button>
                        </div>
                        <form onSubmit={handleUpdateSubmit}>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted mb-2">แก้ไขประเภทหมวดหมู่เอกสาร:</label>
                                <select 
                                    className="form-select form-doc-control-custom"
                                    value={editCategory}
                                    onChange={(e) => setEditCategory(e.target.value)}
                                    required
                                >
                                    <option value="COURSE">🎓 เอกสารหลักสูตร</option>
                                    <option value="TCAS">📢 ประกาศรับสมัคร / TCAS</option>
                                    <option value="MEDIA">🖼️ รูปภาพ</option>
                                    <option value="OTHER">📄 เอกสารทั่วไป / คู่มือการสมัคร</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="form-label small fw-bold text-muted mb-2">เลือกไฟล์ใหม่จากเครื่อง (ปล่อยว่างได้ หากต้องการเปลี่ยนแค่ประเภทหมวดหมู่)</label>
                                <input type="file" className="form-control form-doc-control-custom" onChange={(e) => setEditFile(e.target.files[0])} accept=".pdf, .jpg, .jpeg, .png" />
                            </div>
                            
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowModal(false)}>ยกเลิก</button>
                                <button type="submit" className="btn-maroon px-4 shadow-sm">บันทึกข้อมูล</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageDocument;