import React, { useState } from 'react';
import { confirmPasswordReset } from '../../../api/authApi';

const PasswordResetView = ({ onResetSuccess }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // URL에서 토큰 추출
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            setError('유효하지 않은 접근입니다. 재설정 링크가 올바른지 확인해주세요.');
            return;
        }
        if (newPassword.length < 8) {
            setError('비밀번호는 8자 이상이어야 합니다.');
            return;
        }
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;
        if (!passwordRegex.test(newPassword)) {
            setError('비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await confirmPasswordReset(token, newPassword);
            alert('비밀번호가 성공적으로 변경되었습니다. 새로운 비밀번호로 로그인해주세요.');
            onResetSuccess();
        } catch (err) {
            setError(err.response?.data?.message || '비밀번호 재설정에 실패했습니다. 링크가 만료되었거나 이미 사용되었을 수 있습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '20px' }}>
                <h2 style={{ color: '#ef4444' }}>⚠️ 유효하지 않은 요청</h2>
                <p>비밀번호 재설정 링크가 올바르지 않습니다. 다시 요청해주세요.</p>
                <button
                    onClick={() => window.location.href = '/'}
                    style={{ padding: '12px 24px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                    홈으로 이동
                </button>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f8fafc'
        }}>
            <div style={{
                backgroundColor: 'white', width: '100%', maxWidth: '400px', padding: '40px', borderRadius: '28px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', color: '#1e293b' }}>비밀번호 재설정</h2>
                    <p style={{ color: '#64748b', fontSize: '15px' }}>새로운 비밀번호를 입력해주세요</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>새 비밀번호</label>
                        <input
                            type="password" placeholder="8자 이상 입력" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#475569' }}>비밀번호 확인</label>
                        <input
                            type="password" placeholder="비밀번호를 다시 입력하세요" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px' }}
                        />
                    </div>

                    {error && <p style={{ color: '#ef4444', fontSize: '13px', fontWeight: '600', textAlign: 'center' }}>{error}</p>}

                    <button type="submit" disabled={loading} style={{
                        marginTop: '10px', padding: '16px', backgroundColor: loading ? '#94a3b8' : '#10b981', color: 'white', border: 'none', borderRadius: '16px',
                        fontWeight: '800', fontSize: '16px', cursor: loading ? 'wait' : 'pointer', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)', transition: 'all 0.2s'
                    }}>
                        {loading ? '변경 중...' : '비밀번호 변경하기'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PasswordResetView;
