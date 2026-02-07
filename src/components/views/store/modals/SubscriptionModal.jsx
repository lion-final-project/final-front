import React from 'react';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

const SubscriptionModal = ({ editingSubscription, subscriptionForm, setSubscriptionForm, products, onSave, onClose }) => {
  const form = subscriptionForm || {};
  const status = form.status ?? '운영중';

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>{editingSubscription ? '구독 상품 수정' : '새 구독 상품 등록'}</h2>
        <form onSubmit={onSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>구독 상품명</label>
            <input required type="text" value={form.name || ''} onChange={e => setSubscriptionForm({ ...form, name: e.target.value })} placeholder="예: 우리집 신선 야채 팩" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>구독 설명</label>
            <textarea required rows="3" value={form.description || ''} onChange={e => setSubscriptionForm({ ...form, description: e.target.value })} placeholder="구독 상품의 구성과 혜택을 상세히 입력해주세요." style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', resize: 'none', fontFamily: 'inherit' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>구독 가격</label>
              <input required type="text" value={form.price || ''} onChange={e => setSubscriptionForm({ ...form, price: e.target.value })} placeholder="19,900원" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>주당 배송 횟수</label>
              <input required type="number" value={form.weeklyFreq ?? 1} readOnly placeholder="0" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#64748b' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>총 배송 횟수</label>
              <input required type="number" value={form.monthlyTotal ?? 4} onChange={e => setSubscriptionForm({ ...form, monthlyTotal: e.target.value })} placeholder="4" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>배송 요일 설정</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {DAYS.map(day => (
                <button key={day} type="button" onClick={() => { const days = (form.deliveryDays || []).includes(day) ? (form.deliveryDays || []).filter(d => d !== day) : [...(form.deliveryDays || []), day]; setSubscriptionForm({ ...form, deliveryDays: days, weeklyFreq: days.length }); }} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid', borderColor: (form.deliveryDays || []).includes(day) ? '#8b5cf6' : '#cbd5e1', backgroundColor: (form.deliveryDays || []).includes(day) ? '#f5f3ff' : 'white', color: (form.deliveryDays || []).includes(day) ? '#8b5cf6' : '#64748b', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>{day}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>노출 상태</label>
            <select value={status} disabled={!editingSubscription} onChange={e => setSubscriptionForm({ ...form, status: e.target.value })} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: !editingSubscription ? '#f1f5f9' : 'white' }}>
              <option value="운영중">운영중 (노출)</option>
              <option value="숨김">숨김 (미노출)</option>
              <option value="중지됨">중지됨</option>
            </select>
            {!editingSubscription && <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>* 신규 등록 시 기본 운영중으로 설정되며, 등록 후 목록에서 변경 가능합니다.</p>}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>구성 품목 선택 및 수량 ({(form.selectedProducts || []).length})</label>
            <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#f8fafc' }}>
              {(products || []).map(p => {
                const selected = (form.selectedProducts || []).find(sp => sp.id === p.id);
                return (
                  <div key={p.id} onClick={() => { const isSelected = !!selected; const newList = isSelected ? (form.selectedProducts || []).filter(sp => sp.id !== p.id) : [...(form.selectedProducts || []), { id: p.id, qty: 1 }]; setSubscriptionForm({ ...form, selectedProducts: newList }); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid', borderColor: selected ? '#8b5cf6' : '#e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <input type="checkbox" checked={!!selected} onChange={() => {}} style={{ width: '18px', height: '18px', accentColor: '#8b5cf6', cursor: 'pointer' }} />
                    <span style={{ fontSize: '20px' }}>{p.img}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{p.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{p.price}</div>
                    </div>
                    {selected && (
                      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f5f3ff', padding: '4px 8px', borderRadius: '8px', border: '1px solid #ddd6fe' }}>
                        <input type="number" min="1" value={selected.qty} onChange={(e) => { const newQty = parseInt(e.target.value) || 1; setSubscriptionForm({ ...form, selectedProducts: (form.selectedProducts || []).map(sp => sp.id === p.id ? { ...sp, qty: newQty } : sp) }); }} style={{ width: '40px', border: 'none', background: 'transparent', textAlign: 'center', fontWeight: '700', color: '#8b5cf6', fontSize: '13px', outline: 'none' }} />
                        <span style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '700' }}>개</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>* 구독 패키지에 포함될 각 상품과 그 수량을 입력해 주세요.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#f1f5f9', border: 'none', fontWeight: '700', cursor: 'pointer' }}>취소</button>
            <button type="submit" style={{ flex: 2, padding: '14px', borderRadius: '12px', background: '#8b5cf6', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }}>{editingSubscription ? '수정 완료' : '구성 완료'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionModal;
