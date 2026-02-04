import React from 'react';

const Header = ({ 
  activeTab, 
  onTabChange, 
  onOpenAuth, 
  isLoggedIn,
  cartCount, 
  notificationCount, 
  onOpenNotifications,
  isResidentRider,
  onLogout
}) => {
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
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={onOpenNotifications}>
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
            </div>
            
            {/* Cart */}
            <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }} onClick={() => onTabChange?.('cart')}>
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

export default Header;
