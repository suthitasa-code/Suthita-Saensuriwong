import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE, ENDPOINTS, unwrap } from '../config/api';
import HeroCarousel from '../components/HeroCarousel';
import '../styles/curriculum.css';

const DEGREE_ORDER = ['ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก'];
const DEGREE_LABEL = {
  ปริญญาตรี: 'ระดับปริญญาตรี',
  ปริญญาโท: 'ระดับปริญญาโท',
  ปริญญาเอก: 'ระดับปริญญาเอก',
};

const CURRICULUM_TYPES = [
  'หลักสูตรวิศวกรรมศาสตรบัณฑิต (วศ.บ.)',
  'หลักสูตรวิทยาศาสตรบัณฑิต (วท.บ.)',
  'วิศวกรรมศาสตรมหาบัณฑิต (วศ.ม.)',
];

const Curriculum = () => {
  const [banners, setBanners] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [bannerRes, curriculumRes] = await Promise.all([
          fetch(`${API_BASE}${ENDPOINTS.banners}?pageTarget=curriculum`),
          fetch(`${API_BASE}${ENDPOINTS.curriculums}`),
        ]);
        const bannerJson = await bannerRes.json();
        const curriculumJson = await curriculumRes.json();
        if (cancelled) return;
        setBanners(unwrap(bannerJson));
        setCurriculums(unwrap(curriculumJson));
      } catch (err) {
        console.error('โหลดข้อมูลหน้าหลักสูตรไม่สำเร็จ:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const groupedByDegree = useMemo(() => {
    const degreeGroups = {};
    curriculums.forEach((c) => {
      const level = c.degreeLevel || 'ไม่ระบุระดับ';
      if (!degreeGroups[level]) degreeGroups[level] = [];
      degreeGroups[level].push(c);
    });

    const orderedLevels = [
      ...DEGREE_ORDER.filter((lvl) => degreeGroups[lvl]),
      ...Object.keys(degreeGroups).filter((lvl) => !DEGREE_ORDER.includes(lvl)),
    ];

    return orderedLevels.map((level) => {
      const items = degreeGroups[level];
      const typeGroups = {};
      items.forEach((c) => {
        const type = c.curriculumType || 'อื่นๆ';
        if (!typeGroups[type]) typeGroups[type] = [];
        typeGroups[type].push(c);
      });

      const orderedTypes = [
        ...CURRICULUM_TYPES.filter((t) => typeGroups[t]),
        ...Object.keys(typeGroups).filter((t) => !CURRICULUM_TYPES.includes(t)),
      ];

      return {
        level,
        typeGroups: orderedTypes.map((type) => ({ type, items: typeGroups[type] })),
      };
    });
  }, [curriculums]);

  const renderCourseCard = (course) => (
    <div className="col-lg-4 col-md-6" key={course.curriculumID}>
      <Link to={`/curriculum/${course.curriculumID}`} className="course-card">
        <div className="course-icon">
          <i className={course.icon || 'fas fa-graduation-cap'}></i>
        </div>
        <div className="course-info">
          <h3>{course.curriculumName || 'ไม่ระบุชื่อ'}</h3>
          {course.highlights && <p>{course.highlights}</p>}
          <span className="btn-view-detail">
            ดูรายละเอียด <i className="fas fa-chevron-right ms-1"></i>
          </span>
        </div>
      </Link>
    </div>
  );

  return (
    <>
      {banners.length > 0 && <HeroCarousel banners={banners} intervalMs={8000} />}

      <div className="container px-4">
        <div className="section-title-main">
          <h2>หลักสูตรที่เปิดสอน</h2>
          <p>คณะวิทยาศาสตร์และวิศวกรรมศาสตร์ มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร</p>
        </div>

        {loading && <div className="curriculum-loading">กำลังโหลดข้อมูลหลักสูตร...</div>}

        {!loading && curriculums.length === 0 && (
          <div className="curriculum-empty">ยังไม่มีข้อมูลหลักสูตรในระบบ</div>
        )}

        {!loading && groupedByDegree.map(({ level, typeGroups }) => (
          <div key={level}>
            <h2 className="level-heading">{DEGREE_LABEL[level] || level}</h2>
            {typeGroups.map(({ type, items }) => (
              <div key={type}>
                <h4 className="type-heading">{type}</h4>
                <div className="row g-4 mb-4">
                  {items.map((course) => renderCourseCard(course))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};

export default Curriculum;
