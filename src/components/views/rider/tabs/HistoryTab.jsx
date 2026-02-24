import React, { useState, useEffect, useCallback } from 'react';
import { getRiderDeliveryHistory, getDeliveryDetail } from '../../../../api/riderApi';

const HistoryTab = ({
  expandedHistoryItems,
  toggleHistoryExpand,
  setSelectedReceipt,
  handleOpenReportModal,
}) => {
  const [historyData, setHistoryData] = useState([]);
  const [detailCache, setDetailCache] = useState({}); // deliveryId -> detail
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const SIZE = 10;

  const fetchHistory = useCallback(async (targetPage) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getRiderDeliveryHistory(targetPage, SIZE);
      const data = response.data || response;
      // API 응답이 Page 객체인 경우
      if (data?.content) {
        setHistoryData(data.content);
        setTotalPages(data.totalPages || 0);
      } else if (Array.isArray(data)) {
        setHistoryData(data);
        setTotalPages(1);
      } else {
        setHistoryData([]);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('배달 이력 조회 실패:', err);
      setError('배달 이력을 불러오지 못했습니다.');
      setHistoryData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(page);
  }, [page, fetchHistory]);

  // 상세 조회 (expand 시 lazy loading)
  const handleToggleExpand = async (deliveryId) => {
    toggleHistoryExpand(deliveryId);

    // 펼칠 때만 상세 조회 (캐시 없으면)
    if (!expandedHistoryItems.has(deliveryId) && !detailCache[deliveryId]) {
      try {
        const res = await getDeliveryDetail(deliveryId);
        const detail = res?.data || res;
        setDetailCache(prev => ({ ...prev, [deliveryId]: detail }));
      } catch (err) {
        console.error('배달 상세 조회 실패:', err);
      }
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}`;
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'DELIVERED': return '배달완료';
      case 'CANCELLED': return '취소됨';
      default: return status;
    }
  };

  const totalFee = historyData
    .filter(item => item.deliveryStatus === 'DELIVERED')
    .reduce((sum, item) => sum + (item.deliveryFee || 0), 0);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800' }}>배달 히스토리</h2>
      </div>

      <div style={{ backgroundColor: '#1e293b', padding: '16px 20px', borderRadius: '12px', marginBottom: '20px', borderLeft: '4px solid #38bdf8' }}>
        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>이번 페이지 총 수익</div>
        <div style={{ fontSize: '20px', fontWeight: '900', color: '#38bdf8' }}>{totalFee.toLocaleString()}원</div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</div>
          <div style={{ fontWeight: '700' }}>이력을 불러오는 중...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
          <div style={{ color: '#ef4444', fontWeight: '700', marginBottom: '16px' }}>{error}</div>
          <button
            onClick={() => fetchHistory(page)}
            style={{ padding: '10px 20px', borderRadius: '10px', backgroundColor: '#38bdf8', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}
          >다시 시도</button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && historyData.length === 0 && (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <div style={{ fontWeight: '700', fontSize: '16px' }}>배달 이력이 없습니다</div>
        </div>
      )}

      {/* History List */}
      {!isLoading && !error && historyData.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {historyData.map((item) => {
            const isCancelled = item.deliveryStatus === 'CANCELLED';
            const detail = detailCache[item.deliveryId];

            return (
              <div key={item.deliveryId} style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {formatDateTime(item.deliveredAt || item.cancelledAt || item.createdAt)}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{
                      fontSize: '11px',
                      backgroundColor: isCancelled ? 'rgba(239, 68, 68, 0.2)' : '#0f172a',
                      color: isCancelled ? '#ef4444' : '#2ecc71',
                      padding: '4px 10px', borderRadius: '6px', fontWeight: '900'
                    }}>{getStatusLabel(item.deliveryStatus)}</span>
                    {(item.deliveryStatus === 'DELIVERED' && item.isSettled) && (
                      <span style={{
                        fontSize: '11px',
                        backgroundColor: 'rgba(56, 189, 248, 0.2)',
                        color: '#38bdf8',
                        padding: '4px 10px', borderRadius: '6px', fontWeight: '900'
                      }}>정산완료</span>
                    )}
                  </div>
                </div>

                <div
                  onClick={() => handleToggleExpand(item.deliveryId)}
                  style={{ marginBottom: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '800' }}>{item.storeName || '마트'}</div>
                    <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>{item.deliveryAddress}</div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#94a3b8', transform: expandedHistoryItems.has(item.deliveryId) ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>▼</span>
                </div>

                {expandedHistoryItems.has(item.deliveryId) && (
                  <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', marginBottom: '16px', animation: 'fadeIn 0.2s ease-out' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px', fontWeight: '700' }}>배달 상세 내역</div>
                    <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                      <span style={{ color: '#94a3b8' }}>주문번호:</span> {item.orderNumber}
                    </div>
                    {item.cancelReason && (
                      <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                        <span style={{ color: '#94a3b8' }}>취소 사유:</span> <span style={{ color: '#ef4444' }}>{item.cancelReason}</span>
                      </div>
                    )}
                    {/* 상세 정보 (lazy loaded) */}
                    {detail?.deliveryPhotoUrls && detail.deliveryPhotoUrls.length > 0 && (
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px', fontWeight: '700' }}>증빙 사진</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {detail.deliveryPhotoUrls.map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt={`증빙 ${idx + 1}`}
                              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #334155' }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '18px', color: isCancelled ? '#94a3b8' : '#38bdf8', fontWeight: '900' }}>
                    {isCancelled ? '0원' : `+${(item.deliveryFee || 0).toLocaleString()}원`}
                  </div>
                  {!isCancelled && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setSelectedReceipt(item)}
                        style={{ fontSize: '12px', color: '#94a3b8', background: 'transparent', border: '1px solid #334155', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}
                      >영수증 보기</button>
                      <button
                        onClick={() => handleOpenReportModal(item)}
                        style={{ fontSize: '12px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #fee2e2', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '800' }}
                      >신고</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: '1px solid #334155',
              backgroundColor: page === 0 ? '#1e293b' : '#334155',
              color: page === 0 ? '#64748b' : 'white',
              fontWeight: '700', cursor: page === 0 ? 'not-allowed' : 'pointer'
            }}
          >이전</button>
          <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '700' }}>
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: '1px solid #334155',
              backgroundColor: page >= totalPages - 1 ? '#1e293b' : '#334155',
              color: page >= totalPages - 1 ? '#64748b' : 'white',
              fontWeight: '700', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer'
            }}
          >다음</button>
        </div>
      )}
    </div>
  );
};

export default HistoryTab;
