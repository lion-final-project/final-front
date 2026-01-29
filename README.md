# 동네마켓 (Neighborhood Market)

동네 식료품 배달 플랫폼 - 고객과 동네 마트를 연결하고, 구독 서비스와 주민 배달원 시스템을 제공합니다.

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

## 주요 기능

### 고객 (Customer)
- 주변 마트 검색 및 상품 주문
- 실시간 배달 추적
- 정기 구독 서비스 관리
- 주문 내역 및 포인트 관리

### 마트 (Store)
- 상품 및 재고 관리
- 주문 접수 및 처리
- 매출 통계 대시보드
- 구독 상품 설정

### 배달원 (Rider)
- 배달 요청 수락/관리
- 실시간 네비게이션
- 수익 및 정산 내역 확인
- 배달 이력 관리

### 관리자 (Admin)
- 플랫폼 전체 현황 모니터링
- 사용자/마트/배달원 관리
- 정산 및 리포트 생성
- 공지사항 관리

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React 19, Vite 7 |
| Styling | Plain CSS, CSS Custom Properties |
| UI Library | Swiper 12 (캐러셀/슬라이드) |
| State | React useState (Props drilling) |
| Build | Vite, ESLint |

## 프로젝트 구조

```
src/
├── App.jsx                    # 메인 앱 (역할별 라우팅, 전역 상태)
├── main.jsx                   # 엔트리 포인트
├── components/                # 28개 컴포넌트
│   │
│   │  # 공통 UI
│   ├── Header.jsx             # 공통 헤더
│   ├── Footer.jsx             # 공통 푸터
│   ├── Hero.jsx               # 랜딩 히어로 섹션 (Swiper)
│   ├── AuthModal.jsx          # 로그인/회원가입 모달
│   ├── LocationModal.jsx      # 배송지 선택 모달
│   │
│   │  # 고객 뷰
│   ├── CustomerView.jsx       # 고객 메인 뷰
│   ├── StoreGrid.jsx          # 마트 목록 그리드
│   ├── StoreDetailView.jsx    # 마트 상세 페이지
│   ├── CartModal.jsx          # 장바구니 모달
│   ├── CheckoutView.jsx       # 결제 페이지
│   ├── OrderTrackingView.jsx  # 주문 추적
│   ├── OrderManagementView.jsx # 주문 관리
│   │
│   │  # 역할별 대시보드
│   ├── StoreDashboard.jsx     # 마트 대시보드
│   ├── RiderDashboard.jsx     # 배달원 대시보드
│   ├── AdminDashboard.jsx     # 관리자 대시보드
│   │
│   │  # 가입/등록
│   ├── StoreRegistrationView.jsx  # 마트 등록
│   ├── RiderRegistrationView.jsx  # 배달원 가입
│   └── ...
├── data/
│   └── mockData.js            # 목업 데이터
└── styles/
    └── global.css             # 전역 스타일, 디자인 토큰
```

## 시작하기

### 요구사항

- Node.js 18.x 이상
- npm 또는 yarn

### 설치

```bash
# 저장소 클론
git clone https://github.com/your-username/neighborhood-market-web.git
cd neighborhood-market-web

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 사용 가능한 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (HMR 지원) |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과물 미리보기 |
| `npm run lint` | ESLint 검사 |

## 역할 전환 (개발 모드)

개발 모드에서는 화면 우측 하단의 디버그 패널을 통해 역할(Customer/Store/Rider/Admin)을 전환할 수 있습니다.

## 디자인 시스템

CSS Custom Properties 기반 디자인 토큰:

```css
--primary: #10b981;        /* Emerald - 메인 컬러 */
--radius-sm: 4px;          /* 작은 둥글기 */
--radius: 8px;             /* 기본 둥글기 */
--radius-lg: 12px;         /* 큰 둥글기 */
```

폰트: Pretendard (한글 최적화)

## 프로젝트 문서

```
doc/
├── v1.0/    # 기존 문서 (보관)
└── v2.0/    # 최신 문서
```

### v2.0 (최신)
| 문서 | 설명 |
|------|------|
| [ERD 엔티티 설명서](doc/v2.0/ERD_엔티티_설명서.md) | 37개 테이블 상세 명세 |

### v1.0 (보관)
| 문서 | 설명 |
|------|------|
| [PRD](doc/v1.0/동네마켓_PRD_v1.0.md) | 제품 요구사항 정의서 |
| [SRS](doc/v1.0/동네마켓_SRS_v1.0.md) | 소프트웨어 요구사항 명세서 |
| [ERD](doc/v1.0/ERD.md) | 데이터베이스 설계 (구버전) |
| [기술명세서](doc/v1.0/기술명세서.md) | 백엔드 기술 스택 및 아키텍처 |
| [유스케이스](doc/v1.0/유스케이스.md) | 시스템 유스케이스 다이어그램 |

## 스크린샷

> 스크린샷은 추후 추가 예정입니다.

- 고객 화면 (마트 목록, 장바구니, 결제, 주문 추적)
- 마트 대시보드 (상품 관리, 주문 처리, 매출 통계)
- 배달원 대시보드 (배달 수락, 네비게이션, 수익 확인)
- 관리자 대시보드 (플랫폼 모니터링, 사용자 관리)

## 라이선스

MIT License
