# 동네마켓 DDL v1.0

> PostgreSQL 16 기준 | 작성일: 2026-01-29
> 기반 문서: ERD 엔티티 설명서 v3.4, ON DELETE 정책 정의서 v3.0

---

## updated_at 트리거 함수

모든 테이블의 `updated_at` 컬럼을 자동 갱신하기 위한 공통 트리거 함수를 먼저 생성합니다.

```sql
-- =============================================================
-- updated_at 자동 갱신 트리거 함수
-- =============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 3.1 사용자 모듈

### roles

```sql
-- =============================================================
-- 역할 테이블
-- =============================================================
CREATE TABLE roles (
    id          BIGSERIAL       PRIMARY KEY,
    role_name   VARCHAR(30)     NOT NULL,
    description VARCHAR(100)    NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_roles_role_name UNIQUE (role_name)
);

COMMENT ON TABLE roles IS '사용자 역할 정의 테이블';

CREATE TRIGGER trg_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### users

```sql
-- =============================================================
-- 사용자 테이블
-- =============================================================
CREATE TABLE users (
    id                BIGSERIAL       PRIMARY KEY,
    email             VARCHAR(255)    NOT NULL,
    password          VARCHAR(255)    NOT NULL,
    name              VARCHAR(50)     NOT NULL,
    phone             VARCHAR(20)     NOT NULL,
    status            VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    terms_agreed      BOOLEAN         NOT NULL DEFAULT FALSE,
    privacy_agreed    BOOLEAN         NOT NULL DEFAULT FALSE,
    terms_agreed_at   TIMESTAMP       NULL,
    privacy_agreed_at TIMESTAMP       NULL,
    created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at        TIMESTAMP       NULL,

    CONSTRAINT chk_users_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'))
);

COMMENT ON TABLE users IS '사용자 계정 테이블 (Soft Delete: deleted_at)';

CREATE UNIQUE INDEX idx_users_email      ON users (email);
CREATE UNIQUE INDEX idx_users_phone      ON users (phone);
CREATE INDEX        idx_users_status     ON users (status);
CREATE INDEX        idx_users_deleted_at ON users (deleted_at);

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### user_roles

```sql
-- =============================================================
-- 사용자-역할 매핑 테이블
-- =============================================================
CREATE TABLE user_roles (
    id         BIGSERIAL   PRIMARY KEY,
    user_id    BIGINT      NOT NULL,
    role_id    BIGINT      NOT NULL,
    created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE RESTRICT,
    CONSTRAINT uq_user_roles_user_role UNIQUE (user_id, role_id)
);

COMMENT ON TABLE user_roles IS '사용자별 역할 매핑 테이블 (다대다)';

CREATE INDEX idx_user_roles_user ON user_roles (user_id);
CREATE INDEX idx_user_roles_role ON user_roles (role_id);

CREATE TRIGGER trg_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### addresses

```sql
-- =============================================================
-- 배송지 테이블
-- =============================================================
CREATE TABLE addresses (
    id            BIGSERIAL       PRIMARY KEY,
    user_id       BIGINT          NOT NULL,
    contact       VARCHAR(20)     NOT NULL,
    address_name  VARCHAR(50)     NOT NULL,
    postal_code   VARCHAR(10)     NOT NULL,
    address_line1 VARCHAR(255)    NOT NULL,
    address_line2 VARCHAR(255)    NULL,
    latitude      NUMERIC(10, 7)  NULL,
    longitude     NUMERIC(11, 7)  NULL,
    is_default    BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT uq_addresses_user_address UNIQUE (user_id, address_line1, address_line2),
    CONSTRAINT uq_addresses_user_name UNIQUE (user_id, address_name)
);

COMMENT ON TABLE addresses IS '사용자 배송지 관리 테이블';

CREATE INDEX idx_addresses_user_id      ON addresses (user_id);
CREATE INDEX idx_addresses_user_default ON addresses (user_id, is_default);

CREATE TRIGGER trg_addresses_updated_at
    BEFORE UPDATE ON addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### social_logins

```sql
-- =============================================================
-- 소셜 로그인 연동 테이블
-- =============================================================
CREATE TABLE social_logins (
    id               BIGSERIAL       PRIMARY KEY,
    user_id          BIGINT          NOT NULL,
    provider         VARCHAR(20)     NOT NULL,
    provider_user_id VARCHAR(255)    NOT NULL,
    connected_at     TIMESTAMP       NOT NULL,
    created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at       TIMESTAMP       NULL,

    CONSTRAINT fk_social_logins_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT chk_social_logins_provider CHECK (provider IN ('KAKAO', 'NAVER', 'GOOGLE', 'APPLE')),
    CONSTRAINT uq_social_provider_user UNIQUE (provider, provider_user_id)
);

COMMENT ON TABLE social_logins IS '소셜 로그인 연동 정보 테이블';

CREATE INDEX idx_social_logins_user_id ON social_logins (user_id);

CREATE TRIGGER trg_social_logins_updated_at
    BEFORE UPDATE ON social_logins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 3.2 마트 모듈

### stores

```sql
-- =============================================================
-- 마트 테이블
-- =============================================================
CREATE TABLE stores (
    id                            BIGSERIAL       PRIMARY KEY,
    owner_id                      BIGINT          NOT NULL,
    store_name                    VARCHAR(100)    NOT NULL,
    business_number               VARCHAR(12)     NOT NULL,
    representative_name           VARCHAR(50)     NOT NULL,
    representative_phone          VARCHAR(20)     NOT NULL,
    phone                         VARCHAR(20)     NULL,
    telecom_sales_report_number   VARCHAR(50)     NULL,
    description                   TEXT            NULL,
    address_line1                 VARCHAR(255)    NOT NULL,
    address_line2                 VARCHAR(255)    NULL,
    postal_code                   VARCHAR(10)     NOT NULL,
    latitude                      NUMERIC(10, 7)  NULL,
    longitude                     NUMERIC(11, 7)  NULL,
    settlement_bank_name          VARCHAR(50)     NULL,
    settlement_bank_account       VARCHAR(255)    NULL,
    settlement_account_holder     VARCHAR(50)     NULL,
    store_image                   VARCHAR(500)    NULL,
    review_count                  INT             NOT NULL DEFAULT 0,
    status                        VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    is_delivery_available         BOOLEAN         NOT NULL DEFAULT FALSE,
    is_active                     VARCHAR(20)     NOT NULL DEFAULT 'INACTIVE',
    commission_rate               NUMERIC(5, 2)   NOT NULL DEFAULT 5.00,
    deleted_at                    TIMESTAMP       NULL,
    created_at                    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_stores_owner FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT uq_stores_owner_id UNIQUE (owner_id),
    CONSTRAINT uq_stores_business_number UNIQUE (business_number),
    CONSTRAINT chk_stores_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')),
    CONSTRAINT chk_stores_is_active CHECK (is_active IN ('ACTIVE', 'INACTIVE', 'CLOSED'))
);

COMMENT ON TABLE stores IS '마트 정보 테이블 (논리 삭제: status=CLOSED)';

CREATE INDEX idx_stores_status_active ON stores (status, is_active);
CREATE INDEX idx_stores_location      ON stores (latitude, longitude);

CREATE TRIGGER trg_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### store_business_hours

```sql
-- =============================================================
-- 마트 영업시간 테이블
-- =============================================================
CREATE TABLE store_business_hours (
    id          BIGSERIAL   PRIMARY KEY,
    store_id    BIGINT      NOT NULL,
    day_of_week SMALLINT    NOT NULL,
    open_time   TIME        NULL,
    close_time  TIME        NULL,
    is_closed   BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_store_hours_store FOREIGN KEY (store_id) REFERENCES stores (id) ON DELETE CASCADE,
    CONSTRAINT chk_store_hours_day CHECK (day_of_week BETWEEN 0 AND 6),
    CONSTRAINT chk_store_hours_time CHECK (close_time > open_time),
    CONSTRAINT uq_store_hours_store_day UNIQUE (store_id, day_of_week)
);

COMMENT ON TABLE store_business_hours IS '마트 요일별 영업시간 테이블';

CREATE TRIGGER trg_store_business_hours_updated_at
    BEFORE UPDATE ON store_business_hours
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 3.3 상품 모듈

### categories

```sql
-- =============================================================
-- 상품 카테고리 테이블
-- =============================================================
CREATE TABLE categories (
    id            BIGSERIAL       PRIMARY KEY,
    category_name VARCHAR(50)     NOT NULL,
    icon_url      VARCHAR(500)    NULL,
    created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_categories_name UNIQUE (category_name)
);

COMMENT ON TABLE categories IS '상품 카테고리 테이블';

CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### products

```sql
-- =============================================================
-- 상품 테이블
-- =============================================================
CREATE TABLE products (
    id                BIGSERIAL       PRIMARY KEY,
    store_id          BIGINT          NOT NULL,
    category_id       BIGINT          NOT NULL,
    product_name      VARCHAR(200)    NOT NULL,
    description       TEXT            NULL,
    price             NUMERIC(12, 2)  NOT NULL,
    sale_price        NUMERIC(12, 2)  NULL,
    discount_rate     NUMERIC(5, 2)   NULL,
    stock             INT             NOT NULL DEFAULT 0,
    unit              VARCHAR(30)     NULL,
    origin            VARCHAR(100)    NULL,
    is_active         BOOLEAN         NOT NULL DEFAULT TRUE,
    order_count       INT             NOT NULL DEFAULT 0,
    product_image_url VARCHAR(500)    NULL,
    created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_products_store    FOREIGN KEY (store_id)    REFERENCES stores (id)     ON DELETE RESTRICT,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT,
    CONSTRAINT chk_products_price CHECK (price > 0)
);

COMMENT ON TABLE products IS '상품 정보 테이블 (논리 삭제: is_active=false)';

CREATE INDEX idx_products_store_category ON products (store_id, category_id);
CREATE INDEX idx_products_store_active   ON products (store_id, is_active);
CREATE INDEX idx_products_name_search    ON products USING gin(to_tsvector('korean', product_name));

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 3.4 주문 모듈

### orders

```sql
-- =============================================================
-- 주문 테이블
-- =============================================================
CREATE TABLE orders (
    id                  BIGSERIAL       PRIMARY KEY,
    order_number        VARCHAR(30)     NOT NULL,
    user_id             BIGINT          NOT NULL,
    order_type          VARCHAR(20)     NOT NULL DEFAULT 'REGULAR',
    status              VARCHAR(30)     NOT NULL DEFAULT 'PENDING',
    total_product_price NUMERIC(12, 2)  NOT NULL,
    total_delivery_fee  NUMERIC(12, 2)  NOT NULL DEFAULT 0,
    final_price         NUMERIC(12, 2)  NOT NULL,
    delivery_address    VARCHAR(500)    NOT NULL,
    delivery_latitude   NUMERIC(10, 7)  NULL,
    delivery_longitude  NUMERIC(11, 7)  NULL,
    delivery_request    VARCHAR(500)    NULL,
    ordered_at          TIMESTAMP       NOT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT uq_orders_number UNIQUE (order_number),
    CONSTRAINT chk_orders_type CHECK (order_type IN ('REGULAR', 'SUBSCRIPTION')),
    CONSTRAINT chk_orders_status CHECK (status IN ('PENDING', 'PAID', 'PARTIAL_CANCELLED', 'CANCELLED', 'COMPLETED'))
);

COMMENT ON TABLE orders IS '주문 테이블 (물리 삭제 금지, status=CANCELLED로 논리 삭제)';

CREATE INDEX idx_orders_user_status ON orders (user_id, status);
CREATE INDEX idx_orders_ordered_at  ON orders (ordered_at);

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### store_order

```sql
-- =============================================================
-- 마트별 주문 테이블
-- =============================================================
CREATE TABLE store_order (
    id                  BIGSERIAL       PRIMARY KEY,
    order_id            BIGINT          NOT NULL,
    store_id            BIGINT          NOT NULL,
    order_type          VARCHAR(20)     NOT NULL DEFAULT 'REGULAR',
    prep_time           INT             NULL,
    status              VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    store_product_price NUMERIC(12, 2)  NOT NULL,
    delivery_fee        NUMERIC(12, 2)  NOT NULL DEFAULT 0,
    final_price         NUMERIC(12, 2)  NOT NULL,
    accepted_at         TIMESTAMP       NULL,
    prepared_at         TIMESTAMP       NULL,
    picked_up_at        TIMESTAMP       NULL,
    delivered_at        TIMESTAMP       NULL,
    cancelled_at        TIMESTAMP       NULL,
    cancel_reason       VARCHAR(500)    NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_store_order_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_store_order_store FOREIGN KEY (store_id) REFERENCES stores (id) ON DELETE RESTRICT,
    CONSTRAINT chk_store_order_type CHECK (order_type IN ('REGULAR', 'SUBSCRIPTION')),
    CONSTRAINT chk_store_order_status CHECK (status IN ('PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'PICKED_UP', 'DELIVERING', 'DELIVERED', 'CANCELLED', 'REJECTED'))
);

COMMENT ON TABLE store_order IS '마트별 주문 분리 테이블 (주문 내 마트별 처리 단위)';

CREATE INDEX idx_store_order_order_id     ON store_order (order_id);
CREATE INDEX idx_store_order_store_status ON store_order (store_id, status);

CREATE TRIGGER trg_store_order_updated_at
    BEFORE UPDATE ON store_order
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### order_products

```sql
-- =============================================================
-- 주문 상품 테이블
-- =============================================================
CREATE TABLE order_products (
    id                    BIGSERIAL       PRIMARY KEY,
    store_order_id        BIGINT          NOT NULL,
    product_id            BIGINT          NOT NULL,
    product_name_snapshot VARCHAR(200)    NOT NULL,
    price_snapshot        NUMERIC(12, 2)  NOT NULL,
    quantity              INT             NOT NULL,
    created_at            TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_products_store_order FOREIGN KEY (store_order_id) REFERENCES store_order (id) ON DELETE CASCADE,
    CONSTRAINT fk_order_products_product     FOREIGN KEY (product_id)     REFERENCES products (id)    ON DELETE RESTRICT,
    CONSTRAINT chk_order_products_quantity CHECK (quantity >= 1)
);

COMMENT ON TABLE order_products IS '주문 상품 상세 테이블 (주문 시점 스냅샷 포함)';

CREATE INDEX idx_order_products_store_order ON order_products (store_order_id);
CREATE INDEX idx_order_products_product     ON order_products (product_id);

CREATE TRIGGER trg_order_products_updated_at
    BEFORE UPDATE ON order_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### cart

```sql
-- =============================================================
-- 장바구니 테이블
-- =============================================================
CREATE TABLE cart (
    id         BIGSERIAL   PRIMARY KEY,
    user_id    BIGINT      NOT NULL,
    created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT uq_cart_user UNIQUE (user_id)
);

COMMENT ON TABLE cart IS '사용자 장바구니 테이블 (사용자당 1개)';

CREATE TRIGGER trg_cart_updated_at
    BEFORE UPDATE ON cart
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### cart_products

```sql
-- =============================================================
-- 장바구니 상품 테이블
-- =============================================================
CREATE TABLE cart_products (
    id         BIGSERIAL   PRIMARY KEY,
    cart_id    BIGINT      NOT NULL,
    product_id BIGINT      NOT NULL,
    store_id   BIGINT      NOT NULL,
    quantity   INT         NOT NULL,
    created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cart_products_cart    FOREIGN KEY (cart_id)    REFERENCES cart (id)     ON DELETE CASCADE,
    CONSTRAINT fk_cart_products_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_products_store   FOREIGN KEY (store_id)   REFERENCES stores (id)   ON DELETE RESTRICT,
    CONSTRAINT chk_cart_products_quantity CHECK (quantity >= 1),
    CONSTRAINT uq_cart_products_cart_product UNIQUE (cart_id, product_id)
);

COMMENT ON TABLE cart_products IS '장바구니 담긴 상품 테이블';

CREATE INDEX idx_cart_products_cart  ON cart_products (cart_id);
CREATE INDEX idx_cart_products_store ON cart_products (store_id);

CREATE TRIGGER trg_cart_products_updated_at
    BEFORE UPDATE ON cart_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 3.5 결제 모듈

### payments

```sql
-- =============================================================
-- 결제 테이블
-- =============================================================
CREATE TABLE payments (
    id                 BIGSERIAL       PRIMARY KEY,
    order_id           BIGINT          NOT NULL,
    payment_method     VARCHAR(20)     NOT NULL,
    payment_status     VARCHAR(30)     NOT NULL DEFAULT 'PENDING',
    amount             NUMERIC(12, 2)  NOT NULL,
    pg_provider        VARCHAR(50)     NULL,
    pg_transaction_id  VARCHAR(100)    NULL,
    card_company       VARCHAR(50)     NULL,
    card_number_masked VARCHAR(30)     NULL,
    receipt_url        VARCHAR(500)    NULL,
    paid_at            TIMESTAMP       NULL,
    created_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE RESTRICT,
    CONSTRAINT uq_payments_order UNIQUE (order_id),
    CONSTRAINT chk_payments_method CHECK (payment_method IN ('CARD', 'KAKAO_PAY', 'NAVER_PAY', 'TOSS_PAY')),
    CONSTRAINT chk_payments_status CHECK (payment_status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'PARTIAL_REFUNDED', 'REFUNDED'))
);

COMMENT ON TABLE payments IS '결제 정보 테이블 (물리 삭제 금지, PG사 거래 정합성)';

CREATE INDEX idx_payments_status  ON payments (payment_status);
CREATE INDEX idx_payments_pg_txn  ON payments (pg_transaction_id);

CREATE TRIGGER trg_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### payment_refunds

```sql
-- =============================================================
-- 결제 환불 테이블
-- =============================================================
CREATE TABLE payment_refunds (
    id             BIGSERIAL       PRIMARY KEY,
    payment_id     BIGINT          NOT NULL,
    store_order_id BIGINT          NOT NULL,
    refund_amount  NUMERIC(12, 2)  NOT NULL,
    refund_reason  VARCHAR(500)    NULL,
    refunded_at    TIMESTAMP       NULL,
    created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_refunds_payment     FOREIGN KEY (payment_id)     REFERENCES payments (id)    ON DELETE RESTRICT,
    CONSTRAINT fk_refunds_store_order FOREIGN KEY (store_order_id) REFERENCES store_order (id) ON DELETE RESTRICT
);

COMMENT ON TABLE payment_refunds IS '결제 환불 내역 테이블';

CREATE INDEX idx_refunds_payment     ON payment_refunds (payment_id);
CREATE INDEX idx_refunds_store_order ON payment_refunds (store_order_id);

CREATE TRIGGER trg_payment_refunds_updated_at
    BEFORE UPDATE ON payment_refunds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### payment_methods

```sql
-- =============================================================
-- 결제 수단 테이블
-- =============================================================
CREATE TABLE payment_methods (
    id                 BIGSERIAL       PRIMARY KEY,
    user_id            BIGINT          NOT NULL,
    method_type        VARCHAR(20)     NOT NULL,
    billing_key        VARCHAR(255)    NOT NULL,
    card_company       VARCHAR(50)     NULL,
    card_number_masked VARCHAR(30)     NULL,
    is_default         BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payment_methods_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT chk_payment_methods_type CHECK (method_type IN ('CARD', 'KAKAO_PAY', 'NAVER_PAY', 'TOSS_PAY')),
    CONSTRAINT uq_payment_methods_user_billing UNIQUE (user_id, billing_key)
);

COMMENT ON TABLE payment_methods IS '사용자 등록 결제 수단 테이블';

CREATE INDEX idx_payment_methods_user    ON payment_methods (user_id);
CREATE INDEX idx_payment_methods_default ON payment_methods (user_id, is_default);

CREATE TRIGGER trg_payment_methods_updated_at
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 3.6 배달 모듈

### riders

```sql
-- =============================================================
-- 배달원 테이블
-- =============================================================
CREATE TABLE riders (
    id                BIGSERIAL       PRIMARY KEY,
    user_id           BIGINT          NOT NULL,
    id_card_verified  BOOLEAN         NOT NULL DEFAULT FALSE,
    id_card_image     VARCHAR(500)    NULL,
    operation_status  VARCHAR(20)     NOT NULL DEFAULT 'OFFLINE',
    bank_name         VARCHAR(50)     NULL,
    bank_account      VARCHAR(255)    NULL,
    account_holder    VARCHAR(50)     NULL,
    status            VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_riders_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT uq_riders_user UNIQUE (user_id),
    CONSTRAINT chk_riders_operation CHECK (operation_status IN ('OFFLINE', 'ONLINE')),
    CONSTRAINT chk_riders_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'))
);

COMMENT ON TABLE riders IS '배달원 정보 테이블 (논리 삭제: status=SUSPENDED)';

CREATE INDEX idx_riders_status    ON riders (status);
CREATE INDEX idx_riders_operation ON riders (operation_status);

CREATE TRIGGER trg_riders_updated_at
    BEFORE UPDATE ON riders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### deliveries

```sql
-- =============================================================
-- 배달 테이블
-- =============================================================
CREATE TABLE deliveries (
    id                BIGSERIAL       PRIMARY KEY,
    store_order_id    BIGINT          NOT NULL,
    rider_id          BIGINT          NOT NULL,
    status            VARCHAR(20)     NOT NULL DEFAULT 'REQUESTED',
    delivery_fee      NUMERIC(12, 2)  NOT NULL,
    rider_earning     NUMERIC(12, 2)  NOT NULL,
    distance_km       NUMERIC(5, 2)   NULL,
    estimated_minutes INT             NULL,
    requested_at      TIMESTAMP       NOT NULL,
    accepted_at       TIMESTAMP       NULL,
    picked_up_at      TIMESTAMP       NULL,
    delivered_at      TIMESTAMP       NULL,
    cancelled_at      TIMESTAMP       NULL,
    cancel_reason     VARCHAR(500)    NULL,
    created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_deliveries_store_order FOREIGN KEY (store_order_id) REFERENCES store_order (id) ON DELETE RESTRICT,
    CONSTRAINT fk_deliveries_rider       FOREIGN KEY (rider_id)       REFERENCES riders (id)      ON DELETE RESTRICT,
    CONSTRAINT uq_deliveries_store_order UNIQUE (store_order_id),
    CONSTRAINT chk_deliveries_status CHECK (status IN ('REQUESTED', 'ACCEPTED', 'PICKED_UP', 'DELIVERING', 'DELIVERED', 'CANCELLED'))
);

COMMENT ON TABLE deliveries IS '배달 정보 테이블';

CREATE INDEX idx_deliveries_rider_status ON deliveries (rider_id, status);
CREATE INDEX idx_deliveries_status       ON deliveries (status);

CREATE TRIGGER trg_deliveries_updated_at
    BEFORE UPDATE ON deliveries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### rider_locations

```sql
-- =============================================================
-- 배달원 위치 로그 테이블
-- =============================================================
CREATE TABLE rider_locations (
    id          BIGSERIAL       PRIMARY KEY,
    rider_id    BIGINT          NOT NULL,
    delivery_id BIGINT          NULL,
    latitude    NUMERIC(10, 7)  NOT NULL,
    longitude   NUMERIC(11, 7)  NOT NULL,
    accuracy    NUMERIC(6, 2)   NULL,
    speed       NUMERIC(5, 2)   NULL,
    heading     NUMERIC(5, 2)   NULL,
    recorded_at TIMESTAMP       NOT NULL,
    is_current  BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_rider_loc_rider    FOREIGN KEY (rider_id)    REFERENCES riders (id)     ON DELETE CASCADE,
    CONSTRAINT fk_rider_loc_delivery FOREIGN KEY (delivery_id) REFERENCES deliveries (id) ON DELETE CASCADE
);

COMMENT ON TABLE rider_locations IS '배달원 실시간 위치 로그 테이블 (14일 보관)';

CREATE INDEX idx_rider_loc_rider_time      ON rider_locations (rider_id, recorded_at);
CREATE INDEX idx_rider_loc_delivery_current ON rider_locations (delivery_id, is_current);
CREATE INDEX idx_rider_loc_recorded        ON rider_locations (recorded_at);
```

### delivery_photos

```sql
-- =============================================================
-- 배달 완료 사진 테이블
-- =============================================================
CREATE TABLE delivery_photos (
    id          BIGSERIAL       PRIMARY KEY,
    delivery_id BIGINT          NOT NULL,
    photo_url   VARCHAR(500)    NOT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at  TIMESTAMP       NOT NULL,
    deleted_at  TIMESTAMP       NULL,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_delivery_photos_delivery FOREIGN KEY (delivery_id) REFERENCES deliveries (id) ON DELETE CASCADE
);

COMMENT ON TABLE delivery_photos IS '배달 완료 인증 사진 테이블';

CREATE INDEX idx_delivery_photos_delivery ON delivery_photos (delivery_id);
CREATE INDEX idx_delivery_photos_expires  ON delivery_photos (expires_at, deleted_at);

CREATE TRIGGER trg_delivery_photos_updated_at
    BEFORE UPDATE ON delivery_photos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 3.7 구독 모듈

### subscription_products

```sql
-- =============================================================
-- 구독 상품 테이블
-- =============================================================
CREATE TABLE subscription_products (
    id                          BIGSERIAL       PRIMARY KEY,
    store_id                    BIGINT          NOT NULL,
    subscription_product_name   VARCHAR(200)    NOT NULL,
    description                 TEXT            NULL,
    price                       NUMERIC(12, 2)  NOT NULL,
    total_delivery_count        INT             NOT NULL,
    delivery_day_of_week        SMALLINT        NULL,
    status                      VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    subscription_url            VARCHAR(500)    NULL,
    created_at                  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sub_products_store FOREIGN KEY (store_id) REFERENCES stores (id) ON DELETE RESTRICT,
    CONSTRAINT chk_sub_products_price CHECK (price > 0),
    CONSTRAINT chk_sub_products_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

COMMENT ON TABLE subscription_products IS '구독 상품 정의 테이블';

CREATE INDEX idx_sub_products_store_status ON subscription_products (store_id, status);

CREATE TRIGGER trg_subscription_products_updated_at
    BEFORE UPDATE ON subscription_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### subscription_product_items

```sql
-- =============================================================
-- 구독 상품 구성 품목 테이블
-- =============================================================
CREATE TABLE subscription_product_items (
    id                      BIGSERIAL   PRIMARY KEY,
    subscription_product_id BIGINT      NOT NULL,
    product_id              BIGINT      NOT NULL,
    quantity                INT         NOT NULL,
    created_at              TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sub_product_items_sub_product FOREIGN KEY (subscription_product_id) REFERENCES subscription_products (id) ON DELETE CASCADE,
    CONSTRAINT fk_sub_product_items_product     FOREIGN KEY (product_id)              REFERENCES products (id)              ON DELETE RESTRICT,
    CONSTRAINT chk_sub_product_items_quantity CHECK (quantity >= 1),
    CONSTRAINT uq_sub_product_items UNIQUE (subscription_product_id, product_id)
);

COMMENT ON TABLE subscription_product_items IS '구독 상품 내 구성 품목 테이블';

CREATE TRIGGER trg_subscription_product_items_updated_at
    BEFORE UPDATE ON subscription_product_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### subscriptions

```sql
-- =============================================================
-- 구독 테이블
-- =============================================================
CREATE TABLE subscriptions (
    id                      BIGSERIAL       PRIMARY KEY,
    user_id                 BIGINT          NOT NULL,
    store_id                BIGINT          NOT NULL,
    subscription_product_id BIGINT          NOT NULL,
    delivery_time_slot      VARCHAR(30)     NULL,
    address_id              BIGINT          NULL,
    payment_method_id       BIGINT          NULL,
    status                  VARCHAR(30)     NOT NULL DEFAULT 'ACTIVE',
    next_payment_date       DATE            NULL,
    total_amount            NUMERIC(12, 2)  NOT NULL,
    cycle_count             INT             NOT NULL DEFAULT 1,
    started_at              TIMESTAMP       NOT NULL,
    paused_at               TIMESTAMP       NULL,
    cancelled_at            TIMESTAMP       NULL,
    cancel_reason           VARCHAR(500)    NULL,
    created_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_subscriptions_user           FOREIGN KEY (user_id)                 REFERENCES users (id)                  ON DELETE RESTRICT,
    CONSTRAINT fk_subscriptions_store          FOREIGN KEY (store_id)                REFERENCES stores (id)                 ON DELETE RESTRICT,
    CONSTRAINT fk_subscriptions_sub_product    FOREIGN KEY (subscription_product_id) REFERENCES subscription_products (id)  ON DELETE RESTRICT,
    CONSTRAINT fk_subscriptions_address        FOREIGN KEY (address_id)              REFERENCES addresses (id)              ON DELETE SET NULL,
    CONSTRAINT fk_subscriptions_payment_method FOREIGN KEY (payment_method_id)       REFERENCES payment_methods (id)        ON DELETE SET NULL,
    CONSTRAINT chk_subscriptions_status CHECK (status IN ('ACTIVE', 'PAUSED', 'CANCELLATION_PENDING', 'CANCELLED'))
);

COMMENT ON TABLE subscriptions IS '사용자 구독 테이블 (address_id, payment_method_id는 SET NULL 정책)';

CREATE INDEX idx_subscriptions_user_status   ON subscriptions (user_id, status);
CREATE INDEX idx_subscriptions_next_payment  ON subscriptions (next_payment_date);
CREATE INDEX idx_subscriptions_store         ON subscriptions (store_id);

CREATE TRIGGER trg_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### subscription_items

```sql
-- =============================================================
-- 구독 품목 테이블
-- =============================================================
CREATE TABLE subscription_items (
    id              BIGSERIAL   PRIMARY KEY,
    subscription_id BIGINT      NOT NULL,
    product_id      BIGINT      NOT NULL,
    quantity        INT         NOT NULL,
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sub_items_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions (id) ON DELETE CASCADE,
    CONSTRAINT fk_sub_items_product      FOREIGN KEY (product_id)      REFERENCES products (id)      ON DELETE RESTRICT,
    CONSTRAINT chk_sub_items_quantity CHECK (quantity >= 1),
    CONSTRAINT uq_sub_items UNIQUE (subscription_id, product_id)
);

COMMENT ON TABLE subscription_items IS '구독에 포함된 개별 상품 목록 테이블';

CREATE TRIGGER trg_subscription_items_updated_at
    BEFORE UPDATE ON subscription_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### subscription_day_of_week

```sql
-- =============================================================
-- 구독 배송 요일 테이블
-- =============================================================
CREATE TABLE subscription_day_of_week (
    subscription_id BIGINT      NOT NULL,
    day_of_week     SMALLINT    NOT NULL,
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_sub_day_of_week PRIMARY KEY (subscription_id, day_of_week),
    CONSTRAINT fk_sub_dow_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions (id) ON DELETE CASCADE,
    CONSTRAINT chk_sub_dow_day CHECK (day_of_week BETWEEN 0 AND 6)
);

COMMENT ON TABLE subscription_day_of_week IS '구독 배송 요일 테이블 (0=일, 6=토)';

CREATE TRIGGER trg_subscription_day_of_week_updated_at
    BEFORE UPDATE ON subscription_day_of_week
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### subscription_history

```sql
-- =============================================================
-- 구독 배송 이력 테이블
-- =============================================================
CREATE TABLE subscription_history (
    id              BIGSERIAL   PRIMARY KEY,
    subscription_id BIGINT      NOT NULL,
    cycle_count     INT         NOT NULL,
    scheduled_date  DATE        NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    store_order_id  BIGINT      NULL,
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sub_history_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions (id) ON DELETE CASCADE,
    CONSTRAINT fk_sub_history_store_order  FOREIGN KEY (store_order_id)  REFERENCES store_order (id)   ON DELETE SET NULL,
    CONSTRAINT chk_sub_history_status CHECK (status IN ('SCHEDULED', 'ORDERED', 'SKIPPED', 'COMPLETED'))
);

COMMENT ON TABLE subscription_history IS '구독 회차별 배송 이력 테이블';

CREATE INDEX idx_sub_history_sub_date    ON subscription_history (subscription_id, scheduled_date);
CREATE INDEX idx_sub_history_store_order ON subscription_history (store_order_id);

CREATE TRIGGER trg_subscription_history_updated_at
    BEFORE UPDATE ON subscription_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 3.8 리뷰 모듈

### reviews

```sql
-- =============================================================
-- 리뷰 테이블
-- =============================================================
CREATE TABLE reviews (
    id             BIGSERIAL   PRIMARY KEY,
    store_order_id BIGINT      NOT NULL,
    user_id        BIGINT      NOT NULL,
    rating         SMALLINT    NOT NULL,
    content        VARCHAR(100) NULL,
    is_visible     BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reviews_store_order FOREIGN KEY (store_order_id) REFERENCES store_order (id) ON DELETE RESTRICT,
    CONSTRAINT fk_reviews_user        FOREIGN KEY (user_id)        REFERENCES users (id)       ON DELETE RESTRICT,
    CONSTRAINT uq_reviews_store_order UNIQUE (store_order_id),
    CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)
);

COMMENT ON TABLE reviews IS '리뷰 테이블 (7일 이내 삭제 가능, 이후 is_visible=false)';

CREATE INDEX idx_reviews_user ON reviews (user_id);

CREATE TRIGGER trg_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 3.9 정산 모듈

### settlements

```sql
-- =============================================================
-- 정산 테이블
-- =============================================================
CREATE TABLE settlements (
    id                      BIGSERIAL       PRIMARY KEY,
    target_type             VARCHAR(20)     NOT NULL,
    target_id               BIGINT          NOT NULL,
    settlement_period_start DATE            NOT NULL,
    settlement_period_end   DATE            NOT NULL,
    total_sales             NUMERIC(12, 2)  NOT NULL,
    platform_fee            NUMERIC(12, 2)  NOT NULL,
    settlement_amount       NUMERIC(12, 2)  NOT NULL,
    status                  VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    bank_name               VARCHAR(50)     NULL,
    bank_account            VARCHAR(255)    NULL,
    settled_at              TIMESTAMP       NULL,
    created_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 다형성 FK: target_id는 stores.id 또는 riders.id를 참조 (앱 레벨 검증)
    CONSTRAINT chk_settlements_target_type CHECK (target_type IN ('STORE', 'RIDER')),
    CONSTRAINT chk_settlements_status CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED'))
);

COMMENT ON TABLE settlements IS '정산 테이블 (물리 삭제 금지, 다형성 FK - 앱 레벨 검증)';

CREATE INDEX idx_settlements_target_period ON settlements (target_type, target_id, settlement_period_start);
CREATE INDEX idx_settlements_status        ON settlements (status);

CREATE TRIGGER trg_settlements_updated_at
    BEFORE UPDATE ON settlements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### settlement_details

```sql
-- =============================================================
-- 정산 상세 내역 테이블
-- =============================================================
CREATE TABLE settlement_details (
    id             BIGSERIAL       PRIMARY KEY,
    settlement_id  BIGINT          NOT NULL,
    store_order_id BIGINT          NOT NULL,
    amount         NUMERIC(12, 2)  NOT NULL,
    fee            NUMERIC(12, 2)  NOT NULL,
    net_amount     NUMERIC(12, 2)  NOT NULL,
    created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_settlement_details_settlement  FOREIGN KEY (settlement_id)  REFERENCES settlements (id)  ON DELETE CASCADE,
    CONSTRAINT fk_settlement_details_store_order FOREIGN KEY (store_order_id) REFERENCES store_order (id)  ON DELETE RESTRICT
);

COMMENT ON TABLE settlement_details IS '정산 건별 상세 내역 테이블';

CREATE INDEX idx_settlement_details_settlement  ON settlement_details (settlement_id);
CREATE INDEX idx_settlement_details_store_order ON settlement_details (store_order_id);

CREATE TRIGGER trg_settlement_details_updated_at
    BEFORE UPDATE ON settlement_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 3.10 승인 관리 모듈

### approvals

```sql
-- =============================================================
-- 승인 테이블 (마트/배달원 승인 통합)
-- =============================================================
CREATE TABLE approvals (
    id             BIGSERIAL       PRIMARY KEY,
    user_id        BIGINT          NOT NULL,
    applicant_type VARCHAR(20)     NOT NULL,
    status         VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    reason         TEXT            NULL,
    approved_by    BIGINT          NULL,
    approved_at    TIMESTAMP       NULL,
    created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_approvals_user     FOREIGN KEY (user_id)     REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_approvals_admin    FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT chk_approvals_type CHECK (applicant_type IN ('MART', 'RIDER')),
    CONSTRAINT chk_approvals_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'HELD'))
);

COMMENT ON TABLE approvals IS '마트/배달원 승인 관리 테이블 (물리 삭제 금지, 감사 추적)';

CREATE INDEX idx_approvals_user          ON approvals (user_id);
CREATE INDEX idx_approvals_status        ON approvals (status);
CREATE INDEX idx_approvals_type_created  ON approvals (applicant_type, created_at);

CREATE TRIGGER trg_approvals_updated_at
    BEFORE UPDATE ON approvals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### approval_documents

```sql
-- =============================================================
-- 승인 첨부 서류 테이블
-- =============================================================
CREATE TABLE approval_documents (
    id             BIGSERIAL       PRIMARY KEY,
    applicant_type VARCHAR(20)     NOT NULL,
    approval_id    BIGINT          NOT NULL,
    document_type  VARCHAR(30)     NOT NULL,
    document_url   VARCHAR(500)    NOT NULL,
    created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_approval_docs_approval FOREIGN KEY (approval_id) REFERENCES approvals (id) ON DELETE RESTRICT,
    CONSTRAINT chk_approval_docs_applicant CHECK (applicant_type IN ('STORE', 'RIDER')),
    CONSTRAINT chk_approval_docs_type CHECK (document_type IN ('BUSINESS_LICENSE', 'BUSINESS_REPORT', 'BANK_PASSBOOK', 'ID_CARD')),
    CONSTRAINT uq_approval_docs_type UNIQUE (approval_id, document_type)
);

COMMENT ON TABLE approval_documents IS '승인 신청 첨부 서류 테이블 (물리 삭제 금지, 감사 추적)';

CREATE INDEX idx_approval_docs_approval ON approval_documents (approval_id);

CREATE TRIGGER trg_approval_documents_updated_at
    BEFORE UPDATE ON approval_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 3.11 기타 모듈

### notifications

```sql
-- =============================================================
-- 알림 테이블
-- =============================================================
CREATE TABLE notifications (
    id             BIGSERIAL       PRIMARY KEY,
    user_id        BIGINT          NOT NULL,
    title          VARCHAR(200)    NOT NULL,
    content        TEXT            NULL,
    reference_type VARCHAR(20)     NULL,
    sent_at        TIMESTAMP       NULL,
    is_read        BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT chk_notifications_ref_type CHECK (reference_type IN ('RIDER', 'STORE', 'CUSTOMER', 'ORDER', 'DELIVERY', 'PROMOTION'))
);

COMMENT ON TABLE notifications IS '사용자 개별 알림 테이블';

CREATE INDEX idx_notifications_user_read ON notifications (user_id, is_read, sent_at);

CREATE TRIGGER trg_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### notification_broadcasts

```sql
-- =============================================================
-- 전체 공지 알림 테이블
-- =============================================================
CREATE TABLE notification_broadcasts (
    id             BIGSERIAL       PRIMARY KEY,
    title          VARCHAR(200)    NOT NULL,
    content        TEXT            NULL,
    reference_type VARCHAR(20)     NOT NULL DEFAULT 'ALL',
    created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_broadcasts_ref_type CHECK (reference_type IN ('RIDER', 'STORE', 'CUSTOMER', 'ALL'))
);

COMMENT ON TABLE notification_broadcasts IS '역할별/전체 공지 브로드캐스트 알림 테이블';

CREATE INDEX idx_broadcasts_type_created ON notification_broadcasts (reference_type, created_at);

CREATE TRIGGER trg_notification_broadcasts_updated_at
    BEFORE UPDATE ON notification_broadcasts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### reports

```sql
-- =============================================================
-- 신고 테이블
-- =============================================================
CREATE TABLE reports (
    id             BIGSERIAL       PRIMARY KEY,
    store_order_id BIGINT          NULL,
    reporter_id    BIGINT          NOT NULL,
    reporter_type  VARCHAR(20)     NOT NULL,
    target_id      BIGINT          NOT NULL,
    target_type    VARCHAR(20)     NOT NULL,
    reason_detail  TEXT            NOT NULL,
    status         VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    report_result  TEXT            NULL,
    resolved_at    TIMESTAMP       NULL,
    created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reports_store_order FOREIGN KEY (store_order_id) REFERENCES store_order (id) ON DELETE SET NULL,
    CONSTRAINT fk_reports_reporter    FOREIGN KEY (reporter_id)    REFERENCES users (id)       ON DELETE RESTRICT,
    CONSTRAINT fk_reports_target      FOREIGN KEY (target_id)      REFERENCES users (id)       ON DELETE RESTRICT,
    CONSTRAINT chk_reports_reporter_type CHECK (reporter_type IN ('STORE', 'RIDER', 'CUSTOMER')),
    CONSTRAINT chk_reports_target_type CHECK (target_type IN ('STORE', 'RIDER', 'CUSTOMER')),
    CONSTRAINT chk_reports_status CHECK (status IN ('PENDING', 'RESOLVED'))
);

COMMENT ON TABLE reports IS '신고 테이블 (물리 삭제 금지, 신고 이력 보존)';

CREATE INDEX idx_reports_reporter ON reports (reporter_id);
CREATE INDEX idx_reports_target   ON reports (target_type, target_id);
CREATE INDEX idx_reports_status   ON reports (status);

CREATE TRIGGER trg_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### inquiries

```sql
-- =============================================================
-- 1:1 문의 테이블
-- =============================================================
CREATE TABLE inquiries (
    id          BIGSERIAL       PRIMARY KEY,
    user_id     BIGINT          NOT NULL,
    category    VARCHAR(30)     NOT NULL,
    title       VARCHAR(200)    NOT NULL,
    content     TEXT            NOT NULL,
    file_url    VARCHAR(500)    NULL,
    status      VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    answer      TEXT            NULL,
    answered_at TIMESTAMP       NULL,
    answered_by BIGINT          NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inquiries_user     FOREIGN KEY (user_id)     REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_inquiries_admin    FOREIGN KEY (answered_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT chk_inquiries_category CHECK (category IN ('ORDER_PAYMENT', 'CANCELLATION_REFUND', 'DELIVERY', 'SERVICE', 'OTHER')),
    CONSTRAINT chk_inquiries_status CHECK (status IN ('PENDING', 'ANSWERED'))
);

COMMENT ON TABLE inquiries IS '1:1 문의 테이블';

CREATE INDEX idx_inquiries_user_status ON inquiries (user_id, status);
CREATE INDEX idx_inquiries_status      ON inquiries (status);

CREATE TRIGGER trg_inquiries_updated_at
    BEFORE UPDATE ON inquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### inquiry_attachments

```sql
-- =============================================================
-- 문의 첨부파일 테이블
-- =============================================================
CREATE TABLE inquiry_attachments (
    id         BIGSERIAL       PRIMARY KEY,
    inquiry_id BIGINT          NOT NULL,
    file_url   VARCHAR(500)    NOT NULL,
    file_name  VARCHAR(255)    NOT NULL,
    file_size  INT             NOT NULL,
    mime_type  VARCHAR(100)    NOT NULL,
    created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inquiry_attachments_inquiry FOREIGN KEY (inquiry_id) REFERENCES inquiries (id) ON DELETE CASCADE
);

COMMENT ON TABLE inquiry_attachments IS '문의 첨부파일 테이블';

CREATE INDEX idx_inquiry_attachments_inquiry ON inquiry_attachments (inquiry_id);

CREATE TRIGGER trg_inquiry_attachments_updated_at
    BEFORE UPDATE ON inquiry_attachments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### notices

```sql
-- =============================================================
-- 공지사항 테이블
-- =============================================================
CREATE TABLE notices (
    id         BIGSERIAL       PRIMARY KEY,
    title      VARCHAR(200)    NOT NULL,
    content    TEXT            NOT NULL,
    author_id  BIGINT          NULL,
    is_pinned  BOOLEAN         NOT NULL DEFAULT FALSE,
    status     VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notices_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT chk_notices_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

COMMENT ON TABLE notices IS '공지사항 테이블';

CREATE INDEX idx_notices_status_pinned ON notices (status, is_pinned, created_at);
CREATE INDEX idx_notices_author        ON notices (author_id);

CREATE TRIGGER trg_notices_updated_at
    BEFORE UPDATE ON notices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### banners

```sql
-- =============================================================
-- 배너 테이블
-- =============================================================
CREATE TABLE banners (
    id               BIGSERIAL       PRIMARY KEY,
    title            VARCHAR(200)    NOT NULL,
    content          TEXT            NULL,
    image_url        VARCHAR(500)    NOT NULL,
    link_url         VARCHAR(500)    NULL,
    background_color VARCHAR(50)     NULL,
    display_order    INT             NOT NULL DEFAULT 0,
    status           VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    started_at       TIMESTAMP       NOT NULL,
    ended_at         TIMESTAMP       NOT NULL,
    created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_banners_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

COMMENT ON TABLE banners IS '배너 관리 테이블';

CREATE INDEX idx_banners_status_order ON banners (status, display_order);
CREATE INDEX idx_banners_period       ON banners (started_at, ended_at);

CREATE TRIGGER trg_banners_updated_at
    BEFORE UPDATE ON banners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### promotions

```sql
-- =============================================================
-- 프로모션 테이블
-- =============================================================
CREATE TABLE promotions (
    id               BIGSERIAL       PRIMARY KEY,
    title            VARCHAR(200)    NOT NULL,
    description      TEXT            NULL,
    banner_image_url VARCHAR(500)    NULL,
    start_date       DATE            NOT NULL,
    end_date         DATE            NOT NULL,
    status           VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_promotions_status CHECK (status IN ('ACTIVE', 'ENDED'))
);

COMMENT ON TABLE promotions IS '프로모션 이벤트 테이블';

CREATE INDEX idx_promotions_status_period ON promotions (status, start_date, end_date);

CREATE TRIGGER trg_promotions_updated_at
    BEFORE UPDATE ON promotions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### promotion_products

```sql
-- =============================================================
-- 프로모션 상품 매핑 테이블
-- =============================================================
CREATE TABLE promotion_products (
    id           BIGSERIAL   PRIMARY KEY,
    promotion_id BIGINT      NOT NULL,
    product_id   BIGINT      NOT NULL,
    sort_order   INT         NOT NULL DEFAULT 0,
    created_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_promo_products_promotion FOREIGN KEY (promotion_id) REFERENCES promotions (id) ON DELETE CASCADE,
    CONSTRAINT fk_promo_products_product   FOREIGN KEY (product_id)   REFERENCES products (id)   ON DELETE CASCADE,
    CONSTRAINT uq_promo_products UNIQUE (promotion_id, product_id)
);

COMMENT ON TABLE promotion_products IS '프로모션-상품 매핑 테이블';

CREATE INDEX idx_promo_products_promotion ON promotion_products (promotion_id);

CREATE TRIGGER trg_promotion_products_updated_at
    BEFORE UPDATE ON promotion_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 시드 데이터

```sql
-- =============================================================
-- 초기 역할 데이터
-- =============================================================
INSERT INTO roles (role_name, description) VALUES
    ('CUSTOMER',    '일반 고객'),
    ('STORE_OWNER', '마트 사장님'),
    ('RIDER',       '배달원'),
    ('ADMIN',       '관리자');
```
