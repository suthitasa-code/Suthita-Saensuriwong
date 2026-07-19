import { Link } from 'react-router-dom';
import { getLabelStatus, statusBadgeClass } from '../utils/announcementStatus';
import '../styles/announcement-card.css';

const AnnouncementCard = ({ item }) => {
  const label = getLabelStatus(item);

  return (
    <div className="announcement-card">
      <div className="announcement-card-top">
        <span className="announcement-card-icon">
          <i className="fas fa-calendar-check"></i>
        </span>
        <span className="year-text">ปีการศึกษา {item.academicYear || '-'}</span>
      </div>
      <div className="announcement-card-body">
        <span className={`badge-status ${statusBadgeClass(label)}`}>{label}</span>
        <div className="card-title-sub">{item.title}</div>
        <div className="card-tcas-round">
          <i className="fas fa-layer-group"></i>
          {item.tcasRound || '-'}
        </div>
        <Link to={`/announcement/${item.announcementID}`} className="btn-detail">
          ดูรายละเอียดการรับสมัคร <i className="fas fa-arrow-right ms-1"></i>
        </Link>
      </div>
    </div>
  );
};

export default AnnouncementCard;
