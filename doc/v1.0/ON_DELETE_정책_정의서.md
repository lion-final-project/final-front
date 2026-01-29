# ON DELETE 정책 정의서

> 작성일: 2026-01-29
> 대상: ERD 엔티티 설명서 전체 FK 관계
> 목적: 모든 외래키(FK)에 대한 삭제 정책 정의

---

## 정책 유형 설명

| 정책 | 동작 | 사용 시점 |
|------|------|----------|
| **RESTRICT** | 자식 레코드 존재 시 부모 삭제 차단 | 비즈니스상 삭제되면 안 되는 핵심 데이터 |
| **CASCADE** | 부모 삭제 시 자식도 함께 삭제 | 부모 없이 의미 없는 종속 데이터 |
| **SET NULL** | 부모 삭제 시 FK를 NULL로 변경 | 참조 끊어져도 자식 데이터 보존 필요 |
| **NO ACTION** | RESTRICT와 동일 (검사 시점만 다름) | MySQL에서는 RESTRICT와 동일 |

---

## 1. 사용자 모듈 (3.1)

### users (최상위 엔티티)

`users`는 Soft Delete (`deleted_at`) 패턴을 사용하므로 물리적 삭제가 발생하지 않음.
모든 FK는 **RESTRICT**로 설정하여 실수로 인한 물리적 삭제를 방지.

| 자식 테이블 | FK 컬럼 | ON DELETE | 사유 |
|------------|---------|-----------|------|
| addresses | user_id | **RESTRICT** | Soft Delete 정책, 물리 삭제 차단 |
| social_logins | user_id | **RESTRICT** | Soft Delete 정책, 물리 삭제 차단 |
| stores | owner_id | **RESTRICT** | 마트 데이터 보존 필수 |
| riders | user_id | **RESTRICT** | 배달원 데이터 보존 필수 |
| orders | user_id | **RESTRICT** | 주문 이력 보존 필수 |
| cart | user_id | **RESTRICT** | Soft Delete 시 장바구니는 앱 레벨에서 정리 |
| payments_methods | user_id | **RESTRICT** | 빌링키 관리 필요 |
| subscriptions | user_id | **RESTRICT** | 구독 이력 보존 |
| reviews | user_id | **RESTRICT** | 리뷰 데이터 보존 (is_visible로 제어) |
| notifications | user_id | **RESTRICT** | 알림 이력 보존 |
| inquiries | user_id | **RESTRICT** | 문의 이력 보존 |
| inquiries | answered_by | **SET NULL** | 관리자 변경/퇴사 시 답변 내용 보존 |
| notices | author_id | **SET NULL** | 관리자 변경/퇴사 시 공지 내용 보존 |
| store_approvals | approved_by | **SET NULL** | 관리자 변경/퇴사 시 승인 이력 보존 |
| rider_approvals | approved_by | **SET NULL** | 관리자 변경/퇴사 시 승인 이력 보존 |

> **원칙**: `users` 테이블은 절대 물리 삭제하지 않는다. `deleted_at`으로 소프트 삭제만 허용.

---

## 2. 마트 모듈 (3.2)

### stores

| 자식 테이블 | FK 컬럼 | ON DELETE | 사유 |
|------------|---------|-----------|------|
| store_business_hours | store_id | **CASCADE** | 마트 삭제 시 영업시간 무의미 |
| products | store_id | **RESTRICT** | 주문/정산에 참조되는 상품 보존 |
| subscription_products | store_id | **RESTRICT** | 구독 이력 참조 |
| store_order | store_id | **RESTRICT** | 주문 이력 보존 필수 |
| subscriptions | store_id | **RESTRICT** | 구독 이력 보존 |
| approval_documents | store_id | **RESTRICT** | 승인 서류 이력 보존 |
| store_approvals | store_id | **RESTRICT** | 승인 이력 보존 |
| cart_item | store_id | **RESTRICT** | 장바구니 정리 후 삭제 |

> **원칙**: `stores`도 `status=CLOSED`로 논리 삭제 권장. 물리 삭제 시 주문/정산 데이터 무결성 깨짐.

---

## 3. 상품 모듈 (3.3)

### categories

| 자식 테이블 | FK 컬럼 | ON DELETE | 사유 |
|------------|---------|-----------|------|
| products | category_id | **RESTRICT** | 상품 존재 시 카테고리 삭제 차단 |

> 카테고리 삭제 전 소속 상품의 카테고리를 변경해야 함.

### products

| 자식 테이블 | FK 컬럼 | ON DELETE | 사유 |
|------------|---------|-----------|------|
| product_images | product_id | **CASCADE** | 상품 삭제 시 이미지도 삭제 |
| order_items | product_id | **RESTRICT** | 주문 내역에서 상품 참조 보존 (스냅샷 존재하나 FK 무결성 유지) |
| cart_item | product_id | **CASCADE** | 상품 삭제 시 장바구니에서 자동 제거 |
| subscription_product_items | product_id | **RESTRICT** | 구독 상품 구성 참조 |
| subscription_items | product_id | **RESTRICT** | 활성 구독 참조 |
| promotion_products | product_id | **CASCADE** | 상품 삭제 시 프로모션 매핑 자동 제거 |

> **원칙**: `products`는 `is_active=false`로 비활성화 권장. 물리 삭제는 주문 이력 없는 상품에만 허용.

---

## 4. 주문 모듈 (3.4)

### orders

| 자식 테이블 | FK 컬럼 | ON DELETE | 사유 |
|------------|---------|-----------|------|
| store_order | order_id | **CASCADE** | 주문 삭제 시 마트별 주문도 삭제 |
| payments | order_id | **RESTRICT** | 결제 기록 보존 (PG사 정합성) |

> **원칙**: `orders`는 물리 삭제 금지. 취소된 주문도 `status=CANCELLED`로 보존.

### store_order

| 자식 테이블 | FK 컬럼 | ON DELETE | 사유 |
|------------|---------|-----------|------|
| order_items | store_order_id | **CASCADE** | 마트별 주문 삭제 시 주문 상품도 삭제 |
| deliveries | store_order_id | **RESTRICT** | 배달 이력 보존 |
| reviews | store_order_id | **RESTRICT** | 리뷰 데이터 보존 |
| payment_refunds | store_order_id | **RESTRICT** | 환불 기록 보존 |
| settlement_details | store_order_id | **RESTRICT** | 정산 내역 보존 |
| subscription_history | store_order_id | **SET NULL** | 주문 삭제돼도 구독 이력은 보존 |

### cart

| 자식 테이블 | FK 컬럼 | ON DELETE | 사유 |
|------------|---------|-----------|------|
| cart_item | cart_id | **CASCADE** | 장바구니 삭제 시 담긴 상품도 삭제 |

---

## 5. 결제 모듈 (3.5)

### payments

| 자식 테이블 | FK 컬럼 | ON DELETE | 사유 |
|------------|---------|-----------|------|
| payment_refunds | payment_id | **RESTRICT** | 환불 기록은 결제와 함께 보존 |

> **원칙**: `payments`는 물리 삭제 금지. PG사 거래 ID 등 외부 시스템 참조 데이터 포함.

---

## 6. 배달 모듈 (3.6)

### riders

| 자식 테이블 | FK 컬럼 | ON DELETE | 사유 |
|------------|---------|-----------|------|
| deliveries | rider_id | **RESTRICT** | 배달 이력 보존 필수 |
| rider_locations | rider_id | **CASCADE** | 배달원 삭제 시 위치 로그 삭제 (14일 보관 정책) |
| approval_documents | rider_id | **RESTRICT** | 승인 서류 이력 보존 |
| rider_approvals | rider_id | **RESTRICT** | 승인 이력 보존 |

> **원칙**: `riders`는 `status=SUSPENDED`로 비활성화 권장.

### deliveries

| 자식 테이블 | FK 컬럼 | ON DELETE | 사유 |
|------------|---------|-----------|------|
| rider_locations | delivery_id | **CASCADE** | 배달 삭제 시 해당 배달의 위치 로그 삭제 |
| delivery_photos | delivery_id | **CASCADE** | 배달 삭제 시 배송 사진도 삭제 |

---

## 7. 구독 모듈 (3.7)

### subscription_products

| 자식 테이블 | FK 컬럼 | ON DELETE | 사유 |
|------------|---------|-----------|------|
| subscription_product_items | subscription_product_id | **CASCADE** | 구독 상품 삭제 시 구성 품목도 삭제 |
| subscription_day_of_week | subscription_product_id | **CASCADE** | 구독 상품 삭제 시 배송 요일도 삭제 |
| subscriptions | subscription_product_id | **RESTRICT** | 활성 구독 존재 시 상품 삭제 차단 |

### subscriptions

| 자식 테이블 | FK 컬럼 | ON DELETE | 사유 |
|------------|---------|-----------|------|
| subscription_items | subscription_id | **CASCADE** | 구독 삭제 시 구독 상품 목록도 삭제 |
| subscription_history | subscription_id | **CASCADE** | 구독 삭제 시 배송 이력도 삭제 |

> **참고**: `subscriptions`의 추가 FK

| 부모 테이블 | FK 컬럼 | ON DELETE | 사유 |
|------------|---------|-----------|------|
| addresses | address_id | **SET NULL** | 주소 삭제 시 구독은 유지 (새 주소 선택 필요) |
| payment_methods | payment_method_id | **SET NULL** | 결제수단 삭제 시 구독은 유지 (새 결제수단 선택 필요) |

---

## 8. 리뷰 모듈 (3.8)

### reviews

리뷰는 자식 테이블이 없음. FK 관계의 자식 측만 해당.

> **원칙**: 리뷰 물리 삭제 허용 (BR-R01: 7일 이내 삭제 가능). 이후에는 `is_visible=false`로 숨김 처리.

---

## 9. 정산 모듈 (3.9)

### settlements

| 자식 테이블 | FK 컬럼 | ON DELETE | 사유 |
|------------|---------|-----------|------|
| settlement_details | settlement_id | **CASCADE** | 정산 삭제 시 상세 내역도 삭제 |

> **원칙**: `settlements`는 물리 삭제 금지. 세무/회계 증빙 자료로 보존 필수.

---

## 10. 승인 관리 모듈 (3.10)

### approval_documents, store_approvals, rider_approvals

이 테이블들은 자식 테이블이 없음. FK 관계의 자식 측만 해당.

> **원칙**: 승인 이력은 물리 삭제 금지. 감사 추적(Audit Trail)을 위해 영구 보존.

---

## 11. 기타 모듈 (3.11)

### inquiries

| 자식 테이블 | FK 컬럼 | ON DELETE | 사유 |
|------------|---------|-----------|------|
| inquiry_attachments | inquiry_id | **CASCADE** | 문의 삭제 시 첨부파일도 삭제 |

### promotions

| 자식 테이블 | FK 컬럼 | ON DELETE | 사유 |
|------------|---------|-----------|------|
| promotion_products | promotion_id | **CASCADE** | 프로모션 삭제 시 상품 매핑도 삭제 |

### notices, banners, reports, notifications, notification_broadcasts, delivery_photos

이 테이블들은 자식 테이블이 없음.

---

## 전체 FK 정책 요약표

| # | 자식 테이블 | FK 컬럼 | 부모 테이블 | ON DELETE | 비고 |
|---|------------|---------|-----------|-----------|------|
| 1 | addresses | user_id | users | RESTRICT | Soft Delete |
| 2 | social_logins | user_id | users | RESTRICT | Soft Delete |
| 3 | stores | owner_id | users | RESTRICT | Soft Delete |
| 4 | store_business_hours | store_id | stores | CASCADE | 종속 데이터 |
| 5 | products | store_id | stores | RESTRICT | 주문 참조 |
| 6 | products | category_id | categories | RESTRICT | 상품 존재 시 차단 |
| 7 | product_images | product_id | products | CASCADE | 종속 데이터 |
| 8 | orders | user_id | users | RESTRICT | 이력 보존 |
| 9 | store_order | order_id | orders | CASCADE | 종속 데이터 |
| 10 | store_order | store_id | stores | RESTRICT | 이력 보존 |
| 11 | order_items | store_order_id | store_order | CASCADE | 종속 데이터 |
| 12 | order_items | product_id | products | RESTRICT | 스냅샷 있으나 FK 유지 |
| 13 | cart | user_id | users | RESTRICT | Soft Delete |
| 14 | cart_item | cart_id | cart | CASCADE | 종속 데이터 |
| 15 | cart_item | product_id | products | CASCADE | 상품 삭제 시 자동 제거 |
| 16 | cart_item | store_id | stores | RESTRICT | 마트 참조 |
| 17 | payments | order_id | orders | RESTRICT | PG 정합성 |
| 18 | payment_refunds | payment_id | payments | RESTRICT | 환불 보존 |
| 19 | payment_refunds | store_order_id | store_order | RESTRICT | 환불 보존 |
| 20 | payment_methods | user_id | users | RESTRICT | 빌링키 관리 |
| 21 | riders | user_id | users | RESTRICT | Soft Delete |
| 22 | deliveries | store_order_id | store_order | RESTRICT | 배달 이력 |
| 23 | deliveries | rider_id | riders | RESTRICT | 배달 이력 |
| 24 | rider_locations | rider_id | riders | CASCADE | 위치 로그 |
| 25 | rider_locations | delivery_id | deliveries | CASCADE | 위치 로그 |
| 26 | delivery_photos | delivery_id | deliveries | CASCADE | 종속 데이터 |
| 27 | subscription_products | store_id | stores | RESTRICT | 구독 참조 |
| 28 | subscription_day_of_week | subscription_product_id | subscription_products | CASCADE | 종속 데이터 |
| 29 | subscription_product_items | subscription_product_id | subscription_products | CASCADE | 종속 데이터 |
| 30 | subscription_product_items | product_id | products | RESTRICT | 구독 구성 참조 |
| 31 | subscriptions | user_id | users | RESTRICT | 구독 이력 |
| 32 | subscriptions | store_id | stores | RESTRICT | 구독 이력 |
| 33 | subscriptions | subscription_product_id | subscription_products | RESTRICT | 활성 구독 보호 |
| 34 | subscriptions | address_id | addresses | SET NULL | 주소 삭제 허용 |
| 35 | subscriptions | payment_method_id | payment_methods | SET NULL | 결제수단 삭제 허용 |
| 36 | subscription_items | subscription_id | subscriptions | CASCADE | 종속 데이터 |
| 37 | subscription_items | product_id | products | RESTRICT | 활성 구독 보호 |
| 38 | subscription_history | subscription_id | subscriptions | CASCADE | 종속 데이터 |
| 39 | subscription_history | store_order_id | store_order | SET NULL | 주문 없어도 이력 보존 |
| 40 | reviews | store_order_id | store_order | RESTRICT | 리뷰 보존 |
| 41 | reviews | user_id | users | RESTRICT | Soft Delete |
| 42 | settlements | *(다형성)* | stores/riders | *(앱 레벨)* | 다형성 FK, DB 제약 불가 |
| 43 | settlement_details | settlement_id | settlements | CASCADE | 종속 데이터 |
| 44 | settlement_details | store_order_id | store_order | RESTRICT | 정산 보존 |
| 45 | approval_documents | store_id | stores | RESTRICT | 승인 이력 |
| 46 | approval_documents | rider_id | riders | RESTRICT | 승인 이력 |
| 47 | store_approvals | store_id | stores | RESTRICT | 승인 이력 |
| 48 | store_approvals | approved_by | users | SET NULL | 관리자 변경 대응 |
| 49 | rider_approvals | rider_id | riders | RESTRICT | 승인 이력 |
| 50 | rider_approvals | approved_by | users | SET NULL | 관리자 변경 대응 |
| 51 | notifications | user_id | users | RESTRICT | Soft Delete |
| 52 | reports | *(다형성)* | users/stores/riders | *(앱 레벨)* | 다형성 FK, DB 제약 불가 |
| 53 | inquiries | user_id | users | RESTRICT | 문의 이력 |
| 54 | inquiries | answered_by | users | SET NULL | 관리자 변경 대응 |
| 55 | inquiry_attachments | inquiry_id | inquiries | CASCADE | 종속 데이터 |
| 56 | notices | author_id | users | SET NULL | 관리자 변경 대응 |
| 57 | promotion_products | promotion_id | promotions | CASCADE | 종속 데이터 |
| 58 | promotion_products | product_id | products | CASCADE | 상품 삭제 시 매핑 제거 |

---

## 정책 분포 통계

| 정책 | 건수 | 비율 | 적용 대상 |
|------|------|------|----------|
| **RESTRICT** | 33건 | 57% | 핵심 비즈니스 데이터 보호 |
| **CASCADE** | 18건 | 31% | 부모에 종속된 데이터 |
| **SET NULL** | 5건 | 9% | 참조 끊어져도 데이터 보존 |
| **앱 레벨** | 2건 | 3% | 다형성 FK (DB 제약 불가) |
| **합계** | **58건** | 100% | |

---

## 다형성 FK 처리 (앱 레벨 검증)

DB 레벨에서 FK 제약을 걸 수 없는 2건:

### 1. settlements (정산)

```
target_type: STORE | RIDER
target_id: stores.store_id 또는 riders.rider_id
```

**앱 레벨 검증**:
```java
// 정산 대상 삭제 전 검증
if (settlementRepository.existsByTargetTypeAndTargetId(type, id)) {
    throw new BusinessException("정산 내역이 존재하여 삭제할 수 없습니다.");
}
```

### 2. reports (신고)

```
reporter_type: STORE | RIDER | CUSTOMER
reporter_id: 신고자 ID
target_type: STORE | RIDER | REVIEW | CUSTOMER
target_id: 피신고 대상 ID
```

**앱 레벨 검증**:
```java
// 신고 대상 삭제 전 미처리 신고 확인
if (reportRepository.existsPendingByTarget(type, id)) {
    throw new BusinessException("미처리 신고가 존재하여 삭제할 수 없습니다.");
}
```

---

## 물리 삭제 금지 테이블

아래 테이블은 비즈니스/법적 요구로 물리 삭제를 금지하고, 상태값으로 논리 삭제만 허용:

| 테이블 | 논리 삭제 방식 | 사유 |
|--------|-------------|------|
| users | `deleted_at` (Soft Delete) | 개인정보보호법 (탈퇴 후 일정 기간 보관) |
| stores | `status=CLOSED` | 주문/정산 이력 참조 |
| riders | `status=SUSPENDED` | 배달/정산 이력 참조 |
| products | `is_active=false` | 주문 이력 참조 |
| orders | `status=CANCELLED` | 결제/정산 증빙 |
| store_order | `status=CANCELLED` | 주문 하위 이력 |
| payments | `payment_status=CANCELLED` | PG사 거래 정합성 |
| settlements | 삭제 금지 (상태 없음) | 세무/회계 증빙 |
| store_approvals | 삭제 금지 | 감사 추적 |
| rider_approvals | 삭제 금지 | 감사 추적 |
| reports | 삭제 금지 | 신고 이력 보존 |

---

## SQL DDL 예시 (주요 테이블)

```sql
-- 1. addresses
ALTER TABLE addresses
  ADD CONSTRAINT fk_addresses_user
  FOREIGN KEY (user_id) REFERENCES users(user_id)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- 2. stores
ALTER TABLE stores
  ADD CONSTRAINT fk_stores_owner
  FOREIGN KEY (owner_id) REFERENCES users(user_id)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- 3. store_business_hours (CASCADE 예시)
ALTER TABLE store_business_hours
  ADD CONSTRAINT fk_business_hours_store
  FOREIGN KEY (store_id) REFERENCES stores(store_id)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. products
ALTER TABLE products
  ADD CONSTRAINT fk_products_store
  FOREIGN KEY (store_id) REFERENCES stores(store_id)
  ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT fk_products_category
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- 5. orders
ALTER TABLE orders
  ADD CONSTRAINT fk_orders_user
  FOREIGN KEY (user_id) REFERENCES users(user_id)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- 6. store_order
ALTER TABLE store_order
  ADD CONSTRAINT fk_store_order_order
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
  ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT fk_store_order_store
  FOREIGN KEY (store_id) REFERENCES stores(store_id)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- 7. order_items
ALTER TABLE order_items
  ADD CONSTRAINT fk_order_items_store_order
  FOREIGN KEY (store_order_id) REFERENCES store_order(store_order_id)
  ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT fk_order_items_product
  FOREIGN KEY (product_id) REFERENCES products(product_id)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- 8. payments
ALTER TABLE payments
  ADD CONSTRAINT fk_payments_order
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- 9. deliveries
ALTER TABLE deliveries
  ADD CONSTRAINT fk_deliveries_store_order
  FOREIGN KEY (store_order_id) REFERENCES store_order(store_order_id)
  ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT fk_deliveries_rider
  FOREIGN KEY (rider_id) REFERENCES riders(rider_id)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- 10. subscriptions (SET NULL 예시)
ALTER TABLE subscriptions
  ADD CONSTRAINT fk_subscriptions_user
  FOREIGN KEY (user_id) REFERENCES users(user_id)
  ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT fk_subscriptions_address
  FOREIGN KEY (address_id) REFERENCES addresses(address_id)
  ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT fk_subscriptions_payment_method
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(method_id)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 11. reviews
ALTER TABLE reviews
  ADD CONSTRAINT fk_reviews_store_order
  FOREIGN KEY (store_order_id) REFERENCES store_order(store_order_id)
  ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT fk_reviews_user
  FOREIGN KEY (user_id) REFERENCES users(user_id)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- 12. settlements (다형성 FK - DB 제약 없음, 앱 레벨 검증)
-- target_type + target_id는 앱 레벨에서 관리

-- 13. settlement_details
ALTER TABLE settlement_details
  ADD CONSTRAINT fk_settlement_details_settlement
  FOREIGN KEY (settlement_id) REFERENCES settlements(settlement_id)
  ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT fk_settlement_details_store_order
  FOREIGN KEY (store_order_id) REFERENCES store_order(store_order_id)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- 14. store_approvals (SET NULL 예시)
ALTER TABLE store_approvals
  ADD CONSTRAINT fk_store_approvals_store
  FOREIGN KEY (store_id) REFERENCES stores(store_id)
  ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT fk_store_approvals_admin
  FOREIGN KEY (approved_by) REFERENCES users(user_id)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 15. inquiry_attachments (CASCADE 예시)
ALTER TABLE inquiry_attachments
  ADD CONSTRAINT fk_inquiry_attachments_inquiry
  FOREIGN KEY (inquiry_id) REFERENCES inquiries(inquiry_id)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 16. promotion_products
ALTER TABLE promotion_products
  ADD CONSTRAINT fk_promotion_products_promotion
  FOREIGN KEY (promotion_id) REFERENCES promotions(promotion_id)
  ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT fk_promotion_products_product
  FOREIGN KEY (product_id) REFERENCES products(product_id)
  ON DELETE CASCADE ON UPDATE CASCADE;
```

> **ON UPDATE**: 모든 FK에 `ON UPDATE CASCADE` 적용. PK 변경 시 자식의 FK도 자동 갱신.
> 단, AUTO_INCREMENT PK는 변경하지 않는 것이 원칙이므로 실질적으로 동작하는 경우는 드묾.
