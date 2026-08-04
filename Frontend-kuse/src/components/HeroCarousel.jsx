import { useEffect, useState } from 'react';
import { fileUrl } from '../config/api';
import '../styles/hero-carousel.css';

// การ์รูเซลหมุนอัตโนมัติ ใช้ร่วมกันได้ทั้งหน้าแรก (pageTarget=home) และหน้าหลักสูตร (pageTarget=curriculum)
const HeroCarousel = ({ banners, intervalMs = 5000, children }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [banners]);

  useEffect(() => {
    if (banners.length <= 1) return undefined;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [banners.length, intervalMs]);

  if (!banners.length) return null;

  const goPrev = () => setIndex((i) => (i - 1 + banners.length) % banners.length);
  const goNext = () => setIndex((i) => (i + 1) % banners.length);

  return (
    <div className="hero-carousel">
      {banners.length > 1 && (
        <>
          <button className="hero-arrow hero-arrow-prev" onClick={goPrev} aria-label="สไลด์ก่อนหน้า">
            <i className="fas fa-chevron-left"></i>
          </button>
          <button className="hero-arrow hero-arrow-next" onClick={goNext} aria-label="สไลด์ถัดไป">
            <i className="fas fa-chevron-right"></i>
          </button>
        </>
      )}

      {banners.map((banner, i) => (
        <div
          key={banner.bannerID}
          className={`hero-slide${i === index ? ' active' : ''}`}
          style={{ backgroundImage: `url(${fileUrl(`admin-images/${banner.imageFile}`)})` }}
        >
          <div className="hero-overlay">
            <div className="container">
              <h1 className="hero-title">{banner.title}</h1>
              {banner.subtitle && <p className="hero-subtitle">{banner.subtitle}</p>}
              {i === index && children && <div className="hero-cta-row mt-4">{children}</div>}
            </div>
          </div>
        </div>
      ))}

      {banners.length > 1 && (
        <div className="hero-indicators">
          {banners.map((banner, i) => (
            <button
              key={banner.bannerID}
              className={i === index ? 'active' : ''}
              onClick={() => setIndex(i)}
              aria-label={`สไลด์ที่ ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;
