import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getNotices, createNotice, updateNotice, deleteNotice } from '../../../api/noticeApi';
import { getFaqsForAdmin, createFaq, updateFaq, deleteFaq } from '../../../api/faqApi';
import { getAdminInquiries, getAdminInquiryDetail, answerInquiry } from '../../../api/inquiryApi';
import { formatDate, formatDateLocale, mapStoreApprovalItem, mapRiderApprovalItem, extractDocument } from './utils/adminDashboardUtils';
import RecordDetailModal from './modals/RecordDetailModal';
import ApprovalDetailModal from './modals/ApprovalDetailModal';
import NoticeModal from './modals/NoticeModal';
import FaqModal from './modals/FaqModal';
import BannerModal from './modals/BannerModal';
import Pagination from '../../ui/Pagination';
import OverviewTab from './tabs/OverviewTab';
import StoresTab from './tabs/StoresTab';
import RidersTab from './tabs/RidersTab';
import UsersTab from './tabs/UsersTab';
import InquiryTab from './tabs/InquiryTab';
import CmsTab from './tabs/CmsTab';
import PaymentsTab from './tabs/PaymentsTab';
import SettlementsTab from './tabs/SettlementsTab';
import ApprovalsTab from './tabs/ApprovalsTab';
import NotificationsTab from './tabs/NotificationsTab';
import ReportsTab from './tabs/ReportsTab';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const authHeader = () => ({});

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [paymentMonthFilter, setPaymentMonthFilter] = useState('2026-01');
  const [settlementMonthFilter, setSettlementMonthFilter] = useState('2026-01');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [approvalFilter, setApprovalFilter] = useState('ALL'); // ALL, STORE, RIDER
  const [approvalItems, setApprovalItems] = useState([]);
  const approvalFetchErrorShownRef = useRef(false);

  const [stores, setStores] = useState([
    { 
      id: 'ST001', name: '행복 마트 강남점', loc: '역삼동', status: '정상', rep: '김행복', phone: '010-1234-5678', bizNum: '123-45-67890', bank: '국민은행 110-***-123456',
      category: '대형 마트', 
      intro: '지역 주민들에게 사랑받는 정직한 마트입니다. 매일 신선한 상품을 최적의 가격에 제공합니다.',
      bankDetails: { bank: '국민은행', account: '110-123-456789', holder: '김행복' }
    },
    { 
      id: 'ST002', name: '무림 정육점', loc: '삼성동', status: '정상', rep: '이무림', phone: '010-2222-3333', bizNum: '220-11-55555', bank: '신한은행 100-***-999888',
      category: '정육/축산',
      intro: '30년 전통의 노하우로 최상급 고기만을 선별하여 판매합니다.',
      bankDetails: { bank: '신한은행', account: '1002-999-888777', holder: '이무림' }
    },
    { 
      id: 'ST003', name: '싱싱 야채 센터', loc: '역삼동', status: '비활성', rep: '박싱싱', phone: '010-9999-8888', bizNum: '333-22-11111', bank: '우리은행 1002-***-444555',
      category: '과일/채소',
      intro: '농장 직송 신선함을 그대로 식탁까지 전달해 드립니다.',
      bankDetails: { bank: '우리은행', account: '1002-111-222333', holder: '박싱싱' }
    }
  ]);
  const [users, setUsers] = useState([
    { 
      id: 'USR001', name: '김지현', email: 'jihyun@example.com', phone: '010-1111-2222',
      addresses: ['강남구 삼성동 123-45', '강남구 역삼동 99-1'],
      orders: 24, join: '2023.11.12', status: '활성', type: 'USER' 
    },
    { 
      id: 'USR002', name: '박준영', email: 'junyoung@gmail.com', phone: '010-3333-4444',
      addresses: ['서초구 방배동 888', '서초구 서초동 77'],
      orders: 12, join: '2023.12.05', status: '활성', type: 'USER' 
    },
    { 
      id: 'USR003', name: '최수진', email: 'sujin_ch@naver.com', phone: '010-5555-6666',
      addresses: ['마포구 성산동 55-2'],
      orders: 5, join: '2024.01.10', status: '정지', type: 'USER' 
    },
    { 
      id: 'USR004', name: '이민호', email: 'minho_lee@kakao.com', phone: '010-7777-8888',
      addresses: ['송파구 잠실동 10-10', '송파구 가락동 22'],
      orders: 42, join: '2023.08.15', status: '활성', type: 'USER' 
    },
    { 
      id: 'USR005', name: '정다은', email: 'daeun_j@outlook.com', phone: '010-9999-0000',
      addresses: ['강동구 천호동 456'],
      orders: 8, join: '2024.01.20', status: '활성', type: 'USER' 
    }
  ]);


  const [reports, setReports] = useState([
    { 
      id: 1, type: '배송지연', status: '확인 중', time: '1시간 전', content: '예상 시간보다 30분이나 늦게 도착했습니다. 고기가 좀 녹았어요.',
      orderNo: 'ORD-20260127-001',
      reporter: { type: 'USER', name: '김서연', contact: '010-1111-2222' },
      reported: { type: 'STORE', name: '무림 정육점', contact: '010-2222-3333' }
    },
    { 
      id: 2, type: '상품불량', status: '처리완료', time: '3시간 전', content: '사과에 멍이 너무 많이 들어있습니다. 교환 요청합니다.',
      orderNo: 'ORD-20260126-042',
      reporter: { type: 'USER', name: '이영희', contact: '010-3333-4444' },
      reported: { type: 'STORE', name: '행복 마트', contact: '010-1234-5678' },
      resolution: '마트 측과 확인하여 전액 환불 및 교환권 발급해 드렸습니다.'
    },
    { 
      id: 3, type: '불친절', status: '확인 중', time: '5시간 전', content: '라이더분이 너무 퉁명스럽게 물건을 던지듯 주고 가셨습니다.',
      orderNo: 'ORD-20260127-015',
      reporter: { type: 'USER', name: '최수진', contact: '010-5555-6666' },
      reported: { type: 'RIDER', name: '김철수', contact: '010-9999-8888' }
    },
    { 
      id: 4, type: '정산문제', status: '확인 중', time: '1일 전', content: '이번 주 정산 내역이 실제 매출과 다릅니다. 확인 부탁드려요.',
      orderNo: '-',
      reporter: { type: 'STORE', name: '행복 마트', contact: '010-1234-5678' },
      reported: { type: 'ADMIN', name: '어드민', contact: '-' }
    }
  ]);

  const [riders, setRiders] = useState([
    { 
      id: 'RID001', name: '김철수', status: '운행중', type: 'PROFESSIONAL', 
      phone: '010-1234-5678', bankName: '신한은행', accountNumber: '110-123-456789', accountHolder: '김철수', idCardStatus: '완료'
    },
    { 
      id: 'RID002', name: '이영희', status: '운행 불가', type: 'RESIDENT', 
      phone: '010-2222-3333', bankName: '우리은행', accountNumber: '1002-999-888777', accountHolder: '이영희', idCardStatus: '완료'
    },
    { 
      id: 'RID003', name: '박민수', status: '운행 불가', type: 'RESIDENT', 
      phone: '010-4444-5555', bankName: '하나은행', accountNumber: '123-456-789012', accountHolder: '박민수', idCardStatus: '확인중'
    },
    { 
      id: 'RID004', name: '최현우', status: '운행중', type: 'PROFESSIONAL', 
      phone: '010-8888-9999', bankName: '국민은행', accountNumber: '110-999-000000', accountHolder: '최현우', idCardStatus: '완료'
    }
  ]);

  const [approvalStatusFilter, setApprovalStatusFilter] = useState('ALL'); // ALL, PENDING, HOLD

  const [chartPeriod, setChartPeriod] = useState('weekly'); // weekly, monthly, yearly
  const [reportsFilter, setReportsFilter] = useState('ALL'); // ALL, RESOLVED, UNRESOLVED
  const [reportsSearch, setReportsSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [resolutionMessage, setResolutionMessage] = useState('');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentRegionFilter, setPaymentRegionFilter] = useState('ALL');
  const [settlementSearch, setSettlementSearch] = useState('');
  const [settlementStatusFilter, setSettlementStatusFilter] = useState('ALL');
  const [inquiryFilter, setInquiryFilter] = useState('ALL'); // ALL, PENDING, COMPLETED

  const [faqs, setFaqs] = useState([]);

  const [settlementFilter, setSettlementFilter] = useState('STORE'); // STORE, RIDER
  const [settlements, setSettlements] = useState([
    { id: 'SET101', name: '행복 마트 강남점', type: 'STORE', amount: 4500000, date: '2026.01.20', status: '정산완료' },
    { id: 'SET102', name: '김철수 라이더', type: 'RIDER', amount: 350000, date: '2026.01.21', status: '정산예정' },
    { id: 'SET103', name: '무림 정육점', type: 'STORE', amount: 2800000, date: '2026.01.21', status: '정산완료' }
  ]);

  const [detailedSettlements, setDetailedSettlements] = useState([
    { id: 'SET001', name: '그린 프레시 마트 강남점', id_code: 'MT-90234', region: '서울 / 강남구', amount: 12450000, date: '2023-11-22', status: '지급 완료', color: '#10b981' },
    { id: 'SET002', name: '베스트 푸드 센터 홍대점', id_code: 'MT-11209', region: '서울 / 마포구', amount: 8920000, date: '2023-11-22', status: '지급 처리중', color: '#38bdf8' },
    { id: 'SET003', name: '하나로 연신내 유통', id_code: 'MT-88712', region: '서울 / 은평구', amount: 4150000, date: '2023-11-25', status: '승인 대기', color: '#f59e0b' },
    { id: 'SET004', name: '데일리 마트 일산점', id_code: 'MT-33410', region: '경기 / 고양시', amount: 21080000, date: '2023-11-22', status: '지급 완료', color: '#10b981' },
    { id: 'SET005', name: '스마트 유통 분당본점', id_code: 'MT-76621', region: '경기 / 성남시', amount: 15300000, date: '2023-11-22', status: '지급 실패', color: '#ef4444' }
  ]);

  const [riderSettlements, setRiderSettlements] = useState([
    { id: 'RSET001', name: '김철수 라이더', id_code: 'RD-00123', region: '서울 / 강남구', amount: 850000, date: '2023-11-22', status: '지급 완료', color: '#10b981' },
    { id: 'RSET002', name: '이영희 라이더', id_code: 'RD-00554', region: '서울 / 마포구', amount: 1240000, date: '2023-11-22', status: '지급 처리중', color: '#38bdf8' },
    { id: 'RSET003', name: '박민수 라이더', id_code: 'RD-00921', region: '서울 / 송파구', amount: 980000, date: '2023-11-25', status: '승인 대기', color: '#f59e0b' },
    { id: 'RSET004', name: '최현우 라이더', id_code: 'RD-11223', region: '서울 / 송파구', amount: 1560000, date: '2023-11-22', status: '지급 완료', color: '#10b981' }
  ]);

  const [paymentHistory, setPaymentHistory] = useState([
    { region: '서울', category: '신선 식품', mart: '신선마트 강남점', amount: 42500000, commission: 4250000, status: '지급완료' },
    { region: '서울', category: '일반 식품', mart: '유기농마켓 서초', amount: 31200000, commission: 3120000, status: '지급대기' },
    { region: '서울', category: '신선 식품', mart: '데일리푸드 송파', amount: 28450000, commission: 2845000, status: '지급완료' },
    { region: '경기', category: '일반 식품', mart: '프레시팜 판교', amount: 19800000, commission: 1980000, status: '지급대기' }
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, approvalFilter, approvalStatusFilter, reportsFilter, settlementFilter, userSearch, inquiryFilter]);

  const [selectedReport, setSelectedReport] = useState(null);
  const [inquiryList, setInquiryList] = useState([]);
  const [inquiryPage, setInquiryPage] = useState(0);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [inquiryAnswer, setInquiryAnswer] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  const getCategoryLabel = (category) => {
    const labels = {
      'ORDER_PAYMENT': '주문/결제 문의',
      'CANCELLATION_REFUND': '취소/환불 문의',
      'DELIVERY': '배송 문의',
      'SERVICE': '서비스 이용 문의',
      'OTHER': '기타'
    };
    return labels[category] || category;
  };

  const fetchInquiries = useCallback(async () => {
    try {
      const status = inquiryFilter === 'ALL' ? null : (inquiryFilter === 'PENDING' ? 'PENDING' : 'ANSWERED');
      const page = await getAdminInquiries(status, inquiryPage, itemsPerPage);
      const list = (page.content || []).map(inq => ({
        inquiryId: inq.inquiryId,
        id: inq.inquiryId,
        type: getCategoryLabel(inq.category),
        category: inq.category,
        title: inq.title,
        user: inq.customerName,
        date: formatDateLocale(inq.createdAt),
        status: inq.status === 'ANSWERED' ? '답변 완료' : '답변 대기',
        statusEnum: inq.status
      }));
      setInquiryList(list);
    } catch (err) {
      console.error('문의 목록 조회 실패:', err);
    }
  }, [inquiryFilter, inquiryPage, itemsPerPage]);

  const fetchInquiryDetail = async (inquiryId) => {
    try {
      const detail = await getAdminInquiryDetail(inquiryId);
      setSelectedInquiry({
        id: inquiryId,
        type: getCategoryLabel(detail.category),
        category: detail.category,
        title: detail.title,
        content: detail.content,
        user: detail.customerName,
        email: detail.email,
        contact: detail.phone,
        date: formatDateLocale(detail.createdAt),
        status: detail.status === 'ANSWERED' ? '답변 완료' : '답변 대기',
        statusEnum: detail.status,
        answer: detail.answer || null,
        fileUrl: detail.fileUrl || null,
        attachments: detail.fileUrl ? [detail.fileUrl] : []
      });
    } catch (err) {
      console.error('문의 상세 조회 실패:', err);
      alert('문의 상세 정보를 불러오는데 실패했습니다.');
    }
  };

  useEffect(() => {
    if (activeTab === 'inquiry') {
      fetchInquiries();
    }
  }, [activeTab, inquiryFilter, inquiryPage, fetchInquiries]);

  const [noticeList, setNoticeList] = useState([]);

  const fetchNotices = useCallback(async () => {
    try {
      const page = await getNotices(0, 100);
      const list = (page.content || []).map(n => ({
        id: n.noticeId,
        title: n.title,
        content: n.content,
        date: n.createdAt ? n.createdAt.substring(0, 10).replace(/-/g, '.') : '',
      }));
      setNoticeList(list);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const fetchFaqs = useCallback(async () => {
    try {
      const page = await getFaqsForAdmin(0, 100);
      const list = (page.content || []).map(f => ({
        id: f.faqId,
        question: f.question,
        answer: f.answer,
      }));
      setFaqs(list);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [currentNotice, setCurrentNotice] = useState(null);

  const [bannerList, setBannerList] = useState([
    { id: 1, title: '겨울철 비타민 충전!', content: '신선한 과일로 면역력을 높이세요', img: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80', promotion: '제철 과일 기획전', color: 'linear-gradient(45deg, #ff9a9e, #fad0c4)', status: '노출 중' },
    { id: 2, title: '따끈따끈 밀키트', content: '집에서 즐기는 맛집 요리', img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80', promotion: '한겨울 밀키트 대전', color: 'linear-gradient(120deg, #a1c4fd, #c2e9fb)', status: '노출 중' }
  ]);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);

  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false);
  const [currentFAQ, setCurrentFAQ] = useState(null);

  const [promotions, setPromotions] = useState([
    { 
      id: 1, 
      title: '제철 과일 기획전', 
      period: '2024.01.20 - 2024.02.20', 
      status: '진행 중',
      description: '겨울철 신선한 산지직송 과일을 만나보세요. 제주 한라봉부터 상큼한 산청 딸기까지!',
      bannerImg: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80',
      products: [
        { name: '제주 한라봉 3kg', price: '25,000원', stock: 50, sales: 120 },
        { name: '영동 사과 5kg', price: '32,000원', stock: 30, sales: 85 },
        { name: '산청 딸기 500g', price: '12,000원', stock: 100, sales: 210 }
      ]
    },
    { 
      id: 2, 
      title: '한겨울 밀키트 대전', 
      period: '2024.01.15 - 2024.01.31', 
      status: '진행 중',
      description: '따끈한 국물 요리부터 간편한 홈파티 메뉴까지! 집에서 즐기는 맛집 요리.',
      bannerImg: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
      products: [
        { name: '부대찌개 밀키트', price: '15,900원', stock: 80, sales: 156 },
        { name: '감바스 알 아히요', price: '18,500원', stock: 45, sales: 92 },
        { name: '소고기 샤브샤브', price: '24,000원', stock: 20, sales: 64 }
      ]
    }
  ]);
  const [selectedPromotion, setSelectedPromotion] = useState(null);

  const [notificationHistory, setNotificationHistory] = useState([
    { id: 1, title: '설 연휴 배송 지연 안내', target: '전체 사용자', date: '2024.01.20 14:00', status: '발송 완료' },
    { id: 2, title: '신규 가입 쿠폰 증정 이벤트', target: '전체 고객', date: '2024.01.15 10:00', status: '발송 완료' },
    { id: 3, title: '시스템 점검 안내', target: '전체 사용자', date: '2024.01.10 02:00', status: '발송 완료' }
  ]);

  
  const fetchApprovals = async () => {
    try {
      const [storeResponse, riderResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/stores/approvals?status=PENDING&status=HELD&status=REJECTED`, {
          headers: { ...authHeader() },
          credentials: 'include'
        }),
        fetch(`${API_BASE_URL}/api/admin/riders/approvals?status=PENDING&status=HELD&status=REJECTED`, {
          headers: { ...authHeader() },
          credentials: 'include'
        })
      ]);
      if (!storeResponse.ok || !riderResponse.ok) {
        throw new Error('Failed to load approvals');
      }
      const storePayload = await storeResponse.json();
      const riderPayload = await riderResponse.json();
      const storeItems = (storePayload.data || []).map(mapStoreApprovalItem);
      const riderItems = (riderPayload.data || []).map(mapRiderApprovalItem);
      setApprovalItems([...storeItems, ...riderItems]);
    } catch (error) {
      if (!approvalFetchErrorShownRef.current) {
        approvalFetchErrorShownRef.current = true;
        alert('승인 목록을 불러오는데 실패했습니다.');
      }
    }
  };

  const fetchApprovalDetail = async (category, approvalId) => {
    const basePath = category === 'RIDER' ? 'riders' : 'stores';
    const response = await fetch(
      `${API_BASE_URL}/api/admin/${basePath}/approvals/${approvalId}`,
      { headers: { ...authHeader() }, credentials: 'include' }
    );
    if (!response.ok) throw new Error('Failed to load approval detail');
    const payload = await response.json();
    return payload.data;
  };

  const handleOpenApproval = async (item, focusSection = null) => {
    try {
      const detail = await fetchApprovalDetail(item.category, item.id);
      const documents = detail.documents || [];
      const formData = item.category === 'STORE'
          ? {
            storeName: detail.store?.storeName,
            businessNumber: detail.store?.businessNumber,
            repName: detail.store?.representativeName,
            contact: detail.store?.representativePhone,
            martContact: detail.store?.representativePhone,
            martIntro: detail.store?.addressLine1,
            addressLine2: detail.store?.addressLine2,
            postalCode: detail.store?.postalCode,
            reason: detail.reason,
            businessRegistrationFile: extractDocument(documents, 'BUSINESS_LICENSE'),
            mailOrderFile: extractDocument(documents, 'BUSINESS_REPORT'),
            bankbookFile: extractDocument(documents, 'BANK_PASSBOOK'),
            identityFile: extractDocument(documents, 'ID_CARD')
          }
        : {
            name: detail.rider?.userName,
            contact: detail.rider?.userPhone,
            bankName: detail.rider?.bankName,
            accountNumber: detail.rider?.bankAccount,
            accountHolder: detail.rider?.accountHolder,
            reason: detail.reason,
            identityFile: extractDocument(documents, 'ID_CARD'),
            bankbookFile: extractDocument(documents, 'BANK_PASSBOOK')
          };
      setSelectedApproval({ ...item, formData, focusSection });
    } catch (error) {
      alert('승인 상세 정보를 불러오는데 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApprovalAction = async (approval, action, reason = '') => {
    console.log('[approval] action', { id: approval.id, action, reason });
    try {
      let response;
      const basePath = approval.category === 'RIDER' ? 'riders' : 'stores';
      if (action === 'APPROVED') {
        response = await fetch(`${API_BASE_URL}/api/admin/${basePath}/approvals/${approval.id}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeader() },
          credentials: 'include'
        });
      } else if (action === 'REJECTED') {
        response = await fetch(`${API_BASE_URL}/api/admin/${basePath}/approvals/${approval.id}/reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeader() },
          credentials: 'include',
          body: JSON.stringify({ reason })
        });
      } else if (action === 'PENDING') {
        if (!reason) {
          alert('보류 사유를 입력해주세요.');
          return;
        }
        response = await fetch(`${API_BASE_URL}/api/admin/${basePath}/approvals/${approval.id}/hold`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeader() },
          credentials: 'include',
          body: JSON.stringify({ reason })
        });
      }

      if (!response || !response.ok) {
        let message = '요청 처리에 실패했습니다.';
        try {
          const errorBody = await response.json();
          if (errorBody?.message) message = errorBody.message;
        } catch (_) {}
        alert(message);
        return;
      }

      if (action === 'APPROVED') {
        alert(`${approval.name} 승인 처리되었습니다.`);
      } else if (action === 'REJECTED') {
        alert(`${approval.name} 거절 처리되었습니다.${reason ? `\n(사유: ${reason})` : ''}`);
      } else if (action === 'PENDING') {
        alert(`${approval.name}이(가) 보류 상태로 넘어갑니다.${reason ? `\n(사유: ${reason})` : ''}`);
      }

      await fetchApprovals();
      setSelectedApproval(null);
    } catch (error) {
      alert('요청 처리 중 오류가 발생했습니다.');
    }
  };

  const handleToggleStatus = (record, reason = '') => {
    if (record.rep) { // Store
      setStores(prev => prev.map(s => 
        s.id === record.id ? { ...s, status: s.status === '정상' ? '비활성' : '정상' } : s
      ));
    } else if (record.type === 'USER') {
      setUsers(prev => prev.map(u => 
        u.id === record.id ? { ...u, status: u.status === '활성' ? '정지' : '활성' } : u
      ));
      if (reason) {
        alert(`[${record.name}] 고객님에게 정지 사유가 발송되었습니다: "${reason}"`);
      }
    }
    setSelectedRecord(null);
  };

  const handleResolveReport = (id, message) => {
    if (!message) {
      alert('처리 결과 메시지를 입력해주세요.');
      return;
    }
    
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: '처리완료', resolution: message } : r));
    
    // SSE Alert Simulation
    const report = reports.find(r => r.id === id);
    alert(`[SSE 알림 전송 완료]\n내용: 신고 #${id}에 대한 처리 결과가 발송되었습니다.\n\n대상: ${report.reporter.name}님\n메시지: ${message}`);
    
    setSelectedReport(null);
    setResolutionMessage('');
  };

  const handleExecuteSettlement = (type) => {
    const list = type === 'STORE' ? detailedSettlements : riderSettlements;
    const setter = type === 'STORE' ? setDetailedSettlements : setRiderSettlements;
    const targetItems = list.filter(s => s.status === '승인 대기' || s.status === '지급 처리중' || s.status === '지급 실패');

    if (targetItems.length === 0) {
      alert('정산 실행할 대상이 없습니다.');
      return;
    }

    if (!confirm(`${type === 'STORE' ? '마트' : '배달원'} 정산 업무를 실행하시겠습니까?\n대상: ${targetItems.length}건`)) return;

    // Simulation of retry logic and partial settlement
    let successCount = 0;
    let retryCount = 0;
    
    // In a real app, this would be an async API call
    targetItems.forEach(item => {
      // Simulate that some might fail initially but pass on retry
      const random = Math.random();
      if (random > 0.1) { // 90% success rate
        successCount++;
      } else {
        // Retry logic: try 3 times
        for(let i=1; i<=3; i++) {
          retryCount++;
          if (Math.random() > 0.2) { // 80% success on retry
            successCount++;
            break;
          }
        }
      }
    });

    setter(prev => prev.map(item => {
      if (item.status === '승인 대기' || item.status === '지급 처리중' || item.status === '지급 실패') {
        // For simplicity in mock, we mark them as completed if they "passed" the simulation
        return { ...item, status: '지급 완료', color: '#10b981' };
      }
      return item;
    }));

    alert(`정산 실행 완료\n\n- 성공: ${successCount}건\n- 자동 재시도 횟수: ${retryCount}회\n\n실패 건에 대해서는 부분 정산이 진행되었으며, 최종 결과는 '지급 완료'로 업데이트되었습니다.`);
  };

  const handleInquiryAnswerSubmit = async (inquiry, answer, refresh) => {
    if (!answer || !answer.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }
    setIsSubmittingAnswer(true);
    try {
      await answerInquiry(inquiry.id, answer.trim());
      alert('답변이 등록되었습니다.');
      setInquiryList(prev => prev.map(q => q.id === inquiry.id ? { ...q, status: '답변 완료', statusEnum: 'ANSWERED' } : q));
      setSelectedInquiry(null);
      setInquiryAnswer('');
      if (refresh) refresh();
    } catch (error) {
      console.error('답변 등록 실패:', error);
      alert(error.response?.data?.error?.message || error.message || '답변 등록에 실패했습니다.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab chartPeriod={chartPeriod} setChartPeriod={setChartPeriod} setActiveTab={setActiveTab} detailedSettlements={detailedSettlements} riderSettlements={riderSettlements} reports={reports} approvalItems={approvalItems} inquiryList={inquiryList} />;
      case 'stores':
        return <StoresTab stores={stores} currentPage={currentPage} itemsPerPage={itemsPerPage} setCurrentPage={setCurrentPage} setSelectedRecord={setSelectedRecord} />;
      case 'riders':
        return <RidersTab riders={riders} currentPage={currentPage} itemsPerPage={itemsPerPage} setCurrentPage={setCurrentPage} setSelectedRecord={setSelectedRecord} />;
      case 'users':
        return <UsersTab users={users} userSearch={userSearch} setUserSearch={setUserSearch} expandedUserId={expandedUserId} setExpandedUserId={setExpandedUserId} currentPage={currentPage} itemsPerPage={itemsPerPage} setCurrentPage={setCurrentPage} setSelectedRecord={setSelectedRecord} />;
      case 'inquiry':
        return (
          <InquiryTab
            inquiryList={inquiryList}
            inquiryFilter={inquiryFilter}
            setInquiryFilter={setInquiryFilter}
            inquiryPage={inquiryPage}
            setInquiryPage={setInquiryPage}
            itemsPerPage={itemsPerPage}
            selectedInquiry={selectedInquiry}
            setSelectedInquiry={setSelectedInquiry}
            inquiryAnswer={inquiryAnswer}
            setInquiryAnswer={setInquiryAnswer}
            fetchInquiryDetail={fetchInquiryDetail}
            onAnswerSubmit={handleInquiryAnswerSubmit}
            isSubmittingAnswer={isSubmittingAnswer}
            fetchInquiries={fetchInquiries}
          />
        );
      case 'cms':
        return (
          <CmsTab
            bannerList={bannerList}
            setBannerList={setBannerList}
            onBannerAdd={() => { setCurrentBanner({ title: '', content: '', img: '', promotion: '', status: '노출 중', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }); setIsBannerModalOpen(true); }}
            onBannerEdit={(b) => { setCurrentBanner(b); setIsBannerModalOpen(true); }}
            onBannerDelete={(b) => { if (window.confirm('배너를 삭제하시겠습니까?')) setBannerList(bannerList.filter(x => x.id !== b.id)); }}
            promotions={promotions}
            setSelectedPromotion={setSelectedPromotion}
            onPromotionAdd={() => alert('신규 기획전 등록 화면으로 이동')}
            noticeList={noticeList}
            onNoticeAdd={() => { setCurrentNotice({ title: '', content: '', date: new Date().toISOString().split('T')[0].replace(/-/g, '.') }); setIsNoticeModalOpen(true); }}
            onNoticeEdit={(n) => { setCurrentNotice(n); setIsNoticeModalOpen(true); }}
            onNoticeDelete={async (n) => { if (window.confirm('공지사항을 삭제하시겠습니까?')) { try { await deleteNotice(n.id); fetchNotices(); } catch (e) { alert('삭제에 실패했습니다.'); } } }}
            faqs={faqs}
            onFaqAdd={() => { setCurrentFAQ({ question: '', answer: '' }); setIsFAQModalOpen(true); }}
            onFaqEdit={(f) => { setCurrentFAQ(f); setIsFAQModalOpen(true); }}
            onFaqDelete={async (f) => { if (!window.confirm('정말 삭제하시겠습니까?')) return; try { await deleteFaq(f.id); setFaqs(faqs.filter(x => x.id !== f.id)); alert('삭제되었습니다.'); } catch (e) { alert('삭제 실패: ' + e.message); } }}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'payments':
        return <PaymentsTab paymentMonthFilter={paymentMonthFilter} setPaymentMonthFilter={setPaymentMonthFilter} paymentHistory={paymentHistory} paymentSearch={paymentSearch} paymentRegionFilter={paymentRegionFilter} setPaymentSearch={setPaymentSearch} setPaymentRegionFilter={setPaymentRegionFilter} />;
      case 'settlements':
        return <SettlementsTab settlementFilter={settlementFilter} setSettlementFilter={setSettlementFilter} detailedSettlements={detailedSettlements} riderSettlements={riderSettlements} settlementMonthFilter={settlementMonthFilter} setSettlementMonthFilter={setSettlementMonthFilter} settlementSearch={settlementSearch} settlementStatusFilter={settlementStatusFilter} setSettlementSearch={setSettlementSearch} setSettlementStatusFilter={setSettlementStatusFilter} handleExecuteSettlement={handleExecuteSettlement} />;
      case 'approvals':
        return <ApprovalsTab approvalItems={approvalItems} approvalFilter={approvalFilter} approvalStatusFilter={approvalStatusFilter} setApprovalFilter={setApprovalFilter} setApprovalStatusFilter={setApprovalStatusFilter} handleOpenApproval={handleOpenApproval} currentPage={currentPage} itemsPerPage={itemsPerPage} setCurrentPage={setCurrentPage} />;
      case 'notifications':
        return <NotificationsTab notificationHistory={notificationHistory} currentPage={currentPage} itemsPerPage={itemsPerPage} setCurrentPage={setCurrentPage} />;
      case 'reports':
      case 'reports_view':
        return <ReportsTab reports={reports} reportsFilter={reportsFilter} reportsSearch={reportsSearch} setReportsFilter={setReportsFilter} setReportsSearch={setReportsSearch} setSelectedReport={setSelectedReport} currentPage={currentPage} itemsPerPage={itemsPerPage} setCurrentPage={setCurrentPage} />;
      default:
        return <OverviewTab chartPeriod={chartPeriod} setChartPeriod={setChartPeriod} setActiveTab={setActiveTab} detailedSettlements={detailedSettlements} riderSettlements={riderSettlements} reports={reports} approvalItems={approvalItems} inquiryList={inquiryList} />;
    }
  };

  return (
    <div className="admin-dashboard" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white' }}>
      <RecordDetailModal 
        record={selectedRecord} 
        onClose={() => setSelectedRecord(null)} 
        onToggleStatus={handleToggleStatus}
        reports={reports}
        onShowReports={(user) => {
           setActiveTab('reports_view');
           setSelectedRecord(null);
        }}
      />

      <ApprovalDetailModal 
        item={selectedApproval}
        onClose={() => setSelectedApproval(null)}
        onAction={handleApprovalAction}
      />

      {selectedReport && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(5px)' }}>
            <div style={{ backgroundColor: '#1e293b', width: '100%', maxWidth: '650px', maxHeight: '90vh', borderRadius: '24px', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
               {/* Header */}
               <div style={{ padding: '32px 32px 16px', borderBottom: '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>신고 및 분쟁 상세 검토</h3>
                      <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                        신고 유형: {selectedReport.type} | 신고 번호: #REP-2026-{selectedReport.id}
                      </div>
                    </div>
                    <button onClick={() => { setSelectedReport(null); setResolutionMessage(''); }} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '28px', cursor: 'pointer' }}>×</button>
                  </div>
               </div>

               {/* Content - Scrollable */}
               <div style={{ padding: '32px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
                     <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
                       사용자 입력 신고 내용
                     </div>
                     <div style={{ lineHeight: '1.7', fontSize: '15px', color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>{selectedReport.content}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                     <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>주문 번호</div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#38bdf8' }}>{selectedReport.orderNo}</div>
                     </div>
                     <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>신고 접수 시간</div>
                        <div style={{ fontSize: '15px', fontWeight: '700' }}>{selectedReport.time} (2026-01-27)</div>
                     </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                     <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(56, 189, 248, 0.1)' }}>
                        <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '800', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>신고자 정보 (Reporter)</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '13px', color: '#94a3b8' }}>성명/상호</span>
                              <span style={{ fontSize: '14px', fontWeight: '700' }}>{selectedReport.reporter.name}</span>
                           </div>
                           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '13px', color: '#94a3b8' }}>연락처</span>
                              <span style={{ fontSize: '14px', fontWeight: '700' }}>{selectedReport.reporter.contact}</span>
                           </div>
                           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '13px', color: '#94a3b8' }}>유형</span>
                              <span style={{ fontSize: '12px', fontWeight: '800', color: '#38bdf8' }}>{selectedReport.reporter.type}</span>
                           </div>
                        </div>
                     </div>
                     <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                        <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '800', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>피신고자 정보 (Reported)</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '13px', color: '#94a3b8' }}>성명/상호</span>
                              <span style={{ fontSize: '14px', fontWeight: '700' }}>{selectedReport.reported.name}</span>
                           </div>
                           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '13px', color: '#94a3b8' }}>연락처</span>
                              <span style={{ fontSize: '14px', fontWeight: '700' }}>{selectedReport.reported.contact}</span>
                           </div>
                           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '13px', color: '#94a3b8' }}>유형</span>
                              <span style={{ fontSize: '12px', fontWeight: '800', color: '#f59e0b' }}>{selectedReport.reported.type}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {selectedReport.status === '처리완료' ? (
                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                       <div style={{ fontSize: '13px', color: '#10b981', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '18px' }}>✅</span> 처리 결과 공식 답변
                       </div>
                       <div style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: '1.7' }}>{selectedReport.resolution}</div>
                    </div>
                  ) : (
                    <div style={{ marginTop: '10px' }}>
                       <label style={{ display: 'block', fontSize: '14px', color: '#94a3b8', fontWeight: '700', marginBottom: '12px' }}>조치 결과 및 답변 입력</label>
                       <textarea 
                         value={resolutionMessage}
                         onChange={(e) => setResolutionMessage(e.target.value)}
                         placeholder="해당 신고 건에 대한 조치 결과와 신고자에게 보낼 답변을 상세히 입력해주세요..."
                         style={{ width: '100%', height: '120px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '16px', color: 'white', resize: 'none', fontSize: '14px', lineHeight: '1.6' }}
                       />
                    </div>
                  )}
               </div>

               {/* Footer Footer */}
               <div style={{ padding: '24px 32px 32px', borderTop: '1px solid #334155', backgroundColor: '#1e293b' }}>
                  {selectedReport.status === '처리완료' ? (
                    <button 
                      onClick={() => { setSelectedReport(null); setResolutionMessage(''); }} 
                      style={{ width: '100%', padding: '16px', borderRadius: '14px', backgroundColor: '#334155', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer' }}>확인 및 닫기</button>
                  ) : (
                    <div style={{ display: 'flex', gap: '12px' }}>
                       <button 
                         onClick={() => { setSelectedReport(null); setResolutionMessage(''); }} 
                         style={{ flex: 1, padding: '16px', borderRadius: '14px', backgroundColor: '#334155', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer' }}>취소</button>
                       <button 
                         onClick={() => {
                           handleResolveReport(selectedReport.id, resolutionMessage);
                           setResolutionMessage('');
                         }}
                         style={{ flex: 2, padding: '16px', borderRadius: '14px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', fontWeight: '900', cursor: 'pointer' }}>최종 처리 완료 및 답변 전송</button>
                    </div>
                  )}
               </div>
            </div>
        </div>
      )}
      {/* Sidebar */}
      <div className="sidebar" style={{
        width: '260px',
        backgroundColor: '#1e293b',
        padding: '30px 5px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        borderRight: '1px solid #334155',
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        <div 
          onClick={() => setActiveTab('overview')}
          style={{ fontSize: '24px', fontWeight: '800', marginBottom: '30px', color: '#38bdf8', cursor: 'pointer' }}>동네마켓 Admin</div>
        <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} 
          onClick={() => setActiveTab('overview')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'overview' ? '#334155' : 'transparent', color: activeTab === 'overview' ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>📊 전체 현황</div>
        <div className={`nav-item ${activeTab === 'approvals' ? 'active' : ''}`} 
          onClick={() => setActiveTab('approvals')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'approvals' ? '#334155' : 'transparent', color: activeTab === 'approvals' ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>📝 신청 관리</div>
        <div className={`nav-item ${activeTab === 'stores' ? 'active' : ''}`} 
          onClick={() => setActiveTab('stores')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'stores' ? '#334155' : 'transparent', color: activeTab === 'stores' ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>🏢 마트 관리</div>
        <div className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} 
          onClick={() => setActiveTab('users')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'users' ? '#334155' : 'transparent', color: activeTab === 'users' ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>👤 사용자 관리</div>
        <div className={`nav-item ${activeTab === 'riders' ? 'active' : ''}`} 
          onClick={() => setActiveTab('riders')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'riders' ? '#334155' : 'transparent', color: activeTab === 'riders' ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>🛵 배달원 관리</div>
        <div className={`nav-item ${activeTab === 'cms' ? 'active' : ''}`} 
          onClick={() => setActiveTab('cms')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'cms' ? '#334155' : 'transparent', color: activeTab === 'cms' ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>🖼️ 콘텐츠 관리</div>
        <div className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`} 
          onClick={() => setActiveTab('payments')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'payments' ? '#334155' : 'transparent', color: activeTab === 'payments' ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>💳 결제 관리</div>
        <div className={`nav-item ${activeTab === 'settlements' ? 'active' : ''}`} 
          onClick={() => setActiveTab('settlements')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'settlements' ? '#334155' : 'transparent', color: activeTab === 'settlements' ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>💰 정산 내역</div>
        <div className={`nav-item ${activeTab === 'reports' || activeTab === 'reports_view' ? 'active' : ''}`} 
          onClick={() => setActiveTab('reports')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: (activeTab === 'reports' || activeTab === 'reports_view') ? '#334155' : 'transparent', color: (activeTab === 'reports' || activeTab === 'reports_view') ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>🚨 신고 / 분쟁</div>
        <div className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`} 
          onClick={() => setActiveTab('notifications')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'notifications' ? '#334155' : 'transparent', color: activeTab === 'notifications' ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>📢 알림 발송</div>
        <div className={`nav-item ${activeTab === 'inquiry' ? 'active' : ''}`} 
          onClick={() => setActiveTab('inquiry')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'inquiry' ? '#334155' : 'transparent', color: activeTab === 'inquiry' ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>💬 1:1 문의</div>
      </div>

      {/* Main Content */}
      <div className="main-content" style={{ flexGrow: 1, padding: '40px' }}>
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700' }}>
            {activeTab === 'overview' ? '플랫폼 전체 현황' : 
             activeTab === 'approvals' ? '신규 신청 관리' :
             activeTab === 'stores' ? '마트 관리' : 
             activeTab === 'users' ? '사용자 관리' :
             activeTab === 'riders' ? '배달원 관리' :  
             activeTab === 'payments' ? '결제 관리 센터' :
             activeTab === 'settlements' ? '마트 정산 현황' :
             activeTab === 'cms' ? '콘텐츠 관리' :
             activeTab === 'reports' || activeTab === 'reports_view' ? '신고 및 분쟁 관리' :
             activeTab === 'notifications' ? '알림 발송 센터' :
             activeTab === 'inquiry' ? '1:1 문의 고객응대' : '관리 대시보드'}
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '4px' }}>2026년 1월 22일 기준</p>
        </header>

        {renderActiveView()}

        {isNoticeModalOpen && currentNotice && (
          <NoticeModal
            notice={currentNotice}
            setNotice={setCurrentNotice}
            onSave={async () => {
              try {
                if (currentNotice.id) {
                  await updateNotice(currentNotice.id, currentNotice.title, currentNotice.content);
                  alert('수정되었습니다.');
                } else {
                  await createNotice(currentNotice.title, currentNotice.content);
                  alert('등록되었습니다.');
                }
                setIsNoticeModalOpen(false);
                fetchNotices();
              } catch (e) {
                alert('저장에 실패했습니다.');
              }
            }}
            onClose={() => setIsNoticeModalOpen(false)}
          />
        )}

        {isFAQModalOpen && currentFAQ && (
          <FaqModal
            faq={currentFAQ}
            setFaq={setCurrentFAQ}
            onSave={async () => {
              if (!currentFAQ.question || !currentFAQ.answer) {
                alert('질문과 답변을 모두 입력해주세요.');
                return;
              }
              try {
                if (currentFAQ.id) {
                  await updateFaq(currentFAQ.id, currentFAQ.question, currentFAQ.answer);
                  setFaqs(faqs.map(f => f.id === currentFAQ.id ? currentFAQ : f));
                  alert('수정되었습니다.');
                } else {
                  const created = await createFaq(currentFAQ.question, currentFAQ.answer);
                  setFaqs([{ id: created.faqId, question: created.question, answer: created.answer }, ...faqs]);
                  alert('등록되었습니다.');
                }
                setIsFAQModalOpen(false);
              } catch (e) {
                alert('저장 실패: ' + e.message);
              }
            }}
            onClose={() => setIsFAQModalOpen(false)}
          />
        )}

        {isBannerModalOpen && currentBanner && (
          <BannerModal
            banner={currentBanner}
            setBanner={setCurrentBanner}
            onSave={() => {
              if (!currentBanner.title || !currentBanner.img) {
                alert('제목과 이미지는 필수 항목입니다.');
                return;
              }
              if (currentBanner.id) {
                setBannerList(bannerList.map(b => b.id === currentBanner.id ? currentBanner : b));
                alert('수정되었습니다.');
              } else {
                setBannerList([{ ...currentBanner, id: Date.now() }, ...bannerList]);
                alert('등록되었습니다.');
              }
              setIsBannerModalOpen(false);
            }}
            onClose={() => setIsBannerModalOpen(false)}
          />
        )}

        {selectedPromotion && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: '#1e293b', width: '100%', maxWidth: '800px', borderRadius: '24px', padding: '0', border: '1px solid #334155', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
               <div style={{ height: '240px', backgroundImage: `url(${selectedPromotion.bannerImg})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(15,23,42,0.9))' }} />
                  <button 
                    onClick={() => setSelectedPromotion(null)}
                    style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', fontSize: '24px', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}>×</button>
                  <div style={{ position: 'absolute', bottom: '32px', left: '32px' }}>
                    <div style={{ color: '#38bdf8', fontSize: '14px', fontWeight: '800', marginBottom: '8px' }}>기획전 상세 내역</div>
                    <h2 style={{ fontSize: '32px', fontWeight: '900', color: 'white', margin: 0 }}>{selectedPromotion.title}</h2>
                  </div>
               </div>
               
               <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
                    <div>
                      <h4 style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px', fontWeight: '700' }}>진행 정보</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>진행 기간</div>
                          <div style={{ fontWeight: '600', color: '#cbd5e1' }}>{selectedPromotion.period}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>상태</div>
                          <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', backgroundColor: '#064e3b', color: '#34d399' }}>{selectedPromotion.status}</span>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>설명</div>
                          <div style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6' }}>{selectedPromotion.description}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px', fontWeight: '700' }}>참여 상품 ({selectedPromotion.products.length})</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {selectedPromotion.products.map((product, idx) => (
                          <div key={idx} style={{ padding: '16px', backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: '700', fontSize: '15px' }}>{product.name}</div>
                              <div style={{ fontSize: '13px', color: '#38bdf8', marginTop: '4px' }}>{product.price}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '13px', color: '#94a3b8' }}>재고: {product.stock}개</div>
                              <div style={{ fontSize: '13px', color: '#10b981', fontWeight: '700' }}>누적 판매: {product.sales}건</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
               </div>
               
               <div style={{ padding: '24px 32px', backgroundColor: '#1e293b', borderTop: '1px solid #334155', display: 'flex', gap: '12px' }}>
                  <button onClick={() => setSelectedPromotion(null)} style={{ flex: 1, padding: '16px', borderRadius: '12px', background: '#334155', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer' }}>닫기</button>
                  <button onClick={() => alert('수정 모드로 이동')} style={{ flex: 2, padding: '16px', borderRadius: '12px', background: '#38bdf8', color: '#0f172a', border: 'none', fontWeight: '900', cursor: 'pointer' }}>기획전 정보 수정</button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
