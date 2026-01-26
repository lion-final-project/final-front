import React from 'react';

const PartnerPage = ({ onBack, onRegister, isLoggedIn, onOpenAuth }) => {
  const handleRegister = (type) => {
    if (!isLoggedIn) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    onRegister?.(type);
  };

  return (
    <div className="partner-page" style={{ padding: '60px 0', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <button 
          onClick={onBack}
          style={{ marginBottom: '32px', background: 'none', border: 'none', color: '#64748b', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          ← 홈으로 돌아가기
        </button>

        <section style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '24px', letterSpacing: '-1.5px' }}>
            우리 동네 시장의 <br />
            <span className="gradient-text">든든한 파트너</span>가 되어주세요
          </h1>
          <p style={{ fontSize: '20px', color: '#64748b', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' }}>
            동네마켓은 지역 상권과 상생하며 함께 성장합니다. <br />
            지금 바로 입점하고 더 많은 고객을 만나보세요.
          </p>
        </section>

        <section style={{ backgroundColor: 'white', padding: '40px', borderRadius: '32px', marginBottom: '80px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '32px' }}>동네마켓의 <span style={{ color: 'var(--primary)' }}>상생(相生)</span> 약속</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              { icon: '🤝', title: '지역 상권 보호', desc: '대형 유통망이 아닌 우리 동네 시장 상인들과 함께합니다.' },
              { icon: '🏡', title: '이웃간의 연결', desc: '배달을 통해 이웃과 이웃이 서로 돕는 따뜻한 문화를 만듭니다.' },
              { icon: '🌱', title: '지속 가능한 성장', desc: '합리적인 수수료와 공정한 배분으로 함께 멀리 갑니다.' }
            ].map((item, i) => (
              <div key={i}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>{item.icon}</div>
                <div style={{ fontWeight: '800', marginBottom: '8px' }}>{item.title}</div>
                <div style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '80px' }}>
          {/* Merchant Partner Card */}
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '32px', boxShadow: 'var(--shadow)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '40px', marginBottom: '20px' }}>🏪</div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>상점 파트너</h2>
            <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px', lineHeight: '1.6', flexGrow: 1 }}>
              전통시장 상인분들의 소중한 상품을 <br />
              더 많은 이웃에게 소개합니다.
            </p>
            <ul style={{ padding: 0, listStyle: 'none', marginBottom: '32px' }}>
              {['광고비 0원, 합리적 수수료', '주변 단골 고객 확보 효과', '간편한 실시간 정산'].map((item, i) => (
                <li key={i} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>✓</span> {item}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => handleRegister('STORE_APPLICATION')}
              style={{ width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}
            >
              상점 입점 신청하기
            </button>
          </div>

          {/* Resident Rider Card */}
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '32px', boxShadow: '0 10px 30px rgba(56, 189, 248, 0.1)', border: '2px solid #38bdf8', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: '#38bdf8', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800' }}>추천 🏘️</div>
            <div style={{ fontSize: '40px', marginBottom: '20px' }}>🏃</div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>동네 주민 파트너</h2>
            <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px', lineHeight: '1.6', flexGrow: 1 }}>
              가까운 거리를 산책하듯 배달하고 <br />
              이웃에게 웃음을 전해주세요.
            </p>
            <ul style={{ padding: 0, listStyle: 'none', marginBottom: '32px' }}>
              {['자전거/도보로 가볍게', '동네 인증으로 즉시 시작', '소소하고 확실한 수입'].map((item, i) => (
                <li key={i} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>✓</span> {item}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => handleRegister('RESIDENT')}
              style={{ width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: '#38bdf8', color: 'white', border: 'none', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}
            >
              주민 라이더 시작하기
            </button>
          </div>

        </div>

        <section style={{ backgroundColor: '#f1f5f9', padding: '60px', borderRadius: '32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>자주 묻는 질문</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
            {[
              { q: '입점 비용이 발생하나요?', a: '동네마켓 입점은 전액 무료이며, 주문 발생 시에만 소정의 수수료가 발생합니다.' },
              { q: '전용 배달 수단이 있어야 하나요?', a: '오토바이, 자동차뿐만 아니라 자전거, 도보로도 라이더 활동이 가능합니다.' }
            ].map((faq, i) => (
              <div key={i}>
                <div style={{ fontWeight: '700', marginBottom: '8px' }}>Q. {faq.q}</div>
                <div style={{ color: '#64748b', fontSize: '14px' }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PartnerPage;
