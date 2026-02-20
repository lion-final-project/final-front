import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getRiderInfo, updateRiderStatus, updateRiderLocation, getRiderLocation, removeRiderLocation, completeDelivery, getMyDeliveries, acceptDeliveryRequest, pickUpDelivery as pickUpDeliveryApi, startDelivery as startDeliveryApi } from '../../../api/riderApi';
import { uploadDeliveryPhoto } from '../../../api/storageApi';
import MainTab from './tabs/MainTab';
import EarningsTab from './tabs/EarningsTab';
import HistoryTab from './tabs/HistoryTab';
import AccountTab from './tabs/AccountTab';
import LoginTab from './tabs/LoginTab';
import MessageTemplatesModal from './modals/MessageTemplatesModal';
import PhotoUploadModal from './modals/PhotoUploadModal';
import ReceiptModal from './modals/ReceiptModal';
import AddVehicleModal from './modals/AddVehicleModal';
import ReportModal from './modals/ReportModal';
import StatusPopup from './modals/StatusPopup';
import CompletionNotification from './modals/CompletionNotification';

const RiderDashboard = ({ isResidentRider, riderInfo: initialRiderInfo }) => {
  const [activeTab, setActiveTab] = useState('main');
  const [isOnline, setIsOnline] = useState(false); // Default false until loaded
  const [riderData, setRiderData] = useState(initialRiderInfo); // Manage local rider data
  const [currentLocation, setCurrentLocation] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);


  // Fetch Rider Info on Mount
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await getRiderInfo();
        if (response && response.data) {
          setRiderData(response.data);
          setIsOnline(response.data['operation-status'] === 'ONLINE');
        }
      } catch (error) {
        console.error('Failed to fetch rider info:', error);
      }
    };
    fetchInfo();
  }, []);
  const [activeDeliveries, setActiveDeliveries] = useState([]); // Array of { ...req, status }
  const [deliveryRequests, setDeliveryRequests] = useState([]); // SSE로 수신한 주변 배달 요청
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const deliveryRequestsRef = useRef([]); // SSE 콜백 내 최신 상태 참조
  const [earnings, setEarnings] = useState({ today: 48500, weekly: 342000 });
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [completionNotification, setCompletionNotification] = useState(null); // { fee: 3500 }
  const [showPhotoUploadModal, setShowPhotoUploadModal] = useState(false);
  const [uploadingDeliveryId, setUploadingDeliveryId] = useState(null);
  const [deliveryPhoto, setDeliveryPhoto] = useState(null);
  const [deliveryPhotoFile, setDeliveryPhotoFile] = useState(null);
  const [isCompletingDelivery, setIsCompletingDelivery] = useState(false);

  // deliveryRequests ref 동기화
  useEffect(() => {
    deliveryRequestsRef.current = deliveryRequests;
  }, [deliveryRequests]);

  // 마운트 시 기존 배달 목록 불러오기 (배정된 배달 중 진행 중인 것)
  useEffect(() => {
    const fetchExistingDeliveries = async () => {
      try {
        // ACCEPTED 상태 배달 → 진행 중 배달로 표시
        const res = await getMyDeliveries('ACCEPTED');
        const deliveries = res?.data?.content || res?.data || [];
        const items = Array.isArray(deliveries) ? deliveries : [];
        if (items.length > 0) {
          const mapped = items.map(d => ({
            id: d.id,
            store: d['store-name'] || d.storeName || '알 수 없음',
            storeAddress: d['pickup-address'] || d.pickupAddress || '',
            destination: d['delivery-address'] || d.deliveryAddress || '',
            distance: '',
            fee: d['delivery-fee'] || d.deliveryFee || 0,
            status: 'accepted',
          }));
          setActiveDeliveries(mapped);
        }
      } catch (error) {
        console.error('기존 배달 목록 불러오기 실패:', error);
      }
    };
    fetchExistingDeliveries();
  }, []);

  // SSE에서 받은 배달 페이로드로 UI 객체 생성
  const createRequestFromPayload = useCallback((payload) => {
    // payload가 객체인 경우 enriched data 사용, 아닌 경우 fallback
    if (typeof payload === 'object' && payload !== null) {
      return {
        id: payload.deliveryId || payload.id || payload,
        store: payload.storeName || '새 배달 요청',
        storeAddress: '',
        destination: payload.deliveryAddress || '',
        distance: payload.distanceKm ? `${payload.distanceKm}km` : '',
        fee: payload.deliveryFee || 0,
        orderSummary: payload.orderSummary || '',
        orderNumber: null,
      };
    }
    // fallback: ID만 있는 경우
    return {
      id: payload,
      store: '새 배달 요청',
      storeAddress: '',
      destination: '',
      distance: '',
      fee: 0,
      orderNumber: null,
    };
  }, []);

  // SSE 이벤트 처리: nearby-deliveries (전체 목록 갱신 — 배달 상세 정보 배열)
  useEffect(() => {
    const handleNearbyDeliveries = (e) => {
      const deliveryList = e.detail; // 배달 상세 정보 배열
      if (!Array.isArray(deliveryList)) return;

      const requests = deliveryList.map(d => createRequestFromPayload(d));
      setDeliveryRequests(requests);
      setIsLoadingRequests(false);
    };

    // SSE 이벤트: new-delivery (단건 추가 — 배달 상세 정보 객체)
    const handleNewDelivery = (e) => {
      const payload = e.detail;
      if (!payload) return;

      const deliveryId = typeof payload === 'object' ? (payload.deliveryId || payload.id) : payload;
      if (!deliveryId) return;

      // 이미 목록에 있으면 무시
      if (deliveryRequestsRef.current.some(r => String(r.id) === String(deliveryId))) return;

      const req = createRequestFromPayload(payload);
      setDeliveryRequests(prev => [...prev, req]);
    };

    // SSE 이벤트: delivery-matched (해당 건 제거)
    const handleDeliveryMatched = (e) => {
      const deliveryId = e.detail;
      setDeliveryRequests(prev => prev.filter(r => String(r.id) !== String(deliveryId)));
    };

    window.addEventListener('nearby-deliveries', handleNearbyDeliveries);
    window.addEventListener('new-delivery', handleNewDelivery);
    window.addEventListener('delivery-matched', handleDeliveryMatched);

    return () => {
      window.removeEventListener('nearby-deliveries', handleNearbyDeliveries);
      window.removeEventListener('new-delivery', handleNewDelivery);
      window.removeEventListener('delivery-matched', handleDeliveryMatched);
    };
  }, [createRequestFromPayload]);

  const [verificationStatus /* , setVerificationStatus */] = useState('verified'); // unverified, pending, verified
  const [vehicleInfo, setVehicleInfo] = useState({
    plate: '123가 4567'
  });

  const [historyFilter, setHistoryFilter] = useState('today'); // today, week, month
  const [expandedHistoryItems, setExpandedHistoryItems] = useState(new Set());
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [expandedSettlements, setExpandedSettlements] = useState(new Set());

  // Location Tracking Logic (Improved for Precision and Real-time)
  useEffect(() => {
    let syncInterval;

    if (isOnline || activeDeliveries.length > 0) {
      if (navigator.geolocation) {
        // Periodic Update (POST) and Sync (GET) from server - Unified into 2-second loop
        syncInterval = setInterval(() => {
          if (riderData?.id) {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                  // 1. Update position to server (POST)
                  await updateRiderLocation({
                    riderId: `rider${riderData.id}`,
                    latitude,
                    longitude
                  });

                  // 2. Read position from server (GET) to ensure sync
                  const response = await getRiderLocation(`rider${riderData.id}`);
                  if (response && response.data) {
                    setCurrentLocation({
                      latitude: response.data.latitude,
                      longitude: response.data.longitude
                    });
                    setLastSyncTime(new Date().toLocaleTimeString('ko-KR', { hour12: false }));
                  }
                } catch (error) {
                  console.error('Location sync failed:', error);
                }
              },
              (error) => console.error('Geolocation error:', error),
              {
                enableHighAccuracy: true,
                maximumAge: 0, // Force fresh location, no cache
                timeout: 5000  // 5 seconds timeout for individual request
              }
            );
          }
        }, 2000); // 2 seconds interval
      }
    }

    return () => {
      if (syncInterval) clearInterval(syncInterval);
    };
  }, [isOnline, activeDeliveries.length, riderData?.id]);

  // Multiple vehicles support
  const [registeredVehicles, setRegisteredVehicles] = useState([
    {
      id: 1,
      type: initialRiderInfo?.vehicleType || 'bicycle',
      model: initialRiderInfo?.vehicleModel || '',
      plate: initialRiderInfo?.vehiclePlate || '',
      isVerified: true
    }
  ]);
  const [activeVehicleId, setActiveVehicleId] = useState(1);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [statusPopup, setStatusPopup] = useState(null); // { type: 'online' | 'offline' | 'error', message: string }

  // Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState('STORE'); // STORE, CUSTOMER
  const [reportContent, setReportContent] = useState('');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  const handleOpenReportModal = (item) => {
    setSelectedHistoryItem(item);
    setReportTarget('STORE');
    setReportContent('');
    setIsReportModalOpen(true);
  };

  const handleSubmitReport = () => {
    if (!reportContent) {
      alert('신고 내용을 입력해주세요.');
      return;
    }
    const targetName = reportTarget === 'STORE' ? '마트' : '고객';
    alert(`${targetName} 신고가 접수되었습니다.`);
    setIsReportModalOpen(false);
  };

  const handleToggleOnline = async () => {
    if (activeDeliveries.length > 0 && isOnline) {
      setStatusPopup({
        type: 'error',
        message: '진행 중인 배달이 있습니다.\n모두 완료 후 운행을 종료해주세요.'
      });
      return;
    }

    const newStatus = isOnline ? 'OFFLINE' : 'ONLINE';

    try {
      const response = await updateRiderStatus(newStatus);
      if (response && response.data) {
        setRiderData(response.data);
        const nextIsOnline = response.data['operation-status'] === 'ONLINE';
        setIsOnline(nextIsOnline);

        // 운행 종료(OFFLINE) 시 Redis에서 위치 정보 삭제
        if (!nextIsOnline && riderData?.id) {
          try {
            await removeRiderLocation(`rider${riderData.id}`);
            setCurrentLocation(null); // 로컬 상태도 초기화
            setLastSyncTime(null);
          } catch (deleteError) {
            console.error('Failed to remove location from Redis:', deleteError);
          }
        }

        setStatusPopup({
          type: newStatus === 'ONLINE' ? 'online' : 'offline',
          message: newStatus === 'ONLINE'
            ? '오늘 하루도 화이팅!\n운행을 시작합니다.'
            : '오늘도 고생하셨습니다!\n운행을 종료합니다.'
        });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('상태 변경에 실패했습니다.');
    }
  };

  const handleDeleteVehicle = (id, e) => {
    e.stopPropagation();
    if (activeVehicleId === id) {
      alert('현재 운행 중인 수단은 삭제할 수 없습니다. 다른 수단을 선택한 후 삭제해 주세요.');
      return;
    }
    if (window.confirm('선택한 운송 수단을 삭제하시겠습니까?')) {
      setRegisteredVehicles(prev => prev.filter(v => v.id !== id));
    }
  };

  const handleAcceptRequest = async (req) => {
    if (activeDeliveries.some(d => d.id === req.id)) return;
    try {
      await acceptDeliveryRequest(req.id);
      // 수락 성공 → 진행 중 배달 목록에 추가, 요청 목록에서 제거
      setActiveDeliveries(prev => [...prev, { ...req, status: 'accepted' }]);
      setDeliveryRequests(prev => prev.filter(r => r.id !== req.id));
    } catch (error) {
      console.error('배달 수락 실패:', error);
      alert('배달 수락에 실패했습니다. 이미 다른 라이더가 수락했을 수 있습니다.');
    }
  };

  const nextStep = async (id) => {
    const delivery = activeDeliveries.find(d => d.id === id);
    if (!delivery) return;

    try {
      if (delivery.status === 'accepted') {
        await pickUpDeliveryApi(id);
        setActiveDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: 'pickup' } : d));
      } else if (delivery.status === 'pickup') {
        await startDeliveryApi(id);
        setActiveDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: 'delivering' } : d));
      } else if (delivery.status === 'delivering') {
        // 사진 증빙 필요
        setUploadingDeliveryId(id);
        setShowPhotoUploadModal(true);
      }
    } catch (error) {
      console.error('배달 상태 변경 실패:', error);
      alert('상태 변경에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCompleteDelivery = async () => {
    if (!uploadingDeliveryId || !deliveryPhotoFile) return;
    setIsCompletingDelivery(true);

    try {
      const delivery = activeDeliveries.find(d => d.id === uploadingDeliveryId);
      if (!delivery) return;

      // 1. 증빙 사진 업로드 → URL 획득
      const orderNumber = delivery.orderNumber || delivery.id;
      const photoUrl = await uploadDeliveryPhoto(deliveryPhotoFile, orderNumber, uploadingDeliveryId);

      // 2. 배달 완료 API 호출 (photoUrl 필수)
      await completeDelivery(uploadingDeliveryId, photoUrl);

      // 3. 로컬 상태 반영
      setActiveDeliveries(prev => prev.filter(d => d.id !== uploadingDeliveryId));
      setEarnings(e => ({ ...e, today: e.today + (delivery.fee || 0) }));
      setCompletionNotification({ fee: delivery.fee || 0 });
      setTimeout(() => setCompletionNotification(null), 4000);
    } catch (error) {
      console.error('배달 완료 처리 실패:', error);
      alert('배달 완료 처리에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsCompletingDelivery(false);
      setUploadingDeliveryId(null);
      setShowPhotoUploadModal(false);
      setDeliveryPhoto(null);
      setDeliveryPhotoFile(null);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDeliveryPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDeliveryPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleHistoryExpand = (id) => {
    const newItems = new Set(expandedHistoryItems);
    if (newItems.has(id)) newItems.delete(id);
    else newItems.add(id);
    setExpandedHistoryItems(newItems);
  };

  const renderActiveView = () => {
    if (!isOnline && activeTab === 'main') {
      return (
        <div style={{ padding: '60px 20px', textAlign: 'center', opacity: 0.6 }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>💤</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>현재 '운행 불가' 상태입니다</h2>
          <p style={{ color: '#94a3b8', fontSize: '15px' }}>배달을 시작하려면 상단의 버튼을 활성화해주세요.</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'earnings':
        return (
          <EarningsTab
            earnings={earnings}
            expandedSettlements={expandedSettlements}
            setExpandedSettlements={setExpandedSettlements}
          />
        );
      case 'history':
        return (
          <HistoryTab
            expandedHistoryItems={expandedHistoryItems}
            toggleHistoryExpand={toggleHistoryExpand}
            setSelectedReceipt={setSelectedReceipt}
            handleOpenReportModal={handleOpenReportModal}
          />
        );
      case 'account':
        return (
          <AccountTab
            verificationStatus={verificationStatus}
            registeredVehicles={registeredVehicles}
            activeVehicleId={activeVehicleId}
            setActiveVehicleId={setActiveVehicleId}
            setShowAddVehicleModal={setShowAddVehicleModal}
            handleDeleteVehicle={handleDeleteVehicle}
          />
        );
      case 'login':
        return <LoginTab onLoginSuccess={() => setActiveTab('main')} />;
      default:
        return (
          <MainTab
            earnings={earnings}
            activeDeliveries={activeDeliveries}
            deliveryRequests={deliveryRequests}
            isLoadingRequests={isLoadingRequests}
            setShowMsgModal={setShowMsgModal}
            nextStep={nextStep}
            handleAcceptRequest={handleAcceptRequest}
            currentLocation={currentLocation}
            lastSyncTime={lastSyncTime}
          />
        );
    }
  };

  return (
    <div className="rider-dashboard" style={{
      maxWidth: '500px',
      margin: '0 auto',
      backgroundColor: '#0f172a',
      minHeight: '100vh',
      color: 'white',
      fontFamily: 'sans-serif',
      paddingBottom: '80px',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      <style>{`
        .rider-dashboard::-webkit-scrollbar { display: none; }
        .rider-dashboard { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes popup-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        borderBottom: '1px solid #1e293b',
        position: 'sticky',
        top: 0,
        backgroundColor: '#0f172a',
        zIndex: 100
      }}>
        <div
          onClick={() => setActiveTab('main')}
          style={{ fontSize: '20px', fontWeight: '800', color: '#38bdf8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          동네마켓 Rider
          {isResidentRider && <span style={{ fontSize: '10px', backgroundColor: '#f1c40f', color: '#000', padding: '2px 6px', borderRadius: '4px' }}>🏘️ 동네 주민</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <span style={{
              width: '8px', height: '8px',
              backgroundColor: isOnline ? 'var(--primary)' : '#ef4444',
              borderRadius: '50%',
              boxShadow: isOnline ? '0 0 10px var(--primary)' : '0 0 10px #ef4444'
            }}></span>
            <span style={{ fontWeight: '700', color: isOnline ? 'white' : '#ef4444' }}>{isOnline ? '운행 중' : '운행 불가'}</span>
          </div>
          <button
            onClick={handleToggleOnline}
            style={{
              width: '50px',
              height: '26px',
              borderRadius: '20px',
              backgroundColor: isOnline ? 'var(--primary)' : '#334155',
              border: 'none',
              padding: '2px',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              backgroundColor: 'white',
              position: 'absolute',
              left: isOnline ? 'calc(100% - 24px)' : '2px',
              top: '2px',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}></div>
          </button>
        </div>
      </header>

      {renderActiveView()}

      {showMsgModal && <MessageTemplatesModal onClose={() => setShowMsgModal(false)} />}

      {showPhotoUploadModal && (
        <PhotoUploadModal
          deliveryPhoto={deliveryPhoto}
          onPhotoSelect={handlePhotoSelect}
          onSubmit={handleCompleteDelivery}
          onClose={() => { setShowPhotoUploadModal(false); setDeliveryPhoto(null); setDeliveryPhotoFile(null); setUploadingDeliveryId(null); }}
          isUploading={isCompletingDelivery}
        />
      )}

      {selectedReceipt && <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />}

      {showAddVehicleModal && (
        <AddVehicleModal
          registeredVehicles={registeredVehicles}
          setRegisteredVehicles={setRegisteredVehicles}
          onClose={() => setShowAddVehicleModal(false)}
        />
      )}

      {/* Bottom Navigation */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        maxWidth: '500px',
        width: '100%',
        height: '70px',
        backgroundColor: '#1e293b',
        borderTop: '1px solid #334155',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.3)'
      }}>
        {[
          { icon: '🏠', label: '홈', tab: 'main' },
          { icon: '📋', label: '히스토리', tab: 'history' },
          { icon: '💰', label: '정산', tab: 'earnings' },
          { icon: '👤', label: '마이페이지', tab: 'account' },
          { icon: '🔐', label: '로그인', tab: 'login' }
        ].map(item => (
          <div
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className="rider-nav-item"
            style={{
              textAlign: 'center',
              cursor: 'pointer',
              color: activeTab === item.tab ? 'var(--primary)' : '#94a3b8',
              padding: '8px 16px',
              borderRadius: '12px',
              backgroundColor: activeTab === item.tab ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '2px' }}>{item.icon}</div>
            <div style={{ fontSize: '10px', fontWeight: '800' }}>{item.label}</div>
          </div>
        ))}
      </div>

      <CompletionNotification notification={completionNotification} onClose={() => setCompletionNotification(null)} />

      <StatusPopup statusPopup={statusPopup} onClose={() => setStatusPopup(null)} />

      {isReportModalOpen && (
        <ReportModal
          historyItem={selectedHistoryItem}
          reportTarget={reportTarget}
          setReportTarget={setReportTarget}
          reportContent={reportContent}
          setReportContent={setReportContent}
          onSubmit={handleSubmitReport}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      <style>{`
        .widget-card {
          transition: transform 0.3s ease;
        }
        .widget-card:hover {
          transform: translateY(-5px);
        }
        @keyframes pulse-anim {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes slideDownBounce {
          from { transform: translate(-50%, -100px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        .pulse-primary {
          animation: pulse-anim 2s infinite;
        }
        .pulse-sapphire {
          animation: pulse-anim 2s infinite;
          animation-delay: 1s;
        }
        .rider-nav-item {
          transition: all 0.2s ease;
        }
        .rider-nav-item:active {
          transform: scale(0.9);
        }
      `}</style>
    </div>
  );
};

export default RiderDashboard;
