export const formatDate = (value) => {
  if (!value) return '-';
  return value.slice(0, 10);
};

/** ko-KR 로케일 날짜 포맷 (문의 등) */
export const formatDateLocale = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR').replace(/\./g, '.').replace(/\s/g, '');
};

export const statusLabelMap = {
  PENDING: 'PENDING',
  HELD: 'HELD',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

export const mapStoreApprovalItem = (item) => ({
  id: item.approvalId,
  type: 'STORE',
  name: item.storeName,
  email: item.ownerEmail || item.email || '',
  phone: item.ownerPhone || item.storePhone || item.phone || item.ownerContact || '',
  date: formatDate(item.appliedAt),
  status: statusLabelMap[item.status] || item.status,
  rawStatus: item.status,
  color: '#10b981',
  category: 'STORE',
  backend: {
    approvalId: item.approvalId
  }
});

export const mapRiderApprovalItem = (item) => ({
  id: item.approvalId,
  type: 'RIDER',
  name: item.userName,
  email: item.userEmail || item.email || '',
  phone: item.userPhone || item.phone || item.contact || '',
  date: formatDate(item.appliedAt),
  status: statusLabelMap[item.status] || item.status,
  rawStatus: item.status,
  color: '#f59e0b',
  category: 'RIDER',
  backend: {
    approvalId: item.approvalId
  }
});

export const extractDocument = (documents, type) => {
  const match = documents.find((doc) => doc.documentType === type);
  return match ? match.documentUrl : '';
};
