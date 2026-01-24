import React, { useState } from 'react';

const RecordDetailModal = ({ record, onClose, onToggleStatus, onShowReports }) => {
  if (!record) return null;
  const isStore = !!record.rep;
  const isUser = record.type === 'USER';

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: '#1e293b', width: '100%', maxWidth: '550px', borderRadius: '24px', padding: '32px', border: '1px solid #334155', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
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
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>누적 신고 내역</span>
                    <button 
                      onClick={() => onShowReports(record)}
                      style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: '#334155', color: '#38bdf8', border: 'none', fontSize: '11px', cursor: 'pointer', fontWeight: '800' }}>이력 보기</button>
                 </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>위치/차종</span>
                <span>{record.loc || record.vehicle || '-'}</span>
              </div>
            </>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', borderTop: '1px solid #334155', paddingTop: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '14px' }}>현재 상태</span>
            <span style={{ color: record.status === '정상' || record.status === '활성' ? '#10b981' : '#ef4444', fontWeight: '800' }}>{record.status}</span>
          </div>
        </div>

        <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => onToggleStatus(record)}
            style={{ 
              flex: 1, padding: '14px', borderRadius: '12px', 
              background: record.status === '정지' || record.status === '비활성' ? '#10b981' : '#450a0a', 
              color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' 
            }}
          >
            {record.status === '정지' || record.status === '비활성' ? '활성화 처리' : '이용 정지/비활성'}
          </button>
          <button style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#334155', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }} onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRecord, setSelectedRecord] = useState(null);
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
    { id: 'RID001', name: '김철수', vehicle: '오토바이', score: '4.8', status: '운행중', type: 'PROFESSIONAL' },
    { id: 'RID002', name: '이영희', vehicle: '자전거', score: '4.9', status: '휴식중', type: 'RESIDENT' },
    { id: 'RID003', name: '박민수', vehicle: '도보', score: '4.7', status: '미접속', type: 'RESIDENT' },
    { id: 'RID004', name: '최현우', vehicle: '전기차', score: '5.0', status: '운행중', type: 'PROFESSIONAL' }
  ]);

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

  const handleApprove = (id) => {
    alert('승인 처리가 완료되었습니다.');
    setApprovalItems(prev => prev.filter(item => item.id !== id));
  };

  const handleToggleStatus = (record) => {
    if (record.rep) { // Store
      setStores(prev => prev.map(s => 
        s.id === record.id ? { ...s, status: s.status === '정상' ? '비활성' : '정상' } : s
      ));
    } else if (record.type === 'USER') {
      setUsers(prev => prev.map(u => 
        u.id === record.id ? { ...u, status: u.status === '활성' ? '정지' : '활성' } : u
      ));
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
          { label: '전문 라이더', value: `${riders.filter(r => r.type === 'PROFESSIONAL').length}명`, color: '#f59e0b' },
          { label: '평균 평점', value: '4.85', color: '#f1c40f' }
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
                      <th style={{ padding: '16px' }}>평점</th>
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
                        <td style={{ padding: '16px' }}>⭐ {rider.score}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ 
                            fontSize: '12px', 
                            backgroundColor: rider.status === '운행중' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)', 
                            color: rider.status === '운행중' ? '#10b981' : '#94a3b8', 
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
                   <input type="text" placeholder="고객명/연락처 검색..." style={{ padding: '10px 16px', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '14px' }} />
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
                  style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '13px', outline: 'none' }}
                >
                  <option value="ALL">전체 보기</option>
                  <option value="STORE">마트 신청</option>
                  <option value="RIDER">라이더 신청</option>
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
                    <th style={{ padding: '16px' }}>상태</th>
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
                        <span style={{ color: '#f59e0b', fontSize: '13px' }}>● {item.status}</span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <button 
                          onClick={() => handleApprove(item.id)}
                          style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#38bdf8', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer' }}>승인하기</button>
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
        return (
          <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '24px', border: '1px solid #334155' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>신고 및 분쟁 관리</h2>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               {reports.map((report, i) => (
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
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>주간 주문 거래액</h3>
                <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '12px', padding: '10px' }}>
                  {[40, 65, 50, 85, 70, 95, 60].map((height, i) => (
                    <div key={i} style={{ 
                      flex: 1, 
                      height: `${height}%`, 
                      backgroundColor: '#38bdf8', 
                      borderRadius: '4px 4px 0 0',
                      opacity: i === 5 ? 1 : 0.6
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
                    { label: '승인 대기', value: `${approvalItems.length}건`, highlight: true, action: () => setActiveTab('approvals') }
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

            {/* Reports & Disputes */}
            <section>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>최근 신고/분쟁 내역</h2>
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
        onShowReports={(user) => {
           setActiveTab('reports_view');
           setSelectedRecord(null);
        }}
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
             activeTab === 'reports' ? '신고 및 분쟁 관리' :
             activeTab === 'settlement' ? '결제 및 정산' : '알림 발송 센터'}
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '4px' }}>2026년 1월 22일 기준</p>
        </header>

        {renderActiveView()}
      </div>
    </div>
  );
};

export default AdminDashboard;
