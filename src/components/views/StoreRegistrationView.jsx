import React, { useState } from 'react';

const StoreRegistrationView = ({ onBack, status, setStatus }) => {
  const [formData, setFormData] = useState({
    category: '',
    companyName: '', // 사업자명
    storeName: '',   // 상호명
    repName: '',     // 대표자명
    contact: '',     // 연락처
    martContact: '', // 마트연락처
    martIntro: '',   // 마트소개
    businessNumber: '', // 사업자등록증 번호
    mailOrderNumber: '', // 통신 판매업 신고번호
    address: '',      // 매장 주소
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    offDays: [],
    weekdayHours: { open: '09:00', close: '22:00' },
    weekendHours: { open: '10:00', close: '21:00' },
    weekdayLastOrder: '21:30',
    weekendLastOrder: '20:30'
  });

  const [errors, setErrors] = useState({});

  const [files, setFiles] = useState({
    businessRegistration: null,
    bankbook: null,
    mailOrderCertificate: null,
    storeImage: null
  });

  const toggleOffDay = (day) => {
    setFormData(prev => ({
      ...prev,
      offDays: prev.offDays.includes(day) 
        ? prev.offDays.filter(d => d !== day)
        : [...prev.offDays, day]
    }));
  };

  const handleFileChange = (e, field) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [field]: e.target.files[0] });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Check if all text fields are filled
    const requiredFields = [
      'category', 'companyName', 'storeName', 'repName', 'contact',
      'businessNumber', 'mailOrderNumber', 'address', 'bankName', 'accountNumber', 'accountHolder'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = '필수 입력 항목입니다.';
      }
    });

    // Check if all files are uploaded
    if (!files.businessRegistration) newErrors.businessRegistration = '사업자등록증을 첨부해주세요.';
    if (!files.bankbook) newErrors.bankbook = '통장 사본을 첨부해주세요.';
    if (!files.mailOrderCertificate) newErrors.mailOrderCertificate = '통신판매업 신고증을 첨부해주세요.';
    if (!files.storeImage) newErrors.storeImage = '마트 대표 사진을 첨부해주세요.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Find the first error element and scroll to it
      const firstError = Object.keys(newErrors)[0];
      const element = document.getElementById(`error-${firstError}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setErrors({});
    // Simulate submission
    setTimeout(() => {
      setStatus('PENDING');
      window.scrollTo(0, 0);
    }, 500);
  };

  const renderStatusView = () => (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>
          {status === 'APPROVED' ? '🎉' : '⏳'}
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>
          {status === 'APPROVED' ? '입점 승인이 완료되었습니다!' : '입점 심사가 진행 중입니다'}
        </h2>
        <p style={{ color: '#64748b', marginBottom: '32px', lineHeight: '1.6' }}>
          {status === 'APPROVED' 
            ? '이제 사장님 페이지로 전환하여 가게를 관리할 수 있습니다.' 
            : '담당자가 신청 내용을 검토하고 있습니다.\n심사 결과는 영업일 기준 1-3일 내로 알려드립니다.'}
        </p>

        {status === 'APPROVED' ? (
          <button 
            onClick={() => alert('사장님 모드로 전환 기능을 준비중입니다.')}
            className="btn-primary"
            style={{ padding: '16px 32px', fontSize: '16px' }}
          >
            가게 관리 시작하기
          </button>
        ) : (
          <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', fontSize: '14px', color: '#475569' }}>
            <div style={{ fontWeight: '700', marginBottom: '8px' }}>신청 정보</div>
            <div>{formData.storeName} ({formData.category})</div>
          </div>
        )}
        
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

  if (status !== 'NONE') {
    return renderStatusView();
  }

  const InputSection = ({ label, field, placeholder, type = "text", required = true }) => (
    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: errors[field] ? '1px solid #ef4444' : 'none' }}>
      <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <input 
        type={type}
        required={required}
        placeholder={placeholder || (required ? "필수 입력" : "내 답변 (선택)")}
        value={formData[field]}
        onChange={(e) => {
          setFormData({...formData, [field]: e.target.value});
          if (errors[field]) setErrors({...errors, [field]: null});
        }}
        style={{ width: '100%', padding: '8px 0', border: 'none', borderBottom: errors[field] ? '2px solid #ef4444' : '1px solid #e5e7eb', fontSize: '14px', outline: 'none' }}
        onFocus={(e) => e.target.style.borderBottom = errors[field] ? '2px solid #ef4444' : '2px solid var(--primary)'}
        onBlur={(e) => e.target.style.borderBottom = errors[field] ? '2px solid #ef4444' : '1px solid #e5e7eb'}
      />
      {errors[field] && (
        <div id={`error-${field}`} style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', fontWeight: '600' }}>
          {errors[field]}
        </div>
      )}
    </div>
  );

  const FileSection = ({ label, field, hint }) => (
    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: errors[field] ? '1px solid #ef4444' : 'none' }}>
      <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
        {label} <span style={{ color: '#ef4444' }}>*</span>
      </label>
      {hint && <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>{hint}</p>}
      <input 
        type="file" 
        required
        onChange={(e) => {
          handleFileChange(e, field);
          if (errors[field]) setErrors({...errors, [field]: null});
        }}
        style={{ width: '100%', fontSize: '14px', color: '#64748b' }} 
      />
      {errors[field] && (
        <div id={`error-${field}`} style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', fontWeight: '600' }}>
          {errors[field]}
        </div>
      )}
      {files[field] && (
        <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>
          ✓ {files[field].name} 등록됨
        </div>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '40px 20px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', borderTop: '10px solid var(--primary)', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px' }}>상점 입점 신청</h1>
          <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>
            동네마켓과 함께 성장할 사장님의 참여를 기다립니다.<br/>
            모든 입점 서류를 정확하게 입력 및 첨부해주세요. 담당자 확인 후 연락드리겠습니다.
          </p>
          <div style={{ marginTop: '16px', fontSize: '12px', color: '#ef4444' }}>* 모든 항목은 필수작성 사항입니다.</div>
        </div>

        {/* Form Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: errors.category ? '1px solid #ef4444' : 'none' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              카테고리 선택 <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select 
              required
              value={formData.category}
              onChange={(e) => {
                setFormData({...formData, category: e.target.value});
                if (errors.category) setErrors({...errors, category: null});
              }}
              style={{ width: '100%', padding: '12px', borderRadius: '4px', border: errors.category ? '1px solid #ef4444' : '1px solid #d1d5db', fontSize: '14px' }}
            >
              <option value="">선택</option>
              <option value="fruit">과일/채소</option>
              <option value="meat">정육/계란</option>
              <option value="fish">수산/해산물</option>
              <option value="sidedish">반찬/간편식</option>
              <option value="snack">간식/베이커리</option>
              <option value="other">기타</option>
            </select>
            {errors.category && (
              <div id="error-category" style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', fontWeight: '600' }}>
                {errors.category}
              </div>
            )}
          </div>

          <InputSection label="사업자명" field="companyName" placeholder="사업자등록증상의 사업자명을 입력해주세요" />
          <InputSection label="상호명" field="storeName" placeholder="동네마켓 앱에 노출될 상호명을 입력해주세요" />
          <InputSection label="매장 주소" field="address" placeholder="매장의 정확한 위치를 입력해주세요" />
          <InputSection label="대표자명" field="repName" />
          <InputSection label="대표자 연락처" field="contact" placeholder="010-0000-0000" />
          <InputSection label="마트 연락처" field="martContact" placeholder="02-000-0000 또는 010-0000-0000" required={false} />
          
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              마트 소개
            </label>
            <textarea 
              placeholder="마트에 대한 간단한 소개를 입력해주세요 (선택)"
              value={formData.martIntro}
              onChange={(e) => setFormData({...formData, martIntro: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px', minHeight: '100px', outline: 'none' }}
              onFocus={(e) => e.target.style.border = '2px solid var(--primary)'}
              onBlur={(e) => e.target.style.border = '1px solid #d1d5db'}
            />
          </div>

          <FileSection label="마트 대표 사진 첨부" field="storeImage" hint="매장 전경이나 간판이 잘 보이는 사진" />
          
          <InputSection label="사업자등록번호" field="businessNumber" placeholder="000-00-00000 (- 포함)" />
          <FileSection label="사업자등록증 첨부" field="businessRegistration" hint="사업자등록증 원본 스캔본 또는 사진" />
          
          <InputSection label="통신판매업 신고번호" field="mailOrderNumber" placeholder="제 2024-서울강남-0000 호" />
          <FileSection label="통신판매업 신고증 첨부" field="mailOrderCertificate" />

          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginTop: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>정산 계좌 정보</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>은행명 <span style={{ color: '#ef4444' }}>*</span></label>
                <input required type="text" value={formData.bankName} onChange={(e)=>{setFormData({...formData, bankName: e.target.value}); if(errors.bankName) setErrors({...errors, bankName: null});}} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: errors.bankName ? '1px solid #ef4444' : '1px solid #e2e8f0' }} placeholder="OO은행" />
                {errors.bankName && <div id="error-bankName" style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', fontWeight: '600' }}>{errors.bankName}</div>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>계좌번호 <span style={{ color: '#ef4444' }}>*</span></label>
                <input required type="text" value={formData.accountNumber} onChange={(e)=>{setFormData({...formData, accountNumber: e.target.value}); if(errors.accountNumber) setErrors({...errors, accountNumber: null});}} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: errors.accountNumber ? '1px solid #ef4444' : '1px solid #e2e8f0' }} placeholder="- 없이 입력" />
                {errors.accountNumber && <div id="error-accountNumber" style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', fontWeight: '600' }}>{errors.accountNumber}</div>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>예금주 <span style={{ color: '#ef4444' }}>*</span></label>
                <input required type="text" value={formData.accountHolder} onChange={(e)=>{setFormData({...formData, accountHolder: e.target.value}); if(errors.accountHolder) setErrors({...errors, accountHolder: null});}} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: errors.accountHolder ? '1px solid #ef4444' : '1px solid #e2e8f0' }} />
                {errors.accountHolder && <div id="error-accountHolder" style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', fontWeight: '600' }}>{errors.accountHolder}</div>}
              </div>
            </div>
          </div>
          <FileSection label="통장 사본 첨부" field="bankbook" hint="본인 명의(또는 사업자 명의) 통장 사본" />

          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              정기 휴무일
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['월', '화', '수', '목', '금', '토', '일'].map(day => (
                <div 
                  key={day}
                  onClick={() => toggleOffDay(day)}
                  style={{ 
                    padding: '8px 16px', borderRadius: '20px', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '14px', fontWeight: '700',
                    backgroundColor: formData.offDays.includes(day) ? 'var(--primary)' : 'white',
                    color: formData.offDays.includes(day) ? 'white' : '#64748b',
                    transition: 'all 0.2s'
                  }}
                >
                  {day}요일
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              운영 시간 <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>평일</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <input type="time" required value={formData.weekdayHours.open} onChange={(e) => setFormData({...formData, weekdayHours: {...formData.weekdayHours, open: e.target.value}})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                       <input type="time" required value={formData.weekdayHours.close} onChange={(e) => setFormData({...formData, weekdayHours: {...formData.weekdayHours, close: e.target.value}})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>주말</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <input type="time" required value={formData.weekendHours.open} onChange={(e) => setFormData({...formData, weekendHours: {...formData.weekendHours, open: e.target.value}})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                       <input type="time" required value={formData.weekendHours.close} onChange={(e) => setFormData({...formData, weekendHours: {...formData.weekendHours, close: e.target.value}})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <button 
              type="submit"
              className="btn-primary"
              style={{ padding: '16px 32px', fontSize: '16px', borderRadius: '12px', fontWeight: '800' }}
            >
              입점 신청서 제출하기
            </button>
            <button 
              type="button"
              onClick={() => {
                if(window.confirm('작성 중인 내용이 모두 사라집니다. 초기화하시겠습니까?')){
                  window.location.reload();
                }
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

export default StoreRegistrationView;
