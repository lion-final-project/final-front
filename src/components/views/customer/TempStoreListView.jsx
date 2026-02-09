import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config/api';

/**
 * 임시: DB에 저장된 전체 상점 목록.
 * 상점 리스트 구현 전 구독 신청 테스트용. 디자인 없이 목록 + 구독 시작하기(상점 진입)만 제공.
 */
const TempStoreListView = ({ onStoreClick, onClose }) => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/api/stores/list`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('상점 목록을 불러오지 못했습니다.');
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        const list = json?.data ?? [];
        setStores(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || '오류가 발생했습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleStoreClick = (s) => {
    const storeForDetail = {
      id: s.storeId,
      name: s.storeName,
      products: [],
    };
    onStoreClick(storeForDetail);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>전체 상점 목록 (임시 · 구독 테스트용)</h2>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            background: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          목록 닫기
        </button>
      </div>
      {loading && <p style={{ color: '#64748b' }}>로딩 중...</p>}
      {error && <p style={{ color: '#ef4444' }}>{error}</p>}
      {!loading && !error && stores.length === 0 && (
        <p style={{ color: '#64748b' }}>등록된 상점이 없습니다.</p>
      )}
      {!loading && !error && stores.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {stores.map((s) => (
            <li
              key={s.storeId}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <span style={{ fontWeight: '500' }}>{s.storeName}</span>
              <button
                type="button"
                onClick={() => handleStoreClick(s)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#2ecc71',
                  color: '#fff',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                구독 시작하기
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TempStoreListView;
