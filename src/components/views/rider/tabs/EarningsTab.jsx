import React from 'react';

const EarningsTab = ({ earnings, expandedSettlements, setExpandedSettlements }) => {
  const settlementRecords = [
    { date: '2026-01-19 ~ 2026-01-25', amount: '50,000원', status: '입금완료', type: '정산', details: '1월 4주차 배달 건수 (14건)' },
    { date: '2026-01-12 ~ 2026-01-18', amount: '120,000원', status: '입금완료', type: '정산', details: '1월 3주차 배달 건수 (32건)' },
    { date: '2026-01-05 ~ 2026-01-11', amount: '85,000원', status: '입금완료', type: '정산', details: '1월 2주차 배달 건수 (24건)' },
    { date: '2025-12-28 ~ 2026-01-04', amount: '92,000원', status: '입금완료', type: '정산', details: '1월 1주차 배달 건수 (26건)' }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>정산 내역</h2>
      <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', marginBottom: '32px', borderLeft: '4px solid #10b981' }}>
        <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '4px' }}>이번 주 정산 예정 금액</div>
        <div style={{ fontSize: '28px', fontWeight: '900', color: '#10b981' }}>{earnings.weekly.toLocaleString()}원</div>
        <div style={{ color: '#64748b', fontSize: '12px', marginTop: '6px' }}>정산일: 매주 수요일</div>
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #334155', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>정산 계좌</span>
          <span style={{ color: '#cbd5e1', fontWeight: '600' }}>카카오뱅크 3333-**-******</span>
        </div>
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>최근 정산 기록</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {settlementRecords.map((item, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div onClick={() => { const newSet = new Set(expandedSettlements); if (newSet.has(i)) newSet.delete(i); else newSet.add(i); setExpandedSettlements(newSet); }} style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px' }}>{item.amount} {item.type}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{item.date}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ color: item.status === '입금완료' ? '#2ecc71' : '#f59e0b', fontWeight: '800', fontSize: '13px' }}>{item.status}</div>
                <span style={{ fontSize: '10px', color: '#94a3b8', transform: expandedSettlements.has(i) ? 'rotate(180deg)' : 'none' }}>▼</span>
              </div>
            </div>
            {expandedSettlements.has(i) && (
              <div style={{ backgroundColor: '#0f172a', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', color: '#94a3b8', animation: 'fadeIn 0.2s' }}>{item.details}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EarningsTab;
