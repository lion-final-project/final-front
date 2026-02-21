import React from 'react';

const formatNumber = (value) => Number(value || 0).toLocaleString();

const buildMonthOptions = (count = 6) => {
  const now = new Date();
  const options = [];
  for (let i = 0; i < count; i += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    options.push(`${year}-${month}`);
  }
  return options;
};

const normalizeStatus = (status) => {
  if (!status) return '확인 대기';
  if (status === 'COMPLETED') return '지급 완료';
  if (status === 'PENDING') return '지급 처리중';
  if (status === 'FAILED') return '지급 실패';
  return status;
};

const PaymentsTab = ({
  paymentMonthFilter,
  setPaymentMonthFilter,
  paymentHistory,
  paymentSearch,
  paymentRegionFilter,
  setPaymentSearch,
  setPaymentRegionFilter,
  paymentSummary,
}) => {
  const filteredHistory = paymentHistory.filter(
    (item) =>
      (paymentRegionFilter === 'ALL' || item.region === paymentRegionFilter) &&
      item.mart.toLowerCase().includes(paymentSearch.toLowerCase())
  );

  const gross = paymentSummary?.grossPaymentAmount || 0;
  const commission = paymentSummary?.platformFeeRevenue || 0;
  const refund = paymentSummary?.refundAmount || 0;
  const net = paymentSummary?.netRevenue || 0;

  const regular = paymentSummary?.regularSalesAmount || 0;
  const subscription = paymentSummary?.subscriptionSalesAmount || 0;
  const totalStructure = regular + subscription;
  const regularRatio = totalStructure === 0 ? 0 : Math.round((regular / totalStructure) * 100);
  const subscriptionRatio = totalStructure === 0 ? 0 : 100 - regularRatio;

  const dynamicRegions = Array.from(new Set(paymentHistory.map((item) => item.region).filter(Boolean)));
  const monthOptions = buildMonthOptions(6);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <select
          value={paymentMonthFilter}
          onChange={(e) => setPaymentMonthFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: 'white', fontSize: '13px', outline: 'none' }}
        >
          {monthOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {[
          { label: '총 결제 금액 (GMV)', value: gross, color: 'white' },
          { label: '플랫폼 수수료 수익', value: commission, color: '#38bdf8' },
          { label: '환불 금액', value: refund, color: '#ef4444' },
          { label: '순매출', value: net, color: '#38bdf8', highlight: true },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              backgroundColor: stat.highlight ? 'rgba(56, 189, 248, 0.05)' : '#1e293b',
              border: stat.highlight ? '1px solid #38bdf8' : '1px solid #334155',
              padding: '24px',
              borderRadius: '20px',
            }}
          >
            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>{stat.label}</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: stat.color }}>₩{formatNumber(stat.value)}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '32px' }}>매출 구조 비중</h3>
          <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 40px' }}>
            <svg viewBox='0 0 36 36' style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx='18' cy='18' r='15.915' fill='transparent' stroke='#1e293b' strokeWidth='3' />
              <circle cx='18' cy='18' r='15.915' fill='transparent' stroke='#3b82f6' strokeWidth='3.8' strokeDasharray={`${regularRatio} ${100 - regularRatio}`} strokeDashoffset='0' />
              <circle cx='18' cy='18' r='15.915' fill='transparent' stroke='#60a5fa' strokeWidth='3.8' strokeDasharray={`${subscriptionRatio} ${100 - subscriptionRatio}`} strokeDashoffset={`-${regularRatio}`} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '900', color: 'white' }}>{subscriptionRatio}%</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>구독 매출 비중</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94a3b8' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }} /> 일반 매출
              </span>
              <span style={{ fontWeight: '700' }}>{regularRatio}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94a3b8' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#60a5fa' }} /> 구독 매출
              </span>
              <span style={{ fontWeight: '700' }}>{subscriptionRatio}%</span>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>마트별 결제 요약</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select
                value={paymentRegionFilter}
                onChange={(e) => setPaymentRegionFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '13px', outline: 'none' }}
              >
                <option value='ALL'>지역 전체</option>
                {dynamicRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
              <input
                type='text'
                placeholder='마트명 검색'
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '13px', outline: 'none' }}
              />
            </div>
          </div>
          <div className='table-responsive'>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '13px' }}>
                  <th style={{ padding: '16px' }}>지역</th>
                  <th style={{ padding: '16px' }}>카테고리</th>
                  <th style={{ padding: '16px' }}>마트명</th>
                  <th style={{ padding: '16px' }}>총 결제 금액</th>
                  <th style={{ padding: '16px' }}>수수료 수익</th>
                  <th style={{ padding: '16px' }}>환불 금액</th>
                  <th style={{ padding: '16px' }}>상태</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item, i) => {
                  const status = normalizeStatus(item.status);
                  const isDone = status === '지급 완료';
                  const isFailed = status === '지급 실패';
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #334155', fontSize: '14px' }}>
                      <td style={{ padding: '16px', color: '#cbd5e1' }}>{item.region}</td>
                      <td style={{ padding: '16px', color: '#94a3b8' }}>{item.category}</td>
                      <td style={{ padding: '16px', fontWeight: '700' }}>{item.mart}</td>
                      <td style={{ padding: '16px', fontWeight: '800' }}>₩{formatNumber(item.amount)}</td>
                      <td style={{ padding: '16px', color: '#38bdf8', fontWeight: '800' }}>₩{formatNumber(item.commission)}</td>
                      <td style={{ padding: '16px', color: '#ef4444', fontWeight: '700' }}>₩{formatNumber(item.refundAmount)}</td>
                      <td style={{ padding: '16px' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '800',
                            backgroundColor: isDone ? 'rgba(16, 185, 129, 0.1)' : isFailed ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            color: isDone ? '#10b981' : isFailed ? '#ef4444' : '#f59e0b',
                          }}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsTab;
