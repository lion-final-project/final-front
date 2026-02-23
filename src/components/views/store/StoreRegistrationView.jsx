import React, { useState, useEffect } from 'react';

const APPLICANT_TYPE = 'STORE';
const DOCUMENT_TYPES = {
  businessRegistration: 'BUSINESS_LICENSE',
  mailOrderCertificate: 'BUSINESS_REPORT',
  bankbook: 'BANK_PASSBOOK',
};

const getApiBase = () => import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function InputSection({ label, field, placeholder, type = 'text', required = true, formData, setFormData, errors, setErrors }) {
  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: errors[field] ? '1px solid #ef4444' : 'none' }}>
      <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <input
        type={type}
        required={required}
        placeholder={placeholder || (required ? '필수 입력' : '내 답변 (선택)')}
        value={formData[field]}
        onChange={(e) => {
          setFormData((prev) => ({ ...prev, [field]: e.target.value }));
          if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
        }}
        style={{ width: '100%', padding: '8px 0', border: 'none', borderBottom: errors[field] ? '2px solid #ef4444' : '1px solid #e5e7eb', fontSize: '14px', outline: 'none' }}
        onFocus={(e) => { e.target.style.borderBottom = errors[field] ? '2px solid #ef4444' : '2px solid var(--primary)'; }}
        onBlur={(e) => { e.target.style.borderBottom = errors[field] ? '2px solid #ef4444' : '1px solid #e5e7eb'; }}
      />
      {errors[field] && (
        <div id={`error-${field}`} style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', fontWeight: '600' }}>
          {errors[field]}
        </div>
      )}
    </div>
  );
}

function FileSection({ label, field, hint, files, errors, setErrors, onFileChange }) {
  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: errors[field] ? '1px solid #ef4444' : 'none' }}>
      <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
        {label} <span style={{ color: '#ef4444' }}>*</span>
      </label>
      {hint && <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>{hint}</p>}
      <input
        type="file"
        required
        onChange={(e) => {
          onFileChange(e, field);
          if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
        }}
        style={{ width: '100%', fontSize: '14px', color: '#64748b' }}
      />
      {errors[field] && (
        <div id={`error-${field}`} style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', fontWeight: '600' }}>
          {errors[field]}
        </div>
      )}
      {files[field] && (
        <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>
          ✓ {files[field].name} 등록됨
        </div>
      )}
    </div>
  );
}

function AddressInputSection({
  addressSearchValue,
  setAddressSearchValue,
  onOpenKakaoAddress,
  isSearching,
  formData,
  setFormData,
  errors,
  setErrors,
}) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: errors.address ? '1px solid #ef4444' : 'none',
    }}>
      <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
        매장 주소 <span style={{ color: '#ef4444' }}>*</span>
      </label>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          type="text"
          readOnly
          value={addressSearchValue}
          placeholder="카카오맵 주소 검색으로 주소를 입력하세요"
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc', cursor: 'pointer' }}
          onClick={onOpenKakaoAddress}
        />
        <button
          type="button"
          onClick={onOpenKakaoAddress}
          disabled={isSearching}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            background: isSearching ? '#94a3b8' : 'var(--primary)',
            color: 'white',
            fontWeight: '700',
            cursor: isSearching ? 'not-allowed' : 'pointer',
            fontSize: '14px',
          }}
        >
          {isSearching ? '검색중...' : '주소 검색'}
        </button>
      </div>
      <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>카카오맵 주소 검색 서비스를 이용합니다. 입력란을 클릭하거나 버튼을 눌러 주소를 검색하세요.</p>
      {formData.address && (
        <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '8px', marginBottom: '16px', border: '1px solid #dcfce7' }}>
          <div style={{ fontSize: '14px', color: '#166534', fontWeight: '600', marginBottom: '8px' }}>
            ✓ 선택된 주소: {formData.address}
            {formData.postalCode && (
              <span style={{ marginLeft: '8px', fontSize: '13px', color: '#15803d' }}>(우편번호: {formData.postalCode})</span>
            )}
          </div>
          {formData.latitude != null && formData.longitude != null ? (
            <div style={{
              marginTop: '12px',
              padding: '12px 16px',
              background: '#fff',
              borderRadius: '8px',
              border: '2px solid #22c55e',
              fontSize: '15px',
            }}>
              <div style={{ fontWeight: '700', color: '#166534', marginBottom: '8px', fontSize: '14px' }}>
                📍 카카오 API 좌표 변환 결과
              </div>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', color: '#15803d' }}>
                <span><strong>위도:</strong> {formData.latitude.toFixed(6)}</span>
                <span><strong>경도:</strong> {formData.longitude.toFixed(6)}</span>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '8px', fontSize: '14px', color: '#ca8a04', fontWeight: '500' }}>
              ⏳ 좌표 변환 중...
            </div>
          )}
        </div>
      )}
      <div style={{ marginTop: '16px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#64748b' }}>
          상세주소 <span style={{ fontSize: '12px', fontWeight: '500' }}>(선택)</span>
        </label>
        <input
          type="text"
          placeholder="동, 호수, 상세 주소 등"
          value={formData.addressDetail ?? ''}
          onChange={(e) => setFormData((prev) => ({ ...prev, addressDetail: e.target.value }))}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
          onFocus={(e) => { e.target.style.border = '2px solid var(--primary)'; }}
          onBlur={(e) => { e.target.style.border = '1px solid #e2e8f0'; }}
        />
      </div>
      {errors.address && (
        <div id="error-address" style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', fontWeight: '600' }}>
          {errors.address}
        </div>
      )}
    </div>
  );
}

const StoreRegistrationView = ({ onBack, status, setStatus, setStoreRegistrationStoreName, userId = 1 }) => {
  const [storeCategories, setStoreCategories] = useState([]);
  const [formData, setFormData] = useState({
    category: '',
    companyName: '', // 사업자명
    storeName: '',   // 상호명
    repName: '',     // 대표자명
    contact: '',     // 연락처
    martContact: '', // 마트연락처
    martIntro: '',   // 마트소개
    businessNumber: '', // 사업자등록증 번호
    mailOrderNumber: '', // 통신 판매업 신고번호
    address: '',      // 매장 주소
    addressDetail: '', // 상세주소 (동, 호수 등)
    postalCode: '',   // 우편번호 (주소 검색 시 자동 입력)
    latitude: null,   // 위도
    longitude: null,  // 경도
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    offDays: [],
    weekdayHours: { open: '09:00', close: '22:00' },
    weekendHours: { open: '10:00', close: '21:00' },
    weekdayLastOrder: '21:30',
    weekendLastOrder: '20:30'
  });

  const [errors, setErrors] = useState({});
  const [addressSearchValue, setAddressSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationInfo, setRegistrationInfo] = useState({
    storeName: '',
    representativeName: '',
    status: '',
  });
  const [registrationDetail, setRegistrationDetail] = useState(null);
  const [heldDocumentUrls, setHeldDocumentUrls] = useState({
    businessLicenseUrl: null,
    telecomSalesReportUrl: null,
    bankPassbookUrl: null,
    storeImageUrl: null,
  });

  const [files, setFiles] = useState({
    businessRegistration: null,
    bankbook: null,
    mailOrderCertificate: null,
    storeImage: null
  });

  useEffect(() => {
    const base = getApiBase();
    fetch(`${base}/api/stores/categories`)
      .then((res) => res.ok ? res.json() : Promise.reject(new Error('카테고리 조회 실패')))
      .then((json) => setStoreCategories(Array.isArray(json?.data) ? json.data : []))
      .catch(() => setStoreCategories([]));
  }, []);

  useEffect(() => {
    if (status === 'NONE') return;
    const base = getApiBase();
    fetch(`${base}/api/stores/registration`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const data = json?.data;
        if (!data) return;
        setRegistrationInfo({
          storeName: data.storeName || '',
          representativeName: data.representativeName || '',
          status: data.status || status,
        });
      })
      .catch(() => {});
  }, [status]);

  useEffect(() => {
    if (status === 'NONE') return;
    const base = getApiBase();
    fetch(`${base}/api/stores/registration/detail`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => setRegistrationDetail(json?.data || null))
      .catch(() => setRegistrationDetail(null));
  }, [status]);

  const getStoreStatusLabel = (value) => {
    if (value === 'APPROVED') return '승인';
    if (value === 'PENDING') return '심사 대기';
    if (value === 'REJECTED') return '거절';
    if (value === 'HELD') return '보류';
    return value || '-';
  };

  const toggleOffDay = (day) => {
    setFormData(prev => ({
      ...prev,
      offDays: prev.offDays.includes(day) 
        ? prev.offDays.filter(d => d !== day)
        : [...prev.offDays, day]
    }));
  };

  const handleFileChange = (e, field) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [field]: e.target.files[0] });
    }
  };

  const handleResubmitFromHeld = () => {
    if (!registrationDetail) {
      setStatus('NONE');
      window.scrollTo(0, 0);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      category: registrationDetail.storeCategory || '',
      companyName: registrationDetail.storeOwnerName || '',
      storeName: registrationDetail.storeName || '',
      repName: registrationDetail.representativeName || '',
      contact: registrationDetail.representativePhone || '',
      martContact: registrationDetail.storePhone || '',
      martIntro: registrationDetail.storeDescription || '',
      businessNumber: registrationDetail.businessNumber || '',
      mailOrderNumber: registrationDetail.telecomSalesReportNumber || '',
      address: registrationDetail.addressLine1 || '',
      addressDetail: registrationDetail.addressLine2 || '',
      postalCode: registrationDetail.postalCode || '',
      latitude: registrationDetail.latitude ?? null,
      longitude: registrationDetail.longitude ?? null,
      bankName: registrationDetail.settlementBankName || '',
      accountNumber: registrationDetail.settlementBankAccount || '',
      accountHolder: registrationDetail.settlementAccountHolder || '',
    }));
    setAddressSearchValue(registrationDetail.addressLine1 || '');
    const docs = registrationDetail.documents || {};
    setHeldDocumentUrls({
      businessLicenseUrl: docs.BUSINESS_LICENSE || null,
      telecomSalesReportUrl: docs.BUSINESS_REPORT || null,
      bankPassbookUrl: docs.BANK_PASSBOOK || null,
      storeImageUrl: registrationDetail.storeImageUrl || null,
    });
    setFiles({
      businessRegistration: null,
      bankbook: null,
      mailOrderCertificate: null,
      storeImage: null,
    });
    setErrors({});
    setStatus('NONE');
    window.scrollTo(0, 0);
  };

  // 카카오 Geocoder SDK 로드
  const loadKakaoMap = () => {
    if (window.kakao?.maps?.services?.Geocoder) return Promise.resolve();
    const key = import.meta.env.VITE_KAKAO_APP_KEY;
    if (!key || key === 'your_kakao_javascript_key_here') {
      return Promise.reject(new Error('카카오맵 API 키가 설정되지 않았습니다. .env 파일에 VITE_KAKAO_APP_KEY를 입력해주세요.'));
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&libraries=services&autoload=false`;
      script.onload = () => {
        window.kakao.maps.load(() => resolve());
      };
      script.onerror = () => reject(new Error('카카오맵 스크립트 로드에 실패했습니다.'));
      document.head.appendChild(script);
    });
  };

  // 카카오맵(Daum) 우편번호 + Geocoder로 주소 검색 및 좌표 조회
  const handleOpenKakaoAddress = async () => {
    if (typeof window === 'undefined' || !window.daum?.Postcode) {
      alert('카카오 주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setIsSearching(true);
    new window.daum.Postcode({
      oncomplete: async (data) => {
        const fullAddress = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
        let extraAddress = '';
        if (data.userSelectedType === 'R') {
          if (data.bname !== '') extraAddress += data.bname;
          if (data.buildingName !== '') extraAddress += (extraAddress !== '' ? ', ' + data.buildingName : data.buildingName);
        }
        const finalAddress = fullAddress + (extraAddress ? ' (' + extraAddress + ')' : '');
        const zonecode = data.zonecode || '';

        setFormData(prev => ({
          ...prev,
          address: finalAddress,
          postalCode: zonecode,
          latitude: null,
          longitude: null
        }));
        setAddressSearchValue(finalAddress);

        try {
          await loadKakaoMap();
          const geocoder = new window.kakao.maps.services.Geocoder();
          geocoder.addressSearch(finalAddress, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK && result && result[0]) {
              setFormData(prev => ({
                ...prev,
                address: finalAddress,
                postalCode: prev.postalCode || zonecode,
                latitude: parseFloat(result[0].y),
                longitude: parseFloat(result[0].x)
              }));
            }
            setIsSearching(false);
          });
        } catch (err) {
          console.warn('카카오 Geocoder 좌표 조회 실패:', err.message);
          setIsSearching(false);
        }
      },
      onclose: () => setIsSearching(false)
    }).open();
  };

  const uploadDocument = async (file, documentType) => {
    const base = getApiBase();
    const url = `${base}/api/storage/${userId}/${APPLICANT_TYPE}/${documentType}`;
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(url, { method: 'POST', body: formData, credentials: 'include' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const message = err?.error?.message || err?.message || `파일 업로드 실패: ${documentType}`;
      throw new Error(message);
    }
    const data = await res.json();
    return data.data ?? data.url ?? data.fileUrl ?? data.documentUrl;
  };

  const uploadStoreImage = async (file) => {
    const base = getApiBase();
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${base}/api/storage/store/image?type=PROFILE`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const message = err?.error?.message || err?.message || '마트 대표 사진 업로드 실패';
      throw new Error(message);
    }
    const json = await res.json();
    return json.data ?? json.url;
  };

  const PHONE_REGEX = /^\d{2,3}-\d{3,4}-\d{4}$/;
  const BUSINESS_NUMBER_REGEX = /^\d{3}-\d{2}-\d{5}$/;
  const ACCOUNT_NUMBER_DIGITS_ONLY = /^\d{10,17}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userId == null || userId === undefined) {
      alert('로그인 후 입점 신청이 가능합니다.');
      return;
    }

    const newErrors = {};

    const requiredFields = [
      'category', 'companyName', 'storeName', 'repName', 'contact',
      'businessNumber', 'mailOrderNumber', 'bankName', 'accountNumber', 'accountHolder'
    ];
    requiredFields.forEach(field => {
      if (!formData[field]) newErrors[field] = '필수 입력 항목입니다.';
    });

    if (!formData.address || formData.latitude == null || formData.longitude == null) {
      newErrors.address = '주소 검색으로 매장 주소를 선택해주세요.';
    }

    const accountDigits = (formData.accountNumber || '').replace(/\D/g, '');
    if (formData.accountNumber && !ACCOUNT_NUMBER_DIGITS_ONLY.test(accountDigits)) {
      newErrors.accountNumber = '계좌번호는 숫자만 10~17자리로 입력해주세요.';
    }

    if (!PHONE_REGEX.test(formData.contact)) {
      if (formData.contact) newErrors.contact = '연락처 형식이 올바르지 않습니다. (예: 010-1234-5678)';
    }
    if (formData.martContact && !PHONE_REGEX.test(formData.martContact)) {
      newErrors.martContact = '마트 연락처 형식이 올바르지 않습니다. (예: 02-123-4567 또는 010-1234-5678)';
    }
    if (!BUSINESS_NUMBER_REGEX.test(formData.businessNumber)) {
      if (formData.businessNumber) newErrors.businessNumber = '사업자등록번호 형식이 올바르지 않습니다. (예: 123-45-67890)';
    }

    if (!files.businessRegistration && !heldDocumentUrls.businessLicenseUrl) {
      newErrors.businessRegistration = '사업자등록증을 첨부해주세요.';
    }
    if (!files.bankbook && !heldDocumentUrls.bankPassbookUrl) {
      newErrors.bankbook = '통장 사본을 첨부해주세요.';
    }
    if (!files.mailOrderCertificate && !heldDocumentUrls.telecomSalesReportUrl) {
      newErrors.mailOrderCertificate = '통신판매업 신고증을 첨부해주세요.';
    }
    if (!files.storeImage && !heldDocumentUrls.storeImageUrl) {
      newErrors.storeImage = '마트 대표 사진을 첨부해주세요.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.keys(newErrors)[0];
      const el = document.getElementById(`error-${firstError}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const [businessLicenseUrl, telecomSalesReportUrl, bankPassbookUrl, storeImageUrl] = await Promise.all([
        files.businessRegistration
          ? uploadDocument(files.businessRegistration, DOCUMENT_TYPES.businessRegistration)
          : Promise.resolve(heldDocumentUrls.businessLicenseUrl),
        files.mailOrderCertificate
          ? uploadDocument(files.mailOrderCertificate, DOCUMENT_TYPES.mailOrderCertificate)
          : Promise.resolve(heldDocumentUrls.telecomSalesReportUrl),
        files.bankbook
          ? uploadDocument(files.bankbook, DOCUMENT_TYPES.bankbook)
          : Promise.resolve(heldDocumentUrls.bankPassbookUrl),
        files.storeImage
          ? uploadStoreImage(files.storeImage)
          : Promise.resolve(heldDocumentUrls.storeImageUrl),
      ]);

      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      const businessHours = [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
        const isClosed = formData.offDays.includes(dayNames[dayOfWeek]);
        const hours = (dayOfWeek === 0 || dayOfWeek === 6) ? formData.weekendHours : formData.weekdayHours;
        return {
          dayOfWeek,
          openTime: isClosed ? null : hours.open,
          closeTime: isClosed ? null : hours.close,
          isClosed,
        };
      });

      const accountDigitsOnly = (formData.accountNumber || '').replace(/\D/g, '');
      const payload = {
        storeCategory: formData.category,
        storeOwnerName: formData.companyName,
        storeName: formData.storeName,
        addressLine: formData.address,
        addressLine2: (formData.addressDetail && formData.addressDetail.trim()) ? formData.addressDetail.trim() : null,
        postalCode: (formData.postalCode && formData.postalCode.trim()) ? formData.postalCode.trim() : null,
        latitude: formData.latitude,
        longitude: formData.longitude,
        representativeName: formData.repName,
        representativePhone: formData.contact,
        storePhone: formData.martContact || formData.contact,
        storeDescription: formData.martIntro || '',
        storeImageUrl,
        businessNumber: formData.businessNumber,
        businessLicenseUrl,
        telecomSalesReportNumber: formData.mailOrderNumber,
        telecomSalesReportUrl,
        settlementBankName: formData.bankName,
        settlementBankAccount: accountDigitsOnly,
        settlementAccountHolder: formData.accountHolder,
        bankPassbookUrl,
        regularHolidays: formData.offDays,
        businessHours,
      };

      const base = getApiBase();
      const regRes = await fetch(`${base}/api/stores/registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!regRes.ok) {
        const json = await regRes.json().catch(() => ({}));
        const message = json?.error?.message || json?.message || '입점 신청 등록 실패';
        throw new Error(message);
      }

      const regJson = await regRes.json().catch(() => ({}));
      const data = regJson?.data;
      setStatus(data?.status === 'APPROVED' ? 'APPROVED' : 'PENDING');
      setRegistrationInfo({
        storeName: data?.storeName || formData.storeName || '',
        representativeName: data?.representativeName || formData.repName || '',
        status: data?.status || 'PENDING',
      });
      setHeldDocumentUrls({
        businessLicenseUrl: null,
        telecomSalesReportUrl: null,
        bankPassbookUrl: null,
        storeImageUrl: null,
      });
      if (data?.storeName && setStoreRegistrationStoreName) setStoreRegistrationStoreName(data.storeName);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      alert(err.message || '제출 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusView = () => (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>
          {status === 'APPROVED' ? '🎉' : '⏳'}
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>
          {status === 'APPROVED' ? '입점 승인이 완료되었습니다!' : '입점 심사가 진행 중입니다'}
        </h2>
        <p style={{ color: '#64748b', marginBottom: '32px', lineHeight: '1.6' }}>
          {status === 'APPROVED' 
            ? '이제 사장님 페이지로 전환하여 가게를 관리할 수 있습니다.' 
            : '담당자가 신청 내용을 검토하고 있습니다.\n심사 결과는 영업일 기준 1-3일 내로 알려드립니다.'}
        </p>

        {status === 'APPROVED' ? (
          <button 
            onClick={() => alert('사장님 모드로 전환 기능을 준비중입니다.')}
            className="btn-primary"
            style={{ padding: '16px 32px', fontSize: '16px' }}
          >
            가게 관리 시작하기
          </button>
        ) : (
          <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', fontSize: '14px', color: '#475569' }}>
            <div style={{ fontWeight: '700', marginBottom: '8px' }}>신청 정보</div>
            <div>마트이름: {registrationDetail?.storeName || registrationInfo.storeName || formData.storeName || '-'}</div>
            <div>대표이름: {registrationDetail?.representativeName || registrationInfo.representativeName || formData.repName || '-'}</div>
            <div>승인상태: {getStoreStatusLabel(registrationInfo.status || status)}</div>
            {registrationDetail?.reason && (
              <div style={{ marginTop: '8px' }}>사유: {registrationDetail.reason}</div>
            )}
          </div>
        )}

        {status === 'HELD' && (
          <div style={{ marginTop: '16px' }}>
            <button
              onClick={handleResubmitFromHeld}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #f59e0b',
                color: '#92400e',
                background: '#fffbeb',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              보완 후 재신청
            </button>
          </div>
        )}
        
      </div>
      <button 
        onClick={onBack}
        style={{ marginTop: '24px', background: 'none', border: 'none', color: '#64748b', fontWeight: '600', cursor: 'pointer' }}
      >
        홈으로 돌아가기
      </button>
    </div>
  );

  if (status !== 'NONE') {
    return renderStatusView();
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '40px 20px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', borderTop: '10px solid var(--primary)', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px' }}>상점 입점 신청</h1>
          <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>
            동네마켓과 함께 성장할 사장님의 참여를 기다립니다.<br/>
            모든 입점 서류를 정확하게 입력 및 첨부해주세요. 담당자 확인 후 연락드리겠습니다.
          </p>
          <div style={{ marginTop: '16px', fontSize: '12px', color: '#ef4444' }}>* 모든 항목은 필수작성 사항입니다.</div>
        </div>

        {/* Form Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: errors.category ? '1px solid #ef4444' : 'none' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              카테고리 선택 <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select 
              required
              value={formData.category}
              onChange={(e) => {
                setFormData({...formData, category: e.target.value});
                if (errors.category) setErrors({...errors, category: null});
              }}
              style={{ width: '100%', padding: '12px', borderRadius: '4px', border: errors.category ? '1px solid #ef4444' : '1px solid #d1d5db', fontSize: '14px' }}
            >
              <option value="">선택</option>
              {storeCategories.map((cat) => (
                <option key={cat.id} value={cat.categoryName}>{cat.categoryName}</option>
              ))}
            </select>
            {errors.category && (
              <div id="error-category" style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', fontWeight: '600' }}>
                {errors.category}
              </div>
            )}
          </div>

          <InputSection label="상호명" field="storeName" placeholder="동네마켓 앱에 노출될 상호명을 입력해주세요" formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} />
          <AddressInputSection
            addressSearchValue={addressSearchValue}
            setAddressSearchValue={setAddressSearchValue}
            onOpenKakaoAddress={handleOpenKakaoAddress}
            isSearching={isSearching}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
          <InputSection label="대표자명" field="repName" formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} />
          <InputSection label="대표자 연락처" field="contact" placeholder="010-0000-0000" formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} />
          <InputSection label="마트 연락처" field="martContact" placeholder="02-000-0000 또는 010-0000-0000" required={false} formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} />
          
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              마트 소개
            </label>
            <textarea 
              placeholder="마트에 대한 간단한 소개를 입력해주세요 (선택)"
              value={formData.martIntro}
              onChange={(e) => setFormData({...formData, martIntro: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px', minHeight: '100px', outline: 'none' }}
              onFocus={(e) => e.target.style.border = '2px solid var(--primary)'}
              onBlur={(e) => e.target.style.border = '1px solid #d1d5db'}
            />
          </div>

          <FileSection label="마트 대표 사진 첨부" field="storeImage" hint="매장 전경이나 간판이 잘 보이는 사진" files={files} errors={errors} setErrors={setErrors} onFileChange={handleFileChange} />

          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: (errors.companyName || errors.businessNumber || errors.businessRegistration) ? '1px solid #ef4444' : 'none' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>사업자 정보</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>사업자명 <span style={{ color: '#ef4444' }}>*</span></label>
                <input required type="text" value={formData.companyName} onChange={(e)=>{setFormData({...formData, companyName: e.target.value}); if(errors.companyName) setErrors({...errors, companyName: null});}} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: errors.companyName ? '1px solid #ef4444' : '1px solid #e2e8f0' }} placeholder="사업자등록증상의 사업자명을 입력해주세요" />
                {errors.companyName && <div id="error-companyName" style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', fontWeight: '600' }}>{errors.companyName}</div>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>사업자등록번호 <span style={{ color: '#ef4444' }}>*</span></label>
                <input required type="text" value={formData.businessNumber} onChange={(e)=>{setFormData({...formData, businessNumber: e.target.value}); if(errors.businessNumber) setErrors({...errors, businessNumber: null});}} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: errors.businessNumber ? '1px solid #ef4444' : '1px solid #e2e8f0' }} placeholder="000-00-00000 (- 포함)" />
                {errors.businessNumber && <div id="error-businessNumber" style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', fontWeight: '600' }}>{errors.businessNumber}</div>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>사업자등록증 첨부 <span style={{ color: '#ef4444' }}>*</span></label>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>사업자등록증 원본 스캔본 또는 사진</p>
                <input type="file" required onChange={(e)=>{handleFileChange(e, 'businessRegistration'); if(errors.businessRegistration) setErrors({...errors, businessRegistration: null});}} style={{ width: '100%', fontSize: '14px', color: '#64748b' }} />
                {errors.businessRegistration && <div id="error-businessRegistration" style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', fontWeight: '600' }}>{errors.businessRegistration}</div>}
                {files.businessRegistration && <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>✓ {files.businessRegistration.name} 등록됨</div>}
              </div>
            </div>
          </div>

          <InputSection label="통신판매업 신고번호" field="mailOrderNumber" placeholder="제 2024-서울강남-0000 호" formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} />
          <FileSection label="통신판매업 신고증 첨부" field="mailOrderCertificate" files={files} errors={errors} setErrors={setErrors} onFileChange={handleFileChange} />

          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginTop: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>정산 계좌 정보</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>은행명 <span style={{ color: '#ef4444' }}>*</span></label>
                <input required type="text" value={formData.bankName} onChange={(e)=>{setFormData({...formData, bankName: e.target.value}); if(errors.bankName) setErrors({...errors, bankName: null});}} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: errors.bankName ? '1px solid #ef4444' : '1px solid #e2e8f0' }} placeholder="OO은행" />
                {errors.bankName && <div id="error-bankName" style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', fontWeight: '600' }}>{errors.bankName}</div>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>계좌번호 <span style={{ color: '#ef4444' }}>*</span></label>
                <input required type="text" value={formData.accountNumber} onChange={(e)=>{setFormData({...formData, accountNumber: e.target.value}); if(errors.accountNumber) setErrors({...errors, accountNumber: null});}} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: errors.accountNumber ? '1px solid #ef4444' : '1px solid #e2e8f0' }} placeholder="- 없이 입력" />
                {errors.accountNumber && <div id="error-accountNumber" style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', fontWeight: '600' }}>{errors.accountNumber}</div>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>예금주 <span style={{ color: '#ef4444' }}>*</span></label>
                <input required type="text" value={formData.accountHolder} onChange={(e)=>{setFormData({...formData, accountHolder: e.target.value}); if(errors.accountHolder) setErrors({...errors, accountHolder: null});}} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: errors.accountHolder ? '1px solid #ef4444' : '1px solid #e2e8f0' }} />
                {errors.accountHolder && <div id="error-accountHolder" style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', fontWeight: '600' }}>{errors.accountHolder}</div>}
              </div>
            </div>
          </div>
          <FileSection label="통장 사본 첨부" field="bankbook" hint="본인 명의(또는 사업자 명의) 통장 사본" files={files} errors={errors} setErrors={setErrors} onFileChange={handleFileChange} />

          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              정기 휴무일
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['월', '화', '수', '목', '금', '토', '일'].map(day => (
                <div 
                  key={day}
                  onClick={() => toggleOffDay(day)}
                  style={{ 
                    padding: '8px 16px', borderRadius: '20px', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '14px', fontWeight: '700',
                    backgroundColor: formData.offDays.includes(day) ? 'var(--primary)' : 'white',
                    color: formData.offDays.includes(day) ? 'white' : '#64748b',
                    transition: 'all 0.2s'
                  }}
                >
                  {day}요일
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              운영 시간 <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>평일</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <input type="time" required value={formData.weekdayHours.open} onChange={(e) => setFormData({...formData, weekdayHours: {...formData.weekdayHours, open: e.target.value}})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                       <input type="time" required value={formData.weekdayHours.close} onChange={(e) => setFormData({...formData, weekdayHours: {...formData.weekdayHours, close: e.target.value}})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>주말</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <input type="time" required value={formData.weekendHours.open} onChange={(e) => setFormData({...formData, weekendHours: {...formData.weekendHours, open: e.target.value}})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                       <input type="time" required value={formData.weekendHours.close} onChange={(e) => setFormData({...formData, weekendHours: {...formData.weekendHours, close: e.target.value}})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{ 
                padding: '16px 32px', fontSize: '16px', borderRadius: '12px', fontWeight: '800',
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? '제출 중...' : '입점 신청서 제출하기'}
            </button>
            <button 
              type="button"
              onClick={() => {
                if(window.confirm('작성 중인 내용이 모두 사라집니다. 초기화하시겠습니까?')){
                  window.location.reload();
                }
              }}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
            >
              양식 지우기
            </button>
          </div>
        </form>
        <button 
          onClick={onBack}
          style={{ marginTop: '40px', background: 'none', border: 'none', color: '#64748b', fontSize: '13px', cursor: 'pointer', display: 'block', width: '100%' }}
        >
          ← 이전 페이지로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default StoreRegistrationView;
