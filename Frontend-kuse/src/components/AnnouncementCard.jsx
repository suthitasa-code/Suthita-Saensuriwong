import { Link } from 'react-router-dom';
import { getLabelStatus, statusBadgeClass } from '../utils/announcementStatus';
import '../styles/announcement-card.css';

const AnnouncementCard = ({ item }) => {
  const label = getLabelStatus(item);

  return (
    <div className="announcement-card">
      <span className="year-text">{item.academicYear || '-'}</span>
      <span className={`badge-status ${statusBadgeClass(label)}`}>{label}</span>
      <div className="card-title-sub">{item.title}</div>
      <div className="card-tcas-round">{item.tcasRound || '-'}</div>
      <Link to={`/announcement/${item.announcementID}`} className="btn-detail">
        ดูรายละเอียดการรับสมัคร
      </Link>
    </div>
  );
};

export default AnnouncementCard;
