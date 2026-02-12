import React from 'react';

// 애니메이션 스타일 추가
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
if (!document.head.querySelector('style[data-card-success-modal]')) {
  style.setAttribute('data-card-success-modal', 'true');
  document.head.appendChild(style);
}

const CardRegistrationSuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      style={{ 
        position: "fixed", 
        inset: 0, 
        backgroundColor: "rgba(0,0,0,0.6)", 
        zIndex: 1300, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        backdropFilter: "blur(8px)",
        animation: "fadeIn 0.3s ease-out"
      }}
      onClick={onClose}
    >
      <div 
        style={{ 
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          width: "100%", 
          maxWidth: "420px", 
          borderRadius: "24px", 
          padding: "0",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)",
          overflow: "hidden",
          animation: "slideUp 0.4s ease-out"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 그라데이션 헤더 */}
        <div style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)",
          padding: "48px 32px",
          textAlign: "center"
        }}>
          <h3 style={{ 
            fontSize: "28px", 
            fontWeight: "800", 
            color: "white",
            margin: "0 0 12px",
            textShadow: "0 2px 8px rgba(0,0,0,0.2)"
          }}>
            카드 등록 완료!
          </h3>
          <p style={{ 
            fontSize: "16px", 
            color: "rgba(255,255,255,0.95)",
            margin: 0,
            lineHeight: "1.6"
          }}>
            카드가 성공적으로 등록되었습니다
          </p>
        </div>

        {/* 하단 닫기 버튼 영역 */}
        <div style={{
          background: "white",
          padding: "24px 32px 32px",
          textAlign: "center"
        }}>
          <button 
            onClick={onClose}
            style={{ 
              width: "100%", 
              padding: "14px 32px", 
              borderRadius: "12px", 
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white", 
              border: "none", 
              fontWeight: "800", 
              fontSize: "16px", 
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)",
              transition: "all 0.3s ease",
              transform: "translateY(0)"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 16px rgba(16, 185, 129, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.4)";
            }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardRegistrationSuccessModal;
