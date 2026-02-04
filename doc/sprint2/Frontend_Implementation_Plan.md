# Sprint 2: 프론트엔드 구현 계획서

## 📌 개요
본 문서는 Sprint 2 기간 동안 진행될 프론트엔드 통합 작업의 상세 구현 단계를 정의합니다. 백엔드 TODO 리스트(`final-back/myMd/sprint2/TODO.md`)와 연동하여, React와 Spring Boot 간의 실제 통신 체계를 구축하는 것을 목표로 합니다.

**구현 범위:**
1.  인프라 설정 (Axios)
2.  인증 연동 (로컬/테스트 인증 API)
3.  스토리지 연동 (파일 업로드)
4.  라이더 기능 (등록 신청 및 상태 변경)

---

## 🏗️ 1. 인프라 설정

### 1.1 라이브러리 설치
- **명령어:** `npm install axios`
- **목적:** Promise 기반의 HTTP 클라이언트를 사용하여 백엔드와 통신.

### 1.2 Axios 설정 (`src/api/axios.js`)
공통 설정(Base URL, Credentials 등)을 관리하기 위한 중앙 집중식 Axios 인스턴스를 생성합니다.

```javascript
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8080', // 백엔드 서버 주소
  withCredentials: true, // 중요: 교차 출처(CORS) 상황에서 쿠키(JSESSIONID) 전송 허용
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터: ApiResponse 구조 단순화
instance.interceptors.response.use(
  (response) => {
    // 백엔드 공통 응답 포맷인 ApiResponse의 'data' 필드만 반환
    // 백엔드 포맷: { status: "success", message: "...", data: {...} }
    return response.data;
  },
  (error) => {
    // 전역 에러 처리 (예: 401 권한 없음)
    console.error('API 에러:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default instance;
```

---

## 🔐 2. 인증(Auth) 연동

정식 User 도메인이 완성되기 전까지는 `forLocal` 패키지의 테스트용 API를 사용합니다.

### 2.1 테스트 인증 API (`src/api/testAuthApi.js`)
구현할 엔드포인트:
- `signup(signupData)`: POST `/api/v1/test/signup`
- `login(loginData)`: POST `/api/v1/test/login`
- `logout()`: POST `/api/v1/test/logout`
- `me()`: GET `/api/v1/test/me` (세션 복구용)

### 2.2 컴포넌트 업데이트
- **`AuthModal.jsx`**:
    - 기존의 시뮬레이션(setTimeout)을 실제 `signup()` 및 `login()` 호출로 대체합니다.
    - 로그인 성공 시, 사용자 정보(id, name, email)를 `App.jsx`로 전달합니다.
- **`App.jsx`**:
    - 앱 로드 시(`useEffect`) `me()` API를 호출하여 기존 세션이 있는지 확인합니다.
    - 세션이 유효하면 `isLoggedIn(true)` 상태와 사용자 정보를 설정합니다.

---

## ☁️ 3. 스토리지 연동 (파일 업로드)

라이더 등록 신청 시 증빙 서류(면허증, 안전 교육 이수증 등) 업로드가 필요합니다.

### 3.1 스토리지 API (`src/api/storageApi.js`)
- `uploadFile(userId, applicantType, docType, file)`: POST `/api/storage/{userId}/{applicantType}/{documentType}`
- **참고:** `multipart/form-data` 형식으로 전송해야 합니다. Axios에 `FormData` 객체를 전달하면 자동으로 설정됩니다.

```javascript
import axios from './axios';

export const uploadFile = async (userId, applicantType, docType, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(
    `/api/storage/${userId}/${applicantType}/${docType}`, 
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data; // 업로드된 파일의 URL 반환
};
```

---

## 🛵 4. 라이더 도메인 연동

### 4.1 라이더 API (`src/api/riderApi.js`)
- `registerRider(requestData)`: POST `/api/riders/register`
- `updateRiderStatus(status)`: PATCH `/api/riders/status`

### 4.2 등록 프로세스 (`RiderRegistrationView.jsx`)
1.  **사용자 입력:** 텍스트 필드와 3개의 이미지 파일(프로필, 면허증, 교육 이수증)을 수집합니다.
2.  **제출 핸들러:**
    - **Step 1:** 각 이미지에 대해 `storageApi.uploadFile`을 호출합니다.
    - **Step 2:** 반환된 각 파일의 URL을 수집합니다.
    - **Step 3:** 수집된 URL을 포함하여 `registerRider` 요청 객체(JSON)를 생성합니다.
    - **Step 4:** `riderApi.registerRider`를 호출하여 최종 등록을 마칩니다.
3.  **피드백:** 성공 메시지를 표시하고 상태를 업데이트합니다.

### 4.3 대시보드 상태 관리 (`RiderDashboard.jsx`)
- 운행 시작/종료 토글 버튼을 `updateRiderStatus('ON_WORK' | 'OFF_WORK')` API와 연결합니다.

---

## 📅 구현 체크리스트

- [ ] `npm install axios`
- [ ] `src/api/axios.js` 생성
- [ ] `src/api/testAuthApi.js` 생성
- [ ] `src/api/storageApi.js` 생성
- [ ] `src/api/riderApi.js` 생성
- [ ] `App.jsx` 리팩토링 (세션 확인 로직 추가)
- [ ] `AuthModal.jsx` 리팩토링 (로그인/회원가입 API 연결)
- [ ] `RiderRegistrationView.jsx` 리팩토링 (파일 업로드 + 등록 로직)
- [ ] `RiderDashboard.jsx` 리팩토링 (상태 변경 API 연결)