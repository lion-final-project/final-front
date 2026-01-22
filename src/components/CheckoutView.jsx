import React, { useState } from 'react';
import { addresses, paymentMethods } from '../data/mockData';

const CheckoutView = ({ cartItems, onComplete }) => {
  const [selectedAddress, /* setSelectedAddress */] = useState(addresses.find(a => a.isDefault));
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods.find(p => p.isDefault));
  const [isProcessing, setIsProcessing] = useState(false);

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 3000;
  const finalPrice = totalPrice + deliveryFee;

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment process
    setTimeout(() => {
      setIsProcessing(false);
      alert('결제가 완료되었습니다!');
      onComplete();
    }, 1500);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>주문/결제</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Address Section */}
          <section style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>배송지 정보</h3>
              <button style={{ border: 'none', background: 'transparent', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }}>변경</button>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ backgroundColor: 'var(--primary)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                  {selectedAddress.label}
                </span>
                <span style={{ fontWeight: '700' }}>김서연 (010-1234-5678)</span>
              </div>
              <div style={{ fontSize: '15px', color: '#1e293b', marginBottom: '4px' }}>{selectedAddress.address}</div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>{selectedAddress.detail}</div>
            </div>
          </section>

          {/* Payment Method Section */}
          <section style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>결제 수단</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {paymentMethods.map(method => (
                <div 
                  key={method.id} 
                  onClick={() => setSelectedPayment(method)}
                  style={{ 
                    padding: '16px', 
                    borderRadius: '12px', 
                    border: `2px solid ${selectedPayment.id === method.id ? 'var(--primary)' : '#f1f5f9'}`,
                    backgroundColor: selectedPayment.id === method.id ? 'var(--primary-light)' : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ 
                    width: '32px', 
                    height: '20px', 
                    backgroundColor: method.color, 
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '8px',
                    color: 'white',
                    fontWeight: '900'
                  }}>
                    {method.type === 'card' ? 'CARD' : 'PAY'}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700' }}>{method.name}</div>
                    {method.number && <div style={{ fontSize: '12px', color: '#94a3b8' }}>{method.number}</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Order Summary Section */}
          <section style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>주문 상품</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cartItems.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#475569' }}>{item.name} x {item.quantity}</span>
                  <span style={{ fontWeight: '600' }}>{(item.price * item.quantity).toLocaleString()}원</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar - Final Payment */}
        <div style={{ height: 'fit-content', position: 'sticky', top: '100px' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>최종 결제 금액</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>상품 금액</span>
                <span>{totalPrice.toLocaleString()}원</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>배송비</span>
                <span>{deliveryFee.toLocaleString()}원</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <span style={{ fontWeight: '700', fontSize: '18px' }}>총 결제금액</span>
              <span style={{ fontWeight: '800', fontSize: '20px', color: 'var(--primary)' }}>{finalPrice.toLocaleString()}원</span>
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px', textAlign: 'center' }}>
              주문 내용을 확인하였으며, 이에 동의합니다.
            </div>
            <button 
              onClick={handlePayment}
              disabled={isProcessing}
              className="btn-primary"
              style={{ 
                width: '100%', 
                padding: '16px', 
                borderRadius: '12px', 
                background: isProcessing ? '#cbd5e1' : 'var(--primary)', 
                color: 'white', 
                border: 'none', 
                fontWeight: '800', 
                fontSize: '17px', 
                cursor: isProcessing ? 'not-allowed' : 'pointer', 
                boxShadow: isProcessing ? 'none' : '0 4px 14px rgba(16, 185, 129, 0.4)' 
              }}
            >
              {isProcessing ? '결제 처리 중...' : `${finalPrice.toLocaleString()}원 결제하기`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutView;
