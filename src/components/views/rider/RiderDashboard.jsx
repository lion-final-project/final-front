import React, { useState, useEffect } from 'react';
import { getRiderInfo, updateRiderStatus } from '../../../api/riderApi';
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
  const [earnings, setEarnings] = useState({ today: 48500, weekly: 342000 });
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [completionNotification, setCompletionNotification] = useState(null); // { fee: 3500 }
  const [showPhotoUploadModal, setShowPhotoUploadModal] = useState(false);
  const [uploadingDeliveryId, setUploadingDeliveryId] = useState(null);
  const [deliveryPhoto, setDeliveryPhoto] = useState(null);

  const [verificationStatus /* , setVerificationStatus */] = useState('verified'); // unverified, pending, verified
  const [vehicleInfo, setVehicleInfo] = useState({
    plate: '123가 4567'
  });

  const [historyFilter, setHistoryFilter] = useState('today'); // today, week, month
  const [expandedHistoryItems, setExpandedHistoryItems] = useState(new Set());
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [expandedSettlements, setExpandedSettlements] = useState(new Set());

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
        setIsOnline(response.data['operation-status'] === 'ONLINE');

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

  const deliveryRequests = [
    { id: 'REQ001', store: '무림 정육점', storeAddress: '강남구 삼성동 15-5', destination: '삼성동 빌라 302호', distance: '1.2km', fee: 3500, customerPhone: '010-1234-5678' },
    { id: 'REQ002', store: '행복 마트 강남점', storeAddress: '역삼동 823-1', destination: '논현동 원룸 201호', distance: '0.8km', fee: 3000, customerPhone: '010-9876-5432' }
  ];

  const handleAcceptRequest = (req) => {
    if (activeDeliveries.some(d => d.id === req.id)) return;
    setActiveDeliveries(prev => [...prev, { ...req, status: 'accepted' }]);
  };

  const nextStep = (id) => {
    setActiveDeliveries(prev => {
      const delivery = prev.find(d => d.id === id);
      if (!delivery) return prev;

      if (delivery.status === 'accepted') {
        return prev.map(d => d.id === id ? { ...d, status: 'pickup' } : d);
      } else if (delivery.status === 'pickup') {
        return prev.map(d => d.id === id ? { ...d, status: 'delivering' } : d);
      } else if (delivery.status === 'delivering') {
        // Require photo proof before completing
        setUploadingDeliveryId(id);
        setShowPhotoUploadModal(true);
        return prev;
      }
      return prev;
    });
  };

  const handleCompleteDelivery = () => {
    if (!uploadingDeliveryId) return;

    setActiveDeliveries(prev => {
      const delivery = prev.find(d => d.id === uploadingDeliveryId);
      if (delivery) {
        setEarnings(e => ({ ...e, today: e.today + delivery.fee }));
        setCompletionNotification({ fee: delivery.fee });
        setTimeout(() => setCompletionNotification(null), 4000);
        return prev.filter(d => d.id !== uploadingDeliveryId);
      }
      return prev;
    });

    setUploadingDeliveryId(null);
    setShowPhotoUploadModal(false);
    setDeliveryPhoto(null);
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
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
            historyFilter={historyFilter}
            setHistoryFilter={setHistoryFilter}
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
            setShowMsgModal={setShowMsgModal}
            nextStep={nextStep}
            handleAcceptRequest={handleAcceptRequest}
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
          onClose={() => { setShowPhotoUploadModal(false); setDeliveryPhoto(null); setUploadingDeliveryId(null); }}
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
