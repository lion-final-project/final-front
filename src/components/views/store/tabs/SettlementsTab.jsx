import React from 'react';

const settlementRows = [
  { id: '#ORD-2026-9901', type: '구독주문', date: '01월 28일 14:32', amount: '₩124,500', fee: '-₩9,960', refund: '해당없음', status: '반영됨', net: '₩114,540' },
  { id: '#ORD-2026-9895', type: '일반주문', date: '01월 28일 12:15', amount: '₩86,200', fee: '-₩6,900', refund: '부분 환불', status: '반영됨', net: '₩79,300' },
  { id: '#ORD-2026-9892', type: '구독주문', date: '01월 28일 10:44', amount: '₩210,000', fee: '-₩16,800', refund: '해당없음', status: '반영됨', net: '₩193,200' },
];

const SettlementsTab = ({
  selectedSettlementPeriod,
  setSelectedSettlementPeriod,
  isPeriodSelectorOpen,
  setIsPeriodSelectorOpen,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
      <div
        onClick={() => setIsPeriodSelectorOpen(!isPeriodSelectorOpen)}
        style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'white', padding: '10px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', position: 'relative', zIndex: 100 }}
      >
        <span style={{ fontSize: '18px' }}>📅</span>
        <span style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>{selectedSettlementPeriod} 정산 내역</span>
        <span style={{ fontSize: '12px', color: '#94a3b8', transform: isPeriodSelectorOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
        {isPeriodSelectorOpen && (
          <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, width: '100%', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden', zIndex: 101 }}>
            {['2026년 1월', '2025년 12월', '2025년 11월', '2025년 10월'].map((period) => (
              <div key={period} onClick={(e) => { e.stopPropagation(); setSelectedSettlementPeriod(period); setIsPeriodSelectorOpen(false); }} style={{ padding: '12px 20px', fontSize: '14px', fontWeight: '700', color: selectedSettlementPeriod === period ? 'var(--primary)' : '#475569', backgroundColor: selectedSettlementPeriod === period ? '#f0fdf4' : 'white', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>
                {period}
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ecfdf5', color: '#10b981', padding: '8px 16px', borderRadius: '30px', fontWeight: '800', fontSize: '14px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
        정산 확정
      </div>
    </div>

    <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <div style={{ width: '28px', height: '28px', backgroundColor: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '14px' }}>💳</div>
        <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>결제 구조 요약</h3>
      </div>
      <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 32px 40px' }}>전체 주문 중 일반 주문과 구독 주문의 비중을 확인합니다.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '32px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', fontWeight: '700' }}>
            <span style={{ color: '#475569' }}>매출 비중</span>
            <div><span style={{ color: '#3b82f6' }}>● 일반 68%</span><span style={{ color: '#8b5cf6', marginLeft: '16px' }}>● 구독 32%</span></div>
          </div>
          <div style={{ height: '12px', width: '100%', backgroundColor: '#f1f5f9', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: '68%', height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}></div>
            <div style={{ width: '32%', height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)' }}></div>
          </div>
        </div>
        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#8b5cf6', marginBottom: '8px' }}>일반 주문 수</div>
          <div style={{ fontSize: '24px', fontWeight: '900' }}>168 <span style={{ fontSize: '14px', fontWeight: '600', color: '#94a3b8' }}>건</span></div>
        </div>
        <div style={{ backgroundColor: '#f5f3ff', padding: '20px', borderRadius: '20px', border: '1px solid #ede9fe' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#8b5cf6', marginBottom: '8px' }}>구독 주문 수</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#8b5cf6' }}>80 <span style={{ fontSize: '14px', fontWeight: '600', color: '#a78bfa' }}>건</span></div>
        </div>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
      {[
        { label: '총 결제 금액', value: '₩18,290,500', sub: '↗12% 전월 대비', color: '#1e293b', subColor: '#10b981' },
        { label: '플랫폼 수수료 합계', value: '-₩1,463,240', sub: '고정 8% 플랫폼 수수료 적용', color: '#ef4444', subColor: '#94a3b8' },
        { label: '환불/취소 금액', value: '-₩342,100', sub: '4건의 취소 내역 반영', color: '#94a3b8', subColor: '#94a3b8' },
        { label: '최종 정산 예정 금액', value: '₩16,485,160', sub: '🗓️ 2월 1일 지급 예정', color: '#ffffff', subColor: '#ffffff', highlight: true },
      ].map((card, i) => (
        <div key={i} style={{ background: card.highlight ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'white', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9', color: card.color, boxShadow: card.highlight ? '0 10px 20px rgba(37, 99, 235, 0.2)' : 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: card.highlight ? 'rgba(255,255,255,0.8)' : '#64748b' }}>{card.label}</div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px' }}>{card.value}</div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: card.subColor }}>{card.sub}</div>
          </div>
        </div>
      ))}
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
      {[
        { label: '총 주문 건수', value: '248 건', icon: '🛍️' },
        { label: '환불 건수', value: '4 건', icon: '🔄' },
        { label: '평균 주문 금액', value: '₩73,750', icon: '💳' },
        { label: '매출 증감률', value: '+8.4%', icon: '📈' },
      ].map((stat, i) => (
        <div key={i} style={{ background: 'white', padding: '16px 24px', borderRadius: '20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{stat.icon}</div>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>{stat.label}</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: i === 3 ? '#10b981' : '#1e293b' }}>{stat.value}</div>
          </div>
        </div>
      ))}
    </div>

    <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>주문별 정산 내역</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <input type="text" placeholder="주문 번호 검색..." style={{ padding: '12px 16px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '280px', fontSize: '14px' }} />
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
          </div>
          <button style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ fontSize: '18px' }}>⚖️</span></button>
        </div>
      </div>
      <div className="table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>
              <th style={{ padding: '16px' }}>주문 번호</th>
              <th style={{ padding: '16px' }}>유형</th>
              <th style={{ padding: '16px' }}>주문 일시</th>
              <th style={{ padding: '16px', textAlign: 'right' }}>결제 금액</th>
              <th style={{ padding: '16px', textAlign: 'right' }}>수수료 (8%)</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>환불 여부</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>정산 반영</th>
              <th style={{ padding: '16px', textAlign: 'right' }}>정산 금액</th>
            </tr>
          </thead>
          <tbody>
            {settlementRows.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px', transition: 'background 0.2s' }} className="hover-row">
                <td style={{ padding: '16px', fontWeight: '800' }}>{row.id}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ backgroundColor: row.type === '구독주문' ? '#f5f3ff' : '#f1f5f9', color: row.type === '구독주문' ? '#8b5cf6' : '#64748b', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>{row.type}</span>
                </td>
                <td style={{ padding: '16px', color: '#64748b' }}>{row.date}</td>
                <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700' }}>{row.amount}</td>
                <td style={{ padding: '16px', textAlign: 'right', color: '#ef4444', fontWeight: '600' }}>{row.fee}</td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{ backgroundColor: row.refund === '해당없음' ? '#f1f5f9' : '#fff1f2', color: row.refund === '해당없음' ? '#94a3b8' : '#e11d48', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>{row.refund}</span>
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#10b981', fontWeight: '800', fontSize: '12px' }}><span style={{ fontSize: '14px' }}>✅</span> 반영됨</div>
                </td>
                <td style={{ padding: '16px', textAlign: 'right', fontWeight: '900' }}>{row.net}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default SettlementsTab;
