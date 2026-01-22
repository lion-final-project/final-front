import React, { useState } from 'react';

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate authentication
    onLoginSuccess();
    onClose();
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{
        backgroundColor: 'var(--bg-card, white)',
        width: '90%',
        maxWidth: '400px',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        animation: 'slideUp 0.3s ease-out'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'none',
          border: 'none',
          fontSize: '20px',
          cursor: 'pointer',
          color: 'var(--text-muted, #64748b)'
        }}>✕</button>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main, #1e293b)' }}>
            {mode === 'login' ? '다시 만나서 반가워요!' : '동네마켓과 함께해요'}
          </h2>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '15px' }}>
            {mode === 'login' ? '로그인하고 우리 동네 소식을 확인하세요' : '간편하게 가입하고 신선한 쇼핑을 즐기세요'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>이름</label>
              <input 
                type="text" 
                placeholder="홍길동" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border, #e2e8f0)', fontSize: '15px' }} 
              />
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>이메일</label>
            <input 
              type="email" 
              placeholder="example@email.com" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border, #e2e8f0)', fontSize: '15px' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>비밀번호</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border, #e2e8f0)', fontSize: '15px' }} 
            />
          </div>

          <button type="submit" style={{
            marginTop: '10px',
            padding: '14px',
            backgroundColor: 'var(--primary, #2ecc71)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px 0 rgba(46, 204, 113, 0.3)'
          }}>
            {mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
          <span style={{ color: 'var(--text-muted, #64748b)' }}>
            {mode === 'login' ? '아직 회원이 아니신가요?' : '이미 계정이 있으신가요?'}
          </span>
          <button 
            onClick={toggleMode}
            style={{ 
              marginLeft: '8px', 
              background: 'none', 
              border: 'none', 
              color: 'var(--primary, #2ecc71)', 
              fontWeight: '700', 
              cursor: 'pointer',
              padding: 0
            }}>
            {mode === 'login' ? '회원가입' : '로그인'}
          </button>
        </div>

        <div style={{ marginTop: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border, #e2e8f0)' }}></div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)' }}>또는 간편 로그인</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border, #e2e8f0)' }}></div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>💬</span> 카카오
            </button>
            <button style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🟢</span> 네이버
            </button>
          </div>
        </div>
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
