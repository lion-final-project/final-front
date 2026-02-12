import React from 'react';
import Pagination from '../../../ui/Pagination';

const UsersTab = ({
  users,
  stats,
  pageInfo,
  searchInput,
  setSearchInput,
  onSearch,
  expandedUserId,
  setExpandedUserId,
  currentPage,
  itemsPerPage,
  setCurrentPage,
  onOpenDetail
}) => {
  const userStats = [
    { label: '전체 고객', value: `${stats?.total ?? 0}명`, color: '#38bdf8' },
    { label: '활성 사용자', value: `${stats?.active ?? 0}명`, color: '#10b981' },
    { label: '금월 신규', value: `${stats?.newThisMonth ?? 0}명`, color: '#f59e0b' },
    { label: '정지 계정', value: `${stats?.suspended ?? 0}명`, color: '#ef4444' }
  ];

  const totalItems = pageInfo?.totalElements ?? users.length;

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {userStats.map((stat, i) => (
          <div key={i} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>{stat.label}</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>사용자 목록 및 상태 관리</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="고객명, 이메일, 연락처 검색..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ padding: '10px 16px', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '14px', width: '280px' }}
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
                <th style={{ padding: '16px' }}>고객명</th>
                <th style={{ padding: '16px' }}>이메일 / 연락처</th>
                <th style={{ padding: '16px' }}>주소 이력</th>
                <th style={{ padding: '16px' }}>주문 횟수</th>
                <th style={{ padding: '16px' }}>가입일</th>
                <th style={{ padding: '16px' }}>상태</th>
                <th style={{ padding: '16px' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #334155', fontSize: '14px' }}>
                  <td style={{ padding: '16px', fontWeight: '700' }}>{user.name}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ color: '#cbd5e1' }}>{user.email}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{user.phone}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ position: 'relative' }}>
                      <button onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                        style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '800' }}>
                        주소 {user.addresses?.length || 0}개 보기
                      </button>
                      {expandedUserId === user.id && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '12px', zIndex: 100, minWidth: '240px', marginTop: '8px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
                          {user.addresses?.map((addr, idx) => (
                            <div key={idx} style={{ fontSize: '12px', color: '#cbd5e1', padding: '8px 0', borderBottom: idx === user.addresses.length - 1 ? 'none' : '1px solid #334155' }}>{addr}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>{user.orders}건</td>
                  <td style={{ padding: '16px' }}>{user.join}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ fontSize: '11px', backgroundColor: user.status === '활성' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: user.status === '활성' ? '#10b981' : '#ef4444', padding: '4px 10px', borderRadius: '6px', fontWeight: '800' }}>{user.status}</span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button onClick={() => onOpenDetail(user.id)}
                      style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '12px' }}>상세정보</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
};

export default UsersTab;
