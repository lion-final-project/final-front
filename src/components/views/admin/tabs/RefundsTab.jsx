import React, { useState } from 'react';
import Pagination from '../../../ui/Pagination';

const RefundsTab = ({
    refunds,
    pageInfo,
    onPageChange,
    onOpenDetail
}) => {
    const totalItems = pageInfo?.totalElements || 0;
    const itemsPerPage = pageInfo?.size || 10;
    const currentPage = (pageInfo?.page || 0) + 1;

    // We don't have separate stats from API yet, so we'll compute basic ones from pageInfo
    const stats = {
        total: totalItems,
        requested: refunds.filter(r => r.refundStatus === 'REQUESTED').length,
        approved: refunds.filter(r => r.refundStatus === 'APPROVED').length,
        rejected: refunds.filter(r => r.refundStatus === 'REJECTED').length
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                {[
                    { label: '전체 환불 내역', value: `${stats.total}건`, color: '#38bdf8' },
                    { label: '승인 대기', value: `${stats.requested}건`, color: '#f59e0b' },
                    { label: '승인 완료', value: `${stats.approved}건`, color: '#10b981' },
                    { label: '환불 거절', value: `${stats.rejected}건`, color: '#ef4444' }
                ].map((stat, i) => (
                    <div key={i} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155' }}>
                        <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>{stat.label}</div>
                        <div style={{ fontSize: '24px', fontWeight: '900', color: stat.color }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>환불 요청 내역</h2>
                </div>

                <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '14px' }}>
                                <th style={{ padding: '16px' }}>환불 번호</th>
                                <th style={{ padding: '16px' }}>요청 일시</th>
                                <th style={{ padding: '16px' }}>매장명 / 고객명</th>
                                <th style={{ padding: '16px' }}>환불 금액</th>
                                <th style={{ padding: '16px' }}>상태</th>
                                <th style={{ padding: '16px' }}>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {refunds.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                        환불 요청 내역이 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                refunds.map((item) => {
                                    let statusColor = '#94a3b8';
                                    let statusBg = 'rgba(148, 163, 184, 0.1)';
                                    let statusLabel = item.refundStatus;

                                    if (item.refundStatus === 'REQUESTED') {
                                        statusColor = '#f59e0b';
                                        statusBg = 'rgba(245, 158, 11, 0.1)';
                                        statusLabel = '승인 대기';
                                    } else if (item.refundStatus === 'APPROVED') {
                                        statusColor = '#10b981';
                                        statusBg = 'rgba(16, 185, 129, 0.1)';
                                        statusLabel = '승인 완료';
                                    } else if (item.refundStatus === 'REJECTED') {
                                        statusColor = '#ef4444';
                                        statusBg = 'rgba(239, 68, 68, 0.1)';
                                        statusLabel = '환불 불가';
                                    }

                                    return (
                                        <tr key={item.refundId} style={{ borderBottom: '1px solid #334155', fontSize: '15px' }}>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontWeight: '700' }}>#{item.refundId}</div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontSize: '13px', color: '#cbd5e1' }}>
                                                    {new Date(item.requestedAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontWeight: '700', color: '#38bdf8' }}>{item.storeName}</div>
                                                <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '2px' }}>{item.customerName}</div>
                                            </td>
                                            <td style={{ padding: '16px', fontWeight: '800' }}>
                                                {item.refundAmount == null ? '미정' : `₩${item.refundAmount.toLocaleString()}`}
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{
                                                    fontSize: '12px',
                                                    backgroundColor: statusBg,
                                                    color: statusColor,
                                                    padding: '4px 10px', borderRadius: '6px', fontWeight: '800'
                                                }}>
                                                    ● {statusLabel}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onOpenDetail(item.refundId);
                                                    }}
                                                    style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: 'none', cursor: 'pointer', fontWeight: '800' }}
                                                >
                                                    상세보기
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={(p) => onPageChange(p - 1)}
                />
            </div>
        </div>
    );
};

export default RefundsTab;
