import React, { useState, useEffect } from 'react';
import { authApi, KAKAO_OAUTH_AUTHORIZE_URL } from '../config/api';

const AuthModal = ({ isOpen, onClose, onLoginSuccess, initialMode }) => {
  /** onLoginSuccess(userData): userData = { userId, email, name, roles } (로그인/회원가입 성공 시 백엔드 data) */
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'social-extra'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  
  // Validation States for Signup
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isPhoneSent, setIsPhoneSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [phoneVerificationToken, setPhoneVerificationToken] = useState('');
  
  // Terms and Agreements State
  const [agreements, setAgreements] = useState({
    all: false,
    service: false,
    privacy: false,
    marketing: false
  });

  const [timeLeft, setTimeLeft] = useState(0);
  const [resendCount, setResendCount] = useState(0);

  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPhoneSent && !isPhoneVerified) {
      setIsPhoneSent(false);
      alert('인증 시간이 만료되었습니다. 다시 시도해주세요.');
    }
    return () => clearInterval(timer);
  }, [timeLeft, isPhoneSent, isPhoneVerified]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!isOpen) {
      setMode('login');
      setIsEmailChecked(false);
      setIsPhoneSent(false);
      setIsPhoneVerified(false);
      setVerifyCode('');
      setPhoneVerificationToken('');
    } else if (initialMode) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

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

  const getErrorMessage = (json, fallback) => {
    if (!json) return fallback;
    return json.error?.message ?? json.message ?? fallback;
  };

  const handleCheckEmail = async () => {
    const emailWithDomain = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailWithDomain.test(email)) {
      alert('이메일은 정확하게 입력해주세요.');
      return;
    }
    setApiLoading(true);
    setApiError('');
    try {
      const res = await fetch(authApi.checkEmail(email));
      let json = null;
      try {
        json = await res.json();
      } catch (_) {
        alert('응답 형식을 확인할 수 없습니다.');
        return;
      }
      if (!res.ok) {
        alert(getErrorMessage(json, '이메일 확인에 실패했습니다.'));
        return;
      }
      const duplicated = json.data?.duplicated ?? false;
      if (duplicated) {
        alert('이미 사용 중인 이메일입니다.');
        return;
      }
      setIsEmailChecked(true);
      alert('사용 가능한 이메일입니다.');
    } catch (err) {
      const isNetworkError = err?.name === 'TypeError' && (err?.message === 'Failed to fetch' || err?.message?.includes('fetch'));
      alert(isNetworkError
        ? '서버에 연결할 수 없습니다. 백엔드(localhost:8080)가 실행 중인지 확인해 주세요.'
        : '오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setApiLoading(false);
    }
  };

  const handleSendVerifyCode = async () => {
    if (phone.length < 10) {
      alert('올바른 휴대폰 번호를 입력해주세요.');
      return;
    }
    setApiLoading(true);
    setApiError('');
    try {
      const checkRes = await fetch(authApi.checkPhone(phone));
      let checkJson = null;
      try {
        checkJson = await checkRes.json();
      } catch (_) {
        alert('응답 형식을 확인할 수 없습니다.');
        return;
      }
      if (!checkRes.ok) {
        alert(getErrorMessage(checkJson, '휴대폰 확인에 실패했습니다.'));
        return;
      }
      if (checkJson.data?.duplicated) {
        alert('이미 가입된 휴대폰 번호입니다.');
        return;
      }
      const res = await fetch(authApi.sendVerification(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      let json = null;
      try {
        json = await res.json();
      } catch (_) {
        alert('응답 형식을 확인할 수 없습니다.');
        return;
      }
      if (!res.ok) {
        alert(getErrorMessage(json, '인증번호 발송에 실패했습니다.'));
        return;
      }
      const d = json.data;
      setIsPhoneSent(true);
      setTimeLeft(d?.expiresIn ?? 180);
      setResendCount((prev) => prev + 1);
      alert(`${d?.message ?? '인증번호가 발송되었습니다.'}\n유효시간 ${Math.floor((d?.expiresIn ?? 180) / 60)}분, 잔여 재발송 ${d?.remainingAttempts ?? 4}회`);
    } catch (err) {
      const isNetworkError = err?.name === 'TypeError' && (err?.message === 'Failed to fetch' || err?.message?.includes('fetch'));
      alert(isNetworkError
        ? '서버에 연결할 수 없습니다. 백엔드(localhost:8080)가 실행 중인지 확인해 주세요.'
        : '오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setApiLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verifyCode.trim()) {
      alert('인증번호를 입력해주세요.');
      return;
    }
    setApiLoading(true);
    try {
      const res = await fetch(authApi.verifyPhone(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, verificationCode: verifyCode.trim() }),
      });
      let json = null;
      try {
        json = await res.json();
      } catch (_) {
        alert('응답 형식을 확인할 수 없습니다.');
        return;
      }
      if (!res.ok) {
        alert(getErrorMessage(json, '인증에 실패했습니다.'));
        return;
      }
      const token = json.data?.phoneVerificationToken;
      if (token) {
        setPhoneVerificationToken(token);
        setIsPhoneVerified(true);
        alert('휴대폰 인증이 완료되었습니다.');
      } else {
        alert('인증 결과를 받지 못했습니다.');
      }
    } catch (err) {
      const isNetworkError = err?.name === 'TypeError' && (err?.message === 'Failed to fetch' || err?.message?.includes('fetch'));
      alert(isNetworkError
        ? '서버에 연결할 수 없습니다. 백엔드(localhost:8080)가 실행 중인지 확인해 주세요.'
        : '오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setApiLoading(false);
    }
  };

  const handleSearchAddress = () => {
    // 데모: 주소 검색 시 기본값 (실제 연동 시 Daum 우편번호 API 등 사용)
    setAddress('서울특별시 강남구 테헤란로 123');
    alert('주소 검색은 데모 모드입니다. 상세 주소를 입력해주세요.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'signup') {
      if (!isEmailChecked) return alert('이메일 중복 확인이 필요합니다.');
      if (!isPhoneVerified) return alert('휴대폰 인증이 필요합니다.');
      if (!address || !addressDetail) return alert('주소를 입력해주세요.');
      if (!agreements.service || !agreements.privacy) return alert('필수 약관에 동의해주세요.');
      if (!password || password.length < 8) return alert('비밀번호는 8자 이상, 영문/숫자/특수문자를 포함해주세요.');
      setApiLoading(true);
      setApiError('');
      try {
        const res = await fetch(authApi.register(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email,
            password,
            phone,
            name,
            phoneVerificationToken,
            marketingAgreed: agreements.marketing,
            termsAgreed: agreements.service,
            privacyAgreed: agreements.privacy,
          }),
        });
        let json = null;
        try {
          json = await res.json();
        } catch (_) {
          alert('응답 형식을 확인할 수 없습니다.');
          return;
        }
        if (!res.ok) {
          alert(getErrorMessage(json, '회원가입에 실패했습니다.'));
          return;
        }
        alert('회원가입이 완료되었습니다! 반갑습니다.');
        onLoginSuccess(json.data || {});
        onClose();
      } catch (err) {
        const isNetworkError = err?.name === 'TypeError' && (err?.message === 'Failed to fetch' || err?.message?.includes('fetch'));
        alert(isNetworkError
          ? '서버에 연결할 수 없습니다. 백엔드(localhost:8080)가 실행 중인지 확인해 주세요.'
          : '오류가 발생했습니다. 다시 시도해 주세요.');
      } finally {
        setApiLoading(false);
      }
      return;
    }
    if (mode === 'social-extra') {
      if (!name || !phone) return alert('이름과 휴대폰 번호를 모두 입력해주세요.');
      if (!isPhoneVerified) return alert('휴대폰 인증이 필요합니다.');
      if (!email?.trim()) return alert('이메일을 입력해주세요.');
      if (!address?.trim() || !addressDetail?.trim()) return alert('주소를 입력해주세요.');
      if (!agreements.service || !agreements.privacy) return alert('필수 약관에 동의해주세요.');
      setApiLoading(true);
      setApiError('');
      try {
        const res = await fetch(authApi.socialSignupComplete(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            termsAgreed: agreements.service,
            privacyAgreed: agreements.privacy,
            addressLine1: address.trim(),
            addressLine2: addressDetail.trim() || '',
          }),
        });
        let json = null;
        try {
          json = await res.json();
        } catch (_) {
          alert('응답 형식을 확인할 수 없습니다.');
          return;
        }
        if (!res.ok) {
          alert(getErrorMessage(json, '회원가입 처리에 실패했습니다.'));
          return;
        }
        const data = json?.data;
        if (data) onLoginSuccess({ userId: data.userId, email: data.email, name: data.name, roles: data.roles ?? [] });
        else onLoginSuccess({});
        onClose();
      } catch (err) {
        const isNetworkError = err?.name === 'TypeError' && (err?.message === 'Failed to fetch' || err?.message?.includes('fetch'));
        alert(isNetworkError
          ? '서버에 연결할 수 없습니다. 백엔드(localhost:8080)가 실행 중인지 확인해 주세요.'
          : '오류가 발생했습니다. 다시 시도해 주세요.');
      } finally {
        setApiLoading(false);
      }
      return;
    }
    // 로그인: 백엔드 POST /api/auth/login 연동 (인증 API .md 기준)
    if (mode === 'login') {
      if (!email || !password) return alert('이메일과 비밀번호를 입력해주세요.');
      setApiLoading(true);
      setApiError('');
      try {
        const res = await fetch(authApi.login(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });
        let json = null;
        try {
          json = await res.json();
        } catch (_) {
          alert('응답 형식을 확인할 수 없습니다.');
          return;
        }
        if (!res.ok) {
          const msg = getErrorMessage(json, '로그인에 실패했습니다.');
          const code = json?.error?.code;
          if (res.status === 404) alert('존재하지 않는 이메일입니다.');
          else if (res.status === 401) alert('비밀번호가 일치하지 않습니다.');
          else if (res.status === 403) alert('정지되었거나 비활성화된 계정입니다.');
          else alert(msg);
          return;
        }
        onLoginSuccess(json.data || {});
        onClose();
      } catch (err) {
        const isNetworkError = err?.name === 'TypeError' && (err?.message === 'Failed to fetch' || err?.message?.includes('fetch'));
        alert(isNetworkError
          ? '서버에 연결할 수 없습니다. 백엔드(localhost:8080)가 실행 중인지 확인해 주세요.'
          : '오류가 발생했습니다. 다시 시도해 주세요.');
      } finally {
        setApiLoading(false);
      }
      return;
    }
    onLoginSuccess({});
    onClose();
  };

  const handleSocialLogin = (platform) => {
    if (platform === '카카오') {
      // 백엔드 카카오 authorize → 카카오 로그인 페이지로 리다이렉트 → 콜백 후 세션 생성 → 프론트로 리다이렉트
      window.location.href = authApi.kakaoAuthorize();
      return;
    }
    // 네이버 등 다른 소셜은 준비 중
    alert(`${platform} 로그인은 준비 중입니다.`);
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setIsEmailChecked(false);
    setIsPhoneSent(false);
    setIsPhoneVerified(false);
    setVerifyCode('');
    setPhoneVerificationToken('');
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, backdropFilter: 'blur(8px)', animation: 'fadeIn 0.3s ease-out'
    }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{
        backgroundColor: 'white', width: '90%', maxWidth: (mode === 'signup' || mode === 'social-extra') ? '480px' : '400px',
        borderRadius: '28px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative', animation: 'slideUp 0.3s ease-out', maxHeight: '90vh', overflowY: 'auto'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: (mode === 'signup' || mode === 'social-extra') ? '24px' : '28px', fontWeight: '800', marginBottom: '8px', color: '#1e293b' }}>
            {mode === 'login' ? '다시 만나서 반가워요!' : '새로운 시작, 동네마켓'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '15px' }}>
            {mode === 'login' ? '로그인하고 우리 동네 소식을 확인하세요' : '단 1분만에 가입하고 신선함을 배달받으세요'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 일반 회원가입과 소셜 로그인 후 추가 정보: 동일한 폼·규약 (비밀번호만 일반 가입 시에만 표시) */}
          {(mode === 'signup' || mode === 'social-extra') && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>이름</label>
                <input 
                  type="text" placeholder="성함을 입력하세요" required value={name} onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px' }} 
                />
              </div>

              {mode === 'signup' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>비밀번호</label>
                  <input 
                    type="password" placeholder="8자 이상, 영문·숫자·특수문자 포함" required value={password} onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px' }} 
                  />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>이메일 {mode === 'signup' ? '(아이디)' : ''}</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="email" placeholder="example@email.com" required value={email} onChange={(e) => { setEmail(e.target.value); setIsEmailChecked(false); }}
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: isEmailChecked ? '2px solid #10b981' : '1px solid #e2e8f0', fontSize: '15px' }} 
                  />
                  <button type="button" onClick={handleCheckEmail} disabled={isEmailChecked || apiLoading} style={{
                    padding: '0 16px', borderRadius: '12px', border: 'none', background: isEmailChecked ? '#10b981' : '#334155', color: 'white', fontWeight: '700', fontSize: '13px', cursor: 'pointer'
                  }}>
                    {isEmailChecked ? '확인됨' : '중복확인'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>휴대폰 번호</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="tel" placeholder="01012345678" required value={phone} disabled={isPhoneVerified} onChange={(e) => setPhone(e.target.value)}
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: isPhoneVerified ? '2px solid #10b981' : '1px solid #e2e8f0', fontSize: '15px' }} 
                  />
                  {!isPhoneVerified && (
                    <button type="button" onClick={handleSendVerifyCode} disabled={apiLoading} style={{
                      padding: '0 16px', borderRadius: '12px', border: 'none', background: '#334155', color: 'white', fontWeight: '700', fontSize: '13px', cursor: 'pointer'
                    }}>
                      {isPhoneSent ? '재발송' : '인증요청'}
                    </button>
                  )}
                </div>
                {isPhoneSent && !isPhoneVerified && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input 
                        type="text" placeholder="인증번호 4자리" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)}
                        style={{ width: '100%', padding: '10px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }} 
                      />
                      <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#ef4444', fontWeight: '700' }}>
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                    <button type="button" onClick={handleVerifyCode} style={{
                      padding: '0 16px', height: '38px', borderRadius: '10px', border: 'none', background: '#10b981', color: 'white', fontWeight: '700', fontSize: '13px', cursor: 'pointer'
                    }}>인증확인</button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>주소</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" placeholder="주소를 검색해주세요" readOnly value={address}
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px', backgroundColor: '#f8fafc', color: '#64748b' }} 
                  />
                  <button type="button" onClick={handleSearchAddress} style={{
                    padding: '0 16px', borderRadius: '12px', border: 'none', background: '#334155', color: 'white', fontWeight: '700', fontSize: '13px', cursor: 'pointer'
                  }}>
                    검색
                  </button>
                </div>
                <input 
                  type="text" placeholder="상세 주소를 입력해주세요" required value={addressDetail} onChange={(e) => setAddressDetail(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px' }} 
                />
              </div>

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

          <button type="submit" disabled={apiLoading} style={{
            marginTop: '10px', padding: '16px', backgroundColor: apiLoading ? '#94a3b8' : '#10b981', color: 'white', border: 'none', borderRadius: '16px',
            fontWeight: '800', fontSize: '16px', cursor: apiLoading ? 'wait' : 'pointer', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)', transition: 'all 0.2s'
          }}>
            {apiLoading ? '처리 중...' : mode === 'login' ? '로그인하기' : '동네마켓 가입 완료'}
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
              {/* 5173에서 클릭 시 반드시 8080 → 카카오 소셜 로그인창으로 이동 (모달/폼이 가로채지 않도록 onClick에서 강제 이동) */}
              <a
                href={KAKAO_OAUTH_AUTHORIZE_URL || 'http://localhost:8080/oauth2/authorization/kakao'}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = KAKAO_OAUTH_AUTHORIZE_URL || 'http://localhost:8080/oauth2/authorization/kakao';
                }}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600', fontSize: '13px', color: '#1e293b', textDecoration: 'none' }}
              >
                <span style={{ fontSize: '18px' }}>💬</span> 카카오
              </a>
              <button type="button" onClick={() => handleSocialLogin('네이버')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600', fontSize: '13px' }}>
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
