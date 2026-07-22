import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router ไม่เลื่อนจอกลับขึ้นบนสุดให้อัตโนมัติตอนเปลี่ยนหน้า (ต่างจากการโหลดหน้าเว็บใหม่ทั้งหน้า)
// ถ้าไม่มีตัวนี้ กดลิงก์ไปหน้าอื่นตอนเลื่อนจอค้างอยู่ด้านล่าง หน้าใหม่ก็จะโผล่มาตรงตำแหน่งเดิมทันที
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
