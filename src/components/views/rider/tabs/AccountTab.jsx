import React from 'react';

const AccountTab = ({
  userInfo,
  verificationStatus,
  registeredVehicles,
  activeVehicleId,
  setActiveVehicleId,
  setShowAddVehicleModal,
  handleDeleteVehicle,
}) => {
  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>계정 및 서류 관리</h2>

      <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', marginBottom: '24px', border: '1px solid #334155' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>내 정보</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#cbd5e1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8' }}>이름</span>
            <span style={{ fontWeight: '600', color: 'white' }}>{userInfo?.name || '정보 없음'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8' }}>연락처</span>
            <span style={{ fontWeight: '600', color: 'white' }}>{userInfo?.phone || '정보 없음'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8' }}>정산 계좌</span>
            <span style={{ fontWeight: '600', color: 'white' }}>
              {userInfo?.['bank-name'] || userInfo?.bankName || ''} {userInfo?.['bank-account'] || userInfo?.bankAccount || ''} ({userInfo?.['account-holder'] || userInfo?.accountHolder || '본인'})
            </span>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', marginBottom: '24px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>운전면허/신원 확인</h3>
          <span style={{
            backgroundColor: verificationStatus === 'verified' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(241, 196, 15, 0.2)',
            color: verificationStatus === 'verified' ? '#2ecc71' : '#f1c40f',
            fontSize: '12px',
            fontWeight: '800',
            padding: '4px 10px',
            borderRadius: '20px'
          }}>
            {verificationStatus === 'verified' ? '✓ 인증됨' : '심사 중'}
          </span>
        </div>
        <div style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
          님은 현재 모든 배달 서비스를 이용하실 수 있습니다.<br />
          신규 면허 등록 및 갱신은 고객센터로 문의해주세요.
        </div>
      </div>

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <button style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>로그아웃</button>
      </div>
    </div>
  );
};

export default AccountTab;
