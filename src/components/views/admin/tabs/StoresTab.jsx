import React from 'react';
import Pagination from '../../../ui/Pagination';

const StoresTab = ({
  stores,
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
  const safeStats = stats || { total: stores.length, active: 0, inactive: 0, pending: 0 };
  const totalItems = pageInfo?.totalElements ?? stores.length;

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {[
          { label: '전체 마트', value: `${safeStats.total}개`, color: '#38bdf8' },
          { label: '운영 중', value: `${safeStats.active}개`, color: '#10b981' },
          { label: '비활성 마트', value: `${safeStats.inactive}개`, color: '#ef4444' },
          { label: '신규 신청', value: `${safeStats.pending ?? 0}건`, color: '#f59e0b' }
        ].map((stat, i) => (
          <div key={i} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>{stat.label}</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>마트 목록 및 관리</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="마트명으로 검색..."
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
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '14px' }}>
                <th style={{ padding: '16px' }}>마트명</th>
                <th style={{ padding: '16px' }}>지역</th>
                <th style={{ padding: '16px' }}>대표자</th>
                <th style={{ padding: '16px' }}>상태</th>
                <th style={{ padding: '16px' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => {
                const isActive = store.isActive ?? store.status === '정상';
                const statusLabel = isActive ? '운영중' : (store.status || '비활성');
                return (
                  <tr key={store.id} style={{ borderBottom: '1px solid #334155', fontSize: '15px' }}>
                    <td style={{ padding: '16px', fontWeight: '700' }}>{store.name}</td>
                    <td style={{ padding: '16px' }}>{store.loc}</td>
                    <td style={{ padding: '16px' }}>{store.rep}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        fontSize: '12px',
                        backgroundColor: isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: isActive ? '#10b981' : '#ef4444',
                        padding: '4px 10px', borderRadius: '6px', fontWeight: '800'
                      }}>● {statusLabel}</span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <button
                        onClick={() => onOpenDetail(store.id)}
                        style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: 'none', cursor: 'pointer', fontWeight: '800' }}
                      >상세정보</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
};

export default StoresTab;
