import React, { useMemo, useState } from 'react';
import Pagination from '../../../ui/Pagination';

const RidersTab = ({
  riders,
  stats,
  pageInfo,
  currentPage,
  itemsPerPage,
  setCurrentPage,
  searchInput,
  setSearchInput,
  onSearch,
  onOpenDetail
}) => {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const safeStats = stats || { total: riders.length, operating: 0, unavailable: 0, idCardPending: 0 };

  const filteredRiders = useMemo(() => {
    if (statusFilter === 'ALL') return riders;
    const active = statusFilter === 'ACTIVE';
    return riders.filter((rider) => {
      const isActive = rider.isActive ?? rider.status === '운행중';
      return isActive === active;
    });
  }, [riders, statusFilter]);

  const totalItems = statusFilter === 'ALL'
    ? (pageInfo?.totalElements ?? riders.length)
    : filteredRiders.length;

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {[
          { label: '전체 배달원', value: `${safeStats.total}명`, color: '#38bdf8' },
          { label: '운행 중', value: `${safeStats.operating}명`, color: '#10b981' },
          { label: '운행 불가', value: `${safeStats.unavailable}명`, color: '#ef4444' },
          { label: '신규 신청', value: `${safeStats.idCardPending}명`, color: '#f59e0b' }
        ].map((stat, i) => (
          <div key={i} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>{stat.label}</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>배달원 목록 및 관리</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="이름/연락처 검색..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ padding: '10px 16px', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '14px' }}
            />
            <button
              onClick={onSearch}
              style={{ padding: '10px 20px', borderRadius: '10px', backgroundColor: '#334155', border: 'none', color: 'white', fontWeight: '700', cursor: 'pointer' }}
            >
              검색
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[
            { key: 'ALL', label: '전체보기' },
            { key: 'ACTIVE', label: '운행중' },
            { key: 'INACTIVE', label: '운행정지' }
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setStatusFilter(item.key);
                setCurrentPage(1);
              }}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '700',
                backgroundColor: statusFilter === item.key ? '#334155' : 'transparent',
                color: statusFilter === item.key ? 'white' : '#94a3b8'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '14px' }}>
                <th style={{ padding: '16px' }}>라이더명 / 연락처</th>
                <th style={{ padding: '16px' }}>정산 계좌 정보</th>
                <th style={{ padding: '16px' }}>상태</th>
                <th style={{ padding: '16px' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredRiders.map((rider) => {
                const isActive = rider.isActive ?? rider.status === '운행중';
                const statusLabel = isActive ? '운행중' : '운행정지';
                return (
                  <tr key={rider.id} style={{ borderBottom: '1px solid #334155', fontSize: '15px' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: '700' }}>{rider.name}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{rider.phone}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '800' }}>{rider.bankName || '-'}</div>
                      <div style={{ fontSize: '12px', color: '#38bdf8' }}>
                        {rider.accountNumber || '-'} ({rider.accountHolder || '-'})
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        fontSize: '12px',
                        backgroundColor: isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: isActive ? '#10b981' : '#ef4444',
                        padding: '4px 10px', borderRadius: '6px', fontWeight: '800'
                      }}>{statusLabel}</span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <button
                        onClick={() => onOpenDetail(rider.id)}
                        style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: 'none', cursor: 'pointer', fontWeight: '800' }}
                      >상세정보</button>
                    </td>
                  </tr>
                );
              })}
              {filteredRiders.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    조건에 맞는 배달원이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
};

export default RidersTab;
