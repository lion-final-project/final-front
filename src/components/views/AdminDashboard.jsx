import React, { useState, useEffect, useCallback } from 'react';
import { getNotices, createNotice, updateNotice, deleteNotice } from '../../api/noticeApi';
import { getFaqsForAdmin, createFaq, updateFaq, deleteFaq } from '../../api/faqApi';
import { getAdminInquiries, getAdminInquiryDetail, answerInquiry } from '../../api/inquiryApi';

const RecordDetailModal = ({ record, onClose, onToggleStatus, reports, onShowReports }) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showStopInput, setShowStopInput] = useState(false);
  const [reason, setReason] = useState('');

  if (!record) return null;
  const isStore = !!record.rep;
  const isUser = record.type === 'USER';

  // Filter reports related to this user/store
  const relatedReports = reports.filter(r => 
    (r.reporter && r.reporter.name === record.name) || 
    (r.reported && r.reported.name === record.name) || 
    (r.reported && typeof r.reported.name === 'string' && r.reported.name.includes(record.name))
  );

  const handleStatusChange = () => {
    if ((record.status === '정상' || record.status === '활성') && !showStopInput) {
      setShowStopInput(true);
      return;
    }
    onToggleStatus(record, reason);
    onClose();
    setShowStopInput(false);
    setReason('');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(3px)' }}>
      <div style={{ backgroundColor: '#1e293b', width: '100%', maxWidth: '550px', borderRadius: '24px', padding: '32px', border: '1px solid #334155', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>{isStore ? '마트 상세 정보' : isUser ? '고객 상세 정보' : '데이터 상세 조회'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '14px' }}>상호명/이름</span>
            <span style={{ fontWeight: '700' }}>{record.name}</span>
          </div>
          
          {isStore ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <section style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '20px', border: '1px solid #334155' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#38bdf8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🏢</span> 사업장 기본 정보
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '14px' }}>상호명</span>
                  <span style={{ fontWeight: '700' }}>{record.name}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '14px' }}>카테고리</span>
                  <span>{record.category || '일반 마트'}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '14px' }}>대표자</span>
                  <span style={{ fontWeight: '700' }}>{record.rep}</span>
                </div>
              </section>

              <section style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '20px', border: '1px solid #334155' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#38bdf8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📞</span> 연락처 및 상세 정보
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '14px' }}>연락처</span>
                  <span>{record.phone}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '14px' }}>지역</span>
                  <span>{record.loc}</span>
                </div>
                <div style={{ marginTop: '12px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}>마트 소개</div>
                  <div style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap', backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
                    {record.intro || '공식 소개글이 등록되지 않았습니다.'}
                  </div>
                </div>
              </section>

              <section style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '20px', border: '1px solid #334155' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#38bdf8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⚖️</span> 사업자 및 정산 정보
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '14px' }}>사업자번호</span>
                  <span>{record.bizNum} <span style={{ fontSize: '11px', color: '#10b981', marginLeft: '8px' }}>[본인인증 완료 ✅]</span></span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '14px' }}>정산 계좌</span>
                  <div style={{ fontWeight: '700' }}>
                    <div>{record.bankDetails?.bank || record.bank.split(' ')[0]}</div>
                    <div style={{ color: '#38bdf8', fontSize: '13px', marginTop: '4px' }}>{record.bankDetails?.account || record.bank.split(' ')[1]} (예금주: {record.bankDetails?.holder || record.rep})</div>
                  </div>
                </div>
              </section>
            </div>
          ) : isUser ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>지역</span>
                <span>{record.loc}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>누적 주문</span>
                <span>{record.orders}회</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>가입일</span>
                <span>{record.join}</span>
              </div>
              <div style={{ marginTop: '12px', padding: '16px', backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>누적 신고 내역 ({relatedReports.length}건)</span>
                    <button 
                      onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                      style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: isHistoryOpen ? '#38bdf8' : '#334155', color: isHistoryOpen ? '#0f172a' : '#38bdf8', border: 'none', fontSize: '11px', cursor: 'pointer', fontWeight: '800', transition: 'all 0.2s' }}>
                      {isHistoryOpen ? '닫기' : '이력 보기'}
                    </button>
                 </div>
                 
                 {isHistoryOpen && (
                   <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                     {relatedReports.length > 0 ? relatedReports.map((r, i) => (
                       <div key={i} style={{ padding: '10px', backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', fontSize: '12px' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                           <span style={{ color: '#ef4444', fontWeight: '700' }}>[{r.type}]</span>
                           <span style={{ color: '#94a3b8' }}>{r.time}</span>
                         </div>
                         <div style={{ color: '#cbd5e1' }}>{r.content}</div>
                       </div>
                     )) : (
                       <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '12px' }}>신고 내역이 없습니다.</div>
                     )}
                   </div>
                 )}
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>신분증 등록</span>
                <span style={{ color: record.idCardStatus === '완료' ? '#10b981' : '#f59e0b', fontWeight: '800' }}>{record.idCardStatus || '미확인'}</span>
              </div>
              <section style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '20px', border: '1px solid #334155', marginTop: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#38bdf8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🏦</span> 정산 계좌 정보
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '14px' }}>은행명</span>
                  <span>{record.bankName || '-'}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '14px' }}>계좌번호</span>
                  <span>{record.accountNumber || '-'}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '14px' }}>예금주</span>
                  <span style={{ fontWeight: '700' }}>{record.accountHolder || record.name}</span>
                </div>
              </section>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', marginTop: '12px' }}>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>연락처</span>
                <span>{record.phone || '010-1234-5678'}</span>
              </div>
            </>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', borderTop: '1px solid #334155', paddingTop: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '14px' }}>현재 상태</span>
            <span style={{ color: record.status === '정상' || record.status === '활성' ? '#10b981' : '#ef4444', fontWeight: '800' }}>{record.status} {record.status === '정지' && '(사유: 운영 정책 위반)'}</span>
          </div>
        </div>

        {showStopInput && (
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#ef4444', fontWeight: '700', marginBottom: '8px' }}>🚫 계정 정지 사유 입력</label>
            <textarea 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="상세한 정지 사유를 입력해주세요..."
              style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #ef4444', color: 'white', fontSize: '14px', resize: 'none' }}
              rows="3"
            />
          </div>
        )}

        <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleStatusChange}
            style={{ 
              flex: 1, padding: '14px', borderRadius: '12px', 
              background: record.status === '정지' || record.status === '비활성' ? '#10b981' : '#ef4444', 
              color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer' 
            }}
          >
            {record.status === '정지' || record.status === '비활성' ? '활성화 처리' : showStopInput ? '정지 완료' : '이용 정지/비활성'}
          </button>
          <button style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#334155', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }} onClick={onClose}>취소/닫기</button>
        </div>
      </div>
    </div>
  );
};

const ApprovalDetailModal = ({ item, onClose, onAction }) => {
  const [actionType, setActionType] = useState(null); // 'REJECTED' or 'PENDING'
  const [reason, setReason] = useState('');

  if (!item) return null;
  const isStore = item.category === 'STORE';
  const data = item.formData || {};

  const handleConfirmAction = (type) => {
    if ((type === 'REJECTED' || type === 'PENDING') && !actionType) {
      setActionType(type);
      return;
    }
    onAction(item.id, type, reason);
    setActionType(null);
    setReason('');
  };

  const ReviewSection = ({ label, value, hint }) => (
    <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid #334155', marginBottom: '12px' }}>
      <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '600' }}>{label}</div>
      <div style={{ fontSize: '15px', color: 'white', fontWeight: '700', whiteSpace: 'pre-wrap' }}>{value || '-'}</div>
      {hint && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{hint}</div>}
    </div>
  );

  const ReviewFile = ({ label, fileName, icon = '📄' }) => (
    <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid #334155', marginBottom: '12px' }}>
      <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px', fontWeight: '600' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#1e293b', borderRadius: '8px', border: '1px dashed #475569' }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <span style={{ fontSize: '14px', color: '#38bdf8', fontWeight: '700', textDecoration: 'underline', cursor: 'pointer' }}>{fileName || '첨부파일 없음'}</span>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(5px)' }}>
      <div style={{ backgroundColor: '#1e293b', width: '100%', maxWidth: '700px', maxHeight: '90vh', borderRadius: '24px', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
        {/* Modal Header */}
        <div style={{ padding: '32px 32px 16px', borderBottom: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>신청 상세 검토</h2>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                {isStore ? '🏢 마트 입점 신청' : '🛵 라이더 가입 신청'} | 신청 번호: #APP-2026-{item.id}
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '28px', cursor: 'pointer' }}>×</button>
          </div>
        </div>

        {/* Modal Content - Scrollable */}
        <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
          {isStore ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <section>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#38bdf8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📋</span> 기본 정보
                </h3>
                <ReviewSection label="카테고리 선택" value={data.category} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <ReviewSection label="사업자명" value={data.companyName} />
                  <ReviewSection label="상호명" value={data.storeName} />
                </div>
                <ReviewSection label="대표자명" value={data.repName} />
              </section>

              <section>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#38bdf8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📞</span> 연락처 및 상세 정보
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <ReviewSection label="대표자 연락처" value={data.contact} />
                  <ReviewSection label="마트 연락처" value={data.martContact} />
                </div>
                <ReviewSection label="마트 소개" value={data.martIntro} />
              </section>

              <section>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#38bdf8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🏢</span> 사업자 및 증빙 서류
                </h3>
                <ReviewSection label="사업자등록번호" value={data.businessNumber} />
                <ReviewFile label="사업자등록증 첨부" fileName={data.businessRegistrationFile} />
                <ReviewSection label="통신판매업 신고번호" value={data.mailOrderNumber} />
                <ReviewFile label="통신판매업 신고증 첨부" fileName={data.mailOrderFile} />
              </section>
              
              <section style={{ borderTop: '1px solid #334155', paddingTop: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#38bdf8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🏦</span> 정산 계좌 정보
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <ReviewSection label="은행명" value={data.bankName} />
                  <ReviewSection label="계좌번호" value={data.accountNumber} />
                  <ReviewSection label="예금주" value={data.accountHolder} />
                </div>
                <ReviewFile label="통장 사본 첨부" fileName={data.bankbookFile} icon="🏦" />
              </section>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <ReviewSection label="이름" value={data.name} />
                <ReviewSection label="연락처" value={data.contact} />
              </div>
              <ReviewSection label="신분증 등록 여부" value="등록 완료 (심사 대기)" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <ReviewFile label="신분증 사본" fileName={data.identityFile} icon="🪪" />
                <ReviewFile label="신규 등록 사진" fileName={data.bankbookFile} icon="📸" />
              </div>
              <div style={{ marginTop: '20px', borderTop: '1px solid #334155', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', color: '#38bdf8' }}>정산 계좌 정보</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <ReviewSection label="은행명" value={data.bankName} />
                  <ReviewSection label="계좌번호" value={data.accountNumber} />
                  <ReviewSection label="예금주" value={data.accountHolder} />
                </div>
                <ReviewFile label="통장 사본 첨부" fileName={data.bankbookFile} icon="🏦" />
              </div>
            </div>
          )}

          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '16px', margin: '24px 0', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
             <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: '700', marginBottom: '4px' }}>🚨 심사 가이드라인</div>
             <div style={{ fontSize: '12px', color: '#fca5a5', lineHeight: '1.5' }}>
               서류 제출 기한은 영업일 기준 5일입니다. 기간 내 미비 서류를 보완하지 못하는 경우 자동으로 거절 처리됩니다.
             </div>
          </div>

          {actionType && (
            <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#0f172a', borderRadius: '16px', border: actionType === 'REJECTED' ? '1px solid #ef4444' : '1px solid #f59e0b' }}>
              <label style={{ display: 'block', fontSize: '13px', color: actionType === 'REJECTED' ? '#ef4444' : '#f59e0b', fontWeight: '700', marginBottom: '8px' }}>
                {actionType === 'REJECTED' ? '🚫 거절 사유 입력' : '⚠️ 보완 요청 사유 입력'}
              </label>
              <textarea 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={actionType === 'REJECTED' ? "거절 사유를 입력해주세요..." : "미비한 서류나 정보를 입력해주세요..."}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: 'white', fontSize: '14px', resize: 'none' }}
                rows="3"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '24px 32px 32px', borderTop: '1px solid #334155', display: 'flex', gap: '12px' }}>
           {!actionType ? (
             <>
               <button 
                 onClick={() => handleConfirmAction('APPROVED')}
                 style={{ flex: 1, padding: '16px', borderRadius: '12px', background: '#10b981', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)' }}>승인 완료</button>
               <button 
                 onClick={() => setActionType('REJECTED')}
                 style={{ flex: 1, padding: '16px', borderRadius: '12px', background: '#ef4444', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)' }}>거절 처리</button>
               <button 
                 onClick={() => setActionType('PENDING')}
                 style={{ flex: 1, padding: '16px', borderRadius: '12px', background: '#f59e0b', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3)' }}>보완 요청 (보류)</button>
             </>
           ) : (
             <>
               <button 
                 onClick={() => handleConfirmAction(actionType)}
                 style={{ flex: 2, padding: '16px', borderRadius: '12px', background: actionType === 'REJECTED' ? '#ef4444' : '#f59e0b', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer' }}>
                 {actionType === 'REJECTED' ? '거절 확정' : '보완 요청 전송'}
               </button>
               <button 
                 onClick={() => { setActionType(null); setReason(''); }}
                 style={{ flex: 1, padding: '16px', borderRadius: '12px', background: '#334155', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>취소</button>
             </>
           )}
        </div>
      </div>
    </div>
  );
};

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
      <button 
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: currentPage === 1 ? '#475569' : '#94a3b8', cursor: currentPage === 1 ? 'default' : 'pointer' }}>
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
          }}>
          {i + 1}
        </button>
      ))}
      <button 
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: currentPage === totalPages ? '#475569' : '#94a3b8', cursor: currentPage === totalPages ? 'default' : 'pointer' }}>
        다음
      </button>
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [paymentMonthFilter, setPaymentMonthFilter] = useState('2026-01');
  const [settlementMonthFilter, setSettlementMonthFilter] = useState('2026-01');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [approvalFilter, setApprovalFilter] = useState('ALL'); // ALL, STORE, RIDER
  const [approvalItems, setApprovalItems] = useState([
    { 
      id: 1, type: '마트', name: '싱싱 야채 센터 (강북점)', date: '2026-01-21', status: '심사 대기', color: '#10b981', category: 'STORE',
      formData: {
        category: '과일/채소',
        companyName: '(주)싱싱유통',
        storeName: '싱싱 야채 센터 (강북점)',
        repName: '홍길동',
        contact: '010-1234-5678',
        martContact: '02-888-9999',
        martIntro: '매일 아침 산지에서 직송된 신선한 채소와 과일을 저렴하게 판매합니다.',
        businessNumber: '123-45-67890',
        businessRegistrationFile: 'business_reg_2026.pdf',
        mailOrderNumber: '제 2026-서울강북-0001 호',
        mailOrderFile: 'mail_order_cert.pdf',
        bankName: '국민은행',
        accountNumber: '110-123-456789',
        accountHolder: '홍길동',
        bankbookFile: 'bankbook_copy.pdf'
      }
    },
    { 
      id: 2, type: '라이더', name: '김철수 (오토바이)', date: '2026-01-20', status: '서류 확인', color: '#38bdf8', category: 'RIDER',
      formData: {
        name: '김철수',
        birth: '1990.05.15',
        contact: '010-2222-3333',
        vehicle: '오토바이 (혼다 PCX)',
        license: '1종 보통',
        insurance: '유상운송보험 가입완료',
        identityFile: 'id_card.png',
        licenseFile: 'license_pcx.jpg',
        bankName: '신한은행',
        accountNumber: '110-999-888777',
        accountHolder: '김철수',
        bankbookFile: 'rider_bankbook.png'
      }
    },
    { id: 3, type: '라이더', name: '박지민 (자전거)', date: '2026-01-22', status: '심사 대기', color: '#38bdf8', category: 'RIDER' },
    { 
      id: 4, type: '마트', name: '유기농 세상', date: '2026-01-23', status: '서류 미비', color: '#10b981', category: 'STORE',
      formData: {
        category: '친환경/유기농',
        companyName: '에코라이프',
        storeName: '유기농 세상',
        repName: '임수진',
        contact: '010-3333-2222',
        martContact: '02-111-2222',
        martIntro: '화학 비료를 전혀 사용하지 않은 건강한 식재료만을 고집합니다.',
        businessNumber: '555-44-33322',
        businessRegistrationFile: 'eco_biz_reg.jpg',
        mailOrderNumber: '제 2026-서울서초-0005 호',
        mailOrderFile: 'eco_mail_order.pdf',
        bankName: '신한은행',
        accountNumber: '110-555-444333',
        accountHolder: '임수진',
        bankbookFile: 'eco_bankbook.png'
      }
    },
    { 
      id: 5, type: '마트', name: '동네 정육 나라', date: '2026-01-24', status: '검토 중', color: '#10b981', category: 'STORE',
      formData: {
        category: '축산물',
        companyName: '미트마스터',
        storeName: '동네 정육 나라',
        repName: '최고집',
        contact: '010-9999-0000',
        martContact: '031-777-6666',
        martIntro: '최상급 한우와 한돈을 정직하게 판매하는 동네 단골 정육점입니다.',
        businessNumber: '999-88-77766',
        businessRegistrationFile: 'meat_reg.pdf',
        mailOrderNumber: '제 2026-경기성남-0012 호',
        mailOrderFile: 'meat_mail_order.jpg',
        bankName: '우리은행',
        accountNumber: '1002-888-777666',
        accountHolder: '최고집',
        bankbookFile: 'meat_bankbook.pdf'
      }
    }
  ]);

  const [stores, setStores] = useState([
    { 
      id: 'ST001', name: '행복 마트 강남점', loc: '역삼동', status: '정상', rep: '김행복', phone: '010-1234-5678', bizNum: '123-45-67890', bank: '국민은행 110-***-123456',
      category: '대형 마트', 
      intro: '지역 주민들에게 사랑받는 정직한 마트입니다. 매일 신선한 상품을 최적의 가격에 제공합니다.',
      bankDetails: { bank: '국민은행', account: '110-123-456789', holder: '김행복' }
    },
    { 
      id: 'ST002', name: '무림 정육점', loc: '삼성동', status: '정상', rep: '이무림', phone: '010-2222-3333', bizNum: '220-11-55555', bank: '신한은행 100-***-999888',
      category: '정육/축산',
      intro: '30년 전통의 노하우로 최상급 고기만을 선별하여 판매합니다.',
      bankDetails: { bank: '신한은행', account: '1002-999-888777', holder: '이무림' }
    },
    { 
      id: 'ST003', name: '싱싱 야채 센터', loc: '역삼동', status: '비활성', rep: '박싱싱', phone: '010-9999-8888', bizNum: '333-22-11111', bank: '우리은행 1002-***-444555',
      category: '과일/채소',
      intro: '농장 직송 신선함을 그대로 식탁까지 전달해 드립니다.',
      bankDetails: { bank: '우리은행', account: '1002-111-222333', holder: '박싱싱' }
    }
  ]);
  const [users, setUsers] = useState([
    { 
      id: 'USR001', name: '김지현', email: 'jihyun@example.com', phone: '010-1111-2222',
      addresses: ['강남구 삼성동 123-45', '강남구 역삼동 99-1'],
      orders: 24, join: '2023.11.12', status: '활성', type: 'USER' 
    },
    { 
      id: 'USR002', name: '박준영', email: 'junyoung@gmail.com', phone: '010-3333-4444',
      addresses: ['서초구 방배동 888', '서초구 서초동 77'],
      orders: 12, join: '2023.12.05', status: '활성', type: 'USER' 
    },
    { 
      id: 'USR003', name: '최수진', email: 'sujin_ch@naver.com', phone: '010-5555-6666',
      addresses: ['마포구 성산동 55-2'],
      orders: 5, join: '2024.01.10', status: '정지', type: 'USER' 
    },
    { 
      id: 'USR004', name: '이민호', email: 'minho_lee@kakao.com', phone: '010-7777-8888',
      addresses: ['송파구 잠실동 10-10', '송파구 가락동 22'],
      orders: 42, join: '2023.08.15', status: '활성', type: 'USER' 
    },
    { 
      id: 'USR005', name: '정다은', email: 'daeun_j@outlook.com', phone: '010-9999-0000',
      addresses: ['강동구 천호동 456'],
      orders: 8, join: '2024.01.20', status: '활성', type: 'USER' 
    }
  ]);


  const [reports, setReports] = useState([
    { 
      id: 1, type: '배송지연', status: '확인 중', time: '1시간 전', content: '예상 시간보다 30분이나 늦게 도착했습니다. 고기가 좀 녹았어요.',
      orderNo: 'ORD-20260127-001',
      reporter: { type: 'USER', name: '김서연', contact: '010-1111-2222' },
      reported: { type: 'STORE', name: '무림 정육점', contact: '010-2222-3333' }
    },
    { 
      id: 2, type: '상품불량', status: '처리완료', time: '3시간 전', content: '사과에 멍이 너무 많이 들어있습니다. 교환 요청합니다.',
      orderNo: 'ORD-20260126-042',
      reporter: { type: 'USER', name: '이영희', contact: '010-3333-4444' },
      reported: { type: 'STORE', name: '행복 마트', contact: '010-1234-5678' },
      resolution: '마트 측과 확인하여 전액 환불 및 교환권 발급해 드렸습니다.'
    },
    { 
      id: 3, type: '불친절', status: '확인 중', time: '5시간 전', content: '라이더분이 너무 퉁명스럽게 물건을 던지듯 주고 가셨습니다.',
      orderNo: 'ORD-20260127-015',
      reporter: { type: 'USER', name: '최수진', contact: '010-5555-6666' },
      reported: { type: 'RIDER', name: '김철수', contact: '010-9999-8888' }
    },
    { 
      id: 4, type: '정산문제', status: '확인 중', time: '1일 전', content: '이번 주 정산 내역이 실제 매출과 다릅니다. 확인 부탁드려요.',
      orderNo: '-',
      reporter: { type: 'STORE', name: '행복 마트', contact: '010-1234-5678' },
      reported: { type: 'ADMIN', name: '어드민', contact: '-' }
    }
  ]);

  const [riders, setRiders] = useState([
    { 
      id: 'RID001', name: '김철수', status: '운행중', type: 'PROFESSIONAL', 
      phone: '010-1234-5678', bankName: '신한은행', accountNumber: '110-123-456789', accountHolder: '김철수', idCardStatus: '완료'
    },
    { 
      id: 'RID002', name: '이영희', status: '운행 불가', type: 'RESIDENT', 
      phone: '010-2222-3333', bankName: '우리은행', accountNumber: '1002-999-888777', accountHolder: '이영희', idCardStatus: '완료'
    },
    { 
      id: 'RID003', name: '박민수', status: '운행 불가', type: 'RESIDENT', 
      phone: '010-4444-5555', bankName: '하나은행', accountNumber: '123-456-789012', accountHolder: '박민수', idCardStatus: '확인중'
    },
    { 
      id: 'RID004', name: '최현우', status: '운행중', type: 'PROFESSIONAL', 
      phone: '010-8888-9999', bankName: '국민은행', accountNumber: '110-999-000000', accountHolder: '최현우', idCardStatus: '완료'
    }
  ]);

  const [approvalStatusFilter, setApprovalStatusFilter] = useState('ALL'); // ALL, PENDING, HOLD

  const [chartPeriod, setChartPeriod] = useState('weekly'); // weekly, monthly, yearly
  const [reportsFilter, setReportsFilter] = useState('ALL'); // ALL, RESOLVED, UNRESOLVED
  const [reportsSearch, setReportsSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [resolutionMessage, setResolutionMessage] = useState('');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentRegionFilter, setPaymentRegionFilter] = useState('ALL');
  const [settlementSearch, setSettlementSearch] = useState('');
  const [settlementStatusFilter, setSettlementStatusFilter] = useState('ALL');
  const [inquiryFilter, setInquiryFilter] = useState('ALL'); // ALL, PENDING, COMPLETED

  const [faqs, setFaqs] = useState([]);

  const [settlementFilter, setSettlementFilter] = useState('STORE'); // STORE, RIDER
  const [settlements, setSettlements] = useState([
    { id: 'SET101', name: '행복 마트 강남점', type: 'STORE', amount: 4500000, date: '2026.01.20', status: '정산완료' },
    { id: 'SET102', name: '김철수 라이더', type: 'RIDER', amount: 350000, date: '2026.01.21', status: '정산예정' },
    { id: 'SET103', name: '무림 정육점', type: 'STORE', amount: 2800000, date: '2026.01.21', status: '정산완료' }
  ]);

  const [detailedSettlements, setDetailedSettlements] = useState([
    { id: 'SET001', name: '그린 프레시 마트 강남점', id_code: 'MT-90234', region: '서울 / 강남구', amount: 12450000, date: '2023-11-22', status: '지급 완료', color: '#10b981' },
    { id: 'SET002', name: '베스트 푸드 센터 홍대점', id_code: 'MT-11209', region: '서울 / 마포구', amount: 8920000, date: '2023-11-22', status: '지급 처리중', color: '#38bdf8' },
    { id: 'SET003', name: '하나로 연신내 유통', id_code: 'MT-88712', region: '서울 / 은평구', amount: 4150000, date: '2023-11-25', status: '승인 대기', color: '#f59e0b' },
    { id: 'SET004', name: '데일리 마트 일산점', id_code: 'MT-33410', region: '경기 / 고양시', amount: 21080000, date: '2023-11-22', status: '지급 완료', color: '#10b981' },
    { id: 'SET005', name: '스마트 유통 분당본점', id_code: 'MT-76621', region: '경기 / 성남시', amount: 15300000, date: '2023-11-22', status: '지급 실패', color: '#ef4444' }
  ]);

  const [riderSettlements, setRiderSettlements] = useState([
    { id: 'RSET001', name: '김철수 라이더', id_code: 'RD-00123', region: '서울 / 강남구', amount: 850000, date: '2023-11-22', status: '지급 완료', color: '#10b981' },
    { id: 'RSET002', name: '이영희 라이더', id_code: 'RD-00554', region: '서울 / 마포구', amount: 1240000, date: '2023-11-22', status: '지급 처리중', color: '#38bdf8' },
    { id: 'RSET003', name: '박민수 라이더', id_code: 'RD-00921', region: '서울 / 송파구', amount: 980000, date: '2023-11-25', status: '승인 대기', color: '#f59e0b' },
    { id: 'RSET004', name: '최현우 라이더', id_code: 'RD-11223', region: '서울 / 송파구', amount: 1560000, date: '2023-11-22', status: '지급 완료', color: '#10b981' }
  ]);

  const [paymentHistory, setPaymentHistory] = useState([
    { region: '서울', category: '신선 식품', mart: '신선마트 강남점', amount: 42500000, commission: 4250000, status: '지급완료' },
    { region: '서울', category: '일반 식품', mart: '유기농마켓 서초', amount: 31200000, commission: 3120000, status: '지급대기' },
    { region: '서울', category: '신선 식품', mart: '데일리푸드 송파', amount: 28450000, commission: 2845000, status: '지급완료' },
    { region: '경기', category: '일반 식품', mart: '프레시팜 판교', amount: 19800000, commission: 1980000, status: '지급대기' }
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, approvalFilter, approvalStatusFilter, reportsFilter, settlementFilter, userSearch, inquiryFilter]);

  const [selectedReport, setSelectedReport] = useState(null);
  const [inquiryList, setInquiryList] = useState([]);
  const [inquiryPage, setInquiryPage] = useState(0);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [inquiryAnswer, setInquiryAnswer] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  const getCategoryLabel = (category) => {
    const labels = {
      'ORDER_PAYMENT': '주문/결제 문의',
      'CANCELLATION_REFUND': '취소/환불 문의',
      'DELIVERY': '배송 문의',
      'SERVICE': '서비스 이용 문의',
      'OTHER': '기타'
    };
    return labels[category] || category;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR').replace(/\./g, '.').replace(/\s/g, '');
  };

  const fetchInquiries = useCallback(async () => {
    try {
      const status = inquiryFilter === 'ALL' ? null : (inquiryFilter === 'PENDING' ? 'PENDING' : 'ANSWERED');
      const page = await getAdminInquiries(status, inquiryPage, itemsPerPage);
      const list = (page.content || []).map(inq => ({
        inquiryId: inq.inquiryId,
        id: inq.inquiryId,
        type: getCategoryLabel(inq.category),
        category: inq.category,
        title: inq.title,
        user: inq.customerName,
        date: formatDate(inq.createdAt),
        status: inq.status === 'ANSWERED' ? '답변 완료' : '답변 대기',
        statusEnum: inq.status
      }));
      setInquiryList(list);
    } catch (err) {
      console.error('문의 목록 조회 실패:', err);
    }
  }, [inquiryFilter, inquiryPage, itemsPerPage]);

  const fetchInquiryDetail = async (inquiryId) => {
    try {
      const detail = await getAdminInquiryDetail(inquiryId);
      setSelectedInquiry({
        id: inquiryId,
        type: getCategoryLabel(detail.category),
        category: detail.category,
        title: detail.title,
        content: detail.content,
        user: detail.customerName,
        email: detail.email,
        contact: detail.phone,
        date: formatDate(detail.createdAt),
        status: detail.status === 'ANSWERED' ? '답변 완료' : '답변 대기',
        statusEnum: detail.status,
        answer: detail.answer || null,
        fileUrl: detail.fileUrl || null,
        attachments: detail.fileUrl ? [detail.fileUrl] : []
      });
    } catch (err) {
      console.error('문의 상세 조회 실패:', err);
      alert('문의 상세 정보를 불러오는데 실패했습니다.');
    }
  };

  useEffect(() => {
    if (activeTab === 'inquiry') {
      fetchInquiries();
    }
  }, [activeTab, inquiryFilter, inquiryPage, fetchInquiries]);

  const [noticeList, setNoticeList] = useState([]);

  const fetchNotices = useCallback(async () => {
    try {
      const page = await getNotices(0, 100);
      const list = (page.content || []).map(n => ({
        id: n.noticeId,
        title: n.title,
        content: n.content,
        date: n.createdAt ? n.createdAt.substring(0, 10).replace(/-/g, '.') : '',
      }));
      setNoticeList(list);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const fetchFaqs = useCallback(async () => {
    try {
      const page = await getFaqsForAdmin(0, 100);
      const list = (page.content || []).map(f => ({
        id: f.faqId,
        question: f.question,
        answer: f.answer,
      }));
      setFaqs(list);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [currentNotice, setCurrentNotice] = useState(null);

  const [bannerList, setBannerList] = useState([
    { id: 1, title: '겨울철 비타민 충전!', content: '신선한 과일로 면역력을 높이세요', img: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80', promotion: '제철 과일 기획전', color: 'linear-gradient(45deg, #ff9a9e, #fad0c4)', status: '노출 중' },
    { id: 2, title: '따끈따끈 밀키트', content: '집에서 즐기는 맛집 요리', img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80', promotion: '한겨울 밀키트 대전', color: 'linear-gradient(120deg, #a1c4fd, #c2e9fb)', status: '노출 중' }
  ]);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);

  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false);
  const [currentFAQ, setCurrentFAQ] = useState(null);

  const [promotions, setPromotions] = useState([
    { 
      id: 1, 
      title: '제철 과일 기획전', 
      period: '2024.01.20 - 2024.02.20', 
      status: '진행 중',
      description: '겨울철 신선한 산지직송 과일을 만나보세요. 제주 한라봉부터 상큼한 산청 딸기까지!',
      bannerImg: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80',
      products: [
        { name: '제주 한라봉 3kg', price: '25,000원', stock: 50, sales: 120 },
        { name: '영동 사과 5kg', price: '32,000원', stock: 30, sales: 85 },
        { name: '산청 딸기 500g', price: '12,000원', stock: 100, sales: 210 }
      ]
    },
    { 
      id: 2, 
      title: '한겨울 밀키트 대전', 
      period: '2024.01.15 - 2024.01.31', 
      status: '진행 중',
      description: '따끈한 국물 요리부터 간편한 홈파티 메뉴까지! 집에서 즐기는 맛집 요리.',
      bannerImg: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
      products: [
        { name: '부대찌개 밀키트', price: '15,900원', stock: 80, sales: 156 },
        { name: '감바스 알 아히요', price: '18,500원', stock: 45, sales: 92 },
        { name: '소고기 샤브샤브', price: '24,000원', stock: 20, sales: 64 }
      ]
    }
  ]);
  const [selectedPromotion, setSelectedPromotion] = useState(null);

  const [notificationHistory, setNotificationHistory] = useState([
    { id: 1, title: '설 연휴 배송 지연 안내', target: '전체 사용자', date: '2024.01.20 14:00', status: '발송 완료' },
    { id: 2, title: '신규 가입 쿠폰 증정 이벤트', target: '전체 고객', date: '2024.01.15 10:00', status: '발송 완료' },
    { id: 3, title: '시스템 점검 안내', target: '전체 사용자', date: '2024.01.10 02:00', status: '발송 완료' }
  ]);

  const handleApprovalAction = (id, action, reason = '') => {
    let statusText = '';
    let successMsg = '';
    
    if (action === 'APPROVED') {
      const approvedItem = approvalItems.find(item => item.id === id);
      if (approvedItem && approvedItem.category === 'RIDER') {
        successMsg = `[승인 완료] ${approvedItem.name} 라이더님에게 가입 승인 메일이 발송되었습니다.\n\n- 아이디: ${approvedItem.name}@neighbor.com\n- 임시 비밀번호: NM${Math.floor(1000 + Math.random() * 9000)}\n\n확인 버튼을 누르면 라이더 앱으로 연결됩니다.`;
      } else {
        successMsg = '선택한 항목이 승인되었습니다.';
      }
      statusText = '승인 완료';
    } else if (action === 'REJECTED') {
      statusText = '거절됨';
      successMsg = `신청이 거절 처리되었습니다.${reason ? `\n(사유: ${reason})` : ''}`;
    } else if (action === 'PENDING') {
      statusText = '보완 요청 중';
      successMsg = `보완 요청이 담당자에게 전달되었습니다.${reason ? `\n(사유: ${reason})` : ''}`;
    }

    setApprovalItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: statusText } : item
    ));
    
    if (action === 'APPROVED' || action === 'REJECTED' || action === 'PENDING') {
      setTimeout(() => {
        setApprovalItems(prev => prev.filter(item => item.id !== id));
      }, 1500);
    }
    
    alert(successMsg);
    setSelectedApproval(null);
  };

  const handleToggleStatus = (record, reason = '') => {
    if (record.rep) { // Store
      setStores(prev => prev.map(s => 
        s.id === record.id ? { ...s, status: s.status === '정상' ? '비활성' : '정상' } : s
      ));
    } else if (record.type === 'USER') {
      setUsers(prev => prev.map(u => 
        u.id === record.id ? { ...u, status: u.status === '활성' ? '정지' : '활성' } : u
      ));
      if (reason) {
        alert(`[${record.name}] 고객님에게 정지 사유가 발송되었습니다: "${reason}"`);
      }
    }
    setSelectedRecord(null);
  };

  const handleResolveReport = (id, message) => {
    if (!message) {
      alert('처리 결과 메시지를 입력해주세요.');
      return;
    }
    
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: '처리완료', resolution: message } : r));
    
    // SSE Alert Simulation
    const report = reports.find(r => r.id === id);
    alert(`[SSE 알림 전송 완료]\n내용: 신고 #${id}에 대한 처리 결과가 발송되었습니다.\n\n대상: ${report.reporter.name}님\n메시지: ${message}`);
    
    setSelectedReport(null);
    setResolutionMessage('');
  };

  const handleExecuteSettlement = (type) => {
    const list = type === 'STORE' ? detailedSettlements : riderSettlements;
    const setter = type === 'STORE' ? setDetailedSettlements : setRiderSettlements;
    const targetItems = list.filter(s => s.status === '승인 대기' || s.status === '지급 처리중' || s.status === '지급 실패');

    if (targetItems.length === 0) {
      alert('정산 실행할 대상이 없습니다.');
      return;
    }

    if (!confirm(`${type === 'STORE' ? '마트' : '배달원'} 정산 업무를 실행하시겠습니까?\n대상: ${targetItems.length}건`)) return;

    // Simulation of retry logic and partial settlement
    let successCount = 0;
    let retryCount = 0;
    
    // In a real app, this would be an async API call
    targetItems.forEach(item => {
      // Simulate that some might fail initially but pass on retry
      const random = Math.random();
      if (random > 0.1) { // 90% success rate
        successCount++;
      } else {
        // Retry logic: try 3 times
        for(let i=1; i<=3; i++) {
          retryCount++;
          if (Math.random() > 0.2) { // 80% success on retry
            successCount++;
            break;
          }
        }
      }
    });

    setter(prev => prev.map(item => {
      if (item.status === '승인 대기' || item.status === '지급 처리중' || item.status === '지급 실패') {
        // For simplicity in mock, we mark them as completed if they "passed" the simulation
        return { ...item, status: '지급 완료', color: '#10b981' };
      }
      return item;
    }));

    alert(`정산 실행 완료\n\n- 성공: ${successCount}건\n- 자동 재시도 횟수: ${retryCount}회\n\n실패 건에 대해서는 부분 정산이 진행되었으며, 최종 결과는 '지급 완료'로 업데이트되었습니다.`);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'stores':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Store Stats Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              {[
                { label: '전체 마트', value: `${stores.length}개`, color: '#38bdf8' },
                { label: '운영 중', value: `${stores.filter(s => s.status === '정상').length}개`, color: '#10b981' },
                { label: '비활성 마트', value: `${stores.filter(s => s.status === '비활성').length}개`, color: '#ef4444' },
                { label: '신규 신청', value: '12건', color: '#f59e0b' }
              ].map((stat, i) => (
                <div key={i} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>{stat.label}</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>마트 목록 및 관리</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                   <input type="text" placeholder="마트명으로 검색..." style={{ padding: '10px 16px', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '14px' }} />
                   <button style={{ padding: '10px 20px', borderRadius: '10px', backgroundColor: '#334155', border: 'none', color: 'white', fontWeight: '700', cursor: 'pointer' }}>검색</button>
                </div>
              </div>
              
              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '14px' }}>
                      <th style={{ padding: '16px' }}>마트명</th>
                      <th style={{ padding: '16px' }}>지역</th>
                      <th style={{ padding: '16px' }}>대표자</th>
                      <th style={{ padding: '16px' }}>상태</th>
                      <th style={{ padding: '16px' }}>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((store, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #334155', fontSize: '15px' }}>
                        <td style={{ padding: '16px', fontWeight: '700' }}>{store.name}</td>
                        <td style={{ padding: '16px' }}>{store.loc}</td>
                        <td style={{ padding: '16px' }}>{store.rep}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ 
                            fontSize: '12px', 
                            backgroundColor: store.status === '정상' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                            color: store.status === '정상' ? '#10b981' : '#ef4444', 
                            padding: '4px 10px', borderRadius: '6px', fontWeight: '800' 
                          }}>● {store.status === '정상' ? '운영중' : store.status}</span>
                        </td>
                        <td style={{ padding: '16px' }}>
                           <button 
                             onClick={() => setSelectedRecord(store)}
                             style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: 'none', cursor: 'pointer', fontWeight: '800' }}
                           >상세정보</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination 
                currentPage={currentPage}
                totalItems={stores.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        );
      case 'riders':
        const riderStats = [
          { label: '전체 배달원', value: `${riders.length}명`, color: '#38bdf8' },
          { label: '현재 운행중', value: `${riders.filter(r => r.status === '운행중').length}명`, color: '#10b981' },
          { label: '서류 확인 필요', value: `${riders.filter(r => r.idCardStatus !== '완료').length}명`, color: '#f59e0b' }
        ];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Rider Stats Summary */}
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
              <Pagination 
                currentPage={currentPage}
                totalItems={riders.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        );
      case 'users':
        const userStats = [
          { label: '전체 고객', value: '12,504명', color: '#38bdf8' },
          { label: '활성 사용자', value: '11,822명', color: '#10b981' },
          { label: '금월 신규', value: '425명', color: '#f59e0b' },
          { label: '정지 계정', value: '12명', color: '#ef4444' }
        ];

        const filteredUsers = users.filter(user => 
          user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.phone.includes(userSearch)
        );

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* User Stats Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              {userStats.map((stat, i) => (
                <div key={i} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>{stat.label}</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>사용자 목록 및 활동 관리</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                   <input 
                     type="text" 
                     placeholder="고객명, 이메일, 연락처 검색..." 
                     value={userSearch}
                     onChange={(e) => setUserSearch(e.target.value)}
                     style={{ padding: '10px 16px', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '14px', width: '280px' }} 
                   />
                   <button style={{ padding: '10px 20px', borderRadius: '10px', backgroundColor: '#334155', border: 'none', color: 'white', fontWeight: '700', cursor: 'pointer' }}>검색</button>
                </div>
              </div>
              
              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '14px' }}>
                      <th style={{ padding: '16px' }}>고객명</th>
                      <th style={{ padding: '16px' }}>이메일 / 연락처</th>
                      <th style={{ padding: '16px' }}>주소 내역</th>
                      <th style={{ padding: '16px' }}>주문 횟수</th>
                      <th style={{ padding: '16px' }}>가입일</th>
                      <th style={{ padding: '16px' }}>상태</th>
                      <th style={{ padding: '16px' }}>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((user, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #334155', fontSize: '14px' }}>
                        <td style={{ padding: '16px', fontWeight: '700' }}>{user.name}</td>
                        <td style={{ padding: '16px' }}>
                           <div style={{ color: '#cbd5e1' }}>{user.email}</div>
                           <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{user.phone}</div>
                        </td>
                        <td style={{ padding: '16px' }}>
                           <div style={{ position: 'relative' }}>
                             <button 
                               onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                               style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '800' }}>
                               주소 {user.addresses?.length || 0}개 ▾
                             </button>
                             {expandedUserId === user.id && (
                               <div style={{ position: 'absolute', top: '100%', left: 0, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '12px', zIndex: 100, minWidth: '240px', marginTop: '8px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
                                 {user.addresses?.map((addr, idx) => (
                                   <div key={idx} style={{ fontSize: '12px', color: '#cbd5e1', padding: '8px 0', borderBottom: idx === user.addresses.length - 1 ? 'none' : '1px solid #334155' }}>
                                     {addr}
                                   </div>
                                 ))}
                               </div>
                             )}
                           </div>
                        </td>
                        <td style={{ padding: '16px' }}>{user.orders}회</td>
                        <td style={{ padding: '16px' }}>{user.join}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ 
                            fontSize: '11px', 
                            backgroundColor: user.status === '활성' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                            color: user.status === '활성' ? '#10b981' : '#ef4444', 
                            padding: '4px 10px', borderRadius: '6px', fontWeight: '800' 
                          }}>● {user.status}</span>
                        </td>
                        <td style={{ padding: '16px' }}>
                           <button 
                             onClick={() => setSelectedRecord(user)}
                             style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '12px' }}
                           >상세정보</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination 
                currentPage={currentPage}
                totalItems={filteredUsers.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        );
      case 'inquiry':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>전체 문의 내역</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setInquiryFilter('ALL')}
                    style={{ padding: '8px 16px', borderRadius: '8px', background: inquiryFilter === 'ALL' ? '#38bdf8' : '#334155', color: inquiryFilter === 'ALL' ? '#0f172a' : 'white', border: 'none', cursor: 'pointer', fontWeight: inquiryFilter === 'ALL' ? '700' : 'normal' }}>전체</button>
                  <button 
                    onClick={() => setInquiryFilter('PENDING')}
                    style={{ padding: '8px 16px', borderRadius: '8px', background: inquiryFilter === 'PENDING' ? '#38bdf8' : '#334155', color: inquiryFilter === 'PENDING' ? '#0f172a' : 'white', border: 'none', cursor: 'pointer', fontWeight: inquiryFilter === 'PENDING' ? '700' : 'normal' }}>답변 대기</button>
                  <button 
                    onClick={() => setInquiryFilter('COMPLETED')}
                    style={{ padding: '8px 16px', borderRadius: '8px', background: inquiryFilter === 'COMPLETED' ? '#38bdf8' : '#334155', color: inquiryFilter === 'COMPLETED' ? '#0f172a' : 'white', border: 'none', cursor: 'pointer', fontWeight: inquiryFilter === 'COMPLETED' ? '700' : 'normal' }}>답변 완료</button>
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
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          fontSize: '11px', padding: '4px 10px', borderRadius: '6px', 
                          backgroundColor: inq.status === '답변 완료' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                          color: inq.status === '답변 완료' ? '#10b981' : '#f59e0b', fontWeight: '800' 
                        }}>{inq.status}</span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <button 
                          onClick={() => fetchInquiryDetail(inq.inquiryId)}
                          style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', cursor: 'pointer', fontWeight: '800' }}
                        >상세보기</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination 
                currentPage={inquiryPage + 1}
                totalItems={inquiryList.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setInquiryPage(page - 1)}
              />
            </div>

            {selectedInquiry && (
              <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div style={{ background: '#1e293b', width: '100%', maxWidth: '600px', borderRadius: '24px', padding: '32px', border: '1px solid #334155', maxHeight: '90vh', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '800' }}>문의 상세 및 답변</h3>
                    <button onClick={() => setSelectedInquiry(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer' }}>×</button>
                  </div>

                  {/* Customer Info Section */}
                  <div style={{ marginBottom: '24px', padding: '20px', background: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#38bdf8', marginBottom: '16px' }}>고객 정보</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>고객명</div>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>{selectedInquiry.user}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>이메일</div>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>{selectedInquiry.email}</div>
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>연락처</div>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>{selectedInquiry.contact}</div>
                      </div>
                    </div>
                  </div>

                  {/* Inquiry Content Section */}
                  <div style={{ marginBottom: '24px', padding: '20px', background: '#0f172a', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#38bdf8', marginBottom: '16px' }}>문의 내용</h4>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>[{selectedInquiry.type}] {selectedInquiry.date}</div>
                    <div style={{ fontWeight: '700', marginBottom: '8px', fontSize: '16px' }}>{selectedInquiry.title}</div>
                    <div style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{selectedInquiry.content}</div>
                    
                    {/* Attachment Section */}
                    {selectedInquiry.fileUrl && (
                      <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #334155' }}>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>첨부파일 확인</div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <a 
                            href={selectedInquiry.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ padding: '8px 12px', background: '#1e293b', borderRadius: '8px', fontSize: '12px', border: '1px solid #334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', textDecoration: 'none' }}
                          >
                            <span>📎</span> 첨부파일 보기
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {/* Answer Section */}
                    {selectedInquiry.answer && (
                      <div style={{ marginTop: '20px', padding: '16px', background: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#38bdf8', marginBottom: '12px' }}>답변 내용</h4>
                        <div style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{selectedInquiry.answer}</div>
                      </div>
                    )}
                  </div>

                  {!selectedInquiry.answer && (
                    <>
                      <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '700', color: '#94a3b8' }}>답변 작성</div>
                      <textarea 
                        value={inquiryAnswer}
                        onChange={(e) => setInquiryAnswer(e.target.value)}
                        placeholder="답변 내용을 입력하세요"
                        style={{ width: '100%', height: '120px', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '16px', color: 'white', resize: 'none', marginBottom: '24px' }}
                      />
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                          onClick={() => {
                            setSelectedInquiry(null);
                            setInquiryAnswer('');
                          }} 
                          style={{ flex: 1, padding: '16px', borderRadius: '12px', background: '#334155', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                        >취소</button>
                        <button 
                          onClick={async () => {
                            if (!inquiryAnswer.trim()) {
                              alert('답변 내용을 입력해주세요.');
                              return;
                            }
                            setIsSubmittingAnswer(true);
                            try {
                              await answerInquiry(selectedInquiry.id, inquiryAnswer.trim());
                              alert('답변이 등록되었습니다.');
                              setInquiryList(prev => prev.map(q => q.id === selectedInquiry.id ? { ...q, status: '답변 완료', statusEnum: 'ANSWERED' } : q));
                              setSelectedInquiry(null);
                              setInquiryAnswer('');
                              fetchInquiries(); // 목록 새로고침
                            } catch (error) {
                              console.error('답변 등록 실패:', error);
                              alert(error.response?.data?.error?.message || error.message || '답변 등록에 실패했습니다.');
                            } finally {
                              setIsSubmittingAnswer(false);
                            }
                          }} 
                          disabled={isSubmittingAnswer}
                          style={{ 
                            flex: 2, padding: '16px', borderRadius: '12px', 
                            background: isSubmittingAnswer ? '#475569' : '#38bdf8', 
                            color: isSubmittingAnswer ? '#94a3b8' : '#0f172a', 
                            border: 'none', fontWeight: '800', 
                            cursor: isSubmittingAnswer ? 'not-allowed' : 'pointer' 
                          }}
                        >
                          {isSubmittingAnswer ? '처리 중...' : '답변 등록'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      case 'cms':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>홈 페이지 배너 관리</h2>
                <button 
                  onClick={() => {
                    setCurrentBanner({ title: '', content: '', img: '', promotion: '', status: '노출 중', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' });
                    setIsBannerModalOpen(true);
                  }}
                  style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#38bdf8', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                >+ 새 배너 추가</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                {bannerList.map((banner, i) => (
                  <div key={banner.id} style={{ borderRadius: '16px', padding: '20px', background: banner.color, position: 'relative', height: '140px', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                    <div style={{ flex: 1, zIndex: 1 }}>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: 'white' }}>{banner.title}</div>
                      <div style={{ fontSize: '13px', marginTop: '4px', color: 'white', opacity: 0.9 }}>{banner.content}</div>
                      <div style={{ fontSize: '11px', marginTop: '8px', color: 'white', backgroundColor: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>{banner.promotion}</div>
                      <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8, color: 'white' }}>상태: {banner.status}</div>
                    </div>
                    {banner.img && (
                      <div style={{ width: '80px', height: '80px', borderRadius: '12px', backgroundImage: `url(${banner.img})`, backgroundSize: 'cover', backgroundPosition: 'center', marginLeft: '16px' }} />
                    )}
                    <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 2 }}>
                      <button 
                        onClick={() => {
                          setCurrentBanner(banner);
                          setIsBannerModalOpen(true);
                        }}
                        style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', fontSize: '11px', cursor: 'pointer' }}>수정</button>
                      <button 
                        onClick={() => {
                          if (window.confirm('배너를 삭제하시겠습니까?')) {
                            setBannerList(bannerList.filter(b => b.id !== banner.id));
                          }
                        }}
                        style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.3)', border: 'none', color: 'white', fontSize: '11px', cursor: 'pointer' }}>삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>기획전 관리</h2>
                <button 
                  onClick={() => alert('신규 기획전 등록 화면으로 이동')}
                  style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#38bdf8', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                >+ 새 기획전 추가</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                {promotions.map((promo) => (
                  <div key={promo.id} style={{ backgroundColor: '#0f172a', borderRadius: '16px', overflow: 'hidden', border: '1px solid #334155' }}>
                    <div style={{ height: '120px', backgroundImage: `url(${promo.bannerImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <div style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{promo.period}</div>
                          <div style={{ fontWeight: '800', fontSize: '18px' }}>{promo.title}</div>
                        </div>
                        <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', backgroundColor: promo.status === '진행 중' ? '#064e3b' : '#450a0a', color: promo.status === '진행 중' ? '#34d399' : '#f87171' }}>
                          {promo.status}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                        <button 
                          onClick={() => setSelectedPromotion(promo)}
                          style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#334155', color: 'white', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                        >자세히 보기</button>
                        <button style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#1e293b', color: '#94a3b8', border: '1px solid #334155', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>수정</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>공지사항 관리</h2>
                <button 
                  onClick={() => {
                    setCurrentNotice({ title: '', content: '', date: new Date().toISOString().split('T')[0].replace(/-/g, '.') });
                    setIsNoticeModalOpen(true);
                  }}
                  style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#38bdf8', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                >+ 공지 등록</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {noticeList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(notice => (
                  <div key={notice.id} style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                           <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{notice.date}</div>
                           <div style={{ fontWeight: '800', fontSize: '16px' }}>{notice.title}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                           <button 
                             onClick={() => {
                               setCurrentNotice(notice);
                               setIsNoticeModalOpen(true);
                             }}
                             style={{ border: 'none', background: 'transparent', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' }}>수정</button>
                           <button 
                             onClick={async () => {
                               if (window.confirm('공지사항을 삭제하시겠습니까?')) {
                                  try {
                                    await deleteNotice(notice.id);
                                    fetchNotices();
                                  } catch (e) {
                                    alert('삭제에 실패했습니다.');
                                  }
                               }
                             }}
                             style={{ border: 'none', background: 'transparent', color: '#ef4444', fontSize: '12px', cursor: 'pointer' }}>삭제</button>
                        </div>
                     </div>
                     <div style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>{notice.content}</div>
                  </div>
                ))}
              </div>
              <Pagination 
                currentPage={currentPage}
                totalItems={noticeList.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>자주 묻는 질문 (FAQ) 관리</h2>
                <button 
                  onClick={() => {
                    setCurrentFAQ({ question: '', answer: '' });
                    setIsFAQModalOpen(true);
                  }}
                  style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#38bdf8', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                >+ FAQ 등록</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {faqs.map(faq => (
                  <div key={faq.id} style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '12px' }}>
                        <div style={{ fontWeight: '800', color: '#38bdf8' }}>Q. {faq.question}</div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                           <button 
                             onClick={() => {
                               setCurrentFAQ(faq);
                               setIsFAQModalOpen(true);
                             }}
                             style={{ border: 'none', background: 'transparent', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' }}>수정</button>
                           <button
                             onClick={async () => {
                               if (!window.confirm('정말 삭제하시겠습니까?')) return;
                               try {
                                 await deleteFaq(faq.id);
                                 setFaqs(faqs.filter(f => f.id !== faq.id));
                                 alert('삭제되었습니다.');
                               } catch (e) {
                                 alert('삭제 실패: ' + e.message);
                               }
                             }}
                             style={{ border: 'none', background: 'transparent', color: '#ef4444', fontSize: '12px', cursor: 'pointer' }}>삭제</button>
                        </div>
                     </div>
                     <div style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>A. {faq.answer}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'payments':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Payment Overview Stats */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <select 
                value={paymentMonthFilter}
                onChange={(e) => setPaymentMonthFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: 'white', fontSize: '13px', outline: 'none' }}>
                <option value="2026-01">2026년 01월</option>
                <option value="2025-12">2025년 12월</option>
                <option value="2025-11">2025년 11월</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              {[
                { label: '총 결제 금액 (GMV)', value: '₩1,250,400,000', trend: '+12.5%', isPos: true },
                { label: '플랫폼 수수료 수익', value: '₩125,040,000', trend: '+8.2%', isPos: true },
                { label: '환불 금액', value: '₩12,300,000', trend: '-2.1%', isPos: false },
                { label: '순이익', value: '₩112,740,000', trend: '+10.4%', isPos: true, highlight: true }
              ].map((stat, i) => (
                <div key={i} style={{ backgroundColor: stat.highlight ? 'rgba(56, 189, 248, 0.05)' : '#1e293b', border: stat.highlight ? '1px solid #38bdf8' : '1px solid #334155', padding: '24px', borderRadius: '20px' }}>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>{stat.label}</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: stat.highlight ? '#38bdf8' : 'white' }}>{stat.value}</div>
                  <div style={{ fontSize: '12px', color: stat.isPos ? '#10b981' : '#ef4444', marginTop: '8px', fontWeight: '700' }}>
                    {stat.isPos ? '↗' : '↘'} {stat.trend} <span style={{ color: '#64748b', fontWeight: '400' }}>전월 대비</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
              {/* Sales Mix Chart */}
              <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '32px' }}>매출 구조 비중</h3>
                <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 40px' }}>
                  <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#1e293b" strokeWidth="3" />
                    <circle 
                      cx="18" cy="18" r="15.915" 
                      fill="transparent" 
                      stroke="#3b82f6" 
                      strokeWidth="3.8" 
                      strokeDasharray="65 35" 
                      strokeDashoffset="0" 
                    />
                    <circle 
                      cx="18" cy="18" r="15.915" 
                      fill="transparent" 
                      stroke="#60a5fa" 
                      strokeWidth="3.8" 
                      strokeDasharray="35 65" 
                      strokeDashoffset="-65" 
                    />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: 'white' }}>35%</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>SUBSCRIPTION</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94a3b8' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }}></span> 일반 매출
                      </div>
                      <span style={{ fontWeight: '700' }}>65%</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94a3b8' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#60a5fa' }}></span> 구독 매출
                      </div>
                      <span style={{ fontWeight: '700' }}>35%</span>
                   </div>
                </div>
              </div>

              {/* Mart Sales Summary Table */}
              <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>마트별 매출 요약</h3>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <select 
                      value={paymentRegionFilter}
                      onChange={(e) => setPaymentRegionFilter(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '13px', outline: 'none' }}>
                      <option value="ALL">지역 전체</option>
                      <option value="서울">서울</option>
                      <option value="경기">경기</option>
                    </select>
                    <input 
                      type="text" 
                      placeholder="마트명 검색" 
                      value={paymentSearch}
                      onChange={(e) => setPaymentSearch(e.target.value)}
                      style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '13px', outline: 'none' }} />
                  </div>
                </div>
                <div className="table-responsive">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '13px' }}>
                        <th style={{ padding: '16px' }}>지역</th>
                        <th style={{ padding: '16px' }}>카테고리</th>
                        <th style={{ padding: '16px' }}>마트명</th>
                        <th style={{ padding: '16px' }}>총 결제 금액</th>
                        <th style={{ padding: '16px' }}>수수료 수익</th>
                        <th style={{ padding: '16px' }}>상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.filter(p => (paymentRegionFilter === 'ALL' || p.region === paymentRegionFilter) && (p.mart.toLowerCase().includes(paymentSearch.toLowerCase()))).map((p, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #334155', fontSize: '14px' }}>
                          <td style={{ padding: '16px', color: '#cbd5e1' }}>{p.region}</td>
                          <td style={{ padding: '16px', color: '#94a3b8' }}>{p.category}</td>
                          <td style={{ padding: '16px', fontWeight: '700' }}>{p.mart}</td>
                          <td style={{ padding: '16px', fontWeight: '800' }}>₩{p.amount.toLocaleString()}</td>
                          <td style={{ padding: '16px', color: '#38bdf8', fontWeight: '800' }}>₩{p.commission.toLocaleString()}</td>
                          <td style={{ padding: '16px' }}>
                              <span style={{ 
                                padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800',
                                backgroundColor: p.status === '지급완료' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                color: p.status === '지급완료' ? '#10b981' : '#f59e0b'
                              }}>{p.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      case 'settlements':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Tab Selection */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setSettlementFilter('STORE')}
                style={{
                  padding: '12px 24px',
                  borderRadius: '14px',
                  backgroundColor: settlementFilter === 'STORE' ? '#38bdf8' : '#1e293b',
                  color: settlementFilter === 'STORE' ? '#0f172a' : '#94a3b8',
                  border: settlementFilter === 'STORE' ? 'none' : '1px solid #334155',
                  fontWeight: '800',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >🏛️ 마트 정산 관리 <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>{detailedSettlements.length}</span></button>
              <button 
                onClick={() => setSettlementFilter('RIDER')}
                style={{
                  padding: '12px 24px',
                  borderRadius: '14px',
                  backgroundColor: settlementFilter === 'RIDER' ? '#38bdf8' : '#1e293b',
                  color: settlementFilter === 'RIDER' ? '#0f172a' : '#94a3b8',
                  border: settlementFilter === 'RIDER' ? 'none' : '1px solid #334155',
                  fontWeight: '800',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >🚲 배달원 정산 관리 <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>{riderSettlements.length}</span></button>
            </div>


            {/* Settlement Overview Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
               {(settlementFilter === 'STORE' ? [
                 { label: '정산 대상 마트', value: '128개소', trend: '+5%', color: '#38bdf8' },
                 { label: '정산 완료 마트', value: '112개소', sub: '진행률 87.5%', color: '#10b981' },
                 { label: '미지급 정산 건수', value: '16건', sub: '! 확인 필요', color: '#ef4444' },
                 { label: '이번 달 정산 예정 총액', value: '₩452.0M', trend: '-4.2%', color: '#f59e0b' }
               ] : [
                 { label: '정산 대상 배달원', value: '256명', trend: '+12%', color: '#38bdf8' },
                 { label: '정산 완료 배달원', value: '230명', sub: '진행률 89.8%', color: '#10b981' },
                 { label: '미지급 정산 건수', value: '26건', sub: '! 확인 필요', color: '#ef4444' },
                 { label: '이번 달 정산 예정 총액', value: '₩84.5M', trend: '+8.5%', color: '#f59e0b' }
               ]).map((stat, i) => (
                 <div key={i} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>{stat.label}</div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: stat.color }}>{stat.value}</div>
                    <div style={{ fontSize: '12px', color: stat.color, marginTop: '8px', opacity: 0.8 }}>{stat.trend || stat.sub}</div>
                 </div>
               ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
               {/* Monthly Settlement Trend */}
               <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{settlementFilter === 'STORE' ? '마트' : '배달원'}별 정산 추이</h3>
                    <div style={{ color: '#10b981', fontWeight: '800' }}>{settlementFilter === 'STORE' ? '₩2,450.0M' : '₩420.0M'} <span style={{ fontSize: '12px' }}>+12.5%</span></div>
                  </div>
                  <div style={{ height: '200px', width: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 20px' }}>
                    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
                      <path 
                        d="M0 150 Q 100 80, 200 120 T 400 60 T 600 100" 
                        fill="none" stroke={settlementFilter === 'STORE' ? '#3b82f6' : '#10b981'} strokeWidth="3" 
                        style={{ filter: `drop-shadow(0 0 8px ${settlementFilter === 'STORE' ? 'rgba(59,130,246,0.5)' : 'rgba(16,185,129,0.5)'})` }}
                      />
                    </svg>
                    {['6월', '7월', '8월', '9월', '10월', '11월'].map(month => (
                      <div key={month} style={{ color: '#64748b', fontSize: '11px', marginTop: '10px' }}>{month}</div>
                    ))}
                  </div>
               </div>

               {/* Policy Summary */}
               <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#38bdf8' }}>ℹ️</span> 정산 정책
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>수수료 / 매칭비</div>
                      <div style={{ color: '#cbd5e1', fontWeight: '600' }}>{settlementFilter === 'STORE' ? '카드 결제액의 3.3%' : '건당 500원 매칭 수수료'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>정산 주기 및 지급</div>
                      <div style={{ color: '#cbd5e1', fontWeight: '600' }}>
                        {settlementFilter === 'STORE' ? (
                          <>
                            정산 집계: 매월 10일<br/>
                            지급 일자: 매월 15일 (1개월 주기)
                          </>
                        ) : '매주 금요일 (7일 주기)'}
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569', marginTop: '20px', lineHeight: '1.6' }}>
                      마트는 1개월 단위 정산(10일 집계/15일 지급)을 원칙으로 하며, 라이더는 7일 단위 정산을 수행합니다. 실패 건 발생 시 최대 3회 자동 재시도 후 처리됩니다.
                    </div>
                  </div>
               </div>
            </div>

            {/* Detailed Settlement List */}
            <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{settlementFilter === 'STORE' ? '마트별' : '배달원별'} 정산 현황</h3>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button 
                      onClick={() => handleExecuteSettlement(settlementFilter)}
                      style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#10b981', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      🚀 정산 실행
                    </button>
                    <input 
                      type="text" 
                      placeholder={settlementFilter === 'STORE' ? "마트명 검색" : "배달원 이름 검색"}
                      value={settlementSearch}
                      onChange={(e) => setSettlementSearch(e.target.value)}
                      style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '13px', outline: 'none' }} />
                     <select 
                       value={settlementMonthFilter}
                       onChange={(e) => setSettlementMonthFilter(e.target.value)}
                       style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '13px', outline: 'none' }}>
                        <option value="2026-01">2026년 01월</option>
                        <option value="2025-12">2025년 12월</option>
                        <option value="2025-11">2025년 11월</option>
                     </select>
                     <select 
                       value={settlementStatusFilter}
                       onChange={(e) => setSettlementStatusFilter(e.target.value)}
                       style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '13px', outline: 'none' }}>
                        <option value="ALL">정산 상태: 전체</option>
                        <option value="지급 완료">지급 완료</option>
                        <option value="지급 처리중">지급 처리중</option>
                        <option value="승인 대기">승인 대기</option>
                        <option value="지급 실패">지급 실패</option>
                     </select>
                  </div>
               </div>
               <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                     <thead>
                       <tr style={{ textAlign: 'left', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '13px' }}>
                         <th style={{ padding: '16px' }}>{settlementFilter === 'STORE' ? '마트 정보' : '배달원 정보'}</th>
                         <th style={{ padding: '16px' }}>지역</th>
                         <th style={{ padding: '16px' }}>총 정산액</th>
                         <th style={{ padding: '16px' }}>지급 예정일</th>
                         <th style={{ padding: '16px' }}>지급 상태</th>
                         <th style={{ padding: '16px' }}>상세조회</th>
                       </tr>
                     </thead>
                     <tbody>
                       {(settlementFilter === 'STORE' ? detailedSettlements : riderSettlements)
                         .filter(s => (settlementStatusFilter === 'ALL' || s.status === settlementStatusFilter) && (s.name.toLowerCase().includes(settlementSearch.toLowerCase()) || s.id_code.toLowerCase().includes(settlementSearch.toLowerCase())))
                         .map((s, i) => (
                         <tr key={i} style={{ borderBottom: '1px solid #334155', fontSize: '14px' }}>
                           <td style={{ padding: '16px' }}>
                             <div style={{ fontWeight: '700' }}>{s.name}</div>
                             <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>ID: {s.id_code}</div>
                           </td>
                           <td style={{ padding: '16px', color: '#cbd5e1' }}>{s.region}</td>
                           <td style={{ padding: '16px', fontWeight: '800' }}>₩{s.amount.toLocaleString()}</td>
                           <td style={{ padding: '16px', color: '#94a3b8' }}>{s.date}</td>
                           <td style={{ padding: '16px' }}>
                             <span style={{ 
                               padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
                               backgroundColor: `${s.color}20`, color: s.color
                             }}>
                               {s.status}
                             </span>
                           </td>
                           <td style={{ padding: '16px' }}>
                             <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px' }}>👁</button>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                </table>
               </div>
            </div>
          </div>
        );
      case 'approvals':
        const filteredApprovals = approvalItems.filter(item => {
          const matchesCategory = approvalFilter === 'ALL' || item.category === approvalFilter;
          const matchesStatus = approvalStatusFilter === 'ALL' || 
                               (approvalStatusFilter === 'PENDING' && item.status === '심사 대기') ||
                               (approvalStatusFilter === 'HOLD' && item.status === '서류 미비');
          return matchesCategory && matchesStatus;
        });

        return (
          <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid #334155', paddingBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setApprovalFilter('ALL')}
                  style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', backgroundColor: approvalFilter === 'ALL' ? '#38bdf8' : 'transparent', color: approvalFilter === 'ALL' ? '#0f172a' : '#94a3b8', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}>전체 보기</button>
                <button 
                  onClick={() => setApprovalFilter('STORE')}
                  style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', backgroundColor: approvalFilter === 'STORE' ? '#38bdf8' : 'transparent', color: approvalFilter === 'STORE' ? '#0f172a' : '#94a3b8', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}>마트 신청</button>
                <button 
                  onClick={() => setApprovalFilter('RIDER')}
                  style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', backgroundColor: approvalFilter === 'RIDER' ? '#38bdf8' : 'transparent', color: approvalFilter === 'RIDER' ? '#0f172a' : '#94a3b8', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}>라이더 신청</button>
              </div>
              <div style={{ display: 'flex', gap: '8px', backgroundColor: '#0f172a', padding: '4px', borderRadius: '12px' }}>
                {['ALL', 'PENDING', 'HOLD'].map(s => (
                  <button 
                    key={s}
                    onClick={() => setApprovalStatusFilter(s)}
                    style={{ 
                      padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', border: 'none',
                      backgroundColor: approvalStatusFilter === s ? '#334155' : 'transparent',
                      color: approvalStatusFilter === s ? 'white' : '#64748b'
                    }}>
                    {s === 'ALL' ? '전체 상태' : s === 'PENDING' ? '심사대기' : '보완필요'}
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
                      <td style={{ padding: '16px' }}>
                        <span style={{ backgroundColor: item.color, padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{item.type}</span>
                      </td>
                      <td style={{ padding: '16px' }}>{item.name}</td>
                      <td style={{ padding: '16px' }}>{item.date}</td>
                      <td style={{ padding: '16px' }}>
                         <button 
                           onClick={() => setSelectedApproval(item)}
                           style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: 'none', fontWeight: '700', cursor: 'pointer' }}>상세보기</button>
                      </td>
                    </tr>
                  ))}
                  {filteredApprovals.length === 0 && (
                    <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>대기 중인 신청 건이 없습니다.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination 
              currentPage={currentPage}
              totalItems={filteredApprovals.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        );
      case 'notifications':
        return (
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
                  <textarea rows="4" placeholder="내용을 입력하세요" style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', resize: 'none' }}></textarea>
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
               <Pagination 
                 currentPage={currentPage}
                 totalItems={notificationHistory.length}
                 itemsPerPage={itemsPerPage}
                 onPageChange={setCurrentPage}
               />
            </div>
          </div>
        );
      case 'reports':
      case 'reports_view':
        const pendingCount = reports.filter(r => r.status === '확인 중').length;
        const resolvedCount = reports.filter(r => r.status === '처리완료' || r.status === '답변완료').length;

        const filteredReports = reports.filter(report => {
           const matchesStatus = 
             reportsFilter === 'ALL' || 
             (reportsFilter === 'RESOLVED' && (report.status === '처리완료' || report.status === '답변완료')) ||
             (reportsFilter === 'UNRESOLVED' && report.status === '확인 중');
           
           const matchesSearch = 
             (report.reported && report.reported.name.toLowerCase().includes(reportsSearch.toLowerCase())) ||
             (report.reporter && report.reporter.name.toLowerCase().includes(reportsSearch.toLowerCase())) ||
             (report.orderNo && report.orderNo.toLowerCase().includes(reportsSearch.toLowerCase()));

           return matchesStatus && matchesSearch;
        });

        return (
          <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>신고 및 분쟁 관리</h2>
                <div style={{ display: 'flex', gap: '24px', color: '#94a3b8', fontSize: '14px', fontWeight: '700' }}>
                   <span>확인중인 신고수 : {pendingCount}개</span>
                   <span>처리완료 신고 수: {resolvedCount}개</span>
                </div>
             </div>
             
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ flex: 1 }}></div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                   <div style={{ position: 'relative' }}>
                      <input 
                        type="text" 
                        placeholder="배달원명/마트명 검색..." 
                        value={reportsSearch}
                        onChange={(e) => setReportsSearch(e.target.value)}
                        style={{ padding: '8px 16px', paddingLeft: '36px', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '13px', width: '220px' }} 
                      />
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
                   </div>
                   <div style={{ display: 'flex', background: '#0f172a', padding: '4px', borderRadius: '10px', gap: '4px' }}>
                      {['ALL', 'UNRESOLVED', 'RESOLVED'].map(f => (
                        <button 
                          key={f}
                          onClick={() => setReportsFilter(f)}
                          style={{ 
                            padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', border: 'none',
                            backgroundColor: reportsFilter === f ? '#38bdf8' : 'transparent',
                            color: reportsFilter === f ? '#0f172a' : '#94a3b8',
                            transition: 'all 0.2s'
                          }}
                        >
                          {f === 'ALL' ? '전체' : f === 'UNRESOLVED' ? '미처리' : '해결됨'}
                        </button>
                      ))}
                   </div>
                </div>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               {filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((report, i) => {
                 const getRoleColor = (type) => {
                   if (type === 'USER') return '#38bdf8';
                   if (type === 'STORE') return '#10b981';
                   if (type === 'RIDER') return '#f59e0b';
                   return '#94a3b8';
                 };

                 const getRoleLabel = (type) => {
                   if (type === 'USER') return '사용자';
                   if (type === 'STORE') return '마트';
                   if (type === 'RIDER') return '라이더';
                   return '관리자';
                 };

                 return (
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
                       <span style={{ 
                         fontSize: '13px', 
                         fontWeight: '700',
                         color: report.status === '확인 중' ? '#f59e0b' : '#10b981' 
                       }}>
                         ● {report.status}
                       </span>
                       <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => setSelectedReport(report)}
                            style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#1e293b', color: '#94a3b8', border: '1px solid #334155', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}>
                            내용 보기
                          </button>
                          {report.status !== '처리완료' && (
                            <button 
                              onClick={() => setSelectedReport(report)}
                              style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: 'none', fontSize: '13px', cursor: 'pointer', fontWeight: '800' }}>
                              결과 입력
                            </button>
                          )}
                       </div>
                    </div>
                 </div>
                 );
               })}
               {filteredReports.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>신고 내역이 없습니다.</div>}
             </div>
             <Pagination 
                currentPage={currentPage}
                totalItems={filteredReports.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
          </div>
        );
      default:
        return (
          <>
            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '40px' }}>
              <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>주문 거래액 리포트</h3>
                  <div style={{ display: 'flex', background: '#0f172a', padding: '4px', borderRadius: '8px', gap: '4px' }}>
                    {['weekly', 'monthly', 'yearly'].map(p => (
                      <button 
                        key={p}
                        onClick={() => setChartPeriod(p)}
                        style={{ 
                          padding: '6px 12px', borderRadius: '6px', border: 'none', fontSize: '11px', fontWeight: '800', cursor: 'pointer',
                          backgroundColor: chartPeriod === p ? '#38bdf8' : 'transparent',
                          color: chartPeriod === p ? '#0f172a' : '#94a3b8'
                        }}
                      >
                        {p === 'weekly' ? '주간' : p === 'monthly' ? '월간' : '연간'}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '12px', padding: '10px' }}>
                  {(chartPeriod === 'weekly' ? [40, 65, 50, 85, 70, 95, 60] : chartPeriod === 'monthly' ? [30, 45, 60, 55, 80, 95] : [55, 65, 80, 95]).map((height, i) => (
                    <div key={i} style={{ 
                      flex: 1, 
                      height: `${height}%`, 
                      backgroundColor: '#38bdf8', 
                      borderRadius: '4px 4px 0 0',
                      opacity: 0.6 + (height / 200)
                    }}></div>
                  ))}
                </div>
              </div>
              <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>활성 사용자 지표</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                  {[
                    { label: '전체 고객', value: '12,504명' },
                    { label: '등록 마트', value: '458개' },
                    { label: '활동 배달원', value: '892명' },
                    { label: '정산 현황 (미지급)', value: `${detailedSettlements.filter(s => s.status !== '지급 완료').length + riderSettlements.filter(s => s.status !== '지급 완료').length}건`, highlight: true, action: () => setActiveTab('settlements') },
                    { label: '확인중인 신고수', value: `${reports.filter(r => r.status === '확인 중').length}개`, highlight: true, action: () => setActiveTab('reports') },
                    { label: '처리완료 신고 수', value: `${reports.filter(r => r.status === '처리완료' || r.status === '답변완료').length}개`, highlight: true, action: () => setActiveTab('reports') },
                    { label: '승인 대기', value: `${approvalItems.length}건`, highlight: true, action: () => setActiveTab('approvals') },
                    { label: '미답변 1:1 문의', value: `${inquiryList.filter(inq => inq.status === '답변 대기').length}건`, highlight: true, action: () => setActiveTab('inquiry') }
                  ].map((stat, i) => (
                    <div 
                      key={i} 
                      onClick={stat.action}
                      style={{ 
                        display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #334155',
                        cursor: stat.action ? 'pointer' : 'default'
                      }}>
                      <span style={{ color: stat.highlight ? '#f59e0b' : '#94a3b8', fontWeight: stat.highlight ? '700' : 'normal' }}>{stat.label}</span>
                      <span style={{ fontWeight: '700', color: stat.highlight ? '#f59e0b' : 'white' }}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>최근 신고/분쟁 현황</h2>
                <div 
                  onClick={() => setActiveTab('reports')}
                  style={{ color: '#38bdf8', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}>상세 보기 →</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                 {[
                   { label: '확인 대기 중', count: reports.filter(r => r.status === '확인 중').length, color: '#f59e0b' },
                   { label: '처리 완료', count: reports.filter(r => r.status === '처리완료').length, color: '#10b981' },
                   { label: '답변 완료', count: reports.filter(r => r.status === '답변완료').length, color: '#38bdf8' }
                 ].map((stat, i) => (
                   <div key={i} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155', textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>{stat.label}</div>
                      <div style={{ fontSize: '28px', fontWeight: '900', color: stat.color }}>{stat.count}<span style={{ fontSize: '14px', color: '#64748b', marginLeft: '4px' }}>건</span></div>
                   </div>
                 ))}
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="admin-dashboard" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white' }}>
      <RecordDetailModal 
        record={selectedRecord} 
        onClose={() => setSelectedRecord(null)} 
        onToggleStatus={handleToggleStatus}
        reports={reports}
        onShowReports={(user) => {
           setActiveTab('reports_view');
           setSelectedRecord(null);
        }}
      />

      <ApprovalDetailModal 
        item={selectedApproval}
        onClose={() => setSelectedApproval(null)}
        onAction={handleApprovalAction}
      />

      {selectedReport && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(5px)' }}>
            <div style={{ backgroundColor: '#1e293b', width: '100%', maxWidth: '650px', maxHeight: '90vh', borderRadius: '24px', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
               {/* Header */}
               <div style={{ padding: '32px 32px 16px', borderBottom: '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>신고 및 분쟁 상세 검토</h3>
                      <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                        신고 유형: {selectedReport.type} | 신고 번호: #REP-2026-{selectedReport.id}
                      </div>
                    </div>
                    <button onClick={() => { setSelectedReport(null); setResolutionMessage(''); }} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '28px', cursor: 'pointer' }}>×</button>
                  </div>
               </div>

               {/* Content - Scrollable */}
               <div style={{ padding: '32px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
                     <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
                       사용자 입력 신고 내용
                     </div>
                     <div style={{ lineHeight: '1.7', fontSize: '15px', color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>{selectedReport.content}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                     <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>주문 번호</div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#38bdf8' }}>{selectedReport.orderNo}</div>
                     </div>
                     <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>신고 접수 시간</div>
                        <div style={{ fontSize: '15px', fontWeight: '700' }}>{selectedReport.time} (2026-01-27)</div>
                     </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                     <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(56, 189, 248, 0.1)' }}>
                        <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '800', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>신고자 정보 (Reporter)</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '13px', color: '#94a3b8' }}>성명/상호</span>
                              <span style={{ fontSize: '14px', fontWeight: '700' }}>{selectedReport.reporter.name}</span>
                           </div>
                           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '13px', color: '#94a3b8' }}>연락처</span>
                              <span style={{ fontSize: '14px', fontWeight: '700' }}>{selectedReport.reporter.contact}</span>
                           </div>
                           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '13px', color: '#94a3b8' }}>유형</span>
                              <span style={{ fontSize: '12px', fontWeight: '800', color: '#38bdf8' }}>{selectedReport.reporter.type}</span>
                           </div>
                        </div>
                     </div>
                     <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                        <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '800', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>피신고자 정보 (Reported)</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '13px', color: '#94a3b8' }}>성명/상호</span>
                              <span style={{ fontSize: '14px', fontWeight: '700' }}>{selectedReport.reported.name}</span>
                           </div>
                           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '13px', color: '#94a3b8' }}>연락처</span>
                              <span style={{ fontSize: '14px', fontWeight: '700' }}>{selectedReport.reported.contact}</span>
                           </div>
                           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '13px', color: '#94a3b8' }}>유형</span>
                              <span style={{ fontSize: '12px', fontWeight: '800', color: '#f59e0b' }}>{selectedReport.reported.type}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {selectedReport.status === '처리완료' ? (
                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                       <div style={{ fontSize: '13px', color: '#10b981', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '18px' }}>✅</span> 처리 결과 공식 답변
                       </div>
                       <div style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: '1.7' }}>{selectedReport.resolution}</div>
                    </div>
                  ) : (
                    <div style={{ marginTop: '10px' }}>
                       <label style={{ display: 'block', fontSize: '14px', color: '#94a3b8', fontWeight: '700', marginBottom: '12px' }}>조치 결과 및 답변 입력</label>
                       <textarea 
                         value={resolutionMessage}
                         onChange={(e) => setResolutionMessage(e.target.value)}
                         placeholder="해당 신고 건에 대한 조치 결과와 신고자에게 보낼 답변을 상세히 입력해주세요..."
                         style={{ width: '100%', height: '120px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '16px', color: 'white', resize: 'none', fontSize: '14px', lineHeight: '1.6' }}
                       />
                    </div>
                  )}
               </div>

               {/* Footer Footer */}
               <div style={{ padding: '24px 32px 32px', borderTop: '1px solid #334155', backgroundColor: '#1e293b' }}>
                  {selectedReport.status === '처리완료' ? (
                    <button 
                      onClick={() => { setSelectedReport(null); setResolutionMessage(''); }} 
                      style={{ width: '100%', padding: '16px', borderRadius: '14px', backgroundColor: '#334155', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer' }}>확인 및 닫기</button>
                  ) : (
                    <div style={{ display: 'flex', gap: '12px' }}>
                       <button 
                         onClick={() => { setSelectedReport(null); setResolutionMessage(''); }} 
                         style={{ flex: 1, padding: '16px', borderRadius: '14px', backgroundColor: '#334155', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer' }}>취소</button>
                       <button 
                         onClick={() => {
                           handleResolveReport(selectedReport.id, resolutionMessage);
                           setResolutionMessage('');
                         }}
                         style={{ flex: 2, padding: '16px', borderRadius: '14px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', fontWeight: '900', cursor: 'pointer' }}>최종 처리 완료 및 답변 전송</button>
                    </div>
                  )}
               </div>
            </div>
        </div>
      )}
      {/* Sidebar */}
      <div className="sidebar" style={{
        width: '260px',
        backgroundColor: '#1e293b',
        padding: '30px 5px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        borderRight: '1px solid #334155',
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        <div 
          onClick={() => setActiveTab('overview')}
          style={{ fontSize: '24px', fontWeight: '800', marginBottom: '30px', color: '#38bdf8', cursor: 'pointer' }}>동네마켓 Admin</div>
        <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} 
          onClick={() => setActiveTab('overview')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'overview' ? '#334155' : 'transparent', color: activeTab === 'overview' ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>📊 전체 현황</div>
        <div className={`nav-item ${activeTab === 'approvals' ? 'active' : ''}`} 
          onClick={() => setActiveTab('approvals')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'approvals' ? '#334155' : 'transparent', color: activeTab === 'approvals' ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>📝 신청 관리</div>
        <div className={`nav-item ${activeTab === 'stores' ? 'active' : ''}`} 
          onClick={() => setActiveTab('stores')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'stores' ? '#334155' : 'transparent', color: activeTab === 'stores' ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>🏢 마트 관리</div>
        <div className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} 
          onClick={() => setActiveTab('users')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'users' ? '#334155' : 'transparent', color: activeTab === 'users' ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>👤 사용자 관리</div>
        <div className={`nav-item ${activeTab === 'riders' ? 'active' : ''}`} 
          onClick={() => setActiveTab('riders')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'riders' ? '#334155' : 'transparent', color: activeTab === 'riders' ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>🛵 배달원 관리</div>
        <div className={`nav-item ${activeTab === 'cms' ? 'active' : ''}`} 
          onClick={() => setActiveTab('cms')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'cms' ? '#334155' : 'transparent', color: activeTab === 'cms' ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>🖼️ 콘텐츠 관리</div>
        <div className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`} 
          onClick={() => setActiveTab('payments')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'payments' ? '#334155' : 'transparent', color: activeTab === 'payments' ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>💳 결제 관리</div>
        <div className={`nav-item ${activeTab === 'settlements' ? 'active' : ''}`} 
          onClick={() => setActiveTab('settlements')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'settlements' ? '#334155' : 'transparent', color: activeTab === 'settlements' ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>💰 정산 내역</div>
        <div className={`nav-item ${activeTab === 'reports' || activeTab === 'reports_view' ? 'active' : ''}`} 
          onClick={() => setActiveTab('reports')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: (activeTab === 'reports' || activeTab === 'reports_view') ? '#334155' : 'transparent', color: (activeTab === 'reports' || activeTab === 'reports_view') ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>🚨 신고 / 분쟁</div>
        <div className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`} 
          onClick={() => setActiveTab('notifications')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'notifications' ? '#334155' : 'transparent', color: activeTab === 'notifications' ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>📢 알림 발송</div>
        <div className={`nav-item ${activeTab === 'inquiry' ? 'active' : ''}`} 
          onClick={() => setActiveTab('inquiry')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'inquiry' ? '#334155' : 'transparent', color: activeTab === 'inquiry' ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>💬 1:1 문의</div>
      </div>

      {/* Main Content */}
      <div className="main-content" style={{ flexGrow: 1, padding: '40px' }}>
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700' }}>
            {activeTab === 'overview' ? '플랫폼 전체 현황' : 
             activeTab === 'approvals' ? '신규 신청 관리' :
             activeTab === 'stores' ? '마트 관리' : 
             activeTab === 'users' ? '사용자 관리' :
             activeTab === 'riders' ? '배달원 관리' :  
             activeTab === 'payments' ? '결제 관리 센터' :
             activeTab === 'settlements' ? '마트 정산 현황' :
             activeTab === 'cms' ? '콘텐츠 관리' :
             activeTab === 'reports' || activeTab === 'reports_view' ? '신고 및 분쟁 관리' :
             activeTab === 'notifications' ? '알림 발송 센터' :
             activeTab === 'inquiry' ? '1:1 문의 고객응대' : '관리 대시보드'}
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '4px' }}>2026년 1월 22일 기준</p>
        </header>

        {renderActiveView()}

        {isNoticeModalOpen && currentNotice && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: '#1e293b', width: '100%', maxWidth: '600px', borderRadius: '24px', padding: '32px', border: '1px solid #334155' }}>
               <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>{currentNotice.id ? '공지사항 수정' : '새 공지사항 등록'}</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>제목</label>
                    <input 
                      type="text" 
                      value={currentNotice.title}
                      onChange={(e) => setCurrentNotice({...currentNotice, title: e.target.value})}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>내용</label>
                    <textarea 
                      value={currentNotice.content}
                      onChange={(e) => setCurrentNotice({...currentNotice, content: e.target.value})}
                      style={{ width: '100%', height: '200px', padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white', resize: 'none' }}
                    />
                  </div>
               </div>
               <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                  <button onClick={() => setIsNoticeModalOpen(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#334155', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>취소</button>
                  <button 
                    onClick={async () => {
                      try {
                        if (currentNotice.id) {
                          await updateNotice(currentNotice.id, currentNotice.title, currentNotice.content);
                          alert('수정되었습니다.');
                        } else {
                          await createNotice(currentNotice.title, currentNotice.content);
                          alert('등록되었습니다.');
                        }
                        setIsNoticeModalOpen(false);
                        fetchNotices();
                      } catch (e) {
                        alert('저장에 실패했습니다.');
                      }
                    }}
                    style={{ flex: 2, padding: '14px', borderRadius: '12px', background: '#38bdf8', color: '#0f172a', border: 'none', fontWeight: '800', cursor: 'pointer' }}>저장하기</button>
               </div>
            </div>
          </div>
        )}

        {isFAQModalOpen && currentFAQ && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: '#1e293b', width: '100%', maxWidth: '600px', borderRadius: '24px', padding: '32px', border: '1px solid #334155' }}>
               <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>{currentFAQ.id ? 'FAQ 수정' : '새 FAQ 등록'}</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>질문 (Question)</label>
                    <input 
                      type="text" 
                      placeholder="질문을 입력하세요"
                      value={currentFAQ.question}
                      onChange={(e) => setCurrentFAQ({...currentFAQ, question: e.target.value})}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>답변 (Answer)</label>
                    <textarea 
                      placeholder="답변을 입력하세요"
                      value={currentFAQ.answer}
                      onChange={(e) => setCurrentFAQ({...currentFAQ, answer: e.target.value})}
                      style={{ width: '100%', height: '200px', padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white', resize: 'none' }}
                    />
                  </div>
               </div>
               <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                  <button onClick={() => setIsFAQModalOpen(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#334155', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>취소</button>
                  <button
                    onClick={async () => {
                      if (!currentFAQ.question || !currentFAQ.answer) {
                        alert('질문과 답변을 모두 입력해주세요.');
                        return;
                      }
                      try {
                        if (currentFAQ.id) {
                          await updateFaq(currentFAQ.id, currentFAQ.question, currentFAQ.answer);
                          setFaqs(faqs.map(f => f.id === currentFAQ.id ? currentFAQ : f));
                          alert('수정되었습니다.');
                        } else {
                          const created = await createFaq(currentFAQ.question, currentFAQ.answer);
                          setFaqs([{ id: created.faqId, question: created.question, answer: created.answer }, ...faqs]);
                          alert('등록되었습니다.');
                        }
                        setIsFAQModalOpen(false);
                      } catch (e) {
                        alert('저장 실패: ' + e.message);
                      }
                    }}
                    style={{ flex: 2, padding: '14px', borderRadius: '12px', background: '#38bdf8', color: '#0f172a', border: 'none', fontWeight: '800', cursor: 'pointer' }}>저장하기</button>
               </div>
            </div>
          </div>
        )}

        {isBannerModalOpen && currentBanner && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: '#1e293b', width: '100%', maxWidth: '600px', borderRadius: '24px', padding: '32px', border: '1px solid #334155' }}>
               <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>{currentBanner.id ? '배너 수정' : '새 배너 등록'}</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>제목</label>
                      <input 
                        type="text" 
                        placeholder="배너 메인 타이틀"
                        value={currentBanner.title}
                        onChange={(e) => setCurrentBanner({...currentBanner, title: e.target.value})}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>기획전 연동</label>
                      <input 
                        type="text" 
                        placeholder="예: 제철 과일 기획전"
                        value={currentBanner.promotion}
                        onChange={(e) => setCurrentBanner({...currentBanner, promotion: e.target.value})}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>내용 (설명)</label>
                    <input 
                      type="text" 
                      placeholder="배너 보조 설명 문구"
                      value={currentBanner.content}
                      onChange={(e) => setCurrentBanner({...currentBanner, content: e.target.value})}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>이미지 URL</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <input 
                        type="text" 
                        placeholder="https://..."
                        value={currentBanner.img}
                        onChange={(e) => setCurrentBanner({...currentBanner, img: e.target.value})}
                        style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white' }}
                      />
                      {currentBanner.img && (
                        <div style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundImage: `url(${currentBanner.img})`, backgroundSize: 'cover' }} />
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>노출 상태</label>
                      <select 
                        value={currentBanner.status}
                        onChange={(e) => setCurrentBanner({...currentBanner, status: e.target.value})}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white' }}
                      >
                        <option value="노출 중">노출 중</option>
                        <option value="일시 중지">일시 중지</option>
                        <option value="종료">종료</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>배너 배경색 (Gradients)</label>
                      <select 
                        value={currentBanner.color}
                        onChange={(e) => setCurrentBanner({...currentBanner, color: e.target.value})}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white' }}
                      >
                        <option value="linear-gradient(45deg, #ff9a9e, #fad0c4)">Pink Dream</option>
                        <option value="linear-gradient(120deg, #a1c4fd, #c2e9fb)">Blue Sky</option>
                        <option value="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">Deep Purple</option>
                        <option value="linear-gradient(to right, #43e97b 0%, #38f9d7 100%)">Fresh Green</option>
                        <option value="linear-gradient(to right, #f83600 0%, #f9d423 100%)">Sunset</option>
                      </select>
                    </div>
                  </div>
               </div>
               <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                  <button onClick={() => setIsBannerModalOpen(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#334155', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>취소</button>
                  <button 
                    onClick={() => {
                      if (!currentBanner.title || !currentBanner.img) {
                        alert('제목과 이미지는 필수 항목입니다.');
                        return;
                      }
                      if (currentBanner.id) {
                        setBannerList(bannerList.map(b => b.id === currentBanner.id ? currentBanner : b));
                        alert('수정되었습니다.');
                      } else {
                        setBannerList([{ ...currentBanner, id: Date.now() }, ...bannerList]);
                        alert('등록되었습니다.');
                      }
                      setIsBannerModalOpen(false);
                    }}
                    style={{ flex: 2, padding: '14px', borderRadius: '12px', background: '#38bdf8', color: '#0f172a', border: 'none', fontWeight: '800', cursor: 'pointer' }}>저장하기</button>
               </div>
            </div>
          </div>
        )}

        {selectedPromotion && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: '#1e293b', width: '100%', maxWidth: '800px', borderRadius: '24px', padding: '0', border: '1px solid #334155', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
               <div style={{ height: '240px', backgroundImage: `url(${selectedPromotion.bannerImg})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(15,23,42,0.9))' }} />
                  <button 
                    onClick={() => setSelectedPromotion(null)}
                    style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', fontSize: '24px', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}>×</button>
                  <div style={{ position: 'absolute', bottom: '32px', left: '32px' }}>
                    <div style={{ color: '#38bdf8', fontSize: '14px', fontWeight: '800', marginBottom: '8px' }}>기획전 상세 내역</div>
                    <h2 style={{ fontSize: '32px', fontWeight: '900', color: 'white', margin: 0 }}>{selectedPromotion.title}</h2>
                  </div>
               </div>
               
               <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
                    <div>
                      <h4 style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px', fontWeight: '700' }}>진행 정보</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>진행 기간</div>
                          <div style={{ fontWeight: '600', color: '#cbd5e1' }}>{selectedPromotion.period}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>상태</div>
                          <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', backgroundColor: '#064e3b', color: '#34d399' }}>{selectedPromotion.status}</span>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>설명</div>
                          <div style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6' }}>{selectedPromotion.description}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px', fontWeight: '700' }}>참여 상품 ({selectedPromotion.products.length})</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {selectedPromotion.products.map((product, idx) => (
                          <div key={idx} style={{ padding: '16px', backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: '700', fontSize: '15px' }}>{product.name}</div>
                              <div style={{ fontSize: '13px', color: '#38bdf8', marginTop: '4px' }}>{product.price}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '13px', color: '#94a3b8' }}>재고: {product.stock}개</div>
                              <div style={{ fontSize: '13px', color: '#10b981', fontWeight: '700' }}>누적 판매: {product.sales}건</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
               </div>
               
               <div style={{ padding: '24px 32px', backgroundColor: '#1e293b', borderTop: '1px solid #334155', display: 'flex', gap: '12px' }}>
                  <button onClick={() => setSelectedPromotion(null)} style={{ flex: 1, padding: '16px', borderRadius: '12px', background: '#334155', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer' }}>닫기</button>
                  <button onClick={() => alert('수정 모드로 이동')} style={{ flex: 2, padding: '16px', borderRadius: '12px', background: '#38bdf8', color: '#0f172a', border: 'none', fontWeight: '900', cursor: 'pointer' }}>기획전 정보 수정</button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
