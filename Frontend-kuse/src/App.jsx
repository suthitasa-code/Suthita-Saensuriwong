import { Routes, Route } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import Home from './pages/Home';
import Curriculum from './pages/Curriculum';
import CourseDetail from './pages/CourseDetail';
import Announcement from './pages/Announcement';
import AnnouncementDetail from './pages/AnnouncementDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="curriculum" element={<Curriculum />} />
        <Route path="curriculum/:id" element={<CourseDetail />} />
        <Route path="announcement" element={<Announcement />} />
        <Route path="announcement/:id" element={<AnnouncementDetail />} />
      </Route>
    </Routes>
  );
}

export default App;
