# 동네마켓 JPA 엔티티 클래스 정의서

> **버전**: v1.0
> **최종 수정일**: 2026-01-29
> **기반 문서**: ERD 엔티티 설명서 v3.4, DDL v1.0
> **기술 스택**: Spring Boot 3.x, Hibernate 6, Jakarta Persistence, Java 17+, Lombok, PostgreSQL 16

---

## 목차

### 1. 공통 정의
- [1.1 패키지 구조](#11-패키지-구조)
- [1.2 타입 매핑 테이블](#12-타입-매핑-테이블)
- [1.3 공통 베이스 클래스](#13-공통-베이스-클래스)
  - [BaseEntity](#baseentity)
  - [SoftDeletableEntity](#softdeletableentity)
- [1.4 Enum 정의](#14-enum-정의)

### 2. 엔티티 모듈 (전체 35개 엔티티, 11개 모듈)

| # | 모듈 | 엔티티 | 파트 |
|---|------|--------|------|
| 3.1 | 사용자 모듈 | Role, User, UserRole, Address, SocialLogin | **Part 1** |
| 3.2 | 마트 모듈 | Store, StoreBusinessHour | **Part 1** |
| 3.3 | 상품 모듈 | Category, Product | **Part 1** |
| 3.4 | 주문 모듈 | Order, StoreOrder, OrderProduct, Cart, CartProduct | Part 2 |
| 3.5 | 결제 모듈 | Payment, PaymentRefund, PaymentMethod | Part 2 |
| 3.6 | 배달 모듈 | Rider, Delivery, RiderLocation, DeliveryPhoto | Part 2 |
| 3.7 | 구독 모듈 | SubscriptionProduct, SubscriptionProductItem, Subscription, SubscriptionItem, SubscriptionDayOfWeek, SubscriptionHistory | Part 3 |
| 3.8 | 리뷰 모듈 | Review | Part 3 |
| 3.9 | 정산 모듈 | Settlement, SettlementDetail | Part 3 |
| 3.10 | 승인 모듈 | Approval, ApprovalDocument | Part 3 |
| 3.11 | 지원 모듈 | Notification, NotificationBroadcast, Report, Inquiry, InquiryAttachment, Notice, Banner, Promotion, PromotionProduct | Part 4 |

---

## 1.1 패키지 구조

```
com.neighborhood.market
├── domain/
│   ├── common/          # BaseEntity, SoftDeletableEntity
│   ├── user/            # Role, User, UserRole, Address, SocialLogin
│   ├── store/           # Store, StoreBusinessHour
│   ├── product/         # Category, Product
│   ├── order/           # Order, StoreOrder, OrderProduct, Cart, CartProduct
│   ├── payment/         # Payment, PaymentRefund, PaymentMethod
│   ├── delivery/        # Rider, Delivery, RiderLocation, DeliveryPhoto
│   ├── subscription/    # SubscriptionProduct, SubscriptionProductItem, Subscription, SubscriptionItem, SubscriptionDayOfWeek, SubscriptionHistory
│   ├── review/          # Review
│   ├── settlement/      # Settlement, SettlementDetail
│   ├── approval/        # Approval, ApprovalDocument
│   └── support/         # Notification, NotificationBroadcast, Report, Inquiry, InquiryAttachment, Notice, Banner, Promotion, PromotionProduct
└── enums/               # All enum classes
```

---

## 1.2 타입 매핑 테이블

| PostgreSQL 타입 | Java 타입 | JPA 어노테이션 | 비고 |
|----------------|-----------|----------------|------|
| `BIGSERIAL` / `BIGINT` | `Long` | `@Id @GeneratedValue(strategy = IDENTITY)` | PK auto-increment |
| `VARCHAR(n)` | `String` | `@Column(length = n)` | |
| `TEXT` | `String` | `@Column(columnDefinition = "TEXT")` | |
| `NUMERIC(p,s)` | `BigDecimal` | `@Column(precision = p, scale = s)` | |
| `INTEGER` | `Integer` | `@Column` | |
| `SMALLINT` | `Short` | `@Column` | day_of_week 등 |
| `BOOLEAN` | `Boolean` | `@Column` | |
| `TIMESTAMP` | `LocalDateTime` | `@Column` | |
| `TIME` | `LocalTime` | `@Column` | 영업시간 등 |
| `CHECK` 제약 (enum) | `Enum` | `@Enumerated(EnumType.STRING)` | DDL CHECK 매핑 |

---

## 1.3 공통 베이스 클래스

### BaseEntity

```java
package com.neighborhood.market.domain.common;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
```

### SoftDeletableEntity

```java
package com.neighborhood.market.domain.common;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@MappedSuperclass
public abstract class SoftDeletableEntity extends BaseEntity {

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
```

---

## 1.4 Enum 정의

### UserStatus

```java
package com.neighborhood.market.enums;

public enum UserStatus {
    ACTIVE,
    INACTIVE,
    SUSPENDED,
    PENDING
}
```

### SocialProvider

```java
package com.neighborhood.market.enums;

public enum SocialProvider {
    KAKAO,
    NAVER,
    GOOGLE,
    APPLE
}
```

### StoreApprovalStatus

```java
package com.neighborhood.market.enums;

public enum StoreApprovalStatus {
    PENDING,
    APPROVED,
    REJECTED,
    SUSPENDED
}
```

### StoreActiveStatus

```java
package com.neighborhood.market.enums;

public enum StoreActiveStatus {
    ACTIVE,
    INACTIVE,
    CLOSED
}
```

### OrderType

```java
package com.neighborhood.market.enums;

public enum OrderType {
    REGULAR,
    SUBSCRIPTION
}
```

### OrderStatus

```java
package com.neighborhood.market.enums;

public enum OrderStatus {
    PENDING,
    PAID,
    PARTIAL_CANCELLED,
    CANCELLED,
    COMPLETED
}
```

### StoreOrderStatus

```java
package com.neighborhood.market.enums;

public enum StoreOrderStatus {
    PENDING,
    ACCEPTED,
    PREPARING,
    READY,
    PICKED_UP,
    DELIVERING,
    DELIVERED,
    CANCELLED,
    REJECTED
}
```

### PaymentMethodType

```java
package com.neighborhood.market.enums;

public enum PaymentMethodType {
    CARD,
    KAKAO_PAY,
    NAVER_PAY,
    TOSS_PAY
}
```

### PaymentStatus

```java
package com.neighborhood.market.enums;

public enum PaymentStatus {
    PENDING,
    COMPLETED,
    FAILED,
    CANCELLED,
    PARTIAL_REFUNDED,
    REFUNDED
}
```

### RiderOperationStatus

```java
package com.neighborhood.market.enums;

public enum RiderOperationStatus {
    OFFLINE,
    ONLINE
}
```

### RiderStatus

```java
package com.neighborhood.market.enums;

public enum RiderStatus {
    PENDING,
    APPROVED,
    REJECTED,
    SUSPENDED
}
```

### DeliveryStatus

```java
package com.neighborhood.market.enums;

public enum DeliveryStatus {
    REQUESTED,
    ACCEPTED,
    PICKED_UP,
    DELIVERING,
    DELIVERED,
    CANCELLED
}
```

### SubscriptionProductStatus

```java
package com.neighborhood.market.enums;

public enum SubscriptionProductStatus {
    ACTIVE,
    INACTIVE
}
```

### SubscriptionStatus

```java
package com.neighborhood.market.enums;

public enum SubscriptionStatus {
    ACTIVE,
    PAUSED,
    CANCELLATION_PENDING,
    CANCELLED
}
```

### SubscriptionHistoryStatus

```java
package com.neighborhood.market.enums;

public enum SubscriptionHistoryStatus {
    SCHEDULED,
    ORDERED,
    SKIPPED,
    COMPLETED
}
```

### SettlementTargetType

```java
package com.neighborhood.market.enums;

public enum SettlementTargetType {
    STORE,
    RIDER
}
```

### SettlementStatus

```java
package com.neighborhood.market.enums;

public enum SettlementStatus {
    PENDING,
    COMPLETED,
    FAILED
}
```

### ApplicantType

```java
package com.neighborhood.market.enums;

public enum ApplicantType {
    MART,
    RIDER
}
```

### ApprovalStatus

```java
package com.neighborhood.market.enums;

public enum ApprovalStatus {
    PENDING,
    APPROVED,
    REJECTED,
    HELD
}
```

### ApprovalDocApplicantType

```java
package com.neighborhood.market.enums;

public enum ApprovalDocApplicantType {
    STORE,
    RIDER
}
```

### DocumentType

```java
package com.neighborhood.market.enums;

public enum DocumentType {
    BUSINESS_LICENSE,
    BUSINESS_REPORT,
    BANK_PASSBOOK,
    ID_CARD
}
```

### NotificationReferenceType

```java
package com.neighborhood.market.enums;

public enum NotificationReferenceType {
    RIDER,
    STORE,
    CUSTOMER,
    ORDER,
    DELIVERY,
    PROMOTION
}
```

### BroadcastReferenceType

```java
package com.neighborhood.market.enums;

public enum BroadcastReferenceType {
    RIDER,
    STORE,
    CUSTOMER,
    ALL
}
```

### ReporterType

```java
package com.neighborhood.market.enums;

public enum ReporterType {
    STORE,
    RIDER,
    CUSTOMER
}
```

### TargetType

```java
package com.neighborhood.market.enums;

public enum TargetType {
    STORE,
    RIDER,
    CUSTOMER
}
```

### ReportStatus

```java
package com.neighborhood.market.enums;

public enum ReportStatus {
    PENDING,
    RESOLVED
}
```

### InquiryCategory

```java
package com.neighborhood.market.enums;

public enum InquiryCategory {
    ORDER_PAYMENT,
    CANCELLATION_REFUND,
    DELIVERY,
    SERVICE,
    OTHER
}
```

### InquiryStatus

```java
package com.neighborhood.market.enums;

public enum InquiryStatus {
    PENDING,
    ANSWERED
}
```

### ActiveStatus

```java
package com.neighborhood.market.enums;

public enum ActiveStatus {
    ACTIVE,
    INACTIVE
}
```

### PromotionStatus

```java
package com.neighborhood.market.enums;

public enum PromotionStatus {
    ACTIVE,
    ENDED
}
```

---

## 3.1 사용자 모듈 (User Module)

### Role

```java
package com.neighborhood.market.domain.user;

import com.neighborhood.market.domain.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "roles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class Role extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "role_name", nullable = false, unique = true, length = 30)
    private String roleName;

    @Column(name = "description", length = 100)
    private String description;
}
```

### User

```java
package com.neighborhood.market.domain.user;

import com.neighborhood.market.domain.common.SoftDeletableEntity;
import com.neighborhood.market.enums.UserStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_status_deleted", columnList = "status, deleted_at")
})
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class User extends SoftDeletableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "phone", nullable = false, unique = true, length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "terms_agreed", nullable = false)
    @Builder.Default
    private Boolean termsAgreed = false;

    @Column(name = "privacy_agreed", nullable = false)
    @Builder.Default
    private Boolean privacyAgreed = false;

    @Column(name = "terms_agreed_at")
    private LocalDateTime termsAgreedAt;

    @Column(name = "privacy_agreed_at")
    private LocalDateTime privacyAgreedAt;
}
```

### UserRole

```java
package com.neighborhood.market.domain.user;

import com.neighborhood.market.domain.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_roles", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_roles_user_role", columnNames = {"user_id", "role_id"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class UserRole extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;
}
```

### Address

```java
package com.neighborhood.market.domain.user;

import com.neighborhood.market.domain.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "addresses", uniqueConstraints = {
        @UniqueConstraint(name = "uk_addresses_user_address", columnNames = {"user_id", "address_line1", "address_line2"}),
        @UniqueConstraint(name = "uk_addresses_user_name", columnNames = {"user_id", "address_name"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class Address extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "contact", nullable = false, length = 20)
    private String contact;

    @Column(name = "address_name", nullable = false, length = 50)
    private String addressName;

    @Column(name = "postal_code", nullable = false, length = 10)
    private String postalCode;

    @Column(name = "address_line1", nullable = false, length = 255)
    private String addressLine1;

    @Column(name = "address_line2", length = 255)
    private String addressLine2;

    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 7)
    private BigDecimal longitude;

    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private Boolean isDefault = false;
}
```

### SocialLogin

```java
package com.neighborhood.market.domain.user;

import com.neighborhood.market.domain.common.SoftDeletableEntity;
import com.neighborhood.market.enums.SocialProvider;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "social_logins", uniqueConstraints = {
        @UniqueConstraint(name = "uk_social_logins_provider_user", columnNames = {"provider", "provider_user_id"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class SocialLogin extends SoftDeletableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false)
    private SocialProvider provider;

    @Column(name = "provider_user_id", nullable = false, length = 255)
    private String providerUserId;

    @Column(name = "connected_at", nullable = false)
    private LocalDateTime connectedAt;
}
```

---

## 3.2 마트 모듈 (Store Module)

### Store

```java
package com.neighborhood.market.domain.store;

import com.neighborhood.market.domain.common.SoftDeletableEntity;
import com.neighborhood.market.domain.user.User;
import com.neighborhood.market.enums.StoreActiveStatus;
import com.neighborhood.market.enums.StoreApprovalStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;

@Entity
@Table(name = "stores", indexes = {
        @Index(name = "idx_stores_status_active", columnList = "status, is_active"),
        @Index(name = "idx_stores_location", columnList = "latitude, longitude")
})
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class Store extends SoftDeletableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false, unique = true)
    private User owner;

    @Column(name = "store_name", nullable = false, length = 100)
    private String storeName;

    @Column(name = "business_number", nullable = false, unique = true, length = 12)
    private String businessNumber;

    @Column(name = "representative_name", nullable = false, length = 50)
    private String representativeName;

    @Column(name = "representative_phone", nullable = false, length = 20)
    private String representativePhone;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "telecom_sales_report_number", length = 50)
    private String telecomSalesReportNumber;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "address_line1", nullable = false, length = 255)
    private String addressLine1;

    @Column(name = "address_line2", length = 255)
    private String addressLine2;

    @Column(name = "postal_code", nullable = false, length = 10)
    private String postalCode;

    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 7)
    private BigDecimal longitude;

    @Column(name = "settlement_bank_name", length = 50)
    private String settlementBankName;

    @Column(name = "settlement_bank_account", length = 255)
    private String settlementBankAccount;

    @Column(name = "settlement_account_holder", length = 50)
    private String settlementAccountHolder;

    @Column(name = "store_image", length = 500)
    private String storeImage;

    @Column(name = "review_count", nullable = false)
    @Builder.Default
    private Integer reviewCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private StoreApprovalStatus status = StoreApprovalStatus.PENDING;

    @Column(name = "is_delivery_available", nullable = false)
    @Builder.Default
    private Boolean isDeliveryAvailable = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private StoreActiveStatus isActive = StoreActiveStatus.INACTIVE;

    @Column(name = "commission_rate", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal commissionRate = new BigDecimal("5.00");
}
```

### StoreBusinessHour

```java
package com.neighborhood.market.domain.store;

import com.neighborhood.market.domain.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalTime;

@Entity
@Table(name = "store_business_hours", uniqueConstraints = {
        @UniqueConstraint(name = "uk_store_business_hours_store_day", columnNames = {"store_id", "day_of_week"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class StoreBusinessHour extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Store store;

    @Column(name = "day_of_week", nullable = false)
    private Short dayOfWeek;

    @Column(name = "open_time")
    private LocalTime openTime;

    @Column(name = "close_time")
    private LocalTime closeTime;

    @Column(name = "is_closed", nullable = false)
    @Builder.Default
    private Boolean isClosed = false;
}
```

---

## 3.3 상품 모듈 (Product Module)

### Category

```java
package com.neighborhood.market.domain.product;

import com.neighborhood.market.domain.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "categories")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class Category extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "category_name", nullable = false, unique = true, length = 50)
    private String categoryName;

    @Column(name = "icon_url", length = 500)
    private String iconUrl;
}
```

### Product

```java
package com.neighborhood.market.domain.product;

import com.neighborhood.market.domain.common.BaseEntity;
import com.neighborhood.market.domain.store.Store;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_products_store_category", columnList = "store_id, category_id"),
        @Index(name = "idx_products_store_active", columnList = "store_id, is_active")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class Product extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "sale_price", precision = 12, scale = 2)
    private BigDecimal salePrice;

    @Column(name = "discount_rate", precision = 5, scale = 2)
    private BigDecimal discountRate;

    @Column(name = "stock", nullable = false)
    @Builder.Default
    private Integer stock = 0;

    @Column(name = "unit", length = 30)
    private String unit;

    @Column(name = "origin", length = 100)
    private String origin;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "order_count", nullable = false)
    @Builder.Default
    private Integer orderCount = 0;

    @Column(name = "product_image_url", length = 500)
    private String productImageUrl;
}
```
# 동네마켓 JPA 엔티티 클래스 정의서 (Part 2)

> **기술 스택**: Spring Boot 3.x, Hibernate 6, Jakarta EE (`jakarta.persistence.*`), Java 17+, Lombok
> **공통 사항**: 모든 엔티티는 `BaseEntity`(createdAt, updatedAt) 또는 `SoftDeletableEntity`(+deletedAt)를 상속
> **공통 어노테이션**: `@Getter`, `@NoArgsConstructor(access = AccessLevel.PROTECTED)`, `@Builder`, `@AllArgsConstructor(access = AccessLevel.PRIVATE)`
> **연관관계**: 모든 `@ManyToOne`은 `fetch = FetchType.LAZY` 사용
> **Enum 패키지**: `com.neighborhood.market.enums` (Part 1에서 정의 완료)

---

## 3.4 주문 모듈

### 3.4.1 Order (주문)

```java
package com.neighborhood.market.entity;

import com.neighborhood.market.enums.OrderStatus;
import com.neighborhood.market.enums.OrderType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "orders",
    indexes = {
        @Index(name = "idx_orders_user_status", columnList = "user_id, status"),
        @Index(name = "idx_orders_ordered_at", columnList = "ordered_at")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Order extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", nullable = false, unique = true, length = 30)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false,
        foreignKey = @ForeignKey(name = "fk_orders_user"))
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type", nullable = false)
    @Builder.Default
    private OrderType orderType = OrderType.REGULAR;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "total_product_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalProductPrice;

    @Column(name = "total_delivery_fee", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalDeliveryFee = BigDecimal.ZERO;

    @Column(name = "final_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal finalPrice;

    @Column(name = "delivery_address", nullable = false, length = 500)
    private String deliveryAddress;

    @Column(name = "delivery_latitude", precision = 10, scale = 7)
    private BigDecimal deliveryLatitude;

    @Column(name = "delivery_longitude", precision = 11, scale = 7)
    private BigDecimal deliveryLongitude;

    @Column(name = "delivery_request", length = 500)
    private String deliveryRequest;

    @Column(name = "ordered_at", nullable = false)
    private LocalDateTime orderedAt;
}
```

---

### 3.4.2 StoreOrder (마트별 주문)

```java
package com.neighborhood.market.entity;

import com.neighborhood.market.enums.OrderType;
import com.neighborhood.market.enums.StoreOrderStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "store_order",
    indexes = {
        @Index(name = "idx_store_order_order", columnList = "order_id"),
        @Index(name = "idx_store_order_store_status", columnList = "store_id, status")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class StoreOrder extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false,
        foreignKey = @ForeignKey(name = "fk_store_order_order"))
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false,
        foreignKey = @ForeignKey(name = "fk_store_order_store"))
    private Store store;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type", nullable = false)
    @Builder.Default
    private OrderType orderType = OrderType.REGULAR;

    @Column(name = "prep_time")
    private Integer prepTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private StoreOrderStatus status = StoreOrderStatus.PENDING;

    @Column(name = "store_product_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal storeProductPrice;

    @Column(name = "delivery_fee", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal deliveryFee = BigDecimal.ZERO;

    @Column(name = "final_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal finalPrice;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "prepared_at")
    private LocalDateTime preparedAt;

    @Column(name = "picked_up_at")
    private LocalDateTime pickedUpAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancel_reason", length = 500)
    private String cancelReason;
}
```

---

### 3.4.3 OrderProduct (주문 상품)

```java
package com.neighborhood.market.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;

@Entity
@Table(name = "order_products")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class OrderProduct extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_order_id", nullable = false,
        foreignKey = @ForeignKey(name = "fk_order_products_store_order"))
    @OnDelete(action = OnDeleteAction.CASCADE)
    private StoreOrder storeOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false,
        foreignKey = @ForeignKey(name = "fk_order_products_product"))
    private Product product;

    @Column(name = "product_name_snapshot", nullable = false, length = 200)
    private String productNameSnapshot;

    @Column(name = "price_snapshot", nullable = false, precision = 12, scale = 2)
    private BigDecimal priceSnapshot;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;
}
```

---

### 3.4.4 Cart (장바구니)

```java
package com.neighborhood.market.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cart")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Cart extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true,
        foreignKey = @ForeignKey(name = "fk_cart_user"))
    private User user;
}
```

---

### 3.4.5 CartProduct (장바구니 상품)

```java
package com.neighborhood.market.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(
    name = "cart_products",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_cart_products_cart_product",
            columnNames = {"cart_id", "product_id"})
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class CartProduct extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false,
        foreignKey = @ForeignKey(name = "fk_cart_products_cart"))
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false,
        foreignKey = @ForeignKey(name = "fk_cart_products_product"))
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false,
        foreignKey = @ForeignKey(name = "fk_cart_products_store"))
    private Store store;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;
}
```

---

## 3.5 결제 모듈

### 3.5.1 Payment (결제)

```java
package com.neighborhood.market.entity;

import com.neighborhood.market.enums.PaymentMethodType;
import com.neighborhood.market.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Payment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true,
        foreignKey = @ForeignKey(name = "fk_payments_order"))
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethodType paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "pg_provider", length = 50)
    private String pgProvider;

    @Column(name = "pg_transaction_id", length = 100)
    private String pgTransactionId;

    @Column(name = "card_company", length = 50)
    private String cardCompany;

    @Column(name = "card_number_masked", length = 30)
    private String cardNumberMasked;

    @Column(name = "receipt_url", length = 500)
    private String receiptUrl;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;
}
```

---

### 3.5.2 PaymentRefund (결제 환불)

```java
package com.neighborhood.market.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_refunds")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PaymentRefund extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false,
        foreignKey = @ForeignKey(name = "fk_payment_refunds_payment"))
    private Payment payment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_order_id", nullable = false,
        foreignKey = @ForeignKey(name = "fk_payment_refunds_store_order"))
    private StoreOrder storeOrder;

    @Column(name = "refund_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal refundAmount;

    @Column(name = "refund_reason", length = 500)
    private String refundReason;

    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;
}
```

---

### 3.5.3 PaymentMethod (결제 수단)

```java
package com.neighborhood.market.entity;

import com.neighborhood.market.enums.PaymentMethodType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "payment_methods",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_payment_methods_user_billing",
            columnNames = {"user_id", "billing_key"})
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PaymentMethod extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false,
        foreignKey = @ForeignKey(name = "fk_payment_methods_user"))
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "method_type", nullable = false)
    private PaymentMethodType methodType;

    @Column(name = "billing_key", nullable = false, length = 255)
    private String billingKey;

    @Column(name = "card_company", length = 50)
    private String cardCompany;

    @Column(name = "card_number_masked", length = 30)
    private String cardNumberMasked;

    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private Boolean isDefault = false;
}
```

---

## 3.6 배달 모듈

### 3.6.1 Rider (배달원)

```java
package com.neighborhood.market.entity;

import com.neighborhood.market.enums.RiderOperationStatus;
import com.neighborhood.market.enums.RiderStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "riders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Rider extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true,
        foreignKey = @ForeignKey(name = "fk_riders_user"))
    private User user;

    @Column(name = "id_card_verified", nullable = false)
    @Builder.Default
    private Boolean idCardVerified = false;

    @Column(name = "id_card_image", length = 500)
    private String idCardImage;

    @Enumerated(EnumType.STRING)
    @Column(name = "operation_status", nullable = false)
    @Builder.Default
    private RiderOperationStatus operationStatus = RiderOperationStatus.OFFLINE;

    @Column(name = "bank_name", length = 50)
    private String bankName;

    @Column(name = "bank_account", length = 255)
    private String bankAccount;

    @Column(name = "account_holder", length = 50)
    private String accountHolder;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private RiderStatus status = RiderStatus.PENDING;
}
```

---

### 3.6.2 Delivery (배달)

```java
package com.neighborhood.market.entity;

import com.neighborhood.market.enums.DeliveryStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "deliveries")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Delivery extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_order_id", nullable = false, unique = true,
        foreignKey = @ForeignKey(name = "fk_deliveries_store_order"))
    private StoreOrder storeOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rider_id", nullable = false,
        foreignKey = @ForeignKey(name = "fk_deliveries_rider"))
    private Rider rider;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private DeliveryStatus status = DeliveryStatus.REQUESTED;

    @Column(name = "delivery_fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal deliveryFee;

    @Column(name = "rider_earning", nullable = false, precision = 12, scale = 2)
    private BigDecimal riderEarning;

    @Column(name = "distance_km", precision = 5, scale = 2)
    private BigDecimal distanceKm;

    @Column(name = "estimated_minutes")
    private Integer estimatedMinutes;

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "picked_up_at")
    private LocalDateTime pickedUpAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancel_reason", length = 500)
    private String cancelReason;
}
```

---

### 3.6.3 RiderLocation (배달원 위치)

> **주의**: `BaseEntity`를 상속하지 않음. `created_at`만 직접 정의 (`updated_at` 없음).

```java
package com.neighborhood.market.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "rider_locations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class RiderLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rider_id", nullable = false,
        foreignKey = @ForeignKey(name = "fk_rider_locations_rider"))
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Rider rider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_id",
        foreignKey = @ForeignKey(name = "fk_rider_locations_delivery"))
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Delivery delivery;

    @Column(name = "latitude", nullable = false, precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", nullable = false, precision = 11, scale = 7)
    private BigDecimal longitude;

    @Column(name = "accuracy", precision = 6, scale = 2)
    private BigDecimal accuracy;

    @Column(name = "speed", precision = 5, scale = 2)
    private BigDecimal speed;

    @Column(name = "heading", precision = 5, scale = 2)
    private BigDecimal heading;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @Column(name = "is_current", nullable = false)
    @Builder.Default
    private Boolean isCurrent = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
```

---

### 3.6.4 DeliveryPhoto (배달 완료 사진)

> `SoftDeletableEntity` 상속 (`createdAt`, `updatedAt`, `deletedAt` 포함)

```java
package com.neighborhood.market.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_photos")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class DeliveryPhoto extends SoftDeletableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_id", nullable = false,
        foreignKey = @ForeignKey(name = "fk_delivery_photos_delivery"))
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Delivery delivery;

    @Column(name = "photo_url", nullable = false, length = 500)
    private String photoUrl;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
}
```

---

## 엔티티 요약

| 모듈 | 엔티티 | 테이블명 | 상속 | 주요 관계 |
|------|--------|----------|------|-----------|
| **주문** | `Order` | `orders` | `BaseEntity` | `User` (N:1) |
| | `StoreOrder` | `store_order` | `BaseEntity` | `Order` (N:1, CASCADE), `Store` (N:1) |
| | `OrderProduct` | `order_products` | `BaseEntity` | `StoreOrder` (N:1, CASCADE), `Product` (N:1) |
| | `Cart` | `cart` | `BaseEntity` | `User` (1:1, UNIQUE) |
| | `CartProduct` | `cart_products` | `BaseEntity` | `Cart` (N:1, CASCADE), `Product` (N:1, CASCADE), `Store` (N:1) |
| **결제** | `Payment` | `payments` | `BaseEntity` | `Order` (1:1, UNIQUE) |
| | `PaymentRefund` | `payment_refunds` | `BaseEntity` | `Payment` (N:1), `StoreOrder` (N:1) |
| | `PaymentMethod` | `payment_methods` | `BaseEntity` | `User` (N:1) |
| **배달** | `Rider` | `riders` | `BaseEntity` | `User` (1:1, UNIQUE) |
| | `Delivery` | `deliveries` | `BaseEntity` | `StoreOrder` (1:1, UNIQUE), `Rider` (N:1) |
| | `RiderLocation` | `rider_locations` | _(없음)_ | `Rider` (N:1, CASCADE), `Delivery` (N:1, CASCADE) |
| | `DeliveryPhoto` | `delivery_photos` | `SoftDeletableEntity` | `Delivery` (N:1, CASCADE) |

---

## ON DELETE 정책 요약

| FK | 대상 테이블 | ON DELETE |
|----|------------|-----------|
| `orders.user_id` | `users` | RESTRICT |
| `store_order.order_id` | `orders` | CASCADE |
| `store_order.store_id` | `stores` | RESTRICT |
| `order_products.store_order_id` | `store_order` | CASCADE |
| `order_products.product_id` | `products` | RESTRICT |
| `cart.user_id` | `users` | RESTRICT |
| `cart_products.cart_id` | `cart` | CASCADE |
| `cart_products.product_id` | `products` | CASCADE |
| `cart_products.store_id` | `stores` | RESTRICT |
| `payments.order_id` | `orders` | RESTRICT |
| `payment_refunds.payment_id` | `payments` | RESTRICT |
| `payment_refunds.store_order_id` | `store_order` | RESTRICT |
| `payment_methods.user_id` | `users` | RESTRICT |
| `riders.user_id` | `users` | RESTRICT |
| `deliveries.store_order_id` | `store_order` | RESTRICT |
| `deliveries.rider_id` | `riders` | RESTRICT |
| `rider_locations.rider_id` | `riders` | CASCADE |
| `rider_locations.delivery_id` | `deliveries` | CASCADE |
| `delivery_photos.delivery_id` | `deliveries` | CASCADE |
# 동네마켓 JPA 엔티티 클래스 정의서 - Part 3

> **Tech Stack**: Spring Boot 3.x, Hibernate 6, Jakarta EE (`jakarta.persistence.*`), Java 17+, Lombok
> **공통 사항**: 모든 엔티티는 `BaseEntity`(`createdAt`, `updatedAt`)를 상속하며, 별도 명시가 없는 한 아래 어노테이션을 사용합니다.
> `@Getter`, `@NoArgsConstructor(access = AccessLevel.PROTECTED)`, `@Builder`, `@AllArgsConstructor(access = AccessLevel.PRIVATE)`
> 모든 `@ManyToOne`은 `fetch = FetchType.LAZY`를 사용합니다.
> Enum 패키지: `com.neighborhood.market.enums`

---

## 3.7 구독 모듈

### 3.7.1 SubscriptionProduct

```java
package com.neighborhood.market.domain.subscription;

import com.neighborhood.market.domain.common.BaseEntity;
import com.neighborhood.market.domain.store.Store;
import com.neighborhood.market.enums.SubscriptionProductStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;

@Entity
@Table(
    name = "subscription_products",
    indexes = {
        @Index(name = "idx_subscription_products_store_status", columnList = "store_id, status")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class SubscriptionProduct extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(name = "subscription_product_name", nullable = false, length = 200)
    private String subscriptionProductName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "total_delivery_count", nullable = false)
    private Integer totalDeliveryCount;

    @Column(name = "delivery_day_of_week")
    private Short deliveryDayOfWeek;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @ColumnDefault("'ACTIVE'")
    private SubscriptionProductStatus status;

    @Column(name = "subscription_url", length = 500)
    private String subscriptionUrl;
}
```

---

### 3.7.2 SubscriptionProductItem

```java
package com.neighborhood.market.domain.subscription;

import com.neighborhood.market.domain.common.BaseEntity;
import com.neighborhood.market.domain.product.Product;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(
    name = "subscription_product_items",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_sub_product_items_product",
            columnNames = {"subscription_product_id", "product_id"}
        )
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class SubscriptionProductItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_product_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private SubscriptionProduct subscriptionProduct;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;
}
```

---

### 3.7.3 Subscription

```java
package com.neighborhood.market.domain.subscription;

import com.neighborhood.market.domain.common.BaseEntity;
import com.neighborhood.market.domain.store.Store;
import com.neighborhood.market.domain.user.Address;
import com.neighborhood.market.domain.user.PaymentMethod;
import com.neighborhood.market.domain.user.User;
import com.neighborhood.market.enums.SubscriptionStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "subscriptions",
    indexes = {
        @Index(name = "idx_subscriptions_user_status", columnList = "user_id, status"),
        @Index(name = "idx_subscriptions_next_payment_date", columnList = "next_payment_date"),
        @Index(name = "idx_subscriptions_store", columnList = "store_id")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Subscription extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_product_id", nullable = false)
    private SubscriptionProduct subscriptionProduct;

    @Column(name = "delivery_time_slot", length = 30)
    private String deliveryTimeSlot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id", nullable = true)
    private Address address;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_method_id", nullable = true)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @ColumnDefault("'ACTIVE'")
    private SubscriptionStatus status;

    @Column(name = "next_payment_date")
    private LocalDate nextPaymentDate;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "cycle_count", nullable = false)
    @ColumnDefault("1")
    private Integer cycleCount;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "paused_at")
    private LocalDateTime pausedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancel_reason", length = 500)
    private String cancelReason;
}
```

---

### 3.7.4 SubscriptionItem

```java
package com.neighborhood.market.domain.subscription;

import com.neighborhood.market.domain.common.BaseEntity;
import com.neighborhood.market.domain.product.Product;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(
    name = "subscription_items",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_subscription_items_product",
            columnNames = {"subscription_id", "product_id"}
        )
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class SubscriptionItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Subscription subscription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;
}
```

---

### 3.7.5 SubscriptionDayOfWeek (복합키 엔티티)

#### SubscriptionDayOfWeekId (복합키 클래스)

```java
package com.neighborhood.market.domain.subscription;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class SubscriptionDayOfWeekId implements Serializable {

    private Long subscription;

    private Short dayOfWeek;
}
```

#### SubscriptionDayOfWeek 엔티티

```java
package com.neighborhood.market.domain.subscription;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Table(name = "subscription_day_of_week")
@IdClass(SubscriptionDayOfWeekId.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class SubscriptionDayOfWeek {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Subscription subscription;

    @Id
    @Column(name = "day_of_week", nullable = false)
    private Short dayOfWeek;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
```

> **Note**: `SubscriptionDayOfWeek`는 복합키 엔티티로 `BaseEntity`를 상속하지 않으며, `createdAt`/`updatedAt`을 직접 관리합니다. `day_of_week` 컬럼은 DDL에서 `CHECK (day_of_week BETWEEN 0 AND 6)` 제약 조건을 설정합니다.

---

### 3.7.6 SubscriptionHistory

```java
package com.neighborhood.market.domain.subscription;

import com.neighborhood.market.domain.common.BaseEntity;
import com.neighborhood.market.domain.order.StoreOrder;
import com.neighborhood.market.enums.SubscriptionHistoryStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;

@Entity
@Table(
    name = "subscription_history",
    indexes = {
        @Index(name = "idx_sub_history_sub_scheduled", columnList = "subscription_id, scheduled_date"),
        @Index(name = "idx_sub_history_store_order", columnList = "store_order_id")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class SubscriptionHistory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Subscription subscription;

    @Column(name = "cycle_count", nullable = false)
    private Integer cycleCount;

    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @ColumnDefault("'SCHEDULED'")
    private SubscriptionHistoryStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_order_id", nullable = true)
    private StoreOrder storeOrder;
}
```

---

## 3.8 리뷰 모듈

### 3.8.1 Review

```java
package com.neighborhood.market.domain.review;

import com.neighborhood.market.domain.common.BaseEntity;
import com.neighborhood.market.domain.order.StoreOrder;
import com.neighborhood.market.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(
    name = "reviews",
    indexes = {
        @Index(name = "idx_reviews_user", columnList = "user_id")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Review extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_order_id", nullable = false, unique = true)
    private StoreOrder storeOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "rating", nullable = false)
    private Short rating;

    @Column(name = "content", length = 100)
    private String content;

    @Column(name = "is_visible", nullable = false)
    @ColumnDefault("true")
    private Boolean isVisible;
}
```

---

## 3.9 정산 모듈

### 3.9.1 Settlement

```java
package com.neighborhood.market.domain.settlement;

import com.neighborhood.market.domain.common.BaseEntity;
import com.neighborhood.market.enums.SettlementStatus;
import com.neighborhood.market.enums.SettlementTargetType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "settlements",
    indexes = {
        @Index(name = "idx_settlements_target_period", columnList = "target_type, target_id, settlement_period_start"),
        @Index(name = "idx_settlements_status", columnList = "status")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Settlement extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false)
    private SettlementTargetType targetType;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Column(name = "settlement_period_start", nullable = false)
    private LocalDate settlementPeriodStart;

    @Column(name = "settlement_period_end", nullable = false)
    private LocalDate settlementPeriodEnd;

    @Column(name = "total_sales", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalSales;

    @Column(name = "platform_fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal platformFee;

    @Column(name = "settlement_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal settlementAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @ColumnDefault("'PENDING'")
    private SettlementStatus status;

    @Column(name = "bank_name", length = 50)
    private String bankName;

    @Column(name = "bank_account", length = 255)
    private String bankAccount;

    @Column(name = "settled_at")
    private LocalDateTime settledAt;
}
```

> **Note**: `target_id`는 다형적 FK(polymorphic FK)로, 데이터베이스 레벨의 FK 제약 없이 애플리케이션 레벨에서 유효성을 검증합니다. `target_type`에 따라 `stores` 또는 `riders` 테이블의 ID를 참조합니다.

---

### 3.9.2 SettlementDetail

```java
package com.neighborhood.market.domain.settlement;

import com.neighborhood.market.domain.common.BaseEntity;
import com.neighborhood.market.domain.order.StoreOrder;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;

@Entity
@Table(name = "settlement_details")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class SettlementDetail extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "settlement_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Settlement settlement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_order_id", nullable = false)
    private StoreOrder storeOrder;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal fee;

    @Column(name = "net_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal netAmount;
}
```

---

## 3.10 승인 관리 모듈

### 3.10.1 Approval

```java
package com.neighborhood.market.domain.approval;

import com.neighborhood.market.domain.common.BaseEntity;
import com.neighborhood.market.domain.user.User;
import com.neighborhood.market.enums.ApplicantType;
import com.neighborhood.market.enums.ApprovalStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "approvals",
    indexes = {
        @Index(name = "idx_approvals_user", columnList = "user_id"),
        @Index(name = "idx_approvals_status", columnList = "status"),
        @Index(name = "idx_approvals_type_created", columnList = "applicant_type, created_at")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Approval extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "applicant_type", nullable = false)
    private ApplicantType applicantType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @ColumnDefault("'PENDING'")
    private ApprovalStatus status;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by", nullable = true)
    private User approvedByUser;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
}
```

---

### 3.10.2 ApprovalDocument

```java
package com.neighborhood.market.domain.approval;

import com.neighborhood.market.domain.common.BaseEntity;
import com.neighborhood.market.enums.ApprovalDocApplicantType;
import com.neighborhood.market.enums.DocumentType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "approval_documents",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_approval_documents_type",
            columnNames = {"approval_id", "document_type"}
        )
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class ApprovalDocument extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "applicant_type", nullable = false)
    private ApprovalDocApplicantType applicantType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approval_id", nullable = false)
    private Approval approval;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false)
    private DocumentType documentType;

    @Column(name = "document_url", nullable = false, length = 500)
    private String documentUrl;
}
```

---

## 3.11 기타 모듈

### 3.11.1 Notification

```java
package com.neighborhood.market.domain.support;

import com.neighborhood.market.domain.common.BaseEntity;
import com.neighborhood.market.domain.user.User;
import com.neighborhood.market.enums.NotificationReferenceType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "notifications",
    indexes = {
        @Index(name = "idx_notifications_user_read_sent", columnList = "user_id, is_read, sent_at")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Notification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "reference_type")
    private NotificationReferenceType referenceType;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "is_read", nullable = false)
    @ColumnDefault("false")
    private Boolean isRead;
}
```

---

### 3.11.2 NotificationBroadcast

```java
package com.neighborhood.market.domain.support;

import com.neighborhood.market.domain.common.BaseEntity;
import com.neighborhood.market.enums.BroadcastReferenceType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(
    name = "notification_broadcasts",
    indexes = {
        @Index(name = "idx_notification_broadcasts_type_created", columnList = "reference_type, created_at")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class NotificationBroadcast extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "reference_type", nullable = false)
    @ColumnDefault("'ALL'")
    private BroadcastReferenceType referenceType;
}
```

---

### 3.11.3 Report

```java
package com.neighborhood.market.domain.support;

import com.neighborhood.market.domain.common.BaseEntity;
import com.neighborhood.market.domain.order.StoreOrder;
import com.neighborhood.market.domain.user.User;
import com.neighborhood.market.enums.ReportStatus;
import com.neighborhood.market.enums.ReporterType;
import com.neighborhood.market.enums.TargetType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Report extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_order_id", nullable = true)
    private StoreOrder storeOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @Enumerated(EnumType.STRING)
    @Column(name = "reporter_type", nullable = false)
    private ReporterType reporterType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_id", nullable = false)
    private User target;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false)
    private TargetType targetType;

    @Column(name = "reason_detail", nullable = false, columnDefinition = "TEXT")
    private String reasonDetail;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @ColumnDefault("'PENDING'")
    private ReportStatus status;

    @Column(name = "report_result", columnDefinition = "TEXT")
    private String reportResult;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
}
```

---

### 3.11.4 Inquiry

```java
package com.neighborhood.market.domain.support;

import com.neighborhood.market.domain.common.BaseEntity;
import com.neighborhood.market.domain.user.User;
import com.neighborhood.market.enums.InquiryCategory;
import com.neighborhood.market.enums.InquiryStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDateTime;

@Entity
@Table(name = "inquiries")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Inquiry extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private InquiryCategory category;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @ColumnDefault("'PENDING'")
    private InquiryStatus status;

    @Column(name = "answer", columnDefinition = "TEXT")
    private String answer;

    @Column(name = "answered_at")
    private LocalDateTime answeredAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "answered_by", nullable = true)
    private User answeredByUser;
}
```

---

### 3.11.5 InquiryAttachment

```java
package com.neighborhood.market.domain.support;

import com.neighborhood.market.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "inquiry_attachments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class InquiryAttachment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inquiry_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Inquiry inquiry;

    @Column(name = "file_url", nullable = false, length = 500)
    private String fileUrl;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_size", nullable = false)
    private Integer fileSize;

    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;
}
```

---

### 3.11.6 Notice

```java
package com.neighborhood.market.domain.support;

import com.neighborhood.market.domain.common.BaseEntity;
import com.neighborhood.market.domain.user.User;
import com.neighborhood.market.enums.ActiveStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name = "notices")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Notice extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = true)
    private User author;

    @Column(name = "is_pinned", nullable = false)
    @ColumnDefault("false")
    private Boolean isPinned;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @ColumnDefault("'ACTIVE'")
    private ActiveStatus status;
}
```

---

### 3.11.7 Banner

```java
package com.neighborhood.market.domain.support;

import com.neighborhood.market.domain.common.BaseEntity;
import com.neighborhood.market.enums.ActiveStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDateTime;

@Entity
@Table(name = "banners")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Banner extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "link_url", length = 500)
    private String linkUrl;

    @Column(name = "background_color", length = 50)
    private String backgroundColor;

    @Column(name = "display_order", nullable = false)
    @ColumnDefault("0")
    private Integer displayOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @ColumnDefault("'ACTIVE'")
    private ActiveStatus status;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "ended_at", nullable = false)
    private LocalDateTime endedAt;
}
```

---

### 3.11.8 Promotion

```java
package com.neighborhood.market.domain.support;

import com.neighborhood.market.domain.common.BaseEntity;
import com.neighborhood.market.enums.PromotionStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDate;

@Entity
@Table(name = "promotions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Promotion extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "banner_image_url", length = 500)
    private String bannerImageUrl;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @ColumnDefault("'ACTIVE'")
    private PromotionStatus status;
}
```

---

### 3.11.9 PromotionProduct

```java
package com.neighborhood.market.domain.support;

import com.neighborhood.market.domain.common.BaseEntity;
import com.neighborhood.market.domain.product.Product;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(
    name = "promotion_products",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_promotion_products",
            columnNames = {"promotion_id", "product_id"}
        )
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PromotionProduct extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promotion_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Promotion promotion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Product product;

    @Column(name = "sort_order", nullable = false)
    @ColumnDefault("0")
    private Integer sortOrder;
}
```

---

## 참조 Enum 목록 (Part 3)

아래는 Part 3에서 사용되는 Enum 타입 목록입니다. 모든 Enum은 `com.neighborhood.market.enums` 패키지에 위치합니다.

| Enum | 사용 엔티티 | 설명 |
|------|------------|------|
| `SubscriptionProductStatus` | SubscriptionProduct | 구독 상품 상태 (ACTIVE, INACTIVE 등) |
| `SubscriptionStatus` | Subscription | 구독 상태 (ACTIVE, PAUSED, CANCELLED 등) |
| `SubscriptionHistoryStatus` | SubscriptionHistory | 구독 이력 상태 (SCHEDULED, DELIVERED, SKIPPED 등) |
| `SettlementTargetType` | Settlement | 정산 대상 유형 (STORE, RIDER 등) |
| `SettlementStatus` | Settlement | 정산 상태 (PENDING, COMPLETED 등) |
| `ApplicantType` | Approval | 신청자 유형 (STORE, RIDER 등) |
| `ApprovalStatus` | Approval | 승인 상태 (PENDING, APPROVED, REJECTED 등) |
| `ApprovalDocApplicantType` | ApprovalDocument | 서류 신청자 유형 |
| `DocumentType` | ApprovalDocument | 문서 유형 (BUSINESS_LICENSE, ID_CARD 등) |
| `NotificationReferenceType` | Notification | 알림 참조 유형 (ORDER, SUBSCRIPTION 등) |
| `BroadcastReferenceType` | NotificationBroadcast | 전체 알림 대상 (ALL, CUSTOMER, STORE 등) |
| `ReporterType` | Report | 신고자 유형 |
| `TargetType` | Report | 신고 대상 유형 |
| `ReportStatus` | Report | 신고 상태 (PENDING, RESOLVED 등) |
| `InquiryCategory` | Inquiry | 문의 카테고리 |
| `InquiryStatus` | Inquiry | 문의 상태 (PENDING, ANSWERED 등) |
| `ActiveStatus` | Notice, Banner | 활성 상태 (ACTIVE, INACTIVE) |
| `PromotionStatus` | Promotion | 프로모션 상태 (ACTIVE, ENDED 등) |
