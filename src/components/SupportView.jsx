import React, { useState } from 'react';
import { faqs, notices, inquiries } from '../data/mockData';

const SupportView = ({ isLoggedIn, onOpenAuth, isEmbedded = false }) => {
  const [activeTab, setActiveTab] = useState('notice'); // notice, faq, inquiry
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('전체');

  const filteredFaqs = faqs.filter(f => 
    (selectedCategory === '전체' || f.category === selectedCategory) &&
    (f.question.includes(searchQuery) || f.answer.includes(searchQuery) || f.category.includes(searchQuery))
  );

  const faqCategories = ['전체', ...new Set(faqs.map(f => f.category))];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notice':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {notices.map(notice => (
              <div key={notice.id} style={{ padding: '24px', background: 'white', border: '1px solid var(--border)', borderRadius: '16px', cursor: 'pointer' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{notice.date}</div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>{notice.title}</h4>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>{notice.content}</p>
              </div>
            ))}
          </div>
        );
      case 'faq':
        return (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <input 
                type="text" 
                placeholder="도움말을 검색해 보세요 (예: 주문, 결제, 배송)" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '16px 24px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '15px', background: '#f8fafc' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
              {faqCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid var(--border)',
                    background: selectedCategory === cat ? 'var(--primary)' : 'white',
                    color: selectedCategory === cat ? 'white' : 'var(--text-muted)',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredFaqs.map(faq => (
                <div key={faq.id} style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                  <button 
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    style={{ width: '100%', padding: '20px', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}
                  >
                    <span style={{ fontSize: '15px', fontWeight: '600' }}>
                      <span style={{ color: 'var(--primary)', marginRight: '8px' }}>Q.</span>
                      {faq.question}
                    </span>
                    <span style={{ transform: expandedFaq === faq.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                  </button>
                  {expandedFaq === faq.id && (
                    <div style={{ padding: '20px', background: '#f8fafc', borderTop: '1px solid var(--border)', fontSize: '14px', lineHeight: '1.6', color: '#475569' }}>
                      <span style={{ color: '#ef4444', fontWeight: '700', marginRight: '8px' }}>A.</span>
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
              {filteredFaqs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>검색 결과가 없습니다.</div>
              )}
            </div>
          </div>
        );
      case 'inquiry':
        if (!isLoggedIn) {
          return (
            <div style={{ textAlign: 'center', padding: '60px 24px', background: 'white', borderRadius: '24px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔐</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>로그인이 필요합니다</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>1:1 문의를 하시려면 로그인을 해주세요.</p>
              <button 
                onClick={onOpenAuth}
                className="btn-primary"
                style={{ padding: '12px 32px' }}
              >로그인하기</button>
            </div>
          );
        }
        return (
          <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>1:1 문의 작성</h3>
            <form onSubmit={(e) => { e.preventDefault(); alert('문의가 성공적으로 등록되었습니다.'); }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>문의 유형</label>
                <select style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white' }}>
                  <option>주문/결제 문의</option>
                  <option>취소/환불 문의</option>
                  <option>배송 문의</option>
                  <option>서비스 이용 문의</option>
                  <option>기타</option>
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>제목</label>
                <input type="text" placeholder="제목을 입력하세요" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>내용</label>
                <textarea rows="6" placeholder="자세한 문의 내용을 입력해 주세요" style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', resize: 'none' }}></textarea>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>문의 등록하기</button>
            </form>

            <div style={{ marginTop: '40px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>나의 문의 내역</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {inquiries.map(inquiry => (
                  <div key={inquiry.id} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700' }}>[{inquiry.type}]</span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>{inquiry.date}</span>
                    </div>
                    <div style={{ fontWeight: '700', marginBottom: '8px' }}>{inquiry.title}</div>
                    <div style={{ fontSize: '14px', color: '#475569', marginBottom: inquiry.answer ? '12px' : '0' }}>{inquiry.content}</div>
                    {inquiry.answer && (
                      <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: '8px', fontSize: '13px', color: '#334155', borderLeft: '4px solid var(--primary)' }}>
                        <div style={{ fontWeight: '800', marginBottom: '4px', color: 'var(--primary)' }}>답변</div>
                        {inquiry.answer}
                      </div>
                    )}
                    <div style={{ marginTop: '12px', textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '4px', backgroundColor: inquiry.status === '답변 완료' ? '#f0fdf4' : '#f1f5f9', color: inquiry.status === '답변 완료' ? '#16a34a' : '#64748b', fontWeight: '700' }}>
                        {inquiry.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: isEmbedded ? '0' : '40px 20px', maxWidth: isEmbedded ? '100%' : '800px', margin: isEmbedded ? '0' : '0 auto' }}>
      {!isEmbedded && (
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '12px' }}>고객지원 센터</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>궁금한 점이 있으신가요? 빠르고 친절하게 도와드리겠습니다.</p>
        </div>
      )}
      {isEmbedded && (
         <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>고객지원</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>궁금한 점이 있으신가요? 빠르고 친절하게 도와드리겠습니다.</p>
         </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', padding: '4px', background: '#f1f5f9', borderRadius: '12px' }}>
        {[
          { id: 'notice', label: '공지사항' },
          { id: 'faq', label: '자주 묻는 질문' },
          { id: 'inquiry', label: '1:1 문의' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              flex: 1, 
              padding: '12px', 
              borderRadius: '8px', 
              fontWeight: '700', 
              fontSize: '14px',
              backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeTab === tab.id ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ minHeight: '400px' }}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default SupportView;
