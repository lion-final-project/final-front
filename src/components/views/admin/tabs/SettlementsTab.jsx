import React from 'react';

const SettlementsTab = ({
  settlementFilter,
  setSettlementFilter,
  detailedSettlements,
  riderSettlements,
  settlementMonthFilter,
  setSettlementMonthFilter,
  settlementSearch,
  settlementStatusFilter,
  setSettlementSearch,
  setSettlementStatusFilter,
  handleExecuteSettlement,
}) => {
  const list = settlementFilter === 'STORE' ? detailedSettlements : riderSettlements;
  const filteredList = list.filter(
    s => (settlementStatusFilter === 'ALL' || s.status === settlementStatusFilter) &&
         (s.name.toLowerCase().includes(settlementSearch.toLowerCase()) || (s.id_code || '').toLowerCase().includes(settlementSearch.toLowerCase()))
  );
  const stats = settlementFilter === 'STORE'
    ? [
        { label: '정산 대상 마트', value: '128개소', trend: '+5%', color: '#38bdf8' },
        { label: '정산 완료 마트', value: '112개소', sub: '진행률 87.5%', color: '#10b981' },
        { label: '미지급 정산 건수', value: '16건', sub: '! 확인 필요', color: '#ef4444' },
        { label: '이번 달 정산 예정 총액', value: '₩452.0M', trend: '-4.2%', color: '#f59e0b' }
      ]
    : [
        { label: '정산 대상 배달원', value: '256명', trend: '+12%', color: '#38bdf8' },
        { label: '정산 완료 배달원', value: '230명', sub: '진행률 89.8%', color: '#10b981' },
        { label: '미지급 정산 건수', value: '26건', sub: '! 확인 필요', color: '#ef4444' },
        { label: '이번 달 정산 예정 총액', value: '₩84.5M', trend: '+8.5%', color: '#f59e0b' }
      ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setSettlementFilter('STORE')}
          style={{
            padding: '12px 24px', borderRadius: '14px',
            backgroundColor: settlementFilter === 'STORE' ? '#38bdf8' : '#1e293b',
            color: settlementFilter === 'STORE' ? '#0f172a' : '#94a3b8',
            border: settlementFilter === 'STORE' ? 'none' : '1px solid #334155',
            fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >🏛️ 마트 정산 관리 <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>{detailedSettlements.length}</span></button>
        <button
          onClick={() => setSettlementFilter('RIDER')}
          style={{
            padding: '12px 24px', borderRadius: '14px',
            backgroundColor: settlementFilter === 'RIDER' ? '#38bdf8' : '#1e293b',
            color: settlementFilter === 'RIDER' ? '#0f172a' : '#94a3b8',
            border: settlementFilter === 'RIDER' ? 'none' : '1px solid #334155',
            fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >🚲 배달원 정산 관리 <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>{riderSettlements.length}</span></button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>{stat.label}</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '12px', color: stat.color, marginTop: '8px', opacity: 0.8 }}>{stat.trend || stat.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{settlementFilter === 'STORE' ? '마트' : '배달원'}별 정산 추이</h3>
            <div style={{ color: '#10b981', fontWeight: '800' }}>{settlementFilter === 'STORE' ? '₩2,450.0M' : '₩420.0M'} <span style={{ fontSize: '12px' }}>+12.5%</span></div>
          </div>
          <div style={{ height: '200px', width: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 20px' }}>
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
              <path d="M0 150 Q 100 80, 200 120 T 400 60 T 600 100" fill="none" stroke={settlementFilter === 'STORE' ? '#3b82f6' : '#10b981'} strokeWidth="3" />
            </svg>
            {['6월', '7월', '8월', '9월', '10월', '11월'].map(month => (
              <div key={month} style={{ color: '#64748b', fontSize: '11px', marginTop: '10px' }}>{month}</div>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#38bdf8' }}>ℹ️</span> 정산 정책
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>수수료 / 매칭비</div>
              <div style={{ color: '#cbd5e1', fontWeight: '600' }}>{settlementFilter === 'STORE' ? '카드 결제액의 3.3%' : '건당 500원 매칭 수수료'}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>정산 주기 및 지급</div>
              <div style={{ color: '#cbd5e1', fontWeight: '600' }}>
                {settlementFilter === 'STORE' ? '정산 집계: 매월 10일 / 지급 일자: 매월 15일 (1개월 주기)' : '매주 금요일 (7일 주기)'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{settlementFilter === 'STORE' ? '마트별' : '배달원별'} 정산 현황</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => handleExecuteSettlement(settlementFilter)}
              style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#10b981', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer' }}
            >🚀 정산 실행</button>
            <input
              type="text"
              placeholder={settlementFilter === 'STORE' ? '마트명 검색' : '배달원 이름 검색'}
              value={settlementSearch}
              onChange={(e) => setSettlementSearch(e.target.value)}
              style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '13px', outline: 'none' }}
            />
            <select
              value={settlementMonthFilter}
              onChange={(e) => setSettlementMonthFilter(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '13px', outline: 'none' }}
            >
              <option value="2026-01">2026년 01월</option>
              <option value="2025-12">2025년 12월</option>
              <option value="2025-11">2025년 11월</option>
            </select>
            <select
              value={settlementStatusFilter}
              onChange={(e) => setSettlementStatusFilter(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '13px', outline: 'none' }}
            >
              <option value="ALL">정산 상태: 전체</option>
              <option value="지급 완료">지급 완료</option>
              <option value="지급 처리중">지급 처리중</option>
              <option value="승인 대기">승인 대기</option>
              <option value="지급 실패">지급 실패</option>
            </select>
          </div>
        </div>
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '13px' }}>
                <th style={{ padding: '16px' }}>{settlementFilter === 'STORE' ? '마트 정보' : '배달원 정보'}</th>
                <th style={{ padding: '16px' }}>지역</th>
                <th style={{ padding: '16px' }}>총 정산액</th>
                <th style={{ padding: '16px' }}>지급 예정일</th>
                <th style={{ padding: '16px' }}>지급 상태</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #334155', fontSize: '14px' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '700' }}>{s.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>ID: {s.id_code}</div>
                  </td>
                  <td style={{ padding: '16px', color: '#cbd5e1' }}>{s.region}</td>
                  <td style={{ padding: '16px', fontWeight: '800' }}>₩{s.amount.toLocaleString()}</td>
                  <td style={{ padding: '16px', color: '#94a3b8' }}>{s.date}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', backgroundColor: `${s.color}20`, color: s.color }}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SettlementsTab;
