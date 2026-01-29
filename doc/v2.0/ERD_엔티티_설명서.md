# ERD 엔티티 설명서 v2.0



## 엔티티 상세 설명

### 3.1 사용자 모듈

### users (사용자)

**목적**: 시스템 전체 사용자 계정 관리 (고객, 마트 사장, 배달원, 관리자)

**주요 필드**:

- `user_id`: 사용자 고유 식별자 (PK, AUTO_INCREMENT)
- `email`: 이메일 주소 (로그인 ID, UNIQUE)
- `password`: BCrypt 해시 비밀번호
- `name`: 사용자 이름
- `phone`: 휴대폰 번호 (UNIQUE, 인증 필요)
- `role`: 사용자 역할 (CUSTOMER, STORE_OWNER, RIDER, ADMIN)
    - 테이블로 분리
- `status`: 계정 상태 (ACTIVE, INACTIVE, SUSPENDED, PENDING)
- `terms_agreed`: 이용약관 동의 여부
- `privacy_agreed`: 개인정보처리방침 동의 여부
- `terms_agreed_at`: 약관 동의 일시
- `privacy_agreed_at`: 개인정보 동의 일시
- created_at
- updated_at
- `deleted_at`: 탈퇴일시 (Soft Delete)

**비즈니스 규칙**:

- **BR-U01**: 이메일과 휴대폰 번호는 시스템 전체에서 유일 (UNIQUE 제약)
- 회원가입 시 휴대폰 인증 필수 (최대 5회 인증번호 발송)
- Soft Delete 지원 (`deleted_at` NULL 체크)
- 이용약관 및 개인정보처리방침 동의 필수

**관련 유즈케이스**:

- UC-C01: 회원가입 (휴대폰 인증)
- UC-C02: 로그인 (실패 추적)
- UC-C03: 회원정보 수정
- UC-C04: 회원탈퇴 (Soft Delete)

**인덱스**:

- `idx_users_email`: email (UNIQUE)
- `idx_users_phone`: phone (UNIQUE)
- `idx_users_role_status`: (role, status) - 역할별 사용자 조회

---

### addresses (배송 주소)

**목적**: 고객의 배송 주소 관리 (최대 5개)

**주요 필드**:

- `address_id`: 주소 고유 식별자 (PK)
- `user_id`: 사용자 ID (FK → users)
- `address_name`: 주소 별칭 (예: 집, 회사)
- `postal_code`: 우편번호
- `address_line1`: 기본 주소 (도로명/지번)
    - ex) 서울시 강남구 테헤란로 123
- `address_line2`: 상세 주소 (동/호수)
    - ex) 동 호수
- `latitude`: 위도 (-90 ~ 90)
- `longitude`: 경도 (-180 ~ 180)
- `is_default`: 기본 배송지 여부
- created_at
- updated_at

**비즈니스 규칙**:

- **BR-U02**: 고객당 최대 5개 배송 주소 (애플리케이션 레벨 검증)
- **BR-U03**: 기본 배송지 1개 (`is_default` 플래그)
- 주소 중복 방지 (동일 사용자 + 동일 주소)
- 주소 별칭 중복 방지 (동일 사용자 + 동일 별칭)

**관련 유즈케이스**:

- UC-C12: 배송지 관리 (추가, 수정, 삭제, 기본 설정)

**인덱스**:

- `idx_addresses_user_id`: user_id
- `idx_addresses_user_default`: (user_id, is_default)
- `idx_addresses_unique_address`: (user_id, address_line1, address_line2) UNIQUE
- `idx_addresses_unique_name`: (user_id, address_name) UNIQUE

---

### social_logins (소셜 로그인)

**목적**: 소셜 계정 연동 정보 관리 (Kakao, Naver, Google, Apple)

**주요 필드**:

- `social_id`: 소셜 로그인 ID (PK)
- `user_id`: 사용자 ID (FK → users)
- `provider`: 소셜 제공자 (KAKAO, NAVER, GOOGLE, APPLE)
- `provider_user_id`: 제공자 측 사용자 ID
- `connected_at`: 연동일시
- created_at
- updated_at

**비즈니스 규칙**:

- 동일 제공자의 동일 사용자 ID는 유일 (provider + provider_user_id UNIQUE)
- 토큰은 암호화하여 저장

**관련 유즈케이스**:

- UC-C02: 소셜 로그인
- UC-C03: 소셜 계정 연동 관리

**인덱스**:

- `idx_social_logins_user_id`: user_id
- `idx_social_provider_user`: (provider, provider_user_id) UNIQUE

---

### 3.2 마트 모듈

### stores (마트)

**목적**: 로컬 마트 정보 및 운영 상태 관리

**주요 필드**:

- `store_id`: 마트 고유 식별자 (PK)
- `owner_id`: 마트 사장님 ID (FK → users, UNIQUE, 1:1 관계)
- `store_name`: 마트 상호명
- `business_number`: 사업자등록번호 (10자리, UNIQUE)
- `representative_name`: 대표자명
- `representative_phone`: 대표자 연락처
- `phone`: 마트 연락처
- `telecom_sales_report_number`: 통신판매업 신고번호
- `description`: 마트 소개
- `address_line1`, `address_line2`: 주소
    - 우편주소 추가
- `latitude`, `longitude`: 마트 위치 좌표
- `settlement_bank_name`: 정산 은행명
- `settlement_bank_account`: 정산 계좌번호 (암호화 - 확장)
- `settlement_account_holder`: 정산 예금주
- 마트사진 URL - store_image (대표 이미지)
- ~~각종 서류 이미지~~ → `approval_documents` 테이블로 이관 (승인 관리 모듈 3.10)
- `average_rating`: 평균 평점 (0.0~5.0)
- `review_count`: 리뷰 수
- `status`: 마트 상태 (PENDING, APPROVED, REJECTED, SUSPENDED, CLOSED)
- `is_delivery_available`: 현재 배달 가능 여부
- `created_at`: 등록일시
- `updated_at`: 수정일시

**비즈니스 규칙**:

- **BR-S01**: 사업자등록번호 유일성 (UNIQUE 제약)
- 1명의 사용자는 1개의 마트만 소유 (`owner_id` UNIQUE)
- 마트 승인 전까지 `status='PENDING'`
- 정산 계좌번호는 암호화 저장 - 확장 기능

**관련 유즈케이스**:

- UC-S01: 마트 등록 (서류 제출, 승인 대기)
- UC-S08: 마트 정보 수정
- UC-S09: 영업 상태 관리 (영업 시작/종료)
- UC-A01: 관리자 마트 승인

**인덱스**:

- `idx_stores_owner_id`: owner_id (UNIQUE)
- `idx_stores_business_number`: business_number (UNIQUE)
- `idx_stores_status_open`: (status, is_open)
- `idx_stores_location`: (latitude, longitude) - 주변 마트 검색용

---

### store_business_hours (영업시간)

**목적**: 마트의 요일별 영업시간 관리

**주요 필드**:

- `hours_id`: 영업시간 ID (PK)
- `store_id`: 마트 ID (FK → stores)
- `day_of_week`: 요일 (0=일요일 ~ 6=토요일)
- `open_time`: 오픈 시간
- `close_time`: 마감 시간
- `is_closed`: 휴무 여부
- `created_at`: 등록일시
- `updated_at`: 수정일시

**비즈니스 규칙**:

- 마트별로 요일당 1개의 영업시간 (store_id + day_of_week UNIQUE)
- `close_time > open_time` (CHECK 제약)
- `break_end > break_start` (CHECK 제약)
- 휴무일에는 `is_closed=true`

**관련 유즈케이스**:

- UC-S09: 영업시간 관리 (요일별 설정, 휴게시간 설정)

**인덱스**:

- `idx_business_hours_store_day`: (store_id, day_of_week) UNIQUE

---

### 3.3 상품 모듈

### categories (카테고리)

**목적**: 상품 분류 계층 구조 관리 (대/중/소 분류)

**주요 필드**:

- `category_id`: 카테고리 ID (PK)
- `category_name`: 카테고리명
- `icon_url`: 아이콘 이미지 URL
- `created_at`: 등록일시
- `updated_at`: 수정일시

**비즈니스 규칙**:

**관련 유즈케이스**:

- UC-S02: 상품 등록 시 카테고리 선택
- UC-C03: 카테고리별 상품 검색

**인덱스**:

- `idx_categories_code`: category_code (UNIQUE)
- `idx_categories_parent_order`: (parent_id, sort_order)

---

### products (상품)

**목적**: 마트별 판매 상품 정보 관리

**주요 필드**:

- `product_id`: 상품 ID (PK)
- `store_id`: 마트 ID (FK → stores)
- `category_id`: 카테고리 ID (FK → categories)
- `product_name`: 상품명
- `description`: 상품 설명
- `price`: 정가
- `sale_price`: 할인가 (NULL이면 할인 없음)
- `discount_rate`: 할인율 (%)
- `stock`: 재고 수량
- `unit`: 판매 단위 (예: 1개, 500g, 1L)
- `origin`: 원산지
- `is_active`: 판매 가능 여부
- `order_count`: 주문수
- `created_at`: 등록일시
- `updated_at`: 수정일시

**비즈니스 규칙**:

- **BR-S04**: 가격 > 0 (CHECK 제약)
- **BR-S06**: 재고 0 = 품절 (애플리케이션 레벨)

**관련 유즈케이스**:

- UC-S02: 상품 등록/수정
- UC-S03: 재고 관리
- UC-C04: 상품 검색/조회

**인덱스**:

- `idx_products_store_category`: (store_id, category_id)
- `idx_products_store_available`: (store_id, is_available)
- `idx_products_name_fulltext`: product_name (전문 검색)

---

### product_images (상품 이미지)

**목적**: 상품의 이미지 관리 (대표 이미지 포함)

**주요 필드**:

- `image_id`: 이미지 ID (PK)
- `product_id`: 상품 ID (FK → products)
- `image_url`: 이미지 URL
- `is_main`: 대표 이미지 여부
- `sort_order`: 정렬 순서
- `created_at`: 등록일시
- `updated_at`: 수정일시

**비즈니스 규칙**:

- 1개의 상품은 여러 이미지 보유 가능
- 대표 이미지는 1개 (`is_main=true`)
- 추가 이미지는 `sort_order`로 정렬

**관련 유즈케이스**:

- UC-S02: 상품 이미지 등록
- UC-C04: 상품 상세 조회

**인덱스**:

- `idx_product_images_product`: (product_id, is_main, sort_order)

---

### 3.4 주문 모듈

### orders (주문)

**목적**: 고객의 주문 정보 및 주문 상태 관리

**주요 필드**:

- order_id (PK)
- order_number : 주문번호 (UNIQUE)
- user_id (FK)
- order_type : 주문 타입 (일반/구독) (REGULAR, SUBSCRIPTION)
- status (PENDING, PAID, PARTIAL_CANCELLED, CANCELLED, COMPLETED)
- total_product_price : 총 주문 금액
- total_delivery_fee :  총 배달비
- final_price : 최종 결제 금액
- `delivery_address`: 배송 주소 (전체 주소 문자열)
- `delivery_latitude`, `delivery_longitude`: 배송지 좌표
- `delivery_request`: 배송 요청사항
- `ordered_at`: 주문일시
- `created_at`: 등록일시
- `updated_at`: 수정일시

**비즈니스 규칙**:

- **BR-O01**: 취소는 ACCEPTED 전까지만 가능
- **BR-O03**: final_price = total_product_price + delivery_fee
- 주문 상태 전이: 10개 상태 관리
- 구독 주문은 자동 생성 (`order_type=SUBSCRIPTION`)

**관련 유즈케이스**:

- UC-C06: 주문하기 (일반/예약)
- UC-C07: 주문 취소
- UC-S04: 신규 주문 접수
- UC-S05: 주문 상태 관리

**인덱스**:

- `idx_orders_number`: order_number (UNIQUE)
- `idx_orders_user_status`: (user_id, status)
- `idx_orders_store_status`: (store_id, status)
- `idx_orders_ordered_at`: ordered_at

---

### store_order

주요 필드:

- store_order_id : 마트별 주문 고유 번호(PK)
- order_id : 주문 ID(FK)
- store_id : 매장 ID(FK)
- order_type(일반, 구독)
- status ( PENDING, ACCEPTED, PREPARING, READY, PICKED_UP, DELIVERING, DELIVERED, CANCELLED, REJECTED)
- store_product_price : 구매 상품 합계 금액
- delivery_fee : 배달비
- final_price : 최종 결제 금액
- accepted_at : 주문 접수 일시
- prepared_at : 준비 완료 일시
- picked_up_at : 픽업 완료 일시
- delivered_at : 배달 완료 일시
- cancelled_at : 취소 발생 일시
- cancel_reason : 취소 사유
- created_at : 등록일시
- updated_at : 수정일시

---

### order_items (주문 상품)

**목적**: 주문에 포함된 상품 목록 및 가격 스냅샷

**주요 필드**:

- order_item_id :  (PK)
- store_order_id : (FK)
- product_id : 상품 ID
- product_name_snapshot : 결제 당시 상품명
- price_snapshot : 결제 당시 가격
- quantity : 결제 수량
- created_at : 등록일시
- updated_at : 수정일시

**비즈니스 규칙**:

- **BR-O06**: 주문 시점 상품 정보 스냅샷 저장
- 상품 가격 변경 시에도 주문 내역은 주문 시점 가격 유지
- `total_price = product_price × quantity`
- `quantity >= 1` (CHECK 제약)

**관련 유즈케이스**:

- UC-C06: 주문하기 (장바구니 → 주문)
- UC-C08: 주문 내역 조회

**인덱스**:

- `idx_order_items_order_id`: order_id
- `idx_order_items_product_id`: product_id

---

### cart (장바구니)

**목적**: 고객의 장바구니 관리 (마트별 분리)

**주요 필드**:

- `cart_id`: 장바구니 ID (PK)
- `user_id`: 고객 ID (FK → users, UNIQUE, 1:1관계)
- `created_at`: 등록일시
- `updated_at`: 수정일시

**비즈니스 규칙**:

- 장바구니는 마트별로 분리 (한 번에 여러 마트 주문 가능)
- 동일 고객 + 동일 상품은 1개 항목 (user_id + product_id UNIQUE)
- `quantity >= 1` (CHECK 제약)

**관련 유즈케이스**:

- UC-C05: 장바구니 관리 (추가, 수정, 삭제)
- UC-C06: 주문하기 (장바구니 → 주문)

**인덱스**:

- `idx_cart_user_store`: (user_id, store_id)
- `idx_cart_user_product`: (user_id, product_id) UNIQUE

---

### cart_Item (장바구니 상품)

목적

주요 필드:

- cart_item_id : 장바구니 상품 ID(PK)
- cart_id : 장바구니 ID (FK)
- product_id : 상품 ID (FK)
- store_id : 마트 ID (FK)
- quantity : 수량 (>=1)
- created_at : 등록일시
- updated_at : 수정일시

---

### 3.5 결제 모듈

### payments (결제)

**목적**: 주문에 대한 결제 정보 관리 (PG 연동)

**주요 필드**:

- `payment_id`: 결제 ID (PK)
- `order_id`: 주문 ID (FK → orders, UNIQUE, 1:1 관계)
- `payment_method`: 결제 수단 (CARD, KAKAO_PAY, NAVER_PAY, TOSS_PAY)
- `payment_status`: 결제 상태 (PENDING, COMPLETED, FAILED, CANCELLED, PARTIAL_REFUNDED, REFUNDED)
- `amount`: 결제 금액
- `pg_provider`: PG사 (예: tosspayments, inicis)
- `pg_tid`: PG 거래 ID
- `card_company`: 카드사
- `card_number_masked`: 마스킹된 카드번호 (예: 1234-****-5678)
- `receipt_url`: 영수증 URL
- `paid_at`: 결제 완료일시
- `created_at`: 등록일시
- `updated_at`: 수정일시

**비즈니스 규칙**:

- **BR-P01**: 배송 시작 전까지만 전액 취소 가능
- 1개의 주문은 1개의 결제 (`order_id` UNIQUE)
- PG 연동: PG사 API를 통한 결제 처리
- 영수증 URL 제공

**관련 유즈케이스**:

- UC-C06: 주문 결제
- UC-C07: 주문 취소 및 환불

**인덱스**:

- `idx_payments_order_id`: order_id (UNIQUE)
- `idx_payments_status`: payment_status

---

### payment_refunds (결제 환불)

- payment_refund_id : 환불 ID (PK)
- payment_id : 결제 ID (FK)
- store_order_id : 주문 ID(FK)
- refunded_at : 환불 완료 일시
- refund_amount : 환불 금액
- refund_reason : 환불 사유
- created_at : 등록일시
- updated_at : 수정일시

---

### payment_methods (저장된 결제수단)

**목적**: 고객의 저장된 결제수단 관리 (빌링키)

**주요 필드**:

- `method_id`: 결제수단 ID (PK)
- `user_id`: 고객 ID (FK → users)
- `method_type`: 결제수단 유형 (CARD, KAKAO_PAY, NAVER_PAY, TOSS_PAY)
- `billing_key`: 빌링키 (PG사 제공, 암호화)
- `card_company`: 카드사
- `card_number_masked`: 마스킹된 카드번호
- `is_default`: 기본 결제수단 여부
- `created_at`: 등록일시
- `updated_at`: 수정일시

**비즈니스 규칙**:

- 빌링키를 이용한 정기 결제 (구독 주문용)
- 동일 고객 + 동일 빌링키는 1개 (user_id + billing_key UNIQUE)
- 기본 결제수단 1개 (`is_default`)

**관련 유즈케이스**:

- UC-C13: 결제수단 관리 (등록, 삭제, 기본 설정)
- UC-C10: 구독 결제수단 설정

**인덱스**:

- `idx_payment_methods_user_id`: user_id
- `idx_payment_methods_user_default`: (user_id, is_default)

---

### 3.6 배달 모듈

### riders (배달원)

**목적**: 배달원 정보 및 운행 상태 관리

**주요 필드**:

- `rider_id`: 배달원 ID (PK)
- `user_id`: 사용자 ID (FK → users, UNIQUE, 1:1 관계)
- `id_card_verified`: 신분증 인증 여부
- ~~`id_card_image`~~ → `approval_documents` 테이블로 이관 (승인 관리 모듈 3.10)
- `operation_status`: 운행 상태 (OFFLINE, ONLINE)
- `bank_name`: 정산 은행명
- `bank_account`: 정산 계좌번호 (암호화)
- `account_holder`: 예금주
- `status`: 배달원 상태 (PENDING, APPROVED, REJECTED, SUSPENDED)
- `created_at`: 등록일시
- `updated_at`: 수정일시

**비즈니스 규칙**:

- **BR-U04**: 신분증 인증 후 승인
- 1명의 사용자는 1명의 배달원 (`user_id` UNIQUE)
- 운행 상태에 따라 배달 할당 가능 여부 결정

**관련 유즈케이스**:

- UC-R01: 배달원 등록 (신분증)
- UC-R02: 운행 상태 관리
- UC-R10: 차량 관리

**인덱스**:

- `idx_riders_user_id`: user_id (UNIQUE)
- `idx_riders_status`: status
- `idx_riders_operation_status`: operation_status

---

### deliveries (배달)

**목적**: 주문에 대한 배달 정보 및 배달 상태 관리

**주요 필드**:

- `delivery_id`: 배달 ID (PK)
- `store_order_id`: 주문 ID (FK → store_order, UNIQUE, 1:1 관계)
- `rider_id`: 배달원 ID (FK → riders)
- `status`: 배달 상태 (REQUESTED, ACCEPTED, PICKED_UP, DELIVERING, DELIVERED, CANCELLED)
- `delivery_fee`: 배달비
- `rider_earning`: 배달원 수익( 배달비 - 배달 수수료 )
- `distance_km`: 배달 거리 (km)
- `estimated_minutes`: 예상 소요시간 (분)
- `requested_at`: 배달 요청일시
- `accepted_at`: 배달 수락일시
- `picked_up_at`: 픽업 완료일시
- `delivered_at`: 배송 완료일시
- `cancelled_at`: 취소일시
- `cancel_reason`: 취소 사유
- `created_at`: 등록일시
- `updated_at`: 수정일시

**비즈니스 규칙**:

- **BR-D01**: 배달원은 동시 최대 3건
- 1개의 가게 주문은 1개의 배달 (`order_id` UNIQUE)
- 배달 상태 전이: 6개 상태 관리

**관련 유즈케이스**:

- UC-R03: 배달 수락
- UC-R05: 배달 상태 업데이트
- UC-R07: 배송 완료 사진 촬영

**인덱스**:

- `idx_deliveries_order_id`: order_id (UNIQUE)
- `idx_deliveries_rider_status`: (rider_id, status)

---

### rider_locations (배달원 위치) - Redis

**목적**: 배달원 실시간 위치 추적 (3-5초 간격 수집)

**주요 필드**:

- `location_id`: 위치 기록 ID (PK)
- `rider_id`: 배달원 ID (FK → riders)
- `delivery_id`: 현재 배달 ID (FK → deliveries)
- `latitude`: 현재 위도
- `longitude`: 현재 경도
- `accuracy`: GPS 정확도 (m)
- `speed`: 현재 속도 (km/h)
- `heading`: 이동 방향 (도, 0~360)
- `recorded_at`: 기록일시
- `is_current`: 현재 위치 여부

**비즈니스 규칙**:

- **BR-D03**: 3-5초 간격으로 위치 수집
- **BR-D05**: 14일 후 자동 삭제 (배치 작업)
- 최신 위치는 `is_current=true`
- 이전 위치는 `is_current=false`

**관련 유즈케이스**:

- UC-R06: 실시간 위치 업데이트
- UC-C08: 배달 추적 (고객)

**인덱스**:

- `idx_rider_locations_rider_time`: (rider_id, recorded_at)
- `idx_rider_locations_delivery_current`: (delivery_id, is_current)
- `idx_rider_locations_recorded_at`: recorded_at (삭제 배치용)

---

### 3.7 구독 모듈

### subscription_products (구독 상품)

**목적**: 마트에서 제공하는 구독 상품 정의

**주요 필드**:

- `subscription_product_id`: 구독 상품 ID (PK)
- `store_id`: 마트 ID (FK → stores)
- `subscription_product_name`: 구독 상품명 (예: 신선 과일 박스)
- `description`: 상품 설명
- `price`: 구독 가격
- total_delivery_count: 월간 총 배송 횟수
- `delivery_day_of_week`: 배송 요일 (0=일요일 ~ 6=토요일)
- `status`: 상태 (ACTIVE, INACTIVE)
- subscription_url : 구독상품에대한 대표 이미지
- `created_at`: 등록일시
- `updated_at`: 수정일시

**비즈니스 규칙**:

- 결제일 다음주월요일부터 시작
- 구독 갱신 → 시작일 포함 28일 후
- 마트에서 구독 상품 패키지 등록
- 구독 상품은 여러 일반 상품의 조합 (subscription_product_items)
- 배송 주기와 요일 사전 정의

**관련 유즈케이스**:

- UC-S10: 구독 상품 등록
- UC-S11: 구독 상품 수정

**인덱스**:

- `idx_subscription_products_store_status`: (store_id, status)

---

### subscription_day_of_week(구독 배송 요일)

주요필드:

- subscription_id
- day_of_week : 배송 요일 (0=일요일 ~ 6=토요일)

제약조건

- 구독아이디, 배송요일 pk 로 구분

---

### subscription_product_items (구독 상품 구성 품목)

**목적**: 구독 상품에 포함된 일반 상품 목록

**주요 필드**:

- `item_id`: 구독 품목 ID (PK)
- `subscription_product_id`: 구독 상품 ID (FK → subscription_products)
- `product_id`: 상품 ID (FK → products)
- `quantity`: 수량 (>= 1)
- `created_at`: 등록일시
- `updated_at`: 수정일시

**비즈니스 규칙**:

- 구독 상품 = 여러 일반 상품의 조합
- 예: “신선 과일 박스” = 사과 3개 + 배 2개 + 귤 5개

**관련 유즈케이스**:

- UC-S10: 구독 상품 등록 (품목 설정)

**인덱스**:

- `idx_subscription_product_items_product`: subscription_product_id

---

### subscriptions (정기 배송 구독)

**목적**: 고객의 구독 정보 관리

**주요 필드**:

- `subscription_id`: 구독 ID (PK)
- `user_id`: 고객 ID (FK → users)
- `store_id`: 마트 ID (FK → stores)
- `subscription_product_id`: 구독 상품 ID (FK → subscription_products)
- `delivery_time_slot`: 배송 희망 시간대 (예: 18:00-20:00)
- `address_id`: 배송 주소 ID (FK → addresses)
- `payment_method_id`: 결제수단 ID (FK → payment_methods)
- `status`: 구독 상태 (ACTIVE, PAUSED, CANCELLATION_PENDING, CANCELLED)
- `next_payment_date`: 다음 결제 예정일
- `total_amount`: 정기 결제 금액
- cycle_count : (default: 1)
- `started_at`: 구독 시작일
- `paused_at`: 일시정지일
- `cancelled_at`: 해지일
- `cancel_reason`: 해지 사유
- `created_at`: 등록일시
- `updated_at`: 수정일시

**비즈니스 규칙**:

- **BR-SUB01**: 주기 선택 (주간/격주/월간)
- **BR-SUB02**: 건너뛰기는 24시간 전까지
- **BR-SUB03**: 자동 주문 생성은 배송 하루 전 00:00
- 활성 구독 중복 방지 (user_id + store_id + status UNIQUE)

**관련 유즈케이스**:

- UC-C10: 구독 신청/관리/해지
- UC-C11: 구독 건너뛰기

**인덱스**:

- `idx_subscriptions_user_status`: (user_id, status)
- `idx_subscriptions_next_delivery`: next_delivery_date

---

### subscription_items (구독 상품 목록)

**목적**: 구독에 포함된 상품 목록 (커스터마이징 가능)

**주요 필드**:

- `item_id`: 구독상품 ID (PK)
- `subscription_id`: 구독 ID (FK → subscriptions)
- `product_id`: 상품 ID (FK → products)
- `quantity`: 수량 (>= 1)
- `created_at`: 등록일시
- `updated_at`: 수정일시

**비즈니스 규칙**:

- 고객이 구독 상품을 선택하거나 커스터마이징
- 기본은 `subscription_product_items`를 복사하여 생성
- 고객이 수량 조절 또는 상품 추가/제거 가능

**관련 유즈케이스**:

- UC-C10: 구독 상품 선택 및 수정

**인덱스**:

- `idx_subscription_items_subscription_id`: subscription_id
- `idx_subscription_items_product_id`: product_id

---

### subscription_history (구독 배송 이력) - 도은님 확정!

**목적**: 구독의 배송 스케줄 및 건너뛰기 이력 추적

**주요 필드**:

- `history_id`: 이력 ID (PK)
- `subscription_id`: 구독 ID (FK → subscriptions)
- cycle_count : 1회차구독 / 몇번째 구독인지
- `scheduled_date`: 배송 예정일
- `status`: 상태 (SCHEDULED, ~~SKIPPED~~, ORDERED, COMPLETED)
- `store_order_id`: 생성된 주문 ID (FK → orders) Nullable
- `created_at`: 등록일시
- `updated_at`: 수정일시

**비즈니스 규칙**:

- 배송 스케줄이 생성되면 `status=SCHEDULED`
- 건너뛰기 시 `status=SKIPPED`
- 자동 주문 생성 시 `status=ORDERED`, `order_id` 저장
- 배송 완료 시 `status=COMPLETED`

**관련 유즈케이스**:

- UC-C11: 구독 건너뛰기
- UC-S12: 구독 자동 주문 생성

**인덱스**:

- `idx_subscription_history_sub_date`: (subscription_id, scheduled_date)
- `idx_subscription_history_order_id`: order_id

---

### 3.8 리뷰 모듈

### reviews (리뷰)

**목적**: 주문에 대한 마트 및 배달 평가 관리

**주요 필드**:

- `review_id`: 리뷰 ID (PK)
- `store_order_id`: 주문 ID (FK → orders, UNIQUE, 1:1 관계)
- `user_id`: 작성자 ID (FK → users)
- `rating`: 마트 평점 (1~5)
- `content`: 리뷰 내용(varchar(100) 제한)
- `is_visible`: 노출 여부(default: true)
- `created_at`: 등록일시
- `updated_at`: 수정일시

**비즈니스 규칙**:

- **BR-R01**: 배송완료 후 7일 이내 작성,수정,삭제 가능
- **BR-R02**: 주문당 1개 리뷰 (`store_order_id` UNIQUE)
- **BR-R04**: 평점 1~5 (CHECK 제약)

**관련 유즈케이스**:

- UC-C09: 리뷰 작성/수정
- UC-S06: 사장님 답글

**인덱스**:

- `idx_reviews_order_id`: order_id (UNIQUE)
- `idx_reviews_user_id`: user_id
- `idx_reviews_store_id`: store_id
- `idx_reviews_rider_id`: rider_id

---

### 3.9 정산 모듈

### settlements (정산)

**목적**: 마트 및 배달원에 대한 정산 관리

**주요 필드**:

- `settlement_id`: 정산 ID (PK)
- `target_type`: 정산 대상 유형 (STORE, RIDER)
- `target_id`: 마트 ID 또는 배달원 ID
- `settlement_period_start`: 정산 기간 시작일(예: 2026-01-01)
- `settlement_period_end`: 정산 기간 종료일(예: 2026-01-07)
- `total_sales`: 총 매출/수익
- `platform_fee`: 플랫폼 수수료
- `settlement_amount`: 정산 금액 (매출 - 수수료)
- `status`: 정산 상태 (PENDING, COMPLETED, FAILED)
- `bank_name`: 입금 은행
- `bank_account`: 입금 계좌 (암호화)
- `settled_at`: 정산 완료일시
- `created_at`: 등록일시
- `updated_at`: 수정일시

**비즈니스 규칙**:

- **BR-P04**: 마트는 월단위 정산, 배달원은 주단위 정산
- **BR-P05**: 수수료 - 마트 5~8%, 배달원 10%
- `settlement_amount = total_sales - platform_fee`

**관련 유즈케이스**:

- UC-S07: 정산 내역 조회
- UC-R08: 정산 내역 조회
- UC-A09: 정산 승인

**인덱스**:

- `idx_settlements_target_period`: (target_type, target_id, settlement_period)
- `idx_settlements_status`: status

---

### settlement_details (정산 상세)

**목적**: 정산에 포함된 개별 주문/배달 내역

**주요 필드**:

- `detail_id`: 상세 ID (PK)
- `settlement_id`: 정산 ID (FK → settlements)
- `store_order_id`: 주문 ID (FK → orders)
- `amount`: 금액
- `fee`: 수수료
- `net_amount`: 순수익
- `created_at`: 등록일시
- `updated_at`: 수정일시

**비즈니스 규칙**:

- 정산 내역의 상세 명세
- `net_amount = amount - fee`

**관련 유즈케이스**:

- UC-S07: 정산 상세 내역 확인
- UC-R08: 정산 상세 내역 확인

**인덱스**:

- `idx_settlement_details_settlement_id`: settlement_id
- `idx_settlement_details_order_id`: order_id

---

### 3.10 승인 관리 모듈

### approvals (통합 승인 이력)

**목적**: 마트 및 배달원의 승인 요청/처리 이력을 단일 테이블에서 통합 관리

**주요 필드**:

- `approval_id`: 승인 이력 ID (PK)
- `applicant_type`: 신청자 유형 (STORE, RIDER)
- `store_id`: 마트 ID (FK → stores, Nullable — 마트 신청 시)
- `rider_id`: 배달원 ID (FK → riders, Nullable — 배달원 신청 시)
- `status`: 승인 상태 (PENDING, DOCUMENT_REVIEW, DOCUMENT_INCOMPLETE, REVIEWING, APPROVED, REJECTED, HELD)
- `reason`: 승인/반려/보류 사유
- `approved_by`: 처리 관리자 ID (FK → users, Nullable)
- `approved_at`: 처리 일시
- `created_at`: 등록일시
- `updated_at`: 수정일시

**제약조건**:

```sql
-- store_id와 rider_id 중 정확히 하나만 NOT NULL
CHECK (
  (applicant_type = 'STORE' AND store_id IS NOT NULL AND rider_id IS NULL) OR
  (applicant_type = 'RIDER' AND store_id IS NULL AND rider_id IS NOT NULL)
)
```

**비즈니스 규칙**:

- 마트/배달원 승인을 단일 테이블에서 `applicant_type`으로 구분
- 재신청 시 새 이력 행 추가 (이력 누적)
- 관리자가 승인/반려/보류 처리
- 상태 흐름: PENDING → DOCUMENT_REVIEW → REVIEWING → APPROVED/REJECTED/HELD
- 서류 미비 시: DOCUMENT_REVIEW → DOCUMENT_INCOMPLETE → (재제출) → DOCUMENT_REVIEW

**관련 유즈케이스**:

- UC-S01: 마트 등록 (서류 제출, 승인 대기)
- UC-R01: 배달원 등록 (서류 제출, 승인 대기)
- UC-A01: 마트 승인 처리
- UC-A02: 배달원 승인 처리
- UC-A08: 승인 이력 조회

**인덱스**:

- `idx_approvals_store`: (store_id, created_at) — 마트별 승인 이력 조회
- `idx_approvals_rider`: (rider_id, created_at) — 배달원별 승인 이력 조회
- `idx_approvals_type_status`: (applicant_type, status) — 유형별 상태 필터
- `idx_approvals_status`: status — 관리자 대시보드 (대기 건수)

---

### approval_documents (승인 서류)

**목적**: 승인 신청 시 제출하는 서류를 통합 관리. 기존 stores/riders 테이블에 분산되어 있던 서류 이미지를 이 테이블에서 일원화하여 관리.

**주요 필드**:

- `document_id`: 서류 ID (PK)
- `approval_id`: 승인 이력 ID (FK → approvals)
- `document_type`: 서류 유형
    - 마트: BUSINESS_LICENSE(사업자등록증), BUSINESS_REPORT(통신판매업 신고증), BANK_PASSBOOK(통장사본)
    - 배달원: ID_CARD(신분증), DRIVER_LICENSE(운전면허증)
- `document_url`: 서류 파일 URL
- `created_at`: 등록일시
- `updated_at`: 수정일시

**비즈니스 규칙**:

- 승인 이력(approvals)에 종속 — 재신청 시 새 승인 이력 + 새 서류 세트 생성
- 동일 승인 건에 같은 유형의 서류 중복 제출 불가 (`approval_id + document_type` UNIQUE)
- 마트 신청 시 필수 서류: 사업자등록증, 통신판매업 신고증, 통장사본
- 배달원 신청 시 필수 서류: 신분증 (운전면허증은 선택)
- 관리자가 서류 검증 수행
- 기존 `stores`의 서류 이미지 필드, `riders`의 `id_card_image` 필드를 이 테이블로 이관

**관련 유즈케이스**:

- UC-S01: 마트 등록 시 서류 제출
- UC-R01: 배달원 등록 시 서류 제출
- UC-A01: 마트 서류 검증
- UC-A02: 배달원 서류 검증

**인덱스**:

- `idx_approval_docs_approval`: approval_id
- `idx_approval_docs_unique_type`: (approval_id, document_type) UNIQUE

---

### 3.11 기타 모듈

### delivery_photos (배송 완료 사진)

**목적**: 배송 완료 증빙 사진 관리 (24시간 후 자동 삭제)

**주요 필드**:

- `photo_id`: 배송 사진 ID (PK)
- `delivery_id`: 배달 ID (FK → deliveries)
- `photo_url`: 사진 URL
- `created_at`: 촬영일시
- `expires_at`: 삭제 예정일 (촬영 후 24시간)
- `deleted_at`: 실제 삭제일
- `updated_at`: 수정일시

**비즈니스 규칙**:

- 배송 완료 시 배달원이 사진 촬영
- 24시간 후 자동 삭제 (배치 작업)
- 고객에게 배송 증빙 제공

**관련 유즈케이스**:

- UC-R07: 배송 완료 사진 촬영
- UC-C08: 배송 완료 사진 확인

**인덱스**:

- `idx_delivery_photos_delivery`: delivery_id
- `idx_delivery_photos_expires`: (expires_at, deleted_at) - 삭제 배치용

**배치 작업**:

```sql
DELETE FROM delivery_photos
WHERE expires_at < NOW() AND deleted_at IS NULL;
```

---

### notifications (알림)

**목적**: 사용자에게 전송되는 알림 관리

**주요 필드**:

- `notification_id`: 알림 ID (PK)
- `user_id`: 수신자 ID (FK → users)
- `title`: 알림 제목
- `content`: 알림 내용
- `reference_type`: 참조 대상 유형 (RIDER, STORE,CUSTOMER 등)
- `sent_at`: 발송일시
- is_read: 읽음 여부
- `created_at`: 등록일시
- `updated_at`: 수정일시

**비즈니스 규칙**:

- 푸시 알림, 인앱 알림 기록
- 주문 상태 변경, 배달 진행 상황, 프로모션 등 알림

**관련 유즈케이스**:

- 모든 유즈케이스에서 알림 발송

**인덱스**:

- `idx_notifications_user_read_sent`: (user_id, is_read, sent_at)

---

### notification_broadcasts

**목적**: 전체 사용자에게 전송되는 알림 관리

**주요 필드**:

- `notification_id`: 알림 ID (PK)
- `title`: 알림 제목
- `content`: 알림 내용
- `reference_type`: 참조 대상 유형 (RIDER, STORE,CUSTOMER, all 등)
- `created_at`: 등록일시
- `updated_at`: 수정일시

---

### reports (신고)

**목적**: 마트, 배달원, 리뷰, 주문에 대한 신고 관리

**주요 필드**:

- `report_id`: 신고 ID (PK)
- 신고자 유형:STORE, RIDER, CUSTOMER
- `reporter_id`: 신고자 ID (STORE, RIDER, CUSTOMER)
- `target_type`: 신고 대상 유형 (STORE, RIDER, REVIEW, CUSTOMER)
- `target_id`: 피신고자 ID
- `reason_detail`: 상세 사유
- `status`: 처리 상태 (PENDING, PROCESSING, RESOLVED, DISMISSED)
- `admin_note`: 관리자 메모
- `resolved_at`: 처리 완료일시
- `created_at`: 등록일시
- `updated_at`: 수정일시

**비즈니스 규칙**:

- 고객이 마트, 배달원, 리뷰 신고 가능
- 마트가 배달원, 리뷰, 고객 신고 가능
- 배달원이 고객, 마트 신고 가능

- 관리자가 신고 검토 및 처리

**관련 유즈케이스**:

- UC-C16: 신고 접수
- UC-A11: 신고 처리

**인덱스**:

- `idx_reports_reporter_id`: reporter_id
- `idx_reports_target`: (target_type, target_id)
- `idx_reports_status`: status

---

### inquiries (1:1 문의)

**목적**: 고객의 1:1 문의 관리

**주요 필드**:

- `inquiry_id`: 문의 ID (PK)
- `user_id`: 문의자 ID (FK → users)
- `category`: 문의 유형 (ORDER_PAYMENT, CANCELLATION_REFUND, DELIVERY, SERVICE, OTHER)
- `title`: 문의 제목
- `content`: 문의 내용
- file_url: 파일 경로
- `status`: 처리 상태 (PENDING, ANSWERED)
- `answer`: 답변 내용
- `answered_at`: 답변일시
- `answered_by`: 답변 관리자 ID (FK → users)
- `created_at`: 등록일시
- `updated_at`: 수정일시

**비즈니스 규칙**:

- 고객이 문의 작성
- 관리자가 답변 작성
- 주문과 연결 가능 (`order_id`)

**관련 유즈케이스**:

- UC-C15: 1:1 문의 작성
- UC-A13: 1:1 문의 답변

**인덱스**:

- `idx_inquiries_user_status`: (user_id, status)
- `idx_inquiries_status`: status

---

### inquiry_attachments (문의 첨부 파일)

**목적**: 1:1 문의에 첨부된 파일 관리

**주요 필드**:

- `attachment_id`: 첨부 파일 ID (PK)
- `inquiry_id`: 문의 ID (FK → inquiries)
- `file_url`: 파일 URL
- `file_name`: 파일명
- `file_size`: 파일 크기 (bytes)
- `mime_type`: MIME 타입

**비즈니스 규칙**:

- 문의 작성 시 파일 첨부 가능
- 이미지, PDF 등 다양한 파일 형식 지원

**관련 유즈케이스**:

- UC-C15: 1:1 문의 작성 시 파일 첨부
- UC-A13: 1:1 문의 답변 시 첨부 파일 확인

**인덱스**:

- `idx_inquiry_attachments_inquiry`: inquiry_id

---

### notices (공지사항)

**목적**: 플랫폼 공지사항 관리 (서비스 안내, 점검 공지 등)

**주요 필드**:

- `notice_id`: 공지사항 ID (PK, AUTO_INCREMENT)
- `title`: 공지 제목
- `content`: 공지 내용
- `author_id`: 작성자 ID (FK → users, 관리자)
- `is_pinned`: 상단 고정 여부 (DEFAULT false)
- `status`: 상태 (ACTIVE, INACTIVE)
- `created_at`: 작성일시
- `updated_at`: 수정일시

**비즈니스 규칙**:

- 관리자만 공지사항 작성/수정/삭제 가능
- 상단 고정 공지는 최상단에 노출
- 비활성 공지는 목록에서 숨김 처리

**관련 유즈케이스**:

- UC-A14: 공지사항 관리 (작성, 수정, 삭제, 고정)

**인덱스**:

- `idx_notices_status_pinned`: (status, is_pinned, created_at)
- `idx_notices_author`: author_id

---

### banners (배너)

**목적**: 메인 페이지 배너/광고 이미지 관리

**주요 필드**:

- `banner_id`: 배너 ID (PK, AUTO_INCREMENT)
- `title`: 배너 제목
- `content`: 배너 설명 텍스트
- `image_url`: 배너 이미지 URL
- `link_url`: 클릭 시 이동 URL (Nullable)
- `background_color`: 배경 색상/그라디언트 (CSS 값)
- `display_order`: 노출 순서
- `status`: 상태 (ACTIVE, INACTIVE)
- `started_at`: 노출 시작일
- `ended_at`: 노출 종료일
- `created_at`: 등록일시
- `updated_at`: 수정일시

**비즈니스 규칙**:

- 관리자가 배너 등록/수정/삭제
- 노출 기간 내 ACTIVE 상태인 배너만 메인에 표시
- `display_order`에 따라 Swiper 슬라이드 순서 결정
- 종료일이 지나면 자동 비활성 처리 (배치 또는 조회 시 필터)

**관련 유즈케이스**:

- UC-A15: 배너 관리 (등록, 수정, 삭제, 순서 변경)

**인덱스**:

- `idx_banners_status_order`: (status, display_order)
- `idx_banners_period`: (started_at, ended_at)

---

### promotions (프로모션/기획전)

**목적**: 기획전 및 프로모션 캠페인 관리

**주요 필드**:

- `promotion_id`: 프로모션 ID (PK, AUTO_INCREMENT)
- `title`: 프로모션 제목
- `description`: 프로모션 설명
- `banner_image_url`: 프로모션 배너 이미지 URL
- `start_date`: 시작일
- `end_date`: 종료일
- `status`: 상태 (ACTIVE, ENDED)
- `created_at`: 등록일시
- `updated_at`: 수정일시

**비즈니스 규칙**:

- 관리자가 기획전 등록/수정
- 기간 내 ACTIVE 상태인 프로모션만 노출
- 종료일 경과 시 `status=ENDED`로 변경
- 프로모션에 포함된 상품은 `promotion_products`에서 관리

**관련 유즈케이스**:

- UC-A16: 프로모션 관리 (등록, 수정, 상품 추가/제거)

**인덱스**:

- `idx_promotions_status_period`: (status, start_date, end_date)

---

### promotion_products (프로모션 상품)

**목적**: 프로모션/기획전에 포함된 상품 매핑

**주요 필드**:

- `promotion_product_id`: 프로모션 상품 ID (PK, AUTO_INCREMENT)
- `promotion_id`: 프로모션 ID (FK → promotions)
- `product_id`: 상품 ID (FK → products)
- `sort_order`: 노출 순서
- `created_at`: 등록일시
- `updated_at`: 수정일시

**비즈니스 규칙**:

- 하나의 프로모션에 여러 상품 포함 가능
- 동일 프로모션 + 동일 상품 중복 불가 (promotion_id + product_id UNIQUE)
- `sort_order`에 따라 상품 노출 순서 결정

**관련 유즈케이스**:

- UC-A16: 프로모션 상품 관리

**인덱스**:

- `idx_promotion_products_promotion`: promotion_id
- `idx_promotion_products_unique`: (promotion_id, product_id) UNIQUE