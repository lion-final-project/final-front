import React from 'react';
import Pagination from '../../../ui/Pagination';

const RidersTab = ({ riders, currentPage, itemsPerPage, setCurrentPage, setSelectedRecord }) => {
  const riderStats = [
    { label: '전체 배달원', value: `${riders.length}명`, color: '#38bdf8' },
    { label: '현재 운행중', value: `${riders.filter(r => r.status === '운행중').length}명`, color: '#10b981' },
    { label: '서류 확인 필요', value: `${riders.filter(r => r.idCardStatus !== '완료').length}명`, color: '#f59e0b' }
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {riderStats.map((stat, i) => (
          <div key={i} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>{stat.label}</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>배달 네트워크 관리</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input type="text" placeholder="이름/연락처 검색..." style={{ padding: '10px 16px', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '14px' }} />
            <button style={{ padding: '10px 20px', borderRadius: '10px', backgroundColor: '#334155', border: 'none', color: 'white', fontWeight: '700', cursor: 'pointer' }}>검색</button>
          </div>
        </div>
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '14px' }}>
                <th style={{ padding: '16px' }}>라이더명 / 연락처</th>
                <th style={{ padding: '16px' }}>신분증</th>
                <th style={{ padding: '16px' }}>정산 계좌 정보</th>
                <th style={{ padding: '16px' }}>상태</th>
                <th style={{ padding: '16px' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {riders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((rider, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #334155', fontSize: '15px' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '700' }}>{rider.name}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{rider.phone}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ fontSize: '12px', color: rider.idCardStatus === '완료' ? '#10b981' : '#f59e0b', fontWeight: '800' }}>
                      {rider.idCardStatus === '완료' ? '✓ 등록' : '⏳ 대기'}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '800' }}>{rider.bankName}</div>
                    <div style={{ fontSize: '12px', color: '#38bdf8' }}>{rider.accountNumber} ({rider.accountHolder})</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      fontSize: '12px',
                      backgroundColor: rider.status === '운행중' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: rider.status === '운행중' ? '#10b981' : '#ef4444',
                      padding: '4px 10px', borderRadius: '6px', fontWeight: '800'
                    }}>● {rider.status}</span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button
                      onClick={() => setSelectedRecord(rider)}
                      style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: 'none', cursor: 'pointer', fontWeight: '800' }}
                    >상세정보</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalItems={riders.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
};

export default RidersTab;
