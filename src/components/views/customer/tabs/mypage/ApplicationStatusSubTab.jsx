import React from 'react';
import { API_BASE_URL } from '../../../../../config/api';

const ApplicationStatusSubTab = ({
  storeRegistrationStatus,
  storeRegistrationStoreName,
  storeRegistrationReason,
  storeRegistrationHeldUntil,
  setStoreRegistrationStatus,
  riderRegistrationStatus,
  riderRegistrationApprovalId,
  riderRegistrationReason,
  riderRegistrationHeldUntil,
  setStoreRegistrationStoreName,
  setActiveTab,
  refreshRiderRegistration,
  isResidentRider,
  verifyStep,
  setVerifyStep,
  showToast,
}) => {
  const riderStatus = isResidentRider ? 'APPROVED' : (riderRegistrationStatus || 'NONE');
  const storeStatus = storeRegistrationStatus || 'NONE';
  const storeStatusLabel = (() => {
    if (storeStatus === 'APPROVED') return '승인 완료';
    if (storeStatus === 'PENDING') return '심사대기';
    if (storeStatus === 'HELD') return '보류';
    if (storeStatus === 'REJECTED') return '거절';
    return '미신청';
  })();
  const storeStatusStyle = (() => {
    if (storeStatus === 'APPROVED') return { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
    if (storeStatus === 'HELD') return { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
    if (storeStatus === 'PENDING') return { backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' };
    if (storeStatus === 'REJECTED') return { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
    return { backgroundColor: '#f1f5f9', color: '#94a3b8' };
  })();
  const riderStatusLabel = (() => {
    if (riderStatus === 'APPROVED') return '승인 완료';
    if (riderStatus === 'PENDING') return '미승인';
    if (riderStatus === 'HELD') return '보류';
    if (riderStatus === 'REJECTED') return '거절';
    return '미신청';
  })();
  const riderStatusStyle = (() => {
    if (riderStatus === 'APPROVED') return { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
    if (riderStatus === 'HELD') return { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
    if (riderStatus === 'PENDING') return { backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' };
    if (riderStatus === 'REJECTED') return { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
    return { backgroundColor: '#f1f5f9', color: '#94a3b8' };
  })();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>파트너 신청 현황</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ padding: '24px', borderRadius: '20px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>🏪</span>
              <div>
                <div style={{ fontWeight: '800', fontSize: '16px' }}>마트 입점 신청</div>
                <div
                  style={{
                    fontSize: storeRegistrationStoreName ? '15px' : '12px',
                    fontWeight: storeRegistrationStoreName ? '600' : '400',
                    color: storeRegistrationStoreName ? '#334155' : '#94a3b8',
                    marginTop: '2px',
                  }}
                >
                  {storeRegistrationStoreName ? `신청 상호명: ${storeRegistrationStoreName}` : 'Neighborhood Mart Partner'}
                </div>
              </div>
            </div>
            <div
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '800',
                backgroundColor: storeStatusStyle.backgroundColor,
                color: storeStatusStyle.color,
              }}
            >
              {storeStatusLabel}
            </div>
          </div>
          {storeStatus !== 'NONE' ? (
            <div>
              <div style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: storeStatus !== 'APPROVED' ? '12px' : '0' }}>
                {storeStatus === 'APPROVED'
                  ? '입점 승인이 완료되었습니다. 마트 관리 기능을 바로 이용할 수 있습니다.'
                  : storeStatus === 'HELD'
                    ? '보류 사유를 확인하고 서류/정보를 보완해 다시 신청할 수 있습니다.'
                    : storeStatus === 'REJECTED'
                      ? '거절 사유를 확인한 뒤 정보를 수정하여 다시 신청할 수 있습니다.'
                      : '신청서가 접수되어 심사 중입니다. 영업일 기준 1~3일 내 결과를 안내드립니다.'}
              </div>
              {(storeRegistrationReason || storeRegistrationHeldUntil) && (
                <div style={{ marginBottom: '12px', padding: '12px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '13px', color: '#334155' }}>
                  {storeRegistrationReason && <div><strong>사유:</strong> {storeRegistrationReason}</div>}
                  {storeRegistrationHeldUntil && <div style={{ marginTop: '4px' }}><strong>보류 만료:</strong> {new Date(storeRegistrationHeldUntil).toLocaleString('ko-KR')}</div>}
                </div>
              )}
              {storeStatus !== 'APPROVED' && (
                <button
                  onClick={async () => {
                    if (!window.confirm('마트 신청을 취소하시겠습니까?')) return;
                    try {
                      const res = await fetch(`${API_BASE_URL}/api/stores/registration`, { method: 'DELETE', credentials: 'include' });
                      const json = await res.json().catch(() => ({}));
                      if (!res.ok) throw new Error(json?.error?.message || json?.message || '마트 신청 취소에 실패했습니다.');
                      setStoreRegistrationStatus('NONE');
                      setStoreRegistrationStoreName?.(null);
                      showToast('마트 신청이 취소되었습니다.');
                    } catch (err) {
                      alert(err.message || '마트 신청 취소에 실패했습니다.');
                    }
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'white',
                    border: '1px solid #fee2e2',
                    color: '#ef4444',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  신청 취소
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>아직 신청 이력이 없습니다.</span>
              <button
                onClick={() => {
                  setActiveTab('partner');
                  window.scrollTo(0, 0);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  background: 'white',
                  border: '1.5px solid #e2e8f0',
                  color: '#475569',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                신청하러 가기
              </button>
            </div>
          )}
        </div>

        <div style={{ padding: '24px', borderRadius: '20px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>🛵</span>
              <div>
                <div style={{ fontWeight: '800', fontSize: '16px' }}>라이더 등록 신청</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Neighborhood Delivery Partner</div>
              </div>
            </div>
            <div
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '800',
                backgroundColor: riderStatusStyle.backgroundColor,
                color: riderStatusStyle.color,
              }}
            >
              {riderStatusLabel}
            </div>
          </div>
          {riderStatus !== 'NONE' ? (
            <div>
              <div style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: !isResidentRider ? '12px' : '0' }}>
                {riderStatus === 'APPROVED'
                  ? '라이더 등록 승인이 완료되었습니다. 배달원 메뉴에서 업무를 시작할 수 있습니다.'
                  : riderStatus === 'HELD'
                    ? '라이더 신청이 보류 상태입니다. 안내 내용을 확인해주세요.'
                    : riderStatus === 'REJECTED'
                      ? '라이더 신청이 거절되었습니다. 사유를 확인 후 재신청해주세요.'
                      : '라이더 신청서가 접수되었습니다. 승인 전 상태입니다.'}
              </div>
              {(riderRegistrationReason || riderRegistrationHeldUntil) && (
                <div style={{ marginBottom: '12px', padding: '12px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '13px', color: '#334155' }}>
                  {riderRegistrationReason && <div><strong>사유:</strong> {riderRegistrationReason}</div>}
                  {riderRegistrationHeldUntil && <div style={{ marginTop: '4px' }}><strong>보류 만료:</strong> {new Date(riderRegistrationHeldUntil).toLocaleString('ko-KR')}</div>}
                </div>
              )}
              {!isResidentRider && (riderStatus === 'PENDING' || riderStatus === 'HELD') && (
                <button
                  onClick={async () => {
                    if (!window.confirm('라이더 신청을 취소하시겠습니까?')) return;
                    if (!riderRegistrationApprovalId) {
                      alert('신청 ID를 찾지 못했습니다. 새로고침 후 다시 시도해주세요.');
                      return;
                    }
                    try {
                      const res = await fetch(`${API_BASE_URL}/api/riders/approvals/${riderRegistrationApprovalId}`, {
                        method: 'DELETE',
                        credentials: 'include',
                      });
                      const json = await res.json().catch(() => ({}));
                      if (!res.ok) throw new Error(json?.error?.message || json?.message || '라이더 신청 취소에 실패했습니다.');
                      setVerifyStep(0);
                      refreshRiderRegistration?.();
                      showToast('라이더 신청이 취소되었습니다.');
                    } catch (err) {
                      alert(err.message || '라이더 신청 취소에 실패했습니다.');
                    }
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'white',
                    border: '1px solid #fee2e2',
                    color: '#ef4444',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  신청 취소
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>아직 신청 이력이 없습니다.</span>
              <button
                onClick={() => {
                  setActiveTab('partner');
                  window.scrollTo(0, 0);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  background: 'white',
                  border: '1.5px solid #e2e8f0',
                  color: '#475569',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                신청하러 가기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

    <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '20px', border: '1px solid rgba(46, 204, 113, 0.2)' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '20px' }}>💡</span>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '800', color: '#166534', marginBottom: '4px' }}>신청 안내</div>
          <div style={{ fontSize: '13px', color: '#166534', opacity: 0.8, lineHeight: '1.6' }}>
            신청 중인 건은 해당 카드의 `신청 취소` 버튼으로 취소할 수 있습니다. <br />
            기타 문의는 고객센터(1588-0000)로 연락해주세요.
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default ApplicationStatusSubTab;
