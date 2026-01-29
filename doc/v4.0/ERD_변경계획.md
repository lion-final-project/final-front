# ERD v4.0 DBA 진단서 및 변경 계획

> **진단일**: 2026-01-29
> **대상 문서**: `doc/v4.0/동네마켓_ERD_v4.0.md`
> **진단 관점**: DBA (데이터 무결성, 정규화, 네이밍 일관성, 문서 정합성)
> **총 진단 항목**: 20건 (P0: 6건, P1: 8건, P2: 6건)

---

## 우선순위 정의

| 등급 | 의미 | 조치 시점 |
|------|------|-----------|
| **P0** | 데이터 무결성 또는 구현 차단 이슈 | 즉시 수정 |
| **P1** | 설계 품질 저하 또는 혼란 유발 | 다음 버전 반영 |
| **P2** | 문서 품질 개선 | 일정 여유 시 반영 |

---

## A. 문서 내부 불일치 (ERD 다이어그램 ↔ 엔티티 상세 충돌)

### A-1. 테이블명 단수/복수 불일치 `P0`

| 위치 | ERD 다이어그램 | 엔티티 상세 |
|------|---------------|------------|
| 주문 모듈 | `store_order` | `store_orders` |
| 주문 모듈 | `cart` | `carts` |

**문제점**: DDL 생성 시 어느 이름을 사용할지 혼란. ORM 매핑, API 네이밍에 연쇄적 불일치 발생.

**권고안**: 복수형으로 통일(`store_orders`, `carts`). ERD 다이어그램의 mermaid 코드에서 `store_order` → `store_orders`, `cart` → `carts`로 수정. 모든 관계선(Relationships)과 다른 테이블의 FK 참조도 함께 변경.

---

### A-2. day_of_week 타입 불일치 `P0`

| 테이블 | ERD 다이어그램 | 엔티티 상세 |
|--------|---------------|------------|
| `store_business_hours` | `varchar` | `TINYINT CHECK(0~6)` |
| `subscription_day_of_week` | `varchar` | `TINYINT CHECK(0~6)` |

**문제점**: `varchar`로 구현하면 'Monday', 'MON', '월' 등 값 혼란 발생. `TINYINT`로 구현하면 ERD 다이어그램과 불일치.

**권고안**: `TINYINT CHECK(0~6)` 채택 (상세 정의서 기준). ERD 다이어그램의 `varchar` → `tinyint`로 수정.

---

### A-3. reviews.content 타입 불일치 `P1`

| 위치 | 타입 |
|------|------|
| ERD 다이어그램 | `text` |
| 엔티티 상세 | `VARCHAR(100)` |

**문제점**: `TEXT`는 길이 제한 없음, `VARCHAR(100)`은 한글 기준 약 33자. 리뷰 내용으로 100바이트는 지나치게 짧음.

**권고안**: `VARCHAR(500)` 또는 `TEXT`로 통일. 비즈니스 요구에 따라 글자 수 제한은 애플리케이션 레벨에서 처리.

---

### A-4. subscription_items 상세 정의서 누락 `P0`

**현황**: ERD 다이어그램에 `subscription_items` 테이블이 정의되어 있고, 관계선(`subscriptions ||--o{ subscription_items`, `products ||--o{ subscription_items`)도 존재하나 엔티티 상세 정의서(섹션 3.7)에 해당 테이블의 상세 정의가 없음.

**문제점**: DDL 작성 불가. `subscription_product_items`(구독 상품의 구성 품목)와 역할이 중복되는지 판단 불가.

**권고안**:
- **옵션 1**: `subscription_items`의 용도를 명확히 정의하고 상세 정의서 추가. (예: 고객이 구독 시 커스터마이징한 품목)
- **옵션 2**: `subscription_product_items`와 중복이면 ERD 다이어그램에서 `subscription_items` 제거.

---

### A-5. inquiry_attachments 정의 방식 충돌 `P1`

**현황**:
- ERD 다이어그램: `inquiry_attachments` 테이블 존재 (id, inquiry_id FK, file_url, file_name, file_size)
- 엔티티 상세: `inquiries` 테이블에 `file_url VARCHAR(500)` 필드로 통합

**문제점**: 다이어그램 구조대로면 문의당 다건 첨부 가능. 상세대로면 1건만 가능. 구현 시 혼란.

**권고안**: 다건 첨부가 필요하면 `inquiry_attachments` 테이블 유지 + `inquiries.file_url` 제거. 1건이면 `inquiry_attachments` ERD에서 제거.

---

### A-6. delivery_photos 모듈 분류 오류 `P2`

**현황**: ERD 다이어그램에서 `%% ===== 3.6 배달 모듈 =====` 아래에 위치하나, 엔티티 상세에서는 "3.11 기타 모듈" 섹션에 정의됨.

**문제점**: 문서 탐색 시 혼란. 실제 비즈니스 도메인은 배달 모듈에 속함.

**권고안**: 엔티티 상세를 "3.6 배달 모듈" 섹션으로 이동.

---

## B. 네이밍/타입 일관성 문제

### B-1. stores.is_active 네이밍-타입 불일치 `P1`

**현황**: 컬럼명 `is_active`(boolean 관례)이지만 타입이 `ENUM('ACTIVE','INACTIVE','CLOSED')` (3개 값).

**문제점**: `is_` 접두사는 관례적으로 `TINYINT(1)` / `BOOLEAN`에 사용. 코드 리뷰 시 오해 유발.

**권고안**: 컬럼명을 `operating_status`로 변경. ERD 다이어그램의 `is_active` 필드도 함께 수정.

---

### B-2. 날짜 컬럼 네이밍 불일치 `P2`

| 테이블 | 컬럼 | 타입 | 네이밍 패턴 |
|--------|------|------|------------|
| `banners` | `started_at` / `ended_at` | DATETIME | `_at` 접미사 |
| `promotions` | `start_date` / `end_date` | DATE | `_date` 접미사 |

**문제점**: 동일한 "기간" 개념에 네이밍과 타입이 다름.

**권고안**: 시각 정보가 불필요하면 둘 다 `DATE` + `_date` 패턴으로 통일. 시각이 필요하면 `DATETIME` + `_at` 패턴으로 통일. 비즈니스 요건에 따라 결정.

---

### B-3. applicant_type ENUM 값 불일치 `P0`

| 테이블 | ENUM 값 |
|--------|---------|
| `approvals.applicant_type` | `'MART'`, `'RIDER'` |
| `approval_documents.applicant_type` | `'STORE'`, `'RIDER'` |

**문제점**: 마트를 지칭하는 값이 `MART` vs `STORE`로 다름. JOIN 또는 필터링 시 값 불일치로 데이터 누락 발생.

**권고안**: `'STORE'`로 통일 (나머지 ERD 전체에서 마트 테이블명이 `stores`이므로). `approvals.applicant_type`의 `MART` → `STORE`로 변경.

---

### B-4. DBMS 기준 충돌 `P0`

**현황**:
- 문서 상단 (15행): "PostgreSQL-PostGIS 사용"
- 엔티티 상세 (544행): "MySQL 8.0 기준"

**문제점**: DDL 문법, 타입(`TINYINT` vs `SMALLINT`), 인덱스(`FULLTEXT`는 MySQL 전용), 공간 쿼리(PostGIS vs MySQL Spatial) 등 전면 다름. 어느 DBMS 기준으로 구현할지 판단 불가.

**권고안**: 최종 대상 DBMS를 1개로 확정하고 문서 전체 통일. PostgreSQL 채택 시 `TINYINT` → `SMALLINT`, `FULLTEXT` → `tsvector/GIN`, `AUTO_INCREMENT` → `GENERATED ALWAYS AS IDENTITY` 등 전면 수정 필요.

---

## C. 정규화/비정규화 설계 이슈

### C-1. stores.review_count 비정규화 동기화 전략 미정의 `P1`

**현황**: `stores.review_count INT NOT NULL DEFAULT 0` — 리뷰 수를 비정규화 캐시로 보관.

**문제점**: `reviews` INSERT/DELETE 시 `stores.review_count`와의 정합성 보장 방법이 문서에 없음. 트리거, 이벤트, 애플리케이션 레벨 중 어떤 전략인지 불명.

**권고안**: 동기화 전략 명시. 예:
- DB 트리거: `AFTER INSERT ON reviews` → `UPDATE stores SET review_count = review_count + 1`
- 또는 배치 집계: `UPDATE stores SET review_count = (SELECT COUNT(*) FROM reviews ...)`
- 선택한 전략을 비즈니스 규칙 또는 DDL 비고에 명시.

---

### C-2. products.order_count 비정규화 동기화 전략 미정의 `P1`

**현황**: `products.order_count INT NOT NULL DEFAULT 0`

**문제점**: C-1과 동일. `order_products` 테이블 기반 집계와 정합성 보장 방법 미정의.

**권고안**: C-1과 동일한 방식으로 동기화 전략 명시.

---

### C-3. products.discount_rate 파생 컬럼 정합성 `P2`

**현황**: `price`, `sale_price`, `discount_rate` 3개 컬럼이 모두 존재. `discount_rate = (price - sale_price) / price * 100`.

**문제점**: 3개 값 중 2개만 변경하면 정합성 깨짐. 예: sale_price를 변경했는데 discount_rate를 안 바꾸면 불일치.

**권고안**:
- **옵션 1**: `discount_rate` 컬럼 제거, 조회 시 계산 (정규화)
- **옵션 2**: Generated Column으로 정의 (`GENERATED ALWAYS AS ((price - sale_price) / price * 100)`)
- **옵션 3**: 유지하되 비즈니스 규칙에 "price/sale_price 변경 시 discount_rate 재계산 필수" 명시

---

### C-4. subscription_items vs subscription_product_items 역할 중복 `P1`

**현황**:
- `subscription_product_items`: 구독 **상품** 정의의 구성 품목 (마트가 설정)
- `subscription_items`: ERD에만 존재, 상세 미정의

**문제점**: `subscription_items`가 "고객이 구독 시 실제로 받는 품목 커스터마이징"용이라면 별도 존재 의미 있음. 그러나 정의가 없어 판단 불가.

**권고안**: A-4와 연계하여 해결. 용도가 동일하면 제거, 다르면 상세 정의서 추가.

---

## D. 참조 무결성/제약조건 누락

### D-1. settlements 다형성 FK — DB 레벨 무결성 보장 불가 `P1`

**현황**: `target_type ENUM('STORE','RIDER')` + `target_id BIGINT` 패턴으로 마트/배달원 정산 통합.

**문제점**: `target_id`에 FK 제약 걸 수 없음. 존재하지 않는 store_id나 rider_id가 들어갈 수 있음.

**권고안**:
- **옵션 1 (유지)**: 애플리케이션 레벨 검증 + CHECK 트리거 추가. 비즈니스 규칙에 "target_id 참조 무결성은 앱 레벨에서 보장" 명시.
- **옵션 2 (분리)**: `store_settlements` / `rider_settlements` 테이블로 분리하여 각각 정상 FK 설정.

---

### D-2. notifications.reference_id 누락 `P0`

**현황**: `reference_type ENUM('RIDER','STORE','CUSTOMER','ORDER','DELIVERY','PROMOTION')`만 존재. 실제 참조 대상의 ID 컬럼 없음.

**문제점**: 알림 클릭 시 "어떤 주문", "어떤 배달"인지 식별 불가. 프론트엔드에서 상세 페이지로 이동할 수 없음.

**권고안**: `reference_id BIGINT NULL` 컬럼 추가. ERD 다이어그램과 엔티티 상세 모두 반영.

---

### D-3. addresses.receiver_name 누락 `P2`

**현황**: `contact VARCHAR(20)` (연락처)만 존재. 수령인 이름 컬럼 없음.

**문제점**: 배송지에 "누가 받는지"를 저장할 수 없음. 본인이 아닌 타인 수령 시 이름 기록 불가.

**권고안**: `receiver_name VARCHAR(50) NOT NULL` 컬럼 추가. 기본값은 `users.name` 참조.

---

### D-4. ON_DELETE 정책 문서(v2.0) — 현행 ERD(v4.0) 불일치 `P2`

**현황**: `doc/v2.0/ON_DELETE_정책_정의서.md`에서 참조하는 테이블명 일부가 v4.0 ERD에 존재하지 않음.

| v2.0 정책 문서 테이블명 | v4.0 ERD 상태 |
|------------------------|--------------|
| `product_images` | 없음 (products.product_image_url로 통합) |
| `cart_item` | `cart_products`로 변경 |
| `order_items` | `order_products`로 변경 |
| `subscription_items` | 상세 미정의 |

**권고안**: ON_DELETE 정책 문서를 v4.0 기준으로 갱신하거나, v4.0 문서 내에 ON_DELETE 정책 섹션 추가.

---

## E. 문서 메타정보 오류

### E-1. 문서 버전 불일치 `P0`

**현황**:
- 파일 경로: `doc/v4.0/동네마켓_ERD_v4.0.md`
- 문서 내 표기 (5행): `버전: v3.4`
- 엔티티 상세 제목 (542행): `ERD 엔티티 설명서 v3.4`

**문제점**: 어떤 버전이 정본인지 판단 불가.

**권고안**: 문서 내 모든 버전 표기를 `v4.0`으로 통일.

---

### E-2. 엔티티 수 집계 오류 `P2`

**현황** (533행 요약표):
- 기타 모듈: "3개"로 표기 → 실제 `notifications`, `notification_broadcasts`, `reports`, `inquiries`, `inquiry_attachments`, `notices`, `banners`, `promotions`, `promotion_products` = **9개**
- 합계: "35개"로 표기

**문제점**: 실제 ERD 다이어그램의 엔티티 수와 불일치. 검토자/개발자 혼란.

**권고안**: 모든 모듈의 테이블 수를 재집계하고 합계 수정.

실제 재집계:

| 모듈 | 테이블 수 |
|------|----------|
| 3.1 사용자 모듈 | 5 |
| 3.2 마트 모듈 | 2 |
| 3.3 상품 모듈 | 2 |
| 3.4 주문 모듈 | 5 |
| 3.5 결제 모듈 | 3 |
| 3.6 배달 모듈 | 4 |
| 3.7 구독 모듈 | 6 |
| 3.8 리뷰 모듈 | 1 |
| 3.9 정산 모듈 | 2 |
| 3.10 승인 관리 모듈 | 2 |
| 3.11 기타 모듈 | 9 |
| **합계** | **41** |

---

## 변경 우선순위 요약

### P0 — 즉시 수정 (6건)

| # | 항목 | 핵심 조치 |
|---|------|----------|
| A-1 | 테이블명 단복수 불일치 | ERD 다이어그램 통일 (복수형) |
| A-2 | day_of_week 타입 | ERD `varchar` → `tinyint` |
| A-4 | subscription_items 상세 누락 | 상세 추가 또는 ERD에서 제거 |
| B-3 | applicant_type MART vs STORE | `STORE`로 통일 |
| B-4 | DBMS 기준 충돌 | PostgreSQL 또는 MySQL 확정 |
| D-2 | notifications.reference_id 누락 | 컬럼 추가 |

### P1 — 다음 버전 반영 (8건)

| # | 항목 |
|---|------|
| A-3 | reviews.content 타입 |
| A-5 | inquiry_attachments 정의 충돌 |
| B-1 | stores.is_active 네이밍 |
| C-1 | stores.review_count 동기화 |
| C-2 | products.order_count 동기화 |
| C-4 | subscription_items 역할 중복 |
| D-1 | settlements 다형성 FK |
| E-1 | 문서 버전 불일치 |

### P2 — 일정 여유 시 (6건)

| # | 항목 |
|---|------|
| A-6 | delivery_photos 모듈 분류 |
| B-2 | 날짜 컬럼 네이밍 통일 |
| C-3 | discount_rate 파생 컬럼 |
| D-3 | addresses.receiver_name |
| D-4 | ON_DELETE 정책 문서 갱신 |
| E-2 | 엔티티 수 집계 오류 |
