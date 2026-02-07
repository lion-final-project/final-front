import React from 'react';
import { getStatusColor } from '../utils/storeDashboardUtils';

const OrdersTab = ({
  orders,
  orderSubTab,
  setOrderSubTab,
  mgmtFilter,
  setMgmtFilter,
  expandedOrders,
  onToggleExpand,
  onSelectOrder,
  onOpenReportModal,
}) => {
  const filteredOrders = orders.filter((order) => {
    if (orderSubTab === 'history') return true;
    if (mgmtFilter === 'unhandled') return ['신규', '준비중', '픽업 대기중', '픽업가능', '배달중'].includes(order.status);
    return ['배달완료', '완료'].includes(order.status);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '0' }}>
        <button
          onClick={() => setOrderSubTab('management')}
          style={{
            padding: '12px 4px',
            background: 'none',
            border: 'none',
            borderBottom: orderSubTab === 'management' ? '3px solid var(--primary)' : '3px solid transparent',
            color: orderSubTab === 'management' ? 'black' : '#94a3b8',
            fontWeight: '800',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          주문 관리
        </button>
        <button
          onClick={() => setOrderSubTab('history')}
          style={{
            padding: '12px 4px',
            background: 'none',
            border: 'none',
            borderBottom: orderSubTab === 'history' ? '3px solid var(--primary)' : '3px solid transparent',
            color: orderSubTab === 'history' ? 'black' : '#94a3b8',
            fontWeight: '800',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          주문 내역
        </button>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>
            {orderSubTab === 'management' ? '실시간 주문 처리' : '누적 주문 내역'}
          </h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {orderSubTab === 'management' && (
              <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                <button
                  onClick={() => setMgmtFilter('unhandled')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: mgmtFilter === 'unhandled' ? 'white' : 'transparent',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: mgmtFilter === 'unhandled' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  미처리
                </button>
                <button
                  onClick={() => setMgmtFilter('handled')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: mgmtFilter === 'handled' ? 'white' : 'transparent',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: mgmtFilter === 'handled' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  처리 완료
                </button>
              </div>
            )}
            <input type="text" placeholder="주문 검색..." style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', width: '200px' }} />
          </div>
        </div>

        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '14px' }}>
                <th style={{ padding: '12px', width: '40px' }}></th>
                <th style={{ padding: '12px' }}>주문번호</th>
                <th style={{ padding: '12px' }}>상품명</th>
                <th style={{ padding: '12px' }}>결제금액</th>
                <th style={{ padding: '12px' }}>상태</th>
                <th style={{ padding: '12px' }}>{orderSubTab === 'management' ? '관리' : '상세'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr
                      style={{
                        borderBottom: expandedOrders.has(order.id) ? 'none' : '1px solid #f1f5f9',
                        fontSize: '14px',
                        backgroundColor: expandedOrders.has(order.id) ? '#f8fafc' : 'white',
                      }}
                    >
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          onClick={() => onToggleExpand(order.id)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            fontSize: '12px',
                            transform: expandedOrders.has(order.id) ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s',
                          }}
                        >
                          ▼
                        </button>
                      </td>
                      <td
                        onClick={() => onToggleExpand(order.id)}
                        style={{ padding: '12px', fontWeight: '600', cursor: 'pointer', color: 'var(--primary)' }}
                      >
                        {order.id}
                      </td>
                      <td style={{ padding: '12px' }}>{order.items}</td>
                      <td style={{ padding: '12px' }}>{order.price}</td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            backgroundColor: getStatusColor(order.status).bg,
                            color: getStatusColor(order.status).text,
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => onSelectOrder(order)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              background: 'white',
                              cursor: 'pointer',
                              fontSize: '12px',
                              color: '#64748b',
                            }}
                          >
                            상세
                          </button>
                          <button
                            onClick={() => onOpenReportModal(order)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: '1px solid #fee2e2',
                              background: 'white',
                              cursor: 'pointer',
                              fontSize: '12px',
                              color: '#ef4444',
                              fontWeight: '800',
                            }}
                          >
                            신고
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedOrders.has(order.id) && (
                      <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                        <td colSpan="6" style={{ padding: '0 20px 20px 60px' }}>
                          <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>주문 상세 목록</div>
                            {order.itemsList &&
                              order.itemsList.map((item, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '13px',
                                    borderBottom: idx !== order.itemsList.length - 1 ? '1px solid #f1f5f9' : 'none',
                                    paddingBottom: '6px',
                                    paddingTop: '6px',
                                  }}
                                >
                                  <span>
                                    - {item.name} <span style={{ color: '#94a3b8' }}>x {item.qty}</span>
                                  </span>
                                  <span style={{ fontWeight: '600' }}>{item.price}</span>
                                </div>
                              ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    표시할 주문이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersTab;
