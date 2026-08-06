// ลิงก์เพจ/เว็บไซต์ติดตามข่าวสารของแต่ละภาควิชา
// รวมไว้ที่ไฟล์นี้ไฟล์เดียว ถ้าลิงก์เปลี่ยนหรือมีเพจเพิ่ม แก้ตรงนี้ที่เดียวพอ ไม่ต้องไปหาแก้ในหน้าอื่น
// key = ชื่อภาควิชา (deptNameTH) ต้องตรงกับข้อมูลหลักสูตรในระบบเป๊ะ ๆ
const CURRICULUM_SOCIAL_LINKS = {
  'ภาควิชาวิศวกรรมเครื่องกลและการผลิต': [
    {
      label: 'เพจวิศวะเครื่องกลและการผลิต',
      url: 'https://www.facebook.com/share/19XscB7mcE/?mibextid=wwXIfr',
      icon: 'fab fa-facebook-f',
      gradient: 'linear-gradient(135deg, #1877f2 0%, #0a54c4 100%)',
    },
  ],
  'ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ': [
    {
      label: 'เพจวิทยาการคอมพิวเตอร์',
      url: 'https://www.facebook.com/share/1BaJZ5kNqv/?mibextid=wwXIfr',
      icon: 'fab fa-facebook-f',
      gradient: 'linear-gradient(135deg, #1877f2 0%, #0a54c4 100%)',
    },
    {
      label: 'เว็บไซต์วิทยาการคอมพิวเตอร์',
      url: 'https://sites.google.com/ku.th/kucis/',
      icon: 'fas fa-globe',
      gradient: 'linear-gradient(135deg, var(--gold-bright) 0%, var(--maroon) 100%)',
    },
  ],
  'ภาควิชาวิศวกรรมโยธาและสิ่งแวดล้อม': [
    {
      label: 'เพจวิศวะโยธาและวิศวะสิ่งแวดล้อมเพื่อการพัฒนาอย่างยั่งยืน',
      url: 'https://www.facebook.com/share/1CpUCKcwG4/?mibextid=wwXIfr',
      icon: 'fab fa-facebook-f',
      gradient: 'linear-gradient(135deg, #1877f2 0%, #0a54c4 100%)',
    },
    {
      label: 'เพจชุมนุมโยธา',
      url: 'https://www.facebook.com/share/1DAwoTjJSn/?mibextid=wwXIfr',
      icon: 'fab fa-facebook-f',
      gradient: 'linear-gradient(135deg, #1877f2 0%, #0a54c4 100%)',
    },
  ],
  'ภาควิชาวิศวกรรมไฟฟ้าและคอมพิวเตอร์': [
    {
      label: 'เพจวิศวะไฟฟ้าและวิศวะคอมพิวเตอร์',
      url: 'https://www.facebook.com/share/1DyACSP8b5/?mibextid=wwXIfr',
      icon: 'fab fa-facebook-f',
      gradient: 'linear-gradient(135deg, #1877f2 0%, #0a54c4 100%)',
    },
  ],
};

export default CURRICULUM_SOCIAL_LINKS;
