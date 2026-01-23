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
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>주소 설정</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>

        {/* Search */}
        <div style={{ padding: '16px 24px', backgroundColor: 'white' }}>
          <div style={{ position: 'relative' }}>
             <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
             <input type="text" placeholder="지번, 도로명, 건물명으로 검색" style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px' }} />
          </div>
          <button style={{ width: '100%', padding: '12px', marginTop: '12px', background: 'white', border: '1px solid #3b82f6', color: '#3b82f6', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', gap: '8px' }}>
             📍 현재 위치로 찾기
          </button>
        </div>

        {/* Map Area (Mock) */}
        <div style={{ flexGrow: 1, position: 'relative', backgroundColor: '#eef2f6', overflow: 'hidden' }}>
          {/* Mock Map Grid */}
          <div style={{ 
            position: 'absolute', inset: 0, 
            backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.3
          }}></div>

          {/* Map Content Center Text */}
          <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', color: '#64748b', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
             지도를 움직여 위치를 설정하세요
          </div>

          {/* Pins */}
          {nearbyStores.map(store => (
            <div key={store.id} style={{
              position: 'absolute',
              top: `${store.lat}%`,
              left: `${store.lng}%`,
              transform: 'translate(-50%, -100%)',
              textAlign: 'center',
              cursor: 'pointer'
            }}>
              <div style={{ 
                width: '40px', height: '40px', 
                backgroundColor: store.type === 'home' ? '#ef4444' : '#3b82f6', 
                borderRadius: '50% 50% 50% 0', 
                transform: 'rotate(-45deg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                margin: '0 auto'
              }}>
                <div style={{ transform: 'rotate(45deg)', fontSize: '20px' }}>
                  {store.type === 'home' ? '🏠' : '🏪'}
                </div>
              </div>
              <div style={{ 
                marginTop: '8px', backgroundColor: 'white', padding: '4px 8px', borderRadius: '4px', 
                fontWeight: '700', fontSize: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap'
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
                fontSize: '48px', filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.3))',
                animation: 'bounce 1s infinite'
             }}>📍</div>
             <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`}</style>
          </div>
        </div>

        {/* Footer Action */}
        <div style={{ padding: '24px', backgroundColor: 'white', borderTop: '1px solid #f1f5f9' }}>
           <div style={{ marginBottom: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>서울 강남구 테헤란로 123</div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>[지번] 역삼동 123-45</div>
           </div>
           <button 
             onClick={() => { onSetLocation('서울 강남구 테헤란로 123'); onClose(); }}
             style={{ width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', fontWeight: '800', fontSize: '16px', cursor: 'pointer' }}
           >
             이 위치로 주소 설정
           </button>
        </div>

      </div>
    </div>
  );
};

export default LocationModal;
