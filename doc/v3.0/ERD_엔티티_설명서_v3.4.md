# ERD 엔티티 설명서 v3.4

> MySQL 8.0 기준 | 작성일: 2026-01-29

## 변경 이력

| 버전 | 변경 내용 |
|------|-----------|
| v3.3 | `users.role` ENUM 컬럼을 `roles` 테이블로 분리, `users.role_id` FK 참조로 변경 |
| v3.4 | users ↔ roles 다대다(N:M) 관계로 변경: `users.role_id` 삭제, `user_roles` 중간 테이블 추가 |

## 엔티티 상세 설명

---

## 3.1 사용자 모듈

### roles (역할)

**목적**: 사용자 역할 유형 관리 (고객, 마트 사장, 배달원, 관리자)

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 역할 고유 식별자 | 1 |
| role_name | VARCHAR(30) | NOT NULL, UNIQUE | 역할명 | CUSTOMER |
| description | VARCHAR(100) | NULL | 역할 설명 | 일반 고객 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-01 00:00:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-01 00:00:00 |

**초기 데이터**:

| id | role_name | description |
|----|-----------|-------------|
| 1 | CUSTOMER | 일반 고객 |
| 2 | STORE_OWNER | 마트 사장님 |
| 3 | RIDER | 배달원 |
| 4 | ADMIN | 관리자 |

**비즈니스 규칙**:

- 역할명은 시스템 전체에서 유일 (UNIQUE 제약)
- 초기 4개 역할은 시스템 시드 데이터로 생성

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| uq_roles_role_name | role_name | UNIQUE | 역할명 유일 |

---

### user_roles (사용자 역할 매핑)

**목적**: 사용자와 역할 간 다대다(N:M) 관계 매핑 (1명의 사용자가 여러 역할 보유 가능)

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 사용자 역할 매핑 ID | 1 |
| user_id | BIGINT | FK → users, NOT NULL | 사용자 ID | 1 |
| role_id | BIGINT | FK → roles, NOT NULL | 역할 ID | 1 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-15 10:30:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-15 10:30:00 |

**비즈니스 규칙**:

- 동일 사용자에게 동일 역할 중복 부여 불가 (user_id + role_id UNIQUE)
- 1명의 사용자는 여러 역할 보유 가능 (예: CUSTOMER + STORE_OWNER)
- 회원가입 시 기본 역할(CUSTOMER) 자동 부여

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| uq_user_roles_user_role | (user_id, role_id) | UNIQUE | 사용자+역할 중복 방지 |
| idx_user_roles_user | user_id | INDEX | 사용자별 역할 조회 |
| idx_user_roles_role | role_id | INDEX | 역할별 사용자 조회 |

---

### users (사용자)

**목적**: 시스템 전체 사용자 계정 관리 (고객, 마트 사장, 배달원, 관리자)

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 사용자 고유 식별자 | 1 |
| email | VARCHAR(255) | NOT NULL, UNIQUE | 이메일 주소 (로그인 ID) | user@example.com |
| password | VARCHAR(255) | NOT NULL | BCrypt 해시 비밀번호 | $2b$10$abcdef... |
| name | VARCHAR(50) | NOT NULL | 사용자 이름 | 김서연 |
| phone | VARCHAR(20) | NOT NULL, UNIQUE | 휴대폰 번호 (인증 필요) | 010-1234-5678 |
| status | ENUM('ACTIVE','INACTIVE','SUSPENDED','PENDING') | NOT NULL, DEFAULT 'ACTIVE' | 계정 상태 | ACTIVE |
| terms_agreed | TINYINT(1) | NOT NULL, DEFAULT 0 | 이용약관 동의 여부 | 1 |
| privacy_agreed | TINYINT(1) | NOT NULL, DEFAULT 0 | 개인정보처리방침 동의 여부 | 1 |
| terms_agreed_at | DATETIME | NULL | 약관 동의 일시 | 2026-01-15 10:30:00 |
| privacy_agreed_at | DATETIME | NULL | 개인정보 동의 일시 | 2026-01-15 10:30:00 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-15 10:30:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-15 10:30:00 |
| deleted_at | DATETIME | NULL | 탈퇴일시 (Soft Delete) | NULL |

**비즈니스 규칙**:

- **BR-U01**: 이메일과 휴대폰 번호는 시스템 전체에서 유일 (UNIQUE 제약)
- 회원가입 시 휴대폰 인증 필수 (최대 5회 인증번호 발송)
- Soft Delete 지원 (`deleted_at` NULL 체크)
- 이용약관 및 개인정보처리방침 동의 필수

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_users_email | email | UNIQUE | 이메일 로그인 조회 |
| idx_users_phone | phone | UNIQUE | 전화번호 중복 체크 |
| idx_users_status | status | INDEX | 계정 상태별 조회 |
| idx_users_deleted_at | deleted_at | INDEX | Soft Delete 필터 |

---

### addresses (배송 주소)

**목적**: 고객의 배송 주소 관리 (최대 5개)

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 주소 고유 식별자 | 1 |
| user_id | BIGINT | FK → users, NOT NULL | 사용자 ID | 1 |
| contact | VARCHAR(20) | NOT NULL | 배송지 연락처 | 010-1234-5678 |
| address_name | VARCHAR(50) | NOT NULL | 주소 별칭 | 집 |
| postal_code | VARCHAR(10) | NOT NULL | 우편번호 | 06234 |
| address_line1 | VARCHAR(255) | NOT NULL | 기본 주소 (도로명/지번) | 서울시 강남구 테헤란로 123 |
| address_line2 | VARCHAR(255) | NULL | 상세 주소 (동/호수) | 101동 1501호 |
| latitude | DECIMAL(10,7) | NULL | 위도 (-90 ~ 90) | 37.5012743 |
| longitude | DECIMAL(11,7) | NULL | 경도 (-180 ~ 180) | 127.0396857 |
| is_default | TINYINT(1) | NOT NULL, DEFAULT 0 | 기본 배송지 여부 | 1 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-15 10:30:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-15 10:30:00 |

**비즈니스 규칙**:

- **BR-U02**: 고객당 최대 5개 배송 주소 (애플리케이션 레벨 검증)
- **BR-U03**: 기본 배송지 1개 (`is_default` 플래그)
- 주소 중복 방지 (동일 사용자 + 동일 주소)
- 주소 별칭 중복 방지 (동일 사용자 + 동일 별칭)

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_addresses_user_id | user_id | INDEX | 사용자별 주소 조회 |
| idx_addresses_user_default | (user_id, is_default) | INDEX | 기본 배송지 조회 |
| uq_addresses_user_address | (user_id, address_line1, address_line2) | UNIQUE | 주소 중복 방지 |
| uq_addresses_user_name | (user_id, address_name) | UNIQUE | 별칭 중복 방지 |

---

### social_logins (소셜 로그인)

**목적**: 소셜 계정 연동 정보 관리 (Kakao, Naver, Google, Apple)

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 소셜 로그인 ID | 1 |
| user_id | BIGINT | FK → users, NOT NULL | 사용자 ID | 1 |
| provider | ENUM('KAKAO','NAVER','GOOGLE','APPLE') | NOT NULL | 소셜 제공자 | KAKAO |
| provider_user_id | VARCHAR(255) | NOT NULL | 제공자 측 사용자 ID | 1234567890 |
| connected_at | DATETIME | NOT NULL | 연동일시 | 2026-01-15 10:30:00 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-15 10:30:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-15 10:30:00 |
| deleted_at | DATETIME | NULL | 삭제일시 | NULL |

**비즈니스 규칙**:

- 동일 제공자의 동일 사용자 ID는 유일 (provider + provider_user_id UNIQUE)
- 토큰은 암호화하여 저장

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_social_logins_user_id | user_id | INDEX | 사용자별 소셜 계정 조회 |
| uq_social_provider_user | (provider, provider_user_id) | UNIQUE | 제공자+사용자ID 유일 |

---

## 3.2 마트 모듈

### stores (마트)

**목적**: 로컬 마트 정보 및 운영 상태 관리

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 마트 고유 식별자 | 1 |
| owner_id | BIGINT | FK → users, NOT NULL, UNIQUE | 마트 사장님 ID (1:1) | 5 |
| store_name | VARCHAR(100) | NOT NULL | 마트 상호명 | 싱싱 야채 센터 |
| business_number | VARCHAR(12) | NOT NULL, UNIQUE | 사업자등록번호 (10자리) | 123-45-67890 |
| representative_name | VARCHAR(50) | NOT NULL | 대표자명 | 홍길동 |
| representative_phone | VARCHAR(20) | NOT NULL | 대표자 연락처 | 010-9999-8888 |
| phone | VARCHAR(20) | NULL | 마트 연락처 | 02-1234-5678 |
| telecom_sales_report_number | VARCHAR(50) | NULL | 통신판매업 신고번호 | 2026-서울강남-0001 |
| description | TEXT | NULL | 마트 소개 | 신선한 야채를 매일 공급합니다 |
| address_line1 | VARCHAR(255) | NOT NULL | 기본 주소 | 서울시 강남구 테헤란로 123 |
| address_line2 | VARCHAR(255) | NULL | 상세 주소 | 1층 |
| postal_code | VARCHAR(10) | NOT NULL | 우편번호 | 06234 |
| latitude | DECIMAL(10,7) | NULL | 마트 위도 | 37.5012743 |
| longitude | DECIMAL(11,7) | NULL | 마트 경도 | 127.0396857 |
| settlement_bank_name | VARCHAR(50) | NULL | 정산 은행명 | 국민은행 |
| settlement_bank_account | VARCHAR(255) | NULL | 정산 계좌번호 (암호화) | ENC(1234567890) |
| settlement_account_holder | VARCHAR(50) | NULL | 정산 예금주 | 홍길동 |
| store_image | VARCHAR(500) | NULL | 마트사진 URL(대표 이미지) | https://cdn.example.com/store1.jpg |
| review_count | INT | NOT NULL, DEFAULT 0 | 리뷰 수 | 128 |
| status | ENUM('PENDING','APPROVED','REJECTED','SUSPENDED') | NOT NULL, DEFAULT 'PENDING' | 마트 승인 상태 | APPROVED |
| is_delivery_available | TINYINT(1) | NOT NULL, DEFAULT 0 | 현재 배달 가능 여부 | 1 |
| is_active | ENUM('ACTIVE','INACTIVE','CLOSED') | NOT NULL, DEFAULT 'INACTIVE' | 마트 영업 상태 | ACTIVE |
| commission_rate | DECIMAL(5,2) | NOT NULL, DEFAULT 5.00 | 마트 수수료율 (%) | 5.00 |
| deleted_at | DATETIME | NULL | 삭제일시(소프트 delete) | NULL |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-10 09:00:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-15 10:30:00 |

**비즈니스 규칙**:

- **BR-S01**: 사업자등록번호 유일성 (UNIQUE 제약)
- 1명의 사용자는 1개의 마트만 소유 (`owner_id` UNIQUE)
- 마트 승인 전까지 `status='PENDING'`
- 정산 계좌번호는 암호화 저장 - 확장 기능

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| uq_stores_owner_id | owner_id | UNIQUE | 사장님 1:1 제약 |
| uq_stores_business_number | business_number | UNIQUE | 사업자번호 유일 |
| idx_stores_status_active | (status, is_active) | INDEX | 승인+영업 상태 조회 |
| idx_stores_location | (latitude, longitude) | INDEX | 주변 마트 검색 |

---

### store_business_hours (영업시간)

**목적**: 마트의 요일별 영업시간 관리

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 영업시간 ID | 1 |
| store_id | BIGINT | FK → stores, NOT NULL | 마트 ID | 1 |
| day_of_week | TINYINT | NOT NULL, CHECK (0~6) | 요일 (0=일 ~ 6=토) | 1 |
| open_time | TIME | NULL | 오픈 시간 | 09:00:00 |
| close_time | TIME | NULL | 마감 시간 | 22:00:00 |
| is_closed | TINYINT(1) | NOT NULL, DEFAULT 0 | 휴무 여부 | 0 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-10 09:00:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-15 10:30:00 |

**비즈니스 규칙**:

- 마트별로 요일당 1개의 영업시간 (store_id + day_of_week UNIQUE)
- `close_time > open_time` (CHECK 제약)
- 휴무일에는 `is_closed=true`

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| uq_business_hours_store_day | (store_id, day_of_week) | UNIQUE | 마트+요일 유일 |

---

## 3.3 상품 모듈

### categories (카테고리)

**목적**: 상품 분류 계층 구조 관리

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 카테고리 ID | 1 |
| category_name | VARCHAR(50) | NOT NULL | 카테고리명 | 과일/채소 |
| icon_url | VARCHAR(500) | NULL | 아이콘 이미지 URL | https://cdn.example.com/icons/fruit.png |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-01 00:00:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-01 00:00:00 |

**비즈니스 규칙**: (없음)

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| uq_categories_name | category_name | UNIQUE | 카테고리명 유일 |

---

### products (상품)

**목적**: 마트별 판매 상품 정보 관리

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 상품 ID | 1 |
| store_id | BIGINT | FK → stores, NOT NULL | 마트 ID | 1 |
| category_id | BIGINT | FK → categories, NOT NULL | 카테고리 ID | 3 |
| product_name | VARCHAR(200) | NOT NULL | 상품명 | 유기농 방울토마토 500g |
| description | TEXT | NULL | 상품 설명 | 당도 높은 국내산 방울토마토 |
| price | DECIMAL(12,2) | NOT NULL, CHECK (> 0) | 정가 | 5900.00 |
| sale_price | DECIMAL(12,2) | NULL | 할인가 | 4900.00 |
| discount_rate | DECIMAL(5,2) | NULL | 할인율 (%) | 16.95 |
| stock | INT | NOT NULL, DEFAULT 0 | 재고 수량 | 50 |
| unit | VARCHAR(30) | NULL | 판매 단위 | 500g |
| origin | VARCHAR(100) | NULL | 원산지 | 국내산(경남 진주) |
| is_active | TINYINT(1) | NOT NULL, DEFAULT 1 | 상품 노출 여부 | 1 |
| order_count | INT | NOT NULL, DEFAULT 0 | 주문수 | 234 |
| product_image_url | VARCHAR(500) | NULL | 상품 이미지 URL | https://cdn.example.com/prod1.jpg |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-10 09:00:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-15 10:30:00 |

**비즈니스 규칙**:

- **BR-S04**: 가격 > 0 (CHECK 제약)
- **BR-S06**: 재고 0 = 품절 (애플리케이션 레벨)

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_products_store_category | (store_id, category_id) | INDEX | 마트+카테고리별 상품 조회 |
| idx_products_store_active | (store_id, is_active) | INDEX | 마트별 노출 상품 조회 |
| ft_products_name | product_name | FULLTEXT | 상품명 전문 검색 |

---

## 3.4 주문 모듈

### orders (주문)

**목적**: 고객의 주문 정보 및 주문 상태 관리

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 주문 ID | 1 |
| order_number | VARCHAR(30) | NOT NULL, UNIQUE | 주문번호 | ORD-20260127-001 |
| user_id | BIGINT | FK → users, NOT NULL | 고객 ID | 1 |
| order_type | ENUM('REGULAR','SUBSCRIPTION') | NOT NULL, DEFAULT 'REGULAR' | 주문 타입 | REGULAR |
| status | ENUM('PENDING','PAID','PARTIAL_CANCELLED','CANCELLED','COMPLETED') | NOT NULL, DEFAULT 'PENDING' | 주문 상태 | PAID |
| total_product_price | DECIMAL(12,2) | NOT NULL | 총 주문 금액 | 25800.00 |
| total_delivery_fee | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | 총 배달비 | 3000.00 |
| final_price | DECIMAL(12,2) | NOT NULL | 최종 결제 금액 | 28800.00 |
| delivery_address | VARCHAR(500) | NOT NULL | 배송 주소 | 서울시 강남구 테헤란로 123 101동 1501호 |
| delivery_latitude | DECIMAL(10,7) | NULL | 배송지 위도 | 37.5012743 |
| delivery_longitude | DECIMAL(11,7) | NULL | 배송지 경도 | 127.0396857 |
| delivery_request | VARCHAR(500) | NULL | 배송 요청사항 | 문 앞에 놓아주세요 |
| ordered_at | DATETIME | NOT NULL | 주문일시 | 2026-01-27 14:30:00 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-27 14:30:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-27 14:30:00 |

**비즈니스 규칙**:

- **BR-O01**: 취소는 ACCEPTED 전까지만 가능
- **BR-O03**: final_price = total_product_price + total_delivery_fee
- 구독 주문은 자동 생성 (`order_type=SUBSCRIPTION`)

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| uq_orders_number | order_number | UNIQUE | 주문번호 유일 |
| idx_orders_user_status | (user_id, status) | INDEX | 고객별 주문 상태 조회 |
| idx_orders_ordered_at | ordered_at | INDEX | 주문일시 정렬 |

---

### store_order (마트별 주문)

**목적**: 주문을 마트 단위로 분리하여 마트별 처리 상태 관리

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 마트별 주문 ID | 1 |
| order_id | BIGINT | FK → orders, NOT NULL | 주문 ID | 1 |
| store_id | BIGINT | FK → stores, NOT NULL | 매장 ID | 3 |
| order_type | ENUM('REGULAR','SUBSCRIPTION') | NOT NULL, DEFAULT 'REGULAR' | 주문 타입 | REGULAR |
| prep_time | INT | NULL | 준비시간 (분) | 15 |
| status | ENUM('PENDING','ACCEPTED','PREPARING','READY','PICKED_UP','DELIVERING','DELIVERED','CANCELLED','REJECTED') | NOT NULL, DEFAULT 'PENDING' | 마트 주문 상태 | PREPARING |
| store_product_price | DECIMAL(12,2) | NOT NULL | 구매 상품 합계 금액 | 15800.00 |
| delivery_fee | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | 배달비 | 3000.00 |
| final_price | DECIMAL(12,2) | NOT NULL | 최종 결제 금액 | 18800.00 |
| accepted_at | DATETIME | NULL | 주문 접수 일시 | 2026-01-27 14:32:00 |
| prepared_at | DATETIME | NULL | 준비 완료 일시 | 2026-01-27 14:47:00 |
| picked_up_at | DATETIME | NULL | 픽업 완료 일시 | 2026-01-27 14:55:00 |
| delivered_at | DATETIME | NULL | 배달 완료 일시 | 2026-01-27 15:10:00 |
| cancelled_at | DATETIME | NULL | 취소 발생 일시 | NULL |
| cancel_reason | VARCHAR(500) | NULL | 취소 사유 | NULL |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-27 14:30:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-27 14:47:00 |

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_store_order_order_id | order_id | INDEX | 주문별 마트주문 조회 |
| idx_store_order_store_status | (store_id, status) | INDEX | 마트별 주문 상태 조회 |

---

### order_products (주문 상품)

**목적**: 주문에 포함된 상품 목록 및 가격 스냅샷

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 주문 상품 ID | 1 |
| store_order_id | BIGINT | FK → store_order, NOT NULL | 마트별 주문 ID | 1 |
| product_id | BIGINT | FK → products, NOT NULL | 상품 ID | 10 |
| product_name_snapshot | VARCHAR(200) | NOT NULL | 결제 당시 상품명 | 유기농 방울토마토 500g |
| price_snapshot | DECIMAL(12,2) | NOT NULL | 결제 당시 가격 | 4900.00 |
| quantity | INT | NOT NULL, CHECK (>= 1) | 결제 수량 | 2 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-27 14:30:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-27 14:30:00 |

**비즈니스 규칙**:

- **BR-O06**: 주문 시점 상품 정보 스냅샷 저장
- `quantity >= 1` (CHECK 제약)

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_order_products_store_order | store_order_id | INDEX | 마트주문별 상품 조회 |
| idx_order_products_product | product_id | INDEX | 상품별 주문 이력 |

---

### cart (장바구니)

**목적**: 고객의 장바구니 관리 (마트별 분리)

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 장바구니 ID | 1 |
| user_id | BIGINT | FK → users, NOT NULL, UNIQUE | 고객 ID (1:1) | 1 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-27 13:00:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-27 14:00:00 |

**비즈니스 규칙**:

- 장바구니는 마트별로 분리 (한 번에 여러 마트 주문 가능)
- `quantity >= 1` (CHECK 제약)

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| uq_cart_user | user_id | UNIQUE | 고객 1:1 장바구니 |

---

### cart_products (장바구니 상품)

**목적**: 장바구니에 담긴 상품 목록

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 장바구니 상품 ID | 1 |
| cart_id | BIGINT | FK → cart, NOT NULL | 장바구니 ID | 1 |
| product_id | BIGINT | FK → products, NOT NULL | 상품 ID | 10 |
| store_id | BIGINT | FK → stores, NOT NULL | 마트 ID | 3 |
| quantity | INT | NOT NULL, CHECK (>= 1) | 수량 | 2 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-27 13:00:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-27 14:00:00 |

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_cart_products_cart | cart_id | INDEX | 장바구니별 상품 조회 |
| uq_cart_products_cart_product | (cart_id, product_id) | UNIQUE | 장바구니+상품 중복 방지 |
| idx_cart_products_store | store_id | INDEX | 마트별 장바구니 조회 |

---

## 3.5 결제 모듈

### payments (결제)

**목적**: 주문에 대한 결제 정보 관리 (PG 연동)

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 결제 ID | 1 |
| order_id | BIGINT | FK → orders, NOT NULL, UNIQUE | 주문 ID (1:1) | 1 |
| payment_method | ENUM('CARD','KAKAO_PAY','NAVER_PAY','TOSS_PAY') | NOT NULL | 결제 수단 | CARD |
| payment_status | ENUM('PENDING','COMPLETED','FAILED','CANCELLED','PARTIAL_REFUNDED','REFUNDED') | NOT NULL, DEFAULT 'PENDING' | 결제 상태 | COMPLETED |
| amount | DECIMAL(12,2) | NOT NULL | 결제 금액 | 28800.00 |
| pg_provider | VARCHAR(50) | NULL | PG사 | tosspayments |
| pg_transaction_id | VARCHAR(100) | NULL | PG 거래 ID | txn_20260127_abc123 |
| card_company | VARCHAR(50) | NULL | 카드사 | 삼성카드 |
| card_number_masked | VARCHAR(30) | NULL | 마스킹된 카드번호 | 1234-****-****-5678 |
| receipt_url | VARCHAR(500) | NULL | 영수증 URL | https://pg.example.com/receipt/abc |
| paid_at | DATETIME | NULL | 결제 완료일시 | 2026-01-27 14:30:05 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-27 14:30:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-27 14:30:05 |

**비즈니스 규칙**:

- **BR-P01**: 배송 시작 전까지만 전액 취소 가능
- 1개의 주문은 1개의 결제 (`order_id` UNIQUE)

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| uq_payments_order | order_id | UNIQUE | 주문 1:1 결제 |
| idx_payments_status | payment_status | INDEX | 결제 상태별 조회 |
| idx_payments_pg_txn | pg_transaction_id | INDEX | PG 거래 ID 조회 |

---

### payment_refunds (결제 환불)

**목적**: 결제에 대한 환불 내역 관리

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 환불 ID | 1 |
| payment_id | BIGINT | FK → payments, NOT NULL | 결제 ID | 1 |
| store_order_id | BIGINT | FK → store_order, NOT NULL | 마트별 주문 ID | 1 |
| refund_amount | DECIMAL(12,2) | NOT NULL | 환불 금액 | 15800.00 |
| refund_reason | VARCHAR(500) | NULL | 환불 사유 | 고객 단순 변심 |
| refunded_at | DATETIME | NULL | 환불 완료 일시 | 2026-01-27 15:00:00 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-27 14:55:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-27 15:00:00 |

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_refunds_payment | payment_id | INDEX | 결제별 환불 조회 |
| idx_refunds_store_order | store_order_id | INDEX | 마트주문별 환불 조회 |

---

### payment_methods (저장된 결제수단)

**목적**: 고객의 저장된 결제수단 관리 (빌링키)

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 결제수단 ID | 1 |
| user_id | BIGINT | FK → users, NOT NULL | 고객 ID | 1 |
| method_type | ENUM('CARD','KAKAO_PAY','NAVER_PAY','TOSS_PAY') | NOT NULL | 결제수단 유형 | CARD |
| billing_key | VARCHAR(255) | NOT NULL | 빌링키 (PG사 제공, 암호화) | ENC(bk_abc123def) |
| card_company | VARCHAR(50) | NULL | 카드사 | 삼성카드 |
| card_number_masked | VARCHAR(30) | NULL | 마스킹된 카드번호 | 1234-****-****-5678 |
| is_default | TINYINT(1) | NOT NULL, DEFAULT 0 | 기본 결제수단 여부 | 1 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-10 09:00:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-15 10:30:00 |

**비즈니스 규칙**:

- 동일 고객 + 동일 빌링키는 1개 (user_id + billing_key UNIQUE)
- 기본 결제수단 1개 (`is_default`)

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_payment_methods_user | user_id | INDEX | 고객별 결제수단 조회 |
| uq_payment_methods_billing | (user_id, billing_key) | UNIQUE | 빌링키 중복 방지 |
| idx_payment_methods_default | (user_id, is_default) | INDEX | 기본 결제수단 조회 |

---

## 3.6 배달 모듈

### riders (배달원)

**목적**: 배달원 정보 및 운행 상태 관리

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 배달원 ID | 1 |
| user_id | BIGINT | FK → users, NOT NULL, UNIQUE | 사용자 ID (1:1) | 10 |
| id_card_verified | TINYINT(1) | NOT NULL, DEFAULT 0 | 신분증 인증 여부 | 1 |
| id_card_image | VARCHAR(500) | NULL | 신분증 이미지 URL (암호화) | ENC(https://cdn.example.com/id1.jpg) |
| operation_status | ENUM('OFFLINE','ONLINE') | NOT NULL, DEFAULT 'OFFLINE' | 운행 상태 | ONLINE |
| bank_name | VARCHAR(50) | NULL | 정산 은행명 | 카카오뱅크 |
| bank_account | VARCHAR(255) | NULL | 정산 계좌번호 (암호화) | ENC(3333-01-1234567) |
| account_holder | VARCHAR(50) | NULL | 예금주 | 박배달 |
| status | ENUM('PENDING','APPROVED','REJECTED','SUSPENDED') | NOT NULL, DEFAULT 'PENDING' | 배달원 상태 | APPROVED |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-05 10:00:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-10 09:00:00 |

**비즈니스 규칙**:

- **BR-U04**: 신분증 인증 후 승인
- 1명의 사용자는 1명의 배달원 (`user_id` UNIQUE)

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| uq_riders_user | user_id | UNIQUE | 사용자 1:1 배달원 |
| idx_riders_status | status | INDEX | 승인 상태별 조회 |
| idx_riders_operation | operation_status | INDEX | 운행 상태별 조회 |

---

### deliveries (배달)

**목적**: 주문에 대한 배달 정보 및 배달 상태 관리

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 배달 ID | 1 |
| store_order_id | BIGINT | FK → store_order, NOT NULL, UNIQUE | 마트별 주문 ID (1:1) | 1 |
| rider_id | BIGINT | FK → riders, NOT NULL | 배달원 ID | 5 |
| status | ENUM('REQUESTED','ACCEPTED','PICKED_UP','DELIVERING','DELIVERED','CANCELLED') | NOT NULL, DEFAULT 'REQUESTED' | 배달 상태 | DELIVERING |
| delivery_fee | DECIMAL(12,2) | NOT NULL | 배달비 | 3000.00 |
| rider_earning | DECIMAL(12,2) | NOT NULL | 배달원 수익 | 2700.00 |
| distance_km | DECIMAL(5,2) | NULL | 배달 거리 (km) | 2.30 |
| estimated_minutes | INT | NULL | 예상 소요시간 (분) | 15 |
| requested_at | DATETIME | NOT NULL | 배달 요청일시 | 2026-01-27 14:47:00 |
| accepted_at | DATETIME | NULL | 배달 수락일시 | 2026-01-27 14:48:00 |
| picked_up_at | DATETIME | NULL | 픽업 완료일시 | 2026-01-27 14:55:00 |
| delivered_at | DATETIME | NULL | 배송 완료일시 | 2026-01-27 15:10:00 |
| cancelled_at | DATETIME | NULL | 취소일시 | NULL |
| cancel_reason | VARCHAR(500) | NULL | 취소 사유 | NULL |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-27 14:47:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-27 15:10:00 |

**비즈니스 규칙**:

- **BR-D01**: 배달원은 동시 최대 3건
- 1개의 가게 주문은 1개의 배달 (`store_order_id` UNIQUE)

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| uq_deliveries_store_order | store_order_id | UNIQUE | 마트주문 1:1 배달 |
| idx_deliveries_rider_status | (rider_id, status) | INDEX | 배달원별 배달 상태 |
| idx_deliveries_status | status | INDEX | 배달 상태별 조회 |

---

### rider_locations (배달원 위치) - Redis GEO / Redis pub/sub

**목적**: 배달원 실시간 위치 추적 (3-5초 간격 수집)

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 위치 기록 ID | 1 |
| rider_id | BIGINT | FK → riders, NOT NULL | 배달원 ID | 5 |
| delivery_id | BIGINT | FK → deliveries, NULL | 현재 배달 ID | 1 |
| latitude | DECIMAL(10,7) | NOT NULL | 현재 위도 | 37.5015432 |
| longitude | DECIMAL(11,7) | NOT NULL | 현재 경도 | 127.0401234 |
| accuracy | DECIMAL(6,2) | NULL | GPS 정확도 (m) | 5.50 |
| speed | DECIMAL(5,2) | NULL | 현재 속도 (km/h) | 25.30 |
| heading | DECIMAL(5,2) | NULL | 이동 방향 (0~360) | 180.00 |
| recorded_at | DATETIME | NOT NULL | 기록일시 | 2026-01-27 15:00:05 |
| is_current | TINYINT(1) | NOT NULL, DEFAULT 1 | 현재 위치 여부 | 1 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-27 15:00:05 |

**비즈니스 규칙**:

- **BR-D03**: 3-5초 간격으로 위치 수집
- **BR-D05**: 14일 후 자동 삭제 (배치 작업)

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_rider_loc_rider_time | (rider_id, recorded_at) | INDEX | 배달원별 위치 이력 |
| idx_rider_loc_delivery_current | (delivery_id, is_current) | INDEX | 배달별 현재 위치 |
| idx_rider_loc_recorded | recorded_at | INDEX | 삭제 배치용 |

---

## 3.7 구독 모듈

### subscription_products (구독 상품)

**목적**: 마트에서 제공하는 구독 상품 정의

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 구독 상품 ID | 1 |
| store_id | BIGINT | FK → stores, NOT NULL | 마트 ID | 1 |
| subscription_product_name | VARCHAR(200) | NOT NULL | 구독 상품명 | 신선 과일 박스 |
| description | TEXT | NULL | 상품 설명 | 매주 엄선된 제철 과일 배송 |
| price | DECIMAL(12,2) | NOT NULL, CHECK (> 0) | 구독 가격 | 29900.00 |
| total_delivery_count | INT | NOT NULL | 월간 총 배송 횟수 | 4 |
| delivery_day_of_week | TINYINT | NULL | 배송 요일 (0=일 ~ 6=토) | 1 |
| status | ENUM('ACTIVE','INACTIVE') | NOT NULL, DEFAULT 'ACTIVE' | 상태 | ACTIVE |
| subscription_url | VARCHAR(500) | NULL | 구독상품 대표 이미지 | https://cdn.example.com/sub1.jpg |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-01 09:00:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-10 09:00:00 |

**비즈니스 규칙**:

- 결제일 다음주 월요일부터 시작
- 구독 갱신 → 시작일 포함 28일 후

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_sub_products_store_status | (store_id, status) | INDEX | 마트별 활성 구독상품 |

---

### subscription_day_of_week (구독 배송 요일)

**목적**: 구독별 배송 요일 관리 (다중 요일 지원)

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| subscription_id | BIGINT | PK(복합), FK → subscriptions | 구독 ID | 1 |
| day_of_week | TINYINT | PK(복합), CHECK (0~6) | 배송 요일 (0=일 ~ 6=토) | 1 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-15 10:30:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-15 10:30:00 |

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| (PK) | (subscription_id, day_of_week) | PRIMARY | 복합 기본키 |

---

### subscription_product_items (구독 상품 구성 품목)

**목적**: 구독 상품에 포함된 일반 상품 목록

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 구독 품목 ID | 1 |
| subscription_product_id | BIGINT | FK → subscription_products, NOT NULL | 구독 상품 ID | 1 |
| product_id | BIGINT | FK → products, NOT NULL | 상품 ID | 5 |
| quantity | INT | NOT NULL, CHECK (>= 1) | 수량 | 3 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-01 09:00:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-01 09:00:00 |

**비즈니스 규칙**:

- 구독 상품 = 여러 일반 상품의 조합
- 예: "신선 과일 박스" = 사과 3개 + 배 2개 + 귤 5개

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_sub_items_sub_product | subscription_product_id | INDEX | 구독상품별 품목 조회 |
| uq_sub_items_product | (subscription_product_id, product_id) | UNIQUE | 상품 중복 방지 |

---

### subscriptions (정기 배송 구독)

**목적**: 고객의 구독 정보 관리

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 구독 ID | 1 |
| user_id | BIGINT | FK → users, NOT NULL | 고객 ID | 1 |
| store_id | BIGINT | FK → stores, NOT NULL | 마트 ID | 1 |
| subscription_product_id | BIGINT | FK → subscription_products, NOT NULL | 구독 상품 ID | 1 |
| delivery_time_slot | VARCHAR(30) | NULL | 배송 희망 시간대 | 18:00-20:00 |
| address_id | BIGINT | FK → addresses, NOT NULL | 배송 주소 ID | 1 |
| payment_method_id | BIGINT | FK → payment_methods, NOT NULL | 결제수단 ID | 1 |
| status | ENUM('ACTIVE','PAUSED','CANCELLATION_PENDING','CANCELLED') | NOT NULL, DEFAULT 'ACTIVE' | 구독 상태 | ACTIVE |
| next_payment_date | DATE | NULL | 다음 결제 예정일 | 2026-02-15 |
| total_amount | DECIMAL(12,2) | NOT NULL | 정기 결제 금액 | 29900.00 |
| cycle_count | INT | NOT NULL, DEFAULT 1 | 현재 주기 차수 | 3 |
| started_at | DATETIME | NOT NULL | 구독 시작일 | 2026-01-20 00:00:00 |
| paused_at | DATETIME | NULL | 일시정지일 | NULL |
| cancelled_at | DATETIME | NULL | 해지일 | NULL |
| cancel_reason | VARCHAR(500) | NULL | 해지 사유 | NULL |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-15 10:30:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-20 00:00:00 |

**비즈니스 규칙**:

- **BR-SUB01**: 주기 선택 (주간/격주/월간)
- **BR-SUB02**: 건너뛰기는 24시간 전까지
- **BR-SUB03**: 자동 주문 생성은 배송 하루 전 00:00

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_subscriptions_user_status | (user_id, status) | INDEX | 고객별 구독 상태 |
| idx_subscriptions_next_payment | next_payment_date | INDEX | 결제 예정일 배치 조회 |
| idx_subscriptions_store | store_id | INDEX | 마트별 구독 조회 |

---

### subscription_items (구독 상품 목록)

**목적**: 구독에 포함된 상품 목록 (커스터마이징 가능)

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 구독상품 ID | 1 |
| subscription_id | BIGINT | FK → subscriptions, NOT NULL | 구독 ID | 1 |
| product_id | BIGINT | FK → products, NOT NULL | 상품 ID | 5 |
| quantity | INT | NOT NULL, CHECK (>= 1) | 수량 | 3 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-15 10:30:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-15 10:30:00 |

**비즈니스 규칙**:

- 기본은 `subscription_product_items`를 복사하여 생성
- 고객이 수량 조절 또는 상품 추가/제거 가능

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_sub_items_subscription | subscription_id | INDEX | 구독별 상품 조회 |
| uq_sub_items_sub_product | (subscription_id, product_id) | UNIQUE | 구독+상품 중복 방지 |

---

### subscription_history (구독 배송 이력)

**목적**: 구독의 배송 스케줄 및 건너뛰기 이력 추적

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 이력 ID | 1 |
| subscription_id | BIGINT | FK → subscriptions, NOT NULL | 구독 ID | 1 |
| cycle_count | INT | NOT NULL | 몇번째 구독인지 | 3 |
| scheduled_date | DATE | NOT NULL | 배송 예정일 | 2026-02-03 |
| status | ENUM('SCHEDULED','ORDERED','SKIPPED','COMPLETED') | NOT NULL, DEFAULT 'SCHEDULED' | 상태 | ORDERED |
| store_order_id | BIGINT | FK → store_order, NULL | 생성된 주문 ID | 15 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-27 00:00:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-02-03 00:00:00 |

**비즈니스 규칙**:

- 배송 스케줄 생성 → `status=SCHEDULED`
- 건너뛰기 → `status=SKIPPED`
- 자동 주문 생성 → `status=ORDERED`
- 배송 완료 → `status=COMPLETED`

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_sub_history_sub_date | (subscription_id, scheduled_date) | INDEX | 구독별 스케줄 조회 |
| idx_sub_history_store_order | store_order_id | INDEX | 주문 연결 조회 |

---

## 3.8 리뷰 모듈

### reviews (리뷰)

**목적**: 주문에 대한 마트 및 배달 평가 관리

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 리뷰 ID | 1 |
| store_order_id | BIGINT | FK → store_order, NOT NULL, UNIQUE | 마트주문 ID (1:1) | 1 |
| user_id | BIGINT | FK → users, NOT NULL | 작성자 ID | 1 |
| rating | TINYINT | NOT NULL, CHECK (1~5) | 마트 평점 | 5 |
| content | VARCHAR(100) | NULL | 리뷰 내용 | 신선하고 맛있어요! |
| is_visible | TINYINT(1) | NOT NULL, DEFAULT 1 | 노출 여부 | 1 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-27 16:00:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-27 16:00:00 |

**비즈니스 규칙**:

- **BR-R01**: 배송완료 후 7일 이내 작성/수정/삭제 가능
- **BR-R02**: 주문당 1개 리뷰 (`store_order_id` UNIQUE)
- **BR-R04**: 평점 1~5 (CHECK 제약)

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| uq_reviews_store_order | store_order_id | UNIQUE | 마트주문 1:1 리뷰 |
| idx_reviews_user | user_id | INDEX | 작성자별 리뷰 조회 |

---

## 3.9 정산 모듈

### settlements (정산)

**목적**: 마트 및 배달원에 대한 정산 관리

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 정산 ID | 1 |
| target_type | ENUM('STORE','RIDER') | NOT NULL | 정산 대상 유형 | STORE |
| target_id | BIGINT | NOT NULL | 마트 ID 또는 배달원 ID | 3 |
| settlement_period_start | DATE | NOT NULL | 정산 기간 시작일 | 2026-01-01 |
| settlement_period_end | DATE | NOT NULL | 정산 기간 종료일 | 2026-01-07 |
| total_sales | DECIMAL(12,2) | NOT NULL | 총 매출/수익 | 1500000.00 |
| platform_fee | DECIMAL(12,2) | NOT NULL | 플랫폼 수수료 | 75000.00 |
| settlement_amount | DECIMAL(12,2) | NOT NULL | 정산 금액 | 1425000.00 |
| status | ENUM('PENDING','COMPLETED','FAILED') | NOT NULL, DEFAULT 'PENDING' | 정산 상태 | COMPLETED |
| bank_name | VARCHAR(50) | NULL | 입금 은행 | 국민은행 |
| bank_account | VARCHAR(255) | NULL | 입금 계좌 (암호화) | ENC(1234567890) |
| settled_at | DATETIME | NULL | 정산 완료일시 | 2026-01-10 09:00:00 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-08 00:00:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-10 09:00:00 |

**비즈니스 규칙**:

- **BR-P04**: 마트는 월단위 정산, 배달원은 주단위 정산
- **BR-P05**: 수수료 - 마트 5~8%, 배달원 10%
- `settlement_amount = total_sales - platform_fee`

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_settlements_target_period | (target_type, target_id, settlement_period_start) | INDEX | 대상별 기간 정산 조회 |
| idx_settlements_status | status | INDEX | 정산 상태별 조회 |

---

### settlement_details (정산 상세)

**목적**: 정산에 포함된 개별 주문/배달 내역

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 상세 ID | 1 |
| settlement_id | BIGINT | FK → settlements, NOT NULL | 정산 ID | 1 |
| store_order_id | BIGINT | FK → store_order, NOT NULL | 마트별 주문 ID | 10 |
| amount | DECIMAL(12,2) | NOT NULL | 금액 | 18800.00 |
| fee | DECIMAL(12,2) | NOT NULL | 수수료 | 940.00 |
| net_amount | DECIMAL(12,2) | NOT NULL | 순수익 | 17860.00 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-08 00:00:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-08 00:00:00 |

**비즈니스 규칙**:

- `net_amount = amount - fee`

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_settlement_details_settlement | settlement_id | INDEX | 정산별 상세 조회 |
| idx_settlement_details_store_order | store_order_id | INDEX | 주문별 정산 조회 |

---

## 3.10 승인 관리 모듈

### approval_documents (승인 서류)

**목적**: 마트 및 배달원 승인용 서류 통합 관리

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 서류 ID | 1 |
| applicant_type | ENUM('STORE','RIDER') | NOT NULL | 신청자 유형 | STORE |
| approval_id | BIGINT | FK → approvals, NOT NULL | 승인 이력 ID | 1 |
| document_type | ENUM('BUSINESS_LICENSE','BUSINESS_REPORT','BANK_PASSBOOK','ID_CARD') | NOT NULL | 서류 유형 | BUSINESS_LICENSE |
| document_url | VARCHAR(500) | NOT NULL | 서류 파일 URL | https://cdn.example.com/docs/biz_reg.pdf |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-10 09:00:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-10 09:00:00 |

**비즈니스 규칙**:

- 마트와 배달원의 승인 서류를 통합 관리
- 서류 유형별로 검증 상태 관리

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_approval_docs_approval | approval_id | INDEX | 승인건별 서류 조회 |
| uq_approval_docs_type | (approval_id, document_type) | UNIQUE | 승인건+서류유형 유일 |

---

### approvals (승인 이력)

**목적**: 마트, 라이더 승인 요청 및 처리 이력 추적

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 승인 이력 ID | 1 |
| user_id | BIGINT | FK → users, NOT NULL | 신청자 사용자 ID | 5 |
| applicant_type | ENUM('MART','RIDER') | NOT NULL | 신청자 유형 | MART |
| status | ENUM('PENDING','APPROVED','REJECTED','HELD') | NOT NULL, DEFAULT 'PENDING' | 승인 상태 | APPROVED |
| reason | TEXT | NULL | 승인/반려 사유 | 서류 확인 완료 |
| approved_by | BIGINT | FK → users, NULL | 처리 관리자 ID | 100 |
| approved_at | DATETIME | NULL | 처리 일시 | 2026-01-12 14:00:00 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-10 09:00:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-12 14:00:00 |

**비즈니스 규칙**:

- 마트, 배달원 승인 이력 추적 (재신청 시 이력 누적)
- 관리자가 승인/반려/보류 처리

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_approvals_user | user_id | INDEX | 사용자별 승인 이력 |
| idx_approvals_status | status | INDEX | 승인 상태별 조회 |
| idx_approvals_type_created | (applicant_type, created_at) | INDEX | 유형별 최신 이력 |

---

## 3.11 기타 모듈

### delivery_photos (배송 완료 사진)

**목적**: 배송 완료 증빙 사진 관리 (24시간 후 자동 삭제)

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 배송 사진 ID | 1 |
| delivery_id | BIGINT | FK → deliveries, NOT NULL | 배달 ID | 1 |
| photo_url | VARCHAR(500) | NOT NULL | 사진 URL | https://cdn.example.com/photos/del1.jpg |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 촬영일시 | 2026-01-27 15:10:00 |
| expires_at | DATETIME | NOT NULL | 삭제 예정일 (촬영 후 24시간) | 2026-01-28 15:10:00 |
| deleted_at | DATETIME | NULL | 실제 삭제일 | NULL |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-27 15:10:00 |

**비즈니스 규칙**:

- 24시간 후 자동 삭제 (배치 작업)

**배치 작업**:

```sql
DELETE FROM delivery_photos
WHERE expires_at < NOW() AND deleted_at IS NULL;
```

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_delivery_photos_delivery | delivery_id | INDEX | 배달별 사진 조회 |
| idx_delivery_photos_expires | (expires_at, deleted_at) | INDEX | 삭제 배치용 |

---

### notifications (알림)

**목적**: 사용자에게 전송되는 알림 관리

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 알림 ID | 1 |
| user_id | BIGINT | FK → users, NOT NULL | 수신자 ID | 1 |
| title | VARCHAR(200) | NOT NULL | 알림 제목 | 주문이 접수되었습니다 |
| content | TEXT | NULL | 알림 내용 | 싱싱 야채 센터에서 주문을 확인했습니다 |
| reference_type | ENUM('RIDER','STORE','CUSTOMER','ORDER','DELIVERY','PROMOTION') | NULL | 참조 대상 유형 | ORDER |
| sent_at | DATETIME | NULL | 발송일시 | 2026-01-27 14:32:00 |
| is_read | TINYINT(1) | NOT NULL, DEFAULT 0 | 읽음 여부 | 0 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-27 14:32:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-27 14:32:00 |

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_notifications_user_read | (user_id, is_read, sent_at) | INDEX | 사용자별 읽음/안읽음 조회 |

---

### notification_broadcasts (전체 알림)

**목적**: 전체 사용자에게 전송되는 알림 관리

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 알림 ID | 1 |
| title | VARCHAR(200) | NOT NULL | 알림 제목 | 서비스 점검 안내 |
| content | TEXT | NULL | 알림 내용 | 1/30 02:00~04:00 서버 점검 예정 |
| reference_type | ENUM('RIDER','STORE','CUSTOMER','ALL') | NOT NULL, DEFAULT 'ALL' | 대상 유형 | ALL |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-28 09:00:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-28 09:00:00 |

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_broadcasts_type_created | (reference_type, created_at) | INDEX | 대상별 최신 알림 조회 |

---

### reports (신고)

**목적**: 마트, 배달원, 리뷰, 주문에 대한 신고 관리

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 신고 ID | 1 |
| store_order_id | BIGINT | FK → store_order, NULL | 관련 주문번호 | 10 |
| reporter_id | BIGINT | FK → users, NOT NULL | 신고자 ID | 1 |
| reporter_type | ENUM('STORE','RIDER','CUSTOMER') | NOT NULL | 신고자 유형 | CUSTOMER |
| target_id | BIGINT | FK → users, NOT NULL | 피신고자 ID | 5 |
| target_type | ENUM('STORE','RIDER','CUSTOMER') | NOT NULL | 피신고 대상 유형 | STORE |
| reason_detail | TEXT | NOT NULL | 상세 사유 | 예상 시간보다 30분이나 늦게 도착 |
| status | ENUM('PENDING','RESOLVED') | NOT NULL, DEFAULT 'PENDING' | 처리 상태 | PENDING |
| report_result | TEXT | NULL | 조치 결과 답변 | NULL |
| resolved_at | DATETIME | NULL | 처리 완료일시 | NULL |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-27 16:00:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-27 16:00:00 |

**비즈니스 규칙**:

- 고객, 마트, 배달원 상호 신고 가능
- 관리자가 신고 검토 및 처리

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_reports_reporter | reporter_id | INDEX | 신고자별 조회 |
| idx_reports_target | (target_type, target_id) | INDEX | 피신고 대상별 조회 |
| idx_reports_status | status | INDEX | 처리 상태별 조회 |

---

### inquiries (1:1 문의)

**목적**: 고객의 1:1 문의 관리

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 문의 ID | 1 |
| user_id | BIGINT | FK → users, NOT NULL | 문의자 ID | 1 |
| category | ENUM('ORDER_PAYMENT','CANCELLATION_REFUND','DELIVERY','SERVICE','OTHER') | NOT NULL | 문의 유형 | DELIVERY |
| title | VARCHAR(200) | NOT NULL | 문의 제목 | 배송이 안 옵니다 |
| content | TEXT | NOT NULL | 문의 내용 | 1시간 전 주문했는데 아직 배송 시작 안됨 |
| file_url | VARCHAR(500) | NULL | 파일 경로 | https://cdn.example.com/attach/q1.jpg |
| status | ENUM('PENDING','ANSWERED') | NOT NULL, DEFAULT 'PENDING' | 처리 상태 | PENDING |
| answer | TEXT | NULL | 답변 내용 | NULL |
| answered_at | DATETIME | NULL | 답변일시 | NULL |
| answered_by | BIGINT | FK → users, NULL | 답변 관리자 ID | NULL |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-27 16:30:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-27 16:30:00 |

**비즈니스 규칙**:

- 고객이 문의 작성
- 관리자가 답변 작성

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_inquiries_user_status | (user_id, status) | INDEX | 고객별 문의 상태 조회 |
| idx_inquiries_status | status | INDEX | 미답변 문의 조회 |

---

### inquiry_attachments (문의 첨부 파일)

**목적**: 1:1 문의에 첨부된 파일 관리

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 첨부 파일 ID | 1 |
| inquiry_id | BIGINT | FK → inquiries, NOT NULL | 문의 ID | 1 |
| file_url | VARCHAR(500) | NOT NULL | 파일 URL | https://cdn.example.com/attach/f1.jpg |
| file_name | VARCHAR(255) | NOT NULL | 파일명 | screenshot_01.jpg |
| file_size | INT | NOT NULL | 파일 크기 (bytes) | 245760 |
| mime_type | VARCHAR(100) | NOT NULL | MIME 타입 | image/jpeg |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-27 16:30:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-27 16:30:00 |

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_inquiry_attachments_inquiry | inquiry_id | INDEX | 문의별 첨부파일 조회 |

---

### notices (공지사항)

**목적**: 플랫폼 공지사항 관리 (서비스 안내, 점검 공지 등)

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 공지사항 ID | 1 |
| title | VARCHAR(200) | NOT NULL | 공지 제목 | 설 연휴 배송 안내 |
| content | TEXT | NOT NULL | 공지 내용 | 1/28~1/30 배송 휴무입니다 |
| author_id | BIGINT | FK → users, NOT NULL | 작성자 ID (관리자) | 100 |
| is_pinned | TINYINT(1) | NOT NULL, DEFAULT 0 | 상단 고정 여부 | 1 |
| status | ENUM('ACTIVE','INACTIVE') | NOT NULL, DEFAULT 'ACTIVE' | 상태 | ACTIVE |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 작성일시 | 2026-01-25 09:00:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-25 09:00:00 |

**비즈니스 규칙**:

- 관리자만 공지사항 작성/수정/삭제 가능
- 상단 고정 공지는 최상단에 노출

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_notices_status_pinned | (status, is_pinned, created_at) | INDEX | 활성+고정 공지 조회 |
| idx_notices_author | author_id | INDEX | 작성자별 조회 |

---

### banners (배너)

**목적**: 메인 페이지 배너/광고 이미지 관리

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 배너 ID | 1 |
| title | VARCHAR(200) | NOT NULL | 배너 제목 | 겨울 딸기 대전 |
| content | TEXT | NULL | 배너 설명 텍스트 | 달콤한 겨울 딸기를 만나보세요 |
| image_url | VARCHAR(500) | NOT NULL | 배너 이미지 URL | https://cdn.example.com/banners/winter.jpg |
| link_url | VARCHAR(500) | NULL | 클릭 시 이동 URL | /promotions/1 |
| background_color | VARCHAR(50) | NULL | 배경 색상/그라디언트 | linear-gradient(135deg, #667eea, #764ba2) |
| display_order | INT | NOT NULL, DEFAULT 0 | 노출 순서 | 1 |
| status | ENUM('ACTIVE','INACTIVE') | NOT NULL, DEFAULT 'ACTIVE' | 상태 | ACTIVE |
| started_at | DATETIME | NOT NULL | 노출 시작일 | 2026-01-20 00:00:00 |
| ended_at | DATETIME | NOT NULL | 노출 종료일 | 2026-02-28 23:59:59 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-18 09:00:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-18 09:00:00 |

**비즈니스 규칙**:

- 노출 기간 내 ACTIVE 상태인 배너만 메인에 표시
- `display_order`에 따라 Swiper 슬라이드 순서 결정

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_banners_status_order | (status, display_order) | INDEX | 활성 배너 순서 조회 |
| idx_banners_period | (started_at, ended_at) | INDEX | 노출 기간 필터 |

---

### promotions (프로모션/기획전)

**목적**: 기획전 및 프로모션 캠페인 관리

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 프로모션 ID | 1 |
| title | VARCHAR(200) | NOT NULL | 프로모션 제목 | 설 선물세트 기획전 |
| description | TEXT | NULL | 프로모션 설명 | 특별한 설 선물을 준비하세요 |
| banner_image_url | VARCHAR(500) | NULL | 프로모션 배너 이미지 | https://cdn.example.com/promo/lunar.jpg |
| start_date | DATE | NOT NULL | 시작일 | 2026-01-20 |
| end_date | DATE | NOT NULL | 종료일 | 2026-01-30 |
| status | ENUM('ACTIVE','ENDED') | NOT NULL, DEFAULT 'ACTIVE' | 상태 | ACTIVE |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-18 09:00:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-18 09:00:00 |

**비즈니스 규칙**:

- 기간 내 ACTIVE 상태인 프로모션만 노출
- 종료일 경과 시 `status=ENDED`로 변경

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_promotions_status_period | (status, start_date, end_date) | INDEX | 활성 프로모션 기간 조회 |

---

### promotion_products (프로모션 상품)

**목적**: 프로모션/기획전에 포함된 상품 매핑

**주요 필드**:

| 컬럼명 | 타입 | 제약조건 | 설명 | 예시 |
|--------|------|----------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 프로모션 상품 ID | 1 |
| promotion_id | BIGINT | FK → promotions, NOT NULL | 프로모션 ID | 1 |
| product_id | BIGINT | FK → products, NOT NULL | 상품 ID | 15 |
| sort_order | INT | NOT NULL, DEFAULT 0 | 노출 순서 | 1 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 등록일시 | 2026-01-18 09:00:00 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | 수정일시 | 2026-01-18 09:00:00 |

**비즈니스 규칙**:

- 동일 프로모션 + 동일 상품 중복 불가 (promotion_id + product_id UNIQUE)

**인덱스**:

| 인덱스명 | 컬럼 | 유형 | 설명 |
|----------|------|------|------|
| idx_promo_products_promotion | promotion_id | INDEX | 프로모션별 상품 조회 |
| uq_promo_products_unique | (promotion_id, product_id) | UNIQUE | 프로모션+상품 중복 방지 |

---
