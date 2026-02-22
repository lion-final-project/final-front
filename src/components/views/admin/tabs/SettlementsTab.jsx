import React, { useMemo, useState } from 'react';
import Pagination from '../../../ui/Pagination';

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
  handleExecuteSingleSettlement,
  settlementSummary,
  settlementTrend,
  riderSettlementSummary,
  riderSettlementTrend,
  pageInfo,
  currentPage,
  itemsPerPage,
  setCurrentPage,
}) => {
  const [selectedItem, setSelectedItem] = useState(null);

  const currentMode = settlementFilter;
  const list = currentMode === 'STORE' ? detailedSettlements : riderSettlements;
  const keyword = settlementSearch.toLowerCase();

  const filteredList = list.filter(
    (item) =>
      (settlementStatusFilter === 'ALL' || item.status === settlementStatusFilter) &&
      ((item.name || '').toLowerCase().includes(keyword) || (item.id_code || '').toLowerCase().includes(keyword))
  );
  const statusSummary =
    currentMode === 'STORE'
      ? {
          completed: Number(settlementSummary?.completedTargets ?? 0),
          pending: Number(settlementSummary?.pendingTargets ?? 0),
          failed: Number(settlementSummary?.failedTargets ?? 0),
          total: Number(settlementSummary?.totalTargets ?? 0),
          completedRate: Number(settlementSummary?.completedRate ?? 0),
        }
      : {
          completed: Number(riderSettlementSummary?.completedTargets ?? 0),
          pending: Number(riderSettlementSummary?.pendingTargets ?? 0),
          failed: Number(riderSettlementSummary?.failedTargets ?? 0),
          total: Number(riderSettlementSummary?.totalTargets ?? 0),
          completedRate: Number(riderSettlementSummary?.completedRate ?? 0),
        };

  const stats =
    currentMode === 'STORE'
      ? [
          { label: '정산 대상 마트', value: `${formatNumber(settlementSummary?.totalTargets)}개`, color: '#38bdf8' },
          {
            label: '정산 완료 마트',
            value: `${formatNumber(settlementSummary?.completedTargets)}개`,
            sub: `진행률 ${settlementSummary?.completedRate || 0}%`,
            color: '#10b981',
          },
          { label: '미지급 정산 건수', value: `${formatNumber(settlementSummary?.pendingTargets)}건`, sub: '확인 필요', color: '#ef4444' },
          { label: '이번 달 정산 예정 총액', value: `₩${formatNumber(settlementSummary?.totalSettlementAmount)}`, color: '#f59e0b' },
        ]
      : [
          { label: '정산 대상 라이더', value: `${formatNumber(riderSettlementSummary?.totalTargets ?? riderSettlements.length)}명`, color: '#38bdf8' },
          {
            label: '정산 완료 라이더',
            value: `${formatNumber(riderSettlementSummary?.completedTargets ?? riderSettlements.filter((item) => item.status === '지급 완료').length)}명`,
            sub: `진행률 ${riderSettlementSummary?.completedRate || 0}%`,
            color: '#10b981',
          },
          {
            label: '미지급 정산 건수',
            value: `${formatNumber(riderSettlementSummary?.pendingTargets ?? riderSettlements.filter((item) => item.status !== '지급 완료').length)}건`,
            color: '#ef4444',
          },
          {
            label: '이번 달 정산 예정 총액',
            value: `₩${formatNumber(riderSettlementSummary?.totalSettlementAmount ?? riderSettlements.reduce((sum, item) => sum + (item.amount || 0), 0))}`,
            color: '#f59e0b',
          },
        ];

  const trendData = useMemo(() => {
    const raw = currentMode === 'STORE' ? settlementTrend : riderSettlementTrend;
    const labels = raw?.xLabels || [];
    const values = raw?.yValues || [];
    const rows = labels.map((label, idx) => ({ label, amount: Number(values[idx] || 0) }));
    const totalAmount = Number(raw?.totalAmount || rows.reduce((sum, row) => sum + row.amount, 0));
    const changeRate = Number(raw?.changeRate || 0);
    const avgAmount = rows.length ? Math.round(totalAmount / rows.length) : 0;
    const maxRow = rows.reduce((max, row) => (row.amount > max.amount ? row : max), { label: '-', amount: 0 });
    return { rows, totalAmount, changeRate, avgAmount, maxRow };
  }, [currentMode, settlementTrend, riderSettlementTrend]);

  const monthOptions = buildMonthOptions(6);
  const totalItems = pageInfo?.totalElements ?? filteredList.length;

  const getBaseYearMonth = (item) => {
    if (item?.periodStart && typeof item.periodStart === 'string' && item.periodStart.length >= 7) {
      return item.periodStart.slice(0, 7);
    }
    if (item?.periodEnd && typeof item.periodEnd === 'string' && item.periodEnd.length >= 7) {
      return item.periodEnd.slice(0, 7);
    }
    return settlementMonthFilter;
  };

  const getRiskReason = (item) => {
    if (item.status === '지급 실패') return '계좌/데이터 확인 필요';
    if (item.status === '확인 대기') return '관리자 확인 대기';
    if (item.status === '지급 처리중') return '지급 배치 진행 중';
    return '정상';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setSettlementFilter('STORE')}
          style={{
            padding: '12px 24px',
            borderRadius: '14px',
            backgroundColor: currentMode === 'STORE' ? '#38bdf8' : '#1e293b',
            color: currentMode === 'STORE' ? '#0f172a' : '#94a3b8',
            border: currentMode === 'STORE' ? 'none' : '1px solid #334155',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          마트 정산 관리
          <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>{detailedSettlements.length}</span>
        </button>
        <button
          onClick={() => setSettlementFilter('RIDER')}
          style={{
            padding: '12px 24px',
            borderRadius: '14px',
            backgroundColor: currentMode === 'RIDER' ? '#38bdf8' : '#1e293b',
            color: currentMode === 'RIDER' ? '#0f172a' : '#94a3b8',
            border: currentMode === 'RIDER' ? 'none' : '1px solid #334155',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          라이더 정산 관리
          <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>{riderSettlements.length}</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>{stat.label}</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '12px', color: stat.color, marginTop: '8px', opacity: 0.8 }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '12px 14px' }}>
          <div style={{ color: '#94a3b8', fontSize: '12px' }}>지급 완료율</div>
          <div style={{ marginTop: '4px', color: '#10b981', fontSize: '18px', fontWeight: 800 }}>
            {statusSummary.completedRate}%
          </div>
          <div style={{ marginTop: '4px', color: '#64748b', fontSize: '11px' }}>기준월: {settlementMonthFilter}</div>
        </div>
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '12px 14px' }}>
          <div style={{ color: '#94a3b8', fontSize: '12px' }}>지급 대기/처리중</div>
          <div style={{ marginTop: '4px', color: '#f59e0b', fontSize: '18px', fontWeight: 800 }}>{formatNumber(statusSummary.pending)}건</div>
        </div>
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '12px 14px' }}>
          <div style={{ color: '#94a3b8', fontSize: '12px' }}>실패 건수</div>
          <div style={{ marginTop: '4px', color: '#ef4444', fontSize: '18px', fontWeight: 800 }}>{formatNumber(statusSummary.failed)}건</div>
        </div>
      </div>

      <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>
            {currentMode === 'STORE' ? '마트별 정산 추이 요약' : '라이더별 정산 추이 요약'}
          </h3>
          <div style={{ color: '#10b981', fontWeight: '800' }}>합계 ₩{formatNumber(trendData.totalAmount)}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '14px 16px' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>월 평균 정산액</div>
            <div style={{ marginTop: '6px', fontSize: '20px', fontWeight: '900', color: '#38bdf8' }}>₩{formatNumber(trendData.avgAmount)}</div>
          </div>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '14px 16px' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>최대 정산 월</div>
            <div style={{ marginTop: '6px', fontSize: '20px', fontWeight: '900', color: '#f59e0b' }}>{trendData.maxRow.label}</div>
            <div style={{ marginTop: '4px', fontSize: '12px', color: '#cbd5e1' }}>₩{formatNumber(trendData.maxRow.amount)}</div>
          </div>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '14px 16px' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>증감률</div>
            <div style={{ marginTop: '6px', fontSize: '20px', fontWeight: '900', color: trendData.changeRate >= 0 ? '#10b981' : '#ef4444' }}>
              {trendData.changeRate >= 0 ? '+' : ''}{trendData.changeRate}%
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '10px' }}>
          {(trendData.rows.length ? trendData.rows : [{ label: '-', amount: 0 }]).map((row) => (
            <div key={row.label} style={{ backgroundColor: '#111827', border: '1px solid #334155', borderRadius: '12px', padding: '10px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{row.label}</div>
              <div style={{ marginTop: '4px', fontSize: '14px', color: '#e2e8f0', fontWeight: 700 }}>₩{formatNumber(row.amount)}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>
            {currentMode === 'STORE' ? '마트별 정산 현황' : '라이더별 정산 현황'}
          </h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => handleExecuteSettlement(currentMode)}
              style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#10b981', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer' }}
            >
              일괄 정산
            </button>
            <input
              type='text'
              placeholder={currentMode === 'STORE' ? '마트명 검색' : '라이더 이름 검색'}
              value={settlementSearch}
              onChange={(e) => setSettlementSearch(e.target.value)}
              style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '13px', outline: 'none' }}
            />
            <select
              value={settlementMonthFilter}
              onChange={(e) => setSettlementMonthFilter(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '13px', outline: 'none' }}
            >
              {monthOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              value={settlementStatusFilter}
              onChange={(e) => setSettlementStatusFilter(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '13px', outline: 'none' }}
            >
              <option value='ALL'>정산 상태: 전체</option>
              <option value='지급 완료'>지급 완료</option>
              <option value='지급 처리중'>지급 처리중</option>
              <option value='확인 대기'>확인 대기</option>
              <option value='지급 실패'>지급 실패</option>
            </select>
          </div>
        </div>
        <div className='table-responsive'>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '13px' }}>
                <th style={{ padding: '16px' }}>{currentMode === 'STORE' ? '마트 정보' : '라이더 정보'}</th>
                <th style={{ padding: '16px' }}>지역</th>
                <th style={{ padding: '16px' }}>정산 기간</th>
                <th style={{ padding: '16px' }}>총 정산액</th>
                <th style={{ padding: '16px' }}>지급일</th>
                <th style={{ padding: '16px' }}>지급 상태</th>
                <th style={{ padding: '16px' }}>위험/사유</th>
                <th style={{ padding: '16px' }}>개별 정산</th>
                <th style={{ padding: '16px' }}>세부사항</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #334155', fontSize: '14px', backgroundColor: item.status === '지급 실패' ? 'rgba(239,68,68,0.08)' : 'transparent' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '700' }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>기준월: {getBaseYearMonth(item)}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>ID: {item.id_code}</div>
                    {item.contact && item.contact !== '-' && <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>연락처: {item.contact}</div>}
                  </td>
                  <td style={{ padding: '16px', color: '#cbd5e1' }}>{item.region}</td>
                  <td style={{ padding: '16px', color: '#cbd5e1', fontSize: '13px' }}>
                    {item.periodStart && item.periodEnd ? `${item.periodStart} ~ ${item.periodEnd}` : '-'}
                  </td>
                  <td style={{ padding: '16px', fontWeight: '800' }}>₩{formatNumber(item.amount)}</td>
                  <td style={{ padding: '16px', color: '#94a3b8' }}>{item.settledAt || item.date || '-'}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', backgroundColor: `${item.color}20`, color: item.color }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: '#cbd5e1', fontSize: '12px' }}>{getRiskReason(item)}</td>
                  <td style={{ padding: '16px' }}>
                    <button
                      onClick={() => handleExecuteSingleSettlement(currentMode, item.id)}
                      disabled={item.status === '지급 완료'}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: item.status === '지급 완료' ? '#334155' : '#10b981',
                        color: 'white',
                        border: 'none',
                        fontWeight: '700',
                        cursor: item.status === '지급 완료' ? 'not-allowed' : 'pointer',
                      }}
                    >
                      개별 정산
                    </button>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button
                      onClick={() => setSelectedItem(item)}
                      style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid #334155', fontWeight: '700', cursor: 'pointer' }}
                    >
                      세부사항
                    </button>
                  </td>
                </tr>
              ))}
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                    조회된 정산 데이터가 없습니다. 기간을 변경하거나 상태 필터를 전체로 바꿔보세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
      </div>

      {selectedItem && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2200, background: 'rgba(2,6,23,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '520px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>정산 세부내역</h4>
              <button onClick={() => setSelectedItem(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ display: 'grid', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#94a3b8' }}>구분</span><strong>{currentMode === 'STORE' ? '마트' : '라이더'}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#94a3b8' }}>대상명</span><strong>{selectedItem.name}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#94a3b8' }}>식별코드</span><strong>{selectedItem.id_code}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#94a3b8' }}>정산 상태</span><strong>{selectedItem.status}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#94a3b8' }}>정산 금액</span><strong>₩{formatNumber(selectedItem.amount)}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#94a3b8' }}>정산 기간</span><strong>{selectedItem.periodStart && selectedItem.periodEnd ? `${selectedItem.periodStart} ~ ${selectedItem.periodEnd}` : '-'}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#94a3b8' }}>지급일</span><strong>{selectedItem.settledAt || selectedItem.date || '-'}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#94a3b8' }}>지역</span><strong>{selectedItem.region}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#94a3b8' }}>점검 사유</span><strong>{getRiskReason(selectedItem)}</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettlementsTab;
