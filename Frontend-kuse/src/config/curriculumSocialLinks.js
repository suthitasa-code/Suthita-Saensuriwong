// ลิงก์เพจ/เว็บไซต์ติดตามข่าวสารของแต่ละหลักสูตร
// รวมไว้ที่ไฟล์นี้ไฟล์เดียว ถ้าลิงก์เปลี่ยนหรือมีเพจเพิ่ม แก้ตรงนี้ที่เดียวพอ ไม่ต้องไปหาแก้ในหน้าอื่น
// key = curriculumID (รหัสหลักสูตรในระบบ) — บางหลักสูตรอยู่ภาควิชาเดียวกันแต่มีเพจติดตามไม่เหมือนกัน
// (เช่น โยธา มีเพจชุมนุมโยธาเพิ่ม แต่สิ่งแวดล้อมไม่มี) จึงต้องแยกเป็นรายหลักสูตรแทนรายภาควิชา
const CURRICULUM_SOCIAL_LINKS = {
  MME: [
    {
      label: 'เพจภาควิชาวิศวกรรมเครื่องกลและการผลิต',
      url: 'https://www.facebook.com/share/19XscB7mcE/?mibextid=wwXIfr',
      icon: 'fab fa-facebook-f',
      gradient: 'linear-gradient(135deg, #1877f2 0%, #0a54c4 100%)',
    },
  ],
  IE: [
    {
      label: 'เพจภาควิชาวิศวกรรมเครื่องกลและการผลิต',
      url: 'https://www.facebook.com/share/19XscB7mcE/?mibextid=wwXIfr',
      icon: 'fab fa-facebook-f',
      gradient: 'linear-gradient(135deg, #1877f2 0%, #0a54c4 100%)',
    },
    {
      label: 'TikTok วิศวกรรมอุตสาหการ',
      url: 'https://www.tiktok.com/@ie_ku_csc',
      icon: 'fab fa-tiktok',
      gradient: 'linear-gradient(135deg, #25f4ee 0%, #1c1c1c 55%, #fe2c55 100%)',
    },
    {
      label: 'Instagram วิศวกรรมอุตสาหการ',
      url: 'https://www.instagram.com/ie_ku_csc/',
      icon: 'fab fa-instagram',
      gradient: 'linear-gradient(135deg, #f9ce34 0%, #ee2a7b 55%, #6228d7 100%)',
    },
  ],
  CS: [
    {
      label: 'เพจภาควิชาวิทยาการคอมพิวเตอร์',
      url: 'https://www.facebook.com/share/1BaJZ5kNqv/?mibextid=wwXIfr',
      icon: 'fab fa-facebook-f',
      gradient: 'linear-gradient(135deg, #1877f2 0%, #0a54c4 100%)',
    },
    {
      label: 'เว็บไซต์ภาควิชาวิทยาการคอมพิวเตอร์',
      url: 'https://sites.google.com/ku.th/kucis/',
      icon: 'fas fa-globe',
      gradient: 'linear-gradient(135deg, var(--gold-bright) 0%, var(--maroon) 100%)',
    },
    {
      label: 'TikTok วิทยาการคอมพิวเตอร์',
      url: 'https://www.tiktok.com/@ciskucsc',
      icon: 'fab fa-tiktok',
      gradient: 'linear-gradient(135deg, #25f4ee 0%, #1c1c1c 55%, #fe2c55 100%)',
    },
  ],
  CEE: [
    {
      label: 'เพจภาควิชาวิศวกรรมโยธาและวิศวกรรมสิ่งแวดล้อมเพื่อการพัฒนาอย่างยั่งยืน',
      url: 'https://www.facebook.com/share/1CpUCKcwG4/?mibextid=wwXIfr',
      icon: 'fab fa-facebook-f',
      gradient: 'linear-gradient(135deg, #1877f2 0%, #0a54c4 100%)',
    },
    {
      label: 'เพจชุมนุมวิศวกรรมโยธา',
      url: 'https://www.facebook.com/share/1DAwoTjJSn/?mibextid=wwXIfr',
      icon: 'fab fa-facebook-f',
      gradient: 'linear-gradient(135deg, #1877f2 0%, #0a54c4 100%)',
    },
  ],
  EES: [
    {
      label: 'เพจภาควิชาวิศวกรรมโยธาและวิศวกรรมสิ่งแวดล้อมเพื่อการพัฒนาอย่างยั่งยืน',
      url: 'https://www.facebook.com/share/1CpUCKcwG4/?mibextid=wwXIfr',
      icon: 'fab fa-facebook-f',
      gradient: 'linear-gradient(135deg, #1877f2 0%, #0a54c4 100%)',
    },
  ],
  CPE: [
    {
      label: 'เพจภาควิชาวิศวกรรมไฟฟ้าและวิศวกรรมคอมพิวเตอร์',
      url: 'https://www.facebook.com/share/1DyACSP8b5/?mibextid=wwXIfr',
      icon: 'fab fa-facebook-f',
      gradient: 'linear-gradient(135deg, #1877f2 0%, #0a54c4 100%)',
    },
  ],
  ECE: [
    {
      label: 'เพจภาควิชาวิศวกรรมไฟฟ้าและวิศวกรรมคอมพิวเตอร์',
      url: 'https://www.facebook.com/share/1DyACSP8b5/?mibextid=wwXIfr',
      icon: 'fab fa-facebook-f',
      gradient: 'linear-gradient(135deg, #1877f2 0%, #0a54c4 100%)',
    },
  ],
  GE: [
    {
      label: 'Instagram เคมีประยุกต์',
      url: 'https://www.instagram.com/appliedchemistrykucsc/',
      icon: 'fab fa-instagram',
      gradient: 'linear-gradient(135deg, #f9ce34 0%, #ee2a7b 55%, #6228d7 100%)',
    },
  ],
};

export default CURRICULUM_SOCIAL_LINKS;
