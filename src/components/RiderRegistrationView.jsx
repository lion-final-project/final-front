import React, { useState } from 'react';

const RiderRegistrationView = ({ onBack, onComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicleType: 'walking',
    vehicleModel: '',
    vehiclePlate: '',
    region: '서울시 강남구'
  });

  const [status, setStatus] = useState('NONE'); // NONE, PENDING, APPROVED

  const handleSubmit = (e) => {
    e.preventDefault();
    const needsVehicleInfo = !['walking', 'bicycle'].includes(formData.vehicleType);
    if (!formData.name || !formData.phone || (needsVehicleInfo && !formData.vehicleModel)) {
      alert('필수 항목을 모두 입력해주세요.');
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
              <div>{formData.name} 라이더님 ({formData.vehicleModel})</div>
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
            초기 가입 시에는 빠른 활동을 위해 <strong>도보</strong> 및 <strong>자전거</strong>만 선택 가능합니다.
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
            </div>
          </div>

          {/* Vehicle Type */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              2. 배달 운송 수단 <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select 
              value={formData.vehicleType}
              onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px' }}
            >
              <option value="walking">도보</option>
              <option value="bicycle">자전거</option>
            </select>
            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
               <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
                 💡 <strong>오토바이</strong> 및 <strong>승용차</strong> 배달은 라이더 승인 후, <br />
                 라이더 마이페이지 내 <strong>'전문 수단 인증'</strong> 섹션에서 면허/보험 서류 확인 후 활성화됩니다.
               </p>
            </div>
          </div>

          {/* Vehicle Details */}
          {formData.vehicleType === 'bicycle' && (
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                3. 배달 수단 정보 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input 
                  type="text"
                  placeholder="자전거 모델명 (선택사항)"
                  value={formData.vehicleModel}
                  onChange={(e) => setFormData({...formData, vehicleModel: e.target.value})}
                  style={{ width: '100%', padding: '8px 0', border: 'none', borderBottom: '1px solid #e5e7eb', fontSize: '14px', outline: 'none' }}
                  onFocus={(e) => e.target.style.borderBottom = '2px solid #38bdf8'}
                  onBlur={(e) => e.target.style.borderBottom = '1px solid #e5e7eb'}
                />
              </div>
            </div>
          )}

          {/* Region */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              4. 희망 활동 지역
            </label>
            <input 
              type="text"
              readOnly
              value={formData.region}
              style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px', backgroundColor: '#f8fafc', color: '#64748b' }}
            />
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
                 setFormData({ name: '', phone: '', vehicleType: 'bicycle', vehicleModel: '', vehiclePlate: '', region: '서울시 강남구' });
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
