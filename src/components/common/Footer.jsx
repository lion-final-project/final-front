import React from 'react';

const Footer = ({ onTabChange, userInfo, setUserRole }) => {
  return (
    <footer style={{
      backgroundColor: '#1e293b',
      color: '#94a3b8',
      padding: '80px 0 40px',
      marginTop: '80px',
      borderTop: '1px solid #334155'
    }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {/* Role-based Navigation Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
          {(userInfo?.roles?.includes("STORE") || userInfo?.roles?.includes("ROLE_STORE")) && (
            <button
              onClick={() => {
                setUserRole?.("STORE");
                window.scrollTo(0, 0);
              }}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "none",
                background: "#fdf4ff",
                color: "#c026d3",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              🏪 사장님 모드
            </button>
          )}
          {(userInfo?.roles?.includes("RIDER") || userInfo?.roles?.includes("ROLE_RIDER")) && (
            <button
              onClick={() => {
                setUserRole?.("RIDER");
                window.scrollTo(0, 0);
              }}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "none",
                background: "#eff6ff",
                color: "#3b82f6",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              🛵 라이더 모드
            </button>
          )}
          {(userInfo?.roles?.includes("ADMIN") || userInfo?.roles?.includes("ROLE_ADMIN")) && (
            <button
              onClick={() => {
                setUserRole?.("ADMIN");
                window.scrollTo(0, 0);
              }}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "none",
                background: "#f1f5f9",
                color: "#475569",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              ⚙️ 관리자 모드
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', marginBottom: '60px' }}>
          <div style={{ gridColumn: 'span 1' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'white', marginBottom: '20px', letterSpacing: '-1px' }}>
              <span style={{ color: 'var(--primary)' }}>동네</span>마켓
            </h2>
            <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              우리 동네 시장의 신선함을 이웃의 손길로 문 앞까지 전달합니다. 지역 상생을 위한 가장 따뜻한 IT 서비스를 지향합니다.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              {['📸', '🐦', '📘', '📺'].map((icon, i) => (
                <div key={i} style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}>
                  {icon}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'white', marginBottom: '20px' }}>서비스</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <li style={{ cursor: 'pointer' }} onClick={() => onTabChange?.('home')}>동네마켓 홈</li>
              <li style={{ cursor: 'pointer' }} onClick={() => onTabChange?.('subscription')}>정기 구독</li>
              <li style={{ cursor: 'pointer' }} onClick={() => onTabChange?.('partner')}>파트너 지원</li>
              <li style={{ cursor: 'pointer' }} onClick={() => onTabChange?.('home')}>이벤트</li>
            </ul>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'white', marginBottom: '20px' }}>고객지원</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <li style={{ cursor: 'pointer' }} onClick={() => onTabChange?.('support')}>공지사항</li>
              <li style={{ cursor: 'pointer' }} onClick={() => onTabChange?.('support')}>자주 묻는 질문</li>
              <li style={{ cursor: 'pointer' }} onClick={() => onTabChange?.('support')}>1:1 문의</li>
              <li style={{ cursor: 'pointer' }} onClick={() => onTabChange?.('partner')}>입점 문의</li>
            </ul>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'white', marginBottom: '20px' }}>법적 고지</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <li style={{ cursor: 'pointer' }}>이용약관</li>
              <li style={{ cursor: 'pointer', color: 'white', fontWeight: '600' }}>개인정보처리방침</li>
              <li style={{ cursor: 'pointer' }}>전자금융거래 이용약관</li>
              <li style={{ cursor: 'pointer' }}>청소년 보호정책</li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #334155', paddingTop: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', marginBottom: '8px' }}>
            (주)상생네트웍스 | 대표자: 홍길동 | 서울특별시 강남구 역삼로 123
          </div>
          <div style={{ fontSize: '12px', marginBottom: '20px' }}>
            사업자등록번호: 123-45-67890 | 통신판매업신고: 제 2026-서울강남-1234호
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            © 2026 Neighborhood Market. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
