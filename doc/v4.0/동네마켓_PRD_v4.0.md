# 동네마켓 제품 요구사항 정의서 (PRD) v4.0

| 항목 | 내용 |
|------|------|
| **문서 버전** | v4.0 |
| **작성일** | 2026-01-30 |
| **작성 방법** | React 프론트엔드 역공학 + ERD v4.1 기반 |
| **참조 문서** | `동네마켓_ERD_v4.1.md`, `ERD_엔티티_설명서_v4.1.md`, `동네마켓_DDL_v4.1.md` |
| **기술 기반** | PostgreSQL 16 + PostGIS 3.4, Spring Boot 3.x, React 19 / Flutter 3.x |

---

## 1. 제품 개요

### 1.1 제품명

**동네마켓** (Neighborhood Market)

### 1.2 비전

> 고객과 동네 마트를 연결하고, 정기 구독 서비스와 주민 배달원 시스템으로 지역 상권을 활성화하는 동네 식료품 배달 플랫폼

### 1.3 핵심 가치 제안

| # | 가치 | 설명 |
|---|------|------|
| 1 | **동네 마트 배달** | 반경 3km 내 동네 마트 상품을 모바일로 주문하고 배달받는다 |
| 2 | **멀티마트 주문** | 여러 마트의 상품을 하나의 주문으로 묶어 결제한다 |
| 3 | **정기 구독** | 자주 구매하는 상품을 요일별 스케줄로 자동 배달받는다 |
| 4 | **주민 배달원** | 동네 주민이 도보/자전거로 배달하여 지역 일자리를 창출한다 |
| 5 | **실시간 추적** | 주문 접수부터 배달 완료까지 6단계 실시간 추적을 제공한다 |

### 1.4 목표 사용자

| 역할 | 페르소나 | 핵심 니즈 |
|------|---------|----------|
| **고객 (CUSTOMER)** | 동네 거주자, 맞벌이 가정, 1인 가구 | 신선 식료품을 빠르게 배달받고 싶다 |
| **마트 (STORE)** | 동네 소규모 마트, 정육점, 과일가게 사업주 | 온라인 판매 채널을 확보하고 매출을 늘리고 싶다 |
| **라이더 (RIDER)** | 동네 주민, 파트타임 배달원 | 유연한 시간에 추가 수입을 얻고 싶다 |
| **관리자 (ADMIN)** | 플랫폼 운영팀 | 플랫폼 전체를 모니터링하고 관리하고 싶다 |

### 1.5 사용자 역할 구조

- **N:M 역할 모델**: 한 사용자가 복수 역할을 가질 수 있음 (예: 고객이면서 라이더)
- `users` ↔ `user_roles` ↔ `roles` 관계
- 기본 역할: `CUSTOMER`, `STORE_OWNER`, `RIDER`, `ADMIN`

---

## 2. 기능 요구사항

### 2.1 사용자 모듈

> 관련 테이블: `users`, `roles`, `user_roles`, `addresses`, `social_logins`
> 관련 ENUM: `user_status`, `social_provider`

#### FR-USR-001: 회원가입

| 항목 | 내용 |
|------|------|
| **설명** | 이메일 기반 회원가입 |
| **입력** | 이메일, 비밀번호, 이름, 휴대폰 번호 |
| **비즈니스 규칙** | - 이메일 중복 검사<br>- 휴대폰 SMS 인증 (3분 타임아웃, 최대 5회 재전송)<br>- 약관 동의 필수 (서비스, 개인정보, 마케팅 선택) |
| **결과** | 사용자 생성 (상태: `ACTIVE`), 기본 역할 `CUSTOMER` 부여 |

#### FR-USR-002: 소셜 로그인

| 항목 | 내용 |
|------|------|
| **설명** | OAuth 2.0 소셜 로그인 |
| **지원 제공자** | 카카오, 네이버, 구글, 애플 (`social_provider` ENUM) |
| **비즈니스 규칙** | - 기존 이메일과 연동 가능<br>- 소셜 계정 연결 해제 가능 |

#### FR-USR-003: 배송지 관리

| 항목 | 내용 |
|------|------|
| **설명** | 복수 배송지 등록 및 관리 |
| **기능** | - 배송지 CRUD (주소, 상세주소, 수령인, 연락처)<br>- 기본 배송지 설정 (`is_default`)<br>- 배송지 별칭 (집, 회사 등)<br>- 공동현관 출입 정보 (잠금장치 유형, 비밀번호)<br>- 좌표 저장 (`GEOGRAPHY(POINT, 4326)`) |

#### FR-USR-004: 프로필 관리

| 항목 | 내용 |
|------|------|
| **설명** | 개인정보 조회 및 수정 |
| **기능** | - 이름, 이메일, 휴대폰 번호 수정<br>- 비밀번호 변경<br>- 회원 탈퇴 (소프트 삭제: `deleted_at` 설정) |

#### FR-USR-005: 사용자 상태 관리

| 항목 | 내용 |
|------|------|
| **상태** | `ACTIVE` → `INACTIVE`, `SUSPENDED`, `PENDING` |
| **규칙** | - 관리자에 의한 계정 정지 가능<br>- 정지 사유 기록 |

---

### 2.2 마트 모듈

> 관련 테이블: `stores`, `store_business_hours`
> 관련 ENUM: `store_status`, `store_active_status`

#### FR-STO-001: 마트 등록

| 항목 | 내용 |
|------|------|
| **설명** | 마트 사업주가 플랫폼에 입점 신청 |
| **입력** | 마트명, 카테고리, 사업자등록번호, 대표자명, 연락처, 주소, 소개글, 이미지 |
| **비즈니스 규칙** | - 사업자등록번호 유효성 검증<br>- 승인 모듈을 통한 심사 필요<br>- 좌표 자동 저장 (PostGIS) |
| **결과** | 마트 생성 (상태: `PENDING`) |

#### FR-STO-002: 마트 승인 프로세스

| 항목 | 내용 |
|------|------|
| **상태 흐름** | `PENDING` → `APPROVED` / `REJECTED` / `SUSPENDED` |
| **규칙** | - 서류 제출 완료 후 심사 진행<br>- 승인 시 `store_active_status` = `ACTIVE` |

#### FR-STO-003: 영업시간 관리

| 항목 | 내용 |
|------|------|
| **설명** | 요일별 영업시간 설정 |
| **기능** | - 요일별 오픈 시간, 마감 시간, 라스트오더 시간<br>- 휴무일 설정 (`is_closed`)<br>- 영업시간 외 주문 자동 거절 |

#### FR-STO-004: 마트 운영 상태

| 항목 | 내용 |
|------|------|
| **상태** | `ACTIVE` (영업중), `INACTIVE` (일시정지), `CLOSED` (폐점) |
| **규칙** | - 실시간 영업/휴무 토글<br>- `CLOSED` 상태에서는 상품 비노출 |

---

### 2.3 상품 모듈

> 관련 테이블: `categories`, `products`

#### FR-PRD-001: 카테고리 관리

| 항목 | 내용 |
|------|------|
| **설명** | 상품 카테고리 체계 |
| **카테고리** | 마트, 과일, 정육, 수산, 베이커리, 반찬, 생활용품, 간식, 음료, 유제품, 건강식품 (11개) |
| **구조** | 단일 레벨 (부모 카테고리 없음) |

#### FR-PRD-002: 상품 CRUD

| 항목 | 내용 |
|------|------|
| **설명** | 마트별 상품 등록/수정/삭제 |
| **입력** | 상품명, 가격, 할인가, 재고, 용량, 원산지, 설명, 이미지 URL |
| **비즈니스 규칙** | - 마트 소유자만 자기 마트 상품 관리 가능<br>- 소프트 삭제 (`deleted_at`)<br>- 할인율 설정 가능 |

#### FR-PRD-003: 재고 관리

| 항목 | 내용 |
|------|------|
| **설명** | 상품 재고 추적 |
| **기능** | - 재고 수량 증감<br>- 입고/출고 이력 관리<br>- 재고 부족 알림 임계값 설정 (기본 10개)<br>- 품절 시 자동 상태 변경 |

#### FR-PRD-004: 상품 검색 및 정렬

| 항목 | 내용 |
|------|------|
| **검색** | 상품명 한국어 검색 (PostgreSQL `pg_trgm` + GIN 인덱스) |
| **정렬** | 추천순, 신상품순, 판매량순, 가격 낮은순, 가격 높은순 |
| **필터** | 카테고리별, 마트별 |

---

### 2.4 주문 모듈

> 관련 테이블: `orders`, `store_orders`, `order_products`, `carts`, `cart_products`
> 관련 ENUM: `order_type`, `order_status`, `store_order_status`

#### FR-ORD-001: 장바구니

| 항목 | 내용 |
|------|------|
| **설명** | 멀티마트 장바구니 |
| **기능** | - 여러 마트의 상품을 한 장바구니에 담기<br>- 수량 조절 (+/-)<br>- 마트별 그룹 표시<br>- 마트별 선택 결제 (체크박스)<br>- 품절 상품 경고 표시<br>- 마트별 배달비 별도 표시 (3,000원/마트) |

#### FR-ORD-002: 주문 생성

| 항목 | 내용 |
|------|------|
| **설명** | 장바구니에서 주문 생성 |
| **입력** | 배송지, 결제수단, 배달시간대, 배달 요청사항 |
| **배달 시간대** | 08:00~11:00 / 11:00~14:00 / 14:00~17:00 / 17:00~20:00 (4슬롯) |
| **비즈니스 규칙** | - 멀티마트 주문 자동 분할: `orders` → `store_orders` → `order_products`<br>- 주문 시점 상품 가격 스냅샷 (`unit_price`)<br>- 주문 유형: `REGULAR` (일반), `SUBSCRIPTION` (구독) |

#### FR-ORD-003: 주문 상태 추적 (고객)

| 항목 | 내용 |
|------|------|
| **설명** | 실시간 주문 상태 확인 |
| **6단계** | 주문접수(`PENDING`) → 상품준비(`ACCEPTED`) → 픽업대기(`READY`) → 픽업완료(`PICKED_UP`) → 배송중(`DELIVERING`) → 배송완료(`DELIVERED`) |
| **기능** | - 단계별 아이콘 + 타임라인 표시<br>- 멀티마트 주문 시 마트별 개별 추적<br>- 예상 배달 시간(ETA) 표시<br>- 라이더 정보 표시<br>- 지도 시뮬레이션 (배달 경로 시각화) |

#### FR-ORD-004: 마트측 주문 처리

| 항목 | 내용 |
|------|------|
| **설명** | 마트에서 주문 수락/거절 |
| **기능** | - 신규 주문 알림<br>- 주문 수락 → 상품 준비 시작<br>- 주문 거절 (사유 선택: 재고 부족, 영업종료, 기타)<br>- 5분 내 미응답 시 자동 거절<br>- 영업시간 외 자동 거절<br>- 준비 완료 → 픽업 대기 상태 전환 |

#### FR-ORD-005: 주문 취소

| 항목 | 내용 |
|------|------|
| **설명** | 주문 취소 처리 |
| **비즈니스 규칙** | - `PENDING` 상태에서만 고객 취소 가능<br>- 마트측 거절은 모든 준비 전 단계에서 가능<br>- 멀티마트 주문의 부분 취소 지원 (`PARTIAL_CANCELLED`)<br>- 취소 시 자동 환불 처리 |

#### FR-ORD-006: 주문 이력 관리

| 항목 | 내용 |
|------|------|
| **설명** | 과거 주문 조회 |
| **기능** | - 주문 목록 (날짜, 마트, 상태, 금액)<br>- 상태별 색상 코딩 (완료: 녹색, 취소: 빨강)<br>- 상품명 검색<br>- 주문 상세 (상품 내역, 배달 정보)<br>- 영수증 조회<br>- 재주문 기능 |

---

### 2.5 결제 모듈

> 관련 테이블: `payments`, `payment_refunds`, `payment_methods`
> 관련 ENUM: `payment_method_type`, `payment_status`

#### FR-PAY-001: 결제 수단 관리

| 항목 | 내용 |
|------|------|
| **설명** | 결제 수단 등록 및 관리 |
| **지원 수단** | 카드(`CARD`), 카카오페이(`KAKAO_PAY`), 네이버페이(`NAVER_PAY`), 토스페이(`TOSS_PAY`) |
| **기능** | - 결제 수단 등록/삭제<br>- 기본 결제 수단 설정 (`is_default`)<br>- 카드 마스킹 표시 (마지막 4자리) |

#### FR-PAY-002: 결제 처리

| 항목 | 내용 |
|------|------|
| **설명** | 주문 결제 실행 |
| **상태 흐름** | `PENDING` → `COMPLETED` / `FAILED` / `CANCELLED` |
| **비즈니스 규칙** | - 결제 금액 = 상품 합계 + 마트별 배달비<br>- PG사 연동 (외부 결제 게이트웨이)<br>- 결제 실패 시 재시도 안내 |

#### FR-PAY-003: 환불

| 항목 | 내용 |
|------|------|
| **설명** | 주문 취소에 따른 환불 처리 |
| **유형** | 전체 환불 (`REFUNDED`), 부분 환불 (`PARTIAL_REFUNDED`) |
| **비즈니스 규칙** | - 마트주문 단위 부분 환불<br>- 환불 금액, 사유 기록<br>- PG사 환불 API 연동 |

---

### 2.6 배달 모듈

> 관련 테이블: `riders`, `deliveries`, `rider_locations`, `delivery_photos`
> 관련 ENUM: `rider_operation_status`, `delivery_status`

#### FR-DLV-001: 라이더 등록

| 항목 | 내용 |
|------|------|
| **설명** | 배달원 가입 |
| **입력** | 운송 수단 유형, 차량 번호, 면허 정보 |
| **비즈니스 규칙** | - 승인 모듈을 통한 신원 확인 필요<br>- 주민 배달원 프로그램 참여 여부 선택 |

#### FR-DLV-002: 온라인 상태 관리

| 항목 | 내용 |
|------|------|
| **설명** | 배달 가능 상태 토글 |
| **상태** | `ONLINE` (운행 중), `OFFLINE` (운행 불가) |
| **비즈니스 규칙** | - 진행 중 배달이 있으면 오프라인 전환 불가<br>- 상태 전환 시 팝업 알림 (운행 시작/종료 메시지) |

#### FR-DLV-003: 배달 수락 및 진행

| 항목 | 내용 |
|------|------|
| **설명** | 주변 배달 요청 확인 및 수락 |
| **기능** | - 주변 배달 요청 리스트 (매장명, 주소, 목적지, 거리, 배달비)<br>- 배달 수락 버튼<br>- 최대 동시 진행 3건 제한 (초과 시 경고)<br>- 지도 시뮬레이터 (경로 시각화) |

#### FR-DLV-004: 배달 단계 진행

| 항목 | 내용 |
|------|------|
| **설명** | 4단계 배달 프로세스 |
| **단계** | 수락(`ACCEPTED`) → 픽업 완료(`PICKED_UP`) → 배송 시작(`DELIVERING`) → 배송 완료(`DELIVERED`) |
| **기능** | - 4단계 Step Indicator (원형 + 연결선)<br>- 각 단계별 버튼 텍스트 변경<br>- 픽업지/목적지 주소 표시<br>- 고객 연락처 표시 |

#### FR-DLV-005: 배달 완료 인증

| 항목 | 내용 |
|------|------|
| **설명** | 사진으로 배달 완료 증명 |
| **비즈니스 규칙** | - 배송 완료 시 사진 업로드 **필수**<br>- 카메라 직접 촬영 또는 갤러리 선택<br>- 사진 없이 완료 처리 불가<br>- 배달 완료 후 수익 즉시 적립 + 상단 알림 배너 |

#### FR-DLV-006: 실시간 위치 추적

| 항목 | 내용 |
|------|------|
| **설명** | 라이더 GPS 위치 전송 |
| **기능** | - 3~5초 간격 위치 갱신<br>- PostGIS `GEOGRAPHY(POINT, 4326)` 저장<br>- 배달 중인 주문과 연결<br>- 고객에게 배달 경로 실시간 표시 |

#### FR-DLV-007: 고객 메시지 전송

| 항목 | 내용 |
|------|------|
| **설명** | 라이더가 고객에게 정형 메시지 전송 |
| **템플릿** | - "조금 뒤 도착 예정입니다. 잠시만 기다려주세요!"<br>- "매장 픽업이 다소 지연되고 있습니다. 죄송합니다."<br>- "도착했습니다! 문 앞에 두고 갈게요. 맛있게 드세요!"<br>- "벨을 누르지 말아달라는 요청 확인했습니다. 조용히 배송할게요." |

#### FR-DLV-008: 운송 수단 관리

| 항목 | 내용 |
|------|------|
| **설명** | 복수 운송 수단 등록 |
| **유형** | 도보(🚶), 자전거(🚲), 오토바이(🛵), 승용차(🚗) |
| **비즈니스 규칙** | - 도보/자전거: 자유 등록<br>- 오토바이/승용차: 면허 심사 필요<br>- 현재 사용 중 수단 선택<br>- 사용 중 수단은 삭제 불가 |

#### FR-DLV-009: 주민 배달원 프로그램

| 항목 | 내용 |
|------|------|
| **설명** | 동네 주민 대상 배달원 프로그램 |
| **기능** | - 주민 배달원 뱃지 표시<br>- 별도 가입 절차 (신원 확인, 위치 확인) |

---

### 2.7 구독 모듈

> 관련 테이블: `subscription_products`, `subscription_product_items`, `subscriptions`, `subscription_day_of_week`, `subscription_history`
> 관련 ENUM: `subscription_product_status`, `subscription_status`, `sub_history_status`

#### FR-SUB-001: 구독 상품 관리 (마트측)

| 항목 | 내용 |
|------|------|
| **설명** | 마트에서 구독 상품 생성 |
| **입력** | 구독명, 설명, 월 가격, 월 배달 횟수, 포함 상품 목록 |
| **비즈니스 규칙** | - 구독 상품 활성/비활성 토글 (`ACTIVE`/`INACTIVE`)<br>- 포함 상품 설정 (`subscription_product_items`)<br>- 구독 신청 목록 확인 및 승인/거절 |

#### FR-SUB-002: 구독 신청 (고객측)

| 항목 | 내용 |
|------|------|
| **설명** | 고객이 구독 상품 신청 |
| **입력** | 구독 상품 선택, 배송지, 결제 수단, 배달 요일 |
| **비즈니스 규칙** | - 요일별 배달 스케줄 설정 (`subscription_day_of_week`)<br>- 복합 PK: 구독 ID + 요일<br>- 마트 승인 후 구독 시작 |

#### FR-SUB-003: 구독 상태 관리

| 항목 | 내용 |
|------|------|
| **상태 흐름** | `ACTIVE` → `PAUSED` → `CANCELLATION_PENDING` → `CANCELLED` |
| **기능** | - 구독 일시정지<br>- 구독 해지 예약 (다음 결제일에 해지)<br>- 구독 이력 조회 (다음 결제일, 배달 빈도, 포함 상품) |

#### FR-SUB-004: 구독 이력

| 항목 | 내용 |
|------|------|
| **설명** | 구독 배달 사이클 기록 |
| **상태** | `SCHEDULED` (예정) → `ORDERED` (주문생성) → `COMPLETED` (완료) / `SKIPPED` (건너뛰기) |
| **비즈니스 규칙** | - 자동 주문 생성 (`store_orders` 연결)<br>- 건너뛰기 기능 |

---

### 2.8 리뷰 모듈

> 관련 테이블: `reviews`

#### FR-REV-001: 리뷰 작성

| 항목 | 내용 |
|------|------|
| **설명** | 배달 완료 주문에 대한 리뷰 |
| **입력** | 별점 (1~5), 리뷰 내용 (TEXT), 사진 (선택) |
| **비즈니스 규칙** | - `store_orders` 단위로 리뷰 작성<br>- 배달 완료 상태에서만 작성 가능<br>- 주문당 1개 리뷰<br>- 수정 시 "수정됨" 표시 |

#### FR-REV-002: 리뷰 관리

| 항목 | 내용 |
|------|------|
| **기능** | - 리뷰 수정/삭제<br>- 리뷰 신고 (부적절한 내용)<br>- 마트별 평균 별점 집계<br>- 최신순 정렬 |

---

### 2.9 정산 모듈

> 관련 테이블: `settlements`, `settlement_details`
> 관련 ENUM: `settlement_target_type`, `settlement_status`

#### FR-SET-001: 마트 정산

| 항목 | 내용 |
|------|------|
| **설명** | 마트 매출 정산 |
| **주기** | 월 단위 |
| **기능** | - 정산 기간별 매출 조회<br>- 정산 상태: `PENDING` → `COMPLETED` / `FAILED`<br>- 정산 금액 = 주문 금액 - 플랫폼 수수료<br>- 정산 계좌 정보 관리 |

#### FR-SET-002: 라이더 정산

| 항목 | 내용 |
|------|------|
| **설명** | 라이더 배달 수수료 정산 |
| **주기** | 주 단위 (매주 수요일) |
| **기능** | - 오늘/주간 수익 실시간 표시<br>- 정산 기록 리스트 (기간, 금액, 건수, 입금 상태)<br>- 정산 상세 확장 (배달 건수)<br>- 건별 영수증 조회 |

#### FR-SET-003: 정산 상세

| 항목 | 내용 |
|------|------|
| **설명** | 정산 건별 상세 내역 |
| **데이터** | - `store_orders` 단위 상세<br>- 주문 금액, 플랫폼 수수료, 배달비<br>- 정산 금액 계산 |

---

### 2.10 승인 관리 모듈

> 관련 테이블: `approvals`, `approval_documents`
> 관련 ENUM: `applicant_type`, `approval_status`, `document_type`

#### FR-APR-001: 입점/가입 승인

| 항목 | 내용 |
|------|------|
| **설명** | 마트/라이더 입점 승인 프로세스 |
| **대상** | 마트(`STORE`), 라이더(`RIDER`) |
| **상태** | `PENDING` → `APPROVED` / `REJECTED` / `HELD` |
| **비즈니스 규칙** | - 관리자가 승인/거절/보류 처리<br>- 거절/보류 사유 기록 (`rejection_reason`) |

#### FR-APR-002: 서류 제출

| 항목 | 내용 |
|------|------|
| **설명** | 승인에 필요한 서류 업로드 |
| **서류 유형** | `BUSINESS_LICENSE` (사업자등록증), `BUSINESS_REPORT` (사업자보고서), `BANK_PASSBOOK` (통장사본), `ID_CARD` (신분증) |
| **비즈니스 규칙** | - 서류별 파일 URL 저장<br>- 승인 건당 복수 서류 첨부 가능 |

---

### 2.11 기타 모듈

> 관련 테이블: `notifications`, `notification_broadcasts`, `reports`, `inquiries`, `notices`, `banners`, `promotions`, `promotion_products`
> 관련 ENUM: `notification_ref_type`, `broadcast_ref_type`, `report_target_type`, `report_status`, `inquiry_category`, `inquiry_status`, `content_status`, `promotion_status`

#### FR-NTF-001: 개인 알림

| 항목 | 내용 |
|------|------|
| **설명** | 사용자별 알림 |
| **유형** | 주문 알림, 배달 알림, 프로모션 알림 |
| **참조 유형** | `RIDER`, `STORE`, `CUSTOMER`, `ORDER`, `DELIVERY`, `PROMOTION` |
| **기능** | - 알림 목록 (읽음/안읽음)<br>- 읽음 처리<br>- 전체 삭제<br>- 안읽은 알림 뱃지 카운트 |

#### FR-NTF-002: 전체 공지 브로드캐스트

| 항목 | 내용 |
|------|------|
| **설명** | 역할 그룹 또는 전체 사용자에게 공지 |
| **대상** | `RIDER`, `STORE`, `CUSTOMER`, `ALL` |
| **기능** | - 제목, 내용, 대상 그룹 지정<br>- 전체 발송 |

#### FR-RPT-001: 신고

| 항목 | 내용 |
|------|------|
| **설명** | 마트/라이더/고객 신고 |
| **대상** | `STORE`, `RIDER`, `CUSTOMER` |
| **입력** | 신고 대상 선택, 신고 사유 (텍스트) |
| **상태** | `PENDING` (접수) → `RESOLVED` (처리완료) |
| **비즈니스 규칙** | - `store_orders` 기반 신고 (주문번호 연결)<br>- 관리자가 처리 완료 |

#### FR-INQ-001: 1:1 문의

| 항목 | 내용 |
|------|------|
| **설명** | 고객지원 문의 |
| **카테고리** | `ORDER_PAYMENT` (주문/결제), `CANCELLATION_REFUND` (취소/환불), `DELIVERY` (배달), `SERVICE` (서비스), `OTHER` (기타) |
| **상태** | `PENDING` (대기) → `ANSWERED` (답변 완료) |
| **기능** | - 제목, 카테고리, 내용 입력<br>- 답변 확인 |

#### FR-NTC-001: 공지사항

| 항목 | 내용 |
|------|------|
| **설명** | 플랫폼 공지사항 |
| **기능** | - 제목, 내용, 작성자<br>- 상단 고정 (`is_pinned`)<br>- 정렬 순서 (`sort_order`)<br>- 활성/비활성 (`content_status`) |

#### FR-BNR-001: 배너 관리

| 항목 | 내용 |
|------|------|
| **설명** | 메인 화면 배너/히어로 슬라이드 |
| **기능** | - 배너 이미지, 제목, 링크 URL<br>- 노출 기간 설정 (시작일~종료일)<br>- 정렬 순서, 활성/비활성 |

#### FR-PRM-001: 프로모션

| 항목 | 내용 |
|------|------|
| **설명** | 이벤트/프로모션 관리 |
| **기능** | - 프로모션명, 설명, 할인율/할인금액<br>- 노출 기간 설정<br>- 프로모션 상품 연결 (`promotion_products`)<br>- 상태: `ACTIVE` / `ENDED` |

#### FR-CPN-001: 쿠폰 시스템

| 항목 | 내용 |
|------|------|
| **설명** | 할인 쿠폰 (프론트엔드 mockData 기반) |
| **기능** | - 할인율 또는 정액 할인<br>- 최소 주문 금액 조건<br>- 유효기간<br>- 쿠폰 상태 (사용가능, 사용완료, 만료) |

#### FR-PNT-001: 포인트 시스템

| 항목 | 내용 |
|------|------|
| **설명** | 적립 포인트 (프론트엔드 mockData 기반) |
| **기능** | - 포인트 잔액 표시<br>- 주문 시 포인트 적립/사용 |

---

## 3. 역할별 화면 구성

### 3.1 고객 (CUSTOMER)

| 화면 | 주요 기능 | 관련 컴포넌트 |
|------|----------|-------------|
| **홈** | 히어로 배너, 카테고리, 마트 그리드 | `Hero.jsx`, `CategorySidebar.jsx`, `StoreGrid.jsx` |
| **마트 상세** | 상품 목록, 리뷰, 구독상품 | `StoreDetailView.jsx`, `StoreDetailModal.jsx` |
| **장바구니** | 멀티마트 카트, 수량 조절 | `CartModal.jsx` |
| **결제** | 배송지, 결제수단, 시간대 선택 | `CheckoutView.jsx` |
| **주문추적** | 6단계 실시간 추적, 지도 | `OrderTrackingView.jsx` |
| **마이페이지** | 주문이력, 구독관리, 프로필, 배송지 | `OrderManagementView.jsx` |
| **검색결과** | 마트/상품 검색 | `SearchResultsView.jsx` |
| **고객지원** | 공지, FAQ, 1:1 문의 | `SupportView.jsx`, `InquiryModal.jsx` |

### 3.2 마트 (STORE)

| 화면 | 주요 기능 | 관련 컴포넌트 |
|------|----------|-------------|
| **대시보드** | 운영 상태, 주문 요약 | `StoreDashboard.jsx` |
| **주문 관리** | 신규/진행중/완료 주문 탭 | `StoreDashboard.jsx` |
| **상품 관리** | 상품 CRUD, 재고 관리 | `StoreDashboard.jsx` |
| **구독 관리** | 구독상품 생성, 구독자 승인 | `StoreDashboard.jsx` |
| **리뷰 관리** | 리뷰 확인, 답변 | `StoreDashboard.jsx` |
| **정산** | 월별 정산 조회 | `StoreDashboard.jsx` |
| **설정** | 영업시간, 마트 정보 | `StoreDashboard.jsx` |

### 3.3 라이더 (RIDER)

| 화면 | 주요 기능 | 관련 컴포넌트 |
|------|----------|-------------|
| **홈** | 오늘 수익, 진행중 배달, 주변 요청 | `RiderDashboard.jsx` |
| **히스토리** | 배달 이력, 기간 필터, 영수증 | `RiderDashboard.jsx` |
| **정산** | 주간 정산, 정산 기록 | `RiderDashboard.jsx` |
| **계정** | 신원 확인, 운송수단 관리 | `RiderDashboard.jsx` |
| **로그인** | 라이더 전용 로그인 | `RiderDashboard.jsx` |

### 3.4 관리자 (ADMIN)

| 화면 | 주요 기능 | 관련 컴포넌트 |
|------|----------|-------------|
| **대시보드** | 플랫폼 모니터링, 통계 | `AdminDashboard.jsx` |
| **사용자 관리** | 고객 목록, 상태 변경 | `AdminDashboard.jsx` |
| **마트 관리** | 마트 목록, 승인/정지 | `AdminDashboard.jsx` |
| **라이더 관리** | 라이더 목록, 상태 관리 | `AdminDashboard.jsx` |
| **신고 관리** | 신고 목록, 처리 | `AdminDashboard.jsx` |

---

## 4. 사용자 플로우

### 4.1 주문 플로우 (고객)

```
[마트 검색/탐색]
     ↓
[마트 상세 → 상품 선택 → 장바구니 담기]
     ↓
[장바구니 → 마트별 선택]
     ↓
[결제 페이지]
  ├─ 배송지 선택/변경
  ├─ 결제 수단 선택
  ├─ 배달 시간대 선택 (4슬롯)
  └─ 배달 요청사항 입력
     ↓
[결제 완료]
     ↓
[주문 추적 (6단계)]
  1. 주문 접수 → 2. 상품 준비 → 3. 픽업 대기
  → 4. 픽업 완료 → 5. 배송 중 → 6. 배송 완료
     ↓
[리뷰 작성] (선택)
```

### 4.2 구독 플로우 (고객)

```
[마트 상세 → 구독 상품 탭]
     ↓
[구독 상품 선택]
     ↓
[구독 신청]
  ├─ 배송지 선택
  ├─ 결제 수단 선택
  └─ 배달 요일 선택
     ↓
[마트 승인 대기]
     ↓
[구독 활성화]
     ↓
[자동 주문 생성 (요일별)]
     ↓
[구독 관리 (일시정지/해지)]
```

### 4.3 마트 운영 플로우

```
[운영 상태 ON]
     ↓
[신규 주문 수신 알림]
     ↓
[주문 확인]
  ├─ [수락] → 상품 준비 → 준비 완료 → 픽업 대기
  └─ [거절] → 사유 입력 → 자동 환불
     ↓
[라이더 배정 (플랫폼)]
     ↓
[라이더 픽업 → 배달]
     ↓
[배달 완료 → 정산 대기]
```

### 4.4 배달 플로우 (라이더)

```
[온라인 전환]
     ↓
[주변 배달 요청 수신]
     ↓
[배달 수락] (최대 3건)
     ↓
[4단계 진행]
  1. 수락 → [픽업 완료 버튼]
  2. 픽업 → [배송 시작 버튼]
  3. 배송 중 → [배송 완료 버튼]
  4. 사진 인증 → [제출]
     ↓
[배달 완료]
  ├─ 수익 즉시 적립
  └─ 완료 알림 배너
```

### 4.5 관리자 운영 플로우

```
[대시보드 모니터링]
     ↓
[입점 심사]
  ├─ 마트: 서류 확인 → 승인/거절/보류
  └─ 라이더: 신원 확인 → 승인/거절/보류
     ↓
[신고 처리]
  └─ 신고 확인 → 조치 (정지/경고) → 처리 완료
     ↓
[상태 관리]
  ├─ 사용자 정지/활성
  ├─ 마트 정지/활성
  └─ 라이더 정지/활성
```

---

## 5. 비기능 요구사항

### 5.1 위치 기반 서비스

| 항목 | 내용 |
|------|------|
| **기술** | PostgreSQL PostGIS 3.4, `GEOGRAPHY(POINT, 4326)` |
| **적용** | 배송지 좌표, 마트 좌표, 주문 배송 좌표, 라이더 위치 |
| **기능** | - 반경 3km 내 마트 필터링 (GIST 인덱스)<br>- 라이더-매장/고객 간 거리 계산<br>- 실시간 위치 갱신 |

### 5.2 검색

| 항목 | 내용 |
|------|------|
| **기술** | PostgreSQL `pg_trgm` 확장 + GIN 인덱스 |
| **적용** | 상품명 검색 (`products.name`) |
| **특징** | 한국어 부분 문자열 매칭 지원 |

### 5.3 실시간 통신

| 항목 | 내용 |
|------|------|
| **용도** | 주문 상태 변경, 라이더 위치 갱신, 새 배달 요청 알림 |
| **방식** | WebSocket 또는 SSE (Server-Sent Events) |

### 5.4 데이터 정합성

| 항목 | 내용 |
|------|------|
| **소프트 삭제** | 모든 주요 테이블에 `deleted_at` 필드 |
| **감사 추적** | 모든 테이블에 `created_at`, `updated_at` 자동 관리 (트리거) |
| **FK 정합성** | 테이블별 `ON DELETE` 정책: `CASCADE`, `RESTRICT`, `SET NULL` |

### 5.5 보안

| 항목 | 내용 |
|------|------|
| **인증** | 이메일/비밀번호 + OAuth 2.0 소셜 로그인 |
| **인가** | 역할 기반 접근 제어 (RBAC), N:M 역할 모델 |
| **개인정보** | 고객 이름 마스킹 (김*수), 전화번호 부분 마스킹 (****1234) |
| **결제** | PG사 연동, 카드번호 마스킹 |

### 5.6 UI/UX

| 항목 | 내용 |
|------|------|
| **디자인 시스템** | CSS Custom Properties 기반 디자인 토큰 |
| **Primary 색상** | Emerald Green (#10b981) |
| **한국어 폰트** | Pretendard |
| **반응형** | 모바일 우선 (max-width: 500px 기준) |
| **다크 모드** | 라이더 앱 전용 (#0f172a 배경) |
| **애니메이션** | CSS transition, @keyframes (pulse, slideDown, popup) |

---

## 6. 데이터 요구사항

### 6.1 ERD v4.1 기준 모듈별 테이블 매핑

| 모듈 | 테이블 | 수 |
|------|--------|---|
| 사용자 | `users`, `roles`, `user_roles`, `addresses`, `social_logins` | 5 |
| 마트 | `stores`, `store_business_hours` | 2 |
| 상품 | `categories`, `products` | 2 |
| 주문 | `orders`, `store_orders`, `order_products`, `carts`, `cart_products` | 5 |
| 결제 | `payments`, `payment_refunds`, `payment_methods` | 3 |
| 배달 | `riders`, `deliveries`, `rider_locations`, `delivery_photos` | 4 |
| 구독 | `subscription_products`, `subscription_product_items`, `subscriptions`, `subscription_day_of_week`, `subscription_history` | 5 |
| 리뷰 | `reviews` | 1 |
| 정산 | `settlements`, `settlement_details` | 2 |
| 승인 | `approvals`, `approval_documents` | 2 |
| 기타 | `notifications`, `notification_broadcasts`, `reports`, `inquiries`, `notices`, `banners`, `promotions`, `promotion_products` | 8 |
| **합계** | | **39** |

### 6.2 ENUM 상태 정의 (29개)

#### 사용자 모듈

| ENUM | 값 | 설명 |
|------|----|------|
| `user_status` | `ACTIVE`, `INACTIVE`, `SUSPENDED`, `PENDING` | 사용자 상태 |
| `social_provider` | `KAKAO`, `NAVER`, `GOOGLE`, `APPLE` | 소셜 로그인 제공자 |

#### 마트 모듈

| ENUM | 값 | 설명 |
|------|----|------|
| `store_status` | `PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED` | 마트 승인 상태 |
| `store_active_status` | `ACTIVE`, `INACTIVE`, `CLOSED` | 마트 운영 상태 |

#### 주문 모듈

| ENUM | 값 | 설명 |
|------|----|------|
| `order_type` | `REGULAR`, `SUBSCRIPTION` | 주문 유형 |
| `order_status` | `PENDING`, `PAID`, `PARTIAL_CANCELLED`, `CANCELLED`, `COMPLETED` | 통합 주문 상태 |
| `store_order_status` | `PENDING`, `ACCEPTED`, `READY`, `PICKED_UP`, `DELIVERING`, `DELIVERED`, `CANCELLED`, `REJECTED` | 마트별 주문 상태 (8단계) |

#### 결제 모듈

| ENUM | 값 | 설명 |
|------|----|------|
| `payment_method_type` | `CARD`, `KAKAO_PAY`, `NAVER_PAY`, `TOSS_PAY` | 결제 수단 유형 |
| `payment_status` | `PENDING`, `COMPLETED`, `FAILED`, `CANCELLED`, `PARTIAL_REFUNDED`, `REFUNDED` | 결제 상태 |

#### 배달 모듈

| ENUM | 값 | 설명 |
|------|----|------|
| `rider_operation_status` | `OFFLINE`, `ONLINE` | 라이더 운행 상태 |
| `delivery_status` | `REQUESTED`, `ACCEPTED`, `PICKED_UP`, `DELIVERING`, `DELIVERED`, `CANCELLED` | 배달 상태 |

#### 구독 모듈

| ENUM | 값 | 설명 |
|------|----|------|
| `subscription_product_status` | `ACTIVE`, `INACTIVE` | 구독 상품 상태 |
| `subscription_status` | `ACTIVE`, `PAUSED`, `CANCELLATION_PENDING`, `CANCELLED` | 구독 상태 |
| `sub_history_status` | `SCHEDULED`, `ORDERED`, `SKIPPED`, `COMPLETED` | 구독 이력 상태 |

#### 정산 모듈

| ENUM | 값 | 설명 |
|------|----|------|
| `settlement_target_type` | `STORE`, `RIDER` | 정산 대상 유형 |
| `settlement_status` | `PENDING`, `COMPLETED`, `FAILED` | 정산 상태 |

#### 승인 모듈

| ENUM | 값 | 설명 |
|------|----|------|
| `applicant_type` | `STORE`, `RIDER` | 승인 신청자 유형 |
| `approval_applicant_type` | `MART`, `RIDER` | 승인 대상 유형 |
| `approval_status` | `PENDING`, `APPROVED`, `REJECTED`, `HELD` | 승인 상태 |
| `document_type` | `BUSINESS_LICENSE`, `BUSINESS_REPORT`, `BANK_PASSBOOK`, `ID_CARD` | 서류 유형 |

#### 기타 모듈

| ENUM | 값 | 설명 |
|------|----|------|
| `notification_ref_type` | `RIDER`, `STORE`, `CUSTOMER`, `ORDER`, `DELIVERY`, `PROMOTION` | 알림 참조 유형 |
| `broadcast_ref_type` | `RIDER`, `STORE`, `CUSTOMER`, `ALL` | 브로드캐스트 대상 |
| `report_target_type` | `STORE`, `RIDER`, `CUSTOMER` | 신고 대상 유형 |
| `report_status` | `PENDING`, `RESOLVED` | 신고 처리 상태 |
| `inquiry_category` | `ORDER_PAYMENT`, `CANCELLATION_REFUND`, `DELIVERY`, `SERVICE`, `OTHER` | 문의 카테고리 |
| `inquiry_status` | `PENDING`, `ANSWERED` | 문의 상태 |
| `content_status` | `ACTIVE`, `INACTIVE` | 콘텐츠 활성 상태 |
| `promotion_status` | `ACTIVE`, `ENDED` | 프로모션 상태 |

---

## 7. 기능 요구사항 × 테이블 매핑 검증

| 기능 ID | 기능명 | 관련 테이블 |
|---------|--------|------------|
| FR-USR-001 | 회원가입 | `users`, `roles`, `user_roles` |
| FR-USR-002 | 소셜 로그인 | `social_logins` |
| FR-USR-003 | 배송지 관리 | `addresses` |
| FR-USR-004 | 프로필 관리 | `users` |
| FR-USR-005 | 사용자 상태 관리 | `users` |
| FR-STO-001 | 마트 등록 | `stores` |
| FR-STO-002 | 마트 승인 | `stores`, `approvals` |
| FR-STO-003 | 영업시간 관리 | `store_business_hours` |
| FR-STO-004 | 마트 운영 상태 | `stores` |
| FR-PRD-001 | 카테고리 관리 | `categories` |
| FR-PRD-002 | 상품 CRUD | `products` |
| FR-PRD-003 | 재고 관리 | `products` |
| FR-PRD-004 | 상품 검색/정렬 | `products`, `categories` |
| FR-ORD-001 | 장바구니 | `carts`, `cart_products` |
| FR-ORD-002 | 주문 생성 | `orders`, `store_orders`, `order_products` |
| FR-ORD-003 | 주문 상태 추적 | `store_orders` |
| FR-ORD-004 | 마트측 주문 처리 | `store_orders` |
| FR-ORD-005 | 주문 취소 | `orders`, `store_orders` |
| FR-ORD-006 | 주문 이력 관리 | `orders`, `store_orders`, `order_products` |
| FR-PAY-001 | 결제 수단 관리 | `payment_methods` |
| FR-PAY-002 | 결제 처리 | `payments` |
| FR-PAY-003 | 환불 | `payment_refunds` |
| FR-DLV-001 | 라이더 등록 | `riders` |
| FR-DLV-002 | 온라인 상태 관리 | `riders` |
| FR-DLV-003 | 배달 수락 | `deliveries` |
| FR-DLV-004 | 배달 단계 진행 | `deliveries` |
| FR-DLV-005 | 배달 완료 인증 | `delivery_photos` |
| FR-DLV-006 | 실시간 위치 추적 | `rider_locations` |
| FR-DLV-007 | 고객 메시지 전송 | (앱 내 기능, 별도 테이블 없음) |
| FR-DLV-008 | 운송 수단 관리 | `riders` |
| FR-DLV-009 | 주민 배달원 | `riders` |
| FR-SUB-001 | 구독 상품 관리 | `subscription_products`, `subscription_product_items` |
| FR-SUB-002 | 구독 신청 | `subscriptions`, `subscription_day_of_week` |
| FR-SUB-003 | 구독 상태 관리 | `subscriptions` |
| FR-SUB-004 | 구독 이력 | `subscription_history` |
| FR-REV-001 | 리뷰 작성 | `reviews` |
| FR-REV-002 | 리뷰 관리 | `reviews` |
| FR-SET-001 | 마트 정산 | `settlements`, `settlement_details` |
| FR-SET-002 | 라이더 정산 | `settlements`, `settlement_details` |
| FR-SET-003 | 정산 상세 | `settlement_details` |
| FR-APR-001 | 입점/가입 승인 | `approvals` |
| FR-APR-002 | 서류 제출 | `approval_documents` |
| FR-NTF-001 | 개인 알림 | `notifications` |
| FR-NTF-002 | 전체 공지 브로드캐스트 | `notification_broadcasts` |
| FR-RPT-001 | 신고 | `reports` |
| FR-INQ-001 | 1:1 문의 | `inquiries` |
| FR-NTC-001 | 공지사항 | `notices` |
| FR-BNR-001 | 배너 관리 | `banners` |
| FR-PRM-001 | 프로모션 | `promotions`, `promotion_products` |

> **검증 결과**: 39개 테이블 모두 최소 1개 이상의 기능 요구사항에 매핑됨

---

## 부록 A: 용어 사전

| 용어 | 설명 |
|------|------|
| **동네마켓** | 플랫폼 서비스명 |
| **마트** | 동네 소규모 식료품 판매점 (정육점, 과일가게, 마트 등 포함) |
| **라이더** | 배달원 (도보, 자전거, 오토바이, 승용차) |
| **주민 배달원** | 동네 거주 주민이 겸업으로 배달하는 라이더 |
| **멀티마트 주문** | 여러 마트의 상품을 하나의 주문으로 결제하는 기능 |
| **구독** | 정해진 요일에 자동으로 상품이 배달되는 정기 배달 서비스 |
| **정산** | 플랫폼이 마트/라이더에게 수익을 지급하는 프로세스 |
| **승인** | 마트/라이더가 플랫폼에 입점/가입할 때 서류 심사 프로세스 |
| **스토어 오더** | 멀티마트 주문에서 마트별로 분할된 개별 주문 단위 |
| **소프트 삭제** | 데이터를 물리적으로 삭제하지 않고 `deleted_at` 타임스탬프를 설정하는 방식 |

## 부록 B: 관련 문서

| 문서 | 경로 | 설명 |
|------|------|------|
| ERD v4.1 | `doc/v4.0/동네마켓_ERD_v4.1.md` | 39테이블 상세 정의 |
| 엔티티 설명서 v4.1 | `doc/v4.0/ERD_엔티티_설명서_v4.1.md` | 엔티티별 컬럼 상세 |
| DDL v4.1 | `doc/v4.0/동네마켓_DDL_v4.1.md` | PostgreSQL 16 DDL 스크립트 |
| JPA 엔티티 정의서 v4.1 | `doc/v4.0/동네마켓_JPA_엔티티_정의서_v4.1.md` | Spring Boot 3.x JPA 엔티티 |
| ERD 검증보고서 | `doc/v4.0/ERD_v4.1_검증보고서.md` | DBA 검증 결과 |
| Flutter 변환계획서 | `doc/v4.0/동네마켓_라이더앱_Flutter_변환계획서_v1.0.md` | 라이더 앱 모바일 변환 |
