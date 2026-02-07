import React, { useState, useEffect } from 'react';
import { registerRider, getRiderApprovals, deleteRiderApproval } from '../../../api/riderApi';
import { uploadFile } from '../../../api/storageApi';

const RiderRegistrationView = ({ onBack, onComplete, userInfo }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    idCardImg: null,
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    bankbookImg: null
  });

  const [status, setStatus] = useState('NONE'); // NONE, PENDING, APPROVED, LIST
  const [isLoading, setIsLoading] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [approvals, setApprovals] = useState([]);

  // 컴포넌트 마운트 시 신청 내역 확인
  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      setIsLoading(true);
      const response = await getRiderApprovals();
      if (response && response.data && response.data.content && response.data.content.length > 0) {
        setApprovals(response.data.content);
        setStatus('LIST');
      } else {
        setStatus('NONE');
      }
    } catch (error) {
      console.error('Failed to fetch approvals:', error);
      // 에러 시 그냥 등록 폼 보여줌
      setStatus('NONE');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (approvalId) => {
    if (!window.confirm('정말 신청을 취소하시겠습니까?')) return;

    try {
      setIsLoading(true);
      await deleteRiderApproval(approvalId);
      alert('신청이 취소되었습니다.');
      // 목록 갱신
      fetchApprovals();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('취소 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.idCardImg || !formData.bankName || !formData.accountNumber || !formData.accountHolder || !formData.bankbookImg) {
      alert('필수 항목을 모두 입력하고 서류를 첨부해주세요.');
      return;
    }

    try {
      setIsLoading(true);

      const userId = userInfo?.userId || 1; // Fallback to 1 if not logged in (though normally should be filtered)

      // 1. 파일 업로드 (병렬 처리)
      const uploadPromises = [
        uploadFile(formData.idCardImg, userId, 'rider', 'id_card'),
        uploadFile(formData.bankbookImg, userId, 'rider', 'bank_passbook')
      ];

      const [idCardUrl, bankbookUrl] = await Promise.all(uploadPromises);

      // 2. 라이더 등록 요청 (DTO 형식에 맞춤)
      const registerData = {
        name: formData.name,
        phone: formData.phone,

        "bank-name": formData.bankName,
        "bank-account": formData.accountNumber,
        "account-holder": formData.accountHolder,
        "id-card-image": idCardUrl,
        "bankbook-image": bankbookUrl
      };

      const result = await registerRider(registerData);
      // result is ApiResponse, result.data is RiderApprovalResponse
      setResponseData(result.data);

      setStatus('PENDING');
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Registration failed:', error);
      alert('신청 중 오류가 발생했습니다. 다시 시도해주세요.\n' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  // 신청 목록 보기 (LIST)
  if (status === 'LIST') {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>내 신청 현황</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {approvals.map((approval) => (
            <div key={approval.approvalId} style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>라이더 등록 신청</div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>{approval.status === 'PENDING' ? '심사 대기 중' : approval.status}</div>
                </div>
                {approval.status === 'PENDING' && (
                  <button
                    onClick={() => handleDelete(approval.approvalId)}
                    style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #ef4444', color: '#ef4444', background: 'white', cursor: 'pointer' }}
                  >
                    신청 취소
                  </button>
                )}
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', fontSize: '14px', color: '#475569' }}>
                <div style={{ marginBottom: '4px' }}><strong>이름:</strong> {approval.name}</div>
                <div style={{ marginBottom: '4px' }}><strong>연락처:</strong> {approval.phone}</div>
                <div><strong>계좌:</strong> {approval.bankName} {approval.bankAccount}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setStatus('NONE')}
          className="btn-primary"
          style={{ width: '100%', marginTop: '32px', padding: '16px', backgroundColor: '#38bdf8' }}
        >
          새로 신청하기
        </button>

        <button
          onClick={onBack}
          style={{ marginTop: '16px', background: 'none', border: 'none', color: '#64748b', fontSize: '14px', cursor: 'pointer', display: 'block', width: '100%' }}
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  if (status === 'PENDING' || status === 'APPROVED') {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>
            {status === 'APPROVED' ? '🎉' : '⏳'}
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>
            {status === 'APPROVED' ? '라이더 승인이 완료되었습니다!' : '라이더 심사가 진행 중입니다'}
          </h2>
          <p style={{ color: '#64748b', marginBottom: '32px', lineHeight: '1.6' }}>
            {status === 'APPROVED'
              ? '이제 라이더 앱으로 이동하여 배달 업무를 시작할 수 있습니다.'
              : '담당자가 신청 내용을 검토하고 있습니다.\n심사 결과는 영업일 기준 1-2일 내로 알려드립니다.'}
          </p>

          {status === 'APPROVED' ? (
            <button
              onClick={() => onComplete(formData)}
              className="btn-primary"
              style={{ padding: '16px 32px', fontSize: '16px' }}
            >
              라이더 앱으로 이동하기
            </button>
          ) : (
            <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', fontSize: '14px', color: '#475569' }}>
              <div style={{ fontWeight: '700', marginBottom: '8px' }}>신청 정보</div>
              <div>{responseData?.name || formData.name} 라이더님</div>
              <div style={{ marginTop: '4px', fontSize: '12px', color: '#94a3b8' }}>
                정산 계좌: {responseData?.bankName || formData.bankName} {responseData?.bankAccount || formData.accountNumber}
              </div>
            </div>
          )}

          {/* Demo Helper Button */}
          {status === 'PENDING' && (
            <div style={{ marginTop: '40px', borderTop: '1px dashed #cbd5e1', paddingTop: '20px' }}>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>[데모용 관리자 기능]</p>
              <button
                onClick={() => setStatus('APPROVED')}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #16a34a', color: '#16a34a', background: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                즉시 승인 처리하기
              </button>
            </div>
          )}
          <button
            onClick={() => fetchApprovals()} // 목록으로 이동
            style={{ marginTop: '24px', background: 'none', border: 'none', color: '#38bdf8', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
          >
            목록으로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '40px 20px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {isLoading && (
          <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(255,255,255,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>처리 중...</div>
          </div>
        )}
        {/* Header Section */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', borderTop: '10px solid #38bdf8', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px' }}>주민 라이더 지원</h1>
          <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>
            동네마켓의 주민 배달 파트너가 되어 우리 동네 이웃들에게 행복을 배달하세요.<br />
            제출해주신 서류를 바탕으로 신속하게 심사를 진행하겠습니다.
          </p>
          <div style={{ marginTop: '16px', fontSize: '12px', color: '#ef4444' }}>* 필수 항목</div>
        </div>

        {/* Form Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Personal Info */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              1. 기본 인적 사항 <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="text"
                placeholder="이름"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px' }}
              />
              <input
                type="tel"
                placeholder="연락처 (010-0000-0000)"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px' }}
              />


              <div style={{ marginTop: '8px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>
                  신분증 첨부 (주민등록증 또는 운전면허증) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: formData.idCardImg ? '#f0fdf4' : '#f8fafc',
                  transition: 'all 0.2s ease'
                }} onClick={() => document.getElementById('idcard-upload').click()}>
                  <input
                    id="idcard-upload"
                    type="file"
                    hidden
                    accept="image/png, image/jpeg, application/pdf"
                    onChange={(e) => setFormData({ ...formData, idCardImg: e.target.files[0] })}
                  />
                  {formData.idCardImg ? (
                    <div style={{ color: '#16a34a', fontSize: '14px', fontWeight: '700' }}>
                      <span style={{ fontSize: '20px', display: 'block', marginBottom: '4px' }}>💳</span>
                      ✓ {formData.idCardImg.name}
                    </div>
                  ) : (
                    <div style={{ color: '#94a3b8', fontSize: '14px' }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛂</div>
                      신분증 정면 사진을 업로드해주세요
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>


          {/* Settlement Account Info */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              2. 정산 계좌 정보 <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="은행명"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px' }}
                />
                <input
                  type="text"
                  placeholder="예금주"
                  value={formData.accountHolder}
                  onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px' }}
                />
              </div>
              <input
                type="text"
                placeholder="계좌번호 (- 없이 입력)"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px' }}
              />
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>
                  통장사본 첨부 <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: formData.bankbookImg ? '#f0fdf4' : '#f8fafc'
                }} onClick={() => document.getElementById('bankbook-upload').click()}>
                  <input
                    id="bankbook-upload"
                    type="file"
                    hidden
                    accept="image/png, image/jpeg, application/pdf"
                    onChange={(e) => setFormData({ ...formData, bankbookImg: e.target.files[0] })}
                  />
                  {formData.bankbookImg ? (
                    <div style={{ color: '#16a34a', fontSize: '14px', fontWeight: '700' }}>✓ {formData.bankbookImg.name}</div>
                  ) : (
                    <div style={{ color: '#94a3b8', fontSize: '14px' }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>📸</div>
                      클릭하여 통장사본 사진 업로드
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '12px 24px', fontSize: '14px', borderRadius: '4px', backgroundColor: '#38bdf8' }}
            >
              주민 라이더 가입하기
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({ name: '', phone: '', idCardImg: null, bankName: '', accountNumber: '', accountHolder: '', bankbookImg: null });
              }}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
            >
              양식 지우기
            </button>
          </div>
        </form>
        <button
          onClick={onBack}
          style={{ marginTop: '40px', background: 'none', border: 'none', color: '#64748b', fontSize: '13px', cursor: 'pointer', display: 'block', width: '100%' }}
        >
          ← 이전 페이지로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default RiderRegistrationView;
