import Swal from 'sweetalert2';

// ใช้แทน import Swal จาก 'sweetalert2' ตรงๆ ทั่วทั้งแอดมิน
// เพื่อให้ปุ่มยืนยัน default (เดิมเป็น "OK") เปลี่ยนเป็น "ตกลง" ทุกที่โดยอัตโนมัติ
// ป๊อปอัพไหนที่ระบุ confirmButtonText เองอยู่แล้ว (เช่น "ยืนยันการลบ") จะไม่ถูกทับ
export default Swal.mixin({
  confirmButtonText: 'ตกลง',
});
