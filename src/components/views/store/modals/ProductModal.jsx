import React from 'react';

const ProductModal = ({ editingProduct, productForm, setProductForm, categories, canEditProduct, onSave, onClose }) => {
  const cats = categories?.length ? categories : [{ id: 1, categoryName: '채소' }];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setProductForm({ ...productForm, imageFile: file, imagePreview: reader.result });
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>{editingProduct ? '상품 수정' : '새 상품 등록'}</h2>
        <form onSubmit={onSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>상품 이미지</label>
            <div onClick={() => document.getElementById('product-image-upload').click()} style={{ width: '100%', height: '160px', borderRadius: '16px', border: '2px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}>
              {productForm.imagePreview ? (
                <img src={productForm.imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>이미지 업로드 (클릭)</span>
              )}
              <input id="product-image-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>상품명</label>
            <input required type="text" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} placeholder="예: 대추토마토 500g" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>가격</label>
              <input required type="text" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} placeholder="5,900원" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>할인율 (%)</label>
              <input type="number" value={productForm.discountRate} onChange={e => setProductForm({ ...productForm, discountRate: parseInt(e.target.value) || 0 })} placeholder="0" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>카테고리</label>
            <select value={productForm.categoryId} onChange={e => { const id = Number(e.target.value); const opt = cats.find(o => (o.id || o.categoryId) === id); setProductForm({ ...productForm, categoryId: id, category: opt?.categoryName ?? opt?.name ?? '채소' }); }} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
              {cats.map(cat => <option key={cat.id ?? cat.categoryId} value={cat.id ?? cat.categoryId}>{cat.categoryName ?? cat.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>원산지</label>
            <input required type="text" value={productForm.origin} onChange={e => setProductForm({ ...productForm, origin: e.target.value })} placeholder="예: 국내산, 칠레산 등" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>상품 설명</label>
            <textarea required value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} placeholder="상품에 대한 상세 정보를 입력해주세요." style={{ width: '100%', height: '100px', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', resize: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#f1f5f9', border: 'none', fontWeight: '700', cursor: 'pointer' }}>취소</button>
            <button type="submit" disabled={editingProduct && !canEditProduct} style={{ flex: 2, padding: '14px', borderRadius: '12px', background: (editingProduct && !canEditProduct) ? '#94a3b8' : 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', cursor: (editingProduct && !canEditProduct) ? 'not-allowed' : 'pointer' }}>{editingProduct ? '수정 완료' : '등록 완료'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
