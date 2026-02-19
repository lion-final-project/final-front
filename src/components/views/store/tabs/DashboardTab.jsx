import React from 'react';

const DashboardTab = ({
  orders,
  ordersLoading = false,
  products,
  lowStockThreshold,
  expandedOrders,
  currentTime,
  setActiveTab,
  handleToggleExpand,
  updatePrepTime,
  handleAcceptOrder,
  acceptingOrderId = null,
  handleCompletePreparation,
  completingOrderId = null,
  handleOpenRejectModal,
  toggleSoldOut,
}) => {
  const activeOrders = orders.filter(o => ['신규', '준비중', '배차 완료', '픽업가능', '픽업 완료', '배달중'].includes(o.status));
  const pendingOrders = orders.filter(o => ['신규', '준비중', '배차 완료', '픽업가능', '픽업 완료'].includes(o.status));
  const lowStockProducts = products.filter(p => p.stock < lowStockThreshold);

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
        <div className="stat-card" style={{ padding: '24px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #38bdf8' }}>
          <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px', fontWeight: '600' }}>오늘의 총 매출</div>
          <div style={{ fontSize: '28px', fontWeight: '800' }}>1,245,000원</div>
          <div style={{ color: '#10b981', fontSize: '12px', marginTop: '8px', fontWeight: '700' }}>↑ 어제보다 12.4% 상승</div>
        </div>
        <div className="stat-card" style={{ padding: '24px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #10b981' }}>
          <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px', fontWeight: '600' }}>대응 필요 주문</div>
          <div style={{ fontSize: '28px', fontWeight: '800' }}>{activeOrders.length}건</div>
          <div style={{ color: '#64748b', fontSize: '12px', marginTop: '8px' }}>진행 중 {activeOrders.length}</div>
        </div>
        <div className="stat-card" style={{ padding: '24px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px', fontWeight: '600' }}>현재 구독 회원</div>
          <div style={{ fontSize: '28px', fontWeight: '800' }}>156명</div>
          <div style={{ color: '#f59e0b', fontSize: '12px', marginTop: '8px', fontWeight: '700' }}>이번 주 5명 신규 유입</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>신규 주문 현황</h2>
            <button onClick={() => setActiveTab('orders')} style={{ color: 'var(--primary)', border: 'none', background: 'transparent', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>전체 보기 &gt;</button>
          </div>
          {ordersLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>주문 목록을 불러오는 중...</div>
          ) : pendingOrders.length > 0 ? (
            pendingOrders.map(order => (
              <div key={order.id} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: order.status === '신규' ? '#fffafb' : order.status === '준비중' ? '#f0fdf4' : '#f8fafc', borderRadius: '12px', border: order.status === '신규' ? '1px solid #fee2e2' : order.status === '준비중' ? '1px solid #dcfce7' : '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => handleToggleExpand(order.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px', transform: expandedOrders.has(order.id) ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</button>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontSize: '15px', fontWeight: '700' }}>{order.orderNumber || order.id}</div>
                        {order.status === '배차 완료' && <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#e0e7ff', color: '#4338ca', padding: '2px 6px', borderRadius: '4px' }}>배차 완료</span>}
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>{order.items}</div>
                      {order.status === '거절됨' && <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: '700', marginTop: '4px' }}>사유: {order.rejectionReason}</div>}
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{order.date}</div>
                      {order.status === '신규' && order.createdAt && (
                        <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: '800', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '14px' }}>⏰</span>
                          자동 거절까지 {(() => {
                            const remaining = Math.max(0, (5 * 60 * 1000) - (currentTime - order.createdAt));
                            return `${Math.floor(remaining / 60000)}분 ${Math.floor((remaining % 60000) / 1000)}초`;
                          })()} 남음
                        </div>
                      )}
                      {order.status === '준비중' && order.readyAt != null && (
                        <div style={{ fontSize: '11px', color: '#166534', fontWeight: '800', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '14px' }}>⏱</span>
                          준비 완료까지 {(() => {
                            const remaining = Math.max(0, order.readyAt - currentTime);
                            const m = Math.floor(remaining / 60000);
                            const s = Math.floor((remaining % 60000) / 1000);
                            return m > 0 ? `${m}분 ${s}초` : `${s}초`;
                          })()} 남음
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {order.status === '신규' && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '8px', padding: '4px 12px', border: '1px solid #e2e8f0' }}>
                          <select value={order.prepTime || 10} onChange={(e) => updatePrepTime(order.id, e.target.value)} style={{ border: 'none', background: 'transparent', textAlign: 'right', fontSize: '14px', fontWeight: '800', outline: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                            {[5, 10, 15, 20, 25].map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '4px', fontWeight: '700' }}>분</span>
                        </div>
                        <button onClick={() => handleAcceptOrder?.(order.id, order.prepTime || 10)} disabled={acceptingOrderId === order.id} style={{ padding: '14px 28px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '800', cursor: acceptingOrderId === order.id ? 'wait' : 'pointer', fontSize: '15px', boxShadow: '0 4px 12px rgba(46, 204, 113, 0.2)', opacity: acceptingOrderId === order.id ? 0.7 : 1 }}>{acceptingOrderId === order.id ? '처리중...' : '주문 접수'}</button>
                      </>
                    )}
                    {order.status === '준비중' && (
                      <button
                        onClick={() => handleCompletePreparation?.(order.id)}
                        disabled={completingOrderId === order.id}
                        style={{
                          padding: '14px 28px',
                          borderRadius: '12px',
                          background: '#38bdf8',
                          color: 'white',
                          border: 'none',
                          fontWeight: '800',
                          cursor: completingOrderId === order.id ? 'wait' : 'pointer',
                          fontSize: '15px',
                          boxShadow: '0 4px 12px rgba(56, 189, 248, 0.2)',
                          opacity: completingOrderId === order.id ? 0.7 : 1,
                        }}
                      >
                        {completingOrderId === order.id ? '처리중...' : '준비 완료'}
                      </button>
                    )}
                    {order.status === '픽업가능' && <button disabled style={{ padding: '14px 28px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid #38bdf8', fontWeight: '800', cursor: 'wait', fontSize: '15px' }}>배차 진행중...</button>}
                    {order.status === '배차 완료' && <button disabled style={{ padding: '14px 28px', borderRadius: '12px', background: '#e0e7ff', color: '#4338ca', border: 'none', fontWeight: '800', cursor: 'default', fontSize: '15px' }}>배차 완료</button>}
                    {order.status === '신규' && <button onClick={() => handleOpenRejectModal(order.id)} style={{ padding: '14px 24px', borderRadius: '12px', background: 'white', border: '1px solid #cbd5e1', color: '#64748b', fontWeight: '800', cursor: 'pointer', fontSize: '15px' }}>거절</button>}
                  </div>
                </div>
                {expandedOrders.has(order.id) && (
                  <div style={{ padding: '12px 12px 0 40px' }}>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>상세 내역</div>
                      {order.itemsList && order.itemsList.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span>- {item.name} x {item.qty}</span>
                          <span>{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>새로운 주문이 없습니다.</div>
          )}
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>재고 부족 알림</h2>
            <button onClick={() => setActiveTab('inventory')} style={{ color: '#ef4444', border: 'none', background: 'transparent', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>관리</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {lowStockProducts.map((product) => (
              <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: product.isSoldOut ? 0.6 : 1 }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {product.img && (product.img.startsWith('data:') || product.img.startsWith('http')) ? (
                    <img src={product.img} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                  ) : (
                    <span style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', borderRadius: '8px', fontSize: '18px', flexShrink: 0 }}>📦</span>
                  )}
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', textDecoration: product.isSoldOut ? 'line-through' : 'none' }}>{product.name}</div>
                    <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: '700' }}>재고 {product.stock}개 남음</div>
                  </div>
                </div>
                <div onClick={() => toggleSoldOut(product.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '4px 8px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: product.isSoldOut ? '#fee2e2' : 'white' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: product.isSoldOut ? '#ef4444' : '#64748b' }}>{product.isSoldOut ? '비판매' : '판매중'}</span>
                  <div style={{ width: '24px', height: '12px', borderRadius: '10px', backgroundColor: product.isSoldOut ? '#ef4444' : '#cbd5e1', position: 'relative' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: '1px', left: product.isSoldOut ? '13px' : '1px', transition: 'all 0.2s' }}></div>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => setActiveTab('inventory')} style={{ marginTop: '10px', padding: '12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}>전체 상품 현황 보기</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardTab;
