import React from 'react';
import Pagination from '../../../ui/Pagination';

const NotificationsTab = ({ notificationHistory, currentPage, itemsPerPage, setCurrentPage }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
    <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155', maxWidth: '800px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '32px' }}>새 알림 발송</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>발송 대상</label>
          <select style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white' }}>
            <option>전체 사용자</option>
            <option>전체 고객</option>
            <option>전체 마트 사장님</option>
            <option>전체 배달원</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>알림 제목</label>
          <input type="text" placeholder="제목을 입력하세요" style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>알림 내용</label>
          <textarea rows="4" placeholder="내용을 입력하세요" style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', resize: 'none' }} />
        </div>
        <button
          onClick={() => alert('알림 발송이 예약되었습니다.')}
          style={{ padding: '16px', borderRadius: '8px', border: 'none', backgroundColor: '#38bdf8', color: 'white', fontWeight: '800', cursor: 'pointer', marginTop: '10px' }}
        >푸시 알림 발송하기</button>
      </div>
    </div>

    <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>최근 발송 내역</h2>
      <div className="table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '14px' }}>
              <th style={{ padding: '16px' }}>알림 제목</th>
              <th style={{ padding: '16px' }}>수신 대상</th>
              <th style={{ padding: '16px' }}>발송 시간</th>
              <th style={{ padding: '16px' }}>상태</th>
            </tr>
          </thead>
          <tbody>
            {notificationHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((h, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #334155', fontSize: '14px' }}>
                <td style={{ padding: '16px', fontWeight: '600' }}>{h.title}</td>
                <td style={{ padding: '16px' }}>{h.target}</td>
                <td style={{ padding: '16px' }}>{h.date}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ color: '#10b981' }}>✓ {h.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={currentPage} totalItems={notificationHistory.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
    </div>
  </div>
);

export default NotificationsTab;
