import React from 'react';

const OverviewTab = ({
  chartPeriod,
  setChartPeriod,
  setActiveTab,
  detailedSettlements,
  riderSettlements,
  reports,
  approvalItems,
  inquiryList,
}) => (
  <>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '40px' }}>
      <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>주문 거래액 리포트</h3>
          <div style={{ display: 'flex', background: '#0f172a', padding: '4px', borderRadius: '8px', gap: '4px' }}>
            {['weekly', 'monthly', 'yearly'].map(p => (
              <button
                key={p}
                onClick={() => setChartPeriod(p)}
                style={{
                  padding: '6px 12px', borderRadius: '6px', border: 'none', fontSize: '11px', fontWeight: '800', cursor: 'pointer',
                  backgroundColor: chartPeriod === p ? '#38bdf8' : 'transparent',
                  color: chartPeriod === p ? '#0f172a' : '#94a3b8'
                }}
              >
                {p === 'weekly' ? '주간' : p === 'monthly' ? '월간' : '연간'}
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '12px', padding: '10px' }}>
          {(chartPeriod === 'weekly' ? [40, 65, 50, 85, 70, 95, 60] : chartPeriod === 'monthly' ? [30, 45, 60, 55, 80, 95] : [55, 65, 80, 95]).map((height, i) => (
            <div key={i} style={{ flex: 1, height: `${height}%`, backgroundColor: '#38bdf8', borderRadius: '4px 4px 0 0', opacity: 0.6 + (height / 200) }} />
          ))}
        </div>
      </div>
      <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>활성 사용자 지표</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
          {[
            { label: '전체 고객', value: '12,504명' },
            { label: '등록 마트', value: '458개' },
            { label: '활동 배달원', value: '892명' },
            { label: '정산 현황 (미지급)', value: `${detailedSettlements.filter(s => s.status !== '지급 완료').length + riderSettlements.filter(s => s.status !== '지급 완료').length}건`, highlight: true, action: () => setActiveTab('settlements') },
            { label: '확인중인 신고수', value: `${reports.filter(r => r.status === '확인 중').length}개`, highlight: true, action: () => setActiveTab('reports') },
            { label: '처리완료 신고 수', value: `${reports.filter(r => r.status === '처리완료' || r.status === '답변완료').length}개`, highlight: true, action: () => setActiveTab('reports') },
            { label: '승인 대기', value: `${approvalItems.length}건`, highlight: true, action: () => setActiveTab('approvals') },
            { label: '미답변 1:1 문의', value: `${inquiryList.filter(inq => inq.status === '답변 대기').length}건`, highlight: true, action: () => setActiveTab('inquiry') }
          ].map((stat, i) => (
            <div
              key={i}
              onClick={stat.action}
              style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #334155', cursor: stat.action ? 'pointer' : 'default' }}
            >
              <span style={{ color: stat.highlight ? '#f59e0b' : '#94a3b8', fontWeight: stat.highlight ? '700' : 'normal' }}>{stat.label}</span>
              <span style={{ fontWeight: '700', color: stat.highlight ? '#f59e0b' : 'white' }}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>최근 신고/분쟁 현황</h2>
        <div onClick={() => setActiveTab('reports')} style={{ color: '#38bdf8', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}>상세 보기 →</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {[
          { label: '확인 대기 중', count: reports.filter(r => r.status === '확인 중').length, color: '#f59e0b' },
          { label: '처리 완료', count: reports.filter(r => r.status === '처리완료').length, color: '#10b981' },
          { label: '답변 완료', count: reports.filter(r => r.status === '답변완료').length, color: '#38bdf8' }
        ].map((stat, i) => (
          <div key={i} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>{stat.label}</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: stat.color }}>{stat.count}<span style={{ fontSize: '14px', color: '#64748b', marginLeft: '4px' }}>건</span></div>
          </div>
        ))}
      </div>
    </section>
  </>
);

export default OverviewTab;
