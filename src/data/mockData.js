export const categories = [
  { id: 'all', name: '전체', icon: '🏠' },
  { id: 'mart', name: '마트/슈퍼', icon: '🛒' },
  { id: 'fruit', name: '청과물', icon: '🍎' },
  { id: 'butcher', name: '정육점', icon: '🥩' },
  { id: 'fish', name: '수산시장', icon: '🐟' },
  { id: 'bakery', name: '베이커리', icon: '🥐' },
  { id: 'banchan', name: '반찬가게', icon: '🍱' },
  { id: 'hardware', name: '철물/생활', icon: '🔧' },
  { id: 'snack', name: '간식/분식', icon: '🍡' },
  { id: 'empty', name: '준비 중', icon: '⌛' }
];

const generateProducts = (storeName) => {
  const commonProducts = [
    { id: 101, name: '베스트 세트', price: 15000, category: '추천 메뉴', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80', desc: '가장 인기 있는 구성입니다.' },
    { id: 102, name: '실속 꾸러미', price: 12000, category: '추천 메뉴', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=200&q=80', desc: '합리적인 가격의 실속 있는 선택!' },
    { id: 201, name: `${storeName} 한정 상품`, price: 8000, category: '일반 상품', img: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=200&q=80', desc: '신선한 품질을 약속합니다.' },
    { id: 202, name: '데일리 신선팩', price: 5000, category: '일반 상품', img: 'https://images.unsplash.com/photo-1540324155974-75223c3b171a?auto=format&fit=crop&w=200&q=80', desc: '매일매일 들어오는 신선한 상품!' },
    { id: 301, name: '창고 대방출 세일', price: 9900, category: '세일 중', img: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=200&q=80', desc: '마지막 한정 수량!' }
  ];
  return commonProducts.map(p => ({ ...p, id: Math.random().toString(36).substr(2, 9) }));
};

export const stores = [
  { id: 1, name: '성수동 햇살 청과', category: 'fruit', rate: 4.8, reviews: 128, time: '15분 내 도착', img: 'https://images.unsplash.com/photo-1488459711615-de61859233bd?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', products: generateProducts('햇살 청과'), isOpen: true },
  { id: 2, name: '망원시장 싱싱 정육', category: 'butcher', rate: 4.9, reviews: 256, time: '20분 내 도착', img: 'https://images.unsplash.com/photo-1607623273573-599d75b03519?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', products: generateProducts('싱싱 정육'), isOpen: true },
  { id: 3, name: '연남동 바다 수산', category: 'fish', rate: 4.7, reviews: 89, time: '25분 내 도착', img: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', products: generateProducts('바다 수산'), isOpen: true },
  { id: 4, name: '합정동 소문난 마트', category: 'mart', rate: 4.6, reviews: 154, time: '12분 내 도착', img: 'https://images.unsplash.com/photo-1578916171728-46686eac8d1f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', products: generateProducts('소문난 마트'), isOpen: false },
  { id: 13, name: '성심당 마포점', category: 'bakery', rate: 4.9, reviews: 1024, time: '40분 내 도착', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80', products: generateProducts('성심당'), isOpen: true },
  { id: 6, name: '서교동 로컬 반찬', category: 'banchan', rate: 4.8, reviews: 75, time: '18분 내 도착', img: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', products: generateProducts('로컬 반찬'), isOpen: true },
  { id: 7, name: '우리동네 철물점', category: 'hardware', rate: 4.5, reviews: 42, time: '30분 내 도착', img: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', products: generateProducts('철물점'), isOpen: false },
  { id: 16, name: '행복한 수퍼마켓', category: 'mart', rate: 4.6, reviews: 85, time: '12분 내 도착', img: 'https://images.unsplash.com/photo-1550583724-125581f77833?auto=format&fit=crop&w=400&q=80', products: generateProducts('행복한 수퍼'), isOpen: true },
  { id: 20, name: '바삭이네 분식', category: 'snack', rate: 4.7, reviews: 450, time: '30분 내 도착', img: 'https://images.unsplash.com/photo-1585117822944-77e87aed24fe?auto=format&fit=crop&w=400&q=80', products: generateProducts('바삭이네'), isOpen: true }
];

export const orders = [
  { id: '20240123-001', date: '2024.01.23', store: '소문난 마트 합정점', items: '유기농 우유 외 2건', product: '유기농 우유 1L', price: '12,500원', status: '주문 접수 중', img: 'https://images.unsplash.com/photo-1550583724-125581f77833?w=120&q=80', reviewWritten: false },
  { id: '20240122-001', date: '2024.01.22', store: '성수동 햇살 청과', items: '사과 외 3건', product: '꿀사과 5kg 한박스', price: '23,400원', status: '배송 완료', img: 'https://images.unsplash.com/photo-1488459711615-de61859233bd?w=120&q=80', reviewWritten: false },
  { id: '20240122-005', date: '2024.01.22', store: '연남동 바다 수산', items: '모듬 회', product: '제철 모듬회 (대)', price: '45,000원', status: '배송 중', img: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=120&q=80', reviewWritten: false },
  { id: '20240121-045', date: '2024.01.21', store: '망원시장 싱싱 정육', items: '한우 등심 외 1건', product: '1++ 한우 등심 600g', price: '85,000원', status: '배송 완료', img: 'https://images.unsplash.com/photo-1607623273573-599d75b03519?w=120&q=80', reviewWritten: true },
  { id: '20240120-012', date: '2024.01.20', store: '베러 밀키트 샵', items: '밀푀유나베 키트', product: '따끈한 밀푀유나베 (2인분)', price: '18,900원', status: '배송 완료', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&q=80', reviewWritten: true }
];

export const notifications = [
  { id: 1, title: '배송 시작', message: '성수동 햇살 청과에서 상품 배송을 시작했습니다.', time: '방금 전', unread: true },
  { id: 2, title: '쿠폰 발급', message: '신규 가입 기념 3,000원 할인 쿠폰이 발급되었습니다.', time: '2시간 전', unread: true },
  { id: 3, title: '배송 완료', message: '망원시장 싱싱 정육 상품이 문 앞에 도착했습니다.', time: '어제', unread: false }
];

export const subscriptions = [
  { 
    id: 1, name: '신선 채소 꾸러미', period: '주 1회 (목)', price: '19,900원/월', status: '구독중', img: '🥬', nextPayment: '2026.02.05',
    monthlyCount: '4회', includedItems: ['유기농 상추 200g', '친환경 오이 2개', '무농약 토마토 500g', '계절 채소 1종']
  },
  { 
    id: 2, name: '데일리 발효유 구독', period: '주 3회 (월,수,금)', price: '12,000원/월', status: '해지 예정', img: '🥛', nextPayment: '2026.02.01',
    monthlyCount: '12회', includedItems: ['플레인 요거트 150ml', '저지방 우유 200ml', '프리미엄 요구르트']
  },
  { 
    id: 3, name: '주간 제철 과일', period: '격주 1회 (토)', price: '29,900원/월', status: '해지됨', img: '🍎', nextPayment: '-',
    monthlyCount: '2회', includedItems: ['꿀부사 사과 3알', '고당도 배 1알', '제철 과일 팩 (랜덤)']
  }
];

export const subscriptionPayments = [
  { id: 'SP-001', name: '신선 채소 꾸러미', date: '2026.01.05', amount: '19,900원', status: '결제완료' },
  { id: 'SP-002', name: '데일리 발효유 구독', date: '2026.01.01', amount: '12,000원', status: '결제완료' },
  { id: 'SP-003', name: '신선 채소 꾸러미', date: '2025.12.05', amount: '19,900원', status: '결제완료' }
];

export const reviews = [
  { id: 1, store: '성수동 햇살 청과', date: '2024.01.21', rate: 5, content: '과일이 정말 신선해요! 배달도 빠르고 좋습니다.', img: 'https://images.unsplash.com/photo-1488459711615-de61859233bd?w=100&q=80' },
  { id: 2, store: '베러 밀키트 샵', date: '2024.01.19', rate: 4, content: '밀키트 구성이 알차서 저녁 해결하기 딱 좋네요.', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&q=80' },
  { id: 3, store: '망원시장 싱싱 정육', date: '2024.01.15', rate: 5, content: '고기 질이 정말 좋네요. 단골 될 것 같아요.', img: 'https://images.unsplash.com/photo-1607623273573-599d75b03519?w=100&q=80' }
];

export const addresses = [
  { id: 1, label: '우리집', address: '서울특별시 강남구 역삼동 123-45', detail: '푸르지오 아파트 102동 1504호', contact: '010-1234-5678', isDefault: true, entranceType: 'LOCKED', entrancePassword: '#1234' },
  { id: 2, label: '회사', address: '서울특별시 서초구 서초동 998-1', detail: '강남빌딩 12층 테헤란로 411', contact: '010-9876-5432', isDefault: false, entranceType: 'FREE', entrancePassword: '' }
];

export const paymentMethods = [
  { id: 1, type: 'card', name: '현대카드', number: '**** 1234', isDefault: true, color: '#000000' },
  { id: 2, type: 'card', name: '신한카드', number: '**** 5678', isDefault: false, color: '#0046ff' },
  { id: 3, type: 'easy', name: '네이버페이', isDefault: false, color: '#03c75a' },
  { id: 4, type: 'easy', name: '카카오페이', isDefault: false, color: '#fee500' }
];

export const faqs = [
  { id: 1, category: '주문/결제', question: '주문 취소는 어떻게 하나요?', answer: "주문 접수 전 상태에서는 '마이페이지 > 최근 주문 내역'에서 직접 취소가 가능합니다. '준비 중' 이후 상태에서는 마트 고객센터로 문의 부탁드립니다." },
  { id: 2, category: '배송/운영', question: '배송 소요 시간은 얼마나 걸리나요?', answer: "동네마켓은 실시간 배송 서비스를 지향합니다. 평균적으로 주문 후 30분~1시간 이내에 배송이 완료되며, 기상 상황이나 매장 사정에 따라 지연될 수 있습니다." },
  { id: 3, category: '회원/기타', question: '회원 탈퇴는 어디서 하나요?', answer: "'마이페이지 > 설정' 하단에서 탈퇴가 가능합니다. 탈퇴 시 보유 중인 쿠폰과 포인트는 모두 소멸되며 복구가 불가능하니 주의해 주세요." },
  { id: 4, category: '주문/결제', question: '결제 수단 변경이 가능한가요?', answer: "이미 완료된 주문의 결제 수단 변경은 불가능합니다. 주문 취소 후 새로운 결제 수단으로 다시 주문해 주셔야 합니다." },
  { id: 5, category: '배송/운영', question: '배송지가 잘못 입력되었어요.', answer: "배달이 시작되기 전이라면 빠르게 마트나 라이더에게 연락하여 주소 변경을 요청할 수 있습니다. 이미 배송이 진행 중인 경우 변경이 어려울 수 있습니다." },
  { id: 6, category: '서비스 이용', question: '동네마켓은 전국 어디서든 이용 가능한가요?', answer: "현재 서울 주요 지역에서 시범 서비스 중이며, 순차적으로 서비스 지역을 확대하고 있습니다. 앱 상단의 주소 설정을 통해 서비스 가능 여부를 확인하실 수 있습니다." }
];

export const notices = [
  { id: 1, title: '[공지] 동네마켓 서비스 지역 확대 안내 (마포구/서대문구)', date: '2024.01.20', content: '많은 분들의 요청에 힘입어 마포구와 서대문구 전 지역으로 서비스를 확대하게 되었습니다.' },
  { id: 2, title: '[이벤트] 친구 초대하고 5,000원 쿠폰 받자!', date: '2024.01.15', content: '친구에게 동네마켓을 소개하고, 친구가 첫 주문을 완료하면 두 분 모두에게 5,000원 할일 쿠폰을 드립니다.' },
  { id: 3, title: '[점검] 시스템 정기 점검 안내 (1/25)', date: '2024.01.10', content: '보다 안정적인 서비스 제공을 위해 1월 25일 새벽 2시부터 4시까지 시스템 정기 점검이 진행될 예정입니다.' }
];

export const coupons = [
  { id: 1, name: '신규 가입 감사 쿠폰', discount: '3,000원', minOrder: '15,000원 이상 구매 시', expiry: '2024.02.28', status: '사용 가능' },
  { id: 2, name: '주말 깜짝 할인 쿠폰', discount: '2,000원', minOrder: '20,000원 이상 구매 시', expiry: '2024.01.31', status: '사용 가능' },
  { id: 3, name: '첫 주문 완료 보너스', discount: '5,000원', minOrder: '30,000원 이상 구매 시', expiry: '2024.03.15', status: '대기 중' }
];

export const inquiries = [
  { id: 1, type: '배송 문의', title: '배송이 아직 안 왔어요.', content: '1시간 전에 주문했는데 아직 배송 중으로 뜨네요. 확인 부탁드립니다.', date: '2024.01.21', status: '답변 완료', answer: '안녕하세요 고객님, 현재 기상 상황으로 인해 배송이 다소 지연되었습니다. 10분 내로 도착 예정입니다. 불편을 드려 죄송합니다.' },
  { id: 2, type: '결제 문의', title: '카드 결제 취소 확인 부탁드려요.', content: '주문 취소했는데 카드 취소 문자가 안 와서 문의드립니다.', date: '2024.01.18', status: '접수 완료' }
];

export const loyaltyPoints = 2450;
