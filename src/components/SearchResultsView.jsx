import React, { useState } from 'react';

const SearchResultsView = ({ query, stores, categories, onStoreClick }) => {
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  
  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(query.toLowerCase()) &&
    (filterCategory === 'all' || store.category === filterCategory)
  );

  return (
    <div className="search-results" style={{ padding: '40px 0' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800' }}>
          '{query}' 검색 결과 <span style={{ color: '#94a3b8', fontSize: '18px', fontWeight: '500' }}>({filteredStores.length}개)</span>
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '40px' }}>
        {/* Filters Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>카테고리</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                <input type="radio" checked={filterCategory === 'all'} onChange={() => setFilterCategory('all')} /> 전체
              </label>
              {categories.map(cat => (
                <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                  <input type="radio" checked={filterCategory === cat.id} onChange={() => setFilterCategory(cat.id)} /> {cat.name}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>배달 요금</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['무료 배달', '2,000원 이하', '3,000원 이하'].map((fee, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                  <input type="checkbox" /> {fee}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>최소 주문 금액</h3>
            <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}>
              <option>전체</option>
              <option>5,000원 이하</option>
              <option>10,000원 이하</option>
              <option>15,000원 이하</option>
            </select>
          </div>
        </aside>

        {/* Results Body */}
        <main>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#64748b' }}>
              <span style={{ cursor: 'pointer', color: sortBy === 'popular' ? 'var(--primary)' : 'inherit', fontWeight: sortBy === 'popular' ? '700' : '400' }} onClick={() => setSortBy('popular')}>인기순</span>
              <span style={{ cursor: 'pointer', color: sortBy === 'rating' ? 'var(--primary)' : 'inherit', fontWeight: sortBy === 'rating' ? '700' : '400' }} onClick={() => setSortBy('rating')}>별점순</span>
              <span style={{ cursor: 'pointer', color: sortBy === 'distance' ? 'var(--primary)' : 'inherit', fontWeight: sortBy === 'distance' ? '700' : '400' }} onClick={() => setSortBy('distance')}>거리순</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {filteredStores.length > 0 ? (
              filteredStores.map(store => (
                <div key={store.id} onClick={() => onStoreClick(store)} style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'transform 0.2s' }}>
                  <div style={{ height: '160px', background: `url(${store.img}) center/cover no-repeat` }}>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{store.name}</h4>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#f59e0b' }}>⭐ {store.rate}</div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', gap: '12px' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: '600' }}>🛵 {store.time}</span>
                      <span>💰 배달팁 3,000원</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0', color: '#94a3b8' }}>
                <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔍</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#475569' }}>검색 결과가 없습니다</h3>
                <p>다른 키워드로 검색해 보세요.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SearchResultsView;
