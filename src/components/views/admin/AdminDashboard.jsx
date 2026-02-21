import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getNotices, createNotice, updateNotice, deleteNotice } from '../../../api/noticeApi';
import { getBanners, createBanner, updateBanner, deleteBanner, updateBannerOrder } from '../../../api/bannerApi';
import { getFaqsForAdmin, createFaq, updateFaq, deleteFaq } from '../../../api/faqApi';
import { getAdminInquiries, getAdminInquiryDetail, answerInquiry } from '../../../api/inquiryApi';
import { getAdminUsers, getAdminUserDetail, updateAdminUserStatus } from '../../../api/adminUserApi';
import { getAdminReports, getAdminReportDetail, resolveAdminReport, getAdminBroadcastHistory, createAdminBroadcast } from '../../../api/adminModerationApi';
import {
  getAdminOverviewStats,
  getAdminTransactionTrend,
  getAdminPaymentSummary,
  getAdminRiderSettlementSummary,
  getAdminRiderSettlementTrend,
  getAdminStoreSettlementSummary,
  getAdminStoreSettlementTrend,
  executeAdminRiderSettlement,
  executeAdminRiderSettlementSingle,
  getAdminStoreSettlements,
  getAdminRiderSettlements,
  executeAdminStoreSettlement,
  executeAdminStoreSettlementSingle
} from '../../../api/adminFinanceApi';
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
  const itemsPerPage = 10;
  const [paymentMonthFilter, setPaymentMonthFilter] = useState('2026-01');
  const [settlementMonthFilter, setSettlementMonthFilter] = useState('2026-01');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [approvalFilter, setApprovalFilter] = useState('ALL'); // 전체, 마트, 라이더
  const [approvalItems, setApprovalItems] = useState([]);
  const approvalFetchErrorShownRef = useRef(false);

  const [stores, setStores] = useState([]);
  const [storeStats, setStoreStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [storePageInfo, setStorePageInfo] = useState({ page: 0, size: itemsPerPage, totalElements: 0, totalPages: 0, hasNext: false });
  const [storeSearchInput, setStoreSearchInput] = useState('');
  const [storeSearchTerm, setStoreSearchTerm] = useState('');
  const [users, setUsers] = useState([]);

  const [userStats, setUserStats] = useState({ total: 0, active: 0, suspended: 0, newThisMonth: 0 });
  const [userPageInfo, setUserPageInfo] = useState({ page: 0, size: itemsPerPage, totalElements: 0, totalPages: 0, hasNext: false });
  const [userSearchInput, setUserSearchInput] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');


  const [reports, setReports] = useState([]);
  const [overviewReports, setOverviewReports] = useState([]);

  const [riders, setRiders] = useState([]);
  const [riderStats, setRiderStats] = useState({ total: 0, operating: 0, unavailable: 0, idCardPending: 0 });
  const [riderPageInfo, setRiderPageInfo] = useState({ page: 0, size: itemsPerPage, totalElements: 0, totalPages: 0, hasNext: false });
  const [riderSearchInput, setRiderSearchInput] = useState('');
  const [riderSearchTerm, setRiderSearchTerm] = useState('');

  const [approvalStatusFilter, setApprovalStatusFilter] = useState('ALL'); // 전체, 심사대기, 보류

  const [chartPeriod, setChartPeriod] = useState('weekly'); // 주간, 월간, 연간
  const [reportsFilter, setReportsFilter] = useState('ALL'); // 전체, 처리완료, 미처리
  const [reportsSearch, setReportsSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [resolutionMessage, setResolutionMessage] = useState('');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentRegionFilter, setPaymentRegionFilter] = useState('ALL');
  const [settlementSearch, setSettlementSearch] = useState('');
  const [settlementStatusFilter, setSettlementStatusFilter] = useState('ALL');
  const [inquiryFilter, setInquiryFilter] = useState('ALL'); // 전체, 대기, 완료

  const [faqs, setFaqs] = useState([]);

  const [settlementFilter, setSettlementFilter] = useState('STORE'); // 마트, 라이더
  const [settlements, setSettlements] = useState([]);

  const [detailedSettlements, setDetailedSettlements] = useState([]);

  const [riderSettlements, setRiderSettlements] = useState([]);
  const [settlementPageInfo, setSettlementPageInfo] = useState({ page: 0, size: itemsPerPage, totalElements: 0, totalPages: 0, hasNext: false });

  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState({
    grossPaymentAmount: 0,
    platformFeeRevenue: 0,
    refundAmount: 0,
    netRevenue: 0,
    paymentCount: 0,
    refundRequestedCount: 0,
    refundApprovedCount: 0,
    refundRejectedCount: 0,
    refundRequestedAmount: 0,
    refundApprovedAmount: 0,
    refundRejectedAmount: 0,
    regularSalesAmount: 0,
    subscriptionSalesAmount: 0
  });
  const [overviewStats, setOverviewStats] = useState({
    totalUsers: 0,
    approvedStores: 0,
    deliveringRiders: 0,
    pendingStoreSettlements: 0,
    pendingReports: 0,
    pendingInquiries: 0
  });
  const [transactionTrend, setTransactionTrend] = useState({ xLabels: [], yValues: [], maxY: 0 });
  const [settlementSummary, setSettlementSummary] = useState({
    totalTargets: 0,
    completedTargets: 0,
    pendingTargets: 0,
    failedTargets: 0,
    totalSettlementAmount: 0,
    completedRate: 0
  });
  const [settlementTrend, setSettlementTrend] = useState({ xLabels: [], yValues: [], totalAmount: 0, changeRate: 0 });
  const [riderSettlementSummary, setRiderSettlementSummary] = useState({
    totalTargets: 0,
    completedTargets: 0,
    pendingTargets: 0,
    failedTargets: 0,
    totalSettlementAmount: 0,
    completedRate: 0
  });
  const [riderSettlementTrend, setRiderSettlementTrend] = useState({ xLabels: [], yValues: [], totalAmount: 0, changeRate: 0 });

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
      alert('문의 상세 정보를 불러오지 못했습니다.');
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

  const fetchBanners = useCallback(async () => {
    try {
      const list = await getBanners();
      setBannerList(list ?? []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [currentNotice, setCurrentNotice] = useState(null);

  const [bannerList, setBannerList] = useState([]);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);

  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false);
  const [currentFAQ, setCurrentFAQ] = useState(null);

  const [promotions, setPromotions] = useState([]);
  const [selectedPromotion, setSelectedPromotion] = useState(null);

  const [notificationHistory, setNotificationHistory] = useState([]);
  const [broadcastTarget, setBroadcastTarget] = useState('ALL');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');

  
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
        alert('승인 목록을 불러오는 데 실패했습니다.');
      }
    }
  };

  const mapStoreListItem = (item) => ({
    id: item.storeId,
    storeId: item.storeId,
    name: item.storeName,
    loc: [item.addressLine1, item.addressLine2].filter(Boolean).join(' '),
    rep: item.representativeName,
    status: item.isActive ? '영업중' : '영업중지',
    isActive: item.isActive
  });

  const fetchStores = useCallback(async (page = currentPage, name = storeSearchTerm) => {
    try {
      const params = new URLSearchParams();
      if (name && name.trim()) {
        params.set('name', name.trim());
      }
      params.set('page', String(Math.max(page - 1, 0)));
      params.set('size', String(itemsPerPage));
      const response = await fetch(`${API_BASE_URL}/api/admin/stores?${params.toString()}`, {
        headers: { ...authHeader() },
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to load stores');
      }
      const payload = await response.json();
      const data = payload?.data || {};
      const content = Array.isArray(data.content) ? data.content : [];
      setStores(content.map(mapStoreListItem));
      setStoreStats({
        total: data.stats?.total ?? content.length,
        active: data.stats?.active ?? content.filter(s => s.isActive).length,
        inactive: data.stats?.inactive ?? content.filter(s => !s.isActive).length,
        pending: data.stats?.pending ?? 0
      });
      setStorePageInfo(data.page || data.pageInfo || { page: 0, size: itemsPerPage, totalElements: content.length, totalPages: 1, hasNext: false });
    } catch (error) {
      console.error('Failed to load stores:', error);
    }
  }, [currentPage, itemsPerPage, storeSearchTerm]);
  useEffect(() => {
    if (activeTab === 'stores') {
      fetchStores(currentPage, storeSearchTerm);
    }
  }, [activeTab, currentPage, storeSearchTerm, fetchStores]);


  const handleStoreSearch = () => {
    const term = storeSearchInput.trim();
    setStoreSearchTerm(term);
    setCurrentPage(1);
    if (activeTab === 'stores') {
      fetchStores(1, term);
    }
  };

  const handleOpenStoreDetail = async (storeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stores/${storeId}`, {
        headers: { ...authHeader() },
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to load store detail');
      }
      const payload = await response.json();
      const detail = payload?.data;
      if (!detail) return;
      const approvalDetail = await fetchStoreApprovalDetailByStoreId(detail.storeId);
      const approvalDocuments = approvalDetail?.documents || [];
      const storeDocuments = {
        businessRegistrationFile: extractDocument(approvalDocuments, 'BUSINESS_LICENSE'),
        mailOrderFile: extractDocument(approvalDocuments, 'BUSINESS_REPORT'),
        bankbookFile: extractDocument(approvalDocuments, 'BANK_PASSBOOK')
      };
      const loc = [detail.addressLine1, detail.addressLine2].filter(Boolean).join(' ');
      setSelectedRecord({
        id: detail.storeId,
        storeId: detail.storeId,
        name: detail.storeName,
        loc,
        rep: detail.representativeName,
        phone: detail.phone || detail.representativePhone || detail.ownerPhone,
        bizNum: detail.businessNumber,
        bankDetails: {
          bank: detail.settlementBankName,
          account: detail.settlementBankAccount,
          holder: detail.settlementAccountHolder
        },
        intro: detail.description,
        documents: storeDocuments,
        status: detail.isActive ? '영업중' : '영업중지',
        isActive: detail.isActive
      });
    } catch (error) {
      console.error('Failed to load store detail:', error);
    }
  };


  const mapRiderListItem = (item) => ({
    id: item.riderId,
    riderId: item.riderId,
    name: item.name,
    phone: item.phone,
    bankName: item.bankName,
    accountNumber: item.bankAccount,
    accountHolder: item.accountHolder,
    status: item.isActive ? '운행중' : '운행불가',
    isActive: item.isActive
  });

  const resolveRiderSearch = (term) => {
    if (!term) return { name: null, phone: null };
    const cleaned = term.replace(/\s+/g, '');
    const hasDigit = /\d/.test(cleaned);
    return hasDigit ? { name: null, phone: term } : { name: term, phone: null };
  };

  const fetchRiders = useCallback(async (page = currentPage, term = riderSearchTerm) => {
    try {
      const params = new URLSearchParams();
      const resolved = resolveRiderSearch(term ? term.trim() : '');
      if (resolved.name) params.set('name', resolved.name);
      if (resolved.phone) params.set('phone', resolved.phone);
      params.set('page', String(Math.max(page - 1, 0)));
      params.set('size', String(itemsPerPage));
      const response = await fetch(`${API_BASE_URL}/api/admin/riders?${params.toString()}`, {
        headers: { ...authHeader() },
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to load riders');
      }
      const payload = await response.json();
      const data = payload?.data || {};
      const content = Array.isArray(data.content) ? data.content : [];
      setRiders(content.map(mapRiderListItem));
      setRiderStats({
        total: data.stats?.total ?? content.length,
        operating: data.stats?.operating ?? content.filter(r => r.isActive).length,
        unavailable: data.stats?.unavailable ?? content.filter(r => !r.isActive).length,
        idCardPending: data.stats?.idCardPending ?? content.filter(r => r.idCardStatus !== '완료').length
      });
      setRiderPageInfo(data.page || data.pageInfo || { page: 0, size: itemsPerPage, totalElements: content.length, totalPages: 1, hasNext: false });
    } catch (error) {
      console.error('Failed to load riders:', error);
    }
  }, [currentPage, itemsPerPage, riderSearchTerm]);

  useEffect(() => {
    if (activeTab === 'riders') {
      fetchRiders(currentPage, riderSearchTerm);
    }
  }, [activeTab, currentPage, riderSearchTerm, fetchRiders]);

  const handleRiderSearch = () => {
    const term = riderSearchInput.trim();
    setRiderSearchTerm(term);
    setCurrentPage(1);
    if (activeTab === 'riders') {
      fetchRiders(1, term);
    }
  };

  const handleOpenRiderDetail = async (riderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/riders/${riderId}`, {
        headers: { ...authHeader() },
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to load rider detail');
      }
      const payload = await response.json();
      const detail = payload?.data;
      if (!detail) return;
      const approvalDetail = await fetchRiderApprovalDetailByRiderId(detail.riderId);
      const approvalDocuments = approvalDetail?.documents || [];
      const riderDocuments = {
        idCardFile: extractDocument(approvalDocuments, 'ID_CARD'),
        bankbookFile: extractDocument(approvalDocuments, 'BANK_PASSBOOK')
      };
      setSelectedRecord({
        id: detail.riderId,
        riderId: detail.riderId,
        name: detail.name,
        phone: detail.phone,
        bankName: detail.bankName,
        accountNumber: detail.bankAccount,
        accountHolder: detail.accountHolder,
        documents: riderDocuments,
        status: detail.isActive ? '운행중' : '운행불가',
        isActive: detail.isActive
      });
    } catch (error) {
      console.error('Failed to load rider detail:', error);
    }
  };

  const toUserStatusLabel = (status) => {
    if (status === 'ACTIVE') return '활성';
    if (status === 'SUSPENDED') return '정지';
    if (status === 'INACTIVE') return '비활성';
    if (status === 'PENDING') return '대기';
    return status || '-';
  };

  const mapUserListItem = (item) => ({
    id: item.userId,
    type: 'USER',
    name: item.name,
    email: item.email,
    phone: item.phone,
    addresses: [],
    orders: item.orderCount ?? 0,
    join: formatDate(item.joinedAt),
    status: toUserStatusLabel(item.status),
    rawStatus: item.status,
    isActive: item.status === 'ACTIVE'
  });

  const mapUserDetailToRecord = (detail) => ({
    id: detail.userId,
    type: 'USER',
    name: detail.name,
    email: detail.email,
    phone: detail.phone,
    addresses: detail.addresses || [],
    loc: (detail.addresses && detail.addresses.length > 0) ? detail.addresses[0] : '-',
    orders: detail.orderCount ?? 0,
    join: formatDate(detail.joinedAt),
    status: toUserStatusLabel(detail.status),
    rawStatus: detail.status,
    isActive: detail.status === 'ACTIVE',
    statusHistory: detail.statusHistory || [],
    currentStatusReason: (detail.statusHistory || []).find(
      (item) => item.afterStatus === detail.status && item.reason
    )?.reason || '',
    inquiries: (detail.inquiryHistory || []).map((item) => ({
      type: '문의',
      time: formatDate(item.createdAt),
      content: `[${item.category}] ${item.title}`
    }))
  });

  const fetchUsers = useCallback(async (page = currentPage, keyword = userSearchTerm) => {
    try {
      const data = await getAdminUsers({
        page: Math.max(page - 1, 0),
        size: itemsPerPage,
        keyword
      });
      const content = Array.isArray(data?.content) ? data.content : [];
      setUsers(content.map(mapUserListItem));
      setUserStats({
        total: data?.stats?.total ?? content.length,
        active: data?.stats?.active ?? content.filter((item) => item.status === 'ACTIVE').length,
        suspended: data?.stats?.suspended ?? content.filter((item) => item.status === 'SUSPENDED').length,
        newThisMonth: data?.stats?.newThisMonth ?? 0
      });
      setUserPageInfo(data?.page || { page: 0, size: itemsPerPage, totalElements: content.length, totalPages: 1, hasNext: false });
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
      setUserStats({ total: 0, active: 0, suspended: 0, newThisMonth: 0 });
      setUserPageInfo({ page: 0, size: itemsPerPage, totalElements: 0, totalPages: 0, hasNext: false });
    }
  }, [currentPage, itemsPerPage, userSearchTerm]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers(currentPage, userSearchTerm);
    }
  }, [activeTab, currentPage, userSearchTerm, fetchUsers]);

  const handleUserSearch = () => {
    const term = userSearchInput.trim();
    setUserSearchTerm(term);
    setCurrentPage(1);
    if (activeTab === 'users') {
      fetchUsers(1, term);
    }
  };

  const handleOpenUserDetail = async (userId) => {
    try {
      const detail = await getAdminUserDetail(userId);
      setSelectedRecord(mapUserDetailToRecord(detail));
    } catch (error) {
      console.error('Failed to load user detail:', error);
      alert('사용자 상세 정보를 불러오지 못했습니다.');
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

  const fetchStoreApprovalDetailByStoreId = async (storeId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/stores/approvals?status=APPROVED&status=PENDING&status=HELD&status=REJECTED`,
        { headers: { ...authHeader() }, credentials: 'include' }
      );
      if (!response.ok) return null;
      const payload = await response.json();
      const list = Array.isArray(payload?.data) ? payload.data : [];
      const match = list.find(item => item.storeId === storeId);
      if (!match) return null;
      return await fetchApprovalDetail('STORE', match.approvalId);
    } catch (error) {
      console.error('Failed to load store approval detail:', error);
      return null;
    }
  };

  const fetchRiderApprovalDetailByRiderId = async (riderId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/riders/approvals?status=APPROVED&status=PENDING&status=HELD&status=REJECTED`,
        { headers: { ...authHeader() }, credentials: 'include' }
      );
      if (!response.ok) return null;
      const payload = await response.json();
      const list = Array.isArray(payload?.data) ? payload.data : [];
      const match = list.find(item => item.riderId === riderId);
      if (!match) return null;
      return await fetchApprovalDetail('RIDER', match.approvalId);
    } catch (error) {
      console.error('Failed to load rider approval detail:', error);
      return null;
    }
  };

  const handleOpenApproval = async (item, focusSection = null) => {
    try {
      const detail = await fetchApprovalDetail(item.category, item.id);
      const documents = detail.documents || [];
      const formData = item.category === 'STORE'
          ? {
            storeName: detail.store?.storeName,
            category: detail.store?.categoryName,
            companyName: detail.store?.businessOwnerName,
            businessNumber: detail.store?.businessNumber,
            mailOrderNumber: detail.store?.telecomSalesReportNumber,
            repName: detail.store?.representativeName,
            contact: detail.store?.representativePhone,
            martContact: detail.store?.representativePhone,
            martIntro: detail.store?.addressLine1,
            addressLine2: detail.store?.addressLine2,
            postalCode: detail.store?.postalCode,
            bankName: detail.store?.settlementBankName,
            accountNumber: detail.store?.settlementBankAccount,
            accountHolder: detail.store?.settlementAccountHolder,
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
      alert('승인 상세 정보를 불러오는 데 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  useEffect(() => {
    if (activeTab === 'approvals') {
      fetchApprovals();
    }
  }, [activeTab]);

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
        alert(`${approval.name} 승인 처리했습니다.`);
      } else if (action === 'REJECTED') {
        alert(`${approval.name} 거절 처리했습니다.${reason ? `\n(사유: ${reason})` : ''}`);
      } else if (action === 'PENDING') {
        alert(`${approval.name}을(를) 보류 상태로 처리했습니다.${reason ? `\n(사유: ${reason})` : ''}`);
      }

      await fetchApprovals();
      setSelectedApproval(null);
    } catch (error) {
      alert('요청 처리 중 오류가 발생했습니다.');
    }
  };

  const handleToggleStatus = async (record, reason = '') => {
    if (record.type === 'USER') {
      try {
        const nextStatus = record.isActive ? 'SUSPENDED' : 'ACTIVE';
        await updateAdminUserStatus(record.id, nextStatus, reason);
        await fetchUsers(currentPage, userSearchTerm);
      } catch (error) {
        console.error('Failed to update user status:', error);
        alert(error?.message || '사용자 상태 변경에 실패했습니다.');
      } finally {
        setSelectedRecord(null);
      }
      return;
    }

    if (record.rep) {
      try {
        const nextIsActive = !record.isActive;
        const response = await fetch(`${API_BASE_URL}/api/admin/stores/${record.id}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeader() },
          credentials: 'include',
          body: JSON.stringify({ isActive: nextIsActive, reason })
        });
        if (!response.ok) {
          throw new Error('Failed to update store status');
        }
        await fetchStores(currentPage, storeSearchTerm);
      } catch (error) {
        console.error('Failed to update store status:', error);
        alert('마트 상태 변경에 실패했습니다.');
      } finally {
        setSelectedRecord(null);
      }
      return;
    } else if (record.type === 'USER') {
      setUsers(prev => prev.map(u =>
        u.id === record.id ? { ...u, status: u.status === '활성' ? '정지' : '활성' } : u
      ));
      if (reason) {
        alert(`[${record.name}] 사용자 상태가 변경되었습니다. "${reason}"`);
      }
      setSelectedRecord(null);
      return;
    }

    try {
      const nextIsActive = !record.isActive;
      const response = await fetch(`${API_BASE_URL}/api/admin/riders/${record.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        credentials: 'include',
        body: JSON.stringify({ isActive: nextIsActive, reason })
      });
      if (!response.ok) {
        throw new Error('Failed to update rider status');
      }
      await fetchRiders(currentPage, riderSearchTerm);
    } catch (error) {
      console.error('Failed to update rider status:', error);
      alert('배달원 상태 변경에 실패했습니다.');
    } finally {
      setSelectedRecord(null);
    }
  };

  const mapReportTypeLabel = (type) => {
    if (type === 'RIDER') return '라이더 신고';
    if (type === 'STORE') return '마트 신고';
    return '사용자 신고';
  };

  const mapReportStatusLabel = (status) => (status === 'RESOLVED' ? '처리완료' : '확인 중');

  const toUiReport = (item) => ({
    id: item.reportId,
    type: mapReportTypeLabel(item.target?.type),
    orderNo: item.orderNumber || '-',
    time: formatDateLocale(item.createdAt),
    content: item.reasonDetail || '',
    status: mapReportStatusLabel(item.status),
    resolution: item.reportResult || '',
    reporter: {
      name: item.reporter?.name || '-',
      contact: item.reporter?.phone || '-',
      type: item.reporter?.type || 'CUSTOMER'
    },
    reported: {
      name: item.target?.name || '-',
      contact: item.target?.phone || '-',
      type: item.target?.type || 'CUSTOMER'
    }
  });

  const mapBroadcastTargetLabel = (targetType) => {
    if (targetType === 'CUSTOMER') return '전체 고객';
    if (targetType === 'STORE') return '전체 마트 사장님';
    if (targetType === 'RIDER') return '전체 배달원';
    return '전체 사용자';
  };

  const fetchReports = useCallback(async () => {
    try {
      const status = reportsFilter === 'ALL' ? null : (reportsFilter === 'RESOLVED' ? 'RESOLVED' : 'PENDING');
      const data = await getAdminReports({
        page: Math.max(currentPage - 1, 0),
        size: itemsPerPage,
        keyword: reportsSearch,
        status
      });
      setReports((data.content || []).map(toUiReport));
    } catch (error) {
      console.error('신고 목록 조회 실패:', error);
    }
  }, [currentPage, itemsPerPage, reportsFilter, reportsSearch]);

  const fetchOverviewReports = useCallback(async () => {
    try {
      const data = await getAdminReports({
        page: 0,
        size: 20,
        keyword: null,
        status: null
      });
      setOverviewReports((data?.content || []).map(toUiReport));
    } catch (error) {
      console.error('전체현황 신고 데이터 조회 실패:', error);
      setOverviewReports([]);
    }
  }, []);

  const fetchReportDetail = useCallback(async (reportId) => {
    try {
      const data = await getAdminReportDetail(reportId);
      setSelectedReport(toUiReport(data));
    } catch (error) {
      console.error('신고 상세 조회 실패:', error);
      alert('신고 상세 정보를 불러오지 못했습니다.');
    }
  }, []);

  const fetchBroadcastHistory = useCallback(async () => {
    try {
      const data = await getAdminBroadcastHistory({
        page: Math.max(currentPage - 1, 0),
        size: itemsPerPage
      });
      setNotificationHistory((data.content || []).map((item) => ({
        id: item.broadcastId,
        title: item.title,
        target: mapBroadcastTargetLabel(item.targetType),
        date: formatDateLocale(item.createdAt),
        status: '발송완료'
      })));
    } catch (error) {
      console.error('알림 발송 이력 조회 실패:', error);
    }
  }, [currentPage, itemsPerPage]);

  const handleResolveReport = async (id, message) => {
    if (!message || !message.trim()) {
      alert('처리 결과 메시지를 입력해주세요.');
      return;
    }

    try {
      await resolveAdminReport(id, message.trim());
      await fetchReports();
      await fetchReportDetail(id);
      alert('신고 처리가 완료되었습니다.');
    } catch (error) {
      console.error('신고 처리 실패:', error);
      alert(error?.message || '신고 처리에 실패했습니다.');
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastTitle.trim()) {
      alert('알림 제목을 입력해주세요.');
      return;
    }
    if (!broadcastContent.trim()) {
      alert('알림 내용을 입력해주세요.');
      return;
    }
    try {
      const result = await createAdminBroadcast({
        targetType: broadcastTarget,
        title: broadcastTitle.trim(),
        content: broadcastContent.trim()
      });
      alert(`알림 발송이 완료되었습니다. 수신자: ${result.recipientCount}명`);
      setBroadcastTitle('');
      setBroadcastContent('');
      await fetchBroadcastHistory();
    } catch (error) {
      console.error('알림 발송 실패:', error);
      alert(error?.message || '알림 발송에 실패했습니다.');
    }
  };

  useEffect(() => {
    if (activeTab === 'reports' || activeTab === 'reports_view') {
      fetchReports();
    }
  }, [activeTab, fetchReports]);

  useEffect(() => {
    if (activeTab === 'notifications') {
      fetchBroadcastHistory();
    }
  }, [activeTab, fetchBroadcastHistory]);

  const toSettlementStatusLabel = (status) => {
    if (status === 'COMPLETED') return '지급 완료';
    if (status === 'PENDING') return '지급 처리중';
    if (status === 'FAILED') return '지급 실패';
    return '확인 대기';
  };

  const toSettlementStatusColor = (statusLabel) => {
    if (statusLabel === '지급 완료') return '#10b981';
    if (statusLabel === '지급 처리중') return '#38bdf8';
    if (statusLabel === '지급 실패') return '#ef4444';
    return '#f59e0b';
  };

  const toSettlementApiStatus = (statusLabel) => {
    if (statusLabel === '지급 완료') return 'COMPLETED';
    if (statusLabel === '지급 처리중' || statusLabel === '확인 대기') return 'PENDING';
    if (statusLabel === '지급 실패') return 'FAILED';
    return undefined;
  };

  const fetchFinanceOverview = useCallback(async () => {
    try {
      const stats = await getAdminOverviewStats();
      setOverviewStats(stats || {});
    } catch (error) {
      console.error('전체현황 요약 조회 실패:', error);
    }

    try {
      const trend = await getAdminTransactionTrend(chartPeriod);
      setTransactionTrend(trend || { xLabels: [], yValues: [], maxY: 0 });
    } catch (error) {
      console.error('거래액 추이 조회 실패:', error);
      setTransactionTrend({ xLabels: [], yValues: [], maxY: 0 });
    }
  }, [chartPeriod]);

  const fetchSettlementDashboard = useCallback(async () => {
    if (settlementFilter === 'STORE') {
      try {
        const summary = await getAdminStoreSettlementSummary(settlementMonthFilter);
        setSettlementSummary(summary || {});
      } catch (error) {
        console.error('정산 요약 조회 실패:', error);
      }

      try {
        const trend = await getAdminStoreSettlementTrend(6, settlementMonthFilter);
        setSettlementTrend(trend || { xLabels: [], yValues: [], totalAmount: 0, changeRate: 0 });
      } catch (error) {
        console.error('정산 추이 조회 실패:', error);
        setSettlementTrend({ xLabels: [], yValues: [], totalAmount: 0, changeRate: 0 });
      }
      return;
    }

    try {
      const summary = await getAdminRiderSettlementSummary(settlementMonthFilter);
      setRiderSettlementSummary(summary || {});
    } catch (error) {
      console.error('라이더 정산 요약 조회 실패:', error);
    }

    try {
      const trend = await getAdminRiderSettlementTrend(6, settlementMonthFilter);
      setRiderSettlementTrend(trend || { xLabels: [], yValues: [], totalAmount: 0, changeRate: 0 });
    } catch (error) {
      console.error('라이더 정산 추이 조회 실패:', error);
      setRiderSettlementTrend({ xLabels: [], yValues: [], totalAmount: 0, changeRate: 0 });
    }
  }, [settlementFilter, settlementMonthFilter]);

  const fetchSettlementList = useCallback(async () => {
    if (settlementFilter === 'STORE') {
      try {
        const response = await getAdminStoreSettlements({
          yearMonth: settlementMonthFilter,
          status: settlementStatusFilter === 'ALL' ? undefined : toSettlementApiStatus(settlementStatusFilter),
          keyword: settlementSearch,
          page: Math.max(currentPage - 1, 0),
          size: itemsPerPage
        });

        const content = Array.isArray(response?.content) ? response.content : [];
        const mapped = content.map((item) => {
          const status = toSettlementStatusLabel(item.status);
          return {
            id: item.settlementId,
            id_code: item.idCode || `STORE-${item.storeId}`,
            name: item.storeName || '-',
            region: item.region || '미상',
            amount: item.amount || 0,
            date: item.settlementPeriodEnd || item.settledAt || '-',
            periodStart: item.settlementPeriodStart || null,
            periodEnd: item.settlementPeriodEnd || null,
            settledAt: item.settledAt || null,
            contact: '-',
            status,
            color: toSettlementStatusColor(status)
          };
        });
        setDetailedSettlements(mapped);
        setSettlementPageInfo(response?.page || { page: 0, size: itemsPerPage, totalElements: content.length, totalPages: 1, hasNext: false });
      } catch (error) {
        console.error('마트 정산 목록 조회 실패:', error);
        setDetailedSettlements([]);
        setSettlementPageInfo({ page: 0, size: itemsPerPage, totalElements: 0, totalPages: 0, hasNext: false });
      }
      return;
    }

    try {
      const response = await getAdminRiderSettlements({
        yearMonth: settlementMonthFilter,
        status: settlementStatusFilter === 'ALL' ? undefined : toSettlementApiStatus(settlementStatusFilter),
        keyword: settlementSearch,
        page: Math.max(currentPage - 1, 0),
        size: itemsPerPage
      });

      const content = Array.isArray(response?.content) ? response.content : [];
      const mapped = content.map((item) => {
        const status = toSettlementStatusLabel(item.status);
        return {
          id: item.settlementId,
          id_code: item.idCode || `RIDER-${item.riderId}`,
          name: item.riderName || '-',
          region: item.region || '전국',
          amount: item.amount || 0,
          date: item.settlementPeriodEnd || item.settledAt || '-',
          periodStart: item.settlementPeriodStart || null,
          periodEnd: item.settlementPeriodEnd || null,
          settledAt: item.settledAt || null,
          contact: item.riderPhone || '-',
          status,
          color: toSettlementStatusColor(status)
        };
      });
      setRiderSettlements(mapped);
      setSettlementPageInfo(response?.page || { page: 0, size: itemsPerPage, totalElements: content.length, totalPages: 1, hasNext: false });
    } catch (error) {
      console.error('라이더 정산 목록 조회 실패:', error);
      setRiderSettlements([]);
      setSettlementPageInfo({ page: 0, size: itemsPerPage, totalElements: 0, totalPages: 0, hasNext: false });
    }
  }, [settlementFilter, settlementMonthFilter, settlementStatusFilter, settlementSearch, currentPage, itemsPerPage]);

  const fetchPaymentHistory = useCallback(async () => {
    try {
      const [summary, listResponse] = await Promise.all([
        getAdminPaymentSummary(paymentMonthFilter),
        (async () => {
          const params = new URLSearchParams();
          params.set('yearMonth', paymentMonthFilter);
          params.set('page', String(Math.max(currentPage - 1, 0)));
          params.set('size', String(itemsPerPage));
          if (paymentSearch?.trim()) params.set('keyword', paymentSearch.trim());

          const response = await fetch(`${API_BASE_URL}/api/admin/finance/payments?${params.toString()}`, {
            headers: { ...authHeader() },
            credentials: 'include'
          });
          if (!response.ok) {
            throw new Error('Failed to load payments');
          }
          return response.json();
        })()
      ]);

      setPaymentSummary(summary || {});
      const content = Array.isArray(listResponse?.data?.content) ? listResponse.data.content : [];
      setPaymentHistory(content.map((item) => ({
        region: item.region || '미상',
        category: item.category || '미분류',
        mart: item.mart || '-',
        amount: item.amount || 0,
        commission: item.commission || 0,
        refundAmount: item.refundAmount || 0,
        status: item.status || '확인 대기'
      })));
    } catch (error) {
      console.error('결제 내역 조회 실패:', error);
      setPaymentSummary({
        grossPaymentAmount: 0,
        platformFeeRevenue: 0,
        refundAmount: 0,
        netRevenue: 0,
        paymentCount: 0,
        refundRequestedCount: 0,
        refundApprovedCount: 0,
        refundRejectedCount: 0,
        refundRequestedAmount: 0,
        refundApprovedAmount: 0,
        refundRejectedAmount: 0,
        regularSalesAmount: 0,
        subscriptionSalesAmount: 0
      });
      setPaymentHistory([]);
    }
  }, [paymentMonthFilter, currentPage, itemsPerPage, paymentSearch]);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchFinanceOverview();
      fetchOverviewReports();
    }
  }, [activeTab, fetchFinanceOverview, fetchOverviewReports]);

  useEffect(() => {
    if (activeTab === 'settlements') {
      fetchSettlementDashboard();
      fetchSettlementList();
    }
  }, [activeTab, fetchSettlementDashboard, fetchSettlementList]);

  useEffect(() => {
    if (activeTab === 'payments') {
      fetchPaymentHistory();
    }
  }, [activeTab, fetchPaymentHistory]);

  const handleExecuteSettlement = (type) => {
    const isStore = type === 'STORE';
    const targetItems = (isStore ? detailedSettlements : riderSettlements).filter(
      (s) => s.status === '확인 대기' || s.status === '지급 처리중' || s.status === '지급 실패'
    );
    if (!confirm(`${isStore ? '마트' : '라이더'} 정산 업무를 실행하시겠습니까?\n대상: ${targetItems.length}건`)) {
      return;
    }

    const execute = isStore ? executeAdminStoreSettlement : executeAdminRiderSettlement;
    execute(settlementMonthFilter)
      .then((result) => {
        alert(`정산 실행이 완료되었습니다.\n완료 건수: ${result?.completedCount ?? 0}건`);
        fetchSettlementDashboard();
        fetchSettlementList();
      })
      .catch((error) => {
        console.error('정산 실행 실패:', error);
        alert(error?.message || '정산 실행에 실패했습니다.');
      });
  };

  const handleExecuteSingleSettlement = (type, settlementId) => {
    const isStore = type === 'STORE';
    if (!confirm(`${isStore ? '마트' : '라이더'} 개별 정산을 실행하시겠습니까?`)) {
      return;
    }

    const execute = isStore ? executeAdminStoreSettlementSingle : executeAdminRiderSettlementSingle;
    execute(settlementId)
      .then(() => {
        alert('개별 정산이 완료되었습니다.');
        fetchSettlementDashboard();
        fetchSettlementList();
      })
      .catch((error) => {
        console.error('개별 정산 실행 실패:', error);
        alert(error?.message || '개별 정산 실행에 실패했습니다.');
      });
  };

  const handleInquiryAnswerSubmit = async (inquiry, answer, refresh) => {
    if (!answer || !answer.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }
    setIsSubmittingAnswer(true);
    try {
      await answerInquiry(inquiry.id, answer.trim());
      alert('답변을 등록했습니다.');
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
        return <OverviewTab chartPeriod={chartPeriod} setChartPeriod={setChartPeriod} setActiveTab={setActiveTab} detailedSettlements={detailedSettlements} riderSettlements={riderSettlements} reports={overviewReports} approvalItems={approvalItems} inquiryList={inquiryList} overviewStats={overviewStats} transactionTrend={transactionTrend} />;
      case 'stores':
        return (
          <StoresTab
            stores={stores}
            stats={storeStats}
            pageInfo={storePageInfo}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
            searchInput={storeSearchInput}
            setSearchInput={setStoreSearchInput}
            onSearch={handleStoreSearch}
            onOpenDetail={handleOpenStoreDetail}
          />
        );
      case 'riders':
        return (
          <RidersTab
            riders={riders}
            stats={riderStats}
            pageInfo={riderPageInfo}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
            searchInput={riderSearchInput}
            setSearchInput={setRiderSearchInput}
            onSearch={handleRiderSearch}
            onOpenDetail={handleOpenRiderDetail}
          />
        );
      case 'users':
        return (
          <UsersTab
            users={users}
            stats={userStats}
            pageInfo={userPageInfo}
            searchInput={userSearchInput}
            setSearchInput={setUserSearchInput}
            onSearch={handleUserSearch}
            expandedUserId={expandedUserId}
            setExpandedUserId={setExpandedUserId}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
            onOpenDetail={handleOpenUserDetail}
          />
        );
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
            onBannerReorder={async (newList) => {
              setBannerList(newList);
              try {
                await updateBannerOrder(newList);
              } catch (e) {
                console.error(e);
                alert('배너 순서 저장에 실패했습니다.');
              }
            }}
            onBannerAdd={() => { setCurrentBanner({ title: '', content: '', img: '', promotion: '', status: '노출 중', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }); setIsBannerModalOpen(true); }}
            onBannerEdit={(b) => { setCurrentBanner(b); setIsBannerModalOpen(true); }}
            onBannerDelete={async (b) => { if (!window.confirm('배너를 삭제하시겠습니까?')) return; try { await deleteBanner(b.id); fetchBanners(); } catch (e) { alert('삭제에 실패했습니다.'); } }}
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
            onFaqDelete={async (f) => { if (!window.confirm('FAQ를 삭제하시겠습니까?')) return; try { await deleteFaq(f.id); setFaqs(faqs.filter(x => x.id !== f.id)); alert('삭제했습니다.'); } catch (e) { alert('삭제 실패: ' + e.message); } }}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'payments':
        return <PaymentsTab paymentMonthFilter={paymentMonthFilter} setPaymentMonthFilter={setPaymentMonthFilter} paymentHistory={paymentHistory} paymentSearch={paymentSearch} paymentRegionFilter={paymentRegionFilter} setPaymentSearch={setPaymentSearch} setPaymentRegionFilter={setPaymentRegionFilter} paymentSummary={paymentSummary} />;
      case 'settlements':
        return <SettlementsTab settlementFilter={settlementFilter} setSettlementFilter={setSettlementFilter} detailedSettlements={detailedSettlements} riderSettlements={riderSettlements} settlementMonthFilter={settlementMonthFilter} setSettlementMonthFilter={setSettlementMonthFilter} settlementSearch={settlementSearch} settlementStatusFilter={settlementStatusFilter} setSettlementSearch={setSettlementSearch} setSettlementStatusFilter={setSettlementStatusFilter} handleExecuteSettlement={handleExecuteSettlement} handleExecuteSingleSettlement={handleExecuteSingleSettlement} settlementSummary={settlementSummary} settlementTrend={settlementTrend} riderSettlementSummary={riderSettlementSummary} riderSettlementTrend={riderSettlementTrend} pageInfo={settlementPageInfo} currentPage={currentPage} itemsPerPage={itemsPerPage} setCurrentPage={setCurrentPage} />;
      case 'approvals':
        return <ApprovalsTab approvalItems={approvalItems} approvalFilter={approvalFilter} approvalStatusFilter={approvalStatusFilter} setApprovalFilter={setApprovalFilter} setApprovalStatusFilter={setApprovalStatusFilter} handleOpenApproval={handleOpenApproval} currentPage={currentPage} itemsPerPage={itemsPerPage} setCurrentPage={setCurrentPage} />;
      case 'notifications':
        return (
          <NotificationsTab
            notificationHistory={notificationHistory}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
            broadcastTarget={broadcastTarget}
            setBroadcastTarget={setBroadcastTarget}
            broadcastTitle={broadcastTitle}
            setBroadcastTitle={setBroadcastTitle}
            broadcastContent={broadcastContent}
            setBroadcastContent={setBroadcastContent}
            onSendBroadcast={handleSendBroadcast}
          />
        );
      case 'reports':
      case 'reports_view':
        return (
          <ReportsTab
            reports={reports}
            reportsFilter={reportsFilter}
            reportsSearch={reportsSearch}
            setReportsFilter={setReportsFilter}
            setReportsSearch={setReportsSearch}
            setSelectedReport={setSelectedReport}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
            onOpenReport={fetchReportDetail}
          />
        );
      default:
        return <OverviewTab chartPeriod={chartPeriod} setChartPeriod={setChartPeriod} setActiveTab={setActiveTab} detailedSettlements={detailedSettlements} riderSettlements={riderSettlements} reports={overviewReports} approvalItems={approvalItems} inquiryList={inquiryList} overviewStats={overviewStats} transactionTrend={transactionTrend} />;
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
                    <span style={{ fontSize: '18px' }}>✔</span> 처리 결과 공식 답변
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
      {/* 사이드바 */}
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
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'approvals' ? '#334155' : 'transparent', color: activeTab === 'approvals' ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>📋 신청 관리</div>
        <div className={`nav-item ${activeTab === 'stores' ? 'active' : ''}`} 
          onClick={() => setActiveTab('stores')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'stores' ? '#334155' : 'transparent', color: activeTab === 'stores' ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>🏪 마트 관리</div>
        <div className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} 
          onClick={() => setActiveTab('users')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'users' ? '#334155' : 'transparent', color: activeTab === 'users' ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>👥 사용자 관리</div>
        <div className={`nav-item ${activeTab === 'riders' ? 'active' : ''}`} 
          onClick={() => setActiveTab('riders')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'riders' ? '#334155' : 'transparent', color: activeTab === 'riders' ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>🛵 배달원 관리</div>
        <div className={`nav-item ${activeTab === 'cms' ? 'active' : ''}`} 
          onClick={() => setActiveTab('cms')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'cms' ? '#334155' : 'transparent', color: activeTab === 'cms' ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>🧩 콘텐츠 관리</div>
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

      {/* 메인 콘텐츠 */}
      <div className="main-content" style={{ flexGrow: 1, padding: '40px' }}>
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700' }}>
            {activeTab === 'overview' ? '실시간 전체 현황' :
             activeTab === 'approvals' ? '신규 신청 관리' :
             activeTab === 'stores' ? '마트 관리' :
             activeTab === 'users' ? '사용자 관리' :
             activeTab === 'riders' ? '배달원 관리' :
             activeTab === 'payments' ? '결제 관리 센터' :
             activeTab === 'settlements' ? '정산 현황' :
             activeTab === 'cms' ? '콘텐츠 관리' :
             activeTab === 'reports' || activeTab === 'reports_view' ? '신고 및 분쟁 관리' :
             activeTab === 'notifications' ? '알림 발송 센터' :
             activeTab === 'inquiry' ? '1:1 문의 고객응대' : '관리자 대시보드'}
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
                  alert('수정했습니다.');
                } else {
                  await createNotice(currentNotice.title, currentNotice.content);
                  alert('등록했습니다.');
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
                  alert('수정했습니다.');
                } else {
                  const created = await createFaq(currentFAQ.question, currentFAQ.answer);
                  setFaqs([{ id: created.faqId, question: created.question, answer: created.answer }, ...faqs]);
                  alert('등록했습니다.');
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
            onSave={async () => {
              if (!currentBanner.title) {
                alert('제목은 필수 항목입니다.');
                return;
              }
              try {
                if (currentBanner.id) {
                  await updateBanner(currentBanner.id, currentBanner);
                  alert('수정했습니다.');
                } else {
                  await createBanner(currentBanner);
                  alert('등록했습니다.');
                }
                fetchBanners();
                setIsBannerModalOpen(false);
              } catch (e) {
                alert(e.message || '저장에 실패했습니다.');
              }
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
                    style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', fontSize: '24px', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}>횞</button>
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

