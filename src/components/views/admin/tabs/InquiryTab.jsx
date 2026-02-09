import React from 'react';
import Pagination from '../../../ui/Pagination';

const InquiryTab = (props) => {
  const { inquiryList, inquiryFilter, setInquiryFilter, inquiryPage, setInquiryPage, itemsPerPage, selectedInquiry, setSelectedInquiry, inquiryAnswer, setInquiryAnswer, fetchInquiryDetail, onAnswerSubmit, isSubmittingAnswer, fetchInquiries } = props;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>전체 문의 내역</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setInquiryFilter('ALL')} style={{ padding: '8px 16px', borderRadius: '8px', background: inquiryFilter === 'ALL' ? '#38bdf8' : '#334155', color: inquiryFilter === 'ALL' ? '#0f172a' : 'white', border: 'none', cursor: 'pointer', fontWeight: inquiryFilter === 'ALL' ? '700' : 'normal' }}>전체</button>
            <button onClick={() => setInquiryFilter('PENDING')} style={{ padding: '8px 16px', borderRadius: '8px', background: inquiryFilter === 'PENDING' ? '#38bdf8' : '#334155', color: inquiryFilter === 'PENDING' ? '#0f172a' : 'white', border: 'none', cursor: 'pointer', fontWeight: inquiryFilter === 'PENDING' ? '700' : 'normal' }}>답변 대기</button>
            <button onClick={() => setInquiryFilter('COMPLETED')} style={{ padding: '8px 16px', borderRadius: '8px', background: inquiryFilter === 'COMPLETED' ? '#38bdf8' : '#334155', color: inquiryFilter === 'COMPLETED' ? '#0f172a' : 'white', border: 'none', cursor: 'pointer', fontWeight: inquiryFilter === 'COMPLETED' ? '700' : 'normal' }}>답변 완료</button>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '14px' }}>
              <th style={{ padding: '16px' }}>유형</th>
              <th style={{ padding: '16px' }}>제목</th>
              <th style={{ padding: '16px' }}>고객명</th>
              <th style={{ padding: '16px' }}>작성일</th>
              <th style={{ padding: '16px' }}>상태</th>
              <th style={{ padding: '16px' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {inquiryList.map((inq, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '16px' }}><span style={{ color: '#38bdf8' }}>[{inq.type}]</span></td>
                <td style={{ padding: '16px' }}>{inq.title}</td>
                <td style={{ padding: '16px' }}>{inq.user}</td>
                <td style={{ padding: '16px' }}>{inq.date}</td>
                <td style={{ padding: '16px' }}><span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', backgroundColor: inq.status === '답변 완료' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: inq.status === '답변 완료' ? '#10b981' : '#f59e0b', fontWeight: '800' }}>{inq.status}</span></td>
                <td style={{ padding: '16px' }}><button onClick={() => fetchInquiryDetail(inq.inquiryId)} style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', cursor: 'pointer', fontWeight: '800' }}>상세보기</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination currentPage={inquiryPage + 1} totalItems={inquiryList.length} itemsPerPage={itemsPerPage} onPageChange={(page) => setInquiryPage(page - 1)} />
      </div>
      {selectedInquiry && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#1e293b', width: '100%', maxWidth: '600px', borderRadius: '24px', padding: '32px', border: '1px solid #334155', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800' }}>문의 상세 및 답변</h3>
              <button onClick={() => setSelectedInquiry(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer' }}>X</button>
            </div>
            <div style={{ marginBottom: '24px', padding: '20px', background: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#38bdf8', marginBottom: '16px' }}>고객 정보</h4>
              <div>고객명: {selectedInquiry.user} | 이메일: {selectedInquiry.email} | 연락처: {selectedInquiry.contact}</div>
            </div>
            <div style={{ marginBottom: '24px', padding: '20px', background: '#0f172a', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#38bdf8', marginBottom: '16px' }}>문의 내용</h4>
              <div style={{ fontWeight: '700', marginBottom: '8px' }}>[{selectedInquiry.type}] {selectedInquiry.title}</div>
              <div style={{ fontSize: '14px', color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>{selectedInquiry.content}</div>
              {selectedInquiry.fileUrl && <a href={selectedInquiry.fileUrl} target="_blank" rel="noopener noreferrer">첨부파일 보기</a>}
              {selectedInquiry.answer && <div style={{ marginTop: '16px', padding: '16px', border: '1px solid #334155', borderRadius: '12px' }}><strong>답변:</strong> {selectedInquiry.answer}</div>}
            </div>
            {!selectedInquiry.answer && (
              <>
                <textarea value={inquiryAnswer} onChange={(e) => setInquiryAnswer(e.target.value)} placeholder="답변 내용을 입력하세요" style={{ width: '100%', height: '120px', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '16px', color: 'white', resize: 'none', marginBottom: '24px' }} />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => { setSelectedInquiry(null); setInquiryAnswer(''); }} style={{ flex: 1, padding: '16px', borderRadius: '12px', background: '#334155', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>취소</button>
                  <button onClick={() => onAnswerSubmit(selectedInquiry, inquiryAnswer, fetchInquiries)} disabled={isSubmittingAnswer} style={{ flex: 2, padding: '16px', borderRadius: '12px', background: isSubmittingAnswer ? '#475569' : '#38bdf8', color: isSubmittingAnswer ? '#94a3b8' : '#0f172a', border: 'none', fontWeight: '800', cursor: isSubmittingAnswer ? 'not-allowed' : 'pointer' }}>{isSubmittingAnswer ? '처리 중...' : '답변 등록'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiryTab;
