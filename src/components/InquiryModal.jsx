import React, { useState } from 'react';

const InquiryModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const [type, setType] = useState('delivery');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('문의가 접수되었습니다. 답변은 알림으로 안내해 드립니다.');
    onClose();
    setTitle('');
    setContent('');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1300,
      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white', width: '90%', maxWidth: '500px', 
        borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', 
        overflow: 'hidden'
      }} onClick={e => e.stopPropagation()}>
        
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>1:1 문의하기</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>

        <div style={{ padding: '24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
           <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px', color: '#1e293b' }}>{order.product || order.items}</div>
           <div style={{ fontSize: '13px', color: '#64748b' }}>주문번호 {order.id} | {order.store}</div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <div>
             <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: '#475569' }}>문의 유형</label>
             <select 
               value={type} onChange={(e) => setType(e.target.value)}
               style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
             >
               <option value="delivery">배송 문의</option>
               <option value="product">상품 문의</option>
               <option value="cancel">취소/환불 문의</option>
               <option value="other">기타</option>
             </select>
           </div>
           
           <div>
             <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: '#475569' }}>제목</label>
             <input 
               type="text" 
               required
               value={title} onChange={(e) => setTitle(e.target.value)}
               placeholder="제목을 입력해주세요"
               style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
             />
           </div>

           <div>
             <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: '#475569' }}>내용</label>
             <textarea 
               required
               value={content} onChange={(e) => setContent(e.target.value)}
               placeholder="문의하실 내용을 자세히 적어주세요. (비속어, 타인 비방 등 부적절한 언어 사용 시 서비스 이용에 제재를 받을 수 있습니다.)"
               style={{ width: '100%', height: '120px', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', resize: 'none' }}
             />
           </div>

           <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button 
                type="button" 
                onClick={onClose}
                style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#f1f5f9', border: 'none', fontWeight: '700', cursor: 'pointer', color: '#64748b' }}
              >취소</button>
              <button 
                type="submit"
                style={{ flex: 2, padding: '14px', borderRadius: '12px', background: 'var(--primary)', border: 'none', fontWeight: '700', cursor: 'pointer', color: 'white' }}
              >문의 접수</button>
           </div>
        </form>

      </div>
    </div>
  );
};

export default InquiryModal;
