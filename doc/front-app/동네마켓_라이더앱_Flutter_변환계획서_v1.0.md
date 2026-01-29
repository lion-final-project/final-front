# 동네마켓 라이더 앱 Flutter 변환 계획서 v1.0

| 항목 | 내용 |
|------|------|
| **문서 버전** | v1.0 |
| **작성일** | 2026-01-30 |
| **변환 대상** | `src/components/RiderDashboard.jsx` (990줄, React 19) |
| **변환 목표** | Flutter 3.x 기반 iOS/Android 네이티브 모바일 앱 |
| **상태** | 계획 단계 |

---

## 1. 개요

### 1.1 변환 배경

현재 동네마켓 라이더 대시보드는 React 19 웹 컴포넌트(`RiderDashboard.jsx`)로 구현되어 있다. 배달원은 모바일 환경에서 주로 작업하므로, 네이티브 앱으로 전환하여 다음을 확보한다:

- GPS/위치 서비스 네이티브 접근
- 카메라 직접 접근 (배달 완료 사진 촬영)
- 푸시 알림 (새 배달 요청 실시간 수신)
- 백그라운드 위치 추적
- 오프라인 지원

### 1.2 기술 스택

| 구분 | 현재 (React Web) | 변환 후 (Flutter) |
|------|------------------|------------------|
| **프레임워크** | React 19 + Vite 7 | Flutter 3.x + Dart 3.x |
| **상태 관리** | `useState` (20+ 훅) | Provider (ChangeNotifier) |
| **스타일링** | 인라인 `style={{ }}` | `ThemeData` + `BoxDecoration` |
| **지도** | SVG 시뮬레이션 | `CustomPaint` 또는 `google_maps_flutter` |
| **사진** | `<input type="file">` | `image_picker` 패키지 |
| **애니메이션** | CSS transition / `@keyframes` | `AnimatedContainer` / `AnimationController` |
| **네비게이션** | 상태 기반 탭 전환 | `BottomNavigationBar` + `IndexedStack` |
| **다이얼로그** | 조건부 렌더링 `<div>` | `showDialog()` / `showModalBottomSheet()` |

### 1.3 변환 범위 요약

| 항목 | 수량 |
|------|------|
| 화면/탭 | 5개 (홈, 히스토리, 정산, 계정, 로그인) |
| 재사용 위젯 | 7개 |
| 다이얼로그/모달 | 4개 |
| 데이터 모델 | 5개 |
| Provider | 1개 |
| 총 Dart 파일 (예상) | ~20개 |

---

## 2. 현재 React 컴포넌트 분석

### 2.1 컴포넌트 구조

```
RiderDashboard.jsx (990줄)
├── MapSimulator (서브 컴포넌트, 1~61줄)
│   └── SVG 경로 애니메이션 + 펄싱 점 + 라이더 아이콘
│
├── RiderDashboard (메인 컴포넌트, 62~989줄)
│   ├── State (20+ useState 훅, 63~95줄)
│   ├── Event Handlers (97~189줄)
│   │   ├── handleToggleOnline()
│   │   ├── handleDeleteVehicle()
│   │   ├── handleAcceptRequest()
│   │   ├── nextStep()
│   │   ├── handleCompleteDelivery()
│   │   ├── handlePhotoSelect()
│   │   └── toggleHistoryExpand()
│   │
│   ├── renderActiveView() (191~612줄) — 탭별 렌더링
│   │   ├── case 'earnings' (203~251줄) — 정산 내역
│   │   ├── case 'history' (252~347줄) — 배달 히스토리
│   │   ├── case 'account' (348~417줄) — 계정 관리
│   │   ├── case 'login' (418~461줄) — 로그인
│   │   └── default 'main' (462~611줄) — 홈 (가장 복잡)
│   │
│   └── JSX Return (614~989줄)
│       ├── <header> — 로고 + 온라인 토글 (634~688줄)
│       ├── Modals — 메시지/사진/영수증/차량추가 (692~850줄)
│       ├── <BottomNav> — 5개 탭 (852~893줄)
│       ├── CompletionNotification — 상단 배너 (895~926줄)
│       └── StatusPopup — 상태 변경 팝업 (928~954줄)
```

### 2.2 상태(State) 목록

| # | React useState | 타입 | 용도 | Flutter 매핑 |
|---|---------------|------|------|-------------|
| 1 | `activeTab` | `string` | 현재 탭 ('main', 'history', 'earnings', 'account', 'login') | `int _currentTabIndex` |
| 2 | `isOnline` | `boolean` | 운행 중/불가 | `bool _isOnline` |
| 3 | `activeDeliveries` | `array` | 진행 중 배달 목록 | `List<Delivery>` |
| 4 | `earnings` | `object` | 오늘/주간 수익 `{ today, weekly }` | `int _todayEarnings`, `int _weeklyEarnings` |
| 5 | `showMsgModal` | `boolean` | 메시지 모달 표시 | `showDialog()` 호출로 대체 |
| 6 | `completionNotification` | `object\|null` | 배달 완료 알림 `{ fee }` | `SnackBar` 또는 `OverlayEntry` |
| 7 | `showPhotoUploadModal` | `boolean` | 사진 업로드 모달 | `showDialog()` 호출로 대체 |
| 8 | `uploadingDeliveryId` | `string\|null` | 사진 업로드 대상 배달 ID | `String? _uploadingDeliveryId` |
| 9 | `deliveryPhoto` | `string\|null` | 업로드된 사진 (base64) | `String? _photoPath` (파일 경로) |
| 10 | `verificationStatus` | `string` | 신원 인증 상태 | `VerificationStatus enum` |
| 11 | `vehicleInfo` | `object` | 차량 번호판 | `Vehicle` 모델 내 포함 |
| 12 | `historyFilter` | `string` | 히스토리 필터 (today/week/month) | `String _historyFilter` |
| 13 | `expandedHistoryItems` | `Set` | 확장된 히스토리 항목 | `Set<String>` |
| 14 | `selectedReceipt` | `object\|null` | 선택된 영수증 | `showDialog()` 호출로 대체 |
| 15 | `expandedSettlements` | `Set` | 확장된 정산 항목 | `Set<int>` |
| 16 | `registeredVehicles` | `array` | 등록된 운송 수단 | `List<Vehicle>` |
| 17 | `activeVehicleId` | `number` | 현재 사용 중 차량 | `int _activeVehicleId` |
| 18 | `showAddVehicleModal` | `boolean` | 차량 추가 모달 | `showDialog()` 호출로 대체 |
| 19 | `statusPopup` | `object\|null` | 상태 변경 팝업 | `showDialog()` 호출로 대체 |

> **핵심**: React의 모달 표시용 `boolean` 상태 5개(`showMsgModal`, `showPhotoUploadModal`, `selectedReceipt`, `showAddVehicleModal`, `statusPopup`)는 Flutter에서 `showDialog()`/`showModalBottomSheet()` 호출로 대체되어 상태 변수가 불필요해진다.

### 2.3 디자인 시스템 (다크 테마)

```
색상 팔레트:
┌─────────────────────────────────────────────────┐
│  #0f172a  ████████  배경 (Darkest)              │
│  #1e293b  ████████  카드/섹션 배경              │
│  #334155  ████████  보더/구분선                  │
│  #475569  ████████  비활성 보더                  │
│  #64748b  ████████  비활성 텍스트               │
│  #94a3b8  ████████  보조 텍스트                 │
│  #cbd5e1  ████████  일반 텍스트                 │
│  #ffffff  ████████  강조 텍스트                 │
│                                                  │
│  #10b981  ████████  Primary (Emerald Green)      │
│  #38bdf8  ████████  Secondary (Sky Blue)         │
│  #ef4444  ████████  Error (Red)                  │
│  #f59e0b  ████████  Warning (Amber)              │
│  #f1c40f  ████████  Badge (Yellow)               │
│  #2ecc71  ████████  Success (Green)              │
└─────────────────────────────────────────────────┘

타이포그래피:
- 폰트: Pretendard (한국어 최적화)
- 제목: 20~28px, fontWeight 800~900
- 본문: 14~16px, fontWeight 600~700
- 캡션: 10~13px, fontWeight 700~800

모서리: 10~24px borderRadius
그림자: 0 4px 20px rgba(0,0,0,0.2~0.3)
```

### 2.4 화면별 기능 상세

#### 2.4.1 홈 탭 (default/main)
- 오늘의 배달 수익 카드 (금액 + 완료 건수)
- 진행 중 배달 카드 (최대 3건)
  - 4단계 Step Indicator (수락 → 픽업 → 배송중 → 완료)
  - 픽업지/목적지 정보 + 고객 연락처
  - MapSimulator (SVG 경로 애니메이션)
  - 메시지 전송 버튼 + 다음 단계 버튼
- 주변 배달 요청 리스트 (최대 3건 미만일 때 표시)
  - 매장명, 주소, 목적지, 거리, 배달비
  - 수락 버튼
- 최대 배달 수량(3건) 도달 시 경고 카드

#### 2.4.2 히스토리 탭 (history)
- 필터 토글: 오늘 / 1주일 / 한달
- 필터별 총 수익 표시
- 배달 이력 카드 리스트
  - 날짜/시간, 상태 뱃지 (배달완료/취소됨)
  - 매장 → 목적지
  - 확장 상세 (주문번호, 품목, 고객 마스킹)
  - 수익 금액 + 영수증 보기 버튼

#### 2.4.3 정산 탭 (earnings)
- 이번 주 정산 예정 금액 카드 (정산일, 정산 계좌)
- 최근 정산 기록 리스트
  - 금액, 기간, 입금 상태
  - 확장 상세 (배달 건수)

#### 2.4.4 계정 탭 (account)
- 운전면허/신원 확인 상태 카드
- 내 운송 수단 관리
  - 등록된 차량 리스트 (도보/자전거/오토바이)
  - 사용 중 표시 + 삭제 버튼
  - 추가 버튼 → 차량 추가 모달
- 로그아웃 버튼

#### 2.4.5 로그인 탭 (login)
- 아이디/휴대폰 번호 입력
- 비밀번호 입력
- 로그인 버튼
- 아이디 찾기 / 비밀번호 찾기 / 회원가입 링크

---

## 3. Flutter 프로젝트 설계

### 3.1 개발 환경

```bash
# Flutter SDK 설치 (macOS)
brew install flutter

# 프로젝트 생성
flutter create neighborhood_rider
cd neighborhood_rider

# 환경 확인
flutter doctor
```

### 3.2 패키지 의존성 (`pubspec.yaml`)

```yaml
name: neighborhood_rider
description: 동네마켓 라이더 앱
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

  # 상태 관리
  provider: ^6.1.2

  # 카메라/갤러리 사진 선택 (배달 완료 인증)
  image_picker: ^1.0.7

  # 숫자/날짜 포맷 (React toLocaleString() 대체)
  intl: ^0.19.0

  # 지도 (MapSimulator 고도화 시 선택)
  google_maps_flutter: ^2.6.1

  # 이미지 캐싱
  cached_network_image: ^3.3.1

  # 위치 서비스 (향후 실시간 위치 추적)
  geolocator: ^11.0.0
  permission_handler: ^11.3.0

  # 푸시 알림 (향후 배달 요청 수신)
  firebase_messaging: ^14.9.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
```

### 3.3 프로젝트 구조

```
lib/
├── main.dart                         # 앱 진입점 (MaterialApp + Provider 설정)
│
├── theme/
│   └── rider_theme.dart              # 다크 테마 정의
│
├── models/                           # 데이터 모델
│   ├── delivery.dart                 # Delivery + DeliveryStatus enum
│   ├── delivery_request.dart         # DeliveryRequest (배달 요청)
│   ├── vehicle.dart                  # Vehicle + VehicleType enum
│   ├── earning.dart                  # Earning (수익/정산)
│   └── history_item.dart             # HistoryItem (배달 이력)
│
├── providers/                        # 상태 관리
│   └── rider_provider.dart           # RiderProvider (ChangeNotifier)
│
├── screens/                          # 화면
│   └── rider_dashboard_screen.dart   # 메인 Scaffold + AppBar + BottomNav
│
├── tabs/                             # 탭 화면 (5개)
│   ├── home_tab.dart                 # 홈 (수익요약, 진행중 배달, 요청)
│   ├── history_tab.dart              # 히스토리 (필터, 이력 리스트)
│   ├── earnings_tab.dart             # 정산 (정산금액, 기록)
│   ├── account_tab.dart              # 계정 (신원확인, 차량관리)
│   └── login_tab.dart                # 로그인 (폼)
│
├── widgets/                          # 재사용 위젯 (7개)
│   ├── map_simulator.dart            # CustomPaint 지도 시뮬레이터
│   ├── delivery_card.dart            # 진행 중 배달 카드
│   ├── delivery_request_card.dart    # 배달 요청 카드
│   ├── step_indicator.dart           # 4단계 진행 표시기
│   ├── online_toggle.dart            # 운행 토글 스위치
│   ├── completion_banner.dart        # 배달 완료 상단 알림
│   └── status_popup.dart             # 상태 변경 팝업
│
└── dialogs/                          # 다이얼로그 (4개)
    ├── message_dialog.dart           # 메시지 템플릿
    ├── photo_upload_dialog.dart      # 사진 업로드
    ├── receipt_dialog.dart           # 영수증
    └── add_vehicle_dialog.dart       # 운송 수단 추가
```

### 3.4 파일별 역할 및 React 매핑

| Flutter 파일 | 역할 | React 원본 위치 (줄 번호) |
|-------------|------|--------------------------|
| `main.dart` | 앱 진입점, Provider 등록 | - |
| `rider_theme.dart` | 색상/폰트/테마 정의 | 인라인 style 전체 |
| `delivery.dart` | 배달 모델 + 상태 enum | `deliveryRequests` (125~128줄) |
| `vehicle.dart` | 차량 모델 | `registeredVehicles` (84~92줄) |
| `rider_provider.dart` | 전체 상태 관리 | useState 20개 (63~95줄) + 핸들러 (97~189줄) |
| `rider_dashboard_screen.dart` | Scaffold + AppBar + BottomNav | header (634~688줄) + bottomNav (852~893줄) |
| `home_tab.dart` | 홈 탭 UI | renderActiveView default (462~611줄) |
| `history_tab.dart` | 히스토리 탭 UI | case 'history' (252~347줄) |
| `earnings_tab.dart` | 정산 탭 UI | case 'earnings' (203~251줄) |
| `account_tab.dart` | 계정 탭 UI | case 'account' (348~417줄) |
| `login_tab.dart` | 로그인 탭 UI | case 'login' (418~461줄) |
| `map_simulator.dart` | 지도 시뮬레이터 | MapSimulator (3~61줄) |
| `delivery_card.dart` | 진행 중 배달 카드 | activeDeliveries.map (490~564줄) |
| `delivery_request_card.dart` | 배달 요청 카드 | deliveryRequests.map (573~599줄) |
| `step_indicator.dart` | 4단계 표시기 | step indicator JSX (498~532줄) |
| `online_toggle.dart` | 온라인 토글 | toggle button (661~687줄) |
| `completion_banner.dart` | 완료 알림 | completionNotification (895~926줄) |
| `status_popup.dart` | 상태 팝업 | statusPopup (928~954줄) |
| `message_dialog.dart` | 메시지 모달 | showMsgModal (693~722줄) |
| `photo_upload_dialog.dart` | 사진 업로드 | showPhotoUploadModal (725~772줄) |
| `receipt_dialog.dart` | 영수증 | selectedReceipt (775~806줄) |
| `add_vehicle_dialog.dart` | 차량 추가 | showAddVehicleModal (809~850줄) |

---

## 4. React → Flutter 핵심 개념 매핑

### 4.1 기본 개념

| React 개념 | Flutter 대응 | 설명 |
|-----------|-------------|------|
| `function Component()` | `StatefulWidget` 클래스 | 상태를 가진 UI 단위 |
| `useState(value)` | State 클래스 필드 + `setState()` | 상태 변경 시 UI 리빌드 |
| `props` | 생성자 매개변수 | `Widget({required this.prop})` |
| JSX `<div>` | `Container`, `Column`, `Row` | Widget 트리로 구성 |
| `<div style={{ display: 'flex', flexDirection: 'column' }}>` | `Column()` | 세로 정렬 |
| `<div style={{ display: 'flex', justifyContent: 'space-between' }}>` | `Row(mainAxisAlignment: MainAxisAlignment.spaceBetween)` | 가로 정렬 |
| `onClick` | `onTap` (GestureDetector) / `onPressed` (Button) | 터치 이벤트 |
| `style={{ ... }}` | `BoxDecoration`, `TextStyle`, `EdgeInsets` | 스타일 객체 |
| CSS `position: fixed` | `Scaffold` 구조 또는 `Stack` + `Positioned` | 고정 위치 |
| `useState` 배열 | `List<T>` 필드 | 타입 안전 리스트 |
| `new Set()` | `Set<T>` | 동일 |
| 삼항 연산자 `? :` | 동일 (`? :`) | Dart도 동일 지원 |
| `array.map()` → JSX | `list.map().toList()` → Widget 리스트 | `.toList()` 필수 |
| `alert()` | `showDialog()` / `ScaffoldMessenger.showSnackBar()` | 다이얼로그/스낵바 |
| 조건부 렌더링 `{show && <Modal />}` | `showDialog()` / `showModalBottomSheet()` | Flutter 내장 모달 시스템 |
| CSS `transition` | `AnimatedContainer` | 암시적 애니메이션 |
| CSS `@keyframes` | `AnimationController` + `Tween` | 명시적 애니메이션 |
| `toLocaleString()` | `NumberFormat('#,###').format(value)` (intl 패키지) | 숫자 포맷 |

### 4.2 스타일 변환 예시

```
React:
style={{
  backgroundColor: '#1e293b',
  padding: '24px',
  borderRadius: '20px',
  marginBottom: '24px',
  border: '1px solid #334155'
}}

Flutter:
Container(
  padding: const EdgeInsets.all(24),
  margin: const EdgeInsets.only(bottom: 24),
  decoration: BoxDecoration(
    color: const Color(0xFF1E293B),
    borderRadius: BorderRadius.circular(20),
    border: Border.all(color: const Color(0xFF334155)),
  ),
)
```

### 4.3 이벤트 핸들러 변환 예시

```
React:
<button onClick={() => handleAcceptRequest(req)}>배달 수락</button>

Flutter:
ElevatedButton(
  onPressed: () => context.read<RiderProvider>().acceptDelivery(delivery),
  child: const Text('배달 수락'),
)
```

---

## 5. 핵심 코드 설계

### 5.1 테마 정의 (`rider_theme.dart`)

```dart
import 'package:flutter/material.dart';

class RiderColors {
  static const background = Color(0xFF0F172A);
  static const cardBackground = Color(0xFF1E293B);
  static const border = Color(0xFF334155);
  static const borderInactive = Color(0xFF475569);
  static const textInactive = Color(0xFF64748B);
  static const textSecondary = Color(0xFF94A3B8);
  static const textPrimary = Color(0xFFCBD5E1);
  static const textWhite = Color(0xFFFFFFFF);

  static const primary = Color(0xFF10B981);      // Emerald
  static const primaryDark = Color(0xFF059669);
  static const secondary = Color(0xFF38BDF8);     // Sky Blue
  static const error = Color(0xFFEF4444);
  static const warning = Color(0xFFF59E0B);
  static const badge = Color(0xFFF1C40F);
  static const success = Color(0xFF2ECC71);
}

class RiderTheme {
  static ThemeData get darkTheme => ThemeData(
    brightness: Brightness.dark,
    scaffoldBackgroundColor: RiderColors.background,
    cardColor: RiderColors.cardBackground,
    primaryColor: RiderColors.primary,
    colorScheme: const ColorScheme.dark(
      primary: RiderColors.primary,
      secondary: RiderColors.secondary,
      surface: RiderColors.cardBackground,
      error: RiderColors.error,
      outline: RiderColors.border,
    ),
    fontFamily: 'Pretendard',
    appBarTheme: const AppBarTheme(
      backgroundColor: RiderColors.background,
      elevation: 0,
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: RiderColors.cardBackground,
      selectedItemColor: RiderColors.primary,
      unselectedItemColor: RiderColors.textSecondary,
    ),
  );
}
```

### 5.2 데이터 모델

#### `delivery.dart`
```dart
enum DeliveryStatus { accepted, pickup, delivering, done }

class Delivery {
  final String id;
  final String store;
  final String storeAddress;
  final String destination;
  final String distance;
  final int fee;
  final String customerPhone;
  DeliveryStatus status;

  Delivery({
    required this.id,
    required this.store,
    required this.storeAddress,
    required this.destination,
    required this.distance,
    required this.fee,
    required this.customerPhone,
    this.status = DeliveryStatus.accepted,
  });
}
```

#### `vehicle.dart`
```dart
enum VehicleType { walking, bicycle, motorcycle, car }

class Vehicle {
  final int id;
  final VehicleType type;
  final String model;
  final String plate;
  final bool isVerified;

  Vehicle({
    required this.id,
    required this.type,
    this.model = '',
    this.plate = '',
    this.isVerified = true,
  });

  String get typeLabel {
    switch (type) {
      case VehicleType.walking: return '도보';
      case VehicleType.bicycle: return '자전거';
      case VehicleType.motorcycle: return '오토바이';
      case VehicleType.car: return '승용차';
    }
  }

  String get typeEmoji {
    switch (type) {
      case VehicleType.walking: return '🚶';
      case VehicleType.bicycle: return '🚲';
      case VehicleType.motorcycle: return '🛵';
      case VehicleType.car: return '🚗';
    }
  }
}
```

#### `history_item.dart`
```dart
class HistoryItem {
  final String id;
  final String store;
  final String destination;
  final String time;
  final int fee;
  final String items;
  final String customer;
  final String status;    // '배달완료' | '취소됨'
  final String dateGroup; // 'today' | 'week' | 'month'

  HistoryItem({
    required this.id,
    required this.store,
    required this.destination,
    required this.time,
    required this.fee,
    required this.items,
    required this.customer,
    required this.status,
    required this.dateGroup,
  });

  bool get isCompleted => status == '배달완료';
  bool get isCancelled => status == '취소됨';
}
```

### 5.3 상태 관리 (`rider_provider.dart`)

```dart
import 'package:flutter/foundation.dart';

class RiderProvider extends ChangeNotifier {
  // === 탭 상태 ===
  int _currentTabIndex = 0;
  int get currentTabIndex => _currentTabIndex;
  void setTab(int index) {
    _currentTabIndex = index;
    notifyListeners();
  }

  // === 온라인 상태 ===
  bool _isOnline = true;
  bool get isOnline => _isOnline;

  /// 온라인 토글. 진행 중 배달이 있으면 에러 반환.
  /// returns: null=성공, String=에러 메시지
  String? toggleOnline() {
    if (_isOnline && _activeDeliveries.isNotEmpty) {
      return '진행 중인 배달이 있습니다.\n모두 완료 후 운행을 종료해주세요.';
    }
    _isOnline = !_isOnline;
    notifyListeners();
    return null;
  }

  // === 배달 관련 ===
  final List<Delivery> _activeDeliveries = [];
  List<Delivery> get activeDeliveries => List.unmodifiable(_activeDeliveries);

  void acceptDelivery(Delivery delivery) {
    if (_activeDeliveries.any((d) => d.id == delivery.id)) return;
    _activeDeliveries.add(delivery);
    notifyListeners();
  }

  /// 다음 단계로 진행. 'delivering' 상태에서는 사진 업로드 필요.
  /// returns: true=사진 업로드 필요, false=정상 진행
  bool nextStep(String deliveryId) {
    final idx = _activeDeliveries.indexWhere((d) => d.id == deliveryId);
    if (idx == -1) return false;

    switch (_activeDeliveries[idx].status) {
      case DeliveryStatus.accepted:
        _activeDeliveries[idx].status = DeliveryStatus.pickup;
        notifyListeners();
        return false;
      case DeliveryStatus.pickup:
        _activeDeliveries[idx].status = DeliveryStatus.delivering;
        notifyListeners();
        return false;
      case DeliveryStatus.delivering:
        return true; // 사진 업로드 모달 필요
      default:
        return false;
    }
  }

  /// 배달 완료 처리. 수익 적립 후 목록에서 제거.
  int? completeDelivery(String deliveryId) {
    final idx = _activeDeliveries.indexWhere((d) => d.id == deliveryId);
    if (idx == -1) return null;
    final fee = _activeDeliveries[idx].fee;
    _todayEarnings += fee;
    _activeDeliveries.removeAt(idx);
    notifyListeners();
    return fee;
  }

  // === 수익 ===
  int _todayEarnings = 48500;
  int get todayEarnings => _todayEarnings;
  int _weeklyEarnings = 342000;
  int get weeklyEarnings => _weeklyEarnings;

  // === 차량 관리 ===
  final List<Vehicle> _vehicles = [];
  List<Vehicle> get vehicles => List.unmodifiable(_vehicles);
  int _activeVehicleId = 1;
  int get activeVehicleId => _activeVehicleId;

  void setActiveVehicle(int id) {
    _activeVehicleId = id;
    notifyListeners();
  }

  void addVehicle(Vehicle vehicle) {
    _vehicles.add(vehicle);
    notifyListeners();
  }

  String? deleteVehicle(int id) {
    if (_activeVehicleId == id) {
      return '현재 운행 중인 수단은 삭제할 수 없습니다.';
    }
    _vehicles.removeWhere((v) => v.id == id);
    notifyListeners();
    return null;
  }

  // === 히스토리 ===
  String _historyFilter = 'today';
  String get historyFilter => _historyFilter;
  final Set<String> _expandedHistoryItems = {};
  Set<String> get expandedHistoryItems => Set.unmodifiable(_expandedHistoryItems);
  final Set<int> _expandedSettlements = {};
  Set<int> get expandedSettlements => Set.unmodifiable(_expandedSettlements);

  void setHistoryFilter(String filter) {
    _historyFilter = filter;
    notifyListeners();
  }

  void toggleHistoryExpand(String id) {
    if (_expandedHistoryItems.contains(id)) {
      _expandedHistoryItems.remove(id);
    } else {
      _expandedHistoryItems.add(id);
    }
    notifyListeners();
  }

  void toggleSettlementExpand(int index) {
    if (_expandedSettlements.contains(index)) {
      _expandedSettlements.remove(index);
    } else {
      _expandedSettlements.add(index);
    }
    notifyListeners();
  }
}
```

### 5.4 메인 화면 구조 (`rider_dashboard_screen.dart`)

```dart
class RiderDashboardScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<RiderProvider>(
      builder: (context, provider, _) => Scaffold(
        appBar: AppBar(
          title: GestureDetector(
            onTap: () => provider.setTab(0),
            child: Text(
              '동네마켓 Rider',
              style: TextStyle(
                color: RiderColors.secondary,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
          actions: [
            // 온라인 상태 표시 + 토글
            OnlineToggle(
              isOnline: provider.isOnline,
              onToggle: () {
                final error = provider.toggleOnline();
                if (error != null) {
                  // 에러 팝업 표시
                  showDialog(...);
                }
              },
            ),
          ],
        ),
        body: !provider.isOnline && provider.currentTabIndex == 0
            ? _buildOfflineView()
            : IndexedStack(
                index: provider.currentTabIndex,
                children: const [
                  HomeTab(),
                  HistoryTab(),
                  EarningsTab(),
                  AccountTab(),
                  LoginTab(),
                ],
              ),
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: provider.currentTabIndex,
          onTap: provider.setTab,
          type: BottomNavigationBarType.fixed,
          items: const [
            BottomNavigationBarItem(icon: Text('🏠'), label: '홈'),
            BottomNavigationBarItem(icon: Text('📋'), label: '히스토리'),
            BottomNavigationBarItem(icon: Text('💰'), label: '정산'),
            BottomNavigationBarItem(icon: Text('👤'), label: '마이페이지'),
            BottomNavigationBarItem(icon: Text('🔐'), label: '로그인'),
          ],
        ),
      ),
    );
  }
}
```

### 5.5 MapSimulator (`map_simulator.dart`)

```dart
class MapSimulator extends StatefulWidget {
  final DeliveryStatus status;
  const MapSimulator({super.key, required this.status});

  @override
  State<MapSimulator> createState() => _MapSimulatorState();
}

class _MapSimulatorState extends State<MapSimulator>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _progress;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 1),
      vsync: this,
    );
    _updateProgress();
  }

  void _updateProgress() {
    final target = switch (widget.status) {
      DeliveryStatus.accepted => 0.0,
      DeliveryStatus.pickup => 0.33,
      DeliveryStatus.delivering => 0.66,
      DeliveryStatus.done => 1.0,
    };
    _progress = Tween<double>(
      begin: _progress.value,
      end: target,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
    _controller.forward(from: 0);
  }

  @override
  void didUpdateWidget(MapSimulator old) {
    super.didUpdateWidget(old);
    if (old.status != widget.status) _updateProgress();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 160,
      decoration: BoxDecoration(
        color: RiderColors.background,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: RiderColors.border),
      ),
      child: AnimatedBuilder(
        animation: _progress,
        builder: (context, _) => CustomPaint(
          painter: _MapPainter(progress: _progress.value),
          size: Size.infinite,
        ),
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}

class _MapPainter extends CustomPainter {
  final double progress;
  _MapPainter({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    // 그리드 패턴
    final gridPaint = Paint()
      ..color = RiderColors.secondary.withOpacity(0.1)
      ..strokeWidth = 1;
    for (var x = 0.0; x < size.width; x += 20) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
    }
    for (var y = 0.0; y < size.height; y += 20) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }

    // 경로
    final path = Path()
      ..moveTo(40, 40)
      ..lineTo(120, 40)
      ..lineTo(120, 120)
      ..lineTo(300, 120);

    // 배경 경로
    canvas.drawPath(path, Paint()
      ..color = RiderColors.border
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round);

    // 진행 경로 (dashOffset 시뮬레이션)
    // PathMetrics를 사용하여 progress만큼 그리기
    final metrics = path.computeMetrics().first;
    final extractPath = metrics.extractPath(0, metrics.length * progress);
    canvas.drawPath(extractPath, Paint()
      ..color = RiderColors.primary
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round);
  }

  @override
  bool shouldRepaint(_MapPainter old) => old.progress != progress;
}
```

### 5.6 사진 업로드 다이얼로그 (`photo_upload_dialog.dart`)

```dart
import 'dart:io';
import 'package:image_picker/image_picker.dart';

class PhotoUploadDialog extends StatefulWidget {
  final String deliveryId;
  final VoidCallback onComplete;

  const PhotoUploadDialog({
    super.key,
    required this.deliveryId,
    required this.onComplete,
  });

  @override
  State<PhotoUploadDialog> createState() => _PhotoUploadDialogState();
}

class _PhotoUploadDialogState extends State<PhotoUploadDialog> {
  String? _photoPath;

  Future<void> _pickPhoto(ImageSource source) async {
    final picker = ImagePicker();
    final image = await picker.pickImage(
      source: source,
      maxWidth: 1024,
      imageQuality: 80,
    );
    if (image != null) {
      setState(() => _photoPath = image.path);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: RiderColors.cardBackground,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('배달 완료 인증',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            Text('반드시 배송 완료 사진을 촬영해 첨부해야 합니다.',
              style: TextStyle(color: RiderColors.textSecondary, fontSize: 14)),
            const SizedBox(height: 24),

            // 사진 미리보기 영역
            GestureDetector(
              onTap: () => _showSourcePicker(),
              child: Container(
                height: 200,
                decoration: BoxDecoration(
                  color: RiderColors.background,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: RiderColors.border,
                    style: BorderStyle.solid,
                    width: 2,
                  ),
                ),
                child: _photoPath != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(14),
                        child: Image.file(File(_photoPath!), fit: BoxFit.cover),
                      )
                    : const Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text('📷', style: TextStyle(fontSize: 24)),
                            SizedBox(height: 8),
                            Text('사진을 등록해주세요',
                              style: TextStyle(fontWeight: FontWeight.w700)),
                          ],
                        ),
                      ),
              ),
            ),
            const SizedBox(height: 24),

            // 제출 버튼
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _photoPath != null ? widget.onComplete : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: _photoPath != null
                      ? RiderColors.secondary
                      : RiderColors.border,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: const Text('배송 완료 제출',
                  style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
              ),
            ),

            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('취소',
                style: TextStyle(color: RiderColors.textSecondary)),
            ),
          ],
        ),
      ),
    );
  }

  void _showSourcePicker() {
    showModalBottomSheet(
      context: context,
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('카메라로 촬영'),
              onTap: () {
                Navigator.pop(context);
                _pickPhoto(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('갤러리에서 선택'),
              onTap: () {
                Navigator.pop(context);
                _pickPhoto(ImageSource.gallery);
              },
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 6. 구현 순서 (Phases)

### Phase 1: 프로젝트 기반 구축
| 순서 | 작업 | 파일 | 비고 |
|------|------|------|------|
| 1 | Flutter 프로젝트 생성 | `flutter create` | |
| 2 | 패키지 설치 | `pubspec.yaml` | `flutter pub get` |
| 3 | 테마 정의 | `rider_theme.dart` | 색상 7개 + ThemeData |
| 4 | 데이터 모델 작성 | `models/*.dart` (5개) | Delivery, Vehicle, HistoryItem 등 |
| 5 | Provider 작성 | `rider_provider.dart` | 전체 상태 + 비즈니스 로직 |

### Phase 2: 화면 구성
| 순서 | 작업 | 파일 | React 줄 수 |
|------|------|------|------------|
| 6 | 메인 Scaffold | `rider_dashboard_screen.dart` | header+nav ~100줄 |
| 7 | 홈 탭 | `home_tab.dart` | ~150줄 (가장 복잡) |
| 8 | 히스토리 탭 | `history_tab.dart` | ~100줄 |
| 9 | 정산 탭 | `earnings_tab.dart` | ~50줄 |
| 10 | 계정 탭 | `account_tab.dart` | ~70줄 |
| 11 | 로그인 탭 | `login_tab.dart` | ~45줄 |

### Phase 3: 위젯 구현
| 순서 | 작업 | 파일 | 복잡도 |
|------|------|------|--------|
| 12 | MapSimulator | `map_simulator.dart` | 높음 (CustomPainter + Animation) |
| 13 | StepIndicator | `step_indicator.dart` | 중간 |
| 14 | DeliveryCard | `delivery_card.dart` | 중간 |
| 15 | DeliveryRequestCard | `delivery_request_card.dart` | 낮음 |
| 16 | OnlineToggle | `online_toggle.dart` | 낮음 |
| 17 | CompletionBanner | `completion_banner.dart` | 중간 (OverlayEntry) |
| 18 | StatusPopup | `status_popup.dart` | 낮음 |

### Phase 4: 다이얼로그 구현
| 순서 | 작업 | 파일 | 복잡도 |
|------|------|------|--------|
| 19 | MessageDialog | `message_dialog.dart` | 낮음 |
| 20 | PhotoUploadDialog | `photo_upload_dialog.dart` | 높음 (image_picker) |
| 21 | ReceiptDialog | `receipt_dialog.dart` | 낮음 |
| 22 | AddVehicleDialog | `add_vehicle_dialog.dart` | 낮음 |

### Phase 5: 마무리
| 순서 | 작업 | 비고 |
|------|------|------|
| 23 | 애니메이션 보강 | pulse, slideDown, popup-in |
| 24 | iOS/Android 테스트 | 시뮬레이터/에뮬레이터 |
| 25 | 카메라 권한 설정 | `Info.plist` (iOS), `AndroidManifest.xml` |

---

## 7. 플랫폼별 설정

### 7.1 iOS (`ios/Runner/Info.plist`)
```xml
<key>NSCameraUsageDescription</key>
<string>배달 완료 사진 촬영을 위해 카메라 접근이 필요합니다.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>배달 완료 사진 선택을 위해 갤러리 접근이 필요합니다.</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>배달 경로 안내를 위해 위치 접근이 필요합니다.</string>
```

### 7.2 Android (`android/app/src/main/AndroidManifest.xml`)
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

### 7.3 빌드 및 실행
```bash
# 개발 실행
flutter run -d ios          # iOS 시뮬레이터
flutter run -d android      # Android 에뮬레이터

# 릴리스 빌드
flutter build apk           # Android APK
flutter build appbundle     # Android AAB (Play Store)
flutter build ios            # iOS (Xcode 필요)
```

---

## 8. 향후 확장 계획

| 기능 | 패키지 | 설명 |
|------|--------|------|
| 실시간 위치 추적 | `geolocator` | 배달 중 라이더 위치 서버 전송 |
| 푸시 알림 | `firebase_messaging` | 새 배달 요청 실시간 수신 |
| 실제 지도 | `google_maps_flutter` | MapSimulator → Google Maps 전환 |
| 턴바이턴 내비게이션 | `flutter_polyline_points` | 경로 안내 |
| 실시간 채팅 | `web_socket_channel` | 고객-라이더 직접 채팅 |
| 오프라인 캐시 | `hive` 또는 `sqflite` | 네트워크 없을 때 데이터 저장 |
| 딥링크 | `uni_links` | 알림 → 특정 배달 화면 이동 |

---

## 부록: React vs Flutter 아키텍처 비교

| 항목 | React (현재) | Flutter (변환 후) |
|------|-------------|------------------|
| 파일 수 | **1개** (990줄) | **~20개** (역할 분리) |
| 상태 관리 | 20+ `useState` | 1개 `Provider` (`ChangeNotifier`) |
| 스타일링 | 인라인 `style={{ }}` | `ThemeData` + `BoxDecoration` |
| 애니메이션 | CSS `transition` / `@keyframes` | `AnimatedContainer` / `AnimationController` |
| 지도 | SVG 시뮬레이션 | `CustomPaint` 또는 `google_maps_flutter` |
| 사진 업로드 | `<input type="file">` | `image_picker` 패키지 |
| 다이얼로그 | 조건부 렌더링 `<div>` | `showDialog()` / `showModalBottomSheet()` |
| 네비게이션 | 상태 기반 탭 전환 | `BottomNavigationBar` + `IndexedStack` |
| 타입 안전성 | JavaScript (dynamic) | Dart (static typing) |
| 플랫폼 | 웹 브라우저 | iOS + Android 네이티브 |
