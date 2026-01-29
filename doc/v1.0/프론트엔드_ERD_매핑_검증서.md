# 프론트엔드-ERD 매핑 검증서

> 작성일: 2026-01-28
> 대상: neighborhood-market-web 프론트엔드 ↔ ERD 엔티티 설명서(~ing)

---

## 1. 컴포넌트-엔티티 매핑 표

### 1.1 고객 뷰 (CustomerView 계열)

| 컴포넌트 | 사용 엔티티 | 비고 |
|---------|-----------|------|
| CustomerView.jsx | orders, subscriptions, addresses, paymentMethods, cart, notifications | 탭 기반 메인 뷰 |
| StoreGrid.jsx | stores, categories | 마트 목록 |
| StoreDetailView.jsx / StoreDetailModal.jsx | stores, products, categories | 마트 상세 + 상품 목록 |
| CartModal.jsx | cart, cart_item, products, stores | 장바구니 |
| CheckoutView.jsx | orders, addresses, paymentMethods, cart | 결제 페이지 |
| OrderTrackingView.jsx | orders, deliveries, rider_locations | 실시간 추적 |
| OrderManagementView.jsx | orders, reviews | 주문 내역 |
| OrderDetailModal.jsx / OrderDetailFullModal.jsx | orders, order_items, stores | 주문 상세 |
| SearchResultsView.jsx | stores, products, categories | 검색 결과 |
| ReceiptModal.jsx | orders, payments | 영수증 |
| Hero.jsx | banners | Swiper 배너 |

### 1.2 마트 뷰 (StoreDashboard)

| 컴포넌트 | 사용 엔티티 | 비고 |
|---------|-----------|------|
| StoreDashboard.jsx | stores, products, orders, store_order, subscription_products, subscriptions, store_business_hours, reviews | 마트 대시보드 |
| StoreRegistrationView.jsx | stores, approval_documents | 마트 등록 |

### 1.3 배달원 뷰 (RiderDashboard)

| 컴포넌트 | 사용 엔티티 | 비고 |
|---------|-----------|------|
| RiderDashboard.jsx | riders, deliveries, orders, settlements | 배달원 대시보드 |
| RiderRegistrationView.jsx | riders, approval_documents | 배달원 등록 |

### 1.4 관리자 뷰 (AdminDashboard)

| 컴포넌트 | 사용 엔티티 | 비고 |
|---------|-----------|------|
| AdminDashboard.jsx | users, stores, riders, reports, store_approvals, rider_approvals, settlements, inquiries, notices, banners, promotions | 관리자 대시보드 |

### 1.5 공통 컴포넌트

| 컴포넌트 | 사용 엔티티 | 비고 |
|---------|-----------|------|
| Header.jsx | users, notifications | 헤더 (검색, 알림) |
| AuthModal.jsx | users, social_logins | 로그인/회원가입 |
| NotificationPanel.jsx | notifications | 알림 패널 |
| LocationModal.jsx | addresses | 배송지 선택 |
| SupportView.jsx | inquiries, faqs(ERD 미정의) | 고객지원 |
| InquiryModal.jsx | inquiries, inquiry_attachments | 1:1 문의 |

---

## 2. 필드 매핑 표 (프론트엔드 → DB 컬럼)

### 2.1 stores

| 프론트 필드 | DB 컬럼 | 타입 차이 | 비고 |
|-----------|---------|---------|------|
| id | store_id | number → PK(INT) | |
| name | store_name | string → VARCHAR | |
| category | category_id (FK) | string → FK | 프론트는 텍스트, DB는 FK |
| rate | average_rating | number → DECIMAL(2,1) | |
| reviews | review_count | number → INT | |
| time | - | string | DB에 없음 (배달 예상시간) |
| img | store_image | string → VARCHAR(URL) | |
| isOpen | is_delivery_available | boolean → BOOLEAN | |
| distance | - | number | 런타임 계산 (좌표 기반) |
| status | status | string → ENUM | 값 체계 다름 (정상/중지됨 vs APPROVED/SUSPENDED) |
| loc | address_line1 | string → VARCHAR | |
| rep | representative_name | string → VARCHAR | |
| phone | phone | string → VARCHAR | |
| bizNum | business_number | string → CHAR(10) | |
| bank | settlement_bank_name + settlement_bank_account | string → 분리 | 프론트는 합쳐서 표시 |

### 2.2 products

| 프론트 필드 | DB 컬럼 | 타입 차이 | 비고 |
|-----------|---------|---------|------|
| id | product_id | string → PK(INT) | |
| name | product_name | string → VARCHAR | |
| price | price | number/string → DECIMAL | 프론트에서 포맷팅 |
| category | category_id (FK) | string → FK | |
| img | product_images.image_url | string → 별도 테이블 | 프론트는 단일 필드, DB는 1:N |
| desc | description | string → TEXT | |
| stock | stock | number → INT | |
| isSoldOut | - | boolean | stock=0에서 파생 |
| origin | origin | string → VARCHAR | |
| discountRate | discount_rate | number → DECIMAL | |

### 2.3 orders

| 프론트 필드 | DB 컬럼 | 타입 차이 | 비고 |
|-----------|---------|---------|------|
| id | order_number | string → VARCHAR(UNIQUE) | |
| date | ordered_at | string → TIMESTAMP | |
| store | store_order.store_id → stores.store_name | string → FK 조인 | |
| items | - | string | order_items에서 집계 |
| product | - | string | order_items에서 조회 |
| price | final_price | string → DECIMAL | |
| status | status | string → ENUM | 값 체계 다름 (한글 vs 영문 ENUM) |
| img | - | string | 대표 상품 이미지 조인 |
| reviewWritten | reviews 존재 여부 | boolean → 조인 확인 | |
| customer | users.name | string → FK 조인 | |
| itemsList | order_items[] | array → 1:N 관계 | |
| prepTime | - | number | DB에 없음 (마트 설정) |

### 2.4 users

| 프론트 필드 | DB 컬럼 | 타입 차이 | 비고 |
|-----------|---------|---------|------|
| id | user_id | string → PK(INT) | |
| name | name | string → VARCHAR | |
| email | email | string → VARCHAR(UNIQUE) | |
| phone | phone | string → VARCHAR(UNIQUE) | |
| addresses | addresses[] | array → 1:N 관계 | |
| orders | COUNT(orders) | number → 집계 | |
| join | created_at | string → TIMESTAMP | |
| status | status | string → ENUM | 값 체계 다름 (활성 vs ACTIVE) |

### 2.5 riders

| 프론트 필드 | DB 컬럼 | 타입 차이 | 비고 |
|-----------|---------|---------|------|
| id | rider_id | string → PK(INT) | |
| name | users.name | string → FK 조인 | |
| status | operation_status | string → ENUM | 운행중 vs ONLINE |
| type | - | string | DB에 없음 (PROFESSIONAL/RESIDENT) |
| phone | users.phone | string → FK 조인 | |
| bankName | bank_name | string → VARCHAR | |
| accountNumber | bank_account | string → VARCHAR(암호화) | |
| accountHolder | account_holder | string → VARCHAR | |
| idCardStatus | id_card_verified | string → BOOLEAN | 프론트는 텍스트, DB는 boolean |

### 2.6 addresses

| 프론트 필드 | DB 컬럼 | 타입 차이 | 비고 |
|-----------|---------|---------|------|
| id | address_id | number → PK(INT) | |
| label | address_name | string → VARCHAR | |
| address | address_line1 | string → VARCHAR | |
| detail | address_line2 | string → VARCHAR | |
| contact | - | string | DB에 없음 (users.phone 사용) |
| isDefault | is_default | boolean → BOOLEAN | |
| entranceType | - | string | DB에 없음 |
| entrancePassword | - | string | DB에 없음 |

### 2.7 paymentMethods

| 프론트 필드 | DB 컬럼 | 타입 차이 | 비고 |
|-----------|---------|---------|------|
| id | method_id | number → PK(INT) | |
| type | method_type | string → ENUM | card vs CARD |
| name | card_company | string → VARCHAR | |
| number | card_number_masked | string → VARCHAR | |
| isDefault | is_default | boolean → BOOLEAN | |
| color | - | string | DB에 없음 (프론트 UI 전용) |

### 2.8 subscriptions (고객 구독)

| 프론트 필드 | DB 컬럼 | 타입 차이 | 비고 |
|-----------|---------|---------|------|
| id | subscription_id | number → PK(INT) | |
| name | subscription_products.subscription_product_name | string → FK 조인 | |
| period | - | string | cycle_count + 주기에서 파생 |
| price | total_amount | string → DECIMAL | |
| status | status | string → ENUM | 구독중 vs ACTIVE |
| nextPayment | next_payment_date | string → DATE | |
| monthlyCount | subscription_products.total_delivery_count | string → INT | |
| includedItems | subscription_items → products | array → 조인 | |

### 2.9 reviews

| 프론트 필드 | DB 컬럼 | 타입 차이 | 비고 |
|-----------|---------|---------|------|
| id | review_id | number → PK(INT) | |
| store | store_order → stores.store_name | string → FK 조인 | |
| date | created_at | string → TIMESTAMP | |
| rate | rating | number → TINYINT(1-5) | |
| content | content | string → VARCHAR(100) | |
| img | - | string | DB에 리뷰 이미지 필드 없음 |

### 2.10 notifications

| 프론트 필드 | DB 컬럼 | 타입 차이 | 비고 |
|-----------|---------|---------|------|
| id | notification_id | number → PK(INT) | |
| title | title | string → VARCHAR | |
| message | content | string → TEXT | 필드명 불일치 |
| time | sent_at | string → TIMESTAMP | 프론트는 상대시간 |
| unread | is_read | boolean → BOOLEAN | 의미 반전 (unread ↔ is_read) |

### 2.11 settlements

| 프론트 필드 | DB 컬럼 | 타입 차이 | 비고 |
|-----------|---------|---------|------|
| id | settlement_id | string → PK(INT) | |
| name | stores.store_name / users.name | string → FK 조인 | |
| type | target_type | string → ENUM | |
| amount | settlement_amount | number → DECIMAL | |
| date | settled_at | string → TIMESTAMP | |
| status | status | string → ENUM | 정산완료 vs COMPLETED |

### 2.12 reports

| 프론트 필드 | DB 컬럼 | 타입 차이 | 비고 |
|-----------|---------|---------|------|
| id | report_id | number → PK(INT) | |
| type | - | string | DB에 신고 유형 필드 없음 (reason_detail로 관리) |
| status | status | string → ENUM | 확인중 vs PENDING |
| time | created_at | string → TIMESTAMP | |
| content | reason_detail | string → TEXT | |
| reporter | reporter_id → users | object → FK 조인 | |
| reported | target_type + target_id | object → 다형성 FK | |

### 2.13 inquiries

| 프론트 필드 | DB 컬럼 | 타입 차이 | 비고 |
|-----------|---------|---------|------|
| id | inquiry_id | number → PK(INT) | |
| type | category | string → ENUM | 배송 문의 vs DELIVERY |
| title | title | string → VARCHAR | |
| content | content | string → TEXT | |
| user | users.name | string → FK 조인 | |
| date | created_at | string → TIMESTAMP | |
| status | status | string → ENUM | 답변대기 vs PENDING |
| answer | answer | string → TEXT | |

---

## 3. 미구현 엔티티 목록 (프론트엔드 미사용)

| # | ERD 엔티티 | 모듈 | 구현 우선순위 | 사유 |
|---|-----------|------|------------|------|
| 1 | social_logins | 사용자 | 중 | 소셜 로그인 기능 구현 시 필요 |
| 2 | product_images | 상품 | 높음 | 다중 이미지 지원 시 필요 |
| 3 | store_order | 주문 | 높음 | 멀티 마트 주문 분리 시 필수 |
| 4 | payments | 결제 | 높음 | PG 연동 시 필수 |
| 5 | payment_refunds | 결제 | 중 | 환불 처리 시 필요 |
| 6 | rider_locations | 배달 | 중 | 실시간 추적 고도화 시 필요 (Redis) |
| 7 | subscription_day_of_week | 구독 | 낮음 | 배송 요일 다중 선택 시 필요 |
| 8 | subscription_product_items | 구독 | 중 | 구독 상품 구성 관리 |
| 9 | subscription_history | 구독 | 중 | 구독 배송 이력 추적 |
| 10 | settlement_details | 정산 | 낮음 | 정산 상세 내역 조회 |
| 11 | approval_documents | 승인 | 중 | 서류 통합 관리 |
| 12 | delivery_photos | 기타 | 낮음 | 배송 증빙 사진 |
| 13 | notification_broadcasts | 기타 | 낮음 | 전체 공지 알림 |
| 14 | inquiry_attachments | 기타 | 낮음 | 문의 첨부 파일 |

---

## 4. 주요 불일치 항목 및 권장 수정사항

### 4.1 필드명 불일치

| 구분 | 프론트 | DB | 권장 |
|------|-------|-----|------|
| notifications | message | content | 프론트를 `content`로 통일 |
| notifications | unread | is_read | 의미 반전 주의, 변환 로직 필요 |
| stores | name | store_name | 프론트 조회 시 alias 처리 |
| products | desc | description | 프론트를 `description`으로 통일 |
| orders | id | order_number | 프론트 `id`는 order_number 사용 |

### 4.2 상태값 체계 불일치

| 엔티티 | 프론트 상태값 | DB ENUM 값 | 권장 |
|-------|------------|-----------|------|
| stores | 정상, 중지됨, 비활성 | APPROVED, SUSPENDED, CLOSED | 프론트에서 매핑 함수 사용 |
| orders | 주문 접수 중, 배송 완료, 배송 중 | PENDING, COMPLETED, DELIVERING 등 | 한글↔영문 매핑 테이블 정의 |
| users | 활성, 휴면, 정지 | ACTIVE, INACTIVE, SUSPENDED | 한글↔영문 매핑 테이블 정의 |
| subscriptions | 구독중, 해지 예정, 해지됨 | ACTIVE, CANCELLATION_PENDING, CANCELLED | 한글↔영문 매핑 테이블 정의 |
| settlements | 정산완료, 정산예정 등 | PENDING, COMPLETED, FAILED | 한글↔영문 매핑 테이블 정의 |

### 4.3 ERD에 누락된 필드 (프론트에서 사용하나 DB에 없음)

| 엔티티 | 프론트 필드 | 설명 | 권장 |
|-------|-----------|------|------|
| addresses | contact | 수령인 연락처 | `receiver_phone` 컬럼 추가 권장 |
| addresses | entranceType | 출입문 유형 | `entrance_type` ENUM 추가 권장 |
| addresses | entrancePassword | 출입 비밀번호 | `entrance_password` VARCHAR 추가 권장 |
| riders | type | 배달원 유형 (전문/주민) | `rider_type` ENUM 추가 권장 |
| stores | time | 배달 예상시간 | `estimated_delivery_time` INT 추가 권장 |
| paymentMethods | color | UI 표시 색상 | 프론트 전용, DB 불필요 |
| reviews | img | 리뷰 이미지 | `review_images` 테이블 또는 `image_url` 필드 추가 권장 |
| reports | type | 신고 유형 | `report_type` ENUM 추가 권장 |

### 4.4 ERD에 정의되었으나 프론트 mockData에 없는 엔티티

| 엔티티 | 설명 | 권장 |
|-------|------|------|
| faqs | FAQ 데이터가 mockData에 존재하나 ERD에 없음 | `faqs` 테이블 ERD 추가 필요 |

---

## 5. 종합 요약

| 항목 | 수량 |
|------|------|
| ERD 전체 엔티티 | 41개 (기존 37 + 신규 4) |
| 프론트엔드 사용 엔티티 | 27개 |
| 프론트 미사용 엔티티 | 14개 |
| 필드명 불일치 | 5건 |
| 상태값 체계 불일치 | 5건 |
| ERD 누락 필드 (추가 권장) | 8건 |
| ERD 미정의 엔티티 (추가 권장) | 1건 (faqs) |
