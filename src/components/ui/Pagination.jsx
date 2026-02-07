import React from 'react';

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: currentPage === 1 ? '#475569' : '#94a3b8', cursor: currentPage === 1 ? 'default' : 'pointer' }}
      >
        이전
      </button>
      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i + 1}
          onClick={() => onPageChange(i + 1)}
          style={{
            width: '36px', height: '36px', borderRadius: '8px', border: 'none',
            background: currentPage === i + 1 ? '#38bdf8' : '#1e293b',
            color: currentPage === i + 1 ? '#0f172a' : '#94a3b8',
            fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: currentPage === totalPages ? '#475569' : '#94a3b8', cursor: currentPage === totalPages ? 'default' : 'pointer' }}
      >
        다음
      </button>
    </div>
  );
};

export default Pagination;
