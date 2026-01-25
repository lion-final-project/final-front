import React, { useState } from 'react';

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  
  // Validation States for Signup
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isPhoneSent, setIsPhoneSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  
  // Terms and Agreements State
  const [agreements, setAgreements] = useState({
    all: false,
    service: false,
    privacy: false,
    marketing: false
  });

  if (!isOpen) return null;

  const handleAgreementChange = (key) => {
    if (key === 'all') {
      const newValue = !agreements.all;
      setAgreements({ all: newValue, service: newValue, privacy: newValue, marketing: newValue });
    } else {
      const newAgreements = { ...agreements, [key]: !agreements[key] };
      const allChecked = newAgreements.service && newAgreements.privacy && newAgreements.marketing;
      setAgreements({ ...newAgreements, all: allChecked });
    }
  };

  const handleCheckEmail = () => {
    if (!email.includes('@')) {
      alert('올바른 이메일 형식을 입력해주세요.');
      return;
    }
    // Simulate API call
    setTimeout(() => {
      setIsEmailChecked(true);
      alert('사용 가능한 이메일입니다.');
    }, 500);
  };

  const handleSendVerifyCode = () => {
    if (phone.length < 10) {
      alert('올바른 휴대폰 번호를 입력해주세요.');
      return;
    }
    setIsPhoneSent(true);
    alert('인증번호가 발송되었습니다. (테스트 번호: 1234)');
  };

  const handleVerifyCode = () => {
    if (verifyCode === '1234') {
      setIsPhoneVerified(true);
      alert('휴대폰 인증이 완료되었습니다.');
    } else {
      alert('인증번호가 일치하지 않습니다.');
    }
  };

  const handleSearchAddress = () => {
    // Simulate address search
    setAddress('서울특별시 강남구 테헤란로 123');
    alert('주 검색 기능은 현재 데모 모드입니다. 상세 주소를 입력해주세요.');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'signup') {
      if (!isEmailChecked) return alert('이메일 중복 확인이 필요합니다.');
      if (!isPhoneVerified) return alert('휴대폰 인증이 필요합니다.');
      if (!address) return alert('주소를 입력해주세요.');
      if (!agreements.service || !agreements.privacy) return alert('필수 약관에 동의해주세요.');
      alert('회원가입이 완료되었습니다! 반갑습니다.');
    }
    // Simulate authentication
    onLoginSuccess();
    onClose();
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    // Reset states
    setIsEmailChecked(false);
    setIsPhoneSent(false);
    setIsPhoneVerified(false);
    setVerifyCode('');
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, backdropFilter: 'blur(8px)', animation: 'fadeIn 0.3s ease-out'
    }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{
        backgroundColor: 'white', width: '90%', maxWidth: mode === 'signup' ? '480px' : '400px',
        borderRadius: '28px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative', animation: 'slideUp 0.3s ease-out', maxHeight: '90vh', overflowY: 'auto'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: mode === 'signup' ? '24px' : '28px', fontWeight: '800', marginBottom: '8px', color: '#1e293b' }}>
            {mode === 'login' ? '다시 만나서 반가워요!' : '새로운 시작, 동네마켓'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '15px' }}>
            {mode === 'login' ? '로그인하고 우리 동네 소식을 확인하세요' : '단 1분만에 가입하고 신선함을 배달받으세요'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {mode === 'signup' && (
            <>
              {/* Name Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>이름</label>
                <input 
                  type="text" placeholder="성함을 입력하세요" required value={name} onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px' }} 
                />
              </div>

              {/* Email with Duplicate Check */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>이메일 (아이디)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="email" placeholder="example@email.com" required value={email} onChange={(e) => { setEmail(e.target.value); setIsEmailChecked(false); }}
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: isEmailChecked ? '2px solid #10b981' : '1px solid #e2e8f0', fontSize: '15px' }} 
                  />
                  <button type="button" onClick={handleCheckEmail} disabled={isEmailChecked} style={{
                    padding: '0 16px', borderRadius: '12px', border: 'none', background: isEmailChecked ? '#10b981' : '#334155', color: 'white', fontWeight: '700', fontSize: '13px', cursor: 'pointer'
                  }}>
                    {isEmailChecked ? '확인됨' : '중복확인'}
                  </button>
                </div>
              </div>

              {/* Phone with Verification */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>휴대폰 번호</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="tel" placeholder="01012345678" required value={phone} disabled={isPhoneVerified} onChange={(e) => setPhone(e.target.value)}
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: isPhoneVerified ? '2px solid #10b981' : '1px solid #e2e8f0', fontSize: '15px' }} 
                  />
                  {!isPhoneVerified && (
                    <button type="button" onClick={handleSendVerifyCode} style={{
                      padding: '0 16px', borderRadius: '12px', border: 'none', background: '#334155', color: 'white', fontWeight: '700', fontSize: '13px', cursor: 'pointer'
                    }}>
                      {isPhoneSent ? '재발송' : '인증요청'}
                    </button>
                  )}
                </div>
                {isPhoneSent && !isPhoneVerified && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <input 
                      type="text" placeholder="인증번호 4자리" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)}
                      style={{ flex: 1, padding: '10px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }} 
                    />
                    <button type="button" onClick={handleVerifyCode} style={{
                      padding: '0 16px', borderRadius: '10px', border: 'none', background: '#10b981', color: 'white', fontWeight: '700', fontSize: '13px', cursor: 'pointer'
                    }}>인증확인</button>
                  </div>
                )}
              </div>

              {/* Address Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>배송 주소</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input 
                    type="text" placeholder="주소를 검색하세요" readOnly value={address}
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px', backgroundColor: '#f8fafc' }} 
                  />
                  <button type="button" onClick={handleSearchAddress} style={{
                    padding: '0 16px', borderRadius: '12px', border: 'none', background: '#334155', color: 'white', fontWeight: '700', fontSize: '13px', cursor: 'pointer'
                  }}>주소검색</button>
                </div>
                <input 
                  type="text" placeholder="상세 주소를 입력하세요 (동, 호수 등)" value={addressDetail} onChange={(e) => setAddressDetail(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px' }} 
                />
              </div>

              {/* Agreements Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0', marginBottom: '4px' }}>
                  <input type="checkbox" id="agree-all" checked={agreements.all} onChange={() => handleAgreementChange('all')} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#10b981' }} />
                  <label htmlFor="agree-all" style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', cursor: 'pointer' }}>전체 동의하기</label>
                </div>
                
                {[
                  { key: 'service', label: '[필수] 서비스 이용약관 동의', required: true },
                  { key: 'privacy', label: '[필수] 개인정보 수집 및 이용 동의', required: true },
                  { key: 'marketing', label: '[선택] 마케팅 정보 수신 동의', required: false }
                ].map((item) => (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input type="checkbox" id={`agree-${item.key}`} checked={agreements[item.key]} onChange={() => handleAgreementChange(item.key)} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#10b981' }} />
                      <label htmlFor={`agree-${item.key}`} style={{ fontSize: '14px', color: '#475569', cursor: 'pointer' }}>{item.label}</label>
                    </div>
                    <button type="button" onClick={() => alert(`${item.label} 상세 내용 시뮬레이션`)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '12px', textDecoration: 'underline', cursor: 'pointer' }}>자세히보기</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {mode === 'login' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>이메일</label>
                <input 
                  type="email" placeholder="example@email.com" required value={email} onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>비밀번호</label>
                <input 
                  type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px' }} 
                />
              </div>
            </>
          )}

          <button type="submit" style={{
            marginTop: '10px', padding: '16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '16px',
            fontWeight: '800', fontSize: '16px', cursor: 'pointer', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)', transition: 'all 0.2s'
          }}>
            {mode === 'login' ? '로그인하기' : '동네마켓 가입 완료'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
          <span style={{ color: '#64748b' }}>
            {mode === 'login' ? '아직 회원이 아니신가요?' : '이미 계정이 있으신가요?'}
          </span>
          <button onClick={toggleMode} style={{ marginLeft: '8px', background: 'none', border: 'none', color: '#10b981', fontWeight: '800', cursor: 'pointer', padding: 0 }}>
            {mode === 'login' ? '지금 가입하기' : '로그인으로 돌아가기'}
          </button>
        </div>

        {mode === 'login' && (
          <div style={{ marginTop: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>또는 간편 로그인</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600', fontSize: '13px' }}>
                <span style={{ fontSize: '18px' }}>💬</span> 카카오
              </button>
              <button style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600', fontSize: '13px' }}>
                <span style={{ fontSize: '18px' }}>🟢</span> 네이버
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AuthModal;
