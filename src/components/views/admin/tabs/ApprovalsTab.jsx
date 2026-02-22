import React from 'react';
import Pagination from '../../../ui/Pagination';

const ApprovalsTab = (props) => {
  const { approvalItems, approvalFilter, approvalStatusFilter, setApprovalFilter, setApprovalStatusFilter, handleOpenApproval, currentPage, itemsPerPage, setCurrentPage } = props;
  const filteredApprovals = approvalItems.filter(item => {
    const matchesCategory = approvalFilter === 'ALL' || item.category === approvalFilter;
    const matchesStatus = approvalStatusFilter === 'ALL' || (approvalStatusFilter === 'PENDING' && item.rawStatus === 'PENDING') || (approvalStatusFilter === 'HOLD' && item.rawStatus === 'HELD') || (approvalStatusFilter === 'REJECTED' && item.rawStatus === 'REJECTED');
    return matchesCategory && matchesStatus;
  });
  return (
    <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid #334155', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setApprovalFilter('ALL')} style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', backgroundColor: approvalFilter === 'ALL' ? '#38bdf8' : 'transparent', color: approvalFilter === 'ALL' ? '#0f172a' : '#94a3b8', fontWeight: '800', cursor: 'pointer' }}>전체 보기</button>
          <button onClick={() => setApprovalFilter('STORE')} style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', backgroundColor: approvalFilter === 'STORE' ? '#38bdf8' : 'transparent', color: approvalFilter === 'STORE' ? '#0f172a' : '#94a3b8', fontWeight: '800', cursor: 'pointer' }}>마트 신청</button>
          <button onClick={() => setApprovalFilter('RIDER')} style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', backgroundColor: approvalFilter === 'RIDER' ? '#38bdf8' : 'transparent', color: approvalFilter === 'RIDER' ? '#0f172a' : '#94a3b8', fontWeight: '800', cursor: 'pointer' }}>배달원 신청</button>
        </div>
        <div style={{ display: 'flex', gap: '8px', backgroundColor: '#0f172a', padding: '4px', borderRadius: '12px' }}>
          {['ALL', 'PENDING', 'HOLD', 'REJECTED'].map(s => (
            <button key={s} onClick={() => setApprovalStatusFilter(s)} style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', border: 'none', backgroundColor: approvalStatusFilter === s ? '#334155' : 'transparent', color: approvalStatusFilter === s ? 'white' : '#64748b' }}>
              {s === 'ALL' ? '전체' : s === 'PENDING' ? '심사대기' : s === 'HOLD' ? '보완필요' : '거절'}
            </button>
          ))}
        </div>
      </div>
      <div className="table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '14px' }}>
              <th style={{ padding: '16px' }}>유형</th>
              <th style={{ padding: '16px' }}>이름/상호명</th>
              <th style={{ padding: '16px' }}>신청일</th>
              <th style={{ padding: '16px' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredApprovals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '16px' }}><span style={{ backgroundColor: item.color, padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{item.type}</span></td>
                <td style={{ padding: '16px' }}><button onClick={() => handleOpenApproval(item, 'documents')} style={{ background: 'none', border: 'none', padding: 0, color: '#38bdf8', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}>{item.name}</button></td>
                <td style={{ padding: '16px' }}>{item.date}</td>
                <td style={{ padding: '16px' }}><button onClick={() => handleOpenApproval(item)} style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: 'none', fontWeight: '700', cursor: 'pointer' }}>상세보기</button></td>
              </tr>
            ))}
            {filteredApprovals.length === 0 && <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>대기 중인 신청 건이 없습니다.</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={currentPage} totalItems={filteredApprovals.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
    </div>
  );
};

export default ApprovalsTab;
