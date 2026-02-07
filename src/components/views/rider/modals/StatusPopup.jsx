import React from 'react';

const StatusPopup = ({ statusPopup, onClose }) => {
  if (!statusPopup) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '28px', width: '100%', maxWidth: '320px', textAlign: 'center', border: `1px solid ${statusPopup.type === 'error' ? '#ef4444' : statusPopup.type === 'online' ? '#10b981' : '#38bdf8'}`, animation: 'popup-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>{statusPopup.type === 'online' ? '🚀' : statusPopup.type === 'offline' ? '🏡' : '⚠️'}</div>
        <div style={{ fontSize: '18px', fontWeight: '800', lineHeight: '1.5', whiteSpace: 'pre-line', marginBottom: '24px' }}>{statusPopup.message}</div>
        {statusPopup.type === 'online' && (
          <div style={{ marginBottom: '24px', padding: '12px', backgroundColor: '#0f172a', borderRadius: '12px', fontSize: '12px', color: '#94a3b8' }}>📍 현재 위치 확인 완료<br />서울시 강남구 삼성동</div>
        )}
        <button onClick={onClose} style={{ width: '100%', padding: '16px', borderRadius: '16px', backgroundColor: statusPopup.type === 'error' ? '#ef4444' : '#38bdf8', color: 'white', border: 'none', fontWeight: '900', fontSize: '16px', cursor: 'pointer' }}>확인</button>
      </div>
    </div>
  );
};

export default StatusPopup;
