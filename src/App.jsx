import React, { useState } from 'react';
import './styles/global.css';
import Header from './components/Header';
import CustomerView from './components/CustomerView';
import StoreDashboard from './components/StoreDashboard';
import RiderDashboard from './components/RiderDashboard';
import AdminDashboard from './components/AdminDashboard';
import NotificationPanel from './components/NotificationPanel';
import StoreDetailModal from './components/StoreDetailModal';
import AuthModal from './components/AuthModal';
import {} from './data/mockData';

function App() {
  const [userRole, setUserRole] = useState('CUSTOMER'); // CUSTOMER, STORE, RIDER, ADMIN
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  // Removed unused category and search state state

  const [selectedStore, setSelectedStore] = useState(null);
  const [isResidentRider, setIsResidentRider] = useState(false);
  const [isDeliveryMode, setIsDeliveryMode] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: '주문 수락됨', body: '행복 마트에서 사장님이 주문을 수락했습니다.', time: '5분 전', type: 'order', read: false },
    { id: 2, title: '특가 알림', body: '오늘만! 대추토마토 50% 타임 세일 시작', time: '1시간 전', type: 'promotion', read: false },
    { id: 3, title: '배달 완료', body: '박민수 라이더님이 배달을 완료했습니다.', time: '2시간 전', type: 'delivery', read: true }
  ]);

  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAll = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('CUSTOMER'); // Default back to customer view as guest
    setSelectedStore(null);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setUserRole('CUSTOMER');
  };

  const renderContent = () => {
    if (userRole === 'CUSTOMER') return (
      <CustomerView 
        userRole={userRole}
        setUserRole={setUserRole}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        setSelectedStore={setSelectedStore}
        isResidentRider={isResidentRider} 
        setIsResidentRider={setIsResidentRider}
        isDeliveryMode={isDeliveryMode}
        setIsDeliveryMode={setIsDeliveryMode}
        notificationCount={unreadCount}
      />
    );
    if (userRole === 'STORE') return <StoreDashboard />;
    if (userRole === 'RIDER') return <RiderDashboard isResidentRider={isResidentRider} />;
    if (userRole === 'ADMIN') return <AdminDashboard />;
  };

  return (
    <div className="App">
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0,0,0,0.8)',
        padding: '12px',
        borderRadius: '16px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: 'white', fontSize: '12px', fontWeight: '800' }}>Role:</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['CUSTOMER', 'STORE', 'RIDER', 'ADMIN'].map(role => (
              <button 
                key={role}
                onClick={() => setUserRole(role)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: userRole === role ? 'var(--primary)' : '#334155',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '800',
                  transition: 'all 0.2s ease'
                }}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
        
        {userRole === 'CUSTOMER' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
            <span style={{ color: 'white', fontSize: '12px', fontWeight: '800' }}>Auth:</span>
            <button 
              onClick={() => setIsLoggedIn(!isLoggedIn)}
              style={{
                padding: '6px 16px',
                borderRadius: '8px',
                border: 'none',
                background: isLoggedIn ? '#3b82f6' : '#64748b',
                color: 'white',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '800',
                transition: 'all 0.2s ease',
                flexGrow: 1,
                marginLeft: '15px'
              }}
            >
              {isLoggedIn ? 'LOGGED IN (Member)' : 'LOGGED OUT (Guest)'}
            </button>
          </div>
        )}
      </div>

      {renderContent()}
      
      {selectedStore && (
        <StoreDetailModal 
          store={selectedStore} 
          onClose={() => setSelectedStore(null)} 
        />
      )}

      <NotificationPanel 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onClearAll={handleClearAll}
      />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLoginSuccess={handleLoginSuccess} 
      />
    </div>
  );
}

export default App;
