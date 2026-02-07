import React from 'react';
import { subscriptionProductApi } from '../../../../config/api';
import { KO_TO_STATUS, mapApiToSub, getSubscriptionHeaders } from '../utils/storeDashboardUtils';

const SubscriptionsTab = ({
  subscriptions,
  subscriptionsLoading,
  subscriptionsError,
  products,
  expandedSubscriptions,
  handleToggleSubscriptionExpand,
  handleOpenSubscriptionModal,
  deleteSubscription,
  sendSubscriptionNotification,
  setSubscriptions,
  fetchSubscriptions,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
      <div style={{ padding: '24px', background: 'white', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #8b5cf6' }}>
        <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px', fontWeight: '600' }}>전체 구독 상품</div>
        <div style={{ fontSize: '28px', fontWeight: '800' }}>{subscriptions.length}종</div>
      </div>
      <div style={{ padding: '24px', background: 'white', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #10b981' }}>
        <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px', fontWeight: '600' }}>총 구독자 수</div>
        <div style={{ fontSize: '28px', fontWeight: '800' }}>{subscriptions.reduce((acc, curr) => acc + curr.subscribers, 0)}명</div>
      </div>
      <div style={{ padding: '24px', background: 'white', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '4px solid #38bdf8' }}>
        <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px', fontWeight: '600' }}>이번 달 예상 수익</div>
        <div style={{ fontSize: '28px', fontWeight: '800' }}>2,450,000원</div>
      </div>
    </div>

    <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>구독 상품 리스트 및 관리</h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>구독 구성을 직접 추가하고 가격과 구성을 결정할 수 있습니다.</p>
        </div>
        <button onClick={() => handleOpenSubscriptionModal()} disabled={subscriptionsLoading} style={{ padding: '12px 24px', borderRadius: '12px', background: '#8b5cf6', color: 'white', border: 'none', fontWeight: '700', cursor: subscriptionsLoading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)', opacity: subscriptionsLoading ? 0.7 : 1 }}>+ 새 구독 상품 추가</button>
      </div>

      {subscriptionsError && (
        <div style={{ padding: '12px 16px', marginBottom: '16px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '12px', fontSize: '14px' }}>
          {subscriptionsError}
          <button onClick={fetchSubscriptions} style={{ marginLeft: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #991b1b', background: 'transparent', cursor: 'pointer', fontSize: '12px' }}>재시도</button>
        </div>
      )}

      {subscriptionsLoading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>구독 목록을 불러오는 중...</div>
      ) : (
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '14px' }}>
                <th style={{ padding: '16px', width: '40px' }}></th>
                <th style={{ padding: '16px' }}>구독 상품명</th>
                <th style={{ padding: '16px' }}>월 구독료</th>
                <th style={{ padding: '16px' }}>구성 품목 수</th>
                <th style={{ padding: '16px' }}>가입 고객</th>
                <th style={{ padding: '16px' }}>상태</th>
                <th style={{ padding: '16px' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <React.Fragment key={sub.id}>
                  <tr style={{ borderBottom: expandedSubscriptions.has(sub.id) ? 'none' : '1px solid #f1f5f9', fontSize: '15px', transition: 'all 0.2s', backgroundColor: expandedSubscriptions.has(sub.id) ? 'rgba(139, 92, 246, 0.02)' : 'transparent' }}>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <button onClick={() => handleToggleSubscriptionExpand(sub.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px', transform: expandedSubscriptions.has(sub.id) ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: expandedSubscriptions.has(sub.id) ? '#8b5cf6' : '#94a3b8' }}>▼</button>
                    </td>
                    <td style={{ padding: '16px', fontWeight: '700' }}>
                      <div onClick={() => handleToggleSubscriptionExpand(sub.id)} style={{ cursor: 'pointer' }}>{sub.name}</div>
                    </td>
                    <td style={{ padding: '16px', fontWeight: '800', color: '#8b5cf6' }}>{sub.price}</td>
                    <td style={{ padding: '16px' }}>{(sub.selectedProducts?.length || sub.quantity)}개 품목</td>
                    <td style={{ padding: '16px' }}>{sub.subscribers}명</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontSize: '12px', color: sub.status === '삭제 예정' ? '#ef4444' : '#10b981', backgroundColor: sub.status === '삭제 예정' ? '#fee2e2' : '#ecfdf5', padding: '4px 10px', borderRadius: '6px', fontWeight: '800' }}>● {sub.status}</span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div
                          onClick={async () => {
                            if (sub.status !== '운영중' && sub.status !== '숨김') return;
                            const newStatusKo = sub.status === '운영중' ? '숨김' : '운영중';
                            const newStatus = KO_TO_STATUS[newStatusKo];
                            try {
                              const res = await fetch(subscriptionProductApi.updateStatus(sub.id), { method: 'PATCH', credentials: 'include', headers: getSubscriptionHeaders(), body: JSON.stringify({ status: newStatus }) });
                              const json = await res.json();
                              if (!res.ok || !json.success) throw new Error(json?.error?.message || json?.message || '상태 변경 실패');
                              setSubscriptions((prev) => prev.map((s) => (s.id === sub.id ? mapApiToSub(json.data) : s)));
                            } catch (err) {
                              alert(err.message || '상태 변경 중 오류가 발생했습니다.');
                            }
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: (sub.status === '운영중' || sub.status === '숨김') ? 'pointer' : 'default', padding: '6px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: sub.status === '운영중' ? '#ecfdf5' : '#f1f5f9', transition: 'all 0.2s' }}
                        >
                          <span style={{ fontSize: '11px', fontWeight: '800', color: sub.status === '운영중' ? '#10b981' : '#64748b' }}>노출</span>
                          <div style={{ width: '24px', height: '12px', borderRadius: '10px', backgroundColor: sub.status === '운영중' ? '#10b981' : '#cbd5e1', position: 'relative' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: '1px', left: sub.status === '운영중' ? '13px' : '1px', transition: 'all 0.2s' }}></div>
                          </div>
                        </div>
                        <div style={{ width: '1px', height: '16px', background: '#e2e8f0', margin: '0 4px' }}></div>
                        <button
                          onClick={() => {
                            if (sub.status === '숨김' || (sub.status === '삭제 예정' && sub.subscribers === 0)) {
                              deleteSubscription(sub);
                            } else if (sub.status !== '삭제 예정') {
                              alert('숨김 상태의 구독만 삭제 요청이 가능합니다. 먼저 노출 상태를 숨김으로 변경해주세요.');
                            }
                          }}
                          style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #fee2e2', background: sub.status === '삭제 예정' ? '#ef4444' : 'white', color: sub.status === '삭제 예정' ? 'white' : '#ef4444', cursor: (sub.status === '숨김' || (sub.status === '삭제 예정' && sub.subscribers === 0)) ? 'pointer' : 'default', opacity: (sub.status !== '숨김' && sub.status !== '삭제 예정') ? 0.5 : 1, fontSize: '12px', fontWeight: '600' }}
                        >
                          {sub.status === '삭제 예정' ? (sub.subscribers === 0 ? '즉시 삭제' : '삭제 예약됨') : '삭제 요청'}
                        </button>
                        <button onClick={() => handleOpenSubscriptionModal(sub)} disabled={sub.status === '삭제 예정'} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: sub.status === '삭제 예정' ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: '600', opacity: sub.status === '삭제 예정' ? 0.5 : 1 }}>수정</button>
                        <button onClick={() => sendSubscriptionNotification(sub)} style={{ padding: '6px 12px', borderRadius: '8px', border: sub.status === '삭제 예정' ? '1px solid #8b5cf6' : '1px solid #e2e8f0', background: 'white', color: sub.status === '삭제 예정' ? '#8b5cf6' : '#94a3b8', cursor: 'pointer', fontSize: '12px', fontWeight: '800' }}>🔔 알림</button>
                      </div>
                    </td>
                  </tr>
                  {expandedSubscriptions.has(sub.id) && (
                    <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: 'rgba(139, 92, 246, 0.02)' }}>
                      <td colSpan="7" style={{ padding: '0 24px 24px 72px' }}>
                        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #ede9fe', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px' }}>주당 배송 횟수</div>
                            <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>{sub.weeklyFreq != null ? `${sub.weeklyFreq}회` : '-'} <span style={{ fontSize: '13px', fontWeight: '500' }}>배송 / 주</span></div>
                          </div>
                          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px' }}>월간 총 배송 횟수</div>
                            <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>{sub.monthlyTotal != null ? `${sub.monthlyTotal}회` : '-'} <span style={{ fontSize: '13px', fontWeight: '500' }}>배송 / 월</span></div>
                          </div>
                          <div style={{ backgroundColor: '#fdfaff', padding: '16px', borderRadius: '12px', border: '1px solid #f3e8ff' }}>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#8b5cf6', marginBottom: '8px' }}>배송 요일 설정</div>
                            <div style={{ display: 'flex', gap: '6px' }}>{(sub.deliveryDays || []).map(day => <span key={day} style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '800' }}>{day}요일</span>)}</div>
                          </div>
                          <div style={{ gridColumn: 'span 3', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '12px' }}>구성 품목 상세</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                              {(sub.selectedProducts || []).map((item) => {
                                const p = products.find((pr) => String(pr.id) === String(item.id));
                                const displayName = p?.name ?? item.productName ?? `상품 ${item.id}`;
                                const displayImg = p?.img;
                                const hasValidImg = displayImg && (displayImg.startsWith('data:') || displayImg.startsWith('http'));
                                return (
                                  <div key={item.id} style={{ backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {hasValidImg ? <img src={displayImg} alt={displayName} style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '6px' }} /> : <span style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0', borderRadius: '6px', fontSize: '14px' }}>📦</span>}
                                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{displayName}</span>
                                    <span style={{ fontSize: '12px', color: '#8b5cf6', fontWeight: '700' }}>x{item.qty}</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px' }}>상품 상세 설명</div>
                            <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>{sub.description || '구성된 상품 목록 및 서비스 안내 내용이 표시됩니다.'}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {subscriptions.length === 0 && <tr><td colSpan="7" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>등록된 구독 상품이 없습니다.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
        <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 24px 0' }}>다음 배송 일정 및 필요 물량</h2>
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>다음 배송 일정 데이터가 없습니다.</div>
          <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 16px 0', color: '#475569' }}>준비 필요 상품 현황</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}><div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>준비 필요 상품 현황이 없습니다.</div></div>
        </div>
        <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>주간 배송 일정 (시간대별)</h2>
            <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '12px', fontWeight: '700', color: '#64748b', cursor: 'pointer' }}>자세히 보기 &gt;</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {['월', '화', '수', '목', '금', '토', '일'].map((day, i) => (
              <div key={day} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{day}</div>
                <div style={{ height: '32px', width: '32px', margin: '0 auto', borderRadius: '50%', backgroundColor: i === 3 ? '#3b82f6' : 'transparent', color: i === 3 ? 'white' : '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px' }}>{29 + i > 31 ? 29 + i - 31 : 29 + i}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: '#eff6ff', border: '1px solid #dbeafe', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}><span style={{ fontWeight: '800', color: '#1e40af' }}>2월 1일 (목) 배송 정보</span><span style={{ fontSize: '11px', backgroundColor: '#bfdbfe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>선택됨</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[{ time: '06:00 - 09:00 (아침)', count: 4, area: '강남구 역삼동 외' }, { time: '11:00 - 14:00 (점심)', count: 6, area: '서초구 서초동 외' }, { time: '17:00 - 20:00 (저녁)', count: 2, area: '송파구 잠실동 외' }].map((slot, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div><div style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>{slot.time}</div><div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>지역: {slot.area}</div></div>
                  <div style={{ fontWeight: '800', color: '#3b82f6', fontSize: '15px' }}>{slot.count}건</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', textAlign: 'center' }}><div style={{ fontSize: '12px', color: '#64748b' }}>이 날짜에 배송될 구독 상품이 없습니다.</div></div>
        </div>
      </div>
    </div>
  </div>
);

export default SubscriptionsTab;
