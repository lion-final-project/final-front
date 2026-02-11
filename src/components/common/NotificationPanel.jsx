import React from 'react';

const NotificationPanel = ({ isOpen, onClose, notifications, onMarkAsRead, onClearAll }) => {
  if (!isOpen) return null;

  return (
    <div className="notification-overlay" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      zIndex: 2000,
      backdropFilter: 'blur(2px)',
    }}>
      <div className="notification-panel" onClick={e => e.stopPropagation()} style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100%',
        maxWidth: '400px',
        height: '100%',
        backgroundColor: 'white',
        boxShadow: '-10px 0 25px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideIn 0.3s ease-out'
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>알림 센터</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>✕</button>
        </div>

        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '12px' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
              <p>새로운 알림이 없습니다.</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif.id} 
                onClick={() => onMarkAsRead(notif.id)}
                style={{ 
                  padding: '20px', 
                  borderRadius: '16px', 
                  marginBottom: '12px', 
                  backgroundColor: notif.read ? 'white' : '#f8fafc',
                  border: '1px solid',
                  borderColor: notif.read ? '#f1f5f9' : '#e2e8f0',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s'
                }}
              >
                {!notif.read && <span style={{ position: 'absolute', top: '20px', left: '10px', width: '8px', height: '8px', backgroundColor: 'var(--primary)', borderRadius: '50%' }}></span>}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', paddingLeft: notif.read ? '0' : '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700' }}>{notif.title}</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{notif.time}</span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.5', paddingLeft: notif.read ? '0' : '12px', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{notif.body}</p>
              </div>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9' }}>
            <button 
              onClick={onClearAll}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: '700', cursor: 'pointer' }}
            >모든 알림 읽음 처리</button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default NotificationPanel;
