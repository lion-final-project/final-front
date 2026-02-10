import React, { useState, useEffect } from 'react';
import { getBannersForCustomer } from '../../api/bannerApi';

const Hero = ({ onShopClick, onPromoClick }) => {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const banners = await getBannersForCustomer();
        if (!isMounted || !Array.isArray(banners) || banners.length === 0) return;
        const mapped = banners.map((b, index) => ({
          id: b.id ?? index,
          tag: b.content || '오늘의 추천 기획전',
          title: b.title ?? '',
          desc: b.content ?? '',
          bgImage: b.imageUrl ?? '',
          primaryBtn: '지금 쇼핑하기',
          secondaryBtn: '기획전 보기',
          overlay: b.backgroundColor || 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 100%)',
        }));
        setSlides(mapped);
        setCurrentSlide(0);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (isHovered || slides.length === 0) return; // Pause auto-play on hover or when no slides
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHovered, slides.length]);

  const nextSlide = (e) => {
    e.stopPropagation();
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        marginTop: '32px',
        position: 'relative',
        height: '400px',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Search Bar Overlay - Optional, if requested later */}
      
      {slides.map((slide, index) => (
        <div 
          key={slide.id}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: currentSlide === index ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
            zIndex: currentSlide === index ? 1 : 0
          }}
        >
          {/* Background Image */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url("${slide.bgImage}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: currentSlide === index ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 6s ease-out'
          }} />
          
          {/* Gradient Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: slide.overlay
          }} />

          {/* Content */}
          <div style={{
            position: 'relative',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 60px',
            color: 'white'
          }}>
            <div style={{ 
              display: 'inline-block',
              backgroundColor: 'rgba(230, 126, 34, 0.9)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '800',
              marginBottom: '20px',
              width: 'fit-content'
            }}>
              {slide.tag}
            </div>
            <h2 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '16px', lineHeight: '1.2' }}>
              {slide.title}
            </h2>
            <p style={{ fontSize: '20px', marginBottom: '32px', opacity: 0.9, fontWeight: '500' }}>
              {slide.desc}
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button 
                onClick={onShopClick}
                style={{
                  padding: '16px 32px',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  borderRadius: '30px',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 10px 15px -3px rgba(46, 204, 113, 0.3)'
                }}
              >
                {slide.primaryBtn}
              </button>
              <button 
                onClick={onPromoClick}
                style={{
                  padding: '16px 32px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  borderRadius: '30px',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  border: '1px solid rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  backdropFilter: 'blur(5px)',
                  transition: 'all 0.2s'
                }}
              >
                {slide.secondaryBtn}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        style={{
          position: 'absolute',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          color: 'white',
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 20,
          opacity: isHovered ? 1 : 0,
          transition: 'all 0.3s',
        }}
      >
        ‹
      </button>
      <button
        onClick={nextSlide}
        style={{
          position: 'absolute',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          color: 'white',
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 20,
          opacity: isHovered ? 1 : 0,
          transition: 'all 0.3s',
        }}
      >
        ›
      </button>

      {/* Navigation Dots */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        zIndex: 10
      }}>
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: currentSlide === index ? 'white' : 'rgba(255, 255, 255, 0.4)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
