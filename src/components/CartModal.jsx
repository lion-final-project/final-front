import React from 'react';

const CartModal = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveFromCart, onCheckout, isLoggedIn, onOpenAuth, onGoHome }) => {
  if (!isOpen) return null;

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div 
        style={{
          backgroundColor: 'white',
          width: '100%',
          maxWidth: '500px',
          height: '80vh',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }} 
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800' }}>장바구니</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>

        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px' }}>
          {!isLoggedIn ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '24px' }}>🛒</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>로그인이 필요합니다</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>장바구니를 확인하시려면 로그인해주세요.</p>
              <button onClick={() => { onClose(); onOpenAuth(); }} className="btn-primary" style={{ padding: '12px 24px', fontSize: '14px' }}>로그인하기</button>
            </div>
          ) : cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '24px' }}>🛒</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '24px' }}>장바구니가 비어있습니다.</p>
              <button 
                onClick={onClose}
                style={{ padding: '12px 24px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
              >쇼핑 계속하기</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{ background: 'white', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img src={item.img} alt={item.name} style={{ width: '70px', height: '70px', borderRadius: '12px', objectFit: 'cover' }} />
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{item.storeName}</div>
                    <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{item.name}</div>
                    <div style={{ fontWeight: '800', color: 'var(--primary)' }}>{item.price.toLocaleString()}원</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '24px' }}>
                    <button onClick={() => onUpdateQuantity(item.id, -1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: '800', width: '20px' }}>-</button>
                    <span style={{ fontWeight: '700', fontSize: '14px', width: '16px', textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.id, 1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: '800', width: '20px' }}>+</button>
                  </div>
                  <button onClick={() => onRemoveFromCart(item.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {isLoggedIn && cartItems.length > 0 && (
          <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#64748b' }}>
              <span>상품 금액</span>
              <span>{totalPrice.toLocaleString()}원</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: '#64748b' }}>
              <span>배송비</span>
              <span>3,000원</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontWeight: '700', fontSize: '18px' }}>총 결제금액</span>
              <span style={{ fontWeight: '800', fontSize: '20px', color: 'var(--primary)' }}>{(totalPrice + 3000).toLocaleString()}원</span>
            </div>
            <button 
              onClick={() => { onClose(); onCheckout(); }}
              style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}
            >주문하기</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
