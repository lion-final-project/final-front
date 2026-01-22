import React, { useState } from 'react';

const RecordDetailModal = ({ record, onClose }) => {
  if (!record) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: '#1e293b', width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '32px', border: '1px solid #334155', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>데이터 상세 조회</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '14px' }}>항목명</span>
            <span style={{ fontWeight: '700' }}>{record.name}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '14px' }}>위치/차종</span>
            <span>{record.loc || record.vehicle || '-'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '14px' }}>현재 상태</span>
            <span style={{ color: '#10b981' }}>{record.status}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '14px' }}>누적 데이터</span>
            <span>{record.sales || record.score || record.orders || '0'}</span>
          </div>
        </div>

        <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
          <button style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#334155', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>비활성화</button>
          <button style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#38bdf8', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }} onClick={onClose}>확인</button>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [approvalItems, setApprovalItems] = useState([
    { id: 1, type: '마트', name: '싱싱 야채 센터 (강북점)', date: '2026-01-21', status: '검토 중', color: '#10b981' },
    { id: 2, type: '라이더', name: '김철수 (오토바이)', date: '2026-01-20', status: '서류 확인', color: '#38bdf8' },
    { id: 3, type: '주민', name: '이순자 (역삼동 - 도보)', date: '2026-01-22', status: '인증 완료', color: '#f59e0b' }
  ]);
  const [reports, setReports] = useState([
    { id: 1, type: '배송지연', user: '김서연', target: '무림 정육점', status: '확인 중', time: '1시간 전' },
    { id: 2, type: '상품불량', user: '이영희', target: '행복 마트', status: '답변완료', time: '3시간 전' }
  ]);

  const handleApprove = (id) => {
    alert('승인 처리가 완료되었습니다.');
    setApprovalItems(prev => prev.filter(item => item.id !== id));
  };

  const handleResolveReport = (id) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: '처리완료' } : r));
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'stores':
        return (
          <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>마트 관리</h2>
              <input type="text" placeholder="마트명 검색..." style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white' }} />
            </div>
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '14px' }}>
                    <th style={{ padding: '12px' }}>마트명</th>
                    <th style={{ padding: '12px' }}>위치</th>
                    <th style={{ padding: '12px' }}>상태</th>
                    <th style={{ padding: '12px' }}>누적 매출</th>
                    <th style={{ padding: '12px' }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: '행복 마트 강남점', loc: '역삼동', status: '정상', sales: '45,200,000원' },
                    { name: '무림 정육점', loc: '삼성동', status: '정상', sales: '28,150,000원' },
                    { name: '싱싱 야채 센터', loc: '역삼동', status: '승인대기', sales: '0원' }
                  ].map((store, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #334155', fontSize: '14px' }}>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{store.name}</td>
                      <td style={{ padding: '12px' }}>{store.loc}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ fontSize: '11px', backgroundColor: store.status === '정상' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: store.status === '정상' ? 'var(--primary)' : 'var(--accent)', padding: '4px 8px', borderRadius: '4px', fontWeight: '800' }}>{store.status}</span>
                      </td>
                      <td style={{ padding: '12px' }}>{store.sales}</td>
                      <td style={{ padding: '12px' }}><button onClick={() => setSelectedRecord(store)} style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: 'none', cursor: 'pointer', fontWeight: '700' }}>상세</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'riders':
        return (
          <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>배달원 관리</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', backgroundColor: '#38bdf8', color: 'white' }}>전문 라이더</span>
                <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', backgroundColor: '#f59e0b', color: 'white' }}>동네 주민</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {[
                { name: '김철수', vehicle: '오토바이', score: '4.8', status: '운행중', type: 'PROFESSIONAL' },
                { name: '이영희', vehicle: '자전거', score: '4.9', status: '휴식중', type: 'RESIDENT' },
                { name: '박민수', vehicle: '도보', score: '4.7', status: '미접속', type: 'RESIDENT' }
              ].map((rider, i) => (
                <div key={i} style={{ 
                  backgroundColor: '#0f172a', 
                  padding: '20px', 
                  borderRadius: '12px', 
                  border: `1.5px solid ${rider.type === 'RESIDENT' ? '#f59e0b' : '#334155'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontWeight: '700', fontSize: '16px' }}>{rider.name}</span>
                    <span style={{ fontSize: '11px', color: rider.type === 'RESIDENT' ? '#f59e0b' : '#38bdf8', fontWeight: 'bold' }}>
                      {rider.type === 'RESIDENT' ? '🏠 동네 주민' : '🛵 전문'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#94a3b8' }}>수단: {rider.vehicle}</span>
                    <span onClick={() => setSelectedRecord(rider)} style={{ color: '#38bdf8', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>상세보기</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'users':
        return (
          <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>사용자(고객) 관리</h2>
              <input type="text" placeholder="고객명/전화번호 검색..." style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white' }} />
            </div>
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '14px' }}>
                    <th style={{ padding: '12px' }}>고객명</th>
                    <th style={{ padding: '12px' }}>지역</th>
                    <th style={{ padding: '12px' }}>주문 횟수</th>
                    <th style={{ padding: '12px' }}>가입일</th>
                    <th style={{ padding: '12px' }}>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: '김지현', loc: '강남구', orders: 24, join: '2023.11.12', status: '활성' },
                    { name: '박준영', loc: '서초구', orders: 12, join: '2023.12.05', status: '활성' },
                    { name: '최수진', loc: '마포구', orders: 5, join: '2024.01.10', status: '정지' }
                  ].map((user, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #334155', fontSize: '14px' }}>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{user.name}</td>
                      <td style={{ padding: '12px' }}>{user.loc}</td>
                      <td style={{ padding: '12px' }}>{user.orders}회</td>
                      <td style={{ padding: '12px' }}>{user.join}</td>
                      <td style={{ padding: '12px' }}>
                        <span onClick={() => setSelectedRecord(user)} style={{ fontSize: '12px', backgroundColor: user.status === '활성' ? '#064e3b' : '#450a0a', color: user.status === '활성' ? '#10b981' : '#ef4444', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}>{user.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

            <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>구독 플랜 관리</h2>
              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #334155', color: '#94a3b8', fontSize: '14px' }}>
                      <th style={{ padding: '12px' }}>플랜명</th>
                      <th style={{ padding: '12px' }}>가격</th>
                      <th style={{ padding: '12px' }}>상태</th>
                      <th style={{ padding: '12px' }}>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: '베이직 실속 세트', price: '19,900원', status: '판매중' },
                      { name: '프리미엄 가족 세트', price: '39,900원', status: '판매중' },
                      { name: '1인 가구 간편 세트', price: '15,900원', status: '숨김' }
                    ].map((plan, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #334155', fontSize: '14px' }}>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{plan.name}</td>
                        <td style={{ padding: '12px' }}>{plan.price}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontSize: '12px', color: plan.status === '판매중' ? '#10b981' : '#64748b' }}>● {plan.status}</span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <button style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontWeight: '600' }}>편집</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'settlement':
        return (
          <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>결제 및 정산 현황</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '12px' }}>
                <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>이번 달 누적 거래액</div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#38bdf8' }}>₩ 142,500,000</div>
              </div>
              <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '12px' }}>
                <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>지금 가능한 정산금</div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#10b981' }}>₩ 12,480,000</div>
              </div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div style={{ backgroundColor: '#1e293b', padding: '32px', borderRadius: '16px', border: '1px solid #334155', maxWidth: '800px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '32px' }}>알림 발송 센터</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>알림 제목</label>
                <input type="text" placeholder="제목을 입력하세요" style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>알림 내용</label>
                <textarea rows="6" placeholder="내용을 입력하세요" style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', resize: 'none' }}></textarea>
              </div>
              <button className="btn-primary" style={{ padding: '16px', borderRadius: '8px', border: 'none', fontWeight: '800', cursor: 'pointer', marginTop: '10px' }}>푸시 알림 발송하기</button>
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
                    { label: '활동 배달원', value: '892명' }
                  ].map((stat, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #334155' }}>
                      <span style={{ color: '#94a3b8' }}>{stat.label}</span>
                      <span style={{ fontWeight: '700' }}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Approval Table */}
            <section style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>승인 대기 목록</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input type="text" placeholder="검색어 입력..." style={{ 
                    padding: '6px 12px', 
                    borderRadius: '6px', 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155', 
                    color: 'white',
                    fontSize: '13px'
                  }} />
                  <select style={{ 
                    padding: '6px 12px', 
                    borderRadius: '6px', 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155', 
                    color: 'white',
                    fontSize: '13px'
                  }}>
                    <option>전체</option>
                    <option>마트</option>
                    <option>라이더</option>
                  </select>
                </div>
              </div>
              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1e293b', borderRadius: '16px', overflow: 'hidden' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#334155', textAlign: 'left' }}>
                      <th style={{ padding: '16px' }}>유형</th>
                      <th style={{ padding: '16px' }}>이름/상호명</th>
                      <th style={{ padding: '16px' }}>신청일</th>
                      <th style={{ padding: '16px' }}>상태</th>
                      <th style={{ padding: '16px' }}>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvalItems.map((item, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '16px' }}>
                          <span style={{ backgroundColor: item.color, padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{item.type}</span>
                        </td>
                        <td style={{ padding: '16px' }}>{item.name}</td>
                        <td style={{ padding: '16px' }}>{item.date}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ marginRight: '8px' }}>🟡</span>
                          {item.status}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <button 
                            onClick={() => handleApprove(item.id)}
                            style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#38bdf8', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer' }}>승인</button>
                        </td>
                      </tr>
                    ))}
                    {approvalItems.length === 0 && (
                      <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>승인 대기 중인 항목이 없습니다.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

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
      <RecordDetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
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
        <div className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`} 
          onClick={() => setActiveTab('notifications')}
          style={{ padding: '12px', borderRadius: '8px', backgroundColor: activeTab === 'notifications' ? '#334155' : 'transparent', color: activeTab === 'notifications' ? '#38bdf8' : 'inherit', cursor: 'pointer' }}>📢 알림 발송</div>
      </div>

      {/* Main Content */}
      <div className="main-content" style={{ flexGrow: 1, padding: '40px' }}>
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700' }}>
            {activeTab === 'overview' ? '플랫폼 전체 현황' : 
             activeTab === 'stores' ? '마트 관리' : 
             activeTab === 'riders' ? '배달원 관리' : 
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
