import React from 'react';

const SettlementDetailModal = ({ settlement, onClose }) => {
  if (!settlement) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'white', width: '95%', maxWidth: '1200px', borderRadius: '24px', padding: 0, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        <div style={{ padding: '24px 32px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>정산 상세 내역 ({settlement.month})</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer' }}>×</button>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', color: '#64748b' }}>상점아이디(MID): <span style={{ fontWeight: '700', color: '#1e293b' }}>{settlement.mid}</span></div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>정산 기간: <span style={{ fontWeight: '700', color: '#1e293b' }}>{settlement.period}</span></div>
            <span style={{ marginLeft: 'auto', backgroundColor: '#f0fdf4', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>{settlement.status}</span>
          </div>
        </div>
        <div style={{ padding: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
            <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>총 매출액 (A)</div>
              <div style={{ fontSize: '18px', fontWeight: '800' }}>{settlement.rawAmount}</div>
            </div>
            <div style={{ padding: '20px', backgroundColor: '#fff1f2', borderRadius: '16px', border: '1px solid #fecdd3' }}>
              <div style={{ fontSize: '12px', color: '#e11d48', marginBottom: '8px' }}>총 PG 수수료 (B)</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#e11d48' }}>{settlement.fee}</div>
            </div>
            <div style={{ padding: '20px', backgroundColor: '#f1f5f9', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
              <div style={{ fontSize: '12px', color: '#475569', marginBottom: '8px' }}>PG 수수료 합 (D=B+C)</div>
              <div style={{ fontSize: '18px', fontWeight: '800' }}>{settlement.fee}</div>
            </div>
            <div style={{ padding: '20px', backgroundColor: '#ecfdf5', borderRadius: '16px', border: '1px solid #a7f3d0' }}>
              <div style={{ fontSize: '12px', color: '#059669', marginBottom: '8px' }}>당월 정산액 (E=A-D)</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#059669' }}>{settlement.amount}</div>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>정산액 상세 내역</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc', zIndex: 1 }}>
                  <tr style={{ textAlign: 'center', borderBottom: '1px solid #f1f5f9', fontSize: '11px', color: '#64748b' }}>
                    <th rowSpan="2" style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', width: '80px' }}>결제수단</th>
                    <th rowSpan="2" style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', width: '100px' }}>정산액 입금일</th>
                    <th rowSpan="2" style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', width: '100px' }}>매출일</th>
                    <th rowSpan="2" style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', width: '100px' }}>상점아이디(MID)</th>
                    <th rowSpan="2" style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', width: '80px' }}>결제+취소 건수</th>
                    <th rowSpan="2" style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', width: '120px' }}>매출액 (A)</th>
                    <th colSpan="5" style={{ padding: '8px', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>PG 수수료</th>
                    <th rowSpan="2" style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', width: '100px' }}>PG 부가세 (C)</th>
                    <th rowSpan="2" style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', width: '110px' }}>PG 수수료 합 (D)=(B+C)</th>
                    <th rowSpan="2" style={{ padding: '12px 8px', borderRight: 0, width: '120px' }}>당일 정산액 (E)=(A-D)</th>
                  </tr>
                  <tr style={{ textAlign: 'center', borderBottom: '1px solid #f1f5f9', fontSize: '10px', color: '#94a3b8' }}>
                    <th style={{ padding: '8px', borderRight: '1px solid #f1f5f9' }}>일반</th>
                    <th style={{ padding: '8px', borderRight: '1px solid #f1f5f9' }}>할부</th>
                    <th style={{ padding: '8px', borderRight: '1px solid #f1f5f9' }}>포인트</th>
                    <th style={{ padding: '8px', borderRight: '1px solid #f1f5f9' }}>기타</th>
                    <th style={{ padding: '8px', borderRight: '1px solid #f1f5f9', color: '#64748b', fontWeight: '700' }}>PG수수료계 (B)</th>
                  </tr>
                </thead>
                <tbody>
                  {(settlement.breakdown || []).map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: idx === (settlement.breakdown?.length || 1) - 1 ? 'none' : '1px solid #f1f5f9', fontSize: '11px', textAlign: 'center' }}>
                      <td style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9' }}>{item.method}</td>
                      <td style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', color: '#64748b' }}>{item.depositDate}</td>
                      <td style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', color: '#64748b' }}>{item.salesDate}</td>
                      <td style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9' }}>{settlement.mid}</td>
                      <td style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9' }}>{item.count}건</td>
                      <td style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', textAlign: 'right', fontWeight: '600' }}>{item.salesA}</td>
                      <td style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', textAlign: 'right' }}>{item.feeB}</td>
                      <td style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', textAlign: 'right' }}>-</td>
                      <td style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', textAlign: 'right' }}>-</td>
                      <td style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', textAlign: 'right' }}>-</td>
                      <td style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', textAlign: 'right', fontWeight: '700' }}>{item.feeB}</td>
                      <td style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', textAlign: 'right' }}>{item.vatC}</td>
                      <td style={{ padding: '12px 8px', borderRight: '1px solid #f1f5f9', textAlign: 'right', fontWeight: '700' }}>{item.totalD}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '800', backgroundColor: '#fdfcfe' }}>{item.netE}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', gap: '12px' }}>
            <button onClick={onClose} style={{ padding: '14px 40px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}>닫기</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettlementDetailModal;
