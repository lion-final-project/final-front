import React, { useEffect, useState } from 'react';
import {
  deleteRiderApproval,
  getRiderApprovals,
  getRiderRegistrationStatus,
  registerRider,
} from '../../../api/riderApi';
import { uploadFile } from '../../../api/storageApi';

const SectionCard = ({ children, hasError }) => (
  <div
    style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: hasError ? '1px solid #ef4444' : 'none',
    }}
  >
    {children}
  </div>
);

const InputSection = ({ label, value, onChange, placeholder, error, required = true }) => (
  <SectionCard hasError={Boolean(error)}>
    <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
      {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '8px 0',
        border: 'none',
        borderBottom: error ? '2px solid #ef4444' : '1px solid #e5e7eb',
        fontSize: '14px',
        outline: 'none',
      }}
      onFocus={(e) => {
        e.target.style.borderBottom = error ? '2px solid #ef4444' : '2px solid var(--primary)';
      }}
      onBlur={(e) => {
        e.target.style.borderBottom = error ? '2px solid #ef4444' : '1px solid #e5e7eb';
      }}
    />
    {error && (
      <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', fontWeight: '600' }}>
        {error}
      </div>
    )}
  </SectionCard>
);

const FileSection = ({
  label,
  hint,
  onChange,
  error,
  existingDocumentUrl,
  existingDocumentLabel,
}) => (
  <SectionCard hasError={Boolean(error)}>
    <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
      {label} <span style={{ color: '#ef4444' }}>*</span>
    </label>
    {hint && <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>{hint}</p>}
    <input type="file" onChange={onChange} style={{ width: '100%', fontSize: '14px', color: '#64748b' }} />
    {error && (
      <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', fontWeight: '600' }}>
        {error}
      </div>
    )}
    {existingDocumentUrl && (
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#64748b' }}>
        <div style={{ marginBottom: '4px', fontWeight: '700' }}>
          기존 서류 재사용: {existingDocumentLabel || '기존 파일'}
        </div>
        <a href={existingDocumentUrl} target="_blank" rel="noreferrer" style={{ color: '#0ea5e9' }}>
          기존 서류 보기
        </a>
      </div>
    )}
  </SectionCard>
);

const getPayloadData = (payload) => {
  if (!payload) return null;
  if (Object.prototype.hasOwnProperty.call(payload, 'data')) return payload.data;
  return payload;
};

const RiderRegistrationView = ({ onBack, onComplete, onRefreshStatus, userInfo }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    idCardImg: null,
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    bankbookImg: null,
  });
  const [status, setStatus] = useState('NONE');
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [errors, setErrors] = useState({});
  const [heldDocumentUrls, setHeldDocumentUrls] = useState({
    idCardImage: null,
    bankbookImage: null,
  });

  useEffect(() => {
    fetchApprovals();
  }, []);

  const getStatusLabel = (value) => {
    switch (value) {
      case 'PENDING':
        return '심사 대기 중';
      case 'APPROVED':
        return '승인';
      case 'REJECTED':
        return '거절';
      case 'HELD':
        return '보류';
      default:
        return value || '-';
    }
  };

  const fetchApprovals = async () => {
    try {
      setIsLoading(true);
      const [approvalResp, statusResp] = await Promise.all([
        getRiderApprovals(),
        getRiderRegistrationStatus().catch(() => null),
      ]);

      const approvalData = getPayloadData(approvalResp) || {};
      const statusData = getPayloadData(statusResp);
      const approvalList = Array.isArray(approvalData.content) ? approvalData.content : [];

      setApprovals(approvalList);
      setRegistrationStatus(statusData || null);
      setStatus(approvalList.length > 0 ? 'LIST' : 'NONE');
      onRefreshStatus?.();
    } catch (error) {
      console.error('라이더 신청 이력 조회 실패:', error);
      setStatus('NONE');
      onRefreshStatus?.();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (approvalId) => {
    if (!window.confirm('신청을 취소하시겠습니까?')) return;

    try {
      setIsLoading(true);
      await deleteRiderApproval(approvalId);
      alert('신청이 취소되었습니다.');
      await fetchApprovals();
    } catch (error) {
      console.error('라이더 신청 취소 실패:', error);
      alert(error?.response?.data?.message || '신청 취소에 실패했습니다.');
      setIsLoading(false);
    }
  };

  const findHeldDocUrl = (documents, type) => {
    if (!Array.isArray(documents)) return null;
    const urls = documents
      .map((doc) => (typeof doc === 'string' ? doc : doc?.documentUrl || doc?.url || ''))
      .filter(Boolean);
    const lower = urls.map((url) => url.toLowerCase());

    if (type === 'id') {
      const idx = lower.findIndex((url) => url.includes('id_card') || url.includes('idcard'));
      return urls[idx >= 0 ? idx : 0] || null;
    }
    if (type === 'bank') {
      const idx = lower.findIndex((url) => url.includes('bank_passbook') || url.includes('bankbook'));
      return urls[idx >= 0 ? idx : 1] || null;
    }
    return null;
  };

  const handleResubmitFromHeld = (approval) => {
    const idCardImage = findHeldDocUrl(approval?.documents, 'id');
    const bankbookImage = findHeldDocUrl(approval?.documents, 'bank');

    setFormData((prev) => ({
      ...prev,
      name: approval?.name || '',
      phone: approval?.phone || '',
      bankName: approval?.bankName || '',
      accountNumber: approval?.bankAccount || '',
      accountHolder: approval?.accountHolder || '',
      idCardImg: null,
      bankbookImg: null,
    }));
    setHeldDocumentUrls({ idCardImage, bankbookImage });
    setErrors({});
    setStatus('NONE');
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.name) newErrors.name = '이름을 입력해주세요.';
    if (!formData.phone) newErrors.phone = '연락처를 입력해주세요.';
    if (!formData.bankName) newErrors.bankName = '은행명을 입력해주세요.';
    if (!formData.accountNumber) newErrors.accountNumber = '계좌번호를 입력해주세요.';
    if (!formData.accountHolder) newErrors.accountHolder = '예금주를 입력해주세요.';

    const hasHeldIdCard = Boolean(heldDocumentUrls.idCardImage);
    const hasHeldBankbook = Boolean(heldDocumentUrls.bankbookImage);
    if (!formData.idCardImg && !hasHeldIdCard) newErrors.idCardImg = '신분증 사본을 첨부해주세요.';
    if (!formData.bankbookImg && !hasHeldBankbook) newErrors.bankbookImg = '통장 사본을 첨부해주세요.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      const userId = userInfo?.userId || 1;

      const [idCardUrl, bankbookUrl] = await Promise.all([
        formData.idCardImg
          ? uploadFile(formData.idCardImg, userId, 'rider', 'id_card')
          : Promise.resolve(heldDocumentUrls.idCardImage),
        formData.bankbookImg
          ? uploadFile(formData.bankbookImg, userId, 'rider', 'bank_passbook')
          : Promise.resolve(heldDocumentUrls.bankbookImage),
      ]);

      const registerData = {
        name: formData.name,
        phone: formData.phone,
        'bank-name': formData.bankName,
        'bank-account': formData.accountNumber,
        'account-holder': formData.accountHolder,
        'id-card-image': idCardUrl,
        'bankbook-image': bankbookUrl,
      };

      const result = await registerRider(registerData);
      setResponseData(getPayloadData(result));
      setHeldDocumentUrls({ idCardImage: null, bankbookImage: null });
      setStatus('PENDING');
      onRefreshStatus?.();
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('라이더 신청 실패:', error);
      alert(error?.response?.data?.message || error?.message || '신청 처리에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'LIST') {
    const hasApprovedHistory = approvals.some((approval) => approval.status === 'APPROVED');
    const isRejected = registrationStatus?.status === 'REJECTED';
    const isHeld = registrationStatus?.status === 'HELD';

    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>라이더 등록 신청</h2>

        {hasApprovedHistory && (
          <div
            style={{
              marginBottom: '16px',
              padding: '14px 16px',
              borderRadius: '12px',
              backgroundColor: '#ecfeff',
              border: '1px solid #67e8f9',
              color: '#155e75',
              fontSize: '14px',
              fontWeight: '700',
            }}
          >
            라이더 등록이 승인 완료되었습니다. 다시 신청할 수 없습니다.
          </div>
        )}

        {isRejected && (
          <div
            style={{
              marginBottom: '16px',
              padding: '14px 16px',
              borderRadius: '12px',
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              color: '#9f1239',
              fontSize: '14px',
              fontWeight: '700',
            }}
          >
            거절된 신청은 다시 제출할 수 없습니다.
            {registrationStatus?.reason ? ` (사유: ${registrationStatus.reason})` : ''}
          </div>
        )}

        {isHeld && registrationStatus?.reason && (
          <div
            style={{
              marginBottom: '16px',
              padding: '14px 16px',
              borderRadius: '12px',
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              color: '#92400e',
              fontSize: '14px',
              fontWeight: '700',
            }}
          >
            보류 사유: {registrationStatus.reason}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {approvals.map((approval) => (
            <div
              key={approval.approvalId}
              style={{
                background: 'white',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px',
                }}
              >
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>라이더 등록 신청</div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>{getStatusLabel(approval.status)}</div>
                </div>

                {approval.status === 'PENDING' && (
                  <button
                    onClick={() => handleDelete(approval.approvalId)}
                    style={{
                      padding: '8px 12px',
                      fontSize: '13px',
                      borderRadius: '8px',
                      border: '1px solid #ef4444',
                      color: '#ef4444',
                      background: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    신청 취소
                  </button>
                )}

                {approval.status === 'HELD' && (
                  <button
                    onClick={() => handleResubmitFromHeld(approval)}
                    style={{
                      padding: '8px 12px',
                      fontSize: '13px',
                      borderRadius: '8px',
                      border: '1px solid #f59e0b',
                      color: '#92400e',
                      background: '#fffbeb',
                      cursor: 'pointer',
                      fontWeight: '700',
                    }}
                  >
                    보완 후 재신청
                  </button>
                )}
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  padding: '16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#475569',
                }}
              >
                <div style={{ marginBottom: '4px' }}>
                  <strong>이름:</strong> {approval.name}
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong>연락처:</strong> {approval.phone}
                </div>
                <div>
                  <strong>계좌:</strong> {approval.bankName} {approval.bankAccount} (예금주 {approval.accountHolder})
                </div>
              </div>
            </div>
          ))}
        </div>

        {!hasApprovedHistory && !isRejected && (
          <button
            onClick={() => setStatus('NONE')}
            className="btn-primary"
            style={{ width: '100%', marginTop: '32px', padding: '16px', backgroundColor: '#38bdf8' }}
          >
            다시 신청하기
          </button>
        )}

        <button
          onClick={onBack}
          style={{
            marginTop: '16px',
            background: 'none',
            border: 'none',
            color: '#64748b',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'block',
            width: '100%',
          }}
        >
          파트너 모집으로 돌아가기
        </button>
      </div>
    );
  }

  if (status === 'PENDING' || status === 'APPROVED') {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '60px 20px' }}>
        <div
          style={{
            background: 'white',
            padding: '40px',
            borderRadius: '24px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>
            {status === 'APPROVED' ? '승인 완료' : '심사 진행 중'}
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>
            {status === 'APPROVED' ? '승인' : '심사 대기 중'}
          </h2>
          <p style={{ color: '#64748b', marginBottom: '32px', lineHeight: '1.6' }}>
            {status === 'APPROVED'
              ? '라이더 등록 승인 완료되었습니다. 바로 배달 업무를 시작할 수 있습니다.'
              : '등록 신청이 접수되었습니다. 심사 결과는 알림으로 안내됩니다.'}
          </p>

          {status === 'APPROVED' ? (
            <button onClick={() => onComplete(formData)} className="btn-primary" style={{ padding: '16px 32px', fontSize: '16px' }}>
              확인
            </button>
          ) : (
            <div
              style={{
                padding: '20px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                fontSize: '14px',
                color: '#475569',
              }}
            >
              <div style={{ fontWeight: '700', marginBottom: '8px' }}>신청 정보</div>
              <div>{responseData?.name || formData.name}</div>
              <div style={{ marginTop: '4px', fontSize: '12px', color: '#94a3b8' }}>
                계좌 정보: {responseData?.bankName || formData.bankName} {responseData?.bankAccount || formData.accountNumber}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '40px 20px' }}>
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          borderTop: '10px solid var(--primary)',
          marginBottom: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '8px' }}>라이더 등록 신청</h2>
        <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
          동네마켓 파트너 라이더로 활동하실 분을 모집합니다. 아래 정보를 정확하게 입력해주세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <InputSection
          label="이름"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
          }}
          placeholder="이름을 입력해주세요"
          error={errors.name}
        />

        <InputSection
          label="연락처"
          value={formData.phone}
          onChange={(e) => {
            setFormData({ ...formData, phone: e.target.value });
            if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
          }}
          placeholder="연락처를 입력해주세요"
          error={errors.phone}
        />

        <FileSection
          label="신분증 사본"
          hint="본인 확인을 위해 신분증 사본을 첨부해주세요."
          onChange={(e) => {
            setFormData({ ...formData, idCardImg: e.target.files?.[0] || null });
            if (errors.idCardImg) setErrors((prev) => ({ ...prev, idCardImg: null }));
          }}
          error={errors.idCardImg}
          existingDocumentUrl={!formData.idCardImg ? heldDocumentUrls.idCardImage : null}
          existingDocumentLabel="신분증 사본"
        />

        <InputSection
          label="은행명"
          value={formData.bankName}
          onChange={(e) => {
            setFormData({ ...formData, bankName: e.target.value });
            if (errors.bankName) setErrors((prev) => ({ ...prev, bankName: null }));
          }}
          placeholder="은행명을 입력해주세요"
          error={errors.bankName}
        />

        <InputSection
          label="계좌번호"
          value={formData.accountNumber}
          onChange={(e) => {
            setFormData({ ...formData, accountNumber: e.target.value });
            if (errors.accountNumber) setErrors((prev) => ({ ...prev, accountNumber: null }));
          }}
          placeholder="계좌번호를 입력해주세요"
          error={errors.accountNumber}
        />

        <InputSection
          label="예금주"
          value={formData.accountHolder}
          onChange={(e) => {
            setFormData({ ...formData, accountHolder: e.target.value });
            if (errors.accountHolder) setErrors((prev) => ({ ...prev, accountHolder: null }));
          }}
          placeholder="예금주를 입력해주세요"
          error={errors.accountHolder}
        />

        <FileSection
          label="통장 사본"
          hint="정산 계좌 확인을 위해 통장 사본을 첨부해주세요."
          onChange={(e) => {
            setFormData({ ...formData, bankbookImg: e.target.files?.[0] || null });
            if (errors.bankbookImg) setErrors((prev) => ({ ...prev, bankbookImg: null }));
          }}
          error={errors.bankbookImg}
          existingDocumentUrl={!formData.bankbookImg ? heldDocumentUrls.bankbookImage : null}
          existingDocumentLabel="통장 사본"
        />

        <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '8px' }}>
          {isLoading ? '신청 중...' : '신청하기'}
        </button>

        <button
          type="button"
          onClick={onBack}
          style={{ marginTop: '8px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
        >
          취소
        </button>
      </form>
    </div>
  );
};

export default RiderRegistrationView;
