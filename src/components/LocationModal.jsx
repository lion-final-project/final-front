import React, { useState } from 'react';

const LocationModal = ({ isOpen, onClose, currentLocation, onSetLocation }) => {
  if (!isOpen) return null;

  // Mock map data
  const nearbyStores = [
    { id: 1, name: '햇살 청과', lat: 50, lng: 40, type: 'mart' },
    { id: 2, name: '싱싱 정육', lat: 30, lng: 70, type: 'mart' },
    { id: 3, name: '우리집', lat: 45, lng: 50, type: 'home' } // User location
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white', width: '90%', maxWidth: '500px', borderRadius: '24px', overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', height: '80vh'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#111' }}>주소 설정</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>

        {/* Range Notice */}
        <div style={{ padding: '12px 24px', backgroundColor: '#f0fdf4', borderBottom: '1px solid #dcfce7', color: '#166534', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>ℹ️</span>
          <span>반경 3km 내의 가게 상품만 주문이 가능합니다.</span>
        </div>

        {/* Search */}
        <div style={{ padding: '16px 24px', backgroundColor: 'white', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ position: 'relative' }}>
             <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#00c73c' }}>🔍</span>
             <input type="text" placeholder="지번, 도로명, 건물명으로 검색" style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', border: '2px solid #00c73c', backgroundColor: 'white', fontSize: '15px', outline: 'none' }} />
          </div>
        </div>

        {/* Map Area (Mock) */}
        <div style={{ flexGrow: 1, position: 'relative', backgroundColor: '#f4f4f4', overflow: 'hidden' }}>
          {/* Mock Map Image Representation (Naver Map Style) */}
          <div style={{ 
            position: 'absolute', inset: 0, 
            backgroundImage: 'radial-gradient(#ddd 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            backgroundColor: '#f8fafc'
          }}></div>

          {/* Map Controls */}
          <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 5 }}>
            <button style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', fontSize: '20px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>+</button>
            <button style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', fontSize: '20px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>-</button>
          </div>

          <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 5 }}>
             <button style={{ padding: '10px 16px', borderRadius: '30px', border: 'none', background: 'white', color: '#333', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#00c73c' }}>📍</span> 현재 위치
             </button>
          </div>

          {/* Points of Interest */}
          {nearbyStores.map(store => (
            <div key={store.id} style={{
              position: 'absolute',
              top: `${store.lat}%`,
              left: `${store.lng}%`,
              transform: 'translate(-50%, -100%)',
              zIndex: 2
            }}>
              <div style={{ 
                width: '12px', height: '12px', 
                backgroundColor: store.type === 'home' ? '#ff4b4b' : '#00c73c', 
                borderRadius: '50%', 
                border: '3px solid white',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                marginBottom: '4px'
              }}></div>
              <div style={{ 
                backgroundColor: 'white', padding: '4px 10px', borderRadius: '20px', 
                fontWeight: '700', fontSize: '11px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                whiteSpace: 'nowrap', border: '1px solid #eee'
              }}>
                {store.name}
              </div>
            </div>
          ))}

          {/* Center Pin (Target) */}
          <div style={{ 
             position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -100%)',
             zIndex: 10
          }}>
             <div style={{ 
                width: '36px', height: '36px', 
                backgroundColor: '#ff4b4b', 
                borderRadius: '50% 50% 50% 0', 
                transform: 'rotate(-45deg)',
                border: '2px solid white',
                boxShadow: '0 4px 12px rgba(255, 75, 75, 0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'bounce 1s infinite'
             }}>
                <div style={{ transform: 'rotate(45deg)', width: '10px', height: '10px', background: 'white', borderRadius: '50%' }}></div>
             </div>
             <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0) rotate(-45deg); } 50% { transform: translateY(-10px) rotate(-45deg); } }`}</style>
          </div>
        </div>

        {/* Footer Action */}
        <div style={{ padding: '24px', backgroundColor: 'white', borderTop: '1px solid #f1f5f9' }}>
           <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: '#00c73c', fontWeight: '800', marginBottom: '6px' }}>설정하려는 주소가 맞나요?</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '4px' }}>서울 강남구 테헤란로 123</div>
              <div style={{ fontSize: '14px', color: '#94a3b8' }}>[도로명] 서울특별시 강남구 테헤란로 123 (역삼동)</div>
           </div>
           <button 
             onClick={() => { onSetLocation('서울 강남구 테헤란로 123'); onClose(); }}
             style={{ width: '100%', padding: '18px', borderRadius: '12px', backgroundColor: '#00c73c', color: 'white', border: 'none', fontWeight: '800', fontSize: '16px', cursor: 'pointer', boxShadow: '0 8px 16px rgba(0, 199, 60, 0.2)' }}
           >
             이 위치로 주소 설정
           </button>
        </div>

      </div>
    </div>
  );
};

export default LocationModal;
