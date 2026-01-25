import React, { useState } from 'react';

const StoreRegistrationView = ({ onBack, status, setStatus }) => {
  const [formData, setFormData] = useState({
    category: '',
    products: '',
    businessName: '',
    businessNumber: '',
    offDays: [],
    weekdayHours: { open: '09:00', close: '22:00' },
    weekendHours: { open: '10:00', close: '21:00' },
    weekdayLastOrder: '21:30',
    weekendLastOrder: '20:30'
  });

  const toggleOffDay = (day) => {
    setFormData(prev => ({
      ...prev,
      offDays: prev.offDays.includes(day) 
        ? prev.offDays.filter(d => d !== day)
        : [...prev.offDays, day]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.category || !formData.businessName || !formData.businessNumber) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
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
            <div>{formData.businessName} ({formData.category})</div>
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

  if (status !== 'NONE') {
    return renderStatusView();
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '40px 20px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', borderTop: '10px solid var(--primary)', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px' }}>상점 입점 신청</h1>
          <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>
            동네마켓과 함께 성장할 사장님의 참여를 기다립니다.<br/>
            아래 정보를 입력해주시면 담당가 확인 후 연락드리겠습니다.
          </p>
          <div style={{ marginTop: '16px', fontSize: '12px', color: '#ef4444' }}>* 필수 항목</div>
        </div>

        {/* Form Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Category */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              1. 입점 제안 상품 카테고리 (대표 상품 카테고리로 선택) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px' }}
            >
              <option value="">선택</option>
              <option value="fruit">과일/채소</option>
              <option value="meat">정육/계란</option>
              <option value="fish">수산/해산물</option>
              <option value="sidedish">반찬/간편식</option>
              <option value="snack">간식/베이커리</option>
              <option value="other">기타</option>
            </select>
          </div>

          {/* Business Name */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              2. 사업자명 (상호명) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input 
              type="text"
              placeholder="내 답변"
              value={formData.businessName}
              onChange={(e) => setFormData({...formData, businessName: e.target.value})}
              style={{ width: '100%', padding: '8px 0', border: 'none', borderBottom: '1px solid #e5e7eb', fontSize: '14px', outline: 'none' }}
              onFocus={(e) => e.target.style.borderBottom = '2px solid var(--primary)'}
              onBlur={(e) => e.target.style.borderBottom = '1px solid #e5e7eb'}
            />
          </div>

          {/* Products */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              3. 주요 취급 / 대표 상품 (최대 5개)
            </label>
            <input 
              type="text"
              placeholder="내 답변"
              value={formData.products}
              onChange={(e) => setFormData({...formData, products: e.target.value})}
              style={{ width: '100%', padding: '8px 0', border: 'none', borderBottom: '1px solid #e5e7eb', fontSize: '14px', outline: 'none' }}
              onFocus={(e) => e.target.style.borderBottom = '2px solid var(--primary)'}
              onBlur={(e) => e.target.style.borderBottom = '1px solid #e5e7eb'}
            />
          </div>

          {/* Business Number */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              4. 사업자번호 (- 기호 포함하여 작성) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input 
              type="text"
              placeholder="내 답변"
              value={formData.businessNumber}
              onChange={(e) => setFormData({...formData, businessNumber: e.target.value})}
              style={{ width: '100%', padding: '8px 0', border: 'none', borderBottom: '1px solid #e5e7eb', fontSize: '14px', outline: 'none' }}
              onFocus={(e) => e.target.style.borderBottom = '2px solid var(--primary)'}
              onBlur={(e) => e.target.style.borderBottom = '1px solid #e5e7eb'}
            />
          </div>

          {/* Regular Off-days */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              5. 정기 휴무일 (중복 선택 가능)
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

          {/* Operating Hours & Last Order */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              6. 운영 시간 및 라스트 오더 <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>평일 운영 시간</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <input type="time" value={formData.weekdayHours.open} onChange={(e) => setFormData({...formData, weekdayHours: {...formData.weekdayHours, open: e.target.value}})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                       <span style={{ color: '#94a3b8' }}>~</span>
                       <input type="time" value={formData.weekdayHours.close} onChange={(e) => setFormData({...formData, weekdayHours: {...formData.weekdayHours, close: e.target.value}})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>주말 운영 시간</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <input type="time" value={formData.weekendHours.open} onChange={(e) => setFormData({...formData, weekendHours: {...formData.weekendHours, open: e.target.value}})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                       <span style={{ color: '#94a3b8' }}>~</span>
                       <input type="time" value={formData.weekendHours.close} onChange={(e) => setFormData({...formData, weekendHours: {...formData.weekendHours, close: e.target.value}})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                    </div>
                  </div>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#8b5cf6', marginBottom: '8px' }}>평일 라스트 오더</div>
                    <input 
                      type="time" 
                      value={formData.weekdayLastOrder} 
                      onChange={(e) => setFormData({...formData, weekdayLastOrder: e.target.value})} 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #8b5cf6', fontSize: '13px', color: '#8b5cf6', fontWeight: '700' }} 
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#8b5cf6', marginBottom: '8px' }}>주말 라스트 오더</div>
                    <input 
                      type="time" 
                      value={formData.weekendLastOrder} 
                      onChange={(e) => setFormData({...formData, weekendLastOrder: e.target.value})} 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #8b5cf6', fontSize: '13px', color: '#8b5cf6', fontWeight: '700' }} 
                    />
                  </div>
               </div>
               <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>* 영업 종료 전 배달 및 준비를 위해 주문을 마감하는 시간입니다.</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <button 
              type="submit"
              className="btn-primary"
              style={{ padding: '12px 24px', fontSize: '14px', borderRadius: '4px' }}
            >
              제출하기
            </button>
            <button 
              type="button"
              onClick={() => {
                setFormData({ 
                  category: '', products: '', businessName: '', businessNumber: '',
                  offDays: [], weekdayHours: { open: '09:00', close: '22:00' },
                  weekendHours: { open: '10:00', close: '21:00' }, 
                  weekdayLastOrder: '21:30', weekendLastOrder: '20:30'
                });
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
