# ERD 엔티티 설명서 v4.1 — DBA 검증 보고서

> 검증 대상: `ERD_엔티티_설명서_v4.1.md` (PostgreSQL 16 + PostGIS 3.4)
> 검증일: 2026-01-29 | 검증자: DBA

---

## 1. 검증 개요

| 항목 | 내용 |
|------|------|
| 문서 버전 | v4.1 |
| DBMS | PostgreSQL 16 + PostGIS 3.4 |
| 전환 기준 | MySQL 8.0 → PostgreSQL 16 |
| 테이블 수 | 41개 (11개 모듈) |
| ENUM 타입 수 | 27개 |
| 확장(Extension) | `postgis`, `pg_trgm` |
| 공통 트리거 | `set_updated_at()` |

---

## 2. 검증 요약

| 카테고리 | 검증 항목 수 | PASS | WARN | FAIL |
|----------|:----------:|:----:|:----:|:----:|
| 데이터 타입 일관성 | 5 | 5 | 0 | 0 |
| ENUM 타입 정합성 | 4 | 2 | 2 | 0 |
| PostGIS 공간 데이터 | 4 | 4 | 0 | 0 |
| 트리거 커버리지 | 3 | 3 | 0 | 0 |
| 인덱스 설계 | 5 | 3 | 2 | 0 |
| FK 참조 무결성 | 4 | 2 | 2 | 0 |
| 비즈니스 규칙 매핑 | 4 | 2 | 2 | 0 |
| 네이밍 컨벤션 | 4 | 3 | 1 | 0 |
| **합계** | **33** | **24** | **9** | **0** |

**종합 판정**: ✅ **PASS (조건부)** — FAIL 0건, WARN 9건 (P0 1건, P1 5건, P2 3건)

---

## 3. 카테고리별 상세 검증

---

### 3.1 데이터 타입 일관성 검증

#### 3.1.1 PK 타입 — ✅ PASS

| 검증 항목 | 결과 |
|-----------|------|
| `BIGINT GENERATED ALWAYS AS IDENTITY` 사용 | 39개 테이블 적용 완료 |
| 복합 PK 예외 | `subscription_day_of_week` (subscription_id + day_of_week) — 정상 |

#### 3.1.2 시간 타입 — ✅ PASS

| 검증 항목 | 결과 |
|-----------|------|
| `TIMESTAMPTZ` 사용 | 108개 시간 컬럼 전수 적용 |
| `TIME` (예외 허용) | `store_business_hours.open_time`, `close_time` — 시각 데이터로 적절 |
| `DATE` (예외 허용) | `settlement_period_start/end`, `next_payment_date`, `scheduled_date`, `start_date`, `end_date` — 날짜 데이터로 적절 |

#### 3.1.3 BOOLEAN 타입 — ✅ PASS

| 컬럼 | DEFAULT | 판정 |
|------|---------|------|
| `users.terms_agreed` | `FALSE` | ✅ |
| `users.privacy_agreed` | `FALSE` | ✅ |
| `addresses.is_default` | `FALSE` | ✅ |
| `stores.is_delivery_available` | `FALSE` | ✅ |
| `store_business_hours.is_closed` | `FALSE` | ✅ |
| `products.is_active` | `TRUE` | ✅ |
| `riders.id_card_verified` | `FALSE` | ✅ |
| `payment_methods.is_default` | `FALSE` | ✅ |
| `rider_locations.is_current` | `TRUE` | ✅ |
| `reviews.is_visible` | `TRUE` | ✅ |
| `notifications.is_read` | `FALSE` | ✅ |
| `notices.is_pinned` | `FALSE` | ✅ |

> MySQL의 `DEFAULT 0/1` → `DEFAULT FALSE/TRUE` 전환 100% 완료

#### 3.1.4 숫자 타입 — ✅ PASS

| 타입 | 사용처 | 판정 |
|------|--------|------|
| `INTEGER` | stock, order_count, review_count, prep_time, quantity, display_order, sort_order, total_delivery_count, delivery_count_of_week, cycle_count, estimated_minutes | ✅ |
| `SMALLINT` | day_of_week, rating | ✅ |
| `NUMERIC(x,y)` | price, amount, fee, distance, accuracy, speed, heading, commission_rate, discount_rate | ✅ |

#### 3.1.5 MySQL 잔존 문법 — ✅ PASS

| 검색 대상 | 테이블 정의 내 발견 수 | 판정 |
|-----------|:-------------------:|------|
| `DATETIME` | 0 | ✅ |
| `TINYINT` | 0 | ✅ |
| `DECIMAL` | 0 | ✅ |
| `AUTO_INCREMENT` | 0 | ✅ |
| `ON UPDATE CURRENT_TIMESTAMP` | 0 | ✅ |
| `FULLTEXT` | 0 | ✅ |

> 변경 이력(line 12)에 변환 전 MySQL 용어가 언급되나, 이는 설명 목적이므로 정상

---

### 3.2 ENUM 타입 정합성 검증

#### 3.2.1 ENUM 정의 ↔ 사용 매핑 — ✅ PASS

| ENUM 타입 | 사용 테이블.컬럼 | 판정 |
|-----------|----------------|------|
| `user_status` | `users.status` | ✅ |
| `social_provider` | `social_logins.provider` | ✅ |
| `store_status` | `stores.status`, **`riders.status`** | ⚠ |
| `store_active_status` | `stores.is_active` | ✅ |
| `order_type` | `orders.order_type`, `store_orders.order_type` | ✅ |
| `order_status` | `orders.status` | ✅ |
| `store_order_status` | `store_orders.status` | ✅ |
| `payment_method_type` | `payments.payment_method`, `payment_methods.method_type` | ✅ |
| `payment_status` | `payments.payment_status` | ✅ |
| `rider_operation_status` | `riders.operation_status` | ✅ |
| `delivery_status` | `deliveries.status` | ✅ |
| `subscription_product_status` | `subscription_products.status` | ✅ |
| `subscription_status` | `subscriptions.status` | ✅ |
| `sub_history_status` | `subscription_history.status` | ✅ |
| `settlement_target_type` | `settlements.target_type` | ✅ |
| `settlement_status` | `settlements.status` | ✅ |
| `applicant_type` | `approval_documents.applicant_type` | ✅ |
| `approval_applicant_type` | `approvals.applicant_type` | ✅ |
| `approval_status` | `approvals.status` | ✅ |
| `document_type` | `approval_documents.document_type` | ✅ |
| `notification_ref_type` | `notifications.reference_type` | ✅ |
| `broadcast_ref_type` | `notification_broadcasts.reference_type` | ✅ |
| `report_target_type` | `reports.reporter_type`, `reports.target_type` | ✅ |
| `report_status` | `reports.status` | ✅ |
| `inquiry_category` | `inquiries.category` | ✅ |
| `inquiry_status` | `inquiries.status` | ✅ |
| `content_status` | `notices.status`, `banners.status` | ✅ |
| `promotion_status` | `promotions.status` | ✅ |

> 27개 ENUM 타입 전수 매핑 완료. 미사용/미정의 타입 **0건**.

#### 3.2.2 의미적 타입 적합성 — ⚠️ WARN (P0)

| 이슈 ID | 테이블 | 컬럼 | ENUM 타입 | 문제 |
|---------|--------|------|-----------|------|
| **ENUM-01** | `riders` | `status` | `store_status` | 배달원 승인 상태에 "마트 상태" 타입을 사용. 값 자체는 동일(`PENDING, APPROVED, REJECTED, SUSPENDED`)하나 의미적으로 부적합 |

**권고**: `rider_approval_status` 또는 범용 `approval_status`로 분리 정의

```sql
-- 권고안 A: 별도 타입
CREATE TYPE rider_approval_status AS ENUM ('PENDING','APPROVED','REJECTED','SUSPENDED');

-- 권고안 B: 범용 타입으로 통합
CREATE TYPE entity_approval_status AS ENUM ('PENDING','APPROVED','REJECTED','SUSPENDED');
-- stores.status, riders.status 모두 이 타입 사용
```

#### 3.2.3 유사 타입 혼동 가능성 — ⚠️ WARN (P2)

| 이슈 ID | 타입 1 | 타입 2 | 문제 |
|---------|--------|--------|------|
| **ENUM-02** | `applicant_type` (`STORE`, `RIDER`) | `approval_applicant_type` (`MART`, `RIDER`) | 동일 도메인이나 값이 상이(`STORE` vs `MART`). 혼동 가능성 |

**권고**: 하나로 통합하되 `STORE`/`MART` 중 하나로 통일. `approval_documents`와 `approvals`가 같은 모듈이므로 동일 타입 사용 권장.

---

### 3.3 PostGIS 공간 데이터 검증

#### 3.3.1 GEOGRAPHY 컬럼 전환 — ✅ PASS

| 테이블 | 컬럼명 | 타입 | SRID | 판정 |
|--------|--------|------|:----:|------|
| `addresses` | `location` | `GEOGRAPHY(POINT, 4326)` | 4326 | ✅ |
| `stores` | `location` | `GEOGRAPHY(POINT, 4326)` | 4326 | ✅ |
| `orders` | `delivery_location` | `GEOGRAPHY(POINT, 4326)` | 4326 | ✅ |
| `rider_locations` | `location` | `GEOGRAPHY(POINT, 4326)` | 4326 | ✅ |

> 4개 테이블 전수 전환 완료. 위경도 잔존 컬럼 **0건**.

#### 3.3.2 GIST 인덱스 — ✅ PASS

| 테이블 | 인덱스명 | 대상 컬럼 | 판정 |
|--------|----------|-----------|------|
| `addresses` | `idx_addresses_location` | `location` | ✅ |
| `stores` | `idx_stores_location` | `location` | ✅ |
| `orders` | `idx_orders_delivery_location` | `delivery_location` | ✅ |
| `rider_locations` | `idx_rider_loc_location` | `location` | ✅ |

> GEOGRAPHY 컬럼 4개 전수 GIST 인덱스 적용 완료.

#### 3.3.3 ST_MakePoint 파라미터 순서 — ✅ PASS

| 테이블 | 예시 값 | 순서 | 판정 |
|--------|---------|------|------|
| `addresses` | `ST_MakePoint(127.0396857, 37.5012743)` | 경도, 위도 | ✅ |
| `stores` | `ST_MakePoint(127.0396857, 37.5012743)` | 경도, 위도 | ✅ |
| `orders` | `ST_MakePoint(127.0396857, 37.5012743)` | 경도, 위도 | ✅ |
| `rider_locations` | `ST_MakePoint(127.0401234, 37.5015432)` | 경도, 위도 | ✅ |

> PostGIS `ST_MakePoint(longitude, latitude)` 순서 일관성 확인.

#### 3.3.4 PostGIS 비즈니스 규칙 — ✅ PASS

| 규칙 | 위치 | SQL 예시 | 판정 |
|------|------|----------|------|
| 주변 마트 검색 | `stores` 비즈니스 규칙 | `ST_DWithin(location, :point, :radius_m)` | ✅ |
| 배달 거리 산출 | `deliveries` 비즈니스 규칙 | `ST_Distance(store.location, order.delivery_location) / 1000.0` | ✅ |
| 가까운 배달원 검색 | `rider_locations` 비즈니스 규칙 | `ST_DWithin(location, :point, :radius_m)` | ✅ |

---

### 3.4 트리거 커버리지 검증

#### 3.4.1 updated_at 보유 테이블 vs 트리거 — ✅ PASS

**트리거 적용 완료 (37개 테이블)**:

| 모듈 | 테이블 | 트리거명 | 판정 |
|------|--------|----------|------|
| 사용자 | `user_roles` | `trg_user_roles_updated_at` | ✅ |
| 사용자 | `users` | `trg_users_updated_at` | ✅ |
| 사용자 | `addresses` | `trg_addresses_updated_at` | ✅ |
| 사용자 | `social_logins` | `trg_social_logins_updated_at` | ✅ |
| 마트 | `stores` | `trg_stores_updated_at` | ✅ |
| 마트 | `store_business_hours` | `trg_store_business_hours_updated_at` | ✅ |
| 상품 | `categories` | `trg_categories_updated_at` | ✅ |
| 상품 | `products` | `trg_products_updated_at` | ✅ |
| 주문 | `orders` | `trg_orders_updated_at` | ✅ |
| 주문 | `store_orders` | `trg_store_orders_updated_at` | ✅ |
| 주문 | `order_products` | `trg_order_products_updated_at` | ✅ |
| 주문 | `carts` | `trg_carts_updated_at` | ✅ |
| 주문 | `cart_products` | `trg_cart_products_updated_at` | ✅ |
| 결제 | `payments` | `trg_payments_updated_at` | ✅ |
| 결제 | `payment_refunds` | `trg_payment_refunds_updated_at` | ✅ |
| 결제 | `payment_methods` | `trg_payment_methods_updated_at` | ✅ |
| 배달 | `riders` | `trg_riders_updated_at` | ✅ |
| 배달 | `deliveries` | `trg_deliveries_updated_at` | ✅ |
| 배달 | `delivery_photos` | `trg_delivery_photos_updated_at` | ✅ |
| 구독 | `subscription_products` | `trg_subscription_products_updated_at` | ✅ |
| 구독 | `subscription_day_of_week` | `trg_subscription_day_of_week_updated_at` | ✅ |
| 구독 | `subscription_product_items` | `trg_subscription_product_items_updated_at` | ✅ |
| 구독 | `subscriptions` | `trg_subscriptions_updated_at` | ✅ |
| 구독 | `subscription_history` | `trg_subscription_history_updated_at` | ✅ |
| 리뷰 | `reviews` | `trg_reviews_updated_at` | ✅ |
| 정산 | `settlements` | `trg_settlements_updated_at` | ✅ |
| 정산 | `settlement_details` | `trg_settlement_details_updated_at` | ✅ |
| 승인 | `approval_documents` | `trg_approval_documents_updated_at` | ✅ |
| 승인 | `approvals` | `trg_approvals_updated_at` | ✅ |
| 기타 | `notifications` | `trg_notifications_updated_at` | ✅ |
| 기타 | `notification_broadcasts` | `trg_notification_broadcasts_updated_at` | ✅ |
| 기타 | `reports` | `trg_reports_updated_at` | ✅ |
| 기타 | `inquiries` | `trg_inquiries_updated_at` | ✅ |
| 기타 | `notices` | `trg_notices_updated_at` | ✅ |
| 기타 | `banners` | `trg_banners_updated_at` | ✅ |
| 기타 | `promotions` | `trg_promotions_updated_at` | ✅ |
| 기타 | `promotion_products` | `trg_promotion_products_updated_at` | ✅ |

#### 3.4.2 트리거 불필요 테이블 — ✅ PASS

| 테이블 | 사유 | 판정 |
|--------|------|------|
| `roles` | `updated_at` 컬럼 없음 (경량화 설계) | ✅ 정상 |
| `rider_locations` | `updated_at` 컬럼 없음 (insert-only 시계열) | ✅ 정상 |

#### 3.4.3 트리거 함수 정의 — ✅ PASS

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

> `BEFORE UPDATE` 타이밍, `FOR EACH ROW` 실행 단위 적절.

---

### 3.5 인덱스 설계 검증

#### 3.5.1 PK 자동 인덱스 중복 — ✅ PASS

> PK를 별도 인덱스로 재선언한 사례 **0건**. PostgreSQL은 PK에 자동 B-tree 인덱스를 생성하므로 중복 없음.

#### 3.5.2 UNIQUE 제약과 인덱스 중복 — ✅ PASS

> `UNIQUE` 제약은 인덱스 섹션에서 `UNIQUE` 유형으로 표기. PostgreSQL은 UNIQUE 제약 시 자동으로 인덱스를 생성하므로, 문서상 유형 표기는 설계 명세 목적으로 적절.

#### 3.5.3 FK 컬럼 인덱스 커버리지 — ⚠️ WARN (P1)

PostgreSQL은 FK 컬럼에 자동 인덱스를 생성하지 않음. FK 컬럼에 인덱스가 없으면 참조 테이블 DELETE 시 풀스캔 발생.

| 이슈 ID | 테이블 | FK 컬럼 | 참조 대상 | 인덱스 유무 | 영향도 |
|---------|--------|---------|-----------|:---------:|--------|
| **IDX-01** | `subscriptions` | `subscription_product_id` | `subscription_products` | ❌ | 구독상품 삭제/변경 시 풀스캔 |
| **IDX-02** | `subscriptions` | `address_id` | `addresses` | ❌ | 주소 삭제 시 풀스캔 |
| **IDX-03** | `subscriptions` | `payment_method_id` | `payment_methods` | ❌ | 결제수단 삭제 시 풀스캔 |
| **IDX-04** | `approvals` | `approved_by` | `users` | ❌ | 관리자별 승인 이력 조회 불가 |
| **IDX-05** | `reports` | `store_order_id` | `store_orders` | ❌ | 주문별 신고 조회 불가 |
| **IDX-06** | `inquiries` | `answered_by` | `users` | ❌ | 관리자별 답변 이력 조회 불가 |

**권고**:
```sql
-- 필수 추가 인덱스
CREATE INDEX idx_subscriptions_sub_product ON subscriptions(subscription_product_id);
CREATE INDEX idx_subscriptions_address ON subscriptions(address_id);
CREATE INDEX idx_subscriptions_payment_method ON subscriptions(payment_method_id);

-- 선택적 추가 (조회 빈도에 따라)
CREATE INDEX idx_approvals_approved_by ON approvals(approved_by);
CREATE INDEX idx_reports_store_order ON reports(store_order_id);
CREATE INDEX idx_inquiries_answered_by ON inquiries(answered_by);
```

#### 3.5.4 복합 인덱스 컬럼 순서 — ✅ PASS

| 인덱스 | 컬럼 순서 | 카디널리티 분석 | 판정 |
|--------|-----------|---------------|------|
| `idx_orders_user_status` | (user_id, status) | 높은→낮은 | ✅ |
| `idx_store_order_store_status` | (store_id, status) | 높은→낮은 | ✅ |
| `idx_settlements_target_period` | (target_type, target_id, period_start) | 낮은→높은→높은 | ✅ `target_type` 필터 선행 적절 |
| `idx_notifications_user_read` | (user_id, is_read, sent_at) | 높은→낮은→높은 | ✅ |
| `idx_notices_status_pinned` | (status, is_pinned, created_at) | 낮은→낮은→높은 | ✅ 범위 조건 후행 |

#### 3.5.5 GIN 인덱스 — ✅ PASS

| 인덱스 | 대상 | 연산자 클래스 | 용도 | 판정 |
|--------|------|-------------|------|------|
| `idx_products_name_trgm` | `products.product_name` | `gin_trgm_ops` | 상품명 유사/부분 검색 | ✅ |

> `pg_trgm` 확장 선언 완료. 한국어 LIKE/유사 검색에 적합.

---

### 3.6 FK 참조 무결성 검증

#### 3.6.1 FK → PK 존재 확인 — ✅ PASS

> 전체 FK 참조 대상 테이블 및 PK 존재 확인 완료. 존재하지 않는 참조 **0건**.

#### 3.6.2 순환 참조 — ✅ PASS

> 순환 참조 **0건**. 단방향 참조 구조 유지.

#### 3.6.3 ON DELETE/ON UPDATE 정책 — ⚠️ WARN (P1)

| 이슈 ID | 문제 |
|---------|------|
| **FK-01** | 전체 41개 테이블의 FK에 `ON DELETE` / `ON UPDATE` 정책이 명시되지 않음 |

PostgreSQL 기본값은 `ON DELETE NO ACTION ON UPDATE NO ACTION`이며, 이는 `RESTRICT`와 동일하게 동작(트랜잭션 단위 차이만 존재). 현재 동작에는 문제 없으나, 명시적 정책 선언이 설계 문서로서 완결성을 높임.

**권고 — FK 삭제 정책 매트릭스**:

| FK 관계 | 권고 정책 | 사유 |
|---------|----------|------|
| `user_roles` → `users` | `ON DELETE CASCADE` | 사용자 삭제 시 역할 매핑 함께 삭제 |
| `user_roles` → `roles` | `ON DELETE RESTRICT` | 역할 삭제 방지 |
| `addresses` → `users` | `ON DELETE CASCADE` | 사용자 삭제 시 주소 함께 삭제 |
| `social_logins` → `users` | `ON DELETE CASCADE` | 사용자 삭제 시 소셜 연동 함께 삭제 |
| `stores` → `users` | `ON DELETE RESTRICT` | 마트 보존 (Soft Delete 사용) |
| `products` → `stores` | `ON DELETE RESTRICT` | 마트 삭제 방지 |
| `orders` → `users` | `ON DELETE RESTRICT` | 주문 이력 보존 |
| `store_orders` → `orders` | `ON DELETE RESTRICT` | 주문 이력 보존 |
| `payments` → `orders` | `ON DELETE RESTRICT` | 결제 이력 보존 |
| `deliveries` → `store_orders` | `ON DELETE RESTRICT` | 배달 이력 보존 |
| `rider_locations` → `riders` | `ON DELETE CASCADE` | 위치 이력 자동 정리 |
| `reviews` → `store_orders` | `ON DELETE RESTRICT` | 리뷰 보존 |
| `settlement_details` → `settlements` | `ON DELETE CASCADE` | 정산 삭제 시 상세 함께 삭제 |
| `approval_documents` → `approvals` | `ON DELETE CASCADE` | 승인건 삭제 시 서류 함께 삭제 |
| `promotion_products` → `promotions` | `ON DELETE CASCADE` | 프로모션 삭제 시 상품 매핑 삭제 |
| 기타 | `ON DELETE RESTRICT` | 기본값 유지 (데이터 보존) |

#### 3.6.4 문서 순서와 FK 의존성 — ⚠️ WARN (P1)

| 이슈 ID | 문제 |
|---------|------|
| **FK-02** | `subscription_day_of_week` (3.7절)가 FK로 참조하는 `subscriptions`보다 문서에서 먼저 정의됨 |

**영향**: DDL 실행 순서에서 에러 발생 가능. 문서 순서 조정 또는 DDL 실행 시 `ALTER TABLE ... ADD CONSTRAINT` 후처리 필요.

**권고**: 구독 모듈 내 테이블 순서를 의존성 기준으로 재정렬:
1. `subscription_products` → 2. `subscriptions` → 3. `subscription_day_of_week` → 4. `subscription_product_items` → 5. `subscription_history`

---

### 3.7 비즈니스 규칙 vs 제약조건 매핑 검증

#### 3.7.1 CHECK 제약 구현 현황 — ✅ PASS

| 규칙 | 테이블.컬럼 | CHECK 구현 | 판정 |
|------|-----------|:---------:|------|
| 가격 > 0 | `products.price` | ✅ | DB 레벨 |
| 수량 >= 1 | `order_products.quantity` | ✅ | DB 레벨 |
| 수량 >= 1 | `cart_products.quantity` | ✅ | DB 레벨 |
| 수량 >= 1 | `subscription_product_items.quantity` | ✅ | DB 레벨 |
| 구독 가격 > 0 | `subscription_products.price` | ✅ | DB 레벨 |
| 평점 1~5 | `reviews.rating` | ✅ | DB 레벨 |
| 요일 0~6 | `store_business_hours.day_of_week` | ✅ | DB 레벨 |
| 요일 0~6 | `subscription_day_of_week.day_of_week` | ✅ | DB 레벨 |

#### 3.7.2 파생 필드 정합성 — ⚠️ WARN (P2)

| 이슈 ID | 규칙 | 테이블 | 구현 |
|---------|------|--------|------|
| **BIZ-01** | `final_price = total_product_price + total_delivery_fee` | `orders` | 비즈니스 규칙 명시만, CHECK 없음 |
| **BIZ-02** | `final_price = store_product_price + delivery_fee` | `store_orders` | 미명시 |
| **BIZ-03** | `net_amount = amount - fee` | `settlement_details` | 비즈니스 규칙 명시만, CHECK 없음 |
| **BIZ-04** | `settlement_amount = total_sales - platform_fee` | `settlements` | 비즈니스 규칙 명시만, CHECK 없음 |

**권고**: 파생 필드의 정합성을 DB 레벨에서 보장하려면 CHECK 제약 추가:
```sql
-- 예시
ALTER TABLE orders ADD CONSTRAINT chk_orders_final_price
  CHECK (final_price = total_product_price + total_delivery_fee);
```

> 단, 쿠폰/할인 등 향후 확장 시 CHECK 제약이 제약될 수 있으므로 **트리거 또는 애플리케이션 레벨** 검증도 고려.

#### 3.7.3 carts 비즈니스 규칙 오류 — ⚠️ WARN (P2)

| 이슈 ID | 문제 |
|---------|------|
| **BIZ-05** | `carts` 테이블 비즈니스 규칙에 "`quantity >= 1` (CHECK 제약)" 언급되나, `carts` 테이블에는 `quantity` 컬럼이 존재하지 않음. 해당 규칙은 `cart_products` 테이블에 해당 |

**권고**: `carts` 비즈니스 규칙에서 해당 항목 제거 또는 `cart_products` 참조로 수정.

#### 3.7.4 영업시간 CHECK — ✅ PASS

> `store_business_hours`의 비즈니스 규칙에 `close_time > open_time` (CHECK 제약) 명시. 적절.

---

### 3.8 네이밍 컨벤션 검증

#### 3.8.1 테이블명 — ✅ PASS

> 전체 41개 테이블 `snake_case` 복수형 준수. 예외 없음.

#### 3.8.2 컬럼명 — ✅ PASS

> `snake_case` 일관 적용. 예외 없음.

#### 3.8.3 인덱스명 접두사 — ✅ PASS

| 접두사 | 용도 | 사용 수 | 판정 |
|--------|------|:------:|------|
| `idx_` | 일반 인덱스 | 다수 | ✅ |
| `uq_` | UNIQUE 인덱스 | 다수 | ✅ |
| `(PK)` | Primary Key | 1 (subscription_day_of_week) | ✅ |

#### 3.8.4 ENUM 타입명 일관성 — ⚠️ WARN (P2)

| 이슈 ID | 문제 |
|---------|------|
| **NAME-01** | `applicant_type` vs `approval_applicant_type` — 동일 도메인(신청자 유형)에 유사한 이름의 타입 2개 존재. `approval_documents.applicant_type`은 `applicant_type`, `approvals.applicant_type`은 `approval_applicant_type` 사용. 혼동 가능 |

**권고**: 하나의 통합 타입으로 병합하거나, 명확히 구분되는 이름 부여 (예: `document_applicant_type` vs `approval_applicant_type`)

---

## 4. 발견된 이슈 목록 (심각도별)

### P0 — 설계 결함 (즉시 수정 권고)

| ID | 테이블 | 이슈 | 권고 |
|----|--------|------|------|
| ENUM-01 | `riders` | `status` 컬럼이 `store_status` ENUM 사용. 의미적 부적합 | `rider_approval_status` 또는 범용 `entity_approval_status` 타입 분리 정의 |

### P1 — 잠재적 성능/무결성 이슈 (계획 수정 권고)

| ID | 테이블 | 이슈 | 권고 |
|----|--------|------|------|
| IDX-01~03 | `subscriptions` | `subscription_product_id`, `address_id`, `payment_method_id` FK에 인덱스 없음 | 3개 인덱스 추가 |
| IDX-04~06 | `approvals`, `reports`, `inquiries` | `approved_by`, `store_order_id`, `answered_by` FK에 인덱스 없음 | 3개 인덱스 추가 (조회 빈도 검토 후) |
| FK-01 | 전체 | FK에 ON DELETE/ON UPDATE 정책 미명시 | 관계별 삭제 정책 명시 (§3.6.3 매트릭스 참조) |
| FK-02 | `subscription_day_of_week` | FK 참조 대상(`subscriptions`)보다 문서에서 먼저 정의 | DDL 의존성 순서 재정렬 |

### P2 — 문서 품질/일관성 이슈

| ID | 테이블 | 이슈 | 권고 |
|----|--------|------|------|
| ENUM-02 | `approval_documents`, `approvals` | `applicant_type` vs `approval_applicant_type` 유사 타입 혼동 가능 | 통합 또는 명칭 명확화 |
| BIZ-01~04 | `orders`, `store_orders`, `settlements`, `settlement_details` | 파생 금액 필드에 CHECK 제약 없음 | CHECK 또는 트리거 추가 검토 |
| BIZ-05 | `carts` | 비즈니스 규칙에 `quantity CHECK` 오기재 (해당 컬럼 없음) | `cart_products` 참조로 수정 |
| NAME-01 | 타입 정의 | `applicant_type` / `approval_applicant_type` 이름 혼동 | 네이밍 정리 |

---

## 5. 권고사항

### 5.1 즉시 조치 (P0)

1. **`riders.status` ENUM 타입 변경**
   - `store_status` → `rider_approval_status` 또는 범용 `entity_approval_status`
   - v4.2 또는 v4.1 핫픽스로 반영

### 5.2 설계 보완 (P1)

2. **FK 인덱스 6건 추가**
   - `subscriptions` 테이블: 3개 FK 인덱스
   - `approvals`, `reports`, `inquiries`: 각 1개 FK 인덱스

3. **FK 삭제 정책 명시**
   - §3.6.3의 FK 삭제 정책 매트릭스를 엔티티 설명서에 반영
   - 최소한 `CASCADE` / `RESTRICT` / `SET NULL` 중 택1 명시

4. **구독 모듈 테이블 순서 재정렬**
   - DDL 의존성 기준: `subscription_products` → `subscriptions` → `subscription_day_of_week` → `subscription_product_items` → `subscription_history`

### 5.3 문서 개선 (P2)

5. **ENUM 타입 정리**
   - `applicant_type` + `approval_applicant_type` → 통합 또는 명칭 명확화
   - `STORE` vs `MART` 용어 통일

6. **파생 필드 CHECK 제약 검토**
   - 금액 파생 필드에 CHECK 추가 가능 여부 판단 (쿠폰/할인 확장 고려)

7. **`carts` 비즈니스 규칙 오류 수정**
   - `quantity >= 1 CHECK` 항목을 `cart_products`로 이동

---

## 6. 결론

`ERD_엔티티_설명서_v4.1.md`의 MySQL → PostgreSQL 16 + PostGIS 3.4 전환은 **전반적으로 높은 품질**로 수행됨.

| 평가 항목 | 결과 |
|-----------|------|
| 데이터 타입 전환 | **완벽** — MySQL 잔존 문법 0건 |
| PostGIS 전환 | **완벽** — 4개 테이블 GEOGRAPHY + GIST 전수 적용 |
| 트리거 커버리지 | **완벽** — updated_at 보유 37개 테이블 전수 적용 |
| ENUM 타입 정의 | **양호** — 27개 타입 전수 매핑, 의미적 부적합 1건 |
| 인덱스 설계 | **양호** — FK 인덱스 누락 6건 보완 필요 |
| FK 참조 무결성 | **양호** — 삭제 정책 명시 필요 |
| 비즈니스 규칙 | **양호** — 파생 필드 CHECK 미구현, 오기재 1건 |
| 네이밍 컨벤션 | **양호** — 유사 타입명 혼동 가능성 1건 |

**종합 판정**: ✅ **조건부 PASS** — P0 1건 수정 후 최종 승인 권고.

---

> 작성: DBA | 검증일: 2026-01-29
