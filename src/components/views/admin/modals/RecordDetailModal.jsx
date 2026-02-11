import React, { useState } from 'react';

const isImageFile = (url) => {
  if (!url) return false;
  if (url.startsWith('data:image/')) return true;
  const clean = url.split('?')[0].toLowerCase();
  return clean.endsWith('.png') || clean.endsWith('.jpg') || clean.endsWith('.jpeg') || clean.endsWith('.gif') || clean.endsWith('.webp');
};

const FilePreview = ({ label, url }) => (
  <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #334155', marginTop: '10px' }}>
    <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '700' }}>{label}</div>
    {url ? (
      isImageFile(url) ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={url}
            alt={label}
            style={{ width: '86px', height: '86px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #334155' }}
          />
          <button
            type="button"
            onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
            style={{ background: 'transparent', border: '1px solid #334155', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', color: '#38bdf8', cursor: 'pointer' }}
          >
            새 탭 열기
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
          style={{ background: 'none', border: 'none', padding: 0, fontSize: '13px', color: '#38bdf8', fontWeight: '700', textDecoration: 'underline', cursor: 'pointer' }}
        >
          파일 열기
        </button>
      )
    ) : (
      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>첨부파일 없음</span>
    )}
  </div>
);

const RecordDetailModal = ({ record, onClose, onToggleStatus, reports, onShowReports }) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showStopInput, setShowStopInput] = useState(false);
  const [reason, setReason] = useState('');

  if (!record) return null;
  const isStore = !!record.rep;
  const isUser = record.type === 'USER';
  const isRider = !isStore && !isUser;

  const relatedReports = reports.filter(r =>
    (r.reporter && r.reporter.name === record.name) ||
    (r.reported && r.reported.name === record.name) ||
    (r.reported && typeof r.reported.name === 'string' && r.reported.name.includes(record.name))
  );

  const isActiveStatus = record.isActive === true
    || record.status === '정상'
    || record.status === '활성'
    || record.status === '운행중'
    || record.status === '운영중';

  const statusLabel = record.status
    || (isRider ? (record.isActive ? '운행중' : '운행불가') : (record.isActive ? '운영중' : '운영중지'));

  const statusColor = isRider
    ? (statusLabel === '운행중' ? '#10b981' : '#ef4444')
    : ((statusLabel === '정상' || statusLabel === '활성' || statusLabel === '운영중') ? '#10b981' : '#ef4444');

  const handleStatusChange = () => {
    if (isActiveStatus && !showStopInput) {
      setShowStopInput(true);
      return;
    }
    onToggleStatus(record, reason);
    onClose();
    setShowStopInput(false);
    setReason('');
  };

  const toggleButtonLabel = isRider
    ? (isActiveStatus ? '운행 비활성화' : '운행중으로 전환')
    : (isActiveStatus ? (showStopInput ? '정지 완료' : '운영중지 처리') : '운영중으로 전환');

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(3px)' }}>
      <div style={{ backgroundColor: '#1e293b', width: '100%', maxWidth: '550px', borderRadius: '24px', padding: '32px', border: '1px solid #334155', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>{isStore ? '마트 상세 정보' : isUser ? '고객 상세 정보' : '배달원 상세 정보'}</h2>
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
                  <span>📄</span> 첨부 서류
                </h3>
                <FilePreview label="사업자등록증 이미지" url={record.documents?.businessRegistrationFile} />
                <FilePreview label="통신판매업 신고증 이미지" url={record.documents?.mailOrderFile} />
                <FilePreview label="통장 사본 이미지" url={record.documents?.bankbookFile} />
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
                    {record.intro || '공식 소개글이 등록되어 있지 않습니다.'}
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
                    <div>{record.bankDetails?.bank || record.bank?.split(' ')[0]}</div>
                    <div style={{ color: '#38bdf8', fontSize: '13px', marginTop: '4px' }}>{record.bankDetails?.account || record.bank?.split(' ')[1]} (예금주: {record.bankDetails?.holder || record.rep})</div>
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
                <span>{record.orders}건</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>가입일</span>
                <span>{record.join}</span>
              </div>
              <div style={{ marginTop: '12px', padding: '16px', backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>누적 신고 이력 ({relatedReports.length}건)</span>
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
                      <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '12px' }}>신고 이력이 없습니다.</div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <section style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '20px', border: '1px solid #334155', marginTop: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#38bdf8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>💳</span> 정산 계좌 정보
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

              <section style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '20px', border: '1px solid #334155', marginTop: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#38bdf8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📄</span> 첨부 서류
                </h3>
                <FilePreview label="신분증 사본" url={record.documents?.idCardFile} />
                <FilePreview label="통장 사본" url={record.documents?.bankbookFile} />
              </section>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', marginTop: '12px' }}>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>연락처</span>
                <span>{record.phone || '010-1234-5678'}</span>
              </div>
            </>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', borderTop: '1px solid #334155', paddingTop: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '14px' }}>현재 상태</span>
            <span style={{ color: statusColor, fontWeight: '800' }}>{statusLabel} {statusLabel === '정지' && '(사유: 운영 정책 위반)'}</span>
          </div>
        </div>

        {showStopInput && (
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#ef4444', fontWeight: '700', marginBottom: '8px' }}>정지/비활성 사유 입력</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="정지/비활성 사유를 입력해주세요..."
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
              background: isActiveStatus ? '#ef4444' : '#10b981',
              color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer'
            }}
          >
            {toggleButtonLabel}
          </button>
          <button style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#334155', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }} onClick={onClose}>취소/닫기</button>
        </div>
      </div>
    </div>
  );
};

export default RecordDetailModal;
