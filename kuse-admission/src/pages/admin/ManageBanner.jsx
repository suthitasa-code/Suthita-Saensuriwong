import BannerManagerPanel from '../../components/BannerManagerPanel';

// หน้าจัดการแบนเนอร์ของ "หน้าแรก" — ใช้ BannerManagerPanel ตัวเดียวกับหน้าแบนเนอร์หลักสูตร
// แยกกันด้วย pageTarget เท่านั้น แต่ละหน้าเห็น/แก้ไขได้เฉพาะแบนเนอร์ของตัวเอง
const ManageBanner = () => (
    <BannerManagerPanel
        pageTarget="home"
        heading="รายการรูปภาพแนะนำ"
        addButtonLabel="เพิ่มรูปภาพแบนเนอร์"
        modalTitleAdd="เพิ่มแบนเนอร์ใหม่"
        modalTitleEdit="แก้ไขข้อมูลแบนเนอร์"
        emptyText="ไม่พบข้อมูลแบนเนอร์ในระบบ"
    />
);

export default ManageBanner;
