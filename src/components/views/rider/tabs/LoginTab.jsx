import React from 'react';

const LoginTab = ({ onLoginSuccess }) => {
  return (
    <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: '#38bdf8' }}>동네마켓 라이더</h2>
      <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '40px' }}>우리 동네 1등 배달 파트너</div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', marginBottom: '8px', fontWeight: '700' }}>아이디 / 휴대폰 번호</label>
          <input
            type="text"
            placeholder="아이디 또는 휴대폰 번호 입력"
            style={{ width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: '#1e293b', border: '1px solid #334155', color: 'white', fontSize: '15px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', marginBottom: '8px', fontWeight: '700' }}>비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호 입력"
            style={{ width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: '#1e293b', border: '1px solid #334155', color: 'white', fontSize: '15px' }}
          />
        </div>
      </div>

      <button
        onClick={() => {
          alert('로그인되었습니다!');
          onLoginSuccess?.();
        }}
        style={{ width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', fontWeight: '900', fontSize: '16px', marginTop: '32px', cursor: 'pointer' }}
      >
        로그인하기
      </button>

      <div style={{ display: 'flex', gap: '20px', marginTop: '24px', fontSize: '13px', color: '#94a3b8' }}>
        <span style={{ cursor: 'pointer' }}>아이디 찾기</span>
        <span style={{ width: '1px', height: '12px', backgroundColor: '#475569', marginTop: '3px' }}></span>
        <span style={{ cursor: 'pointer' }}>비밀번호 찾기</span>
        <span style={{ width: '1px', height: '12px', backgroundColor: '#475569', marginTop: '3px' }}></span>
        <span style={{ cursor: 'pointer', color: '#38bdf8', fontWeight: '700' }}>회원가입</span>
      </div>
    </div>
  );
};

export default LoginTab;
