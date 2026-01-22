import React from 'react';

const Hero = ({ onShopClick, onPromoClick }) => {
  return (
    <section style={{
      marginTop: '32px',
      position: 'relative',
      height: '400px',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Background Image */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url("https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 0
      }} />
      
      {/* Gradient Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 100%)',
        zIndex: 1
      }} />

      <div style={{
        position: 'relative',
        zIndex: 2,
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
          🔥 오늘만 이 가격! 타임 세일 중
        </div>
        <h2 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '16px', lineHeight: '1.2' }}>
          우리 동네 마트의 <br /> 신선함을 집 앞으로
        </h2>
        <p style={{ fontSize: '20px', marginBottom: '32px', opacity: 0.9, fontWeight: '500' }}>
          최대 50% 할인 혜택과 함께 <br /> 30분 내 초고속 배달을 경험하세요.
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
          }}>
            지금 쇼핑하기
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
          }}>
            기획전 보기
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
