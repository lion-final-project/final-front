import React, { useState } from 'react';

const SearchResultsView = ({ query, stores, categories, onStoreClick }) => {
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  
  // Filter logic unified with StoreGrid + additional sidebar filters
  const filteredStores = stores.filter(store => {
    const matchesSearch = 
      store.name.toLowerCase().includes(query.toLowerCase()) ||
      store.products.some(p => p.name.toLowerCase().includes(query.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || store.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'popular') return b.reviews - a.reviews;
    if (sortBy === 'rating') return b.rate - a.rate;
    if (sortBy === 'distance') return a.distance - b.distance;
    return 0;
  });

  return (
    <div className="search-results" style={{ padding: '40px 0', animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ marginBottom: '40px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#1e293b', margin: 0 }}>
          <span style={{ color: 'var(--primary)' }}>'{query}'</span> 검색 결과
          <span style={{ color: '#94a3b8', fontSize: '18px', fontWeight: '600', marginLeft: '12px' }}>{filteredStores.length}개의 매장</span>
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '50px' }}>
        {/* Filters Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '20px', color: '#334155' }}>전체 카테고리</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: filterCategory === 'all' ? 'var(--primary)' : '#64748b' }}>
                <input type="radio" checked={filterCategory === 'all'} onChange={() => setFilterCategory('all')} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} /> 
                전체보기
              </label>
              {categories.slice(0, categories.length - 1).map(cat => (
                <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: filterCategory === cat.id ? 'var(--primary)' : '#64748b' }}>
                  <input type="radio" checked={filterCategory === cat.id} onChange={() => setFilterCategory(cat.id)} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} /> 
                  {cat.icon} {cat.name}
                </label>
              ))}
            </div>
          </div>

          <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '20px', color: '#334155' }}>배달 요금</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {['무료 배달', '2,000원 이하', '3,000원 이하'].map((fee, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>
                  <input type="checkbox" style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} /> {fee}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Results Body */}
        <main>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
            <div style={{ display: 'flex', gap: '24px', fontSize: '15px', fontWeight: '700' }}>
              {['popular', 'rating', 'distance'].map(id => (
                <span 
                  key={id}
                  style={{ 
                    cursor: 'pointer', 
                    color: sortBy === id ? 'var(--primary)' : '#94a3b8', 
                    paddingBottom: '4px',
                    borderBottom: sortBy === id ? '2px solid var(--primary)' : '2px solid transparent',
                    transition: 'all 0.2s'
                  }} 
                  onClick={() => setSortBy(id)}
                >
                  {id === 'popular' ? '인기순' : id === 'rating' ? '별점순' : '거리순'}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
            {filteredStores.length > 0 ? (
              filteredStores.map(store => (
                <div 
                  key={store.id} 
                  onClick={() => onStoreClick(store)} 
                  className="store-card"
                  style={{ 
                    background: 'white', 
                    borderRadius: 'var(--radius)', 
                    overflow: 'hidden', 
                    boxShadow: 'var(--shadow)', 
                    cursor: 'pointer', 
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative'
                  }}
                >
                  <div style={{ height: '180px', background: `url(${store.img}) center/cover no-repeat`, transition: 'transform 0.5s ease' }} className="store-card-img" />
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '19px', fontWeight: '800', margin: 0, color: '#1e293b' }}>{store.name}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '15px', color: '#f59e0b', fontWeight: '800' }}>★ {store.rate}</span>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>({store.reviews})</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b', display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: '700' }}>🛵 {store.time}</span>
                      <span style={{ width: '1px', height: '10px', background: '#e2e8f0' }}></span>
                      <span>배달팁 3,000원</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '120px 0', backgroundColor: 'white', borderRadius: '32px', border: '1px dashed #e2e8f0' }}>
                <div style={{ fontSize: '72px', marginBottom: '24px' }}>🔍</div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#475569', marginBottom: '12px' }}>검색 결과가 없습니다</h3>
                <p style={{ color: '#94a3b8' }}>다른 매력적인 키워드로 다시 검색해 보세요!</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <style>{`
        .store-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .store-card:hover .store-card-img {
          transform: scale(1.05);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SearchResultsView;
