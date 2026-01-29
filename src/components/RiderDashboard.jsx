import React, { useState } from 'react';

const MapSimulator = ({ status }) => {
  return (
    <div style={{ 
      height: '160px', 
      background: '#0f172a', 
      borderRadius: '16px', 
      position: 'relative', 
      overflow: 'hidden',
      border: '1px solid #334155'
    }}>
      {/* Grid Pattern */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      
      {/* Route Path */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <path d="M 40 40 L 120 40 L 120 120 L 300 120" stroke="#334155" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path 
          d="M 40 40 L 120 40 L 120 120 L 300 120" 
          stroke="var(--primary)" 
          strokeWidth="4" 
          fill="none" 
          strokeLinecap="round"
          strokeDasharray="400"
          strokeDashoffset={status === 'accepted' ? '400' : status === 'pickup' ? '300' : status === 'delivering' ? '150' : '0'}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>

      {/* Pulsing Dot Store */}
      <div style={{ position: 'absolute', top: '32px', left: '32px', width: '16px', height: '16px' }}>
        <div className="pulse-primary" style={{ position: 'absolute', inset: -8, borderRadius: '50%', backgroundColor: 'var(--primary)', opacity: 0.4 }}></div>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: 'var(--primary)', border: '2px solid white' }}></div>
        <div style={{ position: 'absolute', top: -20, left: -20, whiteSpace: 'nowrap', fontSize: '10px', fontWeight: '800', color: 'white' }}>매장 (PICKUP)</div>
      </div>

      {/* Pulsing Dot Destination */}
      <div style={{ position: 'absolute', bottom: '32px', right: '32px', width: '16px', height: '16px' }}>
        <div className="pulse-sapphire" style={{ position: 'absolute', inset: -8, borderRadius: '50%', backgroundColor: '#38bdf8', opacity: 0.4 }}></div>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: '#38bdf8', border: '2px solid white' }}></div>
        <div style={{ position: 'absolute', bottom: -20, right: -20, whiteSpace: 'nowrap', fontSize: '10px', fontWeight: '800', color: 'white' }}>배송지 (DEST)</div>
      </div>

      {/* Rider Icon */}
      <div style={{ 
        position: 'absolute', 
        transition: 'all 1s ease',
        ...status === 'accepted' ? { top: '32px', left: '32px' } 
          : status === 'pickup' ? { top: '32px', left: '112px' }
          : status === 'delivering' ? { top: '112px', left: '112px' }
          : { top: '112px', left: '292px' },
        fontSize: '24px',
        zIndex: 10,
        transform: 'translate(-50%, -50%)'
      }}>
        🚲
      </div>
    </div>
  );
};
const RiderDashboard = ({ isResidentRider, riderInfo }) => {
  const [activeTab, setActiveTab] = useState('main');
  const [isOnline, setIsOnline] = useState(true);
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
      type: riderInfo?.vehicleType || 'bicycle', 
      model: riderInfo?.vehicleModel || '', 
      plate: riderInfo?.vehiclePlate || '',
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

  const handleToggleOnline = () => {
    if (isOnline) {
      if (activeDeliveries.length > 0) {
        setStatusPopup({
          type: 'error',
          message: '진행 중인 배달이 있습니다.\n모두 완료 후 운행을 종료해주세요.'
        });
        return;
      }
      setIsOnline(false);
      setStatusPopup({ type: 'offline', message: '오늘도 고생하셨습니다!\n운행을 종료합니다.' });
    } else {
      setIsOnline(true);
      setStatusPopup({ type: 'online', message: '오늘 하루도 화이팅!\n운행을 시작합니다.' });
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
          <div style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>정산 내역</h2>
            <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', marginBottom: '32px', borderLeft: '4px solid #10b981' }}>
               <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '4px' }}>이번 주 정산 예정 금액</div>
               <div style={{ fontSize: '28px', fontWeight: '900', color: '#10b981' }}>{earnings.weekly.toLocaleString()}원</div>
               <div style={{ color: '#64748b', fontSize: '12px', marginTop: '6px' }}>정산일: 매주 수요일</div>
               <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #334155', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>정산 계좌</span>
                  <span style={{ color: '#cbd5e1', fontWeight: '600' }}>카카오뱅크 3333-**-******</span>
               </div>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>최근 정산 기록</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { date: '2026-01-19 ~ 2026-01-25', amount: '50,000원', status: '입금완료', type: '정산', details: '1월 4주차 배달 건수 (14건)' },
                { date: '2026-01-12 ~ 2026-01-18', amount: '120,000원', status: '입금완료', type: '정산', details: '1월 3주차 배달 건수 (32건)' },
                { date: '2026-01-05 ~ 2026-01-11', amount: '85,000원', status: '입금완료', type: '정산', details: '1월 2주차 배달 건수 (24건)' },
                { date: '2025-12-28 ~ 2026-01-04', amount: '92,000원', status: '입금완료', type: '정산', details: '1월 1주차 배달 건수 (26건)' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div 
                    onClick={() => {
                       const newSet = new Set(expandedSettlements);
                       if (newSet.has(i)) newSet.delete(i); else newSet.add(i);
                       setExpandedSettlements(newSet);
                    }}
                    style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '15px' }}>{item.amount} {item.type}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{item.date}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <div style={{ color: item.status === '입금완료' ? '#2ecc71' : '#f59e0b', fontWeight: '800', fontSize: '13px' }}>{item.status}</div>
                       <span style={{ fontSize: '10px', color: '#94a3b8', transform: expandedSettlements.has(i) ? 'rotate(180deg)' : 'none' }}>▼</span>
                    </div>
                  </div>
                  {expandedSettlements.has(i) && (
                    <div style={{ backgroundColor: '#0f172a', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', color: '#94a3b8', animation: 'fadeIn 0.2s' }}>
                       {item.details}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 'history':
        const historyData = [
          { id: 'ORD20260124101', store: '행복 마트', dest: '역삼동 123-1', time: '14:23', fee: 3500, items: '신선란 10구, 유기농 우유 1L', customer: '김철수', status: '배달완료', date: '오늘' },
          { id: 'ORD20260124085', store: '싱싱 정육점', dest: '삼성동 45-2', time: '13:10', fee: 4000, items: '한우 등심 300g x 2', customer: '이영희', status: '배달완료', date: '오늘' },
          { id: 'ORD20260124052', store: '우리 마켓', dest: '대치동 900', time: '12:05', fee: 3200, items: '꿀사과 3입, 바나나 1송이', customer: '박지민', status: '취소됨', date: '오늘' },
          { id: 'ORD20260120101', store: '마켓컬리', dest: '논현동 44', time: '11:00', fee: 3500, items: '샐러드 팩 x 3', customer: '최도현', status: '배달완료', date: 'week' },
          { id: 'ORD20260115001', store: '이마트24', dest: '압구정 12', time: '19:30', fee: 3000, items: '생수 2L x 6', customer: '정유미', status: '배달완료', date: 'month' }
        ].filter(item => {
           if (historyFilter === 'today') return item.date === '오늘';
           if (historyFilter === 'week') return item.date === '오늘' || item.date === 'week';
           return true;
        });
         
         const totalHistoryFee = historyData.reduce((sum, item) => 
           item.status === '배달완료' ? sum + item.fee : sum, 0
         );

        return (
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800' }}>배달 히스토리</h2>
              <div style={{ display: 'flex', backgroundColor: '#1e293b', padding: '4px', borderRadius: '10px' }}>
                {['today', 'week', 'month'].map((f) => (
                  <button 
                    key={f}
                    onClick={() => setHistoryFilter(f)}
                    style={{ 
                      padding: '6px 12px', borderRadius: '8px', border: 'none', 
                      background: historyFilter === f ? 'var(--primary)' : 'transparent',
                      color: historyFilter === f ? 'white' : '#94a3b8',
                      fontSize: '12px', fontWeight: '800', cursor: 'pointer'
                    }}
                  >{f === 'today' ? '오늘' : f === 'week' ? '1주일' : '한달'}</button>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '16px 20px', borderRadius: '12px', marginBottom: '20px', borderLeft: '4px solid #38bdf8' }}>
               <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{historyFilter === 'today' ? '오늘' : historyFilter === 'week' ? '1주일' : '한달'} 총 수익</div>
               <div style={{ fontSize: '20px', fontWeight: '900', color: '#38bdf8' }}>{totalHistoryFee.toLocaleString()}원</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {historyData.map((item, i) => (
                <div key={item.id} style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{item.date === '오늘' ? `오늘 ${item.time}` : item.id.substring(3, 11)}</span>
                    <span style={{ 
                      fontSize: '11px', 
                      backgroundColor: item.status === '취소됨' ? 'rgba(239, 68, 68, 0.2)' : '#0f172a', 
                      color: item.status === '취소됨' ? '#ef4444' : '#2ecc71', 
                      padding: '4px 10px', borderRadius: '6px', fontWeight: '900' 
                    }}>{item.status}</span>
                  </div>
                  
                  <div 
                    onClick={() => toggleHistoryExpand(item.id)}
                    style={{ marginBottom: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '800' }}>{item.store} → {item.dest}</div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#94a3b8', transform: expandedHistoryItems.has(item.id) ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>▼</span>
                  </div>

                  {expandedHistoryItems.has(item.id) && (
                    <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', marginBottom: '16px', animation: 'fadeIn 0.2s ease-out' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px', fontWeight: '700' }}>배달 상세 내역</div>
                      <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                        <span style={{ color: '#94a3b8' }}>주문번호:</span> {item.id}
                      </div>
                      <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                        <span style={{ color: '#94a3b8' }}>품목:</span> {item.items}
                      </div>
                      <div style={{ fontSize: '14px' }}>
                        <span style={{ color: '#94a3b8' }}>고객:</span> {item.customer.length > 2 ? item.customer[0] + '*'.repeat(item.customer.length - 2) + item.customer.slice(-1) : item.customer[0] + '*'} (문의: ****1234)
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '18px', color: item.status === '취소됨' ? '#94a3b8' : '#38bdf8', fontWeight: '900' }}>
                      {item.status === '취소됨' ? '0원' : `+${item.fee.toLocaleString()}원`}
                    </div>
                    {item.status !== '취소됨' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => setSelectedReceipt(item)}
                          style={{ fontSize: '12px', color: '#94a3b8', background: 'transparent', border: '1px solid #334155', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}
                        >영수증 보기</button>
                        <button 
                          onClick={() => handleOpenReportModal(item)}
                          style={{ fontSize: '12px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #fee2e2', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '800' }}
                        >신고</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'account':
        return (
          <div style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>계정 및 서류 관리</h2>
            
            <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', marginBottom: '24px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>운전면허/신원 확인</h3>
                <span style={{ 
                  backgroundColor: verificationStatus === 'verified' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(241, 196, 15, 0.2)', 
                  color: verificationStatus === 'verified' ? '#2ecc71' : '#f1c40f',
                  fontSize: '12px',
                  fontWeight: '800',
                  padding: '4px 10px',
                  borderRadius: '20px'
                }}>
                  {verificationStatus === 'verified' ? '✓ 인증됨' : '심사 중'}
                </span>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
                님은 현재 모든 배달 서비스를 이용하실 수 있습니다.<br/>
                신규 면허 등록 및 갱신은 고객센터로 문의해주세요.
              </div>
            </div>

            {/* Vehicle Management (Feedback fix for 🚲 button) */}
            <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', marginBottom: '24px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>내 운송 수단</h3>
                <button 
                  onClick={() => setShowAddVehicleModal(true)}
                  style={{ border: 'none', background: 'var(--primary)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                >+ 추가</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {registeredVehicles.map((vehicle) => (
                  <div 
                    key={vehicle.id} 
                    onClick={() => setActiveVehicleId(vehicle.id)}
                    style={{ 
                      padding: '16px', borderRadius: '14px', backgroundColor: '#0f172a', border: `1.5px solid ${activeVehicleId === vehicle.id ? 'var(--primary)' : '#334155'}`,
                      cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>{vehicle.type === 'walking' ? '🚶' : vehicle.type === 'bicycle' ? '🚲' : '🛵'}</span>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '800' }}>{vehicle.type === 'walking' ? '도보' : vehicle.type === 'bicycle' ? '자전거' : '오토바이'}</div>
                        {vehicle.model && <div style={{ fontSize: '12px', color: '#64748b' }}>{vehicle.model}</div>}
                        {vehicle.plate && <div style={{ fontSize: '11px', color: '#475569' }}>{vehicle.plate}</div>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {activeVehicleId === vehicle.id && <span style={{ color: 'var(--primary)', fontSize: '11px', fontWeight: '900' }}>사용 중</span>}
                      {registeredVehicles.length > 1 && (
                        <button 
                          onClick={(e) => handleDeleteVehicle(vehicle.id, e)}
                          style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '16px', cursor: 'pointer', padding: '4px' }}
                        >✕</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <button style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>로그아웃</button>
            </div>
          </div>
        );
      case 'login':
        return (
          <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: '#38bdf8' }}>동네마켓 라이더</h2>
            <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '40px' }}>우리 동네 1등 배달 파트너</div>
            
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', marginBottom: '8px', fontWeight: '700' }}>아이디 / 휴대폰 번호</label>
                <input 
                  type="text" 
                  placeholder="아이디 또는 휴대폰 번호 입력"
                  style={{ width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: '#1e293b', border: '1px solid #334155', color: 'white', fontSize: '15px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', marginBottom: '8px', fontWeight: '700' }}>비밀번호</label>
                <input 
                  type="password" 
                  placeholder="비밀번호 입력"
                  style={{ width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: '#1e293b', border: '1px solid #334155', color: 'white', fontSize: '15px' }}
                />
              </div>
            </div>

            <button 
              onClick={() => {
                alert('로그인되었습니다!');
                setActiveTab('main');
              }}
              style={{ width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', fontWeight: '900', fontSize: '16px', marginTop: '32px', cursor: 'pointer' }}
            >
              로그인하기
            </button>

            <div style={{ display: 'flex', gap: '20px', marginTop: '24px', fontSize: '13px', color: '#94a3b8' }}>
              <span style={{ cursor: 'pointer' }}>아이디 찾기</span>
              <span style={{ width: '1px', height: '12px', backgroundColor: '#475569', marginTop: '3px' }}></span>
              <span style={{ cursor: 'pointer' }}>비밀번호 찾기</span>
              <span style={{ width: '1px', height: '12px', backgroundColor: '#475569', marginTop: '3px' }}></span>
              <span style={{ cursor: 'pointer', color: '#38bdf8', fontWeight: '700' }}>회원가입</span>
            </div>
          </div>
        );
      default:
        return (
          <div style={{ padding: '20px' }}>
            {/* Today's Earning Summary - Fixed at top of home */}
            <div style={{ 
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
              padding: '24px', 
              borderRadius: '24px', 
              marginBottom: '32px', 
              border: '1px solid #334155',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '4px' }}>오늘의 배달 수익</div>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: '#38bdf8' }}>{earnings.today.toLocaleString()}원</div>
                </div>
                <div style={{ textAlign: 'center', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '8px 16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '700' }}>진행 완료</div>
                  <div style={{ fontSize: '18px', fontWeight: '900' }}>12건</div>
                </div>
              </div>
            </div>

            {/* Active Deliveries List */}
            {activeDeliveries.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>진행 중인 배달 ({activeDeliveries.length})</h3>
                {activeDeliveries.map((delivery) => (
                  <div key={delivery.id} style={{ backgroundColor: '#1e293b', borderRadius: '20px', padding: '24px', border: '1px solid #38bdf8', boxShadow: '0 10px 25px -5px rgba(56, 189, 248, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#38bdf8' }}>{delivery.id} 진행 중</span>
                      <span style={{ fontSize: '14px', fontWeight: '800' }}>{delivery.fee.toLocaleString()}원</span>
                    </div>

                    {/* Visual Step Indicator */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', position: 'relative', padding: '0 10px' }}>
                      <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '2px', backgroundColor: '#334155', zIndex: 0 }}></div>
                      <div style={{ 
                        position: 'absolute', top: '15px', left: '10%', 
                        width: delivery.status === 'pickup' ? '40%' : delivery.status === 'delivering' ? '80%' : '0%', 
                        height: '2px', backgroundColor: '#38bdf8', zIndex: 0, transition: 'width 0.3s' 
                      }}></div>
                      
                      {[
                        { label: '수락', key: 'accepted' },
                        { label: '픽업', key: 'pickup' },
                        { label: '배송 중', key: 'delivering' },
                        { label: '완료', key: 'done' }
                      ].map((step, i) => {
                        const isDone = (step.key === 'accepted' && (delivery.status === 'pickup' || delivery.status === 'delivering')) || 
                                       (step.key === 'pickup' && delivery.status === 'delivering');
                        const isActive = step.key === delivery.status;
                        
                        return (
                          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', zIndex: 1, position: 'relative' }}>
                            <div style={{ 
                              width: '36px', height: '36px', borderRadius: '50%', 
                              backgroundColor: isDone || isActive ? 'var(--primary)' : '#334155',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: isDone || isActive ? 'white' : '#64748b', fontSize: '15px', fontWeight: '900',
                              border: isActive ? '4px solid rgba(16, 185, 129, 0.3)' : 'none',
                              transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }}>
                              {isDone ? '✓' : i + 1}
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: '800', color: isActive ? 'var(--primary)' : isDone ? 'white' : '#64748b', transition: 'all 0.3s' }}>{step.label}</div>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>{delivery.status === 'delivering' ? '목적지' : '픽업지'}</div>
                            <div style={{ fontSize: '15px', fontWeight: '800' }}>
                              {delivery.status === 'delivering' ? delivery.destination : delivery.store}
                            </div>
                         </div>
                         <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>고객 연락처</div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#38bdf8' }}>{delivery.customerPhone}</div>
                         </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <MapSimulator status={delivery.status} />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => setShowMsgModal(true)}
                        style={{ flex: 1, padding: '12px', borderRadius: '10px', backgroundColor: '#334155', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>메시지</button>
                      <button 
                        onClick={() => nextStep(delivery.id)}
                        style={{ flex: 2, padding: '12px', borderRadius: '10px', backgroundColor: '#38bdf8', color: 'white', border: 'none', fontWeight: '900', fontSize: '14px', cursor: 'pointer' }}>
                        {delivery.status === 'accepted' ? '픽업 완료' : delivery.status === 'pickup' ? '배송 시작' : '배송 완료'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Statistics and New Requests */}
            {activeDeliveries.length < 3 ? (
              <>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>주변 배달 요청</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {deliveryRequests.filter(req => !activeDeliveries.some(d => d.id === req.id)).map((req) => (
                    <div key={req.id} style={{ backgroundColor: '#1e293b', borderRadius: '16px', overflow: 'hidden', border: '1px solid #334155' }}>
                      <div style={{ padding: '4px' }}>
                        <MapSimulator status="preview" />
                      </div>
                      <div style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '4px' }}>{req.store}</div>
                            <div style={{ fontSize: '13px', color: '#38bdf8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '14px' }}>🏬</span> {req.storeAddress}
                            </div>
                            <div style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '14px' }}>📍</span> {req.destination}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#38bdf8', fontWeight: '900', fontSize: '18px' }}>{req.fee.toLocaleString()}원</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{req.distance}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleAcceptRequest(req)}
                          style={{ width: '100%', padding: '14px', borderRadius: '10px', backgroundColor: '#38bdf8', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer' }}>배달 수락</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ padding: '40px 20px', backgroundColor: '#1e293b', borderRadius: '24px', textAlign: 'center', border: '1px solid #f59e0b' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>👔</div>
                <div style={{ color: '#f59e0b', fontWeight: '800', fontSize: '18px' }}>최대 배달 수량 도달</div>
                <div style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>현재 진행 중인 배달을 완료해야<br/>새로운 요청을 받을 수 있습니다.</div>
              </div>
            )}
          </div>
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

      {/* Message Templates Modal */}
      {showMsgModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#1e293b', borderRadius: '20px', width: '100%', maxWidth: '400px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>고객에게 메시지 전송</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                '조금 뒤 도착 예정입니다. 잠시만 기다려주세요!',
                '매장 픽업이 다소 지연되고 있습니다. 죄송합니다.',
                '도착했습니다! 문 앞에 두고 갈게요. 맛있게 드세요!',
                '벨을 누르지 말아달라는 요청 확인했습니다. 조용히 배송할게요.'
              ].map((msg, i) => (
                <button 
                  key={i} 
                  onClick={() => {
                    alert(`메시지가 전송되었습니다: "${msg}"`);
                    setShowMsgModal(false);
                  }}
                  style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#334155', color: 'white', border: '1px solid #475569', textAlign: 'left', fontSize: '14px', cursor: 'pointer' }}>
                  {msg}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowMsgModal(false)}
              style={{ width: '100%', marginTop: '20px', padding: '14px', border: 'none', background: 'transparent', color: '#94a3b8', fontWeight: '700', cursor: 'pointer' }}>
              닫기
            </button>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {showPhotoUploadModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#1e293b', borderRadius: '24px', width: '100%', maxWidth: '360px', padding: '24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>배달 완료 인증</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>반드시 배송 완료 사진을 촬영해 첨부해야 합니다.</p>
            
            <div style={{ 
              backgroundColor: '#0f172a', borderRadius: '16px', height: '200px', marginBottom: '24px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #334155',
              overflow: 'hidden', position: 'relative'
            }}>
              {deliveryPhoto ? (
                <img src={deliveryPhoto} alt="Delivery Proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ color: '#64748b', fontSize: '14px', flexDirection: 'column', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '24px' }}>📷</span>
                  <span style={{ fontWeight: '700' }}>사진을 등록해주세요</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoSelect}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
              />
            </div>
            
            <button 
              onClick={handleCompleteDelivery}
              disabled={!deliveryPhoto}
              style={{ 
                width: '100%', padding: '16px', borderRadius: '16px', 
                backgroundColor: deliveryPhoto ? '#38bdf8' : '#334155', 
                color: deliveryPhoto ? 'white' : '#64748b', 
                border: 'none', fontWeight: '900', fontSize: '16px', 
                cursor: deliveryPhoto ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}>
              배송 완료 제출
            </button>
            <button 
              onClick={() => { setShowPhotoUploadModal(false); setDeliveryPhoto(null); setUploadingDeliveryId(null); }}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', marginTop: '16px', fontWeight: '700', cursor: 'pointer' }}>
              취소
            </button>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'white', color: 'black', borderRadius: '4px', width: '100%', maxWidth: '360px', padding: '24px', fontFamily: 'monospace' }}>
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #ccc', paddingBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>[전자 영수증]</h3>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>동네마켓 - {selectedReceipt.store}</div>
            </div>
            <div style={{ padding: '20px 0', borderBottom: '1px dashed #ccc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>주문 번호</span>
                <span>{selectedReceipt.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span>배달 완료</span>
                <span>2026.01.24 {selectedReceipt.time}</span>
              </div>
              
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>주문 내역</div>
              <div style={{ fontSize: '13px' }}>{selectedReceipt.items}</div>
            </div>
            <div style={{ padding: '20px 0' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold' }}>
                  <span>배달 수수료</span>
                  <span>{selectedReceipt.fee.toLocaleString()}원</span>
               </div>
            </div>
            <button 
              onClick={() => setSelectedReceipt(null)}
              style={{ width: '100%', padding: '14px', background: '#333', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' }}>확인</button>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddVehicleModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#1e293b', borderRadius: '24px', width: '100%', maxWidth: '400px', padding: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '24px' }}>운송 수단 추가</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               <div style={{ fontSize: '14px', color: '#94a3b8' }}>자유롭게 추가 가능한 수단</div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button 
                    onClick={() => {
                       setRegisteredVehicles([...registeredVehicles, { id: Date.now(), type: 'walking', model: '', plate: '', isVerified: true }]);
                       setShowAddVehicleModal(false);
                    }}
                    style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', cursor: 'pointer' }}
                  >🚶 도보</button>
                  <button 
                    onClick={() => {
                       setRegisteredVehicles([...registeredVehicles, { id: Date.now(), type: 'bicycle', model: '일반 자전거', plate: '', isVerified: true }]);
                       setShowAddVehicleModal(false);
                    }}
                    style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', cursor: 'pointer' }}
                  >🚲 자전거</button>
               </div>
               
               <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '12px' }}>면허/심사가 필요한 수단</div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button 
                    onClick={() => alert('오토바이/승용차 추가는 상담사 문의가 필요합니다.')}
                    style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#334155', border: '1px solid #475569', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}
                  >🛵 오토바이 추가 문의</button>
                  <button 
                    onClick={() => alert('오토바이/승용차 추가는 상담사 문의가 필요합니다.')}
                    style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#334155', border: '1px solid #475569', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}
                  >🚗 승용차 추가 문의</button>
               </div>
            </div>
            <button 
              onClick={() => setShowAddVehicleModal(false)}
              style={{ width: '100%', marginTop: '32px', padding: '16px', background: 'transparent', border: 'none', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}
            >닫기</button>
          </div>
        </div>
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

      {completionNotification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '468px',
          backgroundColor: '#10b981',
          color: 'white',
          padding: '16px 20px',
          borderRadius: '24px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 2000,
          animation: 'slideDownBounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' 
          }}>🎉</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: '600', opacity: 0.9 }}>배달 완료!</div>
            <div style={{ fontSize: '16px', fontWeight: '800' }}>{completionNotification.fee.toLocaleString()}원 수익 적립</div>
          </div>
          <button 
            onClick={() => setCompletionNotification(null)}
            style={{ background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer', padding: '4px' }}>✕</button>
        </div>
      )}

      {/* Status Change Popup (Mobile Styled) */}
      {statusPopup && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ 
            backgroundColor: '#1e293b', padding: '32px', borderRadius: '28px', width: '100%', maxWidth: '320px', textAlign: 'center',
            border: `1px solid ${statusPopup.type === 'error' ? '#ef4444' : statusPopup.type === 'online' ? '#10b981' : '#38bdf8'}`,
            animation: 'popup-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>
              {statusPopup.type === 'online' ? '🚀' : statusPopup.type === 'offline' ? '🏡' : '⚠️'}
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', lineHeight: '1.5', whiteSpace: 'pre-line', marginBottom: '24px' }}>
              {statusPopup.message}
            </div>
            {statusPopup.type === 'online' && (
              <div style={{ marginBottom: '24px', padding: '12px', backgroundColor: '#0f172a', borderRadius: '12px', fontSize: '12px', color: '#94a3b8' }}>
                📍 현재 위치 확인 완료<br/>서울시 강남구 삼성동
              </div>
            )}
            <button 
              onClick={() => setStatusPopup(null)}
              style={{ width: '100%', padding: '16px', borderRadius: '16px', backgroundColor: statusPopup.type === 'error' ? '#ef4444' : '#38bdf8', color: 'white', border: 'none', fontWeight: '900', fontSize: '16px', cursor: 'pointer' }}>
              확인
            </button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {isReportModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#1e293b', borderRadius: '24px', width: '100%', maxWidth: '360px', padding: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>신고하기</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px' }}>
              {selectedHistoryItem ? `주문번호 ${selectedHistoryItem.id}` : '신고 내용을 입력해주세요'}
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', marginBottom: '8px', fontWeight: '700' }}>신고 대상</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setReportTarget('STORE')}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '12px', border: reportTarget === 'STORE' ? '2px solid var(--primary)' : '1px solid #334155',
                    backgroundColor: reportTarget === 'STORE' ? '#0f172a' : '#1e293b', color: reportTarget === 'STORE' ? 'var(--primary)' : '#94a3b8', fontWeight: '800', cursor: 'pointer'
                  }}
                >
                  🏪 마트
                </button>
                <button
                  onClick={() => setReportTarget('CUSTOMER')}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '12px', border: reportTarget === 'CUSTOMER' ? '2px solid var(--primary)' : '1px solid #334155',
                    backgroundColor: reportTarget === 'CUSTOMER' ? '#0f172a' : '#1e293b', color: reportTarget === 'CUSTOMER' ? 'var(--primary)' : '#94a3b8', fontWeight: '800', cursor: 'pointer'
                  }}
                >
                  👤 고객
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', marginBottom: '8px', fontWeight: '700' }}>신고 사유</label>
              <textarea
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
                placeholder="상세한 신고 내용을 입력해주세요."
                style={{ width: '100%', height: '100px', padding: '14px', borderRadius: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '14px', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
               <button 
                onClick={() => setIsReportModalOpen(false)}
                style={{ flex: 1, padding: '14px', borderRadius: '12px', backgroundColor: '#334155', border: 'none', fontWeight: '700', cursor: 'pointer', color: '#94a3b8' }}
              >취소</button>
              <button 
                onClick={handleSubmitReport}
                style={{ flex: 2, padding: '14px', borderRadius: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer' }}
              >🚨 신고하기</button>
            </div>
          </div>
        </div>
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
