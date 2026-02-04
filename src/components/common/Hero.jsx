import React, { useState, useEffect } from 'react';

const slides = [
  {
    id: 1,
    tag: '🔥 오늘만 이 가격! 타임 세일 중',
    title: <>우리 동네 마트의 <br /> 신선함을 집 앞으로</>,
    desc: <>최대 50% 할인 혜택과 함께 <br /> 30분 내 초고속 배달을 경험하세요.</>,
    bgImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    primaryBtn: '지금 쇼핑하기',
    secondaryBtn: '기획전 보기',
    overlay: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 100%)'
  },
  {
    id: 2,
    tag: '🎫 신규 가입 혜택',
    title: <>첫 주문이라면 <br /> 누구나 3,000원 할인</>,
    desc: <>지금 가입하고 첫 구매 완료 시 <br /> 즉시 사용 가능한 쿠폰을 드려요.</>,
    bgImage: 'https://images.unsplash.com/photo-1607623273573-599d75b03519?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    primaryBtn: '쿠폰 받기',
    secondaryBtn: '자세히 보기',
    overlay: 'linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 100%)'
  },
  {
    id: 3,
    tag: '🍞 갓 구운 빵',
    title: <>매일 아침 구워낸 <br /> 따뜻한 베이커리</>,
    desc: <>동네 유명 베이커리의 빵을 <br /> 집에서 편하게 즐겨보세요.</>,
    bgImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
    primaryBtn: '빵집 구경하기',
    secondaryBtn: '예약 주문',
    overlay: 'linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 100%)'
  }
];

const Hero = ({ onShopClick, onPromoClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return; // Pause auto-play on hover
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = (e) => {
    e.stopPropagation();
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
