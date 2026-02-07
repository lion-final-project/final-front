import React from 'react';

const PaymentsTab = ({
  paymentMonthFilter, setPaymentMonthFilter, paymentHistory,
  paymentSearch, paymentRegionFilter, setPaymentSearch, setPaymentRegionFilter,
}) => {
  const filteredHistory = paymentHistory.filter(p =>
    (paymentRegionFilter === 'ALL' || p.region === paymentRegionFilter) &&
    p.mart.toLowerCase().includes(paymentSearch.toLowerCase())
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <select value={paymentMonthFilter} onChange={(e) => setPaymentMonthFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: 'white', fontSize: '13px', outline: 'none' }}>
          <option value="2026-01">2026년 01월</option>
          <option value="2025-12">2025년 12월</option>
          <option value="2025-11">2025년 11월</option>
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {[{ label: '총 결제 금액 (GMV)', value: '1,250,400,000', trend: '+12.5%', isPos: true }, { label: '플랫폼 수수료 수익', value: '125,040,000', trend: '+8.2%', isPos: true }, { label: '환불 금액', value: '12,300,000', trend: '-2.1%', isPos: false }, { label: '순이익', value: '112,740,000', trend: '+10.4%', isPos: true, highlight: true }].map((stat, i) => (
          <div key={i} style={{ backgroundColor: stat.highlight ? 'rgba(56, 189, 248, 0.05)' : '#1e293b', border: stat.highlight ? '1px solid #38bdf8' : '1px solid #334155', padding: '24px', borderRadius: '20px' }}>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>{stat.label}</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: stat.highlight ? '#38bdf8' : 'white' }}>₩{stat.value}</div>
            <div style={{ fontSize: '12px', color: stat.isPos ? '#10b981' : '#ef4444', marginTop: '8px', fontWeight: '700' }}>{stat.isPos ? '↗' : '↘'} {stat.trend} 전월 대비</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '32px' }}>매출 구조 비중</h3>
          <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 40px' }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#1e293b" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#3b82f6" strokeWidth="3.8" strokeDasharray="65 35" strokeDashoffset="0" />
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#60a5fa" strokeWidth="3.8" strokeDasharray="35 65" strokeDashoffset="-65" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '900', color: 'white' }}>35%</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>SUBSCRIPTION</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94a3b8' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }}></span> 일반 매출</span>
              <span style={{ fontWeight: '700' }}>65%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94a3b8' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#60a5fa' }}></span> 구독 매출</span>
              <span style={{ fontWeight: '700' }}>35%</span>
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>마트별 매출 요약</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select value={paymentRegionFilter} onChange={(e) => setPaymentRegionFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '13px', outline: 'none' }}>
                <option value="ALL">지역 전체</option>
                <option value="서울">서울</option>
                <option value="경기">경기</option>
              </select>
              <input type="text" placeholder="마트명 검색" value={paymentSearch} onChange={(e) => setPaymentSearch(e.target.value)} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '13px', outline: 'none' }} />
            </div>
          </div>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '13px' }}>
                  <th style={{ padding: '16px' }}>지역</th>
                  <th style={{ padding: '16px' }}>카테고리</th>
                  <th style={{ padding: '16px' }}>마트명</th>
                  <th style={{ padding: '16px' }}>총 결제 금액</th>
                  <th style={{ padding: '16px' }}>수수료 수익</th>
                  <th style={{ padding: '16px' }}>상태</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #334155', fontSize: '14px' }}>
                    <td style={{ padding: '16px', color: '#cbd5e1' }}>{p.region}</td>
                    <td style={{ padding: '16px', color: '#94a3b8' }}>{p.category}</td>
                    <td style={{ padding: '16px', fontWeight: '700' }}>{p.mart}</td>
                    <td style={{ padding: '16px', fontWeight: '800' }}>₩{p.amount.toLocaleString()}</td>
                    <td style={{ padding: '16px', color: '#38bdf8', fontWeight: '800' }}>₩{p.commission.toLocaleString()}</td>
                    <td style={{ padding: '16px' }}><span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800', backgroundColor: p.status === '지급완료' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: p.status === '지급완료' ? '#10b981' : '#f59e0b' }}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsTab;
