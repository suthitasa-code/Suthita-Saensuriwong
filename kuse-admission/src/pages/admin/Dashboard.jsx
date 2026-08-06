import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from 'react-apexcharts';
import '../../styles/dashboard.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const FONT_FAMILY = "'IBM Plex Sans Thai', 'Anuphan', sans-serif";

const ENDPOINTS = {
  announcements: '/api/announcement',
  curriculums: '/api/curriculum',
  documents: '/api/document',
  banners: '/api/carouselbanner',
  admins: '/api/admins',
};

const emptySummary = {
  announcements: [],
  curriculums: [],
  documents: [],
  banners: [],
  admins: [],
};

// รองรับทั้งรูปแบบ response ที่ห่อด้วย { success, data } และแบบส่ง array ตรงๆ
const unwrap = (json) => (Array.isArray(json) ? json : json?.data ?? []);

// เกณฑ์ตัดสินสถานะประกาศ ใช้ตรรกะเดียวกับหน้า "จัดการประกาศรับสมัคร" เพื่อให้ตัวเลขตรงกันทุกหน้า
const getLabelStatus = (item) => {
  if (item.labelStatus) return item.labelStatus;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const start = new Date(item.openDate); start.setHours(0, 0, 0, 0);
  const end = new Date(item.closeDate); end.setHours(0, 0, 0, 0);
  if (isNaN(start) || isNaN(end)) return 'ไม่ระบุวันรับสมัคร';
  if (today < start) return 'รอเปิดรับ';
  if (today <= end) return 'กำลังเปิดรับ';
  return 'ปิดรับแล้ว';
};

const statusBadgeClass = (label) => {
  if (label === 'กำลังเปิดรับ') return 'dash-badge-open';
  if (label === 'รอเปิดรับ') return 'dash-badge-wait';
  if (label === 'ปิดรับแล้ว') return 'dash-badge-closed';
  return 'dash-badge-none';
};

const documentCategoryLabel = (categoryCode) => {
  switch (categoryCode) {
    case 'COURSE': return 'หลักสูตรสาขา';
    case 'TCAS': return 'ประกาศรับสมัคร';
    case 'MEDIA': return 'รูปภาพ';
    default: return 'เอกสารทั่วไป';
  }
};

// fileSize ถูกคำนวณและบันทึกเป็นหน่วย MB ไว้แล้วตั้งแต่ตอนอัปโหลด (ดู document.service.js)
const formatFileSize = (sizeInMB) => {
  const n = Number(sizeInMB);
  if (!n && n !== 0) return '-';
  return `${n} MB`;
};

const formatDateTh = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return '-';
  return d.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
};

const padNum = (n) => String(n).padStart(2, '0');

const StatCard = ({ iconClass, icon, number, label, delay }) => (
  <div className="col d-flex">
    <div className="stat-card-pro w-100 fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <div className={`icon-shape ${iconClass}`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div className="stat-content">
        <div className="stat-number-pro">{number}</div>
        <div className="stat-label-text">{label}</div>
      </div>
    </div>
  </div>
);

const ChartCard = ({ title, icon, subtitle, children, className = '' }) => (
  <div className={`chart-card fade-in-up ${className}`}>
    <div className="chart-card-header">
      <div>
        <h6 className="chart-card-title"><i className={`fas ${icon} me-2`}></i>{title}</h6>
        {subtitle && <p className="chart-card-subtitle">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(emptySummary);
  const [loading, setLoading] = useState(true);
  const [errorKeys, setErrorKeys] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const keys = Object.keys(ENDPOINTS);
    // /api/admins ต้องใช้ token แนบไปด้วย (ตั้งแต่เปลี่ยนมาใช้ JWT ของเราเองแทน Firebase)
    // ไม่งั้นโดน middleware verifyToken เตะกลับมาเป็น 401 แล้วการ์ด "ผู้ดูแลระบบ" จะโหลดไม่ขึ้น
    const token = localStorage.getItem('token');
    const results = await Promise.allSettled(
      keys.map(async (key) => {
        const res = await fetch(`${API_BASE}${ENDPOINTS[key]}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(key);
        const json = await res.json();
        return unwrap(json);
      })
    );

    const nextData = { ...emptySummary };
    const nextErrors = [];
    results.forEach((result, idx) => {
      const key = keys[idx];
      if (result.status === 'fulfilled') {
        nextData[key] = result.value;
      } else {
        nextErrors.push(key);
      }
    });

    setData(nextData);
    setErrorKeys(nextErrors);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const { announcements, curriculums, documents, banners, admins } = data;

  const statusCounts = useMemo(() => announcements.reduce((acc, item) => {
    const label = getLabelStatus(item);
    if (label === 'กำลังเปิดรับ') acc.open += 1;
    else if (label === 'รอเปิดรับ') acc.waiting += 1;
    else if (label === 'ปิดรับแล้ว') acc.closed += 1;
    return acc;
  }, { open: 0, waiting: 0, closed: 0 }), [announcements]);

  const activeAdminCount = useMemo(
    () => admins.filter((a) => Number(a.status) === 1).length,
    [admins]
  );

  // แยกจำนวนแบนเนอร์ตามหน้าเป้าหมาย (pageTarget) — เดิมรูปที่ยังไม่ระบุถือเป็นของหน้าแรก
  const homeBannerCount = useMemo(
    () => banners.filter((b) => (b.pageTarget || 'home') === 'home').length,
    [banners]
  );
  const curriculumBannerCount = useMemo(
    () => banners.filter((b) => b.pageTarget === 'curriculum').length,
    [banners]
  );

  const recentAnnouncements = useMemo(
    () => [...announcements]
      .sort((a, b) => (b.announcementID || 0) - (a.announcementID || 0))
      .slice(0, 5),
    [announcements]
  );

  const recentDocuments = useMemo(
    () => [...documents]
      .sort((a, b) => new Date(b.uploadDate || 0) - new Date(a.uploadDate || 0))
      .slice(0, 5),
    [documents]
  );

  // แยกจำนวนประกาศตามปีการศึกษา + สถานะ สำหรับกราฟแท่งซ้อน
  const yearBreakdown = useMemo(() => {
    const map = {};
    announcements.forEach((item) => {
      const year = item.academicYear ? String(item.academicYear) : 'ไม่ระบุปี';
      if (!map[year]) map[year] = { open: 0, waiting: 0, closed: 0 };
      const label = getLabelStatus(item);
      if (label === 'กำลังเปิดรับ') map[year].open += 1;
      else if (label === 'รอเปิดรับ') map[year].waiting += 1;
      else if (label === 'ปิดรับแล้ว') map[year].closed += 1;
    });
    const years = Object.keys(map).sort();
    return {
      years,
      open: years.map((y) => map[y].open),
      waiting: years.map((y) => map[y].waiting),
      closed: years.map((y) => map[y].closed),
    };
  }, [announcements]);

  const distTotal = statusCounts.open + statusCounts.waiting + statusCounts.closed;

  const errorLabel = {
    announcements: 'ประกาศรับสมัคร',
    curriculums: 'หลักสูตร',
    documents: 'เอกสาร',
    banners: 'แบนเนอร์',
    admins: 'ผู้ดูแลระบบ',
  };

  // ===== Chart configs (ApexCharts) =====
  const donutOptions = {
    chart: {
      type: 'donut',
      fontFamily: FONT_FAMILY,
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 700,
        animateGradually: { enabled: true, delay: 150 },
        dynamicAnimation: { enabled: true, speed: 400 },
      },
    },
    labels: ['กำลังเปิดรับ', 'รอเปิดรับ', 'ปิดรับแล้ว'],
    colors: ['#1cc88a', '#f39c12', '#e0473a'],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.65,
        gradientToColors: ['#6be0b4', '#ffc766', '#ff7d6b'],
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
      },
    },
    stroke: { width: 5, colors: ['#fff'], lineCap: 'round' },
    states: {
      hover: { filter: { type: 'lighten', value: 0.06 } },
      active: { filter: { type: 'darken', value: 0.05 } },
    },
    legend: {
      position: 'bottom',
      fontSize: '12.5px',
      markers: { size: 7, shape: 'circle' },
      itemMargin: { horizontal: 10, vertical: 4 },
    },
    dataLabels: {
      enabled: true,
      style: { fontSize: '11px', fontWeight: 700 },
      formatter: (val) => `${val.toFixed(0)}%`,
      dropShadow: { enabled: false },
    },
    plotOptions: {
      pie: {
        expandOnClick: true,
        donut: {
          size: '62%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'ทั้งหมด',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#9aa0a6',
              formatter: () => distTotal,
            },
            value: { fontSize: '26px', fontWeight: 700, color: '#1a1a2e', offsetY: -2 },
          },
        },
      },
    },
    tooltip: { y: { formatter: (val) => `${val} รายการ` } },
  };
  const donutSeries = [statusCounts.open, statusCounts.waiting, statusCounts.closed];

  const yearChartOptions = {
    chart: { type: 'bar', stacked: true, toolbar: { show: false }, fontFamily: FONT_FAMILY },
    plotOptions: { bar: { borderRadius: 6, borderRadiusApplication: 'end', columnWidth: '38%' } },
    xaxis: {
      categories: yearBreakdown.years,
      labels: { style: { fontSize: '12px', colors: '#9aa0a6' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { fontSize: '11px', colors: '#9aa0a6' }, formatter: (v) => Math.round(v) } },
    colors: ['#1cc88a', '#f39c12', '#c0392b'],
    legend: { position: 'top', horizontalAlign: 'right', fontSize: '12px', markers: { size: 6 } },
    dataLabels: { enabled: false },
    grid: { borderColor: '#f1f1f4', strokeDashArray: 4, yaxis: { lines: { show: true } } },
    tooltip: { y: { formatter: (val) => `${val} รายการ` } },
  };
  const yearChartSeries = [
    { name: 'กำลังเปิดรับ', data: yearBreakdown.open },
    { name: 'รอเปิดรับ', data: yearBreakdown.waiting },
    { name: 'ปิดรับแล้ว', data: yearBreakdown.closed },
  ];

  const contentBarOptions = {
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: FONT_FAMILY },
    plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '42%', distributed: true } },
    xaxis: {
      categories: ['หลักสูตร', 'เอกสาร', 'แบนเนอร์หน้าแรก', 'แบนเนอร์หลักสูตร', 'แอดมิน'],
      labels: { style: { fontSize: '11px', colors: '#9aa0a6' } },
    },
    colors: ['#800000', '#0891b2', '#7c3aed', '#d9480f', '#1a1a2e'],
    dataLabels: { enabled: true, style: { fontSize: '11px', fontWeight: 700, colors: ['#fff'] } },
    legend: { show: false },
    grid: { borderColor: '#f1f1f4', strokeDashArray: 4 },
    tooltip: { y: { formatter: (val) => `${val} รายการ` } },
  };
  const contentBarSeries = [{
    name: 'จำนวน',
    data: [curriculums.length, documents.length, homeBannerCount, curriculumBannerCount, activeAdminCount],
  }];

  if (loading) {
    return (
      <div className="dashboard-loading-state">
        <div className="spinner-border text-danger" role="status"></div>
        <p className="mt-3 text-muted">กำลังโหลดข้อมูลจากฐานข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      {errorKeys.length > 0 && (
        <div className="dashboard-alert-error mb-3">
          <i className="fas fa-triangle-exclamation me-2"></i>
          โหลดข้อมูลบางส่วนไม่สำเร็จ: {errorKeys.map((k) => errorLabel[k]).join(', ')}
          <button className="btn-refresh-inline" onClick={fetchAll}>ลองใหม่</button>
        </div>
      )}

      {/* ===== แถวที่ 1: ภาพรวมการรับสมัคร ===== */}
      <div className="dashboard-section-header">
        <h6 className="dashboard-section-title"><span className="title-accent-bar"></span>ภาพรวมการรับสมัคร</h6>
        <div className="dashboard-section-actions">
          {lastUpdated && (
            <span className="dashboard-updated-at">
              อัปเดตล่าสุด {lastUpdated.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button className="btn-refresh" onClick={fetchAll} title="รีเฟรชข้อมูล">
            <i className="fas fa-rotate-right"></i>
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4 d-flex align-items-stretch stat-cards-row">
        <StatCard iconClass="ic-1" icon="fa-copy" number={padNum(announcements.length)} label="ประกาศทั้งหมด" delay={0} />
        <StatCard iconClass="ic-2" icon="fa-circle-check" number={padNum(statusCounts.open)} label="กำลังเปิดรับสมัคร" delay={60} />
        <StatCard iconClass="ic-4" icon="fa-clock" number={padNum(statusCounts.waiting)} label="รอเปิดรับสมัคร" delay={120} />
        <StatCard iconClass="ic-3" icon="fa-lock" number={padNum(statusCounts.closed)} label="ปิดการรับสมัครแล้ว" delay={180} />
      </div>

      {/* ===== แถวที่ 2: กราฟวิเคราะห์ข้อมูล ===== */}
      <div className="dashboard-charts-row mb-4">
        <ChartCard
          title="แนวโน้มประกาศรับสมัครรายปีการศึกษา"
          icon="fa-chart-column"
          subtitle="จำนวนประกาศ แยกตามสถานะและปีการศึกษา"
          className="chart-card-wide"
        >
          {yearBreakdown.years.length === 0 ? (
            <div className="panel-empty">
              <i className="fas fa-chart-column fa-2x mb-2 text-muted"></i>
              <p className="text-muted m-0">ยังไม่มีข้อมูลประกาศเพียงพอสำหรับแสดงกราฟค่ะ</p>
            </div>
          ) : (
            <Chart options={yearChartOptions} series={yearChartSeries} type="bar" height={300} />
          )}
        </ChartCard>

        <ChartCard
          title="สัดส่วนสถานะประกาศ"
          icon="fa-chart-pie"
          subtitle="กำลังเปิดรับ / รอเปิดรับ / ปิดรับแล้ว"
          className="chart-card-donut"
        >
          {distTotal === 0 ? (
            <div className="panel-empty">
              <i className="fas fa-chart-pie fa-2x mb-2 text-muted"></i>
              <p className="text-muted m-0">ยังไม่มีประกาศที่ระบุวันรับสมัครค่ะ</p>
            </div>
          ) : (
            <Chart options={donutOptions} series={donutSeries} type="donut" height={300} />
          )}
        </ChartCard>
      </div>

      {/* ===== แถวที่ 3: ภาพรวมข้อมูลระบบ ===== */}
      <div className="dashboard-section-header">
        <h6 className="dashboard-section-title"><span className="title-accent-bar"></span>ภาพรวมข้อมูลในระบบ</h6>
      </div>
      <div className="dashboard-content-overview mb-4">
        <div className="row g-3 d-flex align-items-stretch stat-cards-row content-stat-cards">
          <StatCard iconClass="ic-5" icon="fa-book" number={padNum(curriculums.length)} label="หลักสูตรทั้งหมด" delay={0} />
          <StatCard iconClass="ic-6" icon="fa-file-archive" number={padNum(documents.length)} label="เอกสารในคลัง" delay={60} />
          <StatCard iconClass="ic-7" icon="fa-images" number={padNum(homeBannerCount)} label="แบนเนอร์หน้าแรก" delay={120} />
          <StatCard iconClass="ic-9" icon="fa-panorama" number={padNum(curriculumBannerCount)} label="แบนเนอร์หลักสูตร" delay={150} />
          <StatCard iconClass="ic-8" icon="fa-user-shield" number={padNum(activeAdminCount)} label="ผู้ดูแลระบบ" delay={180} />
        </div>
        <ChartCard
          title="ภาพรวมข้อมูลในระบบ"
          icon="fa-chart-simple"
          className="content-bar-card"
        >
          <Chart options={contentBarOptions} series={contentBarSeries} type="bar" height={220} />
        </ChartCard>
      </div>

      {/* ===== แถวที่ 4: รายการล่าสุด ===== */}
      <div className="dashboard-panels-row">
        <div className="dashboard-panel fade-in-up">
          <div className="panel-header">
            <h6 className="panel-title"><i className="fas fa-copy me-2 text-danger"></i>ประกาศรับสมัครล่าสุด</h6>
            <button className="panel-link" onClick={() => navigate('/admin/manage-tcas')}>
              ดูทั้งหมด <i className="fas fa-arrow-right ms-1"></i>
            </button>
          </div>
          {recentAnnouncements.length === 0 ? (
            <div className="panel-empty">
              <i className="fas fa-inbox fa-2x mb-2 text-muted"></i>
              <p className="text-muted m-0">ยังไม่มีประกาศในระบบค่ะ</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle dashboard-recent-table">
                <thead>
                  <tr>
                    <th>หัวข้อประกาศ</th>
                    <th>รอบ / ปีการศึกษา</th>
                    <th>วันรับสมัคร</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAnnouncements.map((item) => {
                    const label = getLabelStatus(item);
                    return (
                      <tr key={item.announcementID}>
                        <td className="fw-semibold">{item.title}</td>
                        <td><small>{item.tcasRound || '-'} / {item.academicYear || '-'}</small></td>
                        <td><small>{formatDateTh(item.openDate)} — {formatDateTh(item.closeDate)}</small></td>
                        <td><span className={`dash-badge ${statusBadgeClass(label)}`}>{label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="dashboard-panel fade-in-up">
          <div className="panel-header">
            <h6 className="panel-title"><i className="fas fa-file-arrow-up me-2 text-danger"></i>เอกสารอัปโหลดล่าสุด</h6>
            <button className="panel-link" onClick={() => navigate('/admin/documents')}>
              ดูทั้งหมด <i className="fas fa-arrow-right ms-1"></i>
            </button>
          </div>
          {recentDocuments.length === 0 ? (
            <div className="panel-empty">
              <i className="fas fa-folder-open fa-2x mb-2 text-muted"></i>
              <p className="text-muted m-0">ยังไม่มีเอกสารในคลังค่ะ</p>
            </div>
          ) : (
            <ul className="recent-doc-list">
              {recentDocuments.map((doc) => (
                <li key={doc.documentID} className="recent-doc-item">
                  <div className="recent-doc-icon">
                    <i className="fas fa-file-lines"></i>
                  </div>
                  <div className="recent-doc-info">
                    <div className="recent-doc-name">{doc.originalFileName || doc.fileName}</div>
                    <div className="recent-doc-meta">
                      <span className="doc-category-chip">{documentCategoryLabel(doc.fileCategory)}</span>
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span>{formatDateTh(doc.uploadDate)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
