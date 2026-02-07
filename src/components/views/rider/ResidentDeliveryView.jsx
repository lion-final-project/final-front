import React, { useState } from 'react';

const ResidentDeliveryView = () => {
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [earnings, setEarnings] = useState(12500);
  const [nearbyOrders, setNearbyOrders] = useState([
    { id: 'NBR001', store: '행복 과일가게', address: '명지아파트 101동', distance: '450m', fee: 2500, items: '사과 1박스' },
    { id: 'NBR002', store: '우리분식', address: '중앙하이츠 203동', distance: '800m', fee: 3000, items: '떡볶이, 튀김' },
    { id: 'NBR003', store: '동네 빵집', address: '역삼빌라 402호', distance: '1.2km', fee: 3500, items: '식빵, 우유' }
  ]);

  const handleAcceptOrder = (order) => {
    setNearbyOrders(prev => prev.filter(o => o.id !== order.id));
    setActiveDeliveries(prev => [...prev, { ...order, status: 'PICKUP', step: 0 }]);
  };

  const handleNextStep = (orderId) => {
    setActiveDeliveries(prev => prev.map(d => {
      if (d.id === orderId) {
        if (d.step === 0) return { ...d, step: 1, status: 'DELIVERING' };
        if (d.step === 1) {
          setEarnings(prev => prev + d.fee);
          return null;
        }
      }
      return d;
    }).filter(Boolean));
  };

  return (
    <div className="resident-delivery" style={{ padding: '40px 0', minHeight: '80vh' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px' }}>
        <main>
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>근처 배달 일감 <span style={{ color: '#38bdf8', fontSize: '18px' }}>{nearbyOrders.length}건</span></h2>
            <div style={{ fontSize: '14px', color: '#64748b' }}>📍 내 주변 1.5km 이내</div>
          </div>

          {activeDeliveries.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#38bdf8' }}>진행 중인 배달</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeDeliveries.map(del => (
                  <div key={del.id} style={{ backgroundColor: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '20px', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', backgroundColor: '#38bdf8', color: 'white', padding: '4px 12px', borderRadius: '20px' }}>
                        {del.status === 'PICKUP' ? '상점에서 픽업 대기' : '고객에게 배달 중'}
                      </div>
                      <div style={{ fontWeight: '800', color: '#0369a1' }}>{del.fee.toLocaleString()}원</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '18px', marginBottom: '4px' }}>{del.store}</div>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>→ {del.address} ({del.items})</div>
                      </div>
                      <button 
                        onClick={() => handleNextStep(del.id)}
                        style={{ padding: '12px 24px', borderRadius: '12px', backgroundColor: '#0369a1', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                      >
                        {del.step === 0 ? '픽업 완료' : '배달 완료'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {nearbyOrders.map(order => (
              <div key={order.id} style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: '800' }}>{order.store}</span>
                    <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '700' }}>{order.distance}</span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#475569', marginBottom: '4px' }}>목적지: {order.address}</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8' }}>상품: {order.items}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', fontSize: '18px', color: '#1e293b', marginBottom: '10px' }}>{order.fee.toLocaleString()}원</div>
                  <button 
                    onClick={() => handleAcceptOrder(order)}
                    style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#1e293b', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                  >배달 수락</button>
                </div>
              </div>
            ))}
          </div>
        </main>

        <aside>
          <div style={{ backgroundColor: '#1e293b', color: 'white', borderRadius: '24px', padding: '32px', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#94a3b8', marginTop: 0 }}>나의 오늘 수익</h3>
            <div style={{ fontSize: '32px', fontWeight: '900', marginBottom: '24px' }}>{earnings.toLocaleString()}원</div>
            
            <div style={{ borderTop: '1px solid #334155', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#94a3b8' }}>완료 건수</span>
                <span style={{ fontWeight: '700' }}>4건</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#94a3b8' }}>이웃 감사 점수</span>
                <span style={{ fontWeight: '700', color: '#38bdf8' }}>★ 98</span>
              </div>
            </div>

            <div style={{ marginTop: '32px', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '16px', borderRadius: '16px', fontSize: '13px', lineHeight: '1.6', color: '#bae6fd' }}>
              💡 동네 라이더님, <br />
              오늘도 지역 상권과 이웃을 위해 <br />
              따뜻한 마음을 전달해 주셔서 감사합니다.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ResidentDeliveryView;
