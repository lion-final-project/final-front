import React, { useState, useEffect } from 'react';

const CartModal = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveFromCart, onCheckout, isLoggedIn, onOpenAuth, onGoHome }) => {
  const [selectedStores, setSelectedStores] = useState(new Set());

  // Automatically select new stores that appear in the cart
  useEffect(() => {
    if (isOpen) {
      const currentItemStores = new Set(cartItems.map(item => item.storeName));
      setSelectedStores(prev => {
        const next = new Set(prev);
        // Only add stores that aren't already there (to avoid overwriting manual unselection)
        // and remove stores that no longer exist in cartItems
        let changed = false;
        
        // Remove stale stores
        for (const store of next) {
          if (!currentItemStores.has(store)) {
            next.delete(store);
            changed = true;
          }
        }
        
        // Add new stores (optional: could just leave them unselected, but usually better to select them)
        // If it's the first time opening with items, select all
        if (prev.size === 0 && currentItemStores.size > 0) {
           currentItemStores.forEach(s => next.add(s));
           changed = true;
        }

        return changed ? next : prev;
      });
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
  
  // Only pay shipping for stores that actually HAVE selected items
  const activeSelectedStoreCount = new Set(selectedItems.map(i => i.storeName)).size;
  const shippingPrice = activeSelectedStoreCount * 3000;
  const totalPrice = productPrice + shippingPrice;

  const hasOutOfStockInSelection = selectedItems.some(item => {
    const stock = item.stock ?? 999; // Assume in stock if property missing
    return stock <= 0 || item.quantity > stock;
  });

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
                          {item.stock <= 0 ? (
                            <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: '800', background: '#fef2f2', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fee2e2' }}>품절</div>
                          ) : item.quantity > item.stock ? (
                            <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '800', background: '#fffbeb', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fef3c7' }}>재고 {item.stock}개 남음</div>
                          ) : null}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '24px', opacity: item.stock <= 0 ? 0.5 : 1 }}>
                            <button 
                              disabled={item.stock <= 0}
                              onClick={() => onUpdateQuantity(item.id, -1)} 
                              style={{ border: 'none', background: 'transparent', cursor: item.stock <= 0 ? 'not-allowed' : 'pointer', fontWeight: '800', width: '20px' }}>-</button>
                            <input 
                              type="number" 
                              min="1"
                              max={item.stock}
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                const diff = val - item.quantity;
                                if (val > 0 && val <= (item.stock || 999)) {
                                  onUpdateQuantity(item.id, diff);
                                }
                              }}
                              style={{ width: '30px', textAlign: 'center', fontWeight: '700', border: 'none', background: 'transparent', fontSize: '13px', outline: 'none' }}
                            />
                            <button 
                              disabled={item.stock <= 0 || item.quantity >= item.stock}
                              onClick={() => onUpdateQuantity(item.id, 1)} 
                              style={{ border: 'none', background: 'transparent', cursor: (item.stock <= 0 || item.quantity >= item.stock) ? 'not-allowed' : 'pointer', fontWeight: '800', width: '20px' }}>+</button>
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
                if (activeSelectedStoreCount === 0) {
                  alert('결제할 상품이 포함된 상점을 선택해주세요.');
                  return;
                }
                if (hasOutOfStockInSelection) {
                  alert('품절되었거나 재고가 부족한 상품이 포함되어 있습니다. 해당 상품을 삭제하거나 수량을 조절해 주세요.');
                  return;
                }
                onClose(); 
                onCheckout(selectedItems); 
              }}
              style={{ 
                width: '100%', padding: '16px', borderRadius: '12px', 
                background: (activeSelectedStoreCount > 0 && !hasOutOfStockInSelection) ? 'var(--primary)' : '#cbd5e1', 
                color: 'white', border: 'none', fontWeight: '700', fontSize: '16px', 
                cursor: (activeSelectedStoreCount > 0 && !hasOutOfStockInSelection) ? 'pointer' : 'not-allowed', 
                boxShadow: (activeSelectedStoreCount > 0 && !hasOutOfStockInSelection) ? '0 4px 14px rgba(16, 185, 129, 0.4)' : 'none' 
              }}
            >
              {hasOutOfStockInSelection ? '품절 상품 포함됨' : `${activeSelectedStoreCount}개 상점 결제하기`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
