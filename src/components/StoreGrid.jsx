import React, { useState, useEffect } from 'react';
import StoreDetailModal from './StoreDetailModal';

import { stores } from '../data/mockData';

const StoreGrid = ({ selectedCategory, searchQuery, onStoreClick }) => {
  const [visibleCount, setVisibleCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const triggerRef = React.useRef(null);

  const filteredStores = stores.filter(store => {
    // Hidden if status is '중지됨' (suspended) or '비활성' (inactive)
    if (store.status === '중지됨' || store.status === '비활성') return false;

    // 3km radius filter
    const isWithinRadius = store.distance <= 3;
    if (!isWithinRadius) return false;

    const matchesCategory = selectedCategory === 'all' || store.category === selectedCategory;
    
    // Search by store name OR product name
    const matchesSearch = 
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.products.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredStores.length && !loading) {
          setLoading(true);
          setTimeout(() => {
            setVisibleCount(prev => prev + 4);
            setLoading(false);
          }, 800);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (triggerRef.current) observer.observe(triggerRef.current);

    return () => {
      if (triggerRef.current) observer.unobserve(triggerRef.current);
    };
  }, [visibleCount, filteredStores.length, loading]);

  // Reset visibleCount when search or category changes
  useEffect(() => {
    setVisibleCount(4);
  }, [selectedCategory, searchQuery]);

  const displayedStores = filteredStores.slice(0, visibleCount);

  return (
    <div style={{ flexGrow: 1 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '30px',
      }}>
        {displayedStores.length > 0 ? (
          displayedStores.map(store => (
            <div 
              key={store.id} 
              onClick={() => onStoreClick(store)}
              className="store-card"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
              }}
            >
              <div style={{
                position: 'relative',
                height: '180px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  backgroundImage: `url(${store.img})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transition: 'transform 0.5s ease',
                  filter: store.isOpen ? 'none' : 'grayscale(0.6) brightness(0.7)'
                }} className="store-card-img" />
                
                {!store.isOpen && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '8px',
                    backdropFilter: 'blur(2px)'
                  }}>
                    <div style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '6px 14px',
                      borderRadius: '30px',
                      fontSize: '13px',
                      fontWeight: '800',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                    }}>
                      현재 배달 불가능
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ padding: '16px', opacity: store.isOpen ? 1 : 0.7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '700',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '180px',
                    color: store.isOpen ? 'inherit' : '#64748b'
                  }} title={store.name}>{store.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '14px', color: '#f59e0b', fontWeight: '700' }}>★ {store.rate}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({store.reviews})</span>
                  </div>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  <span style={{ color: store.isOpen ? 'var(--primary)' : '#94a3b8', fontWeight: '600' }}>
                    {store.isOpen ? `🚚 ${store.time}` : '🕒 영업 종료'}
                  </span>
                </p>
                <button 
                  disabled={!store.isOpen}
                  style={{
                    width: '100%',
                    padding: '10px 0',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    backgroundColor: store.isOpen ? '#f8fafc' : '#f1f5f9',
                    color: store.isOpen ? '#1e293b' : '#94a3b8',
                    transition: 'all 0.2s',
                    cursor: store.isOpen ? 'pointer' : 'not-allowed'
                  }}
                >
                  {store.isOpen ? '구경하기' : '영업 준비 중'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)', backgroundColor: 'white', borderRadius: '24px', border: '1px dashed var(--border)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏪</div>
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#64748b' }}>현재 배달 가능한 매장이 없습니다.</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>주소를 변경하거나 다른 카테고리를 선택해보세요.</p>
          </div>
        )}
      </div>

      {/* Infinite Scroll Trigger */}
      <div ref={triggerRef} style={{ height: '20px', margin: '10px 0' }}></div>

      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 0', 
          color: 'var(--primary)', 
          fontWeight: '700',
          fontSize: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div className="loading-spinner" style={{
            width: '30px',
            height: '30px',
            border: '3px solid rgba(46, 204, 113, 0.1)',
            borderTop: '3px solid var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          🛒 새로운 마트 정보를 불러오고 있습니다...
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .store-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .store-card:hover .store-card-img {
          transform: scale(1.05);
        }
        .store-card:hover button {
          background-color: var(--primary) !important;
          color: white !important;
          border-color: var(--primary) !important;
        }
      `}</style>
    </div>
  );
};

export default StoreGrid;
