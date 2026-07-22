import { Routes, Route } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import Home from './pages/Home';
import Curriculum from './pages/Curriculum';
import CourseDetail from './pages/CourseDetail';
import Announcement from './pages/Announcement';
import AnnouncementDetail from './pages/AnnouncementDetail';
import About from './pages/About';
import Contact from './pages/Contact';

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="curriculum" element={<Curriculum />} />
        <Route path="curriculum/:id" element={<CourseDetail />} />
        <Route path="announcement" element={<Announcement />} />
        <Route path="announcement/:id" element={<AnnouncementDetail />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
      </Route>
    </Routes>
  );
}

export default App;
