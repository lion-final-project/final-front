import React, { useState, useEffect } from 'react';
import {
  authApi,
  login,
  signup,
  checkEmail,
  checkPhone,
  sendVerification,
  verifyPhone,
  socialSignupComplete,
  requestPasswordReset
} from '../../../api/authApi';

import { API_BASE_URL } from '../../../config/api';

// 소셜 로그인 인증 URL (백엔드 OAuth2 authorization endpoint)
const KAKAO_OAUTH_AUTHORIZE_URL = import.meta.env.VITE_KAKAO_OAUTH_AUTHORIZE_URL || `${API_BASE_URL}/oauth2/authorization/kakao`;
const NAVER_OAUTH_AUTHORIZE_URL = import.meta.env.VITE_NAVER_OAUTH_AUTHORIZE_URL || `${API_BASE_URL}/oauth2/authorization/naver`;

const AuthModal = ({ isOpen, onClose, onLoginSuccess, initialMode, socialSignupState }) => {
  /** onLoginSuccess(userData): userData = { userId, email, name, roles } (로그인/회원가입 성공 시 백엔드 data) */
  /** socialSignupState: 소셜 추가 가입 완료 시 백엔드에 보낼 state JWT (세션 대신 사용) */
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'social-extra' | 'forgot-password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [apiLoading, setApiLoading] = useState(false);

  // Validation States for Signup
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isPhoneSent, setIsPhoneSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [phoneVerificationToken, setPhoneVerificationToken] = useState('');

  // Agreements State
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
      // Reset states
      setEmail('');
      setPassword('');
      setName('');
      setPhone('');
      setIsEmailChecked(false);
      setIsPhoneSent(false);
      setIsPhoneVerified(false);
      setVerifyCode('');
      setPhoneVerificationToken('');
      setAgreements({ all: false, service: false, privacy: false, marketing: false });
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

  const getErrorMessage = (error, fallback) => {
    const data = error.response?.data;
    if (data?.error?.details?.length) {
      return data.error.details[0].message || data.error?.message || fallback;
    }
    return data?.error?.message || data?.message || fallback;
  };

  const handleCheckEmail = async () => {
    const emailWithDomain = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailWithDomain.test(email)) {
      alert('이메일은 정확하게 입력해주세요.');
      return;
    }
    setApiLoading(true);
    try {
      const res = await checkEmail(email);
      if (res.duplicated) {
        alert('이미 사용 중인 이메일입니다.');
        return;
      }
      setIsEmailChecked(true);
      alert('사용 가능한 이메일입니다.');
    } catch (err) {
      alert(getErrorMessage(err, '이메일 확인에 실패했습니다.'));
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
    try {
      // 1. 휴대폰 중복 체크
      const checkRes = await checkPhone(phone);
      if (checkRes.duplicated) {
        alert('이미 가입된 휴대폰 번호입니다.');
        return;
      }

      // 2. 인증번호 발송
      const res = await sendVerification(phone);

      setIsPhoneSent(true);
      setTimeLeft(res.expiresIn || 180);
      setResendCount((prev) => prev + 1);
      alert(res.message || '인증번호가 발송되었습니다.');
    } catch (err) {
      alert(getErrorMessage(err, '인증번호 발송에 실패했습니다.'));
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
      const res = await verifyPhone(phone, verifyCode.trim());

      if (res.verified) {
        setPhoneVerificationToken(res.phoneVerificationToken);
        setIsPhoneVerified(true);
        alert('휴대폰 인증이 완료되었습니다.');
      } else {
        alert('인증에 실패했습니다.');
      }
    } catch (err) {
      alert(getErrorMessage(err, '인증 확인에 실패했습니다.'));
    } finally {
      setApiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. 회원가입
    if (mode === 'signup') {
      if (!isEmailChecked) return alert('이메일 중복 확인이 필요합니다.');
      if (!isPhoneVerified) return alert('휴대폰 인증이 필요합니다.');
      // 주소 검증은 필수 아님 (미수집)
      if (!agreements.service || !agreements.privacy) return alert('필수 약관에 동의해주세요.');
      if (!password || password.length < 8) return alert('비밀번호는 8자 이상이어야 합니다.');
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;
      if (!passwordRegex.test(password)) {
        return alert('비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.');
      }

      setApiLoading(true);
      try {
        const signupData = {
          email,
          password,
          phone,
          name,
          phoneVerificationToken,
          marketingAgreed: agreements.marketing,
          termsAgreed: agreements.service,
          privacyAgreed: agreements.privacy,
          // 주소 필드가 API 스펙에 있다면 추가
        };

        const res = await signup(signupData);
        alert('회원가입이 완료되었습니다! 반갑습니다.');

        // 자동 로그인
        const user = await login(email, password);
        onLoginSuccess(user);
        onClose();
      } catch (err) {
        const msg = getErrorMessage(err, '입력 정보를 확인해주세요.');
        alert(msg);
      } finally {
        setApiLoading(false);
      }
      return;
    }

    // 2. 소셜 가입 추가 정보 (카카오/네이버) — state JWT 필수
    if (mode === 'social-extra') {
      if (!socialSignupState) return alert('소셜 가입 정보가 만료되었습니다. 다시 로그인해 주세요.');
      if (!name || !phone) return alert('이름과 휴대폰 번호를 모두 입력해주세요.');
      if (!isPhoneVerified) return alert('휴대폰 인증이 필요합니다.');
      if (!email?.trim()) return alert('이메일을 입력해주세요.');
      if (!isEmailChecked) return alert('이메일 중복 확인이 필요합니다.');
      if (!agreements.service || !agreements.privacy) return alert('필수 약관에 동의해주세요.');

      setApiLoading(true);
      try {
        const data = {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          termsAgreed: agreements.service,
          privacyAgreed: agreements.privacy,
          marketingAgreed: agreements.marketing,
          state: socialSignupState,
        };
        const res = await socialSignupComplete(data);
        // 응답이 { data: user } 래핑이거나 user 직접인 경우 모두 처리
        const user = res?.data !== undefined ? res.data : res;
        onClose();
        if (user && Array.isArray(user.roles)) {
          onLoginSuccess(user);
        }
      } catch (err) {
        alert(getErrorMessage(err, '회원가입 처리에 실패했습니다.'));
      } finally {
        setApiLoading(false);
      }
      return;
    }

    // 3. 로그인
    if (mode === 'login') {
      if (!email || !password) return alert('이메일과 비밀번호를 입력해주세요.');
      setApiLoading(true);
      try {
        const user = await login(email, password);
        onLoginSuccess(user);
        onClose();
      } catch (err) {
        const msg = getErrorMessage(err, '로그인에 실패했습니다.');
        // 에러 코드별 메시지 처리 가능
        alert(msg);
      } finally {
        setApiLoading(false);
      }
      return;
    }

    // 4. 비밀번호 찾기
    if (mode === 'forgot-password') {
      if (!email) return alert('이메일을 입력해주세요.');
      setApiLoading(true);
      try {
        await requestPasswordReset(email);
        alert('비밀번호 재설정 안내 메일을 발송했습니다. 이메일을 확인해주세요.');
        setMode('login');
      } catch (err) {
        alert(getErrorMessage(err, '메일 발송에 실패했습니다.'));
      } finally {
        setApiLoading(false);
      }
      return;
    }
  };

  const handleSocialLogin = (platform) => {
    const url = platform === '카카오' ? KAKAO_OAUTH_AUTHORIZE_URL : platform === '네이버' ? NAVER_OAUTH_AUTHORIZE_URL : null;
    if (url) {
      // 팝업으로 열어서 메인 창(5173)은 그대로 두고, 로그인 완료 후 팝업만 닫고 부모에서 상태 반영
      const w = window.open(url, 'oauth2_social', 'width=500,height=600,scrollbars=yes,resizable=yes');
      if (!w) alert('팝업이 차단되었습니다. 브라우저에서 팝업을 허용해 주세요.');
      return;
    }
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
    <div className="modal-overlay" style={{
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
            {mode === 'login' ? '다시 만나서 반가워요!' : mode === 'forgot-password' ? '비밀번호 찾기' : '새로운 시작, 동네마켓'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '15px' }}>
            {mode === 'login' ? '로그인하고 우리 동네 소식을 확인하세요' : mode === 'forgot-password' ? '가입하신 이메일 주소를 입력해주세요' : '단 1분만에 가입하고 신선함을 배달받으세요'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 일반 회원가입과 소셜 회원가입: 동일한 양식·규약. 비밀번호는 일반 가입 시에만 표시(소셜은 미표시) */}
          {(mode === 'signup' || mode === 'social-extra') && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>이름</label>
                <input
                  type="text" placeholder="성함을 입력하세요" required value={name} onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px' }}
                />
              </div>

              {/* 비밀번호: 일반 회원가입에만 표시. 소셜(social-extra) 회원가입창에는 없음 */}
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
                        type="text" placeholder="인증번호 6자리" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>비밀번호</label>
                  <button type="button" onClick={() => setMode('forgot-password')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer', padding: 0 }}>비밀번호를 잊으셨나요?</button>
                </div>
                <input
                  type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px' }}
                />
              </div>
            </>
          )}

          {mode === 'forgot-password' && (
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>이메일</label>
              <input
                type="email" placeholder="가입하신 이메일을 입력하세요" required value={email} onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px' }}
              />
            </div>
          )}

          <button type="submit" disabled={apiLoading} style={{
            marginTop: '10px', padding: '16px', backgroundColor: apiLoading ? '#94a3b8' : '#10b981', color: 'white', border: 'none', borderRadius: '16px',
            fontWeight: '800', fontSize: '16px', cursor: apiLoading ? 'wait' : 'pointer', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)', transition: 'all 0.2s'
          }}>
            {apiLoading ? '처리 중...' : mode === 'login' ? '로그인하기' : mode === 'forgot-password' ? '재설정 메일 보내기' : '동네마켓 가입 완료'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
          <span style={{ color: '#64748b' }}>
            {mode === 'login' ? '아직 회원이 아니신가요?' : mode === 'forgot-password' ? '이미 계정이 기억나셨나요?' : '이미 계정이 있으신가요?'}
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
              {/* 카카오 버튼: onClick에서 URL 이동 처리 */}
              <button
                type="button"
                onClick={() => handleSocialLogin('카카오')}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600', fontSize: '13px', color: '#1e293b' }}
              >
                <span style={{ fontSize: '18px' }}>💬</span> 카카오
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('네이버')}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600', fontSize: '13px', color: '#1e293b' }}
              >
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
