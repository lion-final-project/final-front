import React from 'react';

const HistoryTab = ({
  historyFilter,
  setHistoryFilter,
  expandedHistoryItems,
  toggleHistoryExpand,
  setSelectedReceipt,
  handleOpenReportModal,
}) => {
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
        {historyData.map((item) => (
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
};

export default HistoryTab;
