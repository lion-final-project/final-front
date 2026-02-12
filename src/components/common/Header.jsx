import React, { useRef, useEffect, useState } from 'react';

const Header = ({ 
  activeTab, 
  onTabChange, 
  onOpenAuth, 
  isLoggedIn,
  cartCount, 
  notificationCount, 
  onOpenNotifications,
  isResidentRider,
  onLogout,
  hasStoreRole,
  onGoToStoreDashboard,
  storeId,
  isNotificationOpen,
  notifications,
  onMarkAsRead,
  onClearAll,
  onCloseNotifications,
  onCartClick,
}) => {
  const notificationButtonRef = useRef(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, right: 0 });
  return (
    <header className="header-glass" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="container header-container">
        <div className="header-left">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 className="gradient-text header-logo" style={{ cursor: 'pointer', margin: 0 }} onClick={() => onTabChange?.('home')}>동네마켓</h1>
          </div>
          <nav className="header-nav">
            <a href="#" className={activeTab === 'home' ? 'active' : ''} onClick={(e) => { e.preventDefault(); onTabChange?.('home'); }}>우리 동네</a>
            <a href="#" className={activeTab === 'special' ? 'active' : ''} onClick={(e) => { e.preventDefault(); onTabChange?.('special'); }}>기획전</a>
            <a href="#" className={activeTab === 'support' ? 'active' : ''} onClick={(e) => { e.preventDefault(); onTabChange?.('support'); }}>고객지원</a>
            <a href="#" 
               className={activeTab === 'partner' ? 'active' : ''} 
               onClick={(e) => { e.preventDefault(); onTabChange?.('partner'); }}
               style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              파트너 모집
              <span style={{ 
                backgroundColor: '#ef4444', 
                color: 'white', 
                fontSize: '9px', 
                padding: '1px 5px', 
                borderRadius: '10px', 
                fontWeight: '900',
                transform: 'translateY(-1px)'
              }}>HOT</span>
            </a>
          </nav>
        </div>
        <div className="header-right">
          <div className="header-icons">

            {/* Notifications */}
            <div 
              ref={notificationButtonRef}
              style={{ position: 'relative', cursor: 'pointer' }} 
              onClick={() => {
                if (isNotificationOpen) {
                  onCloseNotifications();
                } else {
                  onOpenNotifications();
                }
              }}
            >
              <span style={{ fontSize: '20px' }}>🔔</span>
              {notificationCount > 0 && (
                <span style={{ 
                  position: 'absolute', 
                  top: '-8px', 
                  right: '-8px', 
                  backgroundColor: 'var(--primary)', 
                  color: 'white', 
                  fontSize: '10px', 
                  fontWeight: '800', 
                  width: '18px', 
                  height: '18px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '2px solid white'
                }}>
                  {notificationCount}
                </span>
              )}
              
              {/* 말풍선 형태 알림 패널 */}
              {isNotificationOpen && (
                <NotificationDropdown
                  buttonRef={notificationButtonRef}
                  notifications={notifications || []}
                  onMarkAsRead={onMarkAsRead}
                  onClearAll={onClearAll}
                  onClose={onCloseNotifications}
                />
              )}
            </div>
            
            {/* Cart */}
            <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }} onClick={() => onCartClick ? onCartClick() : onTabChange?.('cart')}>
              <span style={{ color: activeTab === 'cart' ? 'var(--primary)' : 'inherit', fontSize: '20px' }}>🛒</span>
              <span className="header-icon-label" style={{ fontSize: '10px', fontWeight: '700', color: activeTab === 'cart' ? 'var(--primary)' : '#94a3b8' }}>장바구니</span>
              {cartCount > 0 && (
                <span style={{ 
                  position: 'absolute', 
                  top: '-8px', 
                  right: '-2px', 
                  backgroundColor: '#ef4444', 
                  color: 'white', 
                  fontSize: '10px', 
                  fontWeight: '800', 
                  width: '18px', 
                  height: '18px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '2px solid white'
                }}>
                  {cartCount}
                </span>
              )}
            </div>

            {/* 사장님 페이지로 */}
            {hasStoreRole && onGoToStoreDashboard && (
              <div 
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}
                onClick={() => onGoToStoreDashboard(storeId)}
              >
                <span style={{ color: activeTab === 'store' ? 'var(--primary)' : 'inherit', fontSize: '20px' }}>🏪</span>
                <span className="header-icon-label" style={{ fontSize: '10px', fontWeight: '700', color: activeTab === 'store' ? 'var(--primary)' : '#94a3b8' }}>사장님</span>
              </div>
            )}

            {/* Profile / Auth */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '4px' }}>
              <div 
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}
                onClick={() => (!isLoggedIn && onOpenAuth) ? onOpenAuth() : onTabChange?.('mypage')}
              >
                <span style={{ color: activeTab === 'mypage' ? 'var(--primary)' : 'inherit', fontSize: '20px' }}>👤</span>
                <span className="header-icon-label" style={{ fontSize: '10px', fontWeight: '700', color: activeTab === 'mypage' ? 'var(--primary)' : '#94a3b8' }}>
                  {isLoggedIn ? '마이페이지' : '로그인'}
                </span>
              </div>
              
              {isLoggedIn && (
                <button 
                  onClick={onLogout}
                  style={{
                    background: 'transparent',
                    border: '1px solid #e2e8f0',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#64748b',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#ef4444'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                >
                  로그아웃
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .header-glass {
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 12px 0;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }
        .header-glass:hover {
          background: rgba(255, 255, 255, 0.95);
        }
        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 40px;
        }
        .header-logo {
          font-size: 24px;
          font-weight: bold;
          white-space: nowrap;
        }
        .header-nav {
          display: flex;
          gap: 20px;
          font-weight: 600;
          color: var(--text-main);
          flex-shrink: 0;
        }
        .header-nav a {
          white-space: nowrap;
          text-decoration: none;
          color: inherit;
          transition: color 0.2s;
        }
        .header-nav a:hover {
          color: var(--primary);
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-grow: 1;
          justify-content: flex-end;
          min-width: 0;
        }
        .header-icons {
          display: flex;
          gap: 16px;
          font-size: 20px;
          flex-shrink: 0;
          align-items: center;
        }
        .header-icons > div {
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .header-nav {
            display: none;
          }
          .header-container {
            flex-direction: column;
            gap: 12px;
            padding: 8px 16px;
          }
          .header-left {
            width: 100%;
            justify-content: center;
          }
          .header-right {
            width: 100%;
            justify-content: center;
          }
          .header-glass {
            padding: 8px 0;
          }
          .header-icon-label {
             display: none;
          }
        }


      `}</style>
    </header>
  );
};

// 말풍선 형태 알림 드롭다운 컴포넌트 (네이버 스타일)
const NotificationDropdown = ({ buttonRef, notifications, onMarkAsRead, onClearAll, onClose }) => {
  const [position, setPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 10,
          right: window.innerWidth - rect.right - 20 // 버튼 오른쪽에서 약간 왼쪽으로
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [buttonRef]);

  return (
    <>
      {/* 오버레이 */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1999,
          backgroundColor: 'transparent'
        }}
      />
      
      {/* 말풍선 패널 */}
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: `${position.top}px`,
          right: `${position.right}px`,
          width: '360px',
          maxWidth: 'min(400px, 90vw)',
          maxHeight: '520px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeInDown 0.2s ease-out'
        }}
      >
        {/* 말풍선 화살표 (네이버 스타일) */}
        <div
          style={{
            position: 'absolute',
            top: '-6px',
            right: '24px',
            width: '12px',
            height: '12px',
            backgroundColor: 'white',
            transform: 'rotate(45deg)',
            borderLeft: '1px solid rgba(0,0,0,0.05)',
            borderTop: '1px solid rgba(0,0,0,0.05)',
            boxShadow: '-2px -2px 4px rgba(0,0,0,0.05)'
          }}
        />

        {/* 헤더 */}
        <div style={{ 
          padding: '16px 20px', 
          borderBottom: '1px solid #f1f5f9', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: '#fafbfc'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#1e293b' }}>알림</h3>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '20px', 
              cursor: 'pointer', 
              color: '#94a3b8', 
              padding: '0',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.color = '#64748b';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            ✕
          </button>
        </div>

        {/* 알림 목록 */}
        <div style={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          padding: '8px', 
          maxHeight: '420px',
          backgroundColor: '#fafbfc'
        }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.5 }}>🔔</div>
              <p style={{ fontSize: '14px', margin: 0, fontWeight: '500' }}>새로운 알림이 없습니다.</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif.id} 
                onClick={() => onMarkAsRead && onMarkAsRead(notif.id)}
                style={{ 
                  padding: '14px 16px', 
                  borderRadius: '8px', 
                  marginBottom: '4px', 
                  backgroundColor: notif.read ? 'white' : '#f0fdf4',
                  border: notif.read ? 'none' : '1px solid #dcfce7',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.15s',
                  boxShadow: notif.read ? 'none' : '0 1px 2px rgba(0,0,0,0.03)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = notif.read ? '#f8fafc' : '#f0fdf4';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = notif.read ? 'white' : '#f0fdf4';
                }}
              >
                {!notif.read && (
                  <span style={{ 
                    position: 'absolute', 
                    top: '16px', 
                    left: '12px', 
                    width: '8px', 
                    height: '8px', 
                    backgroundColor: 'var(--primary)', 
                    borderRadius: '50%',
                    boxShadow: '0 0 0 2px white'
                  }} />
                )}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '6px', 
                  paddingLeft: notif.read ? '0' : '20px' 
                }}>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    flex: 1,
                    color: '#1e293b',
                    lineHeight: '1.4'
                  }}>
                    {notif.title}
                  </span>
                  <span style={{ 
                    fontSize: '11px', 
                    color: '#94a3b8', 
                    marginLeft: '12px',
                    whiteSpace: 'nowrap',
                    fontWeight: '500'
                  }}>
                    {notif.time}
                  </span>
                </div>
                <p style={{ 
                  margin: 0, 
                  fontSize: '13px', 
                  color: '#64748b', 
                  lineHeight: '1.5', 
                  paddingLeft: notif.read ? '0' : '20px',
                  fontWeight: '400',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}>
                  {notif.body}
                </p>
              </div>
            ))
          )}
        </div>

        {/* 푸터 */}
        {notifications.length > 0 && (
          <div style={{ 
            padding: '12px 16px', 
            borderTop: '1px solid #f1f5f9',
            backgroundColor: 'white'
          }}>
            <button 
              onClick={onClearAll}
              style={{ 
                width: '100%', 
                padding: '10px', 
                borderRadius: '8px', 
                background: '#f1f5f9', 
                border: 'none', 
                color: '#475569', 
                fontWeight: '600', 
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#e2e8f0';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
              }}
            >
              모두 읽음 처리
            </button>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default Header;
