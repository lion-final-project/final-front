import React, { useEffect } from 'react';

const singleLineText = {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
};

const formatNumber = (value) => value == null ? '미정' : `₩${Number(value).toLocaleString()}`;

const translateReason = (reason) => {
    if (!reason) return '사유 없음';

    const reasonMap = {
        'CUSTOMER_CANCEL': '고객 취소',
        'STORE_CANCEL': '매장 취소',
        'PLATFORM_CANCEL': '플랫폼 취소',
        'simple_change': '단순 변심',
        'delivery_delay': '배송 지연',
        'product_out_of_stock': '상품 품절',
        'wrong_order': '주문 실수',
        'CUSTOMER_REFUND': '환불 요청'
    };

    // 만약 매핑 맵에 존재하면 해당 한글 문자열을 반환하고, 아니면 (사용자가 직접 입력한 값 등) 원래 문자열 반환
    return reasonMap[reason] || reason;
};

const RefundDetailModal = ({ isOpen, onClose, refund, onApprove, onReject }) => {
    if (!isOpen || !refund) return null;

    const [responsibility, setResponsibility] = React.useState(refund.responsibility || 'STORE');

    useEffect(() => {
        setResponsibility(refund.responsibility || 'STORE');
    }, [refund]);

    const handleApprove = () => {
        onApprove(refund.refundId, 0, responsibility);
    };

    const handleReject = () => {
        onReject(refund.refundId);
    };

    let statusColor = '#94a3b8';
    let statusBg = 'rgba(148, 163, 184, 0.1)';
    let statusLabel = refund.refundStatus;

    if (refund.refundStatus === 'REQUESTED') {
        statusColor = '#f59e0b';
        statusBg = 'rgba(245, 158, 11, 0.1)';
        statusLabel = '승인 대기';
    } else if (refund.refundStatus === 'APPROVED') {
        statusColor = '#10b981';
        statusBg = 'rgba(16, 185, 129, 0.1)';
        statusLabel = '승인 완료';
    } else if (refund.refundStatus === 'REJECTED') {
        statusColor = '#ef4444';
        statusBg = 'rgba(239, 68, 68, 0.1)';
        statusLabel = '환불 불가';
    }

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2350, backgroundColor: 'rgba(2,6,23,0.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: '800px', maxHeight: '88vh', overflow: 'auto', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '18px', padding: '24px' }}>
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
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'white' }}>환불 상세 정보 (ID: #{refund.refundId})</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '28px', cursor: 'pointer' }}>×</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>상태</div>
                        <div style={{ marginTop: '4px', fontWeight: 700 }}>
                            <span style={{ fontSize: '12px', backgroundColor: statusBg, color: statusColor, padding: '4px 10px', borderRadius: '6px', fontWeight: '800' }}>
                                ● {statusLabel}
                            </span>
                        </div>
                    </div>
                    <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>요청 일시</div>
                        <div style={{ marginTop: '4px', fontWeight: 700, color: 'white' }}>{new Date(refund.requestedAt).toLocaleString()}</div>
                    </div>
                    <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>매장명</div>
                        <div style={{ marginTop: '4px', fontWeight: 700, color: '#38bdf8' }}>{refund.storeName} <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 400 }}>(ID: {refund.storeId})</span></div>
                    </div>
                    <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>고객명</div>
                        <div style={{ marginTop: '4px', fontWeight: 700, color: 'white' }}>{refund.customerName} <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 400 }}>(ID: {refund.customerId})</span></div>
                    </div>
                    {refund.refundedAt && (
                        <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '12px' }}>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>처리 일시</div>
                            <div style={{ marginTop: '4px', fontWeight: 700, color: '#10b981' }}>{new Date(refund.refundedAt).toLocaleString()}</div>
                        </div>
                    )}
                </div>

                <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>
                    <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold' }}>환불/취소 사유</div>
                    <div style={{ color: 'white', whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.5' }}>
                        {translateReason(refund.refundReason)}
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #334155', marginTop: '20px', paddingTop: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: 'white' }}>환불 처리 및 승인</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>귀책 사유</label>
                            <select
                                value={responsibility}
                                onChange={(e) => setResponsibility(e.target.value)}
                                disabled={refund.refundStatus !== 'REQUESTED'}
                                style={{ width: '100%', padding: '16px', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '16px', outline: 'none', cursor: 'pointer' }}
                            >
                                <option value="STORE">매장</option>
                                <option value="CUSTOMER">고객</option>
                                <option value="RIDER">배달원</option>
                                <option value="PLATFORM">플랫폼</option>
                            </select>
                        </div>
                    </div>
                </div>

                {refund.refundStatus === 'REQUESTED' && (
                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #334155' }}>
                        <button
                            onClick={handleReject}
                            style={{ flex: 1, padding: '14px', borderRadius: '10px', backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
                        >
                            거절
                        </button>
                        <button
                            onClick={handleApprove}
                            style={{ flex: 1, padding: '14px', borderRadius: '10px', backgroundColor: '#38bdf8', border: 'none', color: '#0f172a', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
                        >
                            승인
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RefundDetailModal;
