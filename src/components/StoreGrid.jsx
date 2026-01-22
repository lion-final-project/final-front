import React from 'react';
import StoreDetailModal from './StoreDetailModal';

import { stores } from '../data/mockData';

const StoreGrid = ({ selectedCategory, searchQuery, onStoreClick }) => {
  const filteredStores = stores.filter(store => {
    const matchesCategory = selectedCategory === 'all' || store.category === selectedCategory;
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '30px',
      flexGrow: 1
    }}>
      {filteredStores.length > 0 ? (
        filteredStores.map(store => (
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
              height: '180px',
              backgroundImage: `url(${store.img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'transform 0.5s ease'
            }} className="store-card-img" />
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '180px'
                }} title={store.name}>{store.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '14px', color: '#f59e0b', fontWeight: '700' }}>★ {store.rate}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({store.reviews})</span>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                <span style={{ color: 'var(--primary)', fontWeight: '600' }}>🚚 {store.time}</span>
              </p>
              <button style={{
                width: '100%',
                padding: '10px 0',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                backgroundColor: '#f8fafc',
                transition: 'all 0.2s'
              }}>
                구경하기
              </button>
            </div>
          </div>
        ))
      ) : (
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '18px' }}>해당하는 상점이 없습니다.</p>
        </div>
      )}

      <style>{`
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
