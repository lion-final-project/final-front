import React from 'react';
import Pagination from '../../../ui/Pagination';

const getRoleColor = (type) => { if (type === 'USER') return '#38bdf8'; if (type === 'STORE') return '#10b981'; if (type === 'RIDER') return '#f59e0b'; return '#94a3b8'; };
const getRoleLabel = (type) => { if (type === 'USER') return '사용자'; if (type === 'STORE') return '마트'; if (type === 'RIDER') return '라이더'; return '관리자'; };

const ReportsTab = ({
  reports, reportsFilter, reportsSearch, setReportsFilter, setReportsSearch,
  setSelectedReport, currentPage, itemsPerPage, setCurrentPage,
}) => {
  const pendingCount = reports.filter(r => r.status === '확인 중').length;
  const resolvedCount = reports.filter(r => r.status === '처리완료' || r.status === '답변완료').length;
  const filteredReports = reports.filter(report => {
    const matchesStatus = reportsFilter === 'ALL' || (reportsFilter === 'RESOLVED' && (report.status === '처리완료' || report.status === '답변완료')) || (reportsFilter === 'UNRESOLVED' && report.status === '확인 중');
    const matchesSearch = (report.reported && report.reported.name.toLowerCase().includes(reportsSearch.toLowerCase())) || (report.reporter && report.reporter.name.toLowerCase().includes(reportsSearch.toLowerCase())) || (report.orderNo && report.orderNo.toLowerCase().includes(reportsSearch.toLowerCase()));
    return matchesStatus && matchesSearch;
  });
  return (
    <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>신고 및 분쟁 관리</h2>
        <div style={{ display: 'flex', gap: '24px', color: '#94a3b8', fontSize: '14px', fontWeight: '700' }}>
          <span>확인중인 신고수: {pendingCount}개</span>
          <span>처리완료 신고 수: {resolvedCount}개</span>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input type="text" placeholder="배달원명/마트명 검색..." value={reportsSearch} onChange={(e) => setReportsSearch(e.target.value)}
              style={{ padding: '8px 16px', paddingLeft: '36px', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '13px', width: '220px' }} />
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
          </div>
          <div style={{ display: 'flex', background: '#0f172a', padding: '4px', borderRadius: '10px', gap: '4px' }}>
            {['ALL', 'UNRESOLVED', 'RESOLVED'].map(f => (
              <button key={f} onClick={() => setReportsFilter(f)} style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', border: 'none', backgroundColor: reportsFilter === f ? '#38bdf8' : 'transparent', color: reportsFilter === f ? '#0f172a' : '#94a3b8' }}>{f === 'ALL' ? '전체' : f === 'UNRESOLVED' ? '미처리' : '해결됨'}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((report, i) => (
          <div key={i} style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>{report.type}</span>
                <span style={{ color: '#64748b', fontSize: '12px' }}>#{report.orderNo}</span>
              </div>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>{report.time}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', fontSize: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: `${getRoleColor(report.reporter.type)}20`, color: getRoleColor(report.reporter.type), fontWeight: '700' }}>{getRoleLabel(report.reporter.type)}</span>
                <span style={{ fontWeight: '700' }}>{report.reporter.name}</span>
              </div>
              <span style={{ color: '#334155' }}>→</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: `${getRoleColor(report.reported.type)}20`, color: getRoleColor(report.reported.type), fontWeight: '700' }}>{getRoleLabel(report.reported.type)}</span>
                <span style={{ fontWeight: '700' }}>{report.reported.name}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: report.status === '확인 중' ? '#f59e0b' : '#10b981' }}>● {report.status}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setSelectedReport(report)} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#1e293b', color: '#94a3b8', border: '1px solid #334155', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}>내용 보기</button>
                {report.status !== '처리완료' && <button onClick={() => setSelectedReport(report)} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: 'none', fontSize: '13px', cursor: 'pointer', fontWeight: '800' }}>결과 입력</button>}
              </div>
            </div>
          </div>
        ))}
        {filteredReports.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>신고 내역이 없습니다.</div>}
      </div>
      <Pagination currentPage={currentPage} totalItems={filteredReports.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
    </div>
  );
};

export default ReportsTab;
