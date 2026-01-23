import React, { useState, useEffect } from 'react';

const CartModal = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveFromCart, onCheckout, isLoggedIn, onOpenAuth, onGoHome }) => {
  const [selectedStores, setSelectedStores] = useState(new Set());

  // Initialize selected stores when cartItems change or modal opens
  useEffect(() => {
    if (isOpen && cartItems.length > 0) {
      const stores = new Set(cartItems.map(item => item.storeName));
      setSelectedStores(stores);
    }
  }, [isOpen, cartItems]);

  if (!isOpen) return null;

  // Group items by store
  const groupedItems = cartItems.reduce((acc, item) => {
    const store = item.storeName || 'Unknown Store';
    if (!acc[store]) acc[store] = [];
    acc[store].push(item);
    return acc;
  }, {});

  const toggleStore = (storeName) => {
    const newSelected = new Set(selectedStores);
    if (newSelected.has(storeName)) {
      newSelected.delete(storeName);
    } else {
      newSelected.add(storeName);
    }
    setSelectedStores(newSelected);
  };

  // Calculate totals for SELECTED stores
  const selectedItems = cartItems.filter(item => selectedStores.has(item.storeName));
  const productPrice = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingPrice = selectedStores.size * 3000; // Assuming 3000 per store
  const totalPrice = productPrice + shippingPrice;

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white', width: '100%', maxWidth: '500px', height: '80vh',
        borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800' }}>장바구니</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>

        {/* Content */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px', backgroundColor: '#f8fafc' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {Object.entries(groupedItems).map(([storeName, items]) => (
                <div key={storeName} style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  {/* Store Header with Checkbox */}
                  <div 
                    onClick={() => toggleStore(storeName)}
                    style={{ 
                      padding: '16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px', 
                      cursor: 'pointer', backgroundColor: selectedStores.has(storeName) ? '#f0fdf4' : 'white', transition: 'background-color 0.2s'
                    }}
                  >
                    <div style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', border: selectedStores.has(storeName) ? 'none' : '2px solid #cbd5e1',
                      backgroundColor: selectedStores.has(storeName) ? 'var(--primary)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: '14px' 
                    }}>
                      {selectedStores.has(storeName) && '✓'}
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '16px', color: '#1e293b' }}>{storeName}</span>
                  </div>

                  {/* Items List */}
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {items.map(item => (
                      <div key={item.id} style={{ display: 'flex', gap: '12px' }}>
                        <img src={item.img} alt={item.name} style={{ width: '70px', height: '70px', borderRadius: '12px', objectFit: 'cover', backgroundColor: '#f1f5f9' }} />
                        <div style={{ flexGrow: 1 }}>
                          <div style={{ fontSize: '15px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>{item.name}</div>
                          <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>{item.price.toLocaleString()}원</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                          <button onClick={() => onRemoveFromCart(item.id)} style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>✕</button>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '24px' }}>
                            <button onClick={() => onUpdateQuantity(item.id, -1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: '800', width: '20px' }}>-</button>
                            <span style={{ fontWeight: '700', fontSize: '13px', width: '16px', textAlign: 'center' }}>{item.quantity}</span>
                            <button onClick={() => onUpdateQuantity(item.id, 1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: '800', width: '20px' }}>+</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {isLoggedIn && cartItems.length > 0 && (
          <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#64748b' }}>
              <span>선택 상품 금액</span>
              <span>{productPrice.toLocaleString()}원</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: '#64748b' }}>
              <span>배송비 (상점별 3,000원)</span>
              <span>{shippingPrice.toLocaleString()}원</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontWeight: '700', fontSize: '18px' }}>총 결제금액</span>
              <span style={{ fontWeight: '800', fontSize: '20px', color: 'var(--primary)' }}>{totalPrice.toLocaleString()}원</span>
            </div>
            <button 
              onClick={() => { 
                if (selectedStores.size === 0) {
                  alert('결제할 상점을 선택해주세요.');
                  return;
                }
                onClose(); 
                onCheckout(selectedItems); // Pass selected items if backend needs it (logic update)
              }}
              style={{ 
                width: '100%', padding: '16px', borderRadius: '12px', 
                background: selectedStores.size > 0 ? 'var(--primary)' : '#cbd5e1', 
                color: 'white', border: 'none', fontWeight: '700', fontSize: '16px', 
                cursor: selectedStores.size > 0 ? 'pointer' : 'not-allowed', 
                boxShadow: selectedStores.size > 0 ? '0 4px 14px rgba(16, 185, 129, 0.4)' : 'none' 
              }}
            >
              {selectedStores.size}개 상점 결제하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
