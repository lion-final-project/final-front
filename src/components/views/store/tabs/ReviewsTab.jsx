import React from 'react';

const ReviewsTab = ({ reviews, replyInput, setReplyInput, handleReplyReview }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>리뷰 관리</h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>고객님들이 남겨주신 소중한 리뷰에 답변을 남겨주세요.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {reviews.map((review) => (
          <div key={review.id} style={{ padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9', backgroundColor: '#fdfdfd' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontWeight: '800', fontSize: '16px' }}>{review.userName}</span>
                <div style={{ display: 'flex', gap: '2px', color: '#f59e0b' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ fontSize: '14px' }}>{i < review.rating ? '★' : '☆'}</span>
                  ))}
                </div>
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>{review.date}</span>
              </div>
              <span style={{ backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', color: '#64748b', fontWeight: '700' }}>{review.productName}</span>
            </div>
            <p style={{ fontSize: '15px', color: '#1e293b', lineHeight: '1.6', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>{review.content}</p>
            {review.reply ? (
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', marginBottom: '4px' }}>마트 답변</div>
                <p style={{ fontSize: '14px', color: '#475569', margin: 0 }}>{review.reply}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <textarea
                  placeholder="고객님께 따뜻한 답변을 남겨주세요..."
                  value={replyInput[review.id] || ''}
                  onChange={(e) => setReplyInput(prev => ({ ...prev, [review.id]: e.target.value }))}
                  style={{ width: '100%', height: '80px', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', resize: 'none' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => handleReplyReview(review.id)} style={{ padding: '8px 20px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>답변 등록</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ReviewsTab;
