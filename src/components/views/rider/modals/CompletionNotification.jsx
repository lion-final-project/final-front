import React from 'react';

const CompletionNotification = ({ notification, onClose }) => {
  if (!notification) return null;
  return (
    <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 32px)', maxWidth: '468px', backgroundColor: '#10b981', color: 'white', padding: '16px 20px', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 2000, animation: 'slideDownBounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🎉</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', fontWeight: '600', opacity: 0.9 }}>배달 완료!</div>
        <div style={{ fontSize: '16px', fontWeight: '800' }}>{notification.fee.toLocaleString()}원 수익 적립</div>
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer', padding: '4px' }}>✕</button>
    </div>
  );
};

export default CompletionNotification;
