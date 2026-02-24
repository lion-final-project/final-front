import React, { useState, useMemo } from 'react';
import { getStatusColor } from '../utils/storeDashboardUtils';

const HISTORY_STATUS_OPTIONS = [
  { value: '', label: '전체 상태' },
  { value: '신규', label: '신규' },
  { value: '준비중', label: '준비중' },
  { value: '픽업가능', label: '픽업가능' },
  { value: '픽업 완료', label: '픽업 완료' },
  { value: '배달중', label: '배달중' },
  { value: '배달완료', label: '배달완료' },
  { value: '완료', label: '완료' },
  { value: '거절됨', label: '거절됨' },
  { value: '취소됨', label: '취소됨' },
];

const OrdersTab = ({
  orders,
  ordersLoading = false,
  completedOrders = [],
  completedOrdersLoading = false,
  historyOrders = [],
  historyLoading = false,
  historyPage = 0,
  historyTotalPages = 0,
  historyTotalElements = 0,
  onHistoryPageChange,
  orderSubTab,
  setOrderSubTab,
  mgmtFilter,
  setMgmtFilter,
  expandedOrders,
  onToggleExpand,
  onOpenReportModal,
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('');

  const isHandledTab = orderSubTab === 'management' && mgmtFilter === 'handled';
  const listForManagement = isHandledTab ? completedOrders : orders.filter((order) =>
    ['신규', '준비중', '픽업가능', '배달중'].includes(order.status)
  );
  const baseList = orderSubTab === 'history' ? historyOrders : listForManagement;

  const filteredByStatus = useMemo(() => {
    if (orderSubTab !== 'history' || !historyStatusFilter) return baseList;
    return baseList.filter((o) => o.status === historyStatusFilter);
  }, [orderSubTab, baseList, historyStatusFilter]);

  const filteredOrders = useMemo(() => {
    const kw = (searchKeyword || '').trim().toLowerCase();
    if (!kw) return filteredByStatus;
    return filteredByStatus.filter((order) => {
      const orderNum = String(order.orderNumber ?? order.id ?? '').toLowerCase();
      const items = String(order.items ?? '').toLowerCase();
      const idStr = String(order.id ?? '').toLowerCase();
      return orderNum.includes(kw) || items.includes(kw) || idStr.includes(kw);
    });
  }, [filteredByStatus, searchKeyword]);

  const isLoading = orderSubTab === 'history'
    ? historyLoading
    : orderSubTab === 'management' && (isHandledTab ? completedOrdersLoading : ordersLoading);

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
            {orderSubTab === 'history' && (
              <select
                value={historyStatusFilter}
                onChange={(e) => setHistoryStatusFilter(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#475569',
                  cursor: 'pointer',
                  minWidth: '140px',
                }}
              >
                {HISTORY_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}
            <input
              type="text"
              placeholder="주문 검색 (주문번호, 상품명)"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', width: '220px' }}
            />
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
                <th style={{ padding: '12px' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
                    주문 목록을 불러오는 중...
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
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
                        {order.orderNumber ?? order.id}
                      </td>
                      <td style={{ padding: '12px' }}>{order.items}</td>
                      <td style={{ padding: '12px' }}>{order.price}</td>
                      <td style={{ padding: '12px' }}>
                        {order.deliveryStatus === 'ACCEPTED' ? (
                          <span
                            style={{
                              backgroundColor: '#e0e7ff',
                              color: '#4338ca',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '900',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <span style={{ fontSize: '14px' }}>🏍️</span> 배차 완료
                          </span>
                        ) : (
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
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                            {order.date && (
                              <div style={{ fontSize: '13px', color: '#475569', marginBottom: '10px' }}>
                                <span style={{ fontWeight: '700', color: '#64748b', marginRight: '6px' }}>주문 시간:</span>
                                {order.date}
                              </div>
                            )}
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
                            {(order.status === '거절됨' || order.status === '취소됨') && order.rejectionReason && (
                              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '13px' }}>
                                <span style={{ fontWeight: '700', color: '#64748b', marginRight: '6px' }}>
                                  {order.status === '거절됨' ? '거절 사유' : '취소 사유'}:
                                </span>
                                <span style={{ color: '#475569' }}>{order.rejectionReason}</span>
                              </div>
                            )}
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

        {orderSubTab === 'history' && historyTotalPages > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '12px', borderTop: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>
              전체 {historyTotalElements}건
            </span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => onHistoryPageChange?.(historyPage - 1)}
                disabled={historyPage <= 0 || historyLoading}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: 'white',
                  cursor: historyPage <= 0 || historyLoading ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: historyPage <= 0 ? '#94a3b8' : '#475569',
                }}
              >
                이전
              </button>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                {historyPage + 1} / {historyTotalPages}
              </span>
              <button
                type="button"
                onClick={() => onHistoryPageChange?.(historyPage + 1)}
                disabled={historyPage >= historyTotalPages - 1 || historyLoading}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: 'white',
                  cursor: historyPage >= historyTotalPages - 1 || historyLoading ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: historyPage >= historyTotalPages - 1 ? '#94a3b8' : '#475569',
                }}
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersTab;
