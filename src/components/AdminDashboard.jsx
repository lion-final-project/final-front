import React, { useState } from 'react';

const RecordDetailModal = ({ record, onClose, onToggleStatus, reports, onShowReports }) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showStopInput, setShowStopInput] = useState(false);
  const [reason, setReason] = useState('');

  if (!record) return null;
  const isStore = !!record.rep;
  const isUser = record.type === 'USER';

  // Filter reports related to this user/store
  const relatedReports = reports.filter(r => r.user === record.name || r.target === record.name || r.target.includes(record.name));

  const handleStatusChange = () => {
    if ((record.status === '정상' || record.status === '활성') && !showStopInput) {
      setShowStopInput(true);
      return;
    }
    onToggleStatus(record, reason);
    onClose();
    setShowStopInput(false);
    setReason('');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(3px)' }}>
      <div style={{ backgroundColor: '#1e293b', width: '100%', maxWidth: '550px', borderRadius: '24px', padding: '32px', border: '1px solid #334155', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>{isStore ? '마트 상세 정보' : isUser ? '고객 상세 정보' : '데이터 상세 조회'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '14px' }}>상호명/이름</span>
            <span style={{ fontWeight: '700' }}>{record.name}</span>
          </div>
          
          {isStore ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>대표자</span>
                <span>{record.rep}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>연락처</span>
                <span>{record.phone || '010-0000-0000'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>사업자번호</span>
                <span>{record.bizNum}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>정산 계좌</span>
                <span>{record.bank} (사본 확인됨 ✅)</span>
              </div>
            </>
          ) : isUser ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>지역</span>
                <span>{record.loc}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>누적 주문</span>
                <span>{record.orders}회</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>가입일</span>
                <span>{record.join}</span>
              </div>
              <div style={{ marginTop: '12px', padding: '16px', backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>누적 신고 내역 ({relatedReports.length}건)</span>
                    <button 
                      onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                      style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: isHistoryOpen ? '#38bdf8' : '#334155', color: isHistoryOpen ? '#0f172a' : '#38bdf8', border: 'none', fontSize: '11px', cursor: 'pointer', fontWeight: '800', transition: 'all 0.2s' }}>
                      {isHistoryOpen ? '닫기' : '이력 보기'}
                    </button>
                 </div>
                 
                 {isHistoryOpen && (
                   <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                     {relatedReports.length > 0 ? relatedReports.map((r, i) => (
                       <div key={i} style={{ padding: '10px', backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', fontSize: '12px' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                           <span style={{ color: '#ef4444', fontWeight: '700' }}>[{r.type}]</span>
                           <span style={{ color: '#94a3b8' }}>{r.time}</span>
                         </div>
                         <div style={{ color: '#cbd5e1' }}>{r.content}</div>
                       </div>
                     )) : (
                       <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '12px' }}>신고 내역이 없습니다.</div>
                     )}
                   </div>
                 )}
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>위치/차종</span>
                <span>{record.loc || record.vehicle || '-'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>등록된 운송 수단 및 상세 정보</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(record.vehicleList || [{ type: record.vehicle || '도보', model: '미등록', plate: '-', insurance: '미확인', status: '확인됨' }]).map((v, idx) => (
                    <div key={idx} style={{ padding: '12px', backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px' }}>
                       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e293b', borderRadius: '8px', padding: '8px' }}>
                          <span style={{ fontSize: '18px' }}>{v.type === '오토바이' ? '🛵' : v.type === '전기차' ? '🚗' : v.type === '자전거' ? '🚲' : '🚶'}</span>
                          <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: '800', marginTop: '4px' }}>{v.type}</span>
                       </div>
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div>
                             <div style={{ fontSize: '10px', color: '#64748b' }}>모델/번호</div>
                             <div style={{ fontSize: '12px', fontWeight: '700' }}>{v.model} ({v.plate})</div>
                          </div>
                          <div>
                             <div style={{ fontSize: '10px', color: '#64748b' }}>보험/상태</div>
                             <div style={{ fontSize: '12px', color: v.status === '승인됨' ? '#10b981' : '#f59e0b', fontWeight: '700' }}>{v.insurance} | {v.status}</div>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', marginTop: '4px' }}>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>연락처</span>
                <span>{record.phone || '010-1234-5678'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>정산 계좌</span>
                <span>{record.bank || '국민은행 110-***-123456'}</span>
              </div>
            </>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', borderTop: '1px solid #334155', paddingTop: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '14px' }}>현재 상태</span>
            <span style={{ color: record.status === '정상' || record.status === '활성' ? '#10b981' : '#ef4444', fontWeight: '800' }}>{record.status} {record.status === '정지' && '(사유: 운영 정책 위반)'}</span>
          </div>
        </div>

        {showStopInput && (
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#ef4444', fontWeight: '700', marginBottom: '8px' }}>🚫 계정 정지 사유 입력</label>
            <textarea 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="상세한 정지 사유를 입력해주세요..."
              style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #ef4444', color: 'white', fontSize: '14px', resize: 'none' }}
              rows="3"
            />
          </div>
        )}

        <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleStatusChange}
            style={{ 
              flex: 1, padding: '14px', borderRadius: '12px', 
              background: record.status === '정지' || record.status === '비활성' ? '#10b981' : '#ef4444', 
              color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer' 
            }}
          >
            {record.status === '정지' || record.status === '비활성' ? '활성화 처리' : showStopInput ? '정지 완료' : '이용 정지/비활성'}
          </button>
          <button style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#334155', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }} onClick={onClose}>취소/닫기</button>
        </div>
      </div>
    </div>
  );
};

const ApprovalDetailModal = ({ item, onClose, onAction }) => {
  if (!item) return null;
  const isStore = item.category === 'STORE';

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(5px)' }}>
      <div style={{ backgroundColor: '#1e293b', width: '100%', maxWidth: '650px', borderRadius: '24px', padding: '32px', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>신청 상세 검토</h2>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>신청 번호: #APP-2026-{item.id}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
           <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>기본 정보</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 <div style={{ fontSize: '15px', fontWeight: '700' }}>{item.name}</div>
                 <div style={{ fontSize: '13px', color: '#cbd5e1' }}>유형: {item.type}</div>
                 <div style={{ fontSize: '13px', color: '#cbd5e1' }}>신청일: {item.date}</div>
                 <div style={{ fontSize: '13px', color: '#f59e0b' }}>상태: {item.status}</div>
              </div>
           </div>
           <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>연락처 정보</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 <div style={{ fontSize: '13px', color: '#cbd5e1' }}>담당자: 홍길동</div>
                 <div style={{ fontSize: '13px', color: '#cbd5e1' }}>연락처: 010-1234-5678</div>
                 <div style={{ fontSize: '13px', color: '#cbd5e1' }}>이메일: contact@example.com</div>
              </div>
           </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
           <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', color: '#38bdf8' }}>제출 서류 확인 (클릭 시 확대)</div>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[
                { name: isStore ? '사업자등록증' : '신분증 사본', icon: '📄' },
                { name: isStore ? '영업신고증' : '운전면허증', icon: '🪪' },
                { name: '통장 사본', icon: '🏦' }
              ].map((doc, i) => (
                <div key={i} style={{ backgroundColor: '#334155', aspectRatio: '4/3', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid #475569', transition: 'all 0.2s' }} className="doc-hover">
                   <div style={{ fontSize: '24px', marginBottom: '8px' }}>{doc.icon}</div>
                   <div style={{ fontSize: '11px', color: '#cbd5e1', textAlign: 'center' }}>{doc.name}</div>
                </div>
              ))}
           </div>
        </div>

        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '16px', marginBottom: '32px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
           <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: '700', marginBottom: '4px' }}>🚨 심사 가이드라인</div>
           <div style={{ fontSize: '12px', color: '#fca5a5', lineHeight: '1.5' }}>
             서류 제출 기한은 영업일 기준 5일입니다. 기간 내 미비 서류를 보완하지 못하는 경우 자동으로 거절 처리됩니다.
           </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
           <button 
             onClick={() => onAction(item.id, 'APPROVED')}
             style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#10b981', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer' }}>승인 완료</button>
           <button 
             onClick={() => onAction(item.id, 'REJECTED')}
             style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#ef4444', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer' }}>거절 처리</button>
           <button 
             onClick={() => onAction(item.id, 'PENDING')}
             style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#f59e0b', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer' }}>보완 요청 (보류)</button>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [approvalFilter, setApprovalFilter] = useState('ALL'); // ALL, STORE, RIDER
  const [approvalItems, setApprovalItems] = useState([
    { id: 1, type: '마트', name: '싱싱 야채 센터 (강북점)', date: '2026-01-21', status: '검토 중', color: '#10b981', category: 'STORE' },
    { id: 2, type: '라이더', name: '김철수 (오토바이)', date: '2026-01-20', status: '서류 확인', color: '#38bdf8', category: 'RIDER' },
    { id: 3, type: '라이더', name: '박지민 (자전거)', date: '2026-01-22', status: '심사 대기', color: '#38bdf8', category: 'RIDER' },
    { id: 4, type: '마트', name: '유기농 세상', date: '2026-01-23', status: '서류 미비', color: '#10b981', category: 'STORE' },
    { id: 5, type: '마트', name: '동네 정육 나라', date: '2026-01-24', status: '검토 중', color: '#10b981', category: 'STORE' }
  ]);

  const [stores, setStores] = useState([
    { id: 'ST001', name: '행복 마트 강남점', loc: '역삼동', status: '정상', rep: '김행복', phone: '010-1234-5678', bizNum: '123-45-67890', bank: '국민은행 110-***-123456' },
    { id: 'ST002', name: '무림 정육점', loc: '삼성동', status: '정상', rep: '이무림', phone: '010-2222-3333', bizNum: '220-11-55555', bank: '신한은행 100-***-999888' },
    { id: 'ST003', name: '싱싱 야채 센터', loc: '역삼동', status: '비활성', rep: '박싱싱', phone: '010-9999-8888', bizNum: '333-22-11111', bank: '우리은행 1002-***-444555' }
  ]);
  const [users, setUsers] = useState([
    { id: 'USR001', name: '김지현', loc: '강남구', orders: 24, join: '2023.11.12', status: '활성', type: 'USER' },
    { id: 'USR002', name: '박준영', loc: '서초구', orders: 12, join: '2023.12.05', status: '활성', type: 'USER' },
    { id: 'USR003', name: '최수진', loc: '마포구', orders: 5, join: '2024.01.10', status: '정지', type: 'USER' },
    { id: 'USR004', name: '이민호', loc: '송파구', orders: 42, join: '2023.08.15', status: '활성', type: 'USER' },
    { id: 'USR005', name: '정다은', loc: '강동구', orders: 8, join: '2024.01.20', status: '활성', type: 'USER' }
  ]);

  const [reports, setReports] = useState([
    { id: 1, type: '배송지연', user: '김서연', target: '무림 정육점', status: '확인 중', time: '1시간 전', content: '예상 시간보다 30분이나 늦게 도착했습니다. 고기가 좀 녹았어요.' },
    { id: 2, type: '상품불량', user: '이영희', target: '행복 마트', status: '답변완료', time: '3시간 전', content: '사과에 멍이 너무 많이 들어있습니다. 교환 요청합니다.' },
    { id: 3, type: '불친절', user: '최수진', target: '라이더 김철수', status: '확인 중', time: '5시간 전', content: '라이더분이 너무 퉁명스럽게 물건을 던지듯 주고 가셨습니다.' }
  ]);

  const [riders, setRiders] = useState([
    { 
      id: 'RID001', name: '김철수', vehicle: '오토바이', status: '운행중', type: 'PROFESSIONAL', 
      phone: '010-1234-5678', bank: '신한은행 110-***-123456',
      vehicleList: [
        { type: '오토바이', model: '혼다 PCX 125', plate: '서울 가 1234', insurance: '유상운송가입', status: '승인됨' },
        { type: '전기자전거', model: '삼천리 팬텀 Q', plate: '-', insurance: '책임보험가입', status: '승인됨' }
      ]
    },
    { 
      id: 'RID002', name: '이영희', vehicle: '자전거', status: '운행 불가', type: 'RESIDENT', 
      phone: '010-2222-3333', bank: '우리은행 1002-***-987654',
      vehicleList: [
        { type: '자전거', model: '자이언트 Escape', plate: '-', insurance: '배달보험미가입', status: '반려됨' },
        { type: '도보', model: '-', plate: '-', insurance: '해당없음', status: '승인됨' }
      ]
    },
    { 
      id: 'RID003', name: '박민수', vehicle: '도보', status: '운행 불가', type: 'RESIDENT', 
      phone: '010-4444-5555', bank: '하나은행 123-***-555666',
      vehicleList: [
        { type: '도보', model: '-', plate: '-', insurance: '해당없음', status: '승인됨' }
      ]
    },
    { 
      id: 'RID004', name: '최현우', vehicle: '전기차', status: '운행중', type: 'PROFESSIONAL', 
      phone: '010-8888-9999', bank: '국민은행 110-***-000000',
      vehicleList: [
        { type: '전기차', model: '현대 아이오닉5', plate: '서울 나 5678', insurance: '영업용보험가입', status: '승인됨' },
        { type: '오토바이', model: '가와사키 닌자', plate: '서울 다 9999', insurance: '신규신청중', status: '검토중' }
      ]
    }
  ]);

  const [chartPeriod, setChartPeriod] = useState('weekly'); // weekly, monthly, yearly
  const [reportsFilter, setReportsFilter] = useState('ALL'); // ALL, RESOLVED, UNRESOLVED
  const [reportsSearch, setReportsSearch] = useState('');

  const [faqs, setFaqs] = useState([
    { id: 1, question: '배송이 지연되면 어떻게 하나요?', answer: '고객센터로 즉시 연락 주시면 배달원과 확인 후 조치해 드립니다.' },
    { id: 2, question: '마트 입점 절차가 궁금합니다.', answer: '상단 신청 관리 메뉴에서 서류를 제출하시면 영업일 기준 3일 내 심사가 진행됩니다.' }
  ]);

  const [settlementFilter, setSettlementFilter] = useState('ALL'); // ALL, STORE, RIDER
  const [settlements, setSettlements] = useState([
    { id: 'SET101', name: '행복 마트 강남점', type: 'STORE', amount: 4500000, date: '2026.01.20', status: '정산완료' },
    { id: 'SET102', name: '김철수 라이더', type: 'RIDER', amount: 350000, date: '2026.01.21', status: '정산예정' },
    { id: 'SET103', name: '무림 정육점', type: 'STORE', amount: 2800000, date: '2026.01.21', status: '정산완료' }
  ]);

  const [notificationHistory, setNotificationHistory] = useState([
    { id: 1, title: '설 연휴 배송 안내', target: '전체 사용자', date: '2026.01.20', status: '발송성공' },
    { id: 2, title: '신규 마트 입점 이벤트', target: '전체 고객', date: '2026.01.22', status: '발송성공' }
  ]);

  const [selectedReport, setSelectedReport] = useState(null);
  const [inquiryList, setInquiryList] = useState([
    { id: 1, type: '배송 문의', title: '배송이 아직 안 왔어요.', content: '1시간 전에 주문했는데 아직 배송 중으로 뜨네요.', user: '김영희', date: '2024.01.21', status: '답변 완료', answer: '대설로 인해 지연되었습니다. 현재 배송 중입니다.' },
    { id: 2, type: '결제 문의', title: '카드 결제 취소 확인 요청', content: '취소했는데 문자가 안 옵니다.', user: '이철수', date: '2024.01.18', status: '접수 완료' }
  ]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [inquiryAnswer, setInquiryAnswer] = useState('');

  const [noticeList, setNoticeList] = useState([
    { id: 1, title: '[공지] 동네마켓 서비스 지역 확대 안내', date: '2024.01.20', content: '마포구와 서대문구 전 지역으로 서비스를 확대하게 되었습니다.' },
    { id: 2, title: '[이벤트] 친구 초대하고 5,000원 쿠폰 받자!', date: '2024.01.15', content: '친구에게 동네마켓을 소개하고 할인 쿠폰을 받아보세요.' }
  ]);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [currentNotice, setCurrentNotice] = useState(null);

  const handleApprovalAction = (id, action) => {
    let statusText = '';
    let successMsg = '';
    
    if (action === 'APPROVED') {
      const approvedItem = approvalItems.find(item => item.id === id);
      if (approvedItem && approvedItem.category === 'RIDER') {
        successMsg = `[승인 완료] ${approvedItem.name} 라이더님에게 가입 승인 메일이 발송되었습니다.\n\n- 아이디: ${approvedItem.name}@neighbor.com\n- 임시 비밀번호: NM${Math.floor(1000 + Math.random() * 9000)}\n\n확인 버튼을 누르면 라이더 앱으로 연결됩니다.`;
      } else {
        successMsg = '선택한 항목이 승인되었습니다.';
      }
      statusText = '승인 완료';
    } else if (action === 'REJECTED') {
      statusText = '거절됨';
      successMsg = '신청이 거절 처리되었습니다.';
    } else {
      statusText = '보완 요청 중';
      successMsg = '보완 요청이 담당자에게 전달되었습니다.';
    }

    setApprovalItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: statusText } : item
    ));
    
    if (action === 'APPROVED' || action === 'REJECTED') {
      setTimeout(() => {
        setApprovalItems(prev => prev.filter(item => item.id !== id));
      }, 1500);
    }
    
    alert(successMsg);
    setSelectedApproval(null);
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

  const handleResolveReport = (id) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: '처리완료' } : r));
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'stores':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Store Stats Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              {[
                { label: '전체 마트', value: `${stores.length}개`, color: '#38bdf8' },
                { label: '운영 중', value: `${stores.filter(s => s.status === '정상').length}개`, color: '#10b981' },
                { label: '비활성 마트', value: `${stores.filter(s => s.status === '비활성').length}개`, color: '#ef4444' },
                { label: '신규 신청', value: '12건', color: '#f59e0b' }
              ].map((stat, i) => (
                <div key={i} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>{stat.label}</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>마트 목록 및 관리</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                   <input type="text" placeholder="마트명/지역 검색..." style={{ padding: '10px 16px', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '14px' }} />
                   <button style={{ padding: '10px 20px', borderRadius: '10px', backgroundColor: '#334155', border: 'none', color: 'white', fontWeight: '700', cursor: 'pointer' }}>검색</button>
                </div>
              </div>
              
              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '14px' }}>
                      <th style={{ padding: '16px' }}>마트명</th>
                      <th style={{ padding: '16px' }}>지역</th>
                      <th style={{ padding: '16px' }}>대표자</th>
                      <th style={{ padding: '16px' }}>상태</th>
                      <th style={{ padding: '16px' }}>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map((store, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #334155', fontSize: '15px' }}>
                        <td style={{ padding: '16px', fontWeight: '700' }}>{store.name}</td>
                        <td style={{ padding: '16px' }}>{store.loc}</td>
                        <td style={{ padding: '16px' }}>{store.rep}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ 
                            fontSize: '12px', 
                            backgroundColor: store.status === '정상' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                            color: store.status === '정상' ? '#10b981' : '#ef4444', 
                            padding: '4px 10px', borderRadius: '6px', fontWeight: '800' 
                          }}>● {store.status === '정상' ? '운영중' : '중지됨'}</span>
                        </td>
                        <td style={{ padding: '16px' }}>
                           <button 
                             onClick={() => setSelectedRecord(store)}
                             style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: 'none', cursor: 'pointer', fontWeight: '800' }}
                           >상세정보</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'riders':
        const riderStats = [
          { label: '전체 배달원', value: `${riders.length}명`, color: '#38bdf8' },
          { label: '현재 운행중', value: `${riders.filter(r => r.status === '운행중').length}명`, color: '#10b981' },
          { label: '전문 라이더', value: `${riders.filter(r => r.type === 'PROFESSIONAL').length}명`, color: '#f59e0b' }
        ];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Rider Stats Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              {riderStats.map((stat, i) => (
                <div key={i} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>{stat.label}</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>배달 네트워크 관리</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                   <input type="text" placeholder="이름/차종 검색..." style={{ padding: '10px 16px', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '14px' }} />
                   <button style={{ padding: '10px 20px', borderRadius: '10px', backgroundColor: '#334155', border: 'none', color: 'white', fontWeight: '700', cursor: 'pointer' }}>검색</button>
                </div>
              </div>
              
              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '14px' }}>
                      <th style={{ padding: '16px' }}>이름</th>
                      <th style={{ padding: '16px' }}>유형</th>
                      <th style={{ padding: '16px' }}>운송수단</th>
                      <th style={{ padding: '16px' }}>상태</th>
                      <th style={{ padding: '16px' }}>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riders.map((rider, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #334155', fontSize: '15px' }}>
                        <td style={{ padding: '16px', fontWeight: '700' }}>{rider.name}</td>
                        <td style={{ padding: '16px' }}>
                           <span style={{ fontSize: '12px', color: rider.type === 'PROFESSIONAL' ? '#38bdf8' : '#f59e0b' }}>
                              {rider.type === 'PROFESSIONAL' ? '전문' : '주민'}
                           </span>
                        </td>
                        <td style={{ padding: '16px' }}>{rider.vehicle}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ 
                            fontSize: '12px', 
                            backgroundColor: rider.status === '운행중' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                            color: rider.status === '운행중' ? '#10b981' : '#ef4444', 
                            padding: '4px 10px', borderRadius: '6px', fontWeight: '800' 
                          }}>● {rider.status}</span>
                        </td>
                        <td style={{ padding: '16px' }}>
                           <button 
                             onClick={() => setSelectedRecord(rider)}
                             style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: 'none', cursor: 'pointer', fontWeight: '800' }}
                           >상세정보</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'users':
        const userStats = [
          { label: '전체 고객', value: '12,504명', color: '#38bdf8' },
          { label: '활성 사용자', value: '11,822명', color: '#10b981' },
          { label: '금월 신규', value: '425명', color: '#f59e0b' },
          { label: '정지 계정', value: '12명', color: '#ef4444' }
        ];

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* User Stats Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              {userStats.map((stat, i) => (
                <div key={i} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>{stat.label}</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>사용자 목록 및 활동 관리</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                   <input type="text" placeholder="고객명 검색..." style={{ padding: '10px 16px', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '14px' }} />
                   <button style={{ padding: '10px 20px', borderRadius: '10px', backgroundColor: '#334155', border: 'none', color: 'white', fontWeight: '700', cursor: 'pointer' }}>검색</button>
                </div>
              </div>
              
              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '14px' }}>
                      <th style={{ padding: '16px' }}>고객명</th>
                      <th style={{ padding: '16px' }}>지역</th>
                      <th style={{ padding: '16px' }}>주문 횟수</th>
                      <th style={{ padding: '16px' }}>가입일</th>
                      <th style={{ padding: '16px' }}>상태</th>
                      <th style={{ padding: '16px' }}>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #334155', fontSize: '15px' }}>
                        <td style={{ padding: '16px', fontWeight: '700' }}>{user.name}</td>
                        <td style={{ padding: '16px' }}>{user.loc}</td>
                        <td style={{ padding: '16px' }}>{user.orders}회</td>
                        <td style={{ padding: '16px' }}>{user.join}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ 
                            fontSize: '12px', 
                            backgroundColor: user.status === '활성' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                            color: user.status === '활성' ? '#10b981' : '#ef4444', 
                            padding: '4px 10px', borderRadius: '6px', fontWeight: '800' 
                          }}>● {user.status}</span>
                        </td>
                        <td style={{ padding: '16px' }}>
                           <button 
                             onClick={() => setSelectedRecord(user)}
                             style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: 'none', cursor: 'pointer', fontWeight: '800' }}
                           >상세정보</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'inquiry':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>전체 문의 내역</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ padding: '8px 16px', borderRadius: '8px', background: '#334155', color: 'white', border: 'none', cursor: 'pointer' }}>답변 대기</button>
                  <button style={{ padding: '8px 16px', borderRadius: '8px', background: '#334155', color: 'white', border: 'none', cursor: 'pointer' }}>답변 완료</button>
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '14px' }}>
                    <th style={{ padding: '16px' }}>유형</th>
                    <th style={{ padding: '16px' }}>제목</th>
                    <th style={{ padding: '16px' }}>고객명</th>
                    <th style={{ padding: '16px' }}>작성일</th>
                    <th style={{ padding: '16px' }}>상태</th>
                    <th style={{ padding: '16px' }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiryList.map((inq, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '16px' }}><span style={{ color: '#38bdf8' }}>[{inq.type}]</span></td>
                      <td style={{ padding: '16px' }}>{inq.title}</td>
                      <td style={{ padding: '16px' }}>{inq.user}</td>
                      <td style={{ padding: '16px' }}>{inq.date}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          fontSize: '11px', padding: '4px 10px', borderRadius: '6px', 
                          backgroundColor: inq.status === '답변 완료' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                          color: inq.status === '답변 완료' ? '#10b981' : '#f59e0b', fontWeight: '800' 
                        }}>{inq.status}</span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <button 
                          onClick={() => setSelectedInquiry(inq)}
                          style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', cursor: 'pointer', fontWeight: '800' }}
                        >답변하기</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedInquiry && (
              <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div style={{ background: '#1e293b', width: '100%', maxWidth: '600px', borderRadius: '24px', padding: '32px', border: '1px solid #334155' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>문의 답변 작성</h3>
                  <div style={{ marginBottom: '20px', padding: '20px', background: '#0f172a', borderRadius: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>[{selectedInquiry.type}] {selectedInquiry.user} 고객님</div>
                    <div style={{ fontWeight: '700', marginBottom: '8px' }}>{selectedInquiry.title}</div>
                    <div style={{ fontSize: '14px', color: '#cbd5e1' }}>{selectedInquiry.content}</div>
                  </div>
                  <textarea 
                    value={inquiryAnswer}
                    onChange={(e) => setInquiryAnswer(e.target.value)}
                    placeholder="답변 내용을 입력하세요"
                    style={{ width: '100%', height: '150px', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '16px', color: 'white', resize: 'none', marginBottom: '24px' }}
                  ></textarea>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => setSelectedInquiry(null)} style={{ flex: 1, padding: '16px', borderRadius: '12px', background: '#334155', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>취소</button>
                    <button 
                      onClick={() => {
                        alert('답변이 등록되었습니다.');
                        setInquiryList(prev => prev.map(q => q.id === selectedInquiry.id ? { ...q, status: '답변 완료', answer: inquiryAnswer } : q));
                        setSelectedInquiry(null);
                        setInquiryAnswer('');
                      }} 
                      style={{ flex: 2, padding: '16px', borderRadius: '12px', background: '#38bdf8', color: '#0f172a', border: 'none', fontWeight: '800', cursor: 'pointer' }}>답변 등록</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'cms':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>홈 페이지 배너 관리</h2>
                <button style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#38bdf8', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>+ 새 배너 추가</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                {[
                  { title: '겨울철 비타민 충전!', color: 'linear-gradient(45deg, #ff9a9e, #fad0c4)', status: '노출 중' },
                  { title: '따끈따끈 밀키트', color: 'linear-gradient(120deg, #a1c4fd, #c2e9fb)', status: '노출 중' }
                ].map((banner, i) => (
                  <div key={i} style={{ borderRadius: '16px', padding: '20px', background: banner.color, position: 'relative', height: '120px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ color: 'white' }}>
                      <div style={{ fontSize: '18px', fontWeight: '800' }}>{banner.title}</div>
                      <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.9 }}>{banner.status}</div>
                    </div>
                    <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px' }}>
                      <button style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', fontSize: '11px', cursor: 'pointer' }}>수정</button>
                      <button style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.3)', border: 'none', color: 'white', fontSize: '11px', cursor: 'pointer' }}>삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>공지사항 관리</h2>
                <button 
                  onClick={() => {
                    setCurrentNotice({ title: '', content: '', date: new Date().toISOString().split('T')[0].replace(/-/g, '.') });
                    setIsNoticeModalOpen(true);
                  }}
                  style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#38bdf8', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                >+ 공지 등록</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {noticeList.map(notice => (
                  <div key={notice.id} style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                           <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{notice.date}</div>
                           <div style={{ fontWeight: '800', fontSize: '16px' }}>{notice.title}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                           <button 
                             onClick={() => {
                               setCurrentNotice(notice);
                               setIsNoticeModalOpen(true);
                             }}
                             style={{ border: 'none', background: 'transparent', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' }}>수정</button>
                           <button 
                             onClick={() => {
                               if (window.confirm('공지사항을 삭제하시겠습니까?')) {
                                  setNoticeList(noticeList.filter(n => n.id !== notice.id));
                               }
                             }}
                             style={{ border: 'none', background: 'transparent', color: '#ef4444', fontSize: '12px', cursor: 'pointer' }}>삭제</button>
                        </div>
                     </div>
                     <div style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>{notice.content}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>자주 묻는 질문 (FAQ) 관리</h2>
                <button 
                  onClick={() => alert('신규 FAQ 등록 화면으로 이동')}
                  style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#38bdf8', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                >+ FAQ 등록</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {faqs.map(faq => (
                  <div key={faq.id} style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '12px' }}>
                        <div style={{ fontWeight: '800', color: '#38bdf8' }}>Q. {faq.question}</div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                           <button style={{ border: 'none', background: 'transparent', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' }}>수정</button>
                           <button 
                             onClick={() => setFaqs(faqs.filter(f => f.id !== faq.id))}
                             style={{ border: 'none', background: 'transparent', color: '#ef4444', fontSize: '12px', cursor: 'pointer' }}>삭제</button>
                        </div>
                     </div>
                     <div style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>A. {faq.answer}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'settlement':
        const filteredSettlements = settlements.filter(s => settlementFilter === 'ALL' || s.type === settlementFilter);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Headquarters Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {[
                { label: '본사 누적 매출', value: '₩ 842,500,000', color: '#38bdf8' },
                { label: '본사 순이익 (수수료)', value: '₩ 124,480,000', color: '#10b981' },
                { label: '미정산 잔액', value: '₩ 14,250,500', color: '#f59e0b' }
              ].map((stat, i) => (
                <div key={i} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '20px', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>{stat.label}</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800' }}>전체 정산 내역 조회</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <select 
                    value={settlementFilter}
                    onChange={(e) => setSettlementFilter(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none' }}
                  >
                    <option value="ALL">전체 대상</option>
                    <option value="STORE">마트 개별 정산</option>
                    <option value="RIDER">배달원 별 정산</option>
                  </select>
                </div>
              </div>

              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '14px' }}>
                      <th style={{ padding: '16px' }}>대상 이름</th>
                      <th style={{ padding: '16px' }}>유형</th>
                      <th style={{ padding: '16px' }}>정산금액</th>
                      <th style={{ padding: '16px' }}>정산기준일</th>
                      <th style={{ padding: '16px' }}>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSettlements.map((s, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #334155', fontSize: '14px' }}>
                        <td style={{ padding: '16px', fontWeight: '700' }}>{s.name}</td>
                        <td style={{ padding: '16px' }}>{s.type === 'STORE' ? '마트' : '배달원'}</td>
                        <td style={{ padding: '16px' }}>₩ {s.amount.toLocaleString()}</td>
                        <td style={{ padding: '16px' }}>{s.date}</td>
                        <td style={{ padding: '16px' }}>
                           <span style={{ color: s.status === '정산완료' ? '#10b981' : '#f59e0b' }}>{s.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'approvals':
        const filteredApprovals = approvalItems.filter(item => {
          if (approvalFilter === 'ALL') return true;
          return item.category === approvalFilter;
        });

        return (
          <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>신규 신청 및 승인 관리</h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <select 
                  value={approvalFilter}
                  onChange={(e) => setApprovalFilter(e.target.value)}
                  style={{ 
                    padding: '10px 16px', 
                    borderRadius: '10px', 
                    backgroundColor: '#0f172a', 
                    border: '1px solid #334155', 
                    color: 'white', 
                    fontSize: '14px', 
                    outline: 'none',
                    minWidth: '150px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="ALL">전체 보기</option>
                  <option value="STORE">마트 신청 건</option>
                  <option value="RIDER">라이더 신청 건</option>
                </select>
              </div>
            </div>
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '14px' }}>
                    <th style={{ padding: '16px' }}>유형</th>
                    <th style={{ padding: '16px' }}>이름/상호명</th>
                    <th style={{ padding: '16px' }}>신청일</th>
                    <th style={{ padding: '16px' }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApprovals.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '16px' }}>
                        <span style={{ backgroundColor: item.color, padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{item.type}</span>
                      </td>
                      <td style={{ padding: '16px' }}>{item.name}</td>
                      <td style={{ padding: '16px' }}>{item.date}</td>
                      <td style={{ padding: '16px' }}>
                         <button 
                           onClick={() => setSelectedApproval(item)}
                           style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: 'none', fontWeight: '700', cursor: 'pointer' }}>상세보기</button>
                      </td>
                    </tr>
                  ))}
                  {filteredApprovals.length === 0 && (
                    <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>대기 중인 신청 건이 없습니다.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155', maxWidth: '800px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '32px' }}>새 알림 발송</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                   <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>발송 대상</label>
                      <select style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white' }}>
                        <option>전체 사용자</option>
                        <option>전체 고객</option>
                        <option>전체 마트 사장님</option>
                        <option>전체 배달원</option>
                      </select>
                   </div>
                   <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>알림 유형</label>
                      <select style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white' }}>
                        <option>긴급 공지</option>
                        <option>마케팅 홍보</option>
                        <option>배송 안내</option>
                      </select>
                   </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>알림 제목</label>
                  <input type="text" placeholder="제목을 입력하세요" style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>알림 내용</label>
                  <textarea rows="4" placeholder="내용을 입력하세요" style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', resize: 'none' }}></textarea>
                </div>
                <button 
                  onClick={() => alert('알림 발송이 예약되었습니다.')}
                  style={{ padding: '16px', borderRadius: '8px', border: 'none', backgroundColor: '#38bdf8', color: 'white', fontWeight: '800', cursor: 'pointer', marginTop: '10px' }}
                >푸시 알림 발송하기</button>
              </div>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
               <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>최근 발송 내역</h2>
               <div className="table-responsive">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '14px' }}>
                        <th style={{ padding: '16px' }}>알림 제목</th>
                        <th style={{ padding: '16px' }}>수신 대상</th>
                        <th style={{ padding: '16px' }}>발송 시간</th>
                        <th style={{ padding: '16px' }}>상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notificationHistory.map((h, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #334155', fontSize: '14px' }}>
                           <td style={{ padding: '16px', fontWeight: '600' }}>{h.title}</td>
                           <td style={{ padding: '16px' }}>{h.target}</td>
                           <td style={{ padding: '16px' }}>{h.date}</td>
                           <td style={{ padding: '16px' }}>
                              <span style={{ color: '#10b981' }}>✓ {h.status}</span>
                           </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
          </div>
        );
      case 'reports':
      case 'reports_view':
        const filteredReports = reports.filter(report => {
           const matchesStatus = 
             reportsFilter === 'ALL' || 
             (reportsFilter === 'RESOLVED' && (report.status === '처리완료' || report.status === '답변완료')) ||
             (reportsFilter === 'UNRESOLVED' && report.status === '확인 중');
           
           const matchesSearch = 
             report.target.toLowerCase().includes(reportsSearch.toLowerCase()) ||
             report.user.toLowerCase().includes(reportsSearch.toLowerCase());

           return matchesStatus && matchesSearch;
        });

        return (
          <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>신고 및 분쟁 관리</h2>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                   <div style={{ position: 'relative' }}>
                      <input 
                        type="text" 
                        placeholder="배달원명/마트명 검색..." 
                        value={reportsSearch}
                        onChange={(e) => setReportsSearch(e.target.value)}
                        style={{ padding: '8px 16px', paddingLeft: '36px', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '13px', width: '220px' }} 
                      />
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
                   </div>
                   <div style={{ display: 'flex', background: '#0f172a', padding: '4px', borderRadius: '10px', gap: '4px' }}>
                      {['ALL', 'UNRESOLVED', 'RESOLVED'].map(f => (
                        <button 
                          key={f}
                          onClick={() => setReportsFilter(f)}
                          style={{ 
                            padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', border: 'none',
                            backgroundColor: reportsFilter === f ? '#38bdf8' : 'transparent',
                            color: reportsFilter === f ? '#0f172a' : '#94a3b8',
                            transition: 'all 0.2s'
                          }}
                        >
                          {f === 'ALL' ? '전체' : f === 'UNRESOLVED' ? '미처리' : '해결됨'}
                        </button>
                      ))}
                   </div>
                </div>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               {filteredReports.map((report, i) => (
                 <div key={i} style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                       <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>{report.type}</span>
                       <span style={{ fontSize: '12px', color: '#94a3b8' }}>{report.time}</span>
                    </div>
                    <div style={{ marginBottom: '16px', fontWeight: '600' }}>{report.user} → {report.target}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontSize: '13px', color: report.status === '확인 중' ? '#f59e0b' : '#10b981' }}>● {report.status}</span>
                       <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => setSelectedReport(report)}
                            style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#334155', color: 'white', border: 'none', fontSize: '12px', cursor: 'pointer' }}>내용 보기</button>
                          <button 
                            onClick={() => handleResolveReport(report.id)}
                            style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: '800' }}>해결 처리</button>
                       </div>
                    </div>
                 </div>
               ))}
               {reports.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>신고 내역이 없습니다.</div>}
             </div>
          </div>
        );
      default:
        return (
          <>
            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '40px' }}>
              <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>주문 거래액 리포트</h3>
                  <div style={{ display: 'flex', background: '#0f172a', padding: '4px', borderRadius: '8px', gap: '4px' }}>
                    {['weekly', 'monthly', 'yearly'].map(p => (
                      <button 
                        key={p}
                        onClick={() => setChartPeriod(p)}
                        style={{ 
                          padding: '6px 12px', borderRadius: '6px', border: 'none', fontSize: '11px', fontWeight: '800', cursor: 'pointer',
                          backgroundColor: chartPeriod === p ? '#38bdf8' : 'transparent',
                          color: chartPeriod === p ? '#0f172a' : '#94a3b8'
                        }}
                      >
                        {p === 'weekly' ? '주간' : p === 'monthly' ? '월간' : '연간'}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '12px', padding: '10px' }}>
                  {(chartPeriod === 'weekly' ? [40, 65, 50, 85, 70, 95, 60] : chartPeriod === 'monthly' ? [30, 45, 60, 55, 80, 95] : [55, 65, 80, 95]).map((height, i) => (
                    <div key={i} style={{ 
                      flex: 1, 
                      height: `${height}%`, 
                      backgroundColor: '#38bdf8', 
                      borderRadius: '4px 4px 0 0',
                      opacity: 0.6 + (height / 200)
                    }}></div>
                  ))}
                </div>
              </div>
              <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>활성 사용자 지표</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                  {[
                    { label: '전체 고객', value: '12,504명' },
                    { label: '등록 마트', value: '458개' },
                    { label: '활동 배달원', value: '892명' },
                    { label: '승인 대기', value: `${approvalItems.length}건`, highlight: true, action: () => setActiveTab('approvals') },
                    { label: '미답변 1:1 문의', value: `${inquiryList.filter(inq => inq.status === '접수 완료').length}건`, highlight: true, action: () => setActiveTab('inquiry') }
                  ].map((stat, i) => (
                    <div 
                      key={i} 
                      onClick={stat.action}
                      style={{ 
                        display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #334155',
                        cursor: stat.action ? 'pointer' : 'default'
                      }}>
                      <span style={{ color: stat.highlight ? '#f59e0b' : '#94a3b8', fontWeight: stat.highlight ? '700' : 'normal' }}>{stat.label}</span>
                      <span style={{ fontWeight: '700', color: stat.highlight ? '#f59e0b' : 'white' }}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>최근 신고/분쟁 내역</h2>
                <div style={{ padding: '4px 12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>
                  처리 대기: {reports.filter(r => r.status === '확인 중').length}건
                </div>
              </div>
              <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden' }}>
                {reports.map((report, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: i === reports.length - 1 ? 'none' : '1px solid #334155' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#ef4444', border: '1px solid #ef4444', padding: '2px 6px', borderRadius: '4px', marginRight: '8px' }}>{report.type}</span>
                      <span style={{ fontWeight: '600' }}>{report.user} -&gt; {report.target}</span>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{report.time}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '13px', color: report.status === '확인 중' ? '#f59e0b' : '#10b981' }}>{report.status}</span>
                      <button 
                        onClick={() => handleResolveReport(report.id)}
                        style={{ padding: '4px 10px', borderRadius: '4px', backgroundColor: '#334155', color: 'white', border: 'none', fontSize: '12px', cursor: 'pointer' }}>
                        {report.status === '확인 중' ? '처리' : '상세'}
                      </button>
                    </div>
                  </div>
                ))}
                {reports.length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>분쟁 내역이 없습니다.</div>
                )}
              </div>
            </section>
          </>
        );
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

      {/* Report Detail Modal */}
      {selectedReport && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ backgroundColor: '#1e293b', width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '32px', border: '1px solid #334155' }}>
               <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>신고 상세 내용</h3>
               <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>신고 내용</div>
                  <div style={{ lineHeight: '1.6', fontSize: '15px' }}>{selectedReport.content}</div>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px', marginBottom: '24px' }}>
                  <div>
                     <div style={{ color: '#94a3b8', marginBottom: '4px' }}>신고자</div>
                     <div>{selectedReport.user}</div>
                  </div>
                  <div>
                     <div style={{ color: '#94a3b8', marginBottom: '4px' }}>대상</div>
                     <div>{selectedReport.target}</div>
                  </div>
               </div>
               <button onClick={() => setSelectedReport(null)} style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#38bdf8', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer' }}>확인</button>
            </div>
        </div>
      )}
      {/* Sidebar */}
      <div className="sidebar" style={{
        width: '260px',
        backgroundColor: '#1e293b',
        padding: '30px 20px',
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
        <div className={`nav-item ${activeTab === 'settlement' ? 'active' : ''}`} 
          onClick={() => setActiveTab('settlement')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'settlement' ? '#334155' : 'transparent', color: activeTab === 'settlement' ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>💳 결제/정산</div>
        <div className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} 
          onClick={() => setActiveTab('reports')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'reports' ? '#334155' : 'transparent', color: activeTab === 'reports' ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>🚨 신고 / 분쟁</div>
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
             activeTab === 'riders' ? '배달원 관리' :              activeTab === 'settlement' ? '결제 및 정산' : 
              activeTab === 'cms' ? '콘텐츠 관리' :
              activeTab === 'inquiry' ? '1:1 문의 고객응대' : '알림 발송 센터'}
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '4px' }}>2026년 1월 22일 기준</p>
        </header>

        {renderActiveView()}

        {isNoticeModalOpen && currentNotice && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: '#1e293b', width: '100%', maxWidth: '600px', borderRadius: '24px', padding: '32px', border: '1px solid #334155' }}>
               <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>{currentNotice.id ? '공지사항 수정' : '새 공지사항 등록'}</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>제목</label>
                    <input 
                      type="text" 
                      value={currentNotice.title}
                      onChange={(e) => setCurrentNotice({...currentNotice, title: e.target.value})}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>내용</label>
                    <textarea 
                      value={currentNotice.content}
                      onChange={(e) => setCurrentNotice({...currentNotice, content: e.target.value})}
                      style={{ width: '100%', height: '200px', padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white', resize: 'none' }}
                    />
                  </div>
               </div>
               <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                  <button onClick={() => setIsNoticeModalOpen(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#334155', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>취소</button>
                  <button 
                    onClick={() => {
                      if (currentNotice.id) {
                        setNoticeList(noticeList.map(n => n.id === currentNotice.id ? currentNotice : n));
                        alert('수정되었습니다.');
                      } else {
                        setNoticeList([{ ...currentNotice, id: Date.now() }, ...noticeList]);
                        alert('등록되었습니다.');
                      }
                      setIsNoticeModalOpen(false);
                    }}
                    style={{ flex: 2, padding: '14px', borderRadius: '12px', background: '#38bdf8', color: '#0f172a', border: 'none', fontWeight: '800', cursor: 'pointer' }}>저장하기</button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
