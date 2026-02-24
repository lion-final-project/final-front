import React, { useState, useEffect } from 'react';
import { getRiderSettlements, getRiderSettlementDetail } from '../../../../api/riderApi';

const EarningsTab = ({ earnings, expandedSettlements, setExpandedSettlements }) => {
  const [settlementRecords, setSettlementRecords] = useState([]);
  const [settlementDetails, setSettlementDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSettlements = async () => {
      setIsLoading(true);
      try {
        // Query recent 6 months settlements
        const res = await getRiderSettlements();
        if (res && res.data) {
          // res.data is expected to have 'content' array
          setSettlementRecords(res.data.content || []);
        }
      } catch (error) {
        console.error('Failed to fetch rider settlements:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettlements();
  }, []);

  const handleExpand = async (settlementId) => {
    const newSet = new Set(expandedSettlements);
    if (newSet.has(settlementId)) {
      newSet.delete(settlementId);
      setExpandedSettlements(newSet);
    } else {
      newSet.add(settlementId);
      setExpandedSettlements(newSet);
      if (!settlementDetails[settlementId]) {
        try {
          const res = await getRiderSettlementDetail(settlementId);
          if (res && res.data) {
            setSettlementDetails(prev => ({ ...prev, [settlementId]: res.data.deliveries }));
          }
        } catch (error) {
          console.error('Failed to fetch settlement detail:', error);
        }
      }
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'COMPLETED': return '입금완료';
      case 'PENDING': return '정산예정';
      case 'FAILED': return '입금실패';
      default: return status;
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>정산 내역</h2>
      <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', marginBottom: '32px', borderLeft: '4px solid #10b981' }}>
        <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '4px' }}>이번 주 정산 예정 금액</div>
        <div style={{ fontSize: '28px', fontWeight: '900', color: '#10b981' }}>{earnings?.weekly?.toLocaleString() || 0}원</div>
        <div style={{ color: '#64748b', fontSize: '12px', marginTop: '6px' }}>정산일: 매주 수요일</div>
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #334155', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>정산 계좌</span>
          <span style={{ color: '#cbd5e1', fontWeight: '600' }}>카카오뱅크 3333-**-******</span>
        </div>
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>최근 정산 기록</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {isLoading && <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>불러오는 중...</div>}
        {!isLoading && settlementRecords.length === 0 && (
          <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>정산 내역이 없습니다.</div>
        )}
        {settlementRecords.map((item) => (
          <div key={item.settlementId} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div onClick={() => handleExpand(item.settlementId)} style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px' }}>{item.settlementAmount?.toLocaleString() || 0}원 정산</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{item.settlementPeriodStart} ~ {item.settlementPeriodEnd}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ color: item.status === 'COMPLETED' ? '#2ecc71' : (item.status === 'PENDING' ? '#f59e0b' : '#ef4444'), fontWeight: '800', fontSize: '13px' }}>{getStatusLabel(item.status)}</div>
                <span style={{ fontSize: '10px', color: '#94a3b8', transform: expandedSettlements.has(item.settlementId) ? 'rotate(180deg)' : 'none' }}>▼</span>
              </div>
            </div>
            {expandedSettlements.has(item.settlementId) && (
              <div style={{ backgroundColor: '#0f172a', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', color: '#94a3b8', animation: 'fadeIn 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>총 배달수익</span>
                  <span>{item.totalEarning?.toLocaleString() || 0}원</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>환불 차감액</span>
                  <span style={{ color: '#ef4444' }}>-{item.refundAdjustment?.toLocaleString() || 0}원</span>
                </div>
                <div style={{ borderTop: '1px solid #334155', margin: '8px 0' }}></div>
                {settlementDetails[item.settlementId] ? (
                  <div>
                    <div style={{ fontWeight: '700', marginBottom: '8px', color: '#cbd5e1' }}>배달 상세 내역 ({settlementDetails[item.settlementId].length}건)</div>
                    {settlementDetails[item.settlementId].map(delivery => (
                      <div key={delivery.deliveryId} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '12px' }}>
                        <span>배달 #{delivery.deliveryId}</span>
                        <span>{delivery.netAmount?.toLocaleString() || 0}원</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>상세 내역 불러오는 중...</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EarningsTab;
