import React from 'react';
import MapSimulator from '../MapSimulator';
import RiderMap from '../components/RiderMap';

const MainTab = ({ earnings, activeDeliveries, deliveryRequests, isLoadingRequests, setShowMsgModal, nextStep, handleAcceptRequest, currentLocation, lastSyncTime }) => {
  return (
    <div style={{ padding: '20px' }}>
      {/* 수익 요약 카드 */}
      <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '24px', borderRadius: '24px', marginBottom: '32px', border: '1px solid #334155', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
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

      {/* 실시간 위치 지도 */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>실시간 내 위치</h3>
          {currentLocation && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', backgroundColor: 'rgba(30, 41, 59, 0.8)', padding: '6px 10px', borderRadius: '8px', border: '1px solid #334155', marginBottom: '4px' }}>
                <span style={{ color: '#38bdf8', fontWeight: '700' }}>📡 Redis:</span> {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </div>
              {lastSyncTime && (
                <div style={{ fontSize: '10px', color: '#64748b', marginRight: '4px' }}>
                  마지막 업데이트: {lastSyncTime}
                </div>
              )}
            </div>
          )}
        </div>
        <RiderMap location={currentLocation} height="250px" />
      </div>

      {/* 진행 중인 배달 */}
      {activeDeliveries.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>진행 중인 배달 ({activeDeliveries.length})</h3>
          {activeDeliveries.map((delivery) => (
            <div key={delivery.id} style={{ backgroundColor: '#1e293b', borderRadius: '20px', padding: '24px', border: '1px solid #38bdf8', boxShadow: '0 10px 25px -5px rgba(56, 189, 248, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#38bdf8' }}>{delivery.id} 진행 중</span>
                  <span style={{ fontSize: '11px', fontWeight: '900', color: '#ef4444' }}>배차완료!</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: '800' }}>{delivery.fee.toLocaleString()}원</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', position: 'relative', padding: '0 10px' }}>
                <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '2px', backgroundColor: '#334155', zIndex: 0 }} />
                <div style={{ position: 'absolute', top: '15px', left: '10%', width: delivery.status === 'pickup' ? '40%' : delivery.status === 'delivering' ? '80%' : '0%', height: '2px', backgroundColor: '#38bdf8', zIndex: 0, transition: 'width 0.3s' }} />
                {[{ label: '수락', key: 'accepted' }, { label: '픽업', key: 'pickup' }, { label: '배송 중', key: 'delivering' }, { label: '완료', key: 'done' }].map((step, i) => {
                  const isDone = (step.key === 'accepted' && (delivery.status === 'pickup' || delivery.status === 'delivering')) || (step.key === 'pickup' && delivery.status === 'delivering');
                  const isActive = step.key === delivery.status;
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', zIndex: 1, position: 'relative' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: isDone || isActive ? 'var(--primary)' : '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDone || isActive ? 'white' : '#64748b', fontSize: '15px', fontWeight: '900', border: isActive ? '4px solid rgba(16, 185, 129, 0.3)' : 'none', transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>{isDone ? '✓' : i + 1}</div>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: isActive ? 'var(--primary)' : isDone ? 'white' : '#64748b', transition: 'all 0.3s' }}>{step.label}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ fontSize: '18px', marginTop: '2px' }}>🏬</span>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>픽업지 ({delivery.storeName})</div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#f8fafc' }}>{delivery.pickupAddress}</div>
                  </div>
                </div>
                <div style={{ height: '1px', backgroundColor: '#1e293b' }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ fontSize: '18px', marginTop: '2px' }}>📍</span>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>목적지</div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#38bdf8' }}>{delivery.deliveryAddress}</div>
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}><MapSimulator status={delivery.status} /></div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setShowMsgModal(true)} style={{ flex: 1, padding: '12px', borderRadius: '10px', backgroundColor: '#334155', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>메시지</button>
                <button onClick={() => nextStep(delivery.id)} style={{ flex: 2, padding: '12px', borderRadius: '10px', backgroundColor: '#38bdf8', color: 'white', border: 'none', fontWeight: '900', fontSize: '14px', cursor: 'pointer' }}>{delivery.status === 'accepted' ? '픽업 완료' : delivery.status === 'pickup' ? '배송 시작' : '배송 완료'}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 주변 배달 요청 */}
      {activeDeliveries.length < 3 ? (
        <>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>주변 배달 요청</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isLoadingRequests ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid #334155', borderTopColor: '#38bdf8', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
                <div style={{ color: '#94a3b8', fontSize: '14px' }}>주변 배달 요청을 불러오는 중...</div>
              </div>
            ) : deliveryRequests.filter(req => !activeDeliveries.some(d => d.id === req.id)).length === 0 ? (
              <div style={{ padding: '40px 20px', backgroundColor: '#1e293b', borderRadius: '24px', textAlign: 'center', border: '1px solid #334155' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                <div style={{ color: '#94a3b8', fontWeight: '700', fontSize: '16px' }}>현재 주변에 배달 요청이 없습니다</div>
                <div style={{ color: '#64748b', fontSize: '13px', marginTop: '8px' }}>새로운 배달 요청이 들어오면<br />자동으로 표시됩니다.</div>
              </div>
            ) : (
              deliveryRequests.filter(req => !activeDeliveries.some(d => d.id === req.id)).map((req) => (
                <div key={req.id} style={{ backgroundColor: '#1e293b', borderRadius: '16px', overflow: 'hidden', border: '1px solid #334155' }}>
                  <div style={{ padding: '4px' }}><MapSimulator status="preview" /></div>
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '4px' }}>{req.store}</div>
                        <div style={{ fontSize: '13px', color: '#38bdf8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ fontSize: '14px' }}>🏬</span> {req.storeAddress}</div>
                        <div style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ fontSize: '14px' }}>📍</span> {req.destination}</div>
                        {req.orderSummary && <div style={{ fontSize: '13px', color: '#e2e8f0', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ fontSize: '14px' }}>📦</span> {req.orderSummary}</div>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#38bdf8', fontWeight: '900', fontSize: '18px' }}>{req.fee?.toLocaleString()}원</div>
                        {req.distance && <div style={{ fontSize: '12px', color: '#64748b' }}>{req.distance}</div>}
                      </div>
                    </div>
                    <button onClick={() => handleAcceptRequest(req)} style={{ width: '100%', padding: '14px', borderRadius: '10px', backgroundColor: '#38bdf8', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer' }}>배달 수락</button>
                  </div>
                </div>
              ))
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style></div>
        </>
      ) : (
        <div style={{ padding: '40px 20px', backgroundColor: '#1e293b', borderRadius: '24px', textAlign: 'center', border: '1px solid #f59e0b' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👔</div>
          <div style={{ color: '#f59e0b', fontWeight: '800', fontSize: '18px' }}>최대 배달 수량 도달</div>
          <div style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>현재 진행 중인 배달을 완료해야<br />새로운 요청을 받을 수 있습니다.</div>
        </div>
      )}
    </div>
  );
};

export default MainTab;
