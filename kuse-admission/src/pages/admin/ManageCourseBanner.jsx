import BannerManagerPanel from '../../components/BannerManagerPanel';

// หน้าจัดการแบนเนอร์ของ "หน้ารวมหลักสูตร" (curriculum.html) — ไม่ใช่รูปหน้าปกของแต่ละหลักสูตร
// ใช้ BannerManagerPanel ตัวเดียวกับหน้าแบนเนอร์หน้าแรก แยกกันด้วย pageTarget เท่านั้น
const ManageCourseBanner = () => (
    <BannerManagerPanel
        pageTarget="curriculum"
        heading="รายการแบนเนอร์หน้าหลักสูตร"
        addButtonLabel="เพิ่มแบนเนอร์หลักสูตร"
        modalTitleAdd="เพิ่มแบนเนอร์หลักสูตรใหม่"
        modalTitleEdit="แก้ไขข้อมูลแบนเนอร์หลักสูตร"
        emptyText="ไม่พบข้อมูลแบนเนอร์หน้าหลักสูตรในระบบ"
    />
);

export default ManageCourseBanner;
