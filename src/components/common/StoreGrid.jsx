import React, { useState, useEffect, useRef } from 'react';
import StoreDetailModal from '../features/store/StoreDetailModal';
import * as userApi from '../../api/userApi';

const StoreGrid = ({ selectedCategory, searchQuery, coords, onStoreClick }) => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDistance, setLastDistance] = useState(null);
  const [lastId, setLastId] = useState(null);

  const fetchStores = async (isFirstPage = false) => {
    if (loading || (!hasMore && !isFirstPage)) return;

    // Mapping frontend string IDs to backend numeric IDs
    const categoryMap = {
      'mart': 2,    // 슈퍼마켓
      'fruit': 4,   // 과일가게
      'butcher': 3, // 정육점
      'banchan': 5, // 반찬가게
    };

    setLoading(true);
    try {
      const result = await userApi.getNearbyStores({
        latitude: coords.lat,
        longitude: coords.lon,
        storeCategoryId: selectedCategory === 'all' ? null : categoryMap[selectedCategory],
        keyword: searchQuery || null,
        lastDistance: isFirstPage ? null : lastDistance,
        lastId: isFirstPage ? null : lastId,
        size: 16
      });

      if (isFirstPage) {
        setStores(result.content);
      } else {
        setStores(prev => {
          const existingIds = new Set(prev.map(s => s.storeId));
          const newItems = result.content.filter(s => !existingIds.has(s.storeId));
          return [...prev, ...newItems];
        });
      }

      if (!result.content || result.content.length === 0) {
        setHasMore(false);
      } else {
        setHasMore(!result.last);
        const lastItem = result.content[result.content.length - 1];
        setLastDistance(lastItem.distance);
        setLastId(lastItem.storeId);
      }
    } catch (error) {
      console.error("Failed to fetch stores:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch or search/category/coords change
  useEffect(() => {
    fetchStores(true);
  }, [selectedCategory, searchQuery, coords]);

  return (
    <div style={{ flexGrow: 1 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '30px',
      }}>
        {stores.length > 0 ? (
          stores.map(store => {
            // Mapping for StoreDetailView compatibility (API object -> UI object)
            const compatibleStore = {
              ...store,
              id: store.storeId,
              name: store.storeName,
              img: store.storeImage || 'https://via.placeholder.com/400x180?text=No+Image',
              rate: 4.8,
              reviews: store.reviewCount,
              products: store.products || [] // Mock products or empty for now
            };

            return (
              <div
                key={store.storeId}
                onClick={() => onStoreClick(compatibleStore)}
                className="store-card"
                // ... existing styles ...
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
                    backgroundImage: `url(${store.storeImage || 'https://via.placeholder.com/400x180?text=No+Image'})`,
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
                    }} title={store.storeName}>{store.storeName}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '14px', color: '#f59e0b', fontWeight: '700' }}>★ 4.8</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({store.reviewCount})</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    <span style={{ color: store.isOpen ? 'var(--primary)' : '#94a3b8', fontWeight: '600' }}>
                      {store.isOpen ? `🚚 ${(store.distance / 1000).toFixed(1)}km` : '🕒 영업 종료'}
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
            );
          })
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)', backgroundColor: 'white', borderRadius: '24px', border: '1px dashed var(--border)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏪</div>
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#64748b' }}>현재 배달 가능한 매장이 없습니다.</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>주소를 변경하거나 다른 카테고리를 선택해보세요.</p>
          </div>
        )}
      </div>

      {/* Load More Button */}
      {hasMore && !loading && (
        <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '20px' }}>
          <button
            onClick={() => fetchStores(false)}
            style={{
              padding: '12px 32px',
              borderRadius: '30px',
              backgroundColor: 'white',
              color: '#475569',
              border: '1px solid #e2e8f0',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.color = 'var(--primary)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.color = '#475569';
            }}
          >
            더 보기 ▽
          </button>
        </div>
      )}

      {
        loading && (
          <div style={{
            textAlign: 'center',
            padding: '40px 0',
            color: 'var(--primary)',
            fontWeight: '700',
            fontSize: '15px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'white',
            borderRadius: '16px',
            marginTop: '20px',
            border: '1px solid #f1f5f9'
          }}>
            <div className="loading-spinner" style={{
              width: '24px',
              height: '24px',
              border: '3px solid rgba(46, 204, 113, 0.1)',
              borderTop: '3px solid var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1.2s linear infinite'
            }}></div>
            <span style={{ color: '#64748b' }}>새로운 마트를 불러오고 있습니다...</span>
          </div>
        )
      }

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
