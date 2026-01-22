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
- **No routing library** - tab/view state managed in App.jsx
- **No state management library** - props drilling pattern

### Project Structure

```
src/
├── App.jsx                    # 메인 앱 컴포넌트 (역할별 라우팅, 전역 상태)
├── main.jsx                   # 앱 엔트리 포인트
├── components/
│   ├── Header.jsx             # 공통 헤더 (검색, 알림, 사용자 메뉴)
│   ├── Footer.jsx             # 공통 푸터
│   ├── Hero.jsx               # 랜딩 페이지 히어로 섹션
│   ├── AuthModal.jsx          # 로그인/회원가입 모달
│   ├── NotificationPanel.jsx  # 알림 패널
│   ├── CategorySidebar.jsx    # 카테고리 사이드바
│   │
│   ├── CustomerView.jsx       # 고객 메인 뷰 (탭 네비게이션)
│   ├── StoreGrid.jsx          # 마트 목록 그리드
│   ├── StoreDetailModal.jsx   # 마트 상세/상품 목록 모달
│   ├── CheckoutView.jsx       # 결제 페이지
│   ├── OrderTrackingView.jsx  # 실시간 주문 추적
│   ├── SearchResultsView.jsx  # 검색 결과 뷰
│   │
│   ├── StoreDashboard.jsx     # 마트 대시보드
│   ├── RiderDashboard.jsx     # 배달원 대시보드
│   ├── AdminDashboard.jsx     # 관리자 대시보드
│   │
│   ├── PartnerPage.jsx        # 파트너 등록 페이지
│   ├── SupportView.jsx        # 고객지원 페이지
│   └── ResidentDeliveryView.jsx # 주민 배달원 소개
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
- `categories` - 상품 카테고리

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

| 문서 | 경로 | 설명 |
|------|------|------|
| PRD | `doc/동네마켓_PRD_v1.0.md` | 제품 요구사항 정의서 |
| SRS | `doc/동네마켓_SRS_v1.0.md` | 소프트웨어 요구사항 명세서 |
| ERD | `doc/ERD.md` | 데이터베이스 설계 (Mermaid) |
| 기술명세서 | `doc/기술명세서.md` | 백엔드 기술 스택 및 아키텍처 |
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
2. ERD (`doc/ERD.md`) 스키마 참고

### 새 역할 뷰 추가
1. `src/components/` 에 Dashboard 컴포넌트 생성
2. `App.jsx` 의 role-based rendering에 케이스 추가
