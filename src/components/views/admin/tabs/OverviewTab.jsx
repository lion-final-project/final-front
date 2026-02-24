import React, { useState } from 'react';
import { getAdminTransactionDetail, getAdminTransactionOrderDetail } from '../../../../api/adminFinanceApi';

const formatNumber = (value) => Number(value || 0).toLocaleString();
const singleLineText = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const OverviewTab = ({
  chartPeriod,
  setChartPeriod,
  setActiveTab,
  riderSettlements,
  reports,
  approvalItems,
  inquiryList,
  overviewStats,
  transactionTrend,
}) => {
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailError, setDetailError] = useState('');
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);

  const labels = transactionTrend?.xLabels || transactionTrend?.xlabels || [];
  const values = transactionTrend?.yValues || transactionTrend?.yvalues || [];
  const hasTrendData = labels.length > 0;
  const totalAmount = values.reduce((sum, v) => sum + Number(v || 0), 0);
  const averageAmount = values.length ? Math.round(totalAmount / values.length) : 0;
  const maxValue = values.length ? Math.max(...values) : 0;
  const maxIndex = values.findIndex((v) => v === maxValue);
  const peakLabel = maxIndex >= 0 ? labels[maxIndex] : '-';
  const firstValue = Number(values[0] || 0);
  const lastValue = Number(values[values.length - 1] || 0);
  const changeRate = firstValue === 0 ? 0 : (((lastValue - firstValue) / firstValue) * 100);

  const pendingSettlementCount =
    (overviewStats?.pendingStoreSettlements || 0) +
    riderSettlements.filter((item) => item.status !== '지급 완료').length;
  const completedReportCount = reports.filter((item) => item.status === '처리완료').length;
  const pendingReportCount = overviewStats?.pendingReports || 0;
  const pendingInquiryCount = overviewStats?.pendingInquiries || inquiryList.filter((item) => item.status === '답변 대기').length;
  const alertCards = [
    { label: '정산 지연 위험', value: `${formatNumber(pendingSettlementCount)}건`, color: pendingSettlementCount > 0 ? '#ef4444' : '#10b981', action: () => setActiveTab('settlements') },
    { label: '미처리 신고', value: `${formatNumber(pendingReportCount)}건`, color: pendingReportCount > 0 ? '#f59e0b' : '#10b981', action: () => setActiveTab('reports') },
    { label: '미답변 문의', value: `${formatNumber(pendingInquiryCount)}건`, color: pendingInquiryCount > 0 ? '#f97316' : '#10b981', action: () => setActiveTab('inquiry') },
  ];

  const handleOpenDetail = async (label) => {
    try {
      setSelectedLabel(label);
      setDetailLoading(true);
      setDetailError('');
      const response = await getAdminTransactionDetail(chartPeriod, label);
      const normalized = response?.data ? response.data : response;
      setDetailData(normalized);
    } catch (error) {
      console.error('거래액 상세 주문 조회 실패:', error);
      setDetailError(error?.message || '주문 상세 내역 조회에 실패했습니다.');
      setDetailData({ content: [], totalCount: 0, totalAmount: 0, label });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenOrderDetail = async (storeOrderId) => {
    try {
      setOrderDetailLoading(true);
      const response = await getAdminTransactionOrderDetail(storeOrderId);
      const normalized = response?.data ? response.data : response;
      setSelectedOrderDetail(normalized);
    } catch (error) {
      console.error('주문 상세 정보 조회 실패:', error);
      alert(error?.message || '주문 상세 정보를 불러오지 못했습니다.');
    } finally {
      setOrderDetailLoading(false);
    }
  };

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(360px, 420px)', gap: '24px', marginBottom: '40px' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>주문 순매출 리포트</h3>
            <div style={{ display: 'flex', background: '#0f172a', padding: '4px', borderRadius: '8px', gap: '4px' }}>
              {['weekly', 'monthly', 'yearly'].map((period) => (
                <button
                  key={period}
                  onClick={() => setChartPeriod(period)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    backgroundColor: chartPeriod === period ? '#38bdf8' : 'transparent',
                    color: chartPeriod === period ? '#0f172a' : '#94a3b8',
                  }}
                >
                  {period === 'weekly' ? '주간' : period === 'monthly' ? '월간' : '연간'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '14px', marginBottom: '14px' }}>
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>기간 총 순매출</div>
              <div style={{ marginTop: '6px', fontSize: '20px', fontWeight: 900, color: '#38bdf8' }}>₩{formatNumber(totalAmount)}</div>
            </div>
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>평균 거래액</div>
              <div style={{ marginTop: '6px', fontSize: '20px', fontWeight: 900, color: '#e2e8f0' }}>₩{formatNumber(averageAmount)}</div>
            </div>
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>최대 거래 구간</div>
              <div style={{ marginTop: '6px', fontSize: '20px', fontWeight: 900, color: '#f59e0b' }}>{peakLabel}</div>
              <div style={{ marginTop: '2px', fontSize: '12px', color: '#cbd5e1' }}>₩{formatNumber(maxValue)}</div>
            </div>
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>증감률</div>
              <div style={{ marginTop: '6px', fontSize: '20px', fontWeight: 900, color: changeRate >= 0 ? '#10b981' : '#ef4444' }}>
                {changeRate >= 0 ? '+' : ''}{changeRate.toFixed(1)}%
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px', marginBottom: '14px' }}>
            {alertCards.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                style={{ backgroundColor: '#111827', border: '1px solid #334155', borderRadius: '10px', padding: '10px', textAlign: 'left', cursor: 'pointer' }}
              >
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{item.label}</div>
                <div style={{ marginTop: '4px', fontSize: '16px', fontWeight: 800, color: item.color }}>{item.value}</div>
              </button>
            ))}
          </div>

          <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '12px' }}>
            {!hasTrendData ? (
              <div style={{ color: '#94a3b8', fontSize: '13px' }}>거래액 데이터가 없습니다.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '8px' }}>
                {labels.map((label, idx) => (
                  <button
                    key={`${label}-${idx}`}
                    onClick={() => handleOpenDetail(label)}
                    style={{ backgroundColor: '#111827', border: '1px solid #334155', borderRadius: '10px', padding: '8px', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{label}</div>
                    <div style={{ marginTop: '4px', fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>₩{formatNumber(values[idx])}</div>
                  </button>
                ))}
              </div>
            )}
            <div style={{ color: '#94a3b8', fontSize: '11px', textAlign: 'right', paddingTop: '8px' }}>
              {chartPeriod === 'weekly' ? '최근 7일' : chartPeriod === 'monthly' ? '월간 일자 기준' : '연간 월 기준'} 집계
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155', minWidth: '360px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>통합 운영 지표</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
            {[
              { label: '전체 고객', value: `${formatNumber(overviewStats?.totalUsers)}명` },
              { label: '등록 마트', value: `${formatNumber(overviewStats?.approvedStores)}개` },
              { label: '진행 중 라이더', value: `${formatNumber(overviewStats?.deliveringRiders)}명` },
              { label: '정산 미처리', value: `${formatNumber(pendingSettlementCount)}건`, highlight: true, action: () => setActiveTab('settlements') },
              { label: '처리 대기 신고', value: `${formatNumber(pendingReportCount)}건`, highlight: true, action: () => setActiveTab('reports') },
              { label: '처리 완료 신고', value: `${formatNumber(completedReportCount)}건`, highlight: true, action: () => setActiveTab('reports') },
              { label: '승인 대기', value: `${formatNumber(approvalItems.length)}건`, highlight: true, action: () => setActiveTab('approvals') },
              {
                label: '미답변 1:1 문의',
                value: `${formatNumber(overviewStats?.pendingInquiries || inquiryList.filter((item) => item.status === '답변 대기').length)}건`,
                highlight: true,
                action: () => setActiveTab('inquiry'),
              },
            ].map((stat, i) => (
              <div
                key={i}
                onClick={stat.action}
                style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #334155', cursor: stat.action ? 'pointer' : 'default' }}
              >
                <span style={{ color: stat.highlight ? '#f59e0b' : '#94a3b8', fontWeight: stat.highlight ? '700' : 'normal' }}>{stat.label}</span>
                <span style={{ fontWeight: '700', color: stat.highlight ? '#f59e0b' : 'white' }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>최근 신고/분쟁 현황</h2>
          <div onClick={() => setActiveTab('reports')} style={{ color: '#38bdf8', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}>
            상세 보기 →
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {[
            { label: '확인 대기', count: reports.filter((item) => item.status === '확인 중').length, color: '#f59e0b' },
            { label: '처리 완료', count: reports.filter((item) => item.status === '처리완료').length, color: '#10b981' },
            { label: '답변 완료', count: inquiryList.filter((item) => item.status === '답변 완료').length, color: '#38bdf8' },
          ].map((stat, i) => (
            <div key={i} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>{stat.label}</div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: stat.color }}>
                {stat.count}
                <span style={{ fontSize: '14px', color: '#64748b', marginLeft: '4px' }}>건</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedLabel && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2300, backgroundColor: 'rgba(2,6,23,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '980px', maxHeight: '88vh', overflow: 'auto', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '24px' }}>
            <div
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 5,
                backgroundColor: '#1e293b',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                paddingBottom: '8px',
                borderBottom: '1px solid #334155',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>주문 상세 내역</h3>
                <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>
                  선택 라벨: {selectedLabel} | 건수: {detailData?.totalCount ?? 0}건 | 합계: ₩{formatNumber(detailData?.totalAmount ?? 0)}
                </div>
              </div>
              <button onClick={() => { setSelectedLabel(null); setDetailData(null); }} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '28px', cursor: 'pointer' }}>×</button>
            </div>

            {detailLoading ? (
              <div style={{ padding: '24px', color: '#cbd5e1' }}>불러오는 중...</div>
            ) : (
              <div className='table-responsive'>
                {detailError && (
                  <div style={{ marginBottom: '10px', color: '#fca5a5', fontSize: '13px' }}>
                    {detailError}
                  </div>
                )}
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '13px' }}>
                      <th style={{ padding: '12px' }}>주문번호</th>
                      <th style={{ padding: '12px' }}>마트명</th>
                      <th style={{ padding: '12px' }}>고객명</th>
                      <th style={{ padding: '12px' }}>금액</th>
                      <th style={{ padding: '12px' }}>상태</th>
                      <th style={{ padding: '12px' }}>주문시각</th>
                      <th style={{ padding: '12px' }}>상세</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detailData?.content || []).map((row) => (
                      <tr key={row.storeOrderId} style={{ borderBottom: '1px solid #334155', fontSize: '14px' }}>
                        <td style={{ padding: '12px', ...singleLineText }} title={row.orderNumber}>{row.orderNumber}</td>
                        <td style={{ padding: '12px', ...singleLineText }} title={row.storeName}>{row.storeName}</td>
                        <td style={{ padding: '12px', ...singleLineText }} title={row.customerName}>{row.customerName}</td>
                        <td style={{ padding: '12px', fontWeight: 700 }}>₩{formatNumber(row.amount)}</td>
                        <td style={{ padding: '12px', ...singleLineText }} title={row.orderStatus}>{row.orderStatus}</td>
                        <td style={{ padding: '12px', ...singleLineText }} title={row.orderedAt ? new Date(row.orderedAt).toLocaleString() : '-'}>
                          {row.orderedAt ? new Date(row.orderedAt).toLocaleString() : '-'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <button
                            onClick={() => handleOpenOrderDetail(row.storeOrderId)}
                            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: 'rgba(56,189,248,0.15)', color: '#38bdf8', fontWeight: 700, cursor: 'pointer' }}
                          >
                            상세보기
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!detailData?.content || detailData.content.length === 0) && (
                      <tr>
                        <td colSpan={7} style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>해당 구간의 주문이 없습니다.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedOrderDetail && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2350, backgroundColor: 'rgba(2,6,23,0.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '920px', maxHeight: '88vh', overflow: 'auto', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '24px' }}>
            <div
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 5,
                backgroundColor: '#1e293b',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
                paddingBottom: '8px',
                borderBottom: '1px solid #334155',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>주문 상세 정보</h3>
              <button onClick={() => setSelectedOrderDetail(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '28px', cursor: 'pointer' }}>×</button>
            </div>
            {orderDetailLoading ? (
              <div style={{ padding: '16px', color: '#cbd5e1' }}>불러오는 중...</div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '12px' }}><div style={{ fontSize: '12px', color: '#94a3b8' }}>마트</div><div style={{ marginTop: '4px', fontWeight: 700, ...singleLineText }} title={selectedOrderDetail.storeName}>{selectedOrderDetail.storeName}</div></div>
                  <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '12px' }}><div style={{ fontSize: '12px', color: '#94a3b8' }}>주문번호</div><div style={{ marginTop: '4px', fontWeight: 700, ...singleLineText }} title={selectedOrderDetail.orderNumber}>{selectedOrderDetail.orderNumber}</div></div>
                  <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '12px' }}><div style={{ fontSize: '12px', color: '#94a3b8' }}>배달기사</div><div style={{ marginTop: '4px', fontWeight: 700, ...singleLineText }} title={selectedOrderDetail.riderName || '-'}>{selectedOrderDetail.riderName || '-'}</div><div style={{ fontSize: '12px', color: '#cbd5e1', ...singleLineText }} title={selectedOrderDetail.riderPhone || '-'}>{selectedOrderDetail.riderPhone || '-'}</div></div>
                  <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '12px' }}><div style={{ fontSize: '12px', color: '#94a3b8' }}>배달비</div><div style={{ marginTop: '4px', fontWeight: 700 }}>₩{formatNumber(selectedOrderDetail.deliveryFee)}</div></div>
                  <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '12px' }}><div style={{ fontSize: '12px', color: '#94a3b8' }}>주문시간</div><div style={{ marginTop: '4px', fontWeight: 700, ...singleLineText }} title={selectedOrderDetail.orderedAt ? new Date(selectedOrderDetail.orderedAt).toLocaleString() : '-'}>{selectedOrderDetail.orderedAt ? new Date(selectedOrderDetail.orderedAt).toLocaleString() : '-'}</div></div>
                  <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '12px' }}><div style={{ fontSize: '12px', color: '#94a3b8' }}>결제/환불</div><div style={{ marginTop: '4px', fontWeight: 700, ...singleLineText }} title={selectedOrderDetail.paymentStatus}>{selectedOrderDetail.paymentStatus}</div><div style={{ fontSize: '12px', color: '#cbd5e1', ...singleLineText }} title={`환불상태: ${selectedOrderDetail.refundStatus}, 환불금액: ₩${formatNumber(selectedOrderDetail.refundAmount)}`}>환불상태: {selectedOrderDetail.refundStatus}, 환불금액: ₩{formatNumber(selectedOrderDetail.refundAmount)}</div></div>
                </div>
                <div style={{ marginBottom: '10px', color: '#cbd5e1', fontSize: '13px', ...singleLineText }} title={`배송지: ${selectedOrderDetail.deliveryAddress || '-'} | 배달 위치: ${selectedOrderDetail.deliveryLocation || '-'}`}>
                  배송지: {selectedOrderDetail.deliveryAddress || '-'} | 배달 위치: {selectedOrderDetail.deliveryLocation || '-'}
                </div>
                <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '12px' }}>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>주문 상품 목록</div>
                  <ul style={{ margin: 0, paddingLeft: '18px' }}>
                    {(selectedOrderDetail.products || []).map((p, idx) => (
                      <li key={`${p.name}-${idx}`} style={{ marginBottom: '6px' }}>
                        {p.name} / {p.quantity}개 / ₩{formatNumber(p.unitPrice)}
                      </li>
                    ))}
                    {(!selectedOrderDetail.products || selectedOrderDetail.products.length === 0) && <li>상품 정보가 없습니다.</li>}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default OverviewTab;
