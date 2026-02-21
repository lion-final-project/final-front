import React, { useState, useEffect, useRef, useCallback } from 'react';
import './styles/global.css';
import { authApi } from './api/authApi';
import Header from './components/common/Header';
import CustomerView from './components/views/customer/CustomerView';
import StoreDashboard from './components/views/store/StoreDashboard';
import RiderDashboard from './components/views/rider/RiderDashboard';
import AdminDashboard from './components/views/admin/AdminDashboard';
import NotificationPanel from './components/common/NotificationPanel';
import AuthModal from './components/features/auth/AuthModal';
import PasswordResetView from './components/features/auth/PasswordResetView';
import { Agentation } from "agentation";

import { checkAuth, logout } from './api/authApi';
import { subscribeNotifications, getUnreadNotifications, markAllAsRead, markAsRead } from './api/notificationApi';
import { API_BASE_URL } from './config/api';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [userRole, setUserRole] = useState('CUSTOMER'); // CUSTOMER, STORE, RIDER, ADMIN
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null); // 사용자 정보 저장
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState(null); // 'social-extra' | null
  const [socialSignupState, setSocialSignupState] = useState(null); // 소셜 추가 가입용 state JWT (세션 대신)

  const [isResidentRider, setIsResidentRider] = useState(false);
  const [storeRegistrationStatus, setStoreRegistrationStatus] = useState('NONE'); // NONE, PENDING, APPROVED
  const [storeRegistrationStoreName, setStoreRegistrationStoreName] = useState(null); // 입점 신청한 상호명
  const [riderRegistrationStatus, setRiderRegistrationStatus] = useState('NONE');
  const [riderRegistrationApprovalId, setRiderRegistrationApprovalId] = useState(null);
  const [riderInfo, setRiderInfo] = useState(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const eventSourceRef = useRef(null);

  // 시간 포맷팅 함수
  const formatTime = useCallback((dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR');
  }, []);

  // 알림 목록 조회
  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const data = await getUnreadNotifications();
      // 백엔드 응답을 프론트엔드 형식으로 변환
      const formattedNotifications = data.map(notif => ({
        id: notif.id,
        title: notif.title,
        body: notif.content,
        time: formatTime(notif.createdAt),
        type: notif.referenceType?.toLowerCase() || 'order',
        read: false // 읽지 않은 알림만 조회하므로 항상 false
      }));
      setNotifications(formattedNotifications);
      setUnreadCount(formattedNotifications.length);
    } catch (error) {
      console.error('알림 조회 실패:', error);
    }
  }, [isLoggedIn, formatTime]);

  // SSE 이벤트 핸들러를 useRef로 저장하여 항상 최신 상태 참조
  const handleSseMessageRef = useRef(null);
  const handleSseErrorRef = useRef(null);

  // 핸들러를 최신 상태로 업데이트
  useEffect(() => {
    handleSseMessageRef.current = (eventName, data) => {
      console.log('[SSE] 이벤트 수신:', eventName, data);
      if (eventName === 'UNREAD_COUNT') {
        const count = typeof data === 'number' ? data : parseInt(data, 10);
        console.log('[SSE] 읽지 않은 알림 개수 업데이트:', count);
        if (!isNaN(count)) {
          // 알림 개수를 즉시 업데이트
          setUnreadCount(count);
          // 알림 목록도 즉시 다시 조회
          getUnreadNotifications()
            .then(data => {
              // formatTime을 직접 호출하여 최신 버전 사용
              const formatTimeNow = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                const now = new Date();
                const diffMs = now - date;
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMs / 3600000);
                const diffDays = Math.floor(diffMs / 86400000);

                if (diffMins < 1) return '방금 전';
                if (diffMins < 60) return `${diffMins}분 전`;
                if (diffHours < 24) return `${diffHours}시간 전`;
                if (diffDays < 7) return `${diffDays}일 전`;
                return date.toLocaleDateString('ko-KR');
              };
              const formattedNotifications = data.map(notif => ({
                id: notif.id,
                title: notif.title,
                body: notif.content,
                time: formatTimeNow(notif.createdAt),
                type: notif.referenceType?.toLowerCase() || 'order',
                read: false
              }));
              setNotifications(formattedNotifications);
            })
            .catch(error => {
              console.error('[SSE] 알림 목록 조회 실패:', error);
            });
        }
      } else if (eventName === 'CONNECTED') {
        console.log('[SSE] 연결됨:', data);
      } else if (eventName === 'STORE_ORDER_CREATED') {
        // 스토어 신규 주문 알림 → 대시보드 목록 갱신용 커스텀 이벤트 (백엔드는 스토어 오너에게만 전송)
        window.dispatchEvent(new CustomEvent('store-order-created', { detail: data }));
      } else if (eventName === 'STORE_ORDER_UPDATED') {
        // TTL 기반 상태 변경(자동 거절/준비완료) 후 목록 갱신 요청
        window.dispatchEvent(new CustomEvent('store-order-updated', { detail: data }));
      } else if (eventName === 'NEW_DELIVERY') {
        // 라이더 주변 새 배달 요청
        window.dispatchEvent(new CustomEvent('new-delivery', { detail: data }));
      } else if (eventName === 'NEARBY_DELIVERIES') {
        // 라이더 주변 배달 목록 전체 갱신
        window.dispatchEvent(new CustomEvent('nearby-deliveries', { detail: data }));
      } else if (eventName === 'DELIVERY_MATCHED') {
        // 다른 라이더가 배달 수락 → 목록에서 제거
        window.dispatchEvent(new CustomEvent('delivery-matched', { detail: data }));
      } else if (eventName === 'DELIVERY_STATUS_CHANGED') {
        // 배달 상태 변경 알림
        window.dispatchEvent(new CustomEvent('delivery-status-changed', { detail: data }));
      }
    };

    handleSseErrorRef.current = (error) => {
      console.error('[SSE] 연결 오류:', error);
      // 연결 오류 시 재연결 시도 (3초 후)
      setTimeout(() => {
        if (isLoggedIn && !eventSourceRef.current) {
          console.log('[SSE] 재연결 시도...');
          fetchNotifications();
        }
      }, 3000);
    };
  }, [isLoggedIn, fetchNotifications]);

  // SSE 연결 및 실시간 알림 수신
  useEffect(() => {
    if (!isLoggedIn) {
      // 로그아웃 시 SSE 연결 종료
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // 알림 목록 조회
    fetchNotifications();

    // SSE 연결 시작 - ref를 통해 항상 최신 핸들러 사용
    const eventSource = subscribeNotifications(
      (eventName, data) => handleSseMessageRef.current(eventName, data),
      (error) => handleSseErrorRef.current(error)
    );
    eventSourceRef.current = eventSource;

    // 컴포넌트 언마운트 시 연결 종료
    return () => {
      if (eventSourceRef.current) {
        console.log('[SSE] 연결 종료');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [isLoggedIn, fetchNotifications]);

  // 알림 패널이 열릴 때마다 최신 알림 목록 조회
  useEffect(() => {
    if (isNotificationOpen && isLoggedIn) {
      fetchNotifications();
    }
  }, [isNotificationOpen, isLoggedIn]);

  // 마트 입점 신청 현황 조회 (로그인 사용자)
  const fetchStoreRegistration = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stores/registration`, { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        const data = json?.data;
        if (data?.status) {
          setStoreRegistrationStatus(data.status === 'APPROVED' ? 'APPROVED' : 'PENDING');
          setStoreRegistrationStoreName(data.storeName || null);
        }
      } else {
        setStoreRegistrationStatus('NONE');
        setStoreRegistrationStoreName(null);
      }
    } catch {
      setStoreRegistrationStatus('NONE');
      setStoreRegistrationStoreName(null);
    }
  };
  const fetchRiderRegistration = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/riders/registration`, { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        const data = json?.data;
        if (data?.status) {
          setRiderRegistrationStatus(data.status);
          setIsResidentRider(data.status === 'APPROVED');
          setRiderRegistrationApprovalId(data.approvalId ?? null);
        } else {
          setRiderRegistrationStatus('NONE');
          setIsResidentRider(false);
          setRiderRegistrationApprovalId(null);
        }
      } else {
        setRiderRegistrationStatus('NONE');
        setIsResidentRider(false);
        setRiderRegistrationApprovalId(null);
      }
    } catch {
      setRiderRegistrationStatus('NONE');
      setIsResidentRider(false);
      setRiderRegistrationApprovalId(null);
    }
  };

  const refreshRiderRegistration = useCallback(() => {
    fetchRiderRegistration();
  }, []);


  // 앱 로드 시 인증 상태 확인
  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await checkAuth();
        if (user) {
          setIsLoggedIn(true);
          setUserInfo(user);
          await fetchStoreRegistration();
          await fetchRiderRegistration();
        }
      } catch (error) {
        console.log('Not logged in');
      }
    };
    initAuth();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      // 백엔드에 읽음 처리
      await markAsRead(id);
      // 읽음 처리된 알림을 목록에서 제거하고 개수 감소 (즉시 UI 반영)
      setNotifications(prev => {
        const filtered = prev.filter(n => n.id !== id);
        setUnreadCount(filtered.length);
        return filtered;
      });
      // SSE 이벤트로 최종 동기화 (백엔드에서 정확한 개수 전송)
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('모든 알림 읽음 처리 실패:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      setUserInfo(null);
      setUserRole('CUSTOMER'); // Default back to customer view as guest
      alert('로그아웃되었습니다.');
    } catch (error) {
      console.error('Logout failed', error);
      // 강제 로그아웃 처리
      setIsLoggedIn(false);
      setUserInfo(null);
      setUserRole('CUSTOMER');
    }
  };

  const [cartRefreshTrigger, setCartRefreshTrigger] = useState(0);

  const handleLoginSuccess = (userData = {}) => {
    setIsLoggedIn(true);
    setUserInfo(userData);
    setCartRefreshTrigger((t) => t + 1); // 로그인 직후 장바구니 refetch 유도
    const roles = userData.roles;
    // STORE 역할 유저는 메인 페이지(CUSTOMER)를 먼저 보여주고, 헤더의 사장님 버튼으로 전환
    const role = Array.isArray(roles) && roles.length > 0 ? roles[0] : 'CUSTOMER';
    const normalizedRole = typeof role === 'string' ? role.replace('ROLE_', '') : role;
    setUserRole(normalizedRole === 'STORE_OWNER' ? 'STORE' : normalizedRole);
    fetchStoreRegistration();
    fetchRiderRegistration();
  };

  // 소셜 로그인(카카오/네이버) 콜백 후 5173으로 리다이렉트된 경우: URL 쿼리 처리 후 JWT/state 반영
  const handleOAuthCallback = useCallback((status, errorMessage, stateToken) => {
    if (status === 'error') {
      if (errorMessage) alert(errorMessage);
      window.history.replaceState({}, '', window.location.pathname || '/');
      return;
    }
    if (status === 'success') {
      checkAuth()
        .then(async (user) => {
          if (user) {
            handleLoginSuccess(user);
            await fetchStoreRegistration();
            await fetchRiderRegistration();
          }
        })
        .catch(() => { })
        .finally(() => {
          window.history.replaceState({}, '', window.location.pathname || '/');
        });
      return;
    }
    if (status === 'signup_required') {
      setSocialSignupState(stateToken || null);
      setIsAuthModalOpen(true);
      setAuthModalInitialMode('social-extra');
      window.history.replaceState({}, '', window.location.pathname || '/');
    }
  }, [handleLoginSuccess, fetchStoreRegistration, fetchRiderRegistration]);

  const handleOAuthCallbackRef = useRef(handleOAuthCallback);
  handleOAuthCallbackRef.current = handleOAuthCallback;

  // 401 → refresh 실패 시 세션 만료: 로그인 상태 초기화 후 로그인 모달 오픈 (보완_권장사항.md)
  useEffect(() => {
    const onSessionExpired = () => {
      setIsLoggedIn(false);
      setUserInfo(null);
      setUserRole('CUSTOMER');
      setSocialSignupState(null);
      setAuthModalInitialMode(null);
      setIsAuthModalOpen(true);
    };
    window.addEventListener('auth:session-expired', onSessionExpired);
    return () => window.removeEventListener('auth:session-expired', onSessionExpired);
  }, []);

  // 팝업에서 소셜 로그인 완료 시 postMessage로 부모 창에 알림 → 부모(5173)에서 로그인 상태 반영
  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      const d = event.data;
      if (d?.type === 'oauth_callback') {
        handleOAuthCallbackRef.current(d.status, d.message, d.state);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const kakao = params.get('kakao');
    const naver = params.get('naver');
    const message = params.get('message');
    const isPopup = !!window.opener;

    if (kakao === 'error' || naver === 'error') {
      if (isPopup) {
        window.opener.postMessage({ type: 'oauth_callback', status: 'error', message: message || undefined }, window.location.origin);
        window.close();
      } else {
        handleOAuthCallback('error', message || undefined);
      }
      return;
    }
    if (kakao === 'success' || naver === 'success') {
      if (isPopup) {
        window.opener.postMessage({ type: 'oauth_callback', status: 'success' }, window.location.origin);
        window.close();
      } else {
        handleOAuthCallback('success');
      }
      return;
    }
    if (kakao === 'signup_required' || naver === 'signup_required') {
      const stateParam = params.get('state');
      if (isPopup) {
        window.opener.postMessage({ type: 'oauth_callback', status: 'signup_required', state: stateParam || undefined }, window.location.origin);
        window.close();
      } else {
        handleOAuthCallback('signup_required', undefined, stateParam || undefined);
      }
    }
  }, [handleOAuthCallback]);

  const renderContent = () => {
    // 비밀번호 재설정 페이지 확인
    if (window.location.pathname === '/reset-password') {
      return (
        <PasswordResetView
          onResetSuccess={() => {
            window.history.pushState({}, '', '/');
            setIsLoggedIn(false);
            setUserInfo(null);
            setUserRole('CUSTOMER');
            setIsAuthModalOpen(true);
          }}
        />
      );
    }

    if (userRole === 'CUSTOMER' || userRole === 'USER') return (
      <CustomerView
        userRole={userRole}
        setUserRole={setUserRole}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        cartRefreshTrigger={cartRefreshTrigger}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onCloseNotifications={() => setIsNotificationOpen(false)}
        isResidentRider={isResidentRider}
        setIsResidentRider={setIsResidentRider}
        storeRegistrationStatus={storeRegistrationStatus}
        setStoreRegistrationStatus={setStoreRegistrationStatus}
        storeRegistrationStoreName={storeRegistrationStoreName}
        setStoreRegistrationStoreName={setStoreRegistrationStoreName}
        riderRegistrationStatus={riderRegistrationStatus}
        riderRegistrationApprovalId={riderRegistrationApprovalId}
        refreshRiderRegistration={refreshRiderRegistration}
        riderInfo={riderInfo}
        setRiderInfo={setRiderInfo}
        notificationCount={unreadCount}
        userInfo={userInfo}
        isNotificationOpen={isNotificationOpen}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onClearAll={handleClearAll}
      />
    );
    if (userRole === 'STORE') return <StoreDashboard userInfo={userInfo || { userId: 2 }} />;
    if (userRole === 'RIDER') return <RiderDashboard isResidentRider={isResidentRider} riderInfo={riderInfo} />;
    if (userRole === 'ADMIN') return <AdminDashboard />;
  };

  return (
    <ErrorBoundary>
      <div className="App">
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
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

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => { setIsAuthModalOpen(false); setAuthModalInitialMode(null); setSocialSignupState(null); }}
          onLoginSuccess={handleLoginSuccess}
          initialMode={authModalInitialMode}
          socialSignupState={socialSignupState}
        />
        {import.meta.env.DEV && <Agentation />}
      </div>
    </ErrorBoundary>
  );
}

export default App;
