import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Login from './pages/admin/Login'
import AdminLayout from './components/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import ManageTcas from './pages/admin/ManageTcas'
import ManageCourse from './pages/admin/Managecourse'   
import ManageBanner from './pages/admin/ManageBanner'
import ManageCourseBanner from './pages/admin/ManageCourseBanner'
import ManageDocument from './pages/admin/ManageDocument' 
import ManageAdmin from './pages/admin/ManageAdmin' // 👑 แทรกนำเข้าหน้าจัดการบัญชีผู้ดูแลระบบตัวใหม่

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<Login />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="manage-tcas" element={<ManageTcas />} />
          <Route path="courses" element={<ManageCourse />} />
          <Route path="banners" element={<ManageBanner />} />
          <Route path="course-banners" element={<ManageCourseBanner />} />
          
          {/* 🌟 2. ลงทะเบียนพาร์ทคลังไฟล์เอกสาร เส้นทางเต็มคือ /admin/documents */}
          <Route path="documents" element={<ManageDocument />} />

          {/* 👑 แทรกทะเบียนพาร์ทจัดการผู้ดูแลระบบ (ตรงกับเมนู /admin/users ใน AdminLayout) */}
          <Route path="users" element={<ManageAdmin />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App