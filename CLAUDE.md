# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

동네마켓 (Neighborhood Market) - 동네 식료품 배달 플랫폼. 고객과 동네 마트를 연결하고, 구독 서비스와 주민 배달원 시스템을 제공합니다.

## Development Commands

```bash
npm run dev      # Start Vite dev server with HMR (http://localhost:5173)
npm run build    # Production build (outputs to dist/)
npm run lint     # Run ESLint
npm run preview  # Preview production build locally
```

## Architecture

### Tech Stack
- **React 19** with **Vite 7** (ES modules, JSX)
- **Plain CSS** with CSS custom properties for theming
- **Swiper 12** for carousel/slide components
- **No routing library** - tab/view state managed in App.jsx
- **No state management library** - props drilling pattern

### Project Structure

```
src/
├── App.jsx                    # 메인 앱 컴포넌트 (역할별 라우팅, 전역 상태)
├── main.jsx                   # 앱 엔트리 포인트
│
├── api/                       # API 모듈 (백엔드 통신)
│   ├── axios.js               # Axios 공유 인스턴스 (인터셉터, withCredentials)
│   ├── authApi.js             # 인증 API (로그인, 회원가입, OAuth)
│   ├── cart.js                # 장바구니 API
│   ├── checkoutApi.js         # 결제 API
│   ├── faqApi.js              # FAQ API
│   ├── inquiryApi.js          # 1:1 문의 API
│   ├── noticeApi.js           # 공지사항 API
│   ├── notificationApi.js     # 알림 API (SSE 구독 포함)
│   ├── orderApi.js            # 주문 API
│   ├── riderApi.js            # 라이더 API
│   └── storageApi.js          # 파일 업로드 API (S3/MinIO)
│
├── components/
│   ├── common/                # 공통 UI 컴포넌트
│   │   ├── Header.jsx         # 공통 헤더 (검색, 알림, 사용자 메뉴)
│   │   ├── Footer.jsx         # 공통 푸터
│   │   ├── Hero.jsx           # 랜딩 페이지 히어로 섹션 (Swiper)
│   │   ├── CategorySidebar.jsx # 카테고리 사이드바
│   │   ├── NotificationPanel.jsx # 알림 패널
│   │   └── StoreGrid.jsx      # 마트 목록 그리드
│   │
│   ├── modals/                # 모달 컴포넌트
│   │   ├── AuthModal.jsx      # 로그인/회원가입 모달
│   │   ├── CartModal.jsx      # 장바구니 모달
│   │   ├── InquiryModal.jsx   # 1:1 문의 모달
│   │   ├── LocationModal.jsx  # 배송지 선택/변경 모달
│   │   ├── OrderDetailFullModal.jsx # 주문 상세 전체 모달
│   │   ├── OrderDetailModal.jsx # 주문 상세 모달
│   │   ├── OrderReportModal.jsx # 주문 신고 모달
│   │   ├── ReceiptModal.jsx   # 영수증 모달
│   │   └── StoreDetailModal.jsx # 마트 상세/상품 목록 모달
│   │
│   └── views/                 # 페이지 뷰 컴포넌트
│       │  # 고객(CUSTOMER) 관련
│       ├── CustomerView.jsx   # 고객 메인 뷰 (탭 네비게이션)
│       ├── StoreDetailView.jsx # 마트 상세 페이지
│       ├── CheckoutView.jsx   # 결제 페이지
│       ├── OrderTrackingView.jsx # 실시간 주문 추적
│       ├── OrderManagementView.jsx # 주문 관리 (마이페이지)
│       ├── SearchResultsView.jsx # 검색 결과 뷰
│       ├── SupportView.jsx    # 고객지원 페이지
│       │
│       │  # 마트(STORE) 관련
│       ├── StoreDashboard.jsx # 마트 대시보드
│       ├── StoreRegistrationView.jsx # 마트 등록 페이지
│       │
│       │  # 배달원(RIDER) 관련
│       ├── RiderDashboard.jsx # 배달원 대시보드
│       ├── RiderRegistrationView.jsx # 배달원 가입 페이지
│       ├── ResidentDeliveryView.jsx # 주민 배달원 소개
│       │
│       │  # 관리자(ADMIN) 관련
│       ├── AdminDashboard.jsx # 관리자 대시보드
│       │
│       │  # 기타
│       └── PartnerPage.jsx    # 파트너 등록 페이지
│
├── config/
│   └── api.js                 # API_BASE_URL, Kakao OAuth URL
│
├── data/
│   └── mockData.js            # 목업 데이터 (stores, products, orders 등)
│
└── styles/
    └── global.css             # 전역 스타일, CSS 변수, 디자인 토큰
```

### Role-Based Views

| Role | Component | Purpose |
|------|-----------|---------|
| CUSTOMER | `CustomerView` | 마트 검색, 주문, 배달 추적, 구독 관리 |
| STORE | `StoreDashboard` | 상품/재고 관리, 주문 처리, 매출 통계 |
| RIDER | `RiderDashboard` | 배달 수락, 네비게이션, 수익 확인 |
| ADMIN | `AdminDashboard` | 플랫폼 모니터링, 사용자/마트 관리, 정산 |

Role switching: 개발 모드에서 화면 우측 하단 디버그 패널 사용

### State Management Pattern

```jsx
// App.jsx - 전역 상태
const [userRole, setUserRole] = useState('CUSTOMER');
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [notifications, setNotifications] = useState([]);
const [selectedStore, setSelectedStore] = useState(null);

// CustomerView.jsx - 로컬 상태
const [activeTab, setActiveTab] = useState('home');
const [cart, setCart] = useState([]);
```

### Mock Data Structure

`src/data/mockData.js` 주요 데이터:
- `stores` - 마트 정보 (이름, 위치, 배달비, 평점)
- `products` - 상품 정보 (이름, 가격, 재고, 카테고리)
- `orders` - 주문 내역
- `subscriptions` - 구독 정보
- `riders` - 배달원 정보
- `categories` - 상품 카테고리 (11개)
- `addresses` - 배송지 관리
- `paymentMethods` - 결제 수단
- `coupons` - 쿠폰 정보
- `reviews` - 리뷰 데이터
- `faqs` / `inquiries` - 고객지원 데이터

### Design System

CSS Custom Properties (`src/styles/global.css`):

```css
/* Colors */
--primary: #10b981;           /* Emerald green */
--primary-dark: #059669;
--gray-50 ~ --gray-900;       /* Gray scale */

/* Border Radius */
--radius-sm: 4px;
--radius: 8px;
--radius-lg: 12px;
--radius-full: 9999px;

/* Shadows */
--shadow-sm, --shadow, --shadow-lg;

/* Font */
font-family: 'Pretendard', sans-serif;  /* Korean optimized */
```

## Project Documentation

```
doc/
├── v1.0/                        # 기존 문서 (보관)
└── v2.0/                        # 최신 문서
```

| 문서 | 경로 | 설명 |
|------|------|------|
| **ERD (v2.0)** | `doc/v2.0/ERD_엔티티_설명서.md` | ERD 엔티티 설명서 (최신) |
| PRD | `doc/v1.0/동네마켓_PRD_v1.0.md` | 제품 요구사항 정의서 |
| SRS | `doc/v1.0/동네마켓_SRS_v1.0.md` | 소프트웨어 요구사항 명세서 |
| ERD (v1.0) | `doc/v1.0/ERD.md` | 데이터베이스 설계 (구버전) |
| 기술명세서 | `doc/v1.0/기술명세서.md` | 백엔드 기술 스택 및 아키텍처 |
| 유스케이스 | `doc/v1.0/유스케이스.md` | 시스템 유스케이스 다이어그램 |
| Wireframes | `wireframes/` | 역할별 HTML 와이어프레임 |

## Coding Conventions

### Component Pattern
```jsx
// 함수형 컴포넌트 + hooks
function ComponentName({ prop1, prop2, onAction }) {
  const [state, setState] = useState(initialValue);

  const handleEvent = () => {
    // event handler
  };

  return (
    <div className="component-name">
      {/* JSX */}
    </div>
  );
}
```

### CSS Naming
- BEM-like: `.component-name`, `.component-name__element`, `.component-name--modifier`
- 컴포넌트별 클래스 prefix 사용

### ESLint Rules
- `no-unused-vars`: 대문자 또는 언더스코어로 시작하는 변수 무시 (`varsIgnorePattern: '^[A-Z_]'`)

## Common Tasks

### 새 컴포넌트 추가
1. `src/components/` 에 `.jsx` 파일 생성
2. 필요시 `App.jsx` 또는 부모 컴포넌트에서 import
3. 스타일은 `global.css` 또는 컴포넌트 내 인라인

### 목업 데이터 수정
1. `src/data/mockData.js` 편집
2. ERD (`doc/v2.0/ERD_엔티티_설명서.md`) 스키마 참고

### 새 역할 뷰 추가
1. `src/components/` 에 Dashboard 컴포넌트 생성
2. `App.jsx` 의 role-based rendering에 케이스 추가
