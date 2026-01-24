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
        <div style={{ position: 'absolute', top: -20, left: -20, whiteSpace: 'nowrap', fontSize: '10px', fontWeight: '800', color: 'white' }}>마트 (PICKUP)</div>
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

const RiderDashboard = ({ isResidentRider }) => {
  const [activeTab, setActiveTab] = useState('main');
  const [isOnline, setIsOnline] = useState(true);
  const [activeDeliveries, setActiveDeliveries] = useState([]); // Array of { ...req, status }
  const [earnings, setEarnings] = useState({ today: 48500, weekly: 342000 });
  const [showMsgModal, setShowMsgModal] = useState(false);
  
  const [verificationStatus /* , setVerificationStatus */] = useState('verified'); // unverified, pending, verified
  const [vehicleInfo, setVehicleInfo] = useState({ 
    type: 'electric_car', 
    model: '현대 아이오닉5', 
    plate: '123가 4567' 
  });

  const deliveryRequests = [
    { id: 'REQ001', store: '무림 정육점', destination: '삼성동 빌라 302호', distance: '1.2km', fee: 3500 },
    { id: 'REQ002', store: '행복 마트 강남점', destination: '논현동 원룸 201호', distance: '0.8km', fee: 3000 }
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
        setEarnings(e => ({ ...e, today: e.today + delivery.fee }));
        alert('배달이 완료되었습니다! 수익이 적립되었습니다.');
        return prev.filter(d => d.id !== id);
      }
      return prev;
    });
  };

  const renderActiveView = () => {
    if (!isOnline && activeTab === 'main') {
      return (
        <div style={{ padding: '60px 20px', textAlign: 'center', opacity: 0.6 }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>💤</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>현재 휴식 중입니다</h2>
          <p style={{ color: '#94a3b8', fontSize: '15px' }}>배달을 시작하려면 상단의 'ON' 버튼을 눌러주세요.</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'earnings':
        return (
          <div style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>수익 상세</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '16px' }}>
                <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '4px' }}>오늘 수익</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#38bdf8' }}>{earnings.today.toLocaleString()}원</div>
              </div>
              <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '16px' }}>
                <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '4px' }}>이번 주 수익</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#10b981' }}>{earnings.weekly.toLocaleString()}원</div>
              </div>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>최근 정산/출금 내역</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { date: '2026.01.20', amount: '50,000원', status: '입금완료', type: '출금' },
                { date: '2026.01.18', amount: '120,000원', status: '준비중', type: '정산' }
              ].map((item, i) => (
                <div key={i} style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '15px' }}>{item.amount} {item.type}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{item.date}</div>
                  </div>
                  <div style={{ color: item.status === '입금완료' ? '#2ecc71' : '#f59e0b', fontWeight: '800', fontSize: '13px' }}>{item.status}</div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'history':
        return (
          <div style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>배달 히스토리</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { id: 'ORD20260124101', store: '행복 마트', dest: '역삼동 123-1', time: '14:23', fee: 3500, items: '신선란 10구, 유기농 우유 1L', customer: '김철수' },
                { id: 'ORD20260124085', store: '싱싱 정육점', dest: '삼성동 45-2', time: '13:10', fee: 4000, items: '한우 등심 300g x 2', customer: '이영희' },
                { id: 'ORD20260124052', store: '우리 마켓', dest: '대치동 900', time: '12:05', fee: 3200, items: '꿀사과 3입, 바나나 1송이', customer: '박지민' }
              ].map((item, i) => (
                <div key={i} style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>오늘 {item.time}</span>
                    <span style={{ fontSize: '11px', backgroundColor: '#0f172a', color: '#2ecc71', padding: '4px 10px', borderRadius: '6px', fontWeight: '900' }}>배달 완료</span>
                  </div>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>주문번호: {item.id}</div>
                    <div style={{ fontSize: '16px', fontWeight: '800' }}>{item.store} → {item.dest}</div>
                  </div>

                  <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px', fontWeight: '700' }}>배달 상세 내역</div>
                    <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                      <span style={{ color: '#94a3b8' }}>품목:</span> {item.items}
                    </div>
                    <div style={{ fontSize: '14px' }}>
                      <span style={{ color: '#94a3b8' }}>고객:</span> {item.customer} (문의: 010-****-1234)
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '18px', color: '#38bdf8', fontWeight: '900' }}>+{item.fee.toLocaleString()}원</div>
                    <button 
                      onClick={() => alert(`주문번호 ${item.id}의 상세 영수증을 불러옵니다.`)}
                      style={{ fontSize: '12px', color: '#94a3b8', background: 'transparent', border: '1px solid #334155', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}
                    >영수증 보기</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'account':
        return (
          <div style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>계정 및 차량 관리</h2>
            
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

            <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>차량 정보 설정</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>운송 수단</label>
                  <select 
                    value={vehicleInfo.type}
                    onChange={(e) => setVehicleInfo({...vehicleInfo, type: e.target.value})}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontWeight: '600' }}
                  >
                    <option value="electric_car">전기차 / 승용차</option>
                    <option value="motorcycle">오토바이</option>
                    <option value="bicycle">자전거 / 전동 킥보드</option>
                    <option value="walking">도보</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>차량 모델</label>
                  <input 
                    type="text" 
                    value={vehicleInfo.model}
                    onChange={(e) => setVehicleInfo({...vehicleInfo, model: e.target.value})}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>차량 번호</label>
                  <input 
                    type="text" 
                    value={vehicleInfo.plate}
                    onChange={(e) => setVehicleInfo({...vehicleInfo, plate: e.target.value})}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white' }} 
                  />
                </div>
                <button style={{ backgroundColor: '#38bdf8', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: '800', marginTop: '12px', cursor: 'pointer' }}>정보 저장하기</button>
              </div>
            </div>

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <button style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>로그아웃</button>
            </div>
          </div>
        );
      default:
        return (
          <div style={{ padding: '20px' }}>
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
                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>{delivery.status === 'delivering' ? '목적지' : '픽업지'}</div>
                      <div style={{ fontSize: '15px', fontWeight: '800' }}>
                        {delivery.status === 'delivering' ? delivery.destination : delivery.store}
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
                <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '24px', borderRadius: '16px', marginBottom: '30px', borderLeft: '4px solid #38bdf8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>오늘의 배달 수익</div>
                      <div style={{ fontSize: '32px', fontWeight: '900' }}>{earnings.today.toLocaleString()}원</div>
                      <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', fontWeight: '600' }}>목표 수익까지 11,500원 남음</div>
                    </div>
                  </div>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>주변 배달 요청</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {deliveryRequests.filter(req => !activeDeliveries.some(d => d.id === req.id)).map((req) => (
                    <div key={req.id} style={{ backgroundColor: '#1e293b', borderRadius: '16px', padding: '20px', border: '1px solid #334155' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '4px' }}>{req.store}</div>
                          <div style={{ fontSize: '13px', color: '#94a3b8' }}>📍 {req.destination}</div>
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
      position: 'relative'
    }}>
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
              backgroundColor: isOnline ? 'var(--primary)' : '#64748b', 
              borderRadius: '50%',
              boxShadow: isOnline ? '0 0 10px var(--primary)' : 'none'
            }}></span>
            <span style={{ fontWeight: '700', color: isOnline ? 'white' : '#94a3b8' }}>{isOnline ? '운행 중' : '휴식 중'}</span>
          </div>
          <button 
            onClick={() => setIsOnline(!isOnline)}
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
                '마트 픽업이 다소 지연되고 있습니다. 죄송합니다.',
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
          { icon: '💰', label: '수익', tab: 'earnings' },
          { icon: '👤', label: '계정/차량', tab: 'account' }
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
