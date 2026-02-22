import React from 'react';
import { getPriceDisplay } from '../utils/storeDashboardUtils';

const ProductsTab = ({
  products,
  productsLoading,
  productError,
  canEditProduct,
  canEditReason,
  lowStockThreshold,
  handleOpenProductModal,
  fetchMyProducts,
  deleteProduct,
}) => (
  <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>상품 관리</h2>
      <button onClick={() => handleOpenProductModal()} disabled={productsLoading} style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', cursor: productsLoading ? 'not-allowed' : 'pointer', opacity: productsLoading ? 0.7 : 1 }}>+ 새 상품 등록</button>
    </div>
    {!canEditProduct && canEditReason && (
      <div style={{ padding: '12px', marginBottom: '16px', background: '#fff7ed', color: '#9a3412', borderRadius: '8px', fontSize: '14px' }}>{canEditReason}</div>
    )}
    {productError && (
      <div style={{ padding: '12px', marginBottom: '16px', background: '#fef2f2', color: '#b91c1c', borderRadius: '8px', fontSize: '14px' }}>
        {productError}
        <button type="button" onClick={fetchMyProducts} style={{ marginLeft: '12px', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>다시 시도</button>
      </div>
    )}
    {productsLoading ? (
      <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>상품 목록을 불러오는 중...</div>
    ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
        {products.map((product) => {
          const stockPercent = product.capacity ? (product.stock / product.capacity) * 100 : 0;
          const isLowStock = stockPercent < lowStockThreshold && !product.isSoldOut;
          const priceInfo = getPriceDisplay(product.price, product.discountRate);
          return (
            <div
              key={product.id}
              style={{
                border: '1px solid #f1f5f9',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center',
                position: 'relative',
                minHeight: '320px',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: product.isSoldOut ? '#fafafa' : (product.stock < lowStockThreshold ? '#fffaf5' : 'white')
              }}
            >
              {isLowStock && (
                <span style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: '#ef4444', color: 'white', fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', zIndex: 2 }}>발주 필요</span>
              )}
              <div style={{ width: '100%', height: '100px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', filter: product.isSoldOut ? 'grayscale(1)' : 'none', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                {product.isSoldOut && (
                  <span style={{ position: 'absolute', top: '6px', left: '6px', backgroundColor: '#ef4444', color: 'white', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px', zIndex: 1 }}>판매 중지</span>
                )}
                {product.img && (product.img.startsWith('data:image') || product.img.startsWith('http')) ? (
                  <img src={product.img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '32px', color: '#cbd5e1' }}>📦</span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{product.category}</div>
              <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>{product.name}</div>
              {priceInfo.hasDiscount ? (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '18px' }}>{priceInfo.saleText}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', justifyContent: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#ef4444', backgroundColor: '#fee2e2', padding: '2px 8px', borderRadius: '999px' }}>-{priceInfo.discountRate}%</span>
                    <span style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'line-through' }}>{priceInfo.originalText}</span>
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '18px', marginBottom: '12px' }}>{priceInfo.originalText}</div>
              )}
              <div style={{ fontSize: '13px', color: product.stock < lowStockThreshold ? '#ef4444' : '#64748b', marginBottom: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: (product.stock < lowStockThreshold || product.isSoldOut) ? '#ef4444' : '#2ecc71' }}></span>
                재고: {product.stock}개
              </div>
              <div style={{ flex: 1, minHeight: '8px' }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => canEditProduct && handleOpenProductModal(product)} disabled={!canEditProduct} title={!canEditProduct ? canEditReason : ''} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white', fontSize: '12px', fontWeight: '600', cursor: canEditProduct ? 'pointer' : 'not-allowed', opacity: canEditProduct ? 1 : 0.6 }}>수정</button>
                <button onClick={() => canEditProduct && deleteProduct(product.id)} disabled={!canEditProduct} title={!canEditProduct ? canEditReason : ''} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid #fee2e2', background: 'white', fontSize: '12px', fontWeight: '600', color: '#ef4444', cursor: canEditProduct ? 'pointer' : 'not-allowed', opacity: canEditProduct ? 1 : 0.6 }}>삭제</button>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

export default ProductsTab;
