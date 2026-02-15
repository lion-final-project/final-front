import React, { useState, useEffect } from 'react';
import OrderDetailModal from '../../features/order/OrderDetailModal';
import OrderDetailFullModal from '../../features/order/OrderDetailFullModal';
import ReceiptModal from '../../features/order/ReceiptModal';
import InquiryModal from '../../features/support/InquiryModal';
import OrderReportModal from '../../features/order/OrderReportModal';

const OrderManagementView = ({ orders, onTracking, onWriteReview, onCancelOrder, onViewReview, onBack, onDateFilterChange, currentPage, totalPages, onPageChange, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null); // For "..." modal
  const [detailOrder, setDetailOrder] = useState(null);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [inquiryOrder, setInquiryOrder] = useState(null);
  const [reportOrder, setReportOrder] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  // 기간 옵션
  const periodOptions = [
    { label: '오늘', value: 'today' },
    { label: '일주일', value: 'week' },
    { label: '한달', value: 'month' },
    { label: '6개월', value: '6months' },
    { label: '1년', value: 'year' },
    { label: '2년', value: '2years' },
    { label: '3년', value: '3years' },
  ];

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setSearchTerm(''); // 기간 필터 변경 시 검색어 초기화
    if (onDateFilterChange) {
      onDateFilterChange(period);
    }
  };

  const handleSearch = () => {
    if (onSearch) {
      // 검색어를 전달 (비어있어도 전달하여 검색 초기화)
      const trimmedSearchTerm = searchTerm ? searchTerm.trim() : '';
      onSearch(trimmedSearchTerm);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 검색은 백엔드에서 처리되므로 클라이언트 사이드 필터링 제거
  const filteredOrders = orders;

  return (
    <div className="order-management-view" style={{ width: '100%', paddingBottom: '100px' }}>

      {/* Header / Title */}
      <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={onBack} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', padding: 0 }}>←</button>
        주문/리뷰 내역
      </h2>

      {/* Period Filter Buttons */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontWeight: '600' }}>
          주문일 기준
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {periodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handlePeriodChange(option.value)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                background: selectedPeriod === option.value ? 'var(--primary)' : 'white',
                color: selectedPeriod === option.value ? 'white' : '#64748b',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (selectedPeriod !== option.value) {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.color = 'var(--primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedPeriod !== option.value) {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.color = '#64748b';
                }
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flexGrow: 1, position: 'relative' }}>
            <input
              type="text"
              placeholder="상품명으로 검색해보세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{
                width: '100%', padding: '10px 16px 10px 40px',
                borderRadius: '8px', border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc', fontSize: '14px', color: '#1e293b',
                outline: 'none'
              }}
            />
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: '#94a3b8' }}>🔍</span>
          </div>
          <button
            onClick={handleSearch}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--primary)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            검색
          </button>
        </div>
      </div>

      {/* Order List (Naver Style) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order, index) => (
            <div key={order.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', opacity: order.status === '주문 취소됨' ? 0.6 : 1 }}>
              {/* Header Line */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>
                  {order.date} <span style={{ fontSize: '14px', fontWeight: '400', color: '#94a3b8', marginLeft: '8px' }}>주문번호 {order.orderNumber || order.id}</span>
                </div>
                <button onClick={() => setSelectedOrder(order)} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#cbd5e1', cursor: 'pointer', padding: '4px' }}>•••</button>
              </div>

              {/* Status Line */}
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontWeight: '800',
                  color: order.status === '배송 완료' ? 'var(--primary)' :
                    order.status === '주문 접수 중' ? '#3b82f6' :
                      order.status === '주문 취소됨' ? '#ef4444' : '#1e293b',
                  fontSize: '16px'
                }}>{order.status}</span>
                {order.status === '배송 완료' && <span style={{ fontSize: '12px', color: '#94a3b8' }}>{order.date.replace(/\./g, '/').slice(5)} 도착</span>}
              </div>

              {/* Product Content */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f1f5f9', flexShrink: 0 }}>
                  <img src={order.img} alt={order.product} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{order.store}</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#334155', marginBottom: '6px', lineHeight: '1.4' }}>{order.items}</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{order.price} <span style={{ fontWeight: '400', color: '#94a3b8', marginLeft: '4px' }}></span></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="order-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {order.status === '주문 접수 중' ? (
                  <button
                    onClick={() => onCancelOrder && onCancelOrder(order.storeOrderId)}
                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ef4444', background: 'white', color: '#ef4444', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}
                  >
                    주문 취소
                  </button>
                ) : order.status === '준비 중' ? (
                  <button
                    onClick={() => onTracking && onTracking(order)}
                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #3b82f6', background: 'white', color: '#3b82f6', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
                  >
                    주문 확인
                  </button>
                ) : order.status === '배송 중' ? (
                  <button
                    onClick={() => onTracking && onTracking(order)}
                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #3b82f6', background: 'white', color: '#3b82f6', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
                  >
                    배송 추적
                  </button>
                ) : order.reviewWritten ? (
                  <button
                    onClick={() => onViewReview && onViewReview(order)}
                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white', color: '#334155', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
                  >
                    내가 쓴 리뷰 보기
                  </button>
                ) : order.status === '배송 완료' ? (
                  <button
                    onClick={() => onWriteReview && onWriteReview(order)}
                    style={{
                      padding: '10px', borderRadius: '4px', border: '1px solid var(--primary)',
                      background: 'white', color: 'var(--primary)', fontWeight: '700',
                      cursor: 'pointer', fontSize: '14px'
                    }}
                  >
                    리뷰 쓰기
                  </button>
                ) : order.status === '주문 취소됨' ? (
                  <button
                    disabled
                    style={{
                      padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1',
                      background: '#f8fafc', color: '#94a3b8', fontWeight: '600',
                      cursor: 'not-allowed', fontSize: '14px'
                    }}
                  >
                    취소된 주문
                  </button>
                ) : null}
                <button
                  onClick={() => alert('장바구니에 다시 담았습니다.')}
                  style={{ padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0', background: 'white', color: '#334155', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
                >
                  장바구니 담기
                </button>
                <button
                  onClick={() => setDetailOrder(order)}
                  style={{ padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0', background: 'white', color: '#334155', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
                >
                  상세 조회
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <p>검색된 주문 내역이 없습니다.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px', padding: '20px 0' }}>
          <button
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: currentPage === 0 ? '#f8fafc' : 'white',
              color: currentPage === 0 ? '#cbd5e1' : '#334155',
              fontSize: '14px',
              fontWeight: '600',
              cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
              minWidth: '40px'
            }}
          >
            이전
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i;
            } else if (currentPage < 3) {
              pageNum = i;
            } else if (currentPage > totalPages - 3) {
              pageNum = totalPages - 5 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange && onPageChange(pageNum)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: currentPage === pageNum ? 'var(--primary)' : 'white',
                  color: currentPage === pageNum ? 'white' : '#334155',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  minWidth: '40px'
                }}
              >
                {pageNum + 1}
              </button>
            );
          })}

          <button
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: currentPage >= totalPages - 1 ? '#f8fafc' : 'white',
              color: currentPage >= totalPages - 1 ? '#cbd5e1' : '#334155',
              fontSize: '14px',
              fontWeight: '600',
              cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
              minWidth: '40px'
            }}
          >
            다음
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 600px) {
           .order-actions {
              grid-template-columns: 1fr !important;
           }
        }
      `}</style>

      <OrderDetailModal
        isOpen={!!selectedOrder}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onTracking={onTracking}
        onReview={onWriteReview}
        onOpenDetail={setDetailOrder}
        onOpenReceipt={setReceiptOrder}
        onOpenInquiry={setInquiryOrder}
        onOpenReport={setReportOrder}
      />

      <OrderDetailFullModal
        isOpen={!!detailOrder}
        order={detailOrder}
        onClose={() => setDetailOrder(null)}
      />

      <ReceiptModal
        isOpen={!!receiptOrder}
        order={receiptOrder}
        onClose={() => setReceiptOrder(null)}
      />

      <InquiryModal
        isOpen={!!inquiryOrder}
        order={inquiryOrder}
        onClose={() => setInquiryOrder(null)}
      />

      <OrderReportModal
        isOpen={!!reportOrder}
        order={reportOrder}
        onClose={() => setReportOrder(null)}
      />
    </div>
  );
};

export default OrderManagementView;
