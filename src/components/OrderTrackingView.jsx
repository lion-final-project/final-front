import React, { useState, useEffect } from 'react';

const OrderTrackingView = ({ orderId, onBack, isModal = false }) => {
  const [status, setStatus] = useState('PREPARING'); // PREPARING, READY, PICKED_UP, DELIVERING, DELIVERED
  const [eta, setEta] = useState(25);
  
  // Simulate progress
  useEffect(() => {
    const timer = setInterval(() => {
      setEta(prev => Math.max(0, prev - 1));
    }, 5000);

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
      case 'PREPARING': return '상품을 준비하고 있습니다';
      case 'READY': return '픽업을 기다리고 있습니다';
      case 'PICKED_UP': return '라이더가 상품을 픽업했습니다';
      case 'DELIVERING': return '현재 배송 중입니다';
      case 'DELIVERED': return '배송이 완료되었습니다';
      default: return '주소 확인 중...';
    }
  };

  const statusIcon = () => {
    switch(status) {
      case 'PREPARING': return '🥬';
      case 'READY': return '🥡';
      case 'PICKED_UP': return '🛵';
      case 'DELIVERING': return '🚀';
      case 'DELIVERED': return '✨';
      default: return '📍';
    }
  };

  return (
    <div style={{ 
      padding: isModal ? '0' : '20px', 
      maxWidth: isModal ? '100%' : '600px', 
      margin: '0 auto',
      height: '100%',
      overflowY: 'auto'
    }}>
      {!isModal && (
        <button 
          onClick={onBack}
          style={{ marginBottom: '20px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', color: '#64748b' }}
        >
          ← 주문 내역으로 돌아가기
        </button>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
        
        {/* Top Status Card */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ fontSize: '24px' }}>{statusIcon()}</div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>{getStatusText()}</h2>
          </div>

          <div style={{ position: 'relative', paddingLeft: '16px' }}>
            {/* Vertical Line */}
            <div style={{ position: 'absolute', left: '6px', top: '10px', bottom: '10px', width: '2px', backgroundColor: '#f1f5f9' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                { label: '주문 접수', time: '오후 1:20', active: true },
                { label: '상품 준비 중', time: '오후 1:22', active: status !== 'PREPARING' },
                { label: '배송 시작', time: '진행 예정', active: status === 'PICKED_UP' || status === 'DELIVERING' || status === 'DELIVERED' },
                { label: '도착 예정', time: '오후 1:45', active: status === 'DELIVERED' }
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', position: 'relative' }}>
                  <div style={{ 
                    width: '14px', 
                    height: '14px', 
                    borderRadius: '50%', 
                    backgroundColor: step.active ? 'var(--primary)' : 'white',
                    border: step.active ? '2px solid var(--primary)' : '2px solid #cbd5e1',
                    zIndex: 1,
                    marginTop: '2px'
                  }} />
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: step.active ? '700' : '500', color: step.active ? '#1e293b' : '#94a3b8' }}>{step.label}</div>
                    <div style={{ fontSize: '12px', color: step.active ? '#64748b' : '#cbd5e1', marginTop: '2px' }}>{step.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ETA & Rider Card */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
             <div>
               <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>예상 도착 시간</div>
               <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)' }}>{eta}분 후</div>
             </div>
             <div style={{ textAlign: 'right' }}>
               <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>도착 예정</div>
               <div style={{ fontSize: '18px', fontWeight: '700' }}>13:45</div>
             </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>👨‍✈️</div>
            <div style={{ flexGrow: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '2px' }}>김대리 라이더</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>현대 아이오닉5 (전기차)</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ padding: '8px 16px', borderRadius: '8px', background: '#f1f5f9', color: '#1e293b', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>전화</button>
              <button style={{ padding: '8px 16px', borderRadius: '8px', background: '#f1f5f9', color: '#1e293b', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>문자</button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', color: '#334155' }}>주문 요약</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#64748b' }}>주문 번호</span>
              <span style={{ fontWeight: '600' }}>ORD-{orderId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '14px' }}>
              <span style={{ color: '#64748b' }}>배송지</span>
              <span style={{ fontWeight: '600', textAlign: 'right', lineHeight: '1.5' }}>서울특별시 강남구<br/>역삼동 123-45</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderTrackingView;
