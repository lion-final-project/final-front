import React, { useState } from 'react';

const RiderRegistrationView = ({ onBack, onComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    idCardImg: null,
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    bankbookImg: null,
    address: ''
  });

  const [status, setStatus] = useState('NONE'); // NONE, PENDING, APPROVED

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address || !formData.idCardImg || !formData.bankName || !formData.accountNumber || !formData.accountHolder || !formData.bankbookImg) {
      alert('필수 항목을 모두 입력하고 서류를 첨부해주세요.');
      return;
    }
    setStatus('PENDING');
    window.scrollTo(0, 0);
  };

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
              <div>{formData.name} 라이더님 ({formData.address})</div>
              <div style={{ marginTop: '4px', fontSize: '12px', color: '#94a3b8' }}>정산 계좌: {formData.bankName} {formData.accountNumber}</div>
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
        </div>
        <button 
          onClick={onBack}
          style={{ marginTop: '24px', background: 'none', border: 'none', color: '#64748b', fontWeight: '600', cursor: 'pointer' }}
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '40px 20px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', borderTop: '10px solid #38bdf8', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px' }}>주민 라이더 지원</h1>
          <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>
            동네마켓의 주민 배달 파트너가 되어 우리 동네 이웃들에게 행복을 배달하세요.<br/>
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
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px' }}
              />
              <input 
                type="tel"
                placeholder="연락처 (010-0000-0000)"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px' }}
              />
              <input 
                type="text"
                placeholder="상세 주소 (배달 활동 지역)"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, idCardImg: e.target.files[0]})}
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
                  onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px' }}
                />
                <input 
                  type="text"
                  placeholder="예금주"
                  value={formData.accountHolder}
                  onChange={(e) => setFormData({...formData, accountHolder: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px' }}
                />
              </div>
              <input 
                type="text"
                placeholder="계좌번호 (- 없이 입력)"
                value={formData.accountNumber}
                onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, bankbookImg: e.target.files[0]})}
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
                 setFormData({ name: '', phone: '', address: '', idCardImg: null, bankName: '', accountNumber: '', accountHolder: '', bankbookImg: null });
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
