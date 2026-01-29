# ERD 엔티티 설명서 DBA 평가서

> 작성일: 2026-01-29
> 대상 문서: `doc/ERD_엔티티_설명서(~ing).md`
> 평가 관점: DBA (Database Administrator)

---

## 종합 점수: 5.0 / 10

| # | 평가 항목 | 점수 | 등급 |
|---|----------|------|------|
| 1 | 네이밍 컨벤션 | 4/10 | 미흡 |
| 2 | 데이터 타입 정의 | 2/10 | 심각 |
| 3 | 스키마-인덱스 정합성 | 3/10 | 미흡 |
| 4 | 정규화 수준 | 6/10 | 보통 |
| 5 | 참조 무결성 | 5/10 | 보통 |
| 6 | 엔티티 문서 완성도 | 5/10 | 보통 |
| 7 | 필수 필드 누락 | 4/10 | 미흡 |
| 8 | 성능 설계 | 6/10 | 보통 |
| 9 | 보안 설계 | 7/10 | 양호 |
| 10 | 전체 구조 일관성 | 5/10 | 보통 |

---

## 1. 네이밍 컨벤션 (4/10)

### 문제점

#### 1.1 PK 네이밍 불일치

테이블별 PK 네이밍이 통일되지 않음.

| 패턴 | 예시 | 비율 |
|------|------|------|
| `{entity}_id` | user_id, store_id, product_id | ~70% |
| `{short}_id` | approval_id (store_approvals, rider_approvals) | ~15% |
| `id` | 일부 엔티티 | ~15% |

**권장**: 전체 `{table_name(단수)}_id` 패턴으로 통일
- `store_approvals.approval_id` → `store_approvals.store_approval_id`
- `rider_approvals.approval_id` → `rider_approvals.rider_approval_id`

#### 1.2 FK 네이밍 불일치

| 현재 | 문제 | 권장 |
|------|------|------|
| `approved_by` | 참조 테이블 불명확 | `approved_by_user_id` 또는 `approved_by` + 주석 |
| `reporter_id` | 다형성 참조, 대상 불명확 | `reporter_user_id` (users 통일 시) |
| `target_id` | 다형성 참조, 대상 불명확 | 타입별 분리 또는 명시적 주석 |

#### 1.3 테이블명 단수/복수 혼용

대부분 복수형(users, stores, products)으로 통일되어 있어 양호하나, 일부 확인 필요:
- `cart` (단수) vs `cart_item` (단수+복수) — `carts` / `cart_items`가 관례적
- `store_order` (단수) — `store_orders`가 적합

---

## 2. 데이터 타입 정의 (2/10) ⚠️ 심각

### 문제점

ERD 문서에 **데이터 타입이 전혀 명시되지 않음**. 모든 필드가 이름과 설명만 존재.

```
❌ 현재:
├── user_id (PK)
├── email                ← VARCHAR? TEXT? 길이는?
├── password_hash        ← VARCHAR(60)? VARCHAR(255)?
├── phone                ← VARCHAR(11)? VARCHAR(20)?
└── status               ← ENUM? VARCHAR? TINYINT?

✅ 권장:
├── user_id       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
├── email         VARCHAR(255) NOT NULL UNIQUE
├── password_hash VARCHAR(255) NOT NULL
├── phone         VARCHAR(20) NOT NULL
└── status        ENUM('ACTIVE','INACTIVE','SUSPENDED','WITHDRAWN') NOT NULL DEFAULT 'ACTIVE'
```

### 영향도

- 개발자가 임의로 타입을 결정하게 됨 → 불일치 발생
- 스토리지 최적화 불가 (VARCHAR(20) vs TEXT 차이 큼)
- ENUM 값의 정확한 목록이 불명확
- 금액 필드의 정밀도 불명확 (DECIMAL(10,0)? DECIMAL(12,2)? INT?)

### 즉시 정의 필요 필드

| 카테고리 | 필드 예시 | 권장 타입 |
|---------|---------|----------|
| 금액 | price, total_amount, delivery_fee | `DECIMAL(12,0)` (원 단위) 또는 `DECIMAL(12,2)` |
| 상태 | status 전체 | `ENUM(...)` 또는 `VARCHAR(20)` |
| 좌표 | latitude, longitude | `DECIMAL(10,7)` |
| URL | image_url, document_url | `VARCHAR(500)` 또는 `TEXT` |
| 전화번호 | phone, contact | `VARCHAR(20)` |
| 이메일 | email | `VARCHAR(255)` |
| 비밀번호 | password_hash | `VARCHAR(255)` |

---

## 3. 스키마-인덱스 정합성 (3/10)

### 발견된 오류 7건

| # | 엔티티 | 인덱스 정의 | 문제 |
|---|--------|-----------|------|
| 1 | `orders` | `idx_order_date(order_date)` | `order_date` 컬럼이 엔티티에 **없음** (`created_at` 사용해야 함) |
| 2 | `orders` | `idx_delivery_status(delivery_status)` | `delivery_status` 컬럼이 orders에 **없음** (deliveries 테이블에 존재) |
| 3 | `deliveries` | `idx_delivery_date(delivery_date)` | `delivery_date` 컬럼이 deliveries에 **없음** |
| 4 | `settlements` | `idx_settlement_period(period_start, period_end)` | `period_start`, `period_end` 컬럼이 **없음** (`settlement_period_start/end` 또는 다른 이름이어야 함) |
| 5 | `reports` | `idx_report_date(created_at)` | 존재는 하나 인덱스명이 컬럼명과 불일치 (혼동 유발) |
| 6 | `subscription_products` | 인덱스 미정의 | `store_id` 조회 빈번할 것으로 예상되나 인덱스 없음 |
| 7 | `cart_item` | 인덱스 미정의 | `cart_id + product_id` 복합 유니크 인덱스 필요 |

### 권장 조치

```sql
-- 1. orders: 잘못된 인덱스 수정
DROP INDEX idx_order_date;
CREATE INDEX idx_orders_created_at ON orders(created_at);

DROP INDEX idx_delivery_status;
-- delivery_status는 deliveries 테이블에 인덱스 추가
CREATE INDEX idx_deliveries_status ON deliveries(status);

-- 2. deliveries: 잘못된 인덱스 수정
DROP INDEX idx_delivery_date;
CREATE INDEX idx_deliveries_created_at ON deliveries(created_at);

-- 3. settlements: 컬럼명 확인 후 수정
-- period_start/period_end 컬럼이 없다면 추가하거나, 인덱스 컬럼명을 실제 컬럼으로 변경

-- 4. 누락 인덱스 추가
CREATE INDEX idx_subscription_products_store ON subscription_products(store_id);
CREATE UNIQUE INDEX uq_cart_item ON cart_item(cart_id, product_id);
```

---

## 4. 정규화 수준 (6/10)

### 양호한 점
- 대부분 3NF 수준 유지
- 주문 시점 가격 스냅샷 (`order_items.unit_price`) 적절
- `store_business_hours` 분리 적절 (1:N)

### 개선 필요

#### 4.1 `users` 테이블 과부하

현재 `users` 테이블이 고객/마트관리자/배달원/관리자를 모두 포함. role에 따라 사용하지 않는 필드가 많아질 가능성.

```
users
├── 공통: user_id, email, password_hash, name, phone, role, status
├── 고객 전용: (addresses 분리됨 - 양호)
├── 마트 전용: (stores 분리됨 - 양호)
└── 라이더 전용: (riders 분리됨 - 양호)
```

→ 현재 구조는 **Single Table Inheritance** 패턴으로, 이 규모에서는 허용 가능.

#### 4.2 `stores.average_rating` 반정규화

`reviews` 테이블에서 계산 가능한 값을 `stores`에 중복 저장.

- 현 상태: 허용 (성능 최적화 목적)
- 주의: `reviews` 변경 시 `stores.average_rating` 동기화 트리거 또는 배치 필요

#### 4.3 `subscription_day_of_week` 설계

구독 배송 요일을 별도 행으로 저장하는 것은 정규화 관점에서 정확하나, JSON 배열(`delivery_days JSON`) 또는 비트 플래그(`delivery_days_flag TINYINT`)가 더 실용적일 수 있음.

#### 4.4 `store_order` 필요성 재검토

`orders` → `store_order` → `order_items` 3단계 구조에서, 다중 마트 주문이 아닌 경우 `store_order`가 불필요한 계층. 다중 마트 주문 지원 여부 확인 필요.

---

## 5. 참조 무결성 (5/10)

### 다형성 FK 패턴 (3건)

DB 레벨에서 FK 제약을 걸 수 없는 다형성 참조가 3곳 존재:

| 엔티티 | 필드 | 참조 대상 |
|--------|------|----------|
| `reports` | `reporter_type + reporter_id` | users / stores / riders |
| `reports` | `target_type + target_id` | stores / riders / reviews / users |
| `approval_documents` | `applicant_type + store_id/rider_id` | stores / riders |

### 권장 조치

1. **`reports.reporter_id`**: `users.user_id`로 통일 (stores/riders도 user_id 보유)
   - `reporter_type`은 UI 표시용으로만 유지하거나 JOIN으로 해결
2. **`reports.target_id`**: 다형성 유지 불가피하나, 앱 레벨 검증 필수
3. **`approval_documents`**: `store_id`, `rider_id` 분리 FK 유지 + CHECK 제약 추가

```sql
-- approval_documents CHECK 제약
ALTER TABLE approval_documents
ADD CONSTRAINT chk_applicant CHECK (
  (store_id IS NOT NULL AND rider_id IS NULL) OR
  (store_id IS NULL AND rider_id IS NOT NULL)
);
```

### ON DELETE 정책 미정의

모든 FK에 ON DELETE 정책(CASCADE, SET NULL, RESTRICT)이 명시되지 않음.

| 관계 | 권장 정책 |
|------|----------|
| `orders.user_id → users` | RESTRICT (주문 있으면 사용자 삭제 불가) |
| `order_items.order_id → orders` | CASCADE (주문 삭제 시 항목도 삭제) |
| `cart_item.cart_id → cart` | CASCADE |
| `reviews.user_id → users` | SET NULL (사용자 탈퇴 시 리뷰 유지) |
| `deliveries.order_id → orders` | RESTRICT |
| `store_business_hours.store_id → stores` | CASCADE |

---

## 6. 엔티티 문서 완성도 (5/10)

### 문서화가 불완전한 엔티티 5건

| # | 엔티티 | 문제 |
|---|--------|------|
| 1 | `cart` | 필드 목록만 있고 비즈니스 규칙 미설명 (장바구니 만료 정책, 마트별 분리 여부) |
| 2 | `payment_methods` | 카드 정보 저장 범위 불명확 (토큰 vs 마스킹된 번호) |
| 3 | `rider_locations` | 위치 갱신 주기, 보관 기간 미정의 (Redis 연동 언급 없음) |
| 4 | `settlement_details` | 정산 항목 상세 구조 미정의 (수수료 계산 로직) |
| 5 | `notification_broadcasts` | 대량 발송 메커니즘 미정의 (큐, 배치 처리) |

### 양호한 엔티티

- `users`: 상태 흐름(ACTIVE→SUSPENDED→WITHDRAWN) 명시
- `orders`: 상태 ENUM 값 목록 명시
- `subscriptions`: 구독 주기 및 상태 관리 구조 명확

---

## 7. 필수 필드 누락 (4/10)

### 누락된 필드 8건

| # | 엔티티 | 누락 필드 | 사유 |
|---|--------|----------|------|
| 1 | `users` | `last_login_at` | 계정 활동 추적, 휴면 계정 관리 |
| 2 | `users` | `login_fail_count` | 보안 (brute force 방지) |
| 3 | `stores` | `is_active` 또는 `status` | 마트 영업 상태 (영업중/휴업/폐업) |
| 4 | `products` | `is_active` | 상품 노출 여부 (삭제와 별개) |
| 5 | `orders` | `canceled_at` | 주문 취소 시각 (status만으로 불충분) |
| 6 | `orders` | `cancel_reason` | 취소 사유 |
| 7 | `deliveries` | `estimated_delivery_time` | 예상 배달 시간 (UX 핵심) |
| 8 | `reports` | `report_type` | 신고 유형 분류 ENUM (프론트에서 사용 중) |

### 추가 검토 필요

| 엔티티 | 필드 | 사유 |
|--------|------|------|
| `payments` | `pg_transaction_id` | PG사 거래번호 (환불/정산 추적) |
| `payments` | `paid_at` | 실제 결제 완료 시각 |
| `reviews` | `is_visible` | 리뷰 노출 여부 (관리자 숨김 처리) |
| `stores` | `commission_rate` | 마트별 수수료율 |

---

## 8. 성능 설계 (6/10)

### 양호한 점
- 주요 조회 패턴에 인덱스 정의 (orders, deliveries 등)
- `stores.average_rating` 반정규화로 목록 조회 성능 확보
- 복합 인덱스 일부 적용 (`idx_user_orders(user_id, status)`)

### 개선 필요

#### 8.1 파티셔닝 미고려

대용량 테이블에 대한 파티셔닝 전략 없음:

| 테이블 | 권장 파티셔닝 |
|--------|-------------|
| `orders` | RANGE (created_at) - 월별 파티션 |
| `order_items` | orders 파티션 키 상속 |
| `notifications` | RANGE (created_at) - 월별 파티션 |
| `rider_locations` | RANGE (created_at) - 일별 파티션 + TTL 삭제 |

#### 8.2 대량 데이터 아카이빙 전략 부재

- `notifications`: 읽은 알림 보관 기간?
- `rider_locations`: GPS 로그 보관 기간?
- `subscription_history`: 히스토리 아카이빙?

#### 8.3 커버링 인덱스 미활용

```sql
-- 마트 목록 조회 최적화 (커버링 인덱스)
CREATE INDEX idx_stores_list ON stores(status, average_rating DESC)
  INCLUDE (name, image_url, delivery_fee, min_order_amount);

-- 상품 목록 조회 최적화
CREATE INDEX idx_products_store ON products(store_id, category_id, status)
  INCLUDE (name, price, image_url);
```

---

## 9. 보안 설계 (7/10)

### 양호한 점
- `password_hash` 사용 (평문 저장 아님)
- `users.deleted_at` 소프트 삭제 패턴 적용
- `role` 기반 접근 제어 구조

### 개선 필요

#### 9.1 개인정보 민감도 분류 미표기

GDPR/개인정보보호법 관점에서 민감 필드 분류가 없음:

| 민감도 | 필드 | 처리 |
|--------|------|------|
| 높음 | password_hash, 주민등록번호 | 암호화 저장 필수 |
| 중간 | phone, email, address_detail | 마스킹 조회, 암호화 권장 |
| 낮음 | name, role, status | 일반 저장 |

#### 9.2 감사 로그(Audit Trail) 테이블 부재

관리자 행위(승인/반려/정산/신고처리)에 대한 감사 로그 테이블이 없음.

```sql
-- 권장: admin_audit_logs 테이블
CREATE TABLE admin_audit_logs (
  log_id       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id     BIGINT UNSIGNED NOT NULL,  -- FK → users
  action_type  VARCHAR(50) NOT NULL,       -- APPROVE, REJECT, SETTLE, etc.
  target_type  VARCHAR(50) NOT NULL,       -- approval, report, settlement
  target_id    BIGINT UNSIGNED NOT NULL,
  before_data  JSON,
  after_data   JSON,
  ip_address   VARCHAR(45),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 9.3 토큰/세션 관리 테이블 부재

`social_logins`는 있으나 일반 세션/JWT 리프레시 토큰 관리 테이블이 없음.

---

## 10. 전체 구조 일관성 (5/10)

### 양호한 점
- 모듈별 분류 체계 (11개 모듈) 명확
- 엔티티 간 관계 방향 일관적
- ENUM 상태값 패턴 반복 사용

### 개선 필요

#### 10.1 ENUM 상태 정의 불일치

일부 테이블은 상태값을 명시하고, 일부는 생략:

| 엔티티 | 상태 정의 | 비고 |
|--------|----------|------|
| `users.status` | ✅ 명시 (ACTIVE, INACTIVE, SUSPENDED, WITHDRAWN) | |
| `orders.status` | ✅ 명시 | |
| `stores.status` | ❌ 미명시 | 마트 상태가 무엇인지 불명확 |
| `deliveries.status` | ✅ 명시 | |
| `payments.status` | ❌ 미명시 | 결제 상태 ENUM 필요 |
| `settlements.status` | ❌ 미명시 | 정산 상태 ENUM 필요 |

#### 10.2 공통 필드 패턴 불일치

Phase 3에서 `created_at`, `updated_at`을 추가했으나, `deleted_at`(소프트 삭제)은 `users`에만 존재. 마트(`stores`), 상품(`products`) 등에도 소프트 삭제가 필요할 수 있음.

#### 10.3 버전 관리 미고려

가격 변경 이력, 상품 정보 변경 이력 등 버전 관리가 필요한 엔티티에 대한 히스토리 테이블이 부재.

---

## 우선순위별 개선 로드맵

### 🔴 P0 (즉시 수정)

| # | 항목 | 이유 |
|---|------|------|
| 1 | **전체 필드 데이터 타입 정의** | 개발 착수 전 필수, 현재 가장 큰 결함 |
| 2 | **인덱스-컬럼 불일치 7건 수정** | 잘못된 인덱스는 오류 발생 |
| 3 | **reports.report_type 추가** | 프론트엔드와 불일치 |

### 🟠 P1 (1주 내)

| # | 항목 | 이유 |
|---|------|------|
| 4 | 누락 필드 8건 추가 | 비즈니스 로직에 필요 |
| 5 | ON DELETE 정책 전체 정의 | 데이터 정합성 |
| 6 | ENUM 상태값 전체 명시 | 개발 가이드 |
| 7 | PK 네이밍 통일 | 일관성 |

### 🟡 P2 (2주 내)

| # | 항목 | 이유 |
|---|------|------|
| 8 | 감사 로그 테이블 추가 | 보안/컴플라이언스 |
| 9 | 파티셔닝 전략 수립 | 대용량 대비 |
| 10 | 개인정보 민감도 분류 | 법적 준수 |

### 🟢 P3 (향후)

| # | 항목 | 이유 |
|---|------|------|
| 11 | 가격 히스토리 테이블 | 변경 추적 |
| 12 | 세션/토큰 관리 테이블 | 인증 고도화 |
| 13 | 커버링 인덱스 설계 | 성능 최적화 |

---

## 결론

현재 ERD 엔티티 설명서는 **엔티티 식별과 관계 설계는 양호**하나, **실제 DB 구축에 필요한 구체적 정보(데이터 타입, 제약조건, 인덱스 정합성)가 부족**합니다.

가장 시급한 개선은 **데이터 타입 정의**이며, 이것이 없으면 개발자마다 다른 타입을 사용하게 되어 후속 통합 비용이 급증합니다.

구조적으로는 41개 엔티티의 모듈 분류, 관계 방향, 상태 관리 패턴이 잘 잡혀 있으므로, 위 로드맵에 따라 순차적으로 보완하면 production-ready 수준으로 도달할 수 있습니다.
