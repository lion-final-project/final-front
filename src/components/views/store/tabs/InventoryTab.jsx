import React from 'react';

const InventoryTab = ({
  products,
  inventoryStats,
  inventoryHistory,
  inventoryLoading,
  lowStockThreshold,
  inventorySearchKeyword,
  stockAdjustValues,
  setLowStockThreshold,
  setInventorySearchKeyword,
  setStockAdjustValues,
  handleStockAdjust,
  toggleSoldOut,
}) => {
  const filteredProducts = products.filter((p) =>
    !inventorySearchKeyword.trim() || (p.name && p.name.toLowerCase().includes(inventorySearchKeyword.trim().toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {inventoryLoading && inventoryStats == null ? (
          <div style={{ gridColumn: '1 / -1', padding: '24px', textAlign: 'center', color: '#64748b' }}>통계를 불러오는 중...</div>
        ) : null}
        {[
          { label: '전체 상품 수', value: inventoryStats != null ? `${inventoryStats.totalProductCount ?? products.length}종` : `${products.length}종`, icon: '📦', color: '#1e293b' },
          { label: '비판매 상품', value: inventoryStats != null ? `${inventoryStats.inactiveProductCount ?? 0}종` : `${products.filter(p => p.isSoldOut).length}종`, icon: '🚫', color: '#ef4444' },
          { label: '재고 부족', value: `${products.filter(p => !p.isSoldOut && p.stock < lowStockThreshold).length}종`, icon: '⚠️', color: '#f59e0b' },
          { label: '당일 입고/출고', value: inventoryStats != null ? `입고 ${inventoryStats.todayInCount ?? 0} / 출고 ${inventoryStats.todayOutCount ?? 0}` : `${inventoryHistory.length}건`, icon: '🔄', color: '#3b82f6' },
        ].map((stat, i) => (
          <div key={i} style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{stat.icon}</div>
            <div>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: stat.color }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
        <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>재고 조정 및 현황</h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '6px 12px', borderRadius: '100px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '14px' }}>🔔</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>재고 알림 기준</span>
                <select value={lowStockThreshold} onChange={(e) => setLowStockThreshold(Number(e.target.value))} style={{ padding: '4px 12px', borderRadius: '100px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '800', cursor: 'pointer', outline: 'none', background: 'white', color: 'var(--primary)' }}>
                  <option value={5}>5개 이하</option>
                  <option value={10}>10개 이하</option>
                  <option value={20}>20개 이하</option>
                  <option value={50}>50개 이하</option>
                </select>
              </div>
              <input type="text" placeholder="상품명 검색..." value={inventorySearchKeyword} onChange={(e) => setInventorySearchKeyword(e.target.value)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
            </div>
          </div>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '13px' }}>
                  <th style={{ padding: '12px' }}>상품</th>
                  <th style={{ padding: '12px' }}>현재고</th>
                  <th style={{ padding: '12px' }}>판매 상태</th>
                  <th style={{ padding: '12px' }}>수량 조정</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const isLow = product.stock < lowStockThreshold;
                  return (
                    <tr key={product.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {product.img ? <img src={product.img} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} /> : <span style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', borderRadius: '8px', fontSize: '18px' }}>📦</span>}
                          <div style={{ fontWeight: '700' }}>{product.name}</div>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}><span style={{ fontWeight: '800', color: isLow ? '#ef4444' : '#1e293b' }}>{product.stock}개</span></td>
                      <td style={{ padding: '12px' }}>
                        <div onClick={() => toggleSoldOut(product.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '4px 8px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: product.isSoldOut ? '#fee2e2' : 'white' }}>
                          <span style={{ fontSize: '10px', fontWeight: '800', color: product.isSoldOut ? '#ef4444' : '#64748b' }}>{product.isSoldOut ? '비판매' : '판매중'}</span>
                          <div style={{ width: '24px', height: '12px', borderRadius: '10px', backgroundColor: product.isSoldOut ? '#ef4444' : '#cbd5e1', position: 'relative' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: '1px', left: product.isSoldOut ? '13px' : '1px', transition: 'all 0.2s' }}></div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input type="number" min="1" value={stockAdjustValues[product.id] || ''} onChange={(e) => setStockAdjustValues({ ...stockAdjustValues, [product.id]: e.target.value })} placeholder="수량" style={{ width: '60px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none' }} />
                          <button onClick={() => { const amount = parseInt(stockAdjustValues[product.id]); if (isNaN(amount) || amount <= 0) { alert('올바른 수량을 입력해주세요.'); return; } handleStockAdjust(product.id, amount); setStockAdjustValues({ ...stockAdjustValues, [product.id]: '' }); }} style={{ padding: '6px 16px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}>입고</button>
                          <button onClick={() => { const amount = parseInt(stockAdjustValues[product.id]); if (isNaN(amount) || amount <= 0) { alert('올바른 수량을 입력해주세요.'); return; } if (amount > product.stock) { alert('현재고보다 많은 수량을 출고할 수 없습니다.'); return; } handleStockAdjust(product.id, -amount); setStockAdjustValues({ ...stockAdjustValues, [product.id]: '' }); }} style={{ padding: '6px 12px', borderRadius: '8px', background: 'white', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>출고</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 24px 0' }}>최근 입출고 내역</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }}>
            {inventoryHistory.length > 0 ? inventoryHistory.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '16px', borderBottom: '1px solid #f8fafc' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: item.type === '입고' ? '#ecfdf5' : '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.type === '입고' ? '#10b981' : '#ef4444', fontSize: '18px' }}>{item.type === '입고' ? '📥' : '📤'}</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700' }}>{item.productName}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{item.date}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: item.type === '입고' ? '#10b981' : '#ef4444' }}>{item.type === '입고' ? '+' : '-'}{item.amount}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>잔고: {item.remaining}개</div>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>내역이 없습니다.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryTab;
