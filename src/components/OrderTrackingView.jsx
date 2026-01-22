import React, { useState, useEffect } from 'react';

const OrderTrackingView = ({ orderId, onBack }) => {
  const [status, setStatus] = useState('PREPARING'); // PREPARING, READY, PICKED_UP, DELIVERING, DELIVERED
  const [eta, setEta] = useState(25);
  // const [riderPos, setRiderPos] = useState({ x: 20, y: 30 }); // Animation simulation
  
  // Simulate progress
  useEffect(() => {
    const timer = setInterval(() => {
      setEta(prev => Math.max(0, prev - 1));
    }, 5000); // Reduce ETA every 5 seconds for simulation

    const statusTimer = setTimeout(() => setStatus('READY'), 3000);
    const pickupTimer = setTimeout(() => setStatus('PICKED_UP'), 8000);
    const deliveryTimer = setTimeout(() => setStatus('DELIVERING'), 13000);

    return () => {
      clearInterval(timer);
      clearTimeout(statusTimer);
      clearTimeout(pickupTimer);
      clearTimeout(deliveryTimer);
    };
  }, []);

  const getStatusText = () => {
    switch(status) {
      case 'PREPARING': return '🥬 상품을 준비하고 있습니다';
      case 'READY': return '🥡 픽업을 기다리고 있습니다';
      case 'PICKED_UP': return '🛵 라이더가 상품을 픽업했습니다';
      case 'DELIVERING': return '🚀 현재 배송 중입니다';
      case 'DELIVERED': return '✨ 배송이 성공적으로 완료되었습니다!';
      default: return '주소 확인 중...';
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <button 
        onClick={onBack}
        style={{ marginBottom: '20px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', color: '#64748b' }}
      >
        ← 주문 내역으로 돌아가기
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        {/* Map Area */}
        <div style={{ background: '#f8fafc', borderRadius: '24px', position: 'relative', overflow: 'hidden', height: '600px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          {/* Mock Map Background */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          
          <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10 }}>
            <div style={{ background: 'white', padding: '16px 24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)' }}>{eta}</div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>예상 도착 시간</div>
                <div style={{ fontSize: '16px', fontWeight: '700' }}>분 후 도착 예정</div>
              </div>
            </div>
          </div>

          {/* Animation Nodes */}
          <div style={{ position: 'absolute', left: '25%', top: '70%', textAlign: 'center' }}>
            <div style={{ fontSize: '30px' }}>🏪</div>
            <div style={{ fontSize: '11px', fontWeight: '700', marginTop: '4px' }}>행복 마트</div>
          </div>
          
          <div style={{ position: 'absolute', right: '20%', top: '20%', textAlign: 'center' }}>
            <div style={{ fontSize: '30px' }}>🏠</div>
            <div style={{ fontSize: '11px', fontWeight: '700', marginTop: '4px' }}>우리집</div>
          </div>

          <div style={{ 
            position: 'absolute', 
            left: status === 'DELIVERING' ? '60%' : '30%', 
            top: status === 'DELIVERING' ? '30%' : '65%', 
            transition: 'all 5s ease-in-out',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '30px', transform: 'scaleX(-1)' }}>🛵</div>
            <div style={{ fontSize: '10px', backgroundColor: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '10px', fontWeight: '800' }}>라이더</div>
          </div>
        </div>

        {/* Status Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>{getStatusText()}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: '주문 접수', time: '오후 1:20', active: true },
                { label: '상품 준비 중', time: '오후 1:22', active: status !== 'PREPARING' },
                { label: '배송 시작', time: '진행 예정', active: status === 'PICKED_UP' || status === 'DELIVERING' },
                { label: '도착 예정', time: '오후 1:45', active: status === 'DELIVERED' }
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%', 
                      backgroundColor: step.active ? 'var(--primary)' : '#e2e8f0',
                      border: '2px solid white',
                      boxShadow: '0 0 0 2px ' + (step.active ? '#dcfce7' : '#f1f5f9')
                    }} />
                    {i < 3 && <div style={{ width: '2px', height: '30px', backgroundColor: step.active ? 'var(--primary)' : '#f1f5f9' }} />}
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: step.active ? '700' : '500', color: step.active ? '#1e293b' : '#94a3b8' }}>{step.label}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{step.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '25px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👨‍✈️</div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '800' }}>김대리 라이더</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>현대 아이오닉5 (전기차)</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#f1f5f9', color: '#1e293b', border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>전화하기</button>
              <button style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#f1f5f9', color: '#1e293b', border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>메시지</button>
            </div>
          </div>
          
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px', color: '#64748b' }}>주문 요약</h4>
            <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>주문 번호</span>
                <span style={{ fontWeight: '600' }}>ORD-{orderId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>배송지</span>
                <span style={{ fontWeight: '600', textAlign: 'right' }}>서울특별시 강남구<br/>역삼동 123-45</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingView;
