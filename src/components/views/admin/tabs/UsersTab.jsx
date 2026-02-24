import React, { useMemo, useState } from 'react';
import Pagination from '../../../ui/Pagination';

const T = {
  title: '\uC0AC\uC6A9\uC790 \uBAA9\uB85D \uBC0F \uC0C1\uD0DC \uAD00\uB9AC',
  searchPlaceholder: '\uACE0\uAC1D\uBA85, \uC774\uBA54\uC77C, \uC5F0\uB77D\uCC98 \uAC80\uC0C9...',
  search: '\uAC80\uC0C9',
  all: '\uC804\uCCB4\uBCF4\uAE30',
  active: '\uD65C\uC131',
  inactive: '\uBE44\uD65C\uC131',
  totalCustomer: '\uC804\uCCB4 \uACE0\uAC1D',
  activeUser: '\uD65C\uC131 \uC0AC\uC6A9\uC790',
  newThisMonth: '\uC774\uBC88\uB2EC \uC2E0\uADDC',
  inactiveAccount: '\uBE44\uD65C\uC131 \uACC4\uC815',
  countSuffix: '\uBA85',
  thName: '\uACE0\uAC1D\uBA85',
  thContact: '\uC774\uBA54\uC77C / \uC5F0\uB77D\uCC98',
  thAddressHistory: '\uC8FC\uC18C \uC774\uB825',
  thOrderCount: '\uC8FC\uBB38 \uD69F\uC218',
  thJoinDate: '\uAC00\uC785\uC77C',
  thStatus: '\uC0C1\uD0DC',
  thManage: '\uAD00\uB9AC',
  addressView: '\uC8FC\uC18C',
  addressViewSuffix: '\uAC1C \uBCF4\uAE30',
  noAddress: '\uB4F1\uB85D\uB41C \uC8FC\uC18C\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.',
  orderSuffix: '\uAC74',
  detail: '\uC0C1\uC138\uC815\uBCF4',
  empty: '\uC870\uAC74\uC5D0 \uB9DE\uB294 \uC0AC\uC6A9\uC790\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.'
};

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
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredUsers = useMemo(() => {
    if (statusFilter === 'ALL') return users;
    return users.filter((user) => {
      if (statusFilter === 'ACTIVE') {
        return user.rawStatus === 'ACTIVE' || user.status === T.active;
      }
      if (statusFilter === 'INACTIVE') {
        return ['INACTIVE', 'SUSPENDED'].includes(user.rawStatus) || user.status === T.inactive;
      }
      return true;
    });
  }, [users, statusFilter]);

  const inactiveCount = stats?.inactive ?? stats?.suspended ?? 0;
  const userStats = [
    { label: T.totalCustomer, value: `${stats?.total ?? 0}${T.countSuffix}`, color: '#38bdf8' },
    { label: T.activeUser, value: `${stats?.active ?? 0}${T.countSuffix}`, color: '#10b981' },
    { label: T.newThisMonth, value: `${stats?.newThisMonth ?? 0}${T.countSuffix}`, color: '#f59e0b' },
    { label: T.inactiveAccount, value: `${inactiveCount}${T.countSuffix}`, color: '#ef4444' }
  ];

  const totalItems = statusFilter === 'ALL'
    ? (pageInfo?.totalElements ?? users.length)
    : filteredUsers.length;

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') onSearch();
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>{T.title}</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder={T.searchPlaceholder}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ padding: '10px 16px', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '14px', width: '280px' }}
            />
            <button
              onClick={onSearch}
              style={{ padding: '10px 20px', borderRadius: '10px', backgroundColor: '#334155', border: 'none', color: 'white', fontWeight: '700', cursor: 'pointer' }}
            >
              {T.search}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[
            { key: 'ALL', label: T.all },
            { key: 'ACTIVE', label: T.active },
            { key: 'INACTIVE', label: T.inactive }
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
                <th style={{ padding: '16px' }}>{T.thName}</th>
                <th style={{ padding: '16px' }}>{T.thContact}</th>
                <th style={{ padding: '16px' }}>{T.thAddressHistory}</th>
                <th style={{ padding: '16px' }}>{T.thOrderCount}</th>
                <th style={{ padding: '16px' }}>{T.thJoinDate}</th>
                <th style={{ padding: '16px' }}>{T.thStatus}</th>
                <th style={{ padding: '16px' }}>{T.thManage}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #334155', fontSize: '14px' }}>
                  <td style={{ padding: '16px', fontWeight: '700' }}>{user.name}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ color: '#cbd5e1' }}>{user.email}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{user.phone}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                        style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '800' }}
                      >
                        {`${T.addressView} ${user.addresses?.length || 0}${T.addressViewSuffix}`}
                      </button>
                      {expandedUserId === user.id && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '12px', zIndex: 100, minWidth: '240px', marginTop: '8px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
                          {user.addresses?.length > 0 ? user.addresses.map((addr, idx) => (
                            <div key={idx} style={{ fontSize: '12px', color: '#cbd5e1', padding: '8px 0', borderBottom: idx === user.addresses.length - 1 ? 'none' : '1px solid #334155' }}>{addr}</div>
                          )) : (
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{T.noAddress}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>{`${user.orders}${T.orderSuffix}`}</td>
                  <td style={{ padding: '16px' }}>{user.join}</td>
                  <td style={{ padding: '16px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        backgroundColor: user.status === T.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: user.status === T.active ? '#10b981' : '#ef4444',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontWeight: '800'
                      }}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button
                      onClick={() => onOpenDetail(user.id)}
                      style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '12px' }}
                    >
                      {T.detail}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    {T.empty}
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

export default UsersTab;
