import React, { useState, useEffect, useRef } from 'react';

const isImageFile = (url) => {
  if (!url) return false;
  if (url.startsWith('data:image/')) return true;
  const clean = url.split('?')[0].toLowerCase();
  return clean.endsWith('.png') || clean.endsWith('.jpg') || clean.endsWith('.jpeg') || clean.endsWith('.gif') || clean.endsWith('.webp');
};

const isPdfFile = (url) => {
  if (!url) return false;
  if (url.startsWith('data:application/pdf')) return true;
  const clean = url.split('?')[0].toLowerCase();
  return clean.endsWith('.pdf');
};

const ApprovalDetailModal = ({ item, onClose, onAction }) => {
  const [actionType, setActionType] = useState(null); // 'REJECTED' or 'PENDING'
  const [reason, setReason] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const documentsRef = useRef(null);

  useEffect(() => {
    if (item?.focusSection === 'documents' && documentsRef.current) {
      documentsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [item]);

  if (!item) return null;
  const isStore = item.category === 'STORE';
  const data = item.formData || {};

  const handleConfirmAction = (type) => {
    if ((type === 'REJECTED' || type === 'PENDING') && !actionType) {
      setActionType(type);
      return;
    }
    onAction(item, type, reason);
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

  const ReviewFile = ({ label, fileName, icon = '📄', innerRef }) => (
    <div
      ref={innerRef}
      style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid #334155', marginBottom: '12px' }}
    >
      <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px', fontWeight: '600' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#1e293b', borderRadius: '8px', border: '1px dashed #475569' }}>
        {fileName ? (
          isImageFile(fileName) ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
              <button
                type="button"
                onClick={() => setPreviewUrl(fileName)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                <img
                  src={fileName}
                  alt={`${label} 미리보기`}
                  style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #334155' }}
                />
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                <button
                  type="button"
                  onClick={() => setPreviewUrl(fileName)}
                  style={{ background: '#38bdf8', border: 'none', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', color: '#0f172a', cursor: 'pointer', textAlign: 'left' }}
                >
                  미리보기
                </button>
                <button
                  type="button"
                  onClick={() => window.open(fileName, '_blank', 'noopener,noreferrer')}
                  style={{ background: 'transparent', border: '1px solid #334155', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', color: '#e2e8f0', cursor: 'pointer', textAlign: 'left' }}
                >
                  새 탭 열기
                </button>
              </div>
            </div>
          ) : (
            <>
              <span style={{ fontSize: '20px' }}>{icon}</span>
              <button
                type="button"
                onClick={() => window.open(fileName, '_blank', 'noopener,noreferrer')}
                style={{ background: 'none', border: 'none', padding: 0, fontSize: '14px', color: '#38bdf8', fontWeight: '700', textDecoration: 'underline', cursor: 'pointer' }}
              >
                {isPdfFile(fileName) ? 'PDF 열기' : fileName}
              </button>
            </>
          )
        ) : (
          <>
            <span style={{ fontSize: '20px' }}>{icon}</span>
            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '700' }}>첨부파일 없음</span>
          </>
        )}
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
                <ReviewFile label="사업자등록증 첨부" fileName={data.businessRegistrationFile} innerRef={documentsRef} />
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
                <ReviewFile label="신분증 사본" fileName={data.identityFile} icon="🪪" innerRef={documentsRef} />
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

          {data.reason && (
            <div
              style={{
                backgroundColor: actionType === 'REJECTED' || item.rawStatus === 'REJECTED'
                  ? 'rgba(239, 68, 68, 0.12)'
                  : 'rgba(245, 158, 11, 0.12)',
                padding: '16px',
                borderRadius: '16px',
                margin: '24px 0',
                border: actionType === 'REJECTED' || item.rawStatus === 'REJECTED'
                  ? '1px solid rgba(239, 68, 68, 0.25)'
                  : '1px solid rgba(245, 158, 11, 0.25)'
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  color: actionType === 'REJECTED' || item.rawStatus === 'REJECTED'
                    ? '#ef4444'
                    : '#f59e0b',
                  fontWeight: '700',
                  marginBottom: '6px'
                }}
              >
                {actionType === 'REJECTED' || item.rawStatus === 'REJECTED' ? '거절 사유' : '보류 사유'}
              </div>
              <div style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                {data.reason}
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
      {previewUrl && (
        <div
          onClick={() => setPreviewUrl(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', zIndex: 2600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #334155', padding: '16px', maxWidth: '90vw', maxHeight: '90vh' }}
          >
            <img src={previewUrl} alt="신청서 이미지 미리보기" style={{ maxWidth: '85vw', maxHeight: '80vh', objectFit: 'contain', display: 'block' }} />
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => window.open(previewUrl, '_blank', 'noopener,noreferrer')}
                style={{ background: '#38bdf8', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', color: '#0f172a', cursor: 'pointer' }}
              >
                새 탭 열기
              </button>
              <button
                type="button"
                onClick={() => setPreviewUrl(null)}
                style={{ background: 'transparent', border: '1px solid #334155', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', color: '#e2e8f0', cursor: 'pointer' }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalDetailModal;
