import '../styles/announcement.css';
const AnnouncementFilterCard = ({
  searchQuery, setSearchQuery,
  yearFilter, setYearFilter,
  roundFilter, setRoundFilter,
  statusFilter, setStatusFilter,
  yearOptions, roundOptions,
}) => (
  <div className="filter-card">
    <div className="filter-label"><i className="fas fa-search me-2"></i> ค้นหาและกรองข้อมูล</div>
    <div className="row g-3">
      <div className="col-md-4">
        <label className="small text-muted mb-1">ค้นหาชื่อประกาศ (TCAS, Portfolio, ฯลฯ)</label>
        <input
          type="text"
          className="form-control"
          placeholder="พิมพ์เพื่อค้นหา..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="col-md-2">
        <label className="small text-muted mb-1">ปีการศึกษา</label>
        <select className="form-select" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
          <option value="all">ทั้งหมด</option>
          {yearOptions.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      <div className="col-md-3">
        <label className="small text-muted mb-1">รอบ TCAS</label>
        <select className="form-select" value={roundFilter} onChange={(e) => setRoundFilter(e.target.value)}>
          <option value="all">ทั้งหมด</option>
          {roundOptions.map((round) => (
            <option key={round} value={round}>{round}</option>
          ))}
        </select>
      </div>
      <div className="col-md-3">
        <label className="small text-muted mb-1">สถานะ</label>
        <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">ทั้งหมด</option>
          <option value="open">กำลังเปิดรับ</option>
          <option value="waiting">รอเปิดรับ</option>
          <option value="closed">ปิดรับแล้ว</option>
        </select>
      </div>
    </div>
  </div>
);

export default AnnouncementFilterCard;
