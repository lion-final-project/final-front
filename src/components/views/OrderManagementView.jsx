import React, { useState } from 'react';
import OrderDetailModal from '../modals/OrderDetailModal';
import OrderDetailFullModal from '../modals/OrderDetailFullModal';
import ReceiptModal from '../modals/ReceiptModal';
import InquiryModal from '../modals/InquiryModal';
import OrderReportModal from '../modals/OrderReportModal';

const OrderManagementView = ({ orders, onTracking, onWriteReview, onCancelOrder, onViewReview, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null); // For "..." modal
  const [detailOrder, setDetailOrder] = useState(null);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [inquiryOrder, setInquiryOrder] = useState(null);
  const [reportOrder, setReportOrder] = useState(null);
  const [filterYear, setFilterYear] = useState('3년');

  const filteredOrders = orders.filter(order => 
    order.product?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.items.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="order-management-view" style={{ width: '100%', paddingBottom: '100px' }}>
      
      {/* Header / Title */}
      <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={onBack} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', padding: 0 }}>←</button>
        주문/리뷰 내역
      </h2>

      {/* Search Bar (Kurly Style) */}
      <div style={{ marginBottom: '32px' }}>
         <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #e2e8f0', background: 'white', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
               {filterYear} <span style={{ fontSize: '10px' }}>▼</span>
            </button>
            <div style={{ flexGrow: 1, position: 'relative' }}>
               <input 
                 type="text" 
                 placeholder="상품명으로 검색해보세요" 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 style={{ 
                   width: '100%', padding: '10px 16px 10px 40px', 
                   borderRadius: '4px', border: 'none', 
                   backgroundColor: '#f4f4f5', fontSize: '14px', color: '#1e293b' 
                 }}
               />
               <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: '#94a3b8' }}>🔍</span>
            </div>
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
                     {order.date} <span style={{ fontSize: '14px', fontWeight: '400', color: '#94a3b8', marginLeft: '8px' }}>주문번호 {order.id}</span>
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
                     <div style={{ fontSize: '16px', fontWeight: '700', color: '#334155', marginBottom: '6px', lineHeight: '1.4' }}>{order.product || order.items}</div>
                     <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{order.price} <span style={{ fontWeight: '400', color: '#94a3b8', marginLeft: '4px' }}>| 1개</span></div>
                  </div>
               </div>

               {/* Action Buttons */}
                <div className="order-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {order.status === '주문 접수 중' ? (
                    <button 
                      onClick={() => onCancelOrder && onCancelOrder(order.id)}
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ef4444', background: 'white', color: '#ef4444', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}
                    >
                       주문 취소
                    </button>
                  ) : order.reviewWritten ? (
                    <button 
                      onClick={() => onViewReview && onViewReview(order)}
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white', color: '#334155', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
                    >
                       내가 쓴 리뷰 보기
                    </button>
                  ) : (
                    <button 
                      disabled={order.status === '주문 취소됨'}
                      onClick={() => onWriteReview(order)}
                      style={{ 
                        padding: '10px', borderRadius: '4px', border: '1px solid var(--primary)', 
                        background: 'white', color: 'var(--primary)', fontWeight: '700', 
                        cursor: order.status === '주문 취소됨' ? 'not-allowed' : 'pointer', fontSize: '14px',
                        opacity: order.status === '주문 취소됨' ? 0.5 : 1
                      }}
                    >
                       리뷰 쓰기
                    </button>
                  )}
                  <button 
                    onClick={() => alert('장바구니에 다시 담았습니다.')}
                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0', background: 'white', color: '#334155', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
                  >
                     장바구니 담기
                  </button>
                  <button 
                    onClick={() => alert('바로 구매하기 페이지로 이동합니다.')}
                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0', background: 'white', color: '#334155', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
                  >
                     바로 구매하기
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
