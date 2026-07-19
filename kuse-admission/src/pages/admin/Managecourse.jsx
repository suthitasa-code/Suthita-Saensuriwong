import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import '../../styles/managecourse.css';

// ===================== CONFIG =====================
// ปรับให้ตรงกับที่ใช้ในไฟล์อื่น ๆ ของโปรเจกต์ (เช่น ManageTcas.jsx)
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_URL = `${API_BASE}/api/curriculum`;
const UPLOAD_URL = `${API_BASE}/uploads`;
const ADMIN_ID = localStorage.getItem('admin_id') || '';

// ตัวเลือกไอคอนสาขา (เก็บเป็นชื่อคลาส Font Awesome ลงคอลัมน์ icon)
// จัดกลุ่มตามสายวิชาของคณะวิทยาศาสตร์และวิศวกรรมศาสตร์ ให้เลือกไอคอนที่ตรงกับสาขาได้ง่ายขึ้น
const ICON_GROUPS = [
    {
        label: 'วิศวกรรมโยธา & สิ่งแวดล้อม',
        icons: ['fas fa-road', 'fas fa-city', 'fas fa-water', 'fas fa-tree', 'fas fa-hard-hat', 'fas fa-drafting-compass', 'fas fa-recycle'],
    },
    {
        label: 'คอมพิวเตอร์ & ไอที',
        icons: ['fas fa-code', 'fas fa-laptop-code', 'fas fa-microchip', 'fas fa-network-wired', 'fas fa-server', 'fas fa-database', 'fas fa-robot', 'fas fa-brain', 'fas fa-shield-halved'],
    },
    {
        label: 'ไฟฟ้า & อิเล็กทรอนิกส์',
        icons: ['fas fa-bolt', 'fas fa-plug', 'fas fa-satellite-dish', 'fas fa-tower-broadcast', 'fas fa-solar-panel', 'fas fa-battery-full', 'fas fa-mobile-screen-button'],
    },
    {
        label: 'เครื่องกล & อุตสาหกรรม',
        icons: ['fas fa-cog', 'fas fa-gears', 'fas fa-industry', 'fas fa-wrench', 'fas fa-toolbox'],
    },
    {
        label: 'วิทยาศาสตร์พื้นฐาน',
        icons: ['fas fa-flask', 'fas fa-atom', 'fas fa-dna', 'fas fa-microscope', 'fas fa-vial', 'fas fa-seedling'],
    },
    {
        label: 'ทั่วไป',
        icons: ['fas fa-graduation-cap', 'fas fa-book', 'fas fa-globe', 'fas fa-chart-line', 'fas fa-building-columns'],
    },
];

const DEGREE_LEVELS = ['ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก'];

// ตัวเลือกประเภทหลักสูตร (วศ.บ. / วท.บ. / วศ.ม. ฯลฯ)
const CURRICULUM_TYPES = [
    'หลักสูตรวิศวกรรมศาสตรบัณฑิต (วศ.บ.)',
    'หลักสูตรวิทยาศาสตรบัณฑิต (วท.บ.)',
    'วิศวกรรมศาสตรมหาบัณฑิต (วศ.ม.)',
];

// ไอคอน + สีประจำแต่ละประเภทหลักสูตร ใช้แยกกลุ่มการ์ดในหน้ารายการให้ดูออกง่าย
const CURRICULUM_TYPE_META = {
    'หลักสูตรวิศวกรรมศาสตรบัณฑิต (วศ.บ.)': { icon: 'fas fa-hard-hat', accent: '#800000' },
    'หลักสูตรวิทยาศาสตรบัณฑิต (วท.บ.)': { icon: 'fas fa-flask', accent: '#0891b2' },
    'วิศวกรรมศาสตรมหาบัณฑิต (วศ.ม.)': { icon: 'fas fa-user-graduate', accent: '#7c3aed' },
};
const OTHER_TYPE_LABEL = 'อื่นๆ / ยังไม่ระบุประเภทหลักสูตร';
const OTHER_TYPE_META = { icon: 'fas fa-layer-group', accent: '#6c757d' };

const emptyForm = {
    curriculumID: '',
    curriculumName: '',
    curriculumNameEN: '',
    deptNameTH: '',
    deptNameEN: '',
    degreeLevel: 'ปริญญาตรี',
    curriculumType: CURRICULUM_TYPES[0],
    highlights: '',
    whatWeLearn: '',
    insideKuse: '',
    jobOpportunities: '',
    careerPrivate: '',
    careerGovernment: '',
    icon: 'fas fa-graduation-cap',
};

// สร้าง URL เต็มของไฟล์ที่อัปโหลดแล้ว (รูป/PDF) จากชื่อไฟล์ที่เก็บใน DB
const fileUrl = (filename, type) =>
    filename ? `${UPLOAD_URL}/curriculum/${type}/${filename}` : '';

// แปลงระดับการศึกษาเป็นคลาส CSS เพื่อให้ป้ายระดับแต่ละแบบมีโทนสีต่างกัน
const degreeSlug = (level) => {
    if (level === 'ปริญญาตรี') return 'bachelor';
    if (level === 'ปริญญาโท') return 'master';
    if (level === 'ปริญญาเอก') return 'doctor';
    return 'other';
};

const ManageCourse = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null); // null = โหมดเพิ่มใหม่
    const [form, setForm] = useState(emptyForm);

    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState('');
    const [shopFile, setShopFile] = useState(null);
    const [shopPreview, setShopPreview] = useState('');
    const [pdfFiles, setPdfFiles] = useState([]); // File[] ใหม่ (ถ้าเลือก จะแทนที่ของเดิมทั้งหมด)
    const [existingPdfNames, setExistingPdfNames] = useState([]); // ชื่อไฟล์เดิมที่มีอยู่แล้ว (ตอนแก้ไข)

    const authHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // ===================== โหลดข้อมูล =====================
    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_URL, { headers: { ...authHeaders() } });
            if (!res.ok) throw new Error('โหลดข้อมูลไม่สำเร็จ');
            const data = await res.json();
            setCourses(Array.isArray(data) ? data : []);
        } catch (err) {
            Swal.fire({ title: 'เกิดข้อผิดพลาด', text: err.message, icon: 'error', confirmButtonColor: '#800000' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ===================== เปิด/ปิด Modal =====================
    const resetFileState = () => {
        setCoverFile(null);
        setCoverPreview('');
        setShopFile(null);
        setShopPreview('');
        setPdfFiles([]);
        setExistingPdfNames([]);
    };

    const openAddModal = () => {
        setEditingId(null);
        setForm(emptyForm);
        resetFileState();
        setShowModal(true);
    };

    const openEditModal = (course) => {
        setEditingId(course.curriculumID);
        setForm({
            curriculumID: course.curriculumID || '',
            curriculumName: course.curriculumName || '',
            curriculumNameEN: course.curriculumNameEN || '',
            deptNameTH: course.deptNameTH || '',
            deptNameEN: course.deptNameEN || '',
            degreeLevel: course.degreeLevel || 'ปริญญาตรี',
            curriculumType: course.curriculumType || CURRICULUM_TYPES[0],
            highlights: course.highlights || '',
            whatWeLearn: course.whatWeLearn || '',
            insideKuse: course.insideKuse || '',
            jobOpportunities: course.jobOpportunities || '',
            careerPrivate: course.careerPrivate || '',
            careerGovernment: course.careerGovernment || '',
            icon: course.icon || 'fas fa-graduation-cap',
        });
        resetFileState();
        setCoverPreview(fileUrl(course.Images, 'images'));
        setShopPreview(fileUrl(course.shopPhoto, 'images'));
        setExistingPdfNames(course.pdfFiles ? course.pdfFiles.split(',').filter(Boolean) : []);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        resetFileState();
    };

    // ===================== ฟอร์ม =====================
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // รหัสหลักสูตรต้องเป็นภาษาอังกฤษเท่านั้นและยาวไม่เกิน 3 ตัวอักษร
    const handleCurriculumIdChange = (e) => {
        const filtered = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3);
        setForm((prev) => ({ ...prev, curriculumID: filtered }));
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    };

    const handleShopChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setShopFile(file);
        setShopPreview(URL.createObjectURL(file));
    };

    const handlePdfChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 5);
        setPdfFiles(files);
    };

    // ===================== บันทึก (เพิ่ม/แก้ไข) =====================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.curriculumName.trim()) {
            Swal.fire({ title: 'กรอกข้อมูลไม่ครบ', text: 'กรุณากรอกชื่อหลักสูตรภาษาไทย', icon: 'warning', confirmButtonColor: '#800000' });
            return;
        }

        const confirm = await Swal.fire({
            title: 'ยืนยันการบันทึกข้อมูล?',
            text: 'ข้อมูลหลักสูตรจะได้รับการอัปเดตในระบบ',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#800000',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'ตกลง',
            cancelButtonText: 'ยกเลิก',
        });
        if (!confirm.isConfirmed) return;

        setSaving(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([key, value]) => fd.append(key, value));
            fd.append('adminID', ADMIN_ID);

            if (coverFile) fd.append('Images', coverFile);
            if (shopFile) fd.append('shopPhoto', shopFile);
            pdfFiles.forEach((file) => fd.append('pdfFiles', file));

            const isEdit = Boolean(editingId);
            const res = await fetch(isEdit ? `${API_URL}/${editingId}` : API_URL, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { ...authHeaders() }, // ห้ามตั้ง Content-Type เอง ให้ browser จัดการ boundary ของ FormData
                body: fd,
            });

            const result = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(result.message || 'บันทึกข้อมูลไม่สำเร็จ');

            await Swal.fire({ title: 'สำเร็จ!', text: 'ข้อมูลถูกบันทึกเรียบร้อย', icon: 'success', confirmButtonColor: '#800000' });
            closeModal();
            fetchCourses(); // รีเฟรชตาราง -> ฝั่งผู้ใช้งานจะเห็นข้อมูลใหม่ทันทีที่ดึง API ครั้งถัดไป
        } catch (err) {
            Swal.fire({ title: 'เกิดข้อผิดพลาด', text: err.message, icon: 'error', confirmButtonColor: '#800000' });
        } finally {
            setSaving(false);
        }
    };

    // ===================== ลบ =====================
    const handleDelete = async (course) => {
        const confirm = await Swal.fire({
            title: 'คุณแน่ใจหรือไม่?',
            text: 'ข้อมูลหลักสูตรนี้จะถูกลบถาวร!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'ยืนยันการลบ',
            cancelButtonText: 'ยกเลิก',
        });
        if (!confirm.isConfirmed) return;

        try {
            const res = await fetch(`${API_URL}/${course.curriculumID}`, {
                method: 'DELETE',
                headers: { ...authHeaders() },
            });
            if (!res.ok) throw new Error('ลบข้อมูลไม่สำเร็จ');

            setCourses((prev) => prev.filter((c) => c.curriculumID !== course.curriculumID));
            Swal.fire({ title: 'ลบสำเร็จ!', text: 'หลักสูตรนี้ถูกลบออกจากระบบแล้ว', icon: 'success', timer: 1500, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ title: 'เกิดข้อผิดพลาด', text: err.message, icon: 'error', confirmButtonColor: '#800000' });
        }
    };

    // ===================== จัดกลุ่มหลักสูตรตามประเภท (วศ.บ. / วท.บ. / วศ.ม.) =====================
    const groupedCourses = [
        ...CURRICULUM_TYPES.map((type) => ({
            type,
            meta: CURRICULUM_TYPE_META[type],
            items: courses.filter((c) => c.curriculumType === type),
        })),
        {
            type: OTHER_TYPE_LABEL,
            meta: OTHER_TYPE_META,
            items: courses.filter((c) => !CURRICULUM_TYPES.includes(c.curriculumType)),
        },
    ].filter((group) => group.items.length > 0);

    const renderCourseCard = (course) => (
        <div className="course-card" key={course.curriculumID}>
            <div className="course-card-cover">
                {course.Images ? (
                    <img src={fileUrl(course.Images, 'images')} alt={course.curriculumName} />
                ) : (
                    <div className="course-card-cover-placeholder">
                        <i className="fas fa-image"></i>
                    </div>
                )}
                <div className="course-card-cover-overlay"></div>
                <span className={`course-degree-badge deg-${degreeSlug(course.degreeLevel)}`}>
                    {course.degreeLevel || 'ไม่ระบุระดับ'}
                </span>
            </div>
            <div className="course-card-body">
                <div className="course-card-title">
                    <span className="course-card-title-icon">
                        <i className={course.icon || 'fas fa-graduation-cap'}></i>
                    </span>
                    <span className="course-card-title-text">{course.curriculumName || 'ไม่ระบุชื่อ'}</span>
                </div>
                <div className="course-card-subtitle">
                    <i className="fas fa-building-columns me-1"></i>
                    {course.deptNameEN || course.deptNameTH || 'ไม่ระบุภาควิชา'}
                </div>
                <div className="course-card-actions">
                    <button className="btn-course-edit" onClick={() => openEditModal(course)}>
                        <i className="fas fa-pen"></i> แก้ไข
                    </button>
                    <button className="btn-course-del" onClick={() => handleDelete(course)}>
                        <i className="fas fa-trash"></i> ลบ
                    </button>
                </div>
            </div>
        </div>
    );

    // ===================== RENDER =====================
    return (
        <>
            <div className="header-box course-toolbar course-toolbar-btn-only">
                <button className="btn-kuse shadow-sm" onClick={openAddModal}>
                    <i className="fas fa-plus-circle me-2"></i> เพิ่มหลักสูตรใหม่
                </button>
            </div>

            <div className="report-section course-report-section">
                {loading && (
                    <div className="course-loading">
                        <div className="course-state-icon"><i className="fas fa-spinner spin-icon"></i></div>
                        <div>กำลังโหลดข้อมูล...</div>
                    </div>
                )}

                {!loading && courses.length === 0 && (
                    <div className="course-empty">
                        <div className="course-state-icon"><i className="fas fa-folder-open"></i></div>
                        <div>ยังไม่มีข้อมูลหลักสูตร</div>
                        <small className="text-muted">กดปุ่ม "เพิ่มหลักสูตรใหม่" เพื่อเริ่มต้นเพิ่มข้อมูลค่ะ</small>
                    </div>
                )}

                {!loading && courses.length > 0 && groupedCourses.map((group) => (
                    <div className="course-type-section" key={group.type}>
                        <div className="course-type-header" style={{ '--type-accent': group.meta.accent }}>
                            <span className="course-type-icon"><i className={group.meta.icon}></i></span>
                            <h6 className="course-type-title">{group.type}</h6>
                            <span className="course-type-count">{group.items.length} หลักสูตร</span>
                        </div>
                        <div className="course-grid">
                            {group.items.map((course) => renderCourseCard(course))}
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="kuse-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
                    <div className="kuse-modal-box">
                        <div className="kuse-modal-header">
                            <h5 className="m-0">
                                <i className={`me-2 ${editingId ? 'fas fa-edit' : 'fas fa-plus-circle'}`}></i>
                                {editingId ? 'แก้ไขข้อมูลรายละเอียดหลักสูตร' : 'เพิ่มหลักสูตรใหม่'}
                            </h5>
                            <button type="button" className="btn-close" onClick={closeModal}></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="kuse-modal-body">
                                <div className="row g-4">
                                    {/* ----- คอลัมน์ซ้าย: รูป + ไอคอน ----- */}
                                    <div className="col-md-4">
                                        <div className="card border-0 shadow-sm p-4 gold-card bg-white mb-4">
                                            <h6 className="fw-bold mb-1" style={{ color: 'var(--kuse-gold)' }}>รูปหน้าปก (1 รูป)</h6>
                                            <small className="text-muted d-block mb-2">แนะนำขนาด 1920 x 560 พิกเซล</small>
                                            <div
                                                className="image-upload-box mb-3"
                                                onClick={() => document.getElementById('coverInput').click()}
                                            >
                                                {!coverPreview && (
                                                    <div className="text-center text-muted">
                                                        <i className="fas fa-images fa-2x mb-2"></i><br /><small>อัปโหลดรูปหน้าปก</small>
                                                    </div>
                                                )}
                                                {coverPreview && (
                                                    <div className="preview-frame">
                                                        <img className="preview-img" src={coverPreview} alt="cover preview" />
                                                        <button
                                                            type="button"
                                                            className="image-remove-btn"
                                                            title="ลบรูปนี้"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setCoverFile(null);
                                                                setCoverPreview('');
                                                                const input = document.getElementById('coverInput');
                                                                if (input) input.value = '';
                                                            }}
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <input type="file" id="coverInput" hidden accept="image/*" onChange={handleCoverChange} />

                                            <label className="small text-muted mb-2 d-block">เลือกไอคอนสาขา</label>
                                            <div className="icon-selector mb-4">
                                                {ICON_GROUPS.map((group) => (
                                                    <div key={group.label} className="icon-group">
                                                        <div className="icon-group-label">{group.label}</div>
                                                        <div className="icon-group-grid">
                                                            {group.icons.map((iconClass) => (
                                                                <div
                                                                    key={iconClass}
                                                                    className={`icon-opt ${form.icon === iconClass ? 'selected' : ''}`}
                                                                    title={iconClass.replace('fas fa-', '')}
                                                                    onClick={() => setForm((prev) => ({ ...prev, icon: iconClass }))}
                                                                >
                                                                    <i className={iconClass}></i>
                                                                    {form.icon === iconClass && (
                                                                        <span className="icon-opt-check"><i className="fas fa-check"></i></span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <h6 className="fw-bold mb-3" style={{ color: 'var(--kuse-gold)' }}>รูปเสื้อช็อปประจำสาขา</h6>
                                            <div
                                                className="image-upload-box shop-box"
                                                onClick={() => document.getElementById('shopInput').click()}
                                            >
                                                {!shopPreview && (
                                                    <div className="text-center text-muted">
                                                        <i className="fas fa-tshirt fa-2x mb-2"></i><br /><small>อัปโหลดรูปเสื้อช็อป</small>
                                                    </div>
                                                )}
                                                {shopPreview && (
                                                    <div className="preview-frame">
                                                        <img className="preview-img" src={shopPreview} alt="shop preview" />
                                                        <button
                                                            type="button"
                                                            className="image-remove-btn"
                                                            title="ลบรูปนี้"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setShopFile(null);
                                                                setShopPreview('');
                                                                const input = document.getElementById('shopInput');
                                                                if (input) input.value = '';
                                                            }}
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <input type="file" id="shopInput" hidden accept="image/*" onChange={handleShopChange} />
                                        </div>
                                    </div>

                                    {/* ----- คอลัมน์ขวา: ข้อมูลฟอร์ม ----- */}
                                    <div className="col-md-8">
                                        <div className="row g-3">
                                            <div className="col-12">
                                                <div className="card border-0 shadow-sm p-3 gold-card bg-white">
                                                    <h6 className="fw-bold mb-3 section-step-title"><span className="section-step-num">1</span>ข้อมูลพื้นฐาน</h6>
                                                    <div className="row g-2">
                                                        <div className="col-md-4">
                                                            <label className="label-kuse-bold">รหัสหลักสูตร (สูงสุด 3 ตัวอักษร)</label>
                                                            <input
                                                                type="text" name="curriculumID"
                                                                className="form-control-kuse mb-2 text-uppercase" placeholder="เช่น CE"
                                                                value={form.curriculumID} onChange={handleCurriculumIdChange}
                                                            />
                                                        </div>
                                                        <div className="col-md-4">
                                                            <label className="label-kuse-bold">ระดับการศึกษา</label>
                                                            <select name="degreeLevel" className="form-control-kuse mb-2" value={form.degreeLevel} onChange={handleChange}>
                                                                {DEGREE_LEVELS.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <label className="label-kuse-bold">หลักสูตร</label>
                                                            <select name="curriculumType" className="form-control-kuse mb-2" value={form.curriculumType} onChange={handleChange}>
                                                                {CURRICULUM_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="col-12">
                                                            <label className="label-kuse-bold">ชื่อหลักสูตร (ภาษาไทย)</label>
                                                            <input
                                                                type="text" name="curriculumName"
                                                                className="form-control-kuse form-control-kuse-lg mb-2" placeholder="กรอกชื่อหลักสูตร"
                                                                value={form.curriculumName} onChange={handleChange} required
                                                            />
                                                        </div>
                                                        <div className="col-12">
                                                            <label className="label-kuse-bold">ชื่อหลักสูตร (ภาษาอังกฤษ)</label>
                                                            <input
                                                                type="text" name="curriculumNameEN"
                                                                className="form-control-kuse form-control-kuse-lg mb-2" placeholder="กรอกชื่อหลักสูตร"
                                                                value={form.curriculumNameEN} onChange={handleChange}
                                                            />
                                                        </div>
                                                        <div className="col-12">
                                                            <label className="label-kuse-bold">ภาควิชา (ภาษาไทย)</label>
                                                            <input
                                                                type="text" name="deptNameTH"
                                                                className="form-control-kuse form-control-kuse-lg mb-2" placeholder="ระบุภาควิชาที่สังกัด"
                                                                value={form.deptNameTH} onChange={handleChange}
                                                            />
                                                        </div>
                                                        <div className="col-12">
                                                            <label className="label-kuse-bold">ภาควิชา (ภาษาอังกฤษ)</label>
                                                            <input
                                                                type="text" name="deptNameEN"
                                                                className="form-control-kuse form-control-kuse-lg mb-2" placeholder="Department of Civil Engineering"
                                                                value={form.deptNameEN} onChange={handleChange}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-12">
                                                <div className="card border-0 shadow-sm p-3 gold-card bg-white">
                                                    <h6 className="fw-bold mb-3 section-step-title"><span className="section-step-num">2</span>จุดเด่นและอาชีพ</h6>
                                                    <div className="row g-2">
                                                        <div className="col-md-6">
                                                            <label className="label-kuse-bold">จุดเด่นของหลักสูตร</label>
                                                            <textarea name="highlights" className="form-control-kuse mb-2" rows="2" placeholder="เช่น เรียนจบ 3 ปีครึ่ง..." value={form.highlights} onChange={handleChange}></textarea>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="label-kuse-bold">เราเรียนอะไร...</label>
                                                            <textarea name="whatWeLearn" className="form-control-kuse mb-2" rows="2" placeholder="อธิบายภาพรวมการเรียน..." value={form.whatWeLearn} onChange={handleChange}></textarea>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="label-kuse-bold">INSIDE ของสาขา มก. ฉกส.</label>
                                                            <textarea name="insideKuse" className="form-control-kuse mb-2" rows="2" placeholder="เจาะลึกข้อมูลวงในสาขา..." value={form.insideKuse} onChange={handleChange}></textarea>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="label-kuse-bold">โอกาสในการทำงาน</label>
                                                            <textarea name="jobOpportunities" className="form-control-kuse mb-2" rows="2" placeholder="โอกาสหลังเรียนจบ..." value={form.jobOpportunities} onChange={handleChange}></textarea>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="label-kuse-bold">เส้นทางอาชีพ: สายงานเอกชน</label>
                                                            <textarea name="careerPrivate" className="form-control-kuse mb-2" rows="2" placeholder="บริษัทที่รองรับ..." value={form.careerPrivate} onChange={handleChange}></textarea>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="label-kuse-bold">เส้นทางอาชีพ: สายงานราชการ/รัฐวิสาหกิจ</label>
                                                            <textarea name="careerGovernment" className="form-control-kuse mb-2" rows="2" placeholder="หน่วยงานที่รองรับ..." value={form.careerGovernment} onChange={handleChange}></textarea>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-12">
                                                <div className="card border-0 shadow-sm p-4 gold-card bg-white">
                                                    <h6 className="fw-bold mb-3 section-step-title"><span className="section-step-num">3</span>ไฟล์ข้อมูลหลักสูตร (PDF สูงสุด 5 ไฟล์)</h6>

                                                    {existingPdfNames.length > 0 && (
                                                        <div className="mb-3">
                                                            <small className="text-muted d-block mb-1">ไฟล์เดิมที่มีอยู่ในระบบ:</small>
                                                            {existingPdfNames.map((name) => (
                                                                <div key={name} className="pdf-existing-chip">
                                                                    <a href={fileUrl(name, 'documents')} target="_blank" rel="noreferrer">
                                                                        <i className="far fa-file-pdf"></i> {name}
                                                                    </a>
                                                                    <button
                                                                        type="button"
                                                                        className="pdf-remove-btn"
                                                                        title="ลบไฟล์นี้"
                                                                        onClick={() => setExistingPdfNames((prev) => prev.filter((n) => n !== name))}
                                                                    >
                                                                        <i className="fas fa-times"></i>
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="pdf-slot">
                                                        <small className="text-muted d-block mb-2">
                                                            <i className="far fa-file-pdf me-1"></i>
                                                            เลือกไฟล์ PDF ใหม่ (เลือกได้สูงสุด 5 ไฟล์ — ถ้าอัปโหลดใหม่จะแทนที่ไฟล์เดิมทั้งหมด)
                                                        </small>
                                                        <input type="file" className="form-control form-control-sm" accept=".pdf" multiple onChange={handlePdfChange} />
                                                        {pdfFiles.length > 0 && (
                                                            <div className="mt-2">
                                                                <small className="text-success d-block mb-1">เลือกแล้ว {pdfFiles.length} ไฟล์:</small>
                                                                {pdfFiles.map((file, idx) => (
                                                                    <div key={`${file.name}-${idx}`} className="pdf-existing-chip">
                                                                        <span className="pdf-file-name">
                                                                            <i className="far fa-file-pdf"></i> {file.name}
                                                                        </span>
                                                                        <button
                                                                            type="button"
                                                                            className="pdf-remove-btn"
                                                                            title="ลบไฟล์นี้"
                                                                            onClick={() => setPdfFiles((prev) => prev.filter((_, i) => i !== idx))}
                                                                        >
                                                                            <i className="fas fa-times"></i>
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="kuse-modal-footer">
                                <button type="button" className="btn btn-light rounded-pill px-4" onClick={closeModal}>ยกเลิก</button>
                                <button type="submit" className="btn-kuse px-5 shadow" disabled={saving}>
                                    {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ManageCourse;