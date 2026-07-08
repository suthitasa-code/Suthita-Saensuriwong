import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css' // 🌟 เพิ่มบรรทัดนี้: ของเดิมไม่มีการโหลด Bootstrap CSS เลย
                                               // ทำให้คลาส row / col-md-* / d-flex / btn ที่ใช้ทั่วทั้งแอปไม่มีผลอะไรเลย
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom' // 👑 อัญเชิญระบบนำทางของโลก React มาครอบ

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* 👑 ห่อครอบตัว App ไว้ เพื่อให้ทุดเพจใช้ useNavigate() ได้อย่างปลอดภัยจ้า */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)