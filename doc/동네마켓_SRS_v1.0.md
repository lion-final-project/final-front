# 동네마켓
## 로컬 기반 장보기 플랫폼

# 소프트웨어 요구사항 정의서 (SRS)
**Software Requirements Specification**

- **버전:** 1.0
- **작성일:** 2026년 1월
- **용도:** 데이터베이스 개념적/논리적 설계용

---

# 목차

1. [개요](#1-개요)
2. [사용자 유형 및 권한 정의](#2-사용자-유형-및-권한-정의)
3. [데이터 요구사항 (엔티티 정의)](#3-데이터-요구사항-엔티티-정의)
4. [엔티티 관계 정의](#4-엔티티-관계-정의-erd-설명)
5. [비즈니스 규칙 및 제약조건](#5-비즈니스-규칙-및-제약조건)
6. [인덱스 및 성능 최적화 권장사항](#6-인덱스-및-성능-최적화-권장사항)
7. [부록](#7-부록)

---

# 1. 개요

## 1.1 문서 목적

본 문서는 '동네마켓' 플랫폼의 소프트웨어 요구사항을 정의하여, 데이터베이스의 개념적 설계 및 논리적 설계를 위한 기초 자료로 활용하기 위해 작성되었습니다. 시스템에서 관리해야 할 데이터, 비즈니스 규칙, 데이터 간의 관계 등을 상세하게 명시합니다.

## 1.2 프로젝트 개요

동네마켓은 동네 주민, 마트, 배달원을 연결하여 30분~1시간 내 초스피드 배송과 구독 서비스를 제공하는 로컬 기반 장보기 플랫폼입니다. 실시간 위치 추적 기술을 통해 배달 과정의 완전한 가시성을 제공하며, 지역 상권 활성화와 소비자 편의성을 동시에 달성합니다.

## 1.3 시스템 범위

| 구분 | 포함 범위 |
|------|----------|
| 고객 서비스 | 회원관리, 주문관리, 구독관리, 배송추적, 결제, 리뷰 |
| 마트 서비스 | 마트등록, 상품관리, 주문처리, 매출관리, 정산 |
| 배달 서비스 | 배달원등록, 배달관리, 실시간위치, 수익관리 |
| 관리 서비스 | 회원승인, 주문모니터링, 정산관리, 통계분석 |
| 공통 서비스 | 인증/인가, 알림, 위치서비스, 결제연동 |

## 1.4 용어 정의

| 용어 | 정의 |
|------|------|
| 고객(Customer) | 상품을 주문하고 배송받는 일반 소비자 |
| 마트(Store) | 상품을 판매하는 동네 마트/슈퍼마켓 |
| 배달원(Rider) | 마트에서 고객까지 상품을 배달하는 사람 |
| 구독(Subscription) | 정기적으로 상품을 자동 주문/배송받는 서비스 |
| ETA | 예상 도착 시간 (Estimated Time of Arrival) |
| 픽업(Pickup) | 배달원이 마트에서 상품을 수령하는 행위 |
| 동네 인증 | GPS 기반으로 사용자의 거주 지역을 확인하는 절차 |

---

# 2. 사용자 유형 및 권한 정의

## 2.1 사용자 유형

| 유형 | 역할 코드 | 설명 | 가입 승인 |
|------|----------|------|----------|
| 고객 | CUSTOMER | 상품 주문 및 구독 서비스 이용 | 즉시 가입 |
| 마트 사장님 | STORE_OWNER | 마트 운영 및 상품/주문 관리 | 관리자 승인 필요 |
| 배달원 | RIDER | 주문 상품 배달 수행 | 신분증 인증 후 승인 |
| 관리자 | ADMIN | 플랫폼 전체 운영 관리 | 내부 생성 |

## 2.2 기능별 접근 권한 매트릭스

| 기능 영역 | 고객 | 마트 | 배달원 | 관리자 |
|----------|------|------|--------|--------|
| 회원 가입/로그인 | O | O | O | O |
| 상품 조회 | O | O (본인 마트) | - | O |
| 상품 등록/수정/삭제 | - | O | - | O |
| 주문 생성 | O | - | - | - |
| 주문 접수/거절 | - | O | - | O |
| 배달 수락/거절 | - | - | O | - |
| 실시간 위치 조회 | O (본인 주문) | - | - | O |
| 구독 관리 | O | - | - | O |
| 매출/수익 조회 | - | O | O | O |
| 회원 승인/관리 | - | - | - | O |
| 정산 관리 | - | - | - | O |

---

# 3. 데이터 요구사항 (엔티티 정의)

## 3.1 사용자 관련 엔티티

### 3.1.1 User (사용자)

시스템의 모든 사용자 정보를 관리하는 핵심 엔티티

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| user_id | BIGINT | Y | 사용자 고유 식별자 | PK, AUTO_INCREMENT |
| email | VARCHAR(100) | Y | 이메일 (로그인 ID) | UNIQUE, 이메일 형식 |
| password | VARCHAR(255) | Y | 암호화된 비밀번호 | BCrypt 해시 |
| name | VARCHAR(50) | Y | 사용자 이름 | - |
| phone | VARCHAR(20) | Y | 휴대폰 번호 | UNIQUE, 숫자만 |
| role | ENUM | Y | 사용자 역할 | CUSTOMER, STORE_OWNER, RIDER, ADMIN |
| profile_image | VARCHAR(500) | N | 프로필 이미지 URL | - |
| status | ENUM | Y | 계정 상태 | ACTIVE, INACTIVE, SUSPENDED, PENDING |
| created_at | DATETIME | Y | 가입일시 | DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | Y | 수정일시 | ON UPDATE CURRENT_TIMESTAMP |
| last_login_at | DATETIME | N | 마지막 로그인 일시 | - |
| deleted_at | DATETIME | N | 탈퇴일시 | Soft Delete용 |

### 3.1.2 Address (배송 주소)

고객의 배송 주소 정보를 관리 (고객당 최대 5개)

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| address_id | BIGINT | Y | 주소 고유 식별자 | PK, AUTO_INCREMENT |
| user_id | BIGINT | Y | 사용자 ID | FK → User |
| address_name | VARCHAR(50) | Y | 주소 별칭 | 예: 집, 회사 |
| recipient_name | VARCHAR(50) | Y | 수령인 이름 | - |
| recipient_phone | VARCHAR(20) | Y | 수령인 연락처 | - |
| postal_code | VARCHAR(10) | Y | 우편번호 | - |
| address_line1 | VARCHAR(200) | Y | 기본 주소 | 도로명/지번 |
| address_line2 | VARCHAR(200) | N | 상세 주소 | 동/호수 등 |
| latitude | DECIMAL(10,8) | Y | 위도 | -90 ~ 90 |
| longitude | DECIMAL(11,8) | Y | 경도 | -180 ~ 180 |
| is_default | BOOLEAN | Y | 기본 배송지 여부 | DEFAULT FALSE |
| created_at | DATETIME | Y | 등록일시 | - |

### 3.1.3 SocialLogin (소셜 로그인)

소셜 로그인 연동 정보 관리

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| social_id | BIGINT | Y | 소셜 로그인 ID | PK, AUTO_INCREMENT |
| user_id | BIGINT | Y | 사용자 ID | FK → User |
| provider | ENUM | Y | 소셜 제공자 | KAKAO, NAVER, GOOGLE, APPLE |
| provider_user_id | VARCHAR(100) | Y | 제공자 측 사용자 ID | UNIQUE with provider |
| access_token | TEXT | N | 액세스 토큰 | 암호화 저장 |
| refresh_token | TEXT | N | 리프레시 토큰 | 암호화 저장 |
| connected_at | DATETIME | Y | 연동일시 | - |

---

## 3.2 마트 관련 엔티티

### 3.2.1 Store (마트)

동네 마트/슈퍼마켓 정보 관리

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| store_id | BIGINT | Y | 마트 고유 식별자 | PK, AUTO_INCREMENT |
| owner_id | BIGINT | Y | 마트 사장님 ID | FK → User, UNIQUE |
| store_name | VARCHAR(100) | Y | 마트 상호명 | - |
| business_number | VARCHAR(20) | Y | 사업자등록번호 | UNIQUE, 10자리 |
| phone | VARCHAR(20) | Y | 마트 연락처 | - |
| description | TEXT | N | 마트 소개 | - |
| postal_code | VARCHAR(10) | Y | 우편번호 | - |
| address_line1 | VARCHAR(200) | Y | 마트 기본 주소 | - |
| address_line2 | VARCHAR(200) | N | 마트 상세 주소 | - |
| latitude | DECIMAL(10,8) | Y | 마트 위도 | - |
| longitude | DECIMAL(11,8) | Y | 마트 경도 | - |
| delivery_radius_km | DECIMAL(3,1) | Y | 배달 가능 반경(km) | DEFAULT 2.0, MAX 5.0 |
| min_order_amount | INT | Y | 최소 주문 금액 | DEFAULT 0 |
| delivery_fee | INT | Y | 기본 배달비 | - |
| free_delivery_amount | INT | N | 무료 배달 금액 | - |
| average_rating | DECIMAL(2,1) | Y | 평균 평점 | DEFAULT 0.0, 0.0~5.0 |
| review_count | INT | Y | 리뷰 수 | DEFAULT 0 |
| status | ENUM | Y | 마트 상태 | PENDING, APPROVED, REJECTED, SUSPENDED, CLOSED |
| is_open | BOOLEAN | Y | 현재 영업 중 여부 | DEFAULT FALSE |
| created_at | DATETIME | Y | 등록일시 | - |
| approved_at | DATETIME | N | 승인일시 | - |

### 3.2.2 StoreBusinessHours (마트 영업시간)

마트의 요일별 영업시간 관리

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| hours_id | BIGINT | Y | 영업시간 ID | PK, AUTO_INCREMENT |
| store_id | BIGINT | Y | 마트 ID | FK → Store |
| day_of_week | TINYINT | Y | 요일 (0=일, 6=토) | 0~6 |
| open_time | TIME | Y | 오픈 시간 | - |
| close_time | TIME | Y | 마감 시간 | - |
| is_closed | BOOLEAN | Y | 휴무 여부 | DEFAULT FALSE |
| break_start | TIME | N | 휴게 시작 시간 | - |
| break_end | TIME | N | 휴게 종료 시간 | - |

### 3.2.3 StoreHoliday (마트 임시휴무)

마트의 임시 휴무일 관리

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| holiday_id | BIGINT | Y | 휴무 ID | PK, AUTO_INCREMENT |
| store_id | BIGINT | Y | 마트 ID | FK → Store |
| holiday_date | DATE | Y | 휴무 날짜 | - |
| reason | VARCHAR(200) | N | 휴무 사유 | - |
| created_at | DATETIME | Y | 등록일시 | - |

### 3.2.4 StoreImage (마트 이미지)

마트 대표 이미지 및 내부 사진 관리

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| image_id | BIGINT | Y | 이미지 ID | PK, AUTO_INCREMENT |
| store_id | BIGINT | Y | 마트 ID | FK → Store |
| image_url | VARCHAR(500) | Y | 이미지 URL | - |
| image_type | ENUM | Y | 이미지 유형 | MAIN, INTERIOR, PRODUCT |
| sort_order | INT | Y | 정렬 순서 | DEFAULT 0 |
| created_at | DATETIME | Y | 등록일시 | - |

---

## 3.3 상품 관련 엔티티

### 3.3.1 Category (상품 카테고리)

상품 분류 카테고리 (계층 구조 지원)

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| category_id | BIGINT | Y | 카테고리 ID | PK, AUTO_INCREMENT |
| parent_id | BIGINT | N | 상위 카테고리 ID | FK → Category (자기참조) |
| category_name | VARCHAR(50) | Y | 카테고리명 | - |
| category_code | VARCHAR(20) | Y | 카테고리 코드 | UNIQUE |
| depth | TINYINT | Y | 카테고리 깊이 | 1=대, 2=중, 3=소 |
| sort_order | INT | Y | 정렬 순서 | - |
| icon_url | VARCHAR(500) | N | 아이콘 이미지 | - |
| is_active | BOOLEAN | Y | 활성화 여부 | DEFAULT TRUE |

### 3.3.2 Product (상품)

마트에서 판매하는 상품 정보

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| product_id | BIGINT | Y | 상품 ID | PK, AUTO_INCREMENT |
| store_id | BIGINT | Y | 마트 ID | FK → Store |
| category_id | BIGINT | Y | 카테고리 ID | FK → Category |
| product_name | VARCHAR(200) | Y | 상품명 | - |
| description | TEXT | N | 상품 설명 | - |
| price | INT | Y | 정가 | >= 0 |
| sale_price | INT | N | 할인가 | NULL이면 할인 없음 |
| cost_price | INT | N | 원가 (마트용) | - |
| stock | INT | Y | 재고 수량 | DEFAULT 0, >= 0 |
| unit | VARCHAR(20) | N | 판매 단위 | 예: 1개, 500g, 1L |
| origin | VARCHAR(100) | N | 원산지 | - |
| barcode | VARCHAR(50) | N | 바코드 번호 | - |
| expiry_date | DATE | N | 유통기한 | - |
| is_available | BOOLEAN | Y | 판매 가능 여부 | DEFAULT TRUE |
| is_subscription | BOOLEAN | Y | 구독 가능 상품 여부 | DEFAULT FALSE |
| view_count | INT | Y | 조회수 | DEFAULT 0 |
| order_count | INT | Y | 주문수 | DEFAULT 0 |
| created_at | DATETIME | Y | 등록일시 | - |
| updated_at | DATETIME | Y | 수정일시 | - |

### 3.3.3 ProductImage (상품 이미지)

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| image_id | BIGINT | Y | 이미지 ID | PK, AUTO_INCREMENT |
| product_id | BIGINT | Y | 상품 ID | FK → Product |
| image_url | VARCHAR(500) | Y | 이미지 URL | - |
| is_main | BOOLEAN | Y | 대표 이미지 여부 | DEFAULT FALSE |
| sort_order | INT | Y | 정렬 순서 | DEFAULT 0 |

---

## 3.4 주문 관련 엔티티

### 3.4.1 Order (주문)

고객의 주문 정보를 관리하는 핵심 엔티티

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| order_id | BIGINT | Y | 주문 ID | PK, AUTO_INCREMENT |
| order_number | VARCHAR(30) | Y | 주문 번호 | UNIQUE, 예: ORD202601210001 |
| user_id | BIGINT | Y | 주문 고객 ID | FK → User |
| store_id | BIGINT | Y | 주문 마트 ID | FK → Store |
| subscription_id | BIGINT | N | 구독 ID | FK → Subscription (구독주문시) |
| order_type | ENUM | Y | 주문 유형 | REGULAR, SCHEDULED, SUBSCRIPTION |
| status | ENUM | Y | 주문 상태 | 아래 상태값 참조 |
| total_product_price | INT | Y | 상품 총액 | - |
| delivery_fee | INT | Y | 배달비 | - |
| discount_amount | INT | Y | 할인 금액 | DEFAULT 0 |
| used_point | INT | Y | 사용 포인트 | DEFAULT 0 |
| final_price | INT | Y | 최종 결제 금액 | 상품+배달비-할인-포인트 |
| earned_point | INT | Y | 적립 포인트 | - |
| recipient_name | VARCHAR(50) | Y | 수령인 이름 | - |
| recipient_phone | VARCHAR(20) | Y | 수령인 연락처 | - |
| delivery_address | VARCHAR(500) | Y | 배송 주소 (전체) | - |
| delivery_latitude | DECIMAL(10,8) | Y | 배송지 위도 | - |
| delivery_longitude | DECIMAL(11,8) | Y | 배송지 경도 | - |
| delivery_request | VARCHAR(500) | N | 배송 요청사항 | - |
| entrance_password | VARCHAR(20) | N | 공동현관 비밀번호 | - |
| scheduled_at | DATETIME | N | 예약 배송 시간 | 예약주문시 |
| ordered_at | DATETIME | Y | 주문일시 | - |
| accepted_at | DATETIME | N | 마트 접수일시 | - |
| prepared_at | DATETIME | N | 상품 준비완료 일시 | - |
| delivered_at | DATETIME | N | 배송 완료일시 | - |
| cancelled_at | DATETIME | N | 취소일시 | - |
| cancel_reason | VARCHAR(500) | N | 취소 사유 | - |

#### 주문 상태(status) 값

| 상태 코드 | 설명 | 전이 가능 상태 |
|----------|------|---------------|
| PENDING | 결제 대기 | PAID, CANCELLED |
| PAID | 결제 완료 | ACCEPTED, REJECTED, CANCELLED |
| ACCEPTED | 마트 접수 | PREPARING, CANCELLED |
| PREPARING | 상품 준비 중 | READY |
| READY | 상품 준비 완료 | PICKED_UP |
| PICKED_UP | 배달원 픽업 완료 | DELIVERING |
| DELIVERING | 배송 중 | DELIVERED |
| DELIVERED | 배송 완료 | - |
| CANCELLED | 주문 취소 | - |
| REJECTED | 마트 거절 | - |

### 3.4.2 OrderItem (주문 상품)

주문에 포함된 개별 상품 정보

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| order_item_id | BIGINT | Y | 주문상품 ID | PK, AUTO_INCREMENT |
| order_id | BIGINT | Y | 주문 ID | FK → Order |
| product_id | BIGINT | Y | 상품 ID | FK → Product |
| product_name | VARCHAR(200) | Y | 주문시점 상품명 | 스냅샷 |
| product_price | INT | Y | 주문시점 상품 가격 | 스냅샷 |
| quantity | INT | Y | 주문 수량 | >= 1 |
| total_price | INT | Y | 소계 | 가격 × 수량 |
| product_image | VARCHAR(500) | N | 상품 이미지 URL | 스냅샷 |

### 3.4.3 Cart (장바구니)

고객의 장바구니 정보

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| cart_id | BIGINT | Y | 장바구니 ID | PK, AUTO_INCREMENT |
| user_id | BIGINT | Y | 고객 ID | FK → User |
| store_id | BIGINT | Y | 마트 ID | FK → Store |
| product_id | BIGINT | Y | 상품 ID | FK → Product |
| quantity | INT | Y | 수량 | >= 1 |
| created_at | DATETIME | Y | 등록일시 | - |
| updated_at | DATETIME | Y | 수정일시 | - |

---

## 3.5 결제 관련 엔티티

### 3.5.1 Payment (결제)

주문의 결제 정보 관리

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| payment_id | BIGINT | Y | 결제 ID | PK, AUTO_INCREMENT |
| order_id | BIGINT | Y | 주문 ID | FK → Order, UNIQUE |
| payment_method | ENUM | Y | 결제 수단 | CARD, KAKAO_PAY, NAVER_PAY, TOSS_PAY |
| payment_status | ENUM | Y | 결제 상태 | PENDING, COMPLETED, FAILED, CANCELLED, REFUNDED |
| amount | INT | Y | 결제 금액 | - |
| pg_provider | VARCHAR(50) | Y | PG사 | 예: tosspayments, inicis |
| pg_tid | VARCHAR(100) | N | PG 거래 ID | - |
| card_company | VARCHAR(50) | N | 카드사 | - |
| card_number_masked | VARCHAR(20) | N | 마스킹된 카드번호 | 예: 1234-****-****-5678 |
| receipt_url | VARCHAR(500) | N | 영수증 URL | - |
| paid_at | DATETIME | N | 결제 완료일시 | - |
| cancelled_at | DATETIME | N | 취소일시 | - |
| cancel_amount | INT | N | 취소 금액 | - |
| cancel_reason | VARCHAR(200) | N | 취소 사유 | - |
| created_at | DATETIME | Y | 생성일시 | - |

### 3.5.2 PaymentMethod (저장된 결제수단)

고객이 등록한 결제 수단 정보

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| method_id | BIGINT | Y | 결제수단 ID | PK, AUTO_INCREMENT |
| user_id | BIGINT | Y | 고객 ID | FK → User |
| method_type | ENUM | Y | 결제수단 유형 | CARD, KAKAO_PAY, NAVER_PAY |
| billing_key | VARCHAR(200) | Y | 빌링키 (암호화) | - |
| card_company | VARCHAR(50) | N | 카드사 | - |
| card_number_masked | VARCHAR(20) | N | 마스킹된 카드번호 | - |
| is_default | BOOLEAN | Y | 기본 결제수단 여부 | DEFAULT FALSE |
| created_at | DATETIME | Y | 등록일시 | - |

---

## 3.6 배달 관련 엔티티

### 3.6.1 Rider (배달원)

배달원 상세 정보 (User 확장)

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| rider_id | BIGINT | Y | 배달원 ID | PK, AUTO_INCREMENT |
| user_id | BIGINT | Y | 사용자 ID | FK → User, UNIQUE |
| id_card_verified | BOOLEAN | Y | 신분증 인증 여부 | DEFAULT FALSE |
| id_card_image | VARCHAR(500) | N | 신분증 이미지 URL | 암호화 저장 경로 |
| vehicle_type | ENUM | Y | 이동 수단 | WALK, BICYCLE, MOTORCYCLE, CAR |
| vehicle_number | VARCHAR(20) | N | 차량 번호 | 오토바이/자동차일 경우 |
| bank_name | VARCHAR(50) | N | 정산 은행명 | - |
| bank_account | VARCHAR(50) | N | 정산 계좌번호 | 암호화 저장 |
| account_holder | VARCHAR(50) | N | 예금주 | - |
| delivery_area | GEOMETRY | N | 배달 가능 구역 | Polygon |
| average_rating | DECIMAL(2,1) | Y | 평균 평점 | DEFAULT 0.0 |
| total_deliveries | INT | Y | 총 배달 건수 | DEFAULT 0 |
| status | ENUM | Y | 배달원 상태 | PENDING, APPROVED, REJECTED, SUSPENDED |
| created_at | DATETIME | Y | 등록일시 | - |
| approved_at | DATETIME | N | 승인일시 | - |

### 3.6.2 RiderAvailability (배달원 가용시간)

배달원의 배달 가능 시간 설정

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| availability_id | BIGINT | Y | 가용시간 ID | PK, AUTO_INCREMENT |
| rider_id | BIGINT | Y | 배달원 ID | FK → Rider |
| day_of_week | TINYINT | Y | 요일 | 0=일 ~ 6=토 |
| start_time | TIME | Y | 시작 시간 | - |
| end_time | TIME | Y | 종료 시간 | - |
| is_active | BOOLEAN | Y | 활성화 여부 | DEFAULT TRUE |

### 3.6.3 Delivery (배달)

주문의 배달 정보 관리

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| delivery_id | BIGINT | Y | 배달 ID | PK, AUTO_INCREMENT |
| order_id | BIGINT | Y | 주문 ID | FK → Order, UNIQUE |
| rider_id | BIGINT | N | 배달원 ID | FK → Rider |
| status | ENUM | Y | 배달 상태 | 아래 상태값 참조 |
| delivery_fee | INT | Y | 배달비 | - |
| rider_earning | INT | N | 배달원 수익 | 배달비의 일정 % |
| distance_km | DECIMAL(5,2) | N | 배달 거리(km) | 마트→고객 |
| estimated_minutes | INT | N | 예상 소요시간(분) | - |
| requested_at | DATETIME | Y | 배달 요청일시 | - |
| accepted_at | DATETIME | N | 배달 수락일시 | - |
| picked_up_at | DATETIME | N | 픽업 완료일시 | - |
| delivered_at | DATETIME | N | 배송 완료일시 | - |
| delivery_photo | VARCHAR(500) | N | 배송 완료 사진 | - |
| cancelled_at | DATETIME | N | 취소일시 | - |
| cancel_reason | VARCHAR(200) | N | 취소 사유 | - |

#### 배달 상태(status) 값

| 상태 코드 | 설명 |
|----------|------|
| REQUESTED | 배달 요청됨 (배달원 대기) |
| ACCEPTED | 배달원이 수락함 |
| PICKING_UP | 마트로 이동 중 |
| PICKED_UP | 상품 픽업 완료 |
| DELIVERING | 고객에게 배송 중 |
| DELIVERED | 배송 완료 |
| CANCELLED | 배달 취소 |

### 3.6.4 RiderLocation (배달원 실시간 위치)

배달 중인 배달원의 실시간 위치 정보 (Redis 또는 시계열 DB 권장)

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| location_id | BIGINT | Y | 위치 기록 ID | PK, AUTO_INCREMENT |
| rider_id | BIGINT | Y | 배달원 ID | FK → Rider |
| delivery_id | BIGINT | N | 현재 배달 ID | FK → Delivery |
| latitude | DECIMAL(10,8) | Y | 현재 위도 | - |
| longitude | DECIMAL(11,8) | Y | 현재 경도 | - |
| accuracy | DECIMAL(5,2) | N | GPS 정확도(m) | - |
| speed | DECIMAL(5,2) | N | 현재 속도(km/h) | - |
| heading | DECIMAL(5,2) | N | 이동 방향(도) | 0~360 |
| recorded_at | DATETIME | Y | 기록일시 | INDEX |
| is_current | BOOLEAN | Y | 현재 위치 여부 | 최신 위치 표시용 |

---

## 3.7 구독 관련 엔티티

### 3.7.1 Subscription (구독)

정기 배송 구독 정보

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| subscription_id | BIGINT | Y | 구독 ID | PK, AUTO_INCREMENT |
| user_id | BIGINT | Y | 고객 ID | FK → User |
| store_id | BIGINT | Y | 마트 ID | FK → Store |
| subscription_name | VARCHAR(100) | N | 구독 별칭 | 예: 우리집 필수품 |
| cycle_type | ENUM | Y | 구독 주기 | WEEKLY, BIWEEKLY, MONTHLY |
| delivery_day | TINYINT | Y | 배송 요일 | 0=일 ~ 6=토 |
| delivery_time_slot | VARCHAR(20) | Y | 배송 희망 시간대 | 예: 18:00-20:00 |
| address_id | BIGINT | Y | 배송 주소 ID | FK → Address |
| payment_method_id | BIGINT | Y | 결제수단 ID | FK → PaymentMethod |
| status | ENUM | Y | 구독 상태 | ACTIVE, PAUSED, CANCELLED |
| next_delivery_date | DATE | Y | 다음 배송 예정일 | - |
| total_amount | INT | Y | 정기 결제 금액 | - |
| started_at | DATETIME | Y | 구독 시작일 | - |
| paused_at | DATETIME | N | 일시정지일 | - |
| cancelled_at | DATETIME | N | 해지일 | - |
| cancel_reason | VARCHAR(200) | N | 해지 사유 | - |

### 3.7.2 SubscriptionItem (구독 상품)

구독에 포함된 상품 목록

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| item_id | BIGINT | Y | 구독상품 ID | PK, AUTO_INCREMENT |
| subscription_id | BIGINT | Y | 구독 ID | FK → Subscription |
| product_id | BIGINT | Y | 상품 ID | FK → Product |
| quantity | INT | Y | 수량 | >= 1 |
| created_at | DATETIME | Y | 등록일시 | - |

### 3.7.3 SubscriptionHistory (구독 배송 이력)

구독 배송 스케줄 및 이력 관리

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| history_id | BIGINT | Y | 이력 ID | PK, AUTO_INCREMENT |
| subscription_id | BIGINT | Y | 구독 ID | FK → Subscription |
| scheduled_date | DATE | Y | 배송 예정일 | - |
| status | ENUM | Y | 상태 | SCHEDULED, SKIPPED, ORDERED, COMPLETED |
| order_id | BIGINT | N | 생성된 주문 ID | FK → Order |
| skipped_at | DATETIME | N | 건너뛰기 처리일시 | - |
| skip_reason | VARCHAR(200) | N | 건너뛰기 사유 | - |
| created_at | DATETIME | Y | 생성일시 | - |

---

## 3.8 리뷰 관련 엔티티

### 3.8.1 Review (리뷰)

주문에 대한 리뷰 (마트, 상품, 배달 통합)

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| review_id | BIGINT | Y | 리뷰 ID | PK, AUTO_INCREMENT |
| order_id | BIGINT | Y | 주문 ID | FK → Order, UNIQUE |
| user_id | BIGINT | Y | 작성자 ID | FK → User |
| store_id | BIGINT | Y | 마트 ID | FK → Store |
| rider_id | BIGINT | N | 배달원 ID | FK → Rider |
| store_rating | TINYINT | Y | 마트 평점 | 1~5 |
| delivery_rating | TINYINT | N | 배달 평점 | 1~5 |
| content | TEXT | N | 리뷰 내용 | - |
| is_visible | BOOLEAN | Y | 노출 여부 | DEFAULT TRUE |
| reply_content | TEXT | N | 사장님 답글 | - |
| replied_at | DATETIME | N | 답글 작성일시 | - |
| created_at | DATETIME | Y | 작성일시 | - |
| updated_at | DATETIME | Y | 수정일시 | - |

### 3.8.2 ReviewImage (리뷰 이미지)

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| image_id | BIGINT | Y | 이미지 ID | PK, AUTO_INCREMENT |
| review_id | BIGINT | Y | 리뷰 ID | FK → Review |
| image_url | VARCHAR(500) | Y | 이미지 URL | - |
| sort_order | INT | Y | 정렬 순서 | DEFAULT 0 |

---

## 3.9 정산 관련 엔티티

### 3.9.1 Settlement (정산)

마트 및 배달원 정산 내역

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| settlement_id | BIGINT | Y | 정산 ID | PK, AUTO_INCREMENT |
| target_type | ENUM | Y | 정산 대상 유형 | STORE, RIDER |
| target_id | BIGINT | Y | 마트 ID 또는 배달원 ID | - |
| settlement_period | VARCHAR(20) | Y | 정산 기간 | 예: 2026-01-W3 |
| total_sales | INT | Y | 총 매출/수익 | - |
| platform_fee | INT | Y | 플랫폼 수수료 | - |
| settlement_amount | INT | Y | 정산 금액 | 매출 - 수수료 |
| status | ENUM | Y | 정산 상태 | PENDING, COMPLETED, FAILED |
| bank_name | VARCHAR(50) | Y | 입금 은행 | - |
| bank_account | VARCHAR(50) | Y | 입금 계좌 | 암호화 저장 |
| settled_at | DATETIME | N | 정산 완료일시 | - |
| created_at | DATETIME | Y | 생성일시 | - |

### 3.9.2 SettlementDetail (정산 상세)

정산에 포함된 개별 주문/배달 내역

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| detail_id | BIGINT | Y | 상세 ID | PK, AUTO_INCREMENT |
| settlement_id | BIGINT | Y | 정산 ID | FK → Settlement |
| order_id | BIGINT | Y | 주문 ID | FK → Order |
| delivery_id | BIGINT | N | 배달 ID | FK → Delivery (배달원정산시) |
| amount | INT | Y | 금액 | - |
| fee | INT | Y | 수수료 | - |
| net_amount | INT | Y | 순수익 | - |

---

## 3.10 포인트/쿠폰 관련 엔티티

### 3.10.1 Point (포인트)

고객 포인트 적립/사용 내역

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| point_id | BIGINT | Y | 포인트 ID | PK, AUTO_INCREMENT |
| user_id | BIGINT | Y | 고객 ID | FK → User |
| type | ENUM | Y | 유형 | EARN, USE, EXPIRE, CANCEL |
| amount | INT | Y | 포인트 금액 | 적립: +, 사용: - |
| balance | INT | Y | 잔액 | 거래 후 잔액 |
| order_id | BIGINT | N | 관련 주문 ID | FK → Order |
| description | VARCHAR(200) | Y | 내역 설명 | - |
| expired_at | DATETIME | N | 만료일시 | - |
| created_at | DATETIME | Y | 발생일시 | - |

### 3.10.2 Coupon (쿠폰)

발급된 쿠폰 정의

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| coupon_id | BIGINT | Y | 쿠폰 ID | PK, AUTO_INCREMENT |
| coupon_code | VARCHAR(20) | Y | 쿠폰 코드 | UNIQUE |
| coupon_name | VARCHAR(100) | Y | 쿠폰명 | - |
| discount_type | ENUM | Y | 할인 유형 | FIXED, PERCENTAGE |
| discount_value | INT | Y | 할인 값 | 금액 또는 % |
| max_discount | INT | N | 최대 할인 금액 | %할인시 상한 |
| min_order_amount | INT | Y | 최소 주문 금액 | DEFAULT 0 |
| valid_from | DATETIME | Y | 유효 시작일 | - |
| valid_to | DATETIME | Y | 유효 종료일 | - |
| total_quantity | INT | N | 총 발급 수량 | NULL=무제한 |
| used_quantity | INT | Y | 사용된 수량 | DEFAULT 0 |
| is_active | BOOLEAN | Y | 활성화 여부 | DEFAULT TRUE |
| created_at | DATETIME | Y | 생성일시 | - |

### 3.10.3 UserCoupon (사용자 보유 쿠폰)

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| user_coupon_id | BIGINT | Y | 보유쿠폰 ID | PK, AUTO_INCREMENT |
| user_id | BIGINT | Y | 고객 ID | FK → User |
| coupon_id | BIGINT | Y | 쿠폰 ID | FK → Coupon |
| status | ENUM | Y | 상태 | AVAILABLE, USED, EXPIRED |
| used_order_id | BIGINT | N | 사용된 주문 ID | FK → Order |
| issued_at | DATETIME | Y | 발급일시 | - |
| used_at | DATETIME | N | 사용일시 | - |

---

## 3.11 알림/신고 관련 엔티티

### 3.11.1 Notification (알림)

사용자에게 발송되는 알림 내역

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| notification_id | BIGINT | Y | 알림 ID | PK, AUTO_INCREMENT |
| user_id | BIGINT | Y | 수신자 ID | FK → User |
| type | ENUM | Y | 알림 유형 | ORDER, DELIVERY, PROMOTION, SYSTEM |
| title | VARCHAR(100) | Y | 알림 제목 | - |
| content | TEXT | Y | 알림 내용 | - |
| reference_type | VARCHAR(50) | N | 참조 대상 유형 | ORDER, STORE 등 |
| reference_id | BIGINT | N | 참조 대상 ID | - |
| is_read | BOOLEAN | Y | 읽음 여부 | DEFAULT FALSE |
| sent_at | DATETIME | Y | 발송일시 | - |
| read_at | DATETIME | N | 읽은 일시 | - |

### 3.11.2 Report (신고)

사용자 신고 접수 내역

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| report_id | BIGINT | Y | 신고 ID | PK, AUTO_INCREMENT |
| reporter_id | BIGINT | Y | 신고자 ID | FK → User |
| target_type | ENUM | Y | 신고 대상 유형 | STORE, RIDER, REVIEW, ORDER |
| target_id | BIGINT | Y | 신고 대상 ID | - |
| reason_type | ENUM | Y | 신고 사유 유형 | FRAUD, HARASSMENT, QUALITY, OTHER |
| reason_detail | TEXT | Y | 상세 사유 | - |
| status | ENUM | Y | 처리 상태 | PENDING, PROCESSING, RESOLVED, DISMISSED |
| admin_note | TEXT | N | 관리자 메모 | - |
| resolved_at | DATETIME | N | 처리 완료일시 | - |
| created_at | DATETIME | Y | 신고일시 | - |

### 3.11.3 Inquiry (1:1 문의)

| 속성명 | 데이터 타입 | 필수 | 설명 | 제약조건 |
|--------|------------|------|------|----------|
| inquiry_id | BIGINT | Y | 문의 ID | PK, AUTO_INCREMENT |
| user_id | BIGINT | Y | 문의자 ID | FK → User |
| category | ENUM | Y | 문의 유형 | ORDER, PAYMENT, DELIVERY, ACCOUNT, OTHER |
| title | VARCHAR(200) | Y | 문의 제목 | - |
| content | TEXT | Y | 문의 내용 | - |
| order_id | BIGINT | N | 관련 주문 ID | FK → Order |
| status | ENUM | Y | 처리 상태 | PENDING, ANSWERED, CLOSED |
| answer | TEXT | N | 답변 내용 | - |
| answered_at | DATETIME | N | 답변일시 | - |
| answered_by | BIGINT | N | 답변 관리자 ID | FK → User (Admin) |
| created_at | DATETIME | Y | 문의일시 | - |

---

# 4. 엔티티 관계 정의 (ERD 설명)

## 4.1 핵심 엔티티 관계

| 관계 | 카디널리티 | 설명 |
|------|-----------|------|
| User → Address | 1:N | 한 사용자는 여러 배송 주소를 가질 수 있음 (최대 5개) |
| User → Store | 1:1 | 마트 사장님은 하나의 마트만 운영 |
| User → Rider | 1:1 | 배달원은 한 사용자 계정에 연결 |
| Store → Product | 1:N | 하나의 마트는 여러 상품을 등록 |
| Store → Order | 1:N | 하나의 마트는 여러 주문을 받음 |
| User → Order | 1:N | 한 고객은 여러 주문을 생성 |
| Order → OrderItem | 1:N | 하나의 주문은 여러 상품을 포함 |
| Order → Payment | 1:1 | 하나의 주문은 하나의 결제 정보를 가짐 |
| Order → Delivery | 1:1 | 하나의 주문은 하나의 배달 정보를 가짐 |
| Rider → Delivery | 1:N | 한 배달원은 여러 배달을 수행 |
| User → Subscription | 1:N | 한 고객은 여러 구독을 가질 수 있음 |
| Subscription → SubscriptionItem | 1:N | 하나의 구독은 여러 상품을 포함 |
| Category → Category (Self) | 1:N | 카테고리는 계층 구조 (대>중>소) |
| Order → Review | 1:1 | 하나의 주문에 하나의 리뷰 |

## 4.2 관계 다이어그램 (텍스트 표현)

```
[User] 1──N [Address]
[User] 1──1 [Store] 1──N [Product]
[User] 1──1 [Rider] 1──N [Delivery]
[User] 1──N [Order] 1──N [OrderItem] N──1 [Product]
[Order] 1──1 [Payment]
[Order] 1──1 [Delivery] N──1 [Rider]
[User] 1──N [Subscription] 1──N [SubscriptionItem] N──1 [Product]
[Category] 1──N [Category] (Self-referencing)
```

---

# 5. 비즈니스 규칙 및 제약조건

## 5.1 사용자 관련 규칙

- **BR-U01:** 이메일과 휴대폰 번호는 시스템 전체에서 유일해야 함
- **BR-U02:** 고객은 최대 5개의 배송 주소를 등록할 수 있음
- **BR-U03:** 기본 배송지는 사용자당 1개만 설정 가능
- **BR-U04:** 마트 사장님과 배달원은 관리자 승인 후 활동 가능
- **BR-U05:** 탈퇴 회원의 개인정보는 90일간 보관 후 영구 삭제

## 5.2 마트/상품 관련 규칙

- **BR-S01:** 사업자등록번호는 시스템 전체에서 유일해야 함
- **BR-S02:** 배달 가능 반경은 최대 5km까지 설정 가능
- **BR-S03:** 마트 평균 평점은 리뷰 등록/수정 시 자동 계산
- **BR-S04:** 상품 가격은 0 이상이어야 함
- **BR-S05:** 할인가는 정가보다 낮아야 함
- **BR-S06:** 재고가 0인 상품은 자동으로 품절 처리

## 5.3 주문 관련 규칙

- **BR-O01:** 주문 취소는 마트 접수(ACCEPTED) 전까지만 가능
- **BR-O02:** 주문 번호는 날짜 + 일련번호 형식 (ORD + YYYYMMDD + 4자리)
- **BR-O03:** 최종 결제 금액 = 상품총액 + 배달비 - 할인 - 포인트
- **BR-O04:** 예약 주문은 최소 2시간 후 ~ 최대 7일 이내 설정 가능
- **BR-O05:** 마트가 10분 내 응답하지 않으면 자동 알림 발송
- **BR-O06:** 주문 상품 정보는 주문 시점에 스냅샷으로 저장

## 5.4 배달 관련 규칙

- **BR-D01:** 배달원은 동시에 최대 3건의 배달만 수행 가능
- **BR-D02:** 배달 요청 후 5분 내 수락되지 않으면 다음 배달원에게 재배정
- **BR-D03:** 배달 중 위치 정보는 3~5초 간격으로 수집
- **BR-D04:** 배송 완료 후 실시간 위치 추적 즉시 중단
- **BR-D05:** 위치 이력 데이터는 90일 후 자동 삭제

## 5.5 구독 관련 규칙

- **BR-SUB01:** 구독 주기는 매주/격주/매월 중 선택
- **BR-SUB02:** 구독 배송 건너뛰기는 배송일 24시간 전까지만 가능
- **BR-SUB03:** 구독 자동 주문은 배송 예정일 하루 전 00:00에 생성
- **BR-SUB04:** 결제 실패 시 3회 재시도 후 구독 자동 일시정지
- **BR-SUB05:** 구독 상품 중 품절 상품은 해당 배송에서 자동 제외

## 5.6 결제/정산 관련 규칙

- **BR-P01:** 결제 취소는 배송 시작 전까지만 전액 취소 가능
- **BR-P02:** 포인트 적립은 결제 금액의 1% (소수점 이하 절사)
- **BR-P03:** 적립 포인트는 1년 후 자동 소멸
- **BR-P04:** 마트 정산은 주 단위, 배달원 정산은 일 단위
- **BR-P05:** 플랫폼 수수료는 마트 5~8%, 배달 수익의 10%

## 5.7 리뷰 관련 규칙

- **BR-R01:** 리뷰는 배송 완료 후 7일 이내에만 작성 가능
- **BR-R02:** 리뷰는 주문당 1개만 작성 가능
- **BR-R03:** 리뷰 수정은 작성 후 24시간 이내에만 가능
- **BR-R04:** 평점은 1~5점 정수만 허용

---

# 6. 인덱스 및 성능 최적화 권장사항

## 6.1 필수 인덱스

| 테이블 | 인덱스 컬럼 | 인덱스 유형 | 목적 |
|--------|------------|------------|------|
| User | email | UNIQUE | 로그인 조회 |
| User | phone | UNIQUE | 중복 체크, 검색 |
| User | role, status | COMPOSITE | 역할별 사용자 조회 |
| Store | latitude, longitude | SPATIAL | 위치 기반 마트 검색 |
| Store | status, is_open | COMPOSITE | 영업 중 마트 필터링 |
| Product | store_id, category_id | COMPOSITE | 마트별 카테고리 상품 조회 |
| Product | store_id, is_available | COMPOSITE | 판매 가능 상품 조회 |
| Order | user_id, status | COMPOSITE | 고객 주문 목록 |
| Order | store_id, status | COMPOSITE | 마트 주문 관리 |
| Order | ordered_at | INDEX | 주문 일시별 조회 |
| Delivery | rider_id, status | COMPOSITE | 배달원 배달 목록 |
| RiderLocation | rider_id, recorded_at | COMPOSITE | 위치 이력 조회 |
| RiderLocation | delivery_id, is_current | COMPOSITE | 현재 배달 위치 |
| Subscription | user_id, status | COMPOSITE | 고객 구독 목록 |
| Subscription | next_delivery_date | INDEX | 배송 예정 구독 조회 |

## 6.2 성능 최적화 권장사항

- 실시간 위치 데이터는 Redis 또는 TimescaleDB 활용 권장
- 마트/상품 조회는 Elasticsearch 검색 엔진 연동 고려
- 주문/배달 상태 변경은 이벤트 소싱 패턴 고려
- 이미지 URL은 CDN을 통해 서비스
- 90일 이상 지난 위치 이력 데이터는 아카이브 테이블로 이동
- 통계 데이터는 별도의 집계 테이블로 관리 (매출, 주문수 등)

---

# 7. 부록

## 7.1 ENUM 타입 정의

### UserRole (사용자 역할)

| 값 | 설명 |
|----|------|
| CUSTOMER | 일반 고객 |
| STORE_OWNER | 마트 사장님 |
| RIDER | 배달원 |
| ADMIN | 관리자 |

### UserStatus (사용자 상태)

| 값 | 설명 |
|----|------|
| ACTIVE | 활성 |
| INACTIVE | 비활성 |
| SUSPENDED | 정지 |
| PENDING | 승인 대기 |

### StoreStatus (마트 상태)

| 값 | 설명 |
|----|------|
| PENDING | 승인 대기 |
| APPROVED | 승인됨 |
| REJECTED | 거절됨 |
| SUSPENDED | 운영 정지 |
| CLOSED | 폐업 |

### OrderStatus (주문 상태)

| 값 | 설명 |
|----|------|
| PENDING | 결제 대기 |
| PAID | 결제 완료 |
| ACCEPTED | 마트 접수 |
| PREPARING | 상품 준비 중 |
| READY | 상품 준비 완료 |
| PICKED_UP | 배달원 픽업 완료 |
| DELIVERING | 배송 중 |
| DELIVERED | 배송 완료 |
| CANCELLED | 주문 취소 |
| REJECTED | 마트 거절 |

### OrderType (주문 유형)

| 값 | 설명 |
|----|------|
| REGULAR | 즉시 배송 주문 |
| SCHEDULED | 예약 배송 주문 |
| SUBSCRIPTION | 구독 자동 주문 |

### DeliveryStatus (배달 상태)

| 값 | 설명 |
|----|------|
| REQUESTED | 배달 요청됨 |
| ACCEPTED | 배달원 수락 |
| PICKING_UP | 마트로 이동 중 |
| PICKED_UP | 픽업 완료 |
| DELIVERING | 배송 중 |
| DELIVERED | 배송 완료 |
| CANCELLED | 배달 취소 |

### SubscriptionCycle (구독 주기)

| 값 | 설명 |
|----|------|
| WEEKLY | 매주 |
| BIWEEKLY | 격주 |
| MONTHLY | 매월 |

### SubscriptionStatus (구독 상태)

| 값 | 설명 |
|----|------|
| ACTIVE | 활성 |
| PAUSED | 일시정지 |
| CANCELLED | 해지 |

### VehicleType (배달 수단)

| 값 | 설명 |
|----|------|
| WALK | 도보 |
| BICYCLE | 자전거 |
| MOTORCYCLE | 오토바이 |
| CAR | 자동차 |

### PaymentMethod (결제 수단)

| 값 | 설명 |
|----|------|
| CARD | 신용/체크카드 |
| KAKAO_PAY | 카카오페이 |
| NAVER_PAY | 네이버페이 |
| TOSS_PAY | 토스페이 |

### PaymentStatus (결제 상태)

| 값 | 설명 |
|----|------|
| PENDING | 결제 대기 |
| COMPLETED | 결제 완료 |
| FAILED | 결제 실패 |
| CANCELLED | 결제 취소 |
| REFUNDED | 환불 완료 |

### DiscountType (할인 유형)

| 값 | 설명 |
|----|------|
| FIXED | 정액 할인 |
| PERCENTAGE | 정률 할인 |

### PointType (포인트 유형)

| 값 | 설명 |
|----|------|
| EARN | 적립 |
| USE | 사용 |
| EXPIRE | 만료 |
| CANCEL | 취소 (적립/사용 취소) |

### NotificationType (알림 유형)

| 값 | 설명 |
|----|------|
| ORDER | 주문 관련 |
| DELIVERY | 배달 관련 |
| PROMOTION | 프로모션/이벤트 |
| SYSTEM | 시스템 공지 |

### ReportReasonType (신고 사유)

| 값 | 설명 |
|----|------|
| FRAUD | 사기/허위 |
| HARASSMENT | 괴롭힘/욕설 |
| QUALITY | 품질 문제 |
| OTHER | 기타 |

### InquiryCategory (문의 유형)

| 값 | 설명 |
|----|------|
| ORDER | 주문 관련 |
| PAYMENT | 결제 관련 |
| DELIVERY | 배달 관련 |
| ACCOUNT | 계정 관련 |
| OTHER | 기타 |

---

## 7.2 참고 문서

- 동네마켓 PRD (Product Requirements Document) v1.0
- 동네마켓 프로젝트 소개서
- 동네마켓 요구사항 명세서 초안

## 7.3 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-21 | - | 최초 작성 |

---

*— 문서 끝 —*
