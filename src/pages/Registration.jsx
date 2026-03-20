import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { filterOptions } from '../data/mockData';
import { Building, Gift, Check, DownloadCloud, Loader2 } from 'lucide-react';

export default function Registration() {
  const { addRestaurant, updateRestaurant, addGift, updateGift, restaurants, gifts } = useContext(AppContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editType = searchParams.get('type');
  const editId = searchParams.get('id');
  const isEdit = !!editId;

  const [tab, setTab] = useState(editType || 'restaurant'); 
  const [registrant, setRegistrant] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [showSourceInput, setShowSourceInput] = useState(false);
  const [pastedSource, setPastedSource] = useState('');
  
  // Restaurant form state
  const [rForm, setRForm] = useState({
    name: '',
    area: filterOptions.areas[0],
    category: filterOptions.categories[0],
    price_range: filterOptions.priceRanges[0],
    private_room: false,
    all_you_can_drink: false,
    alcohol_types: [],
    role_level: filterOptions.roleLevels[0],
    quiet_level: filterOptions.quietLevels[0],
    atmosphere: filterOptions.atmospheres[0],
    tabelog_url: '',
    address: '',
    phone: '',
    memo: '',
    ng_flag: false
  });

  // Gift form state
  const [gForm, setGForm] = useState({
    name: '',
    brand: '',
    price: filterOptions.giftPrices[0],
    scene: filterOptions.giftScenes[0],
    expiry: filterOptions.giftExpiries[0],
    buy_place: '',
    url: '',
    memo: '',
    ng_flag: false
  });

  // Load existing data if editing
  useEffect(() => {
    if (isEdit) {
      if (editType === 'restaurant') {
        const item = restaurants.find(r => r.id === editId);
        if (item) {
          setRForm({ ...item, alcohol_types: item.alcohol_types || [] });
          setRegistrant(item.registrant || '');
          setTab('restaurant');
        }
      } else if (editType === 'gift') {
        const item = gifts.find(g => g.id === editId);
        if (item) {
          setGForm(item);
          setRegistrant(item.registrant || '');
          setTab('gift');
        }
      }
    }
  }, [isEdit, editId, editType, restaurants, gifts]);

  const handleRSubmit = async (e) => {
    e.preventDefault();
    if (!rForm.name || !registrant) return alert('必須項目(登録者名・店名)を入力してください。');
    
    if (isEdit) {
      await updateRestaurant(editId, { ...rForm, registrant });
      alert('情報を更新しました！');
    } else {
      await addRestaurant({ ...rForm, registrant });
      alert('店舗を登録しました！');
    }
    navigate('/restaurants');
  };

  const handleGSubmit = async (e) => {
    e.preventDefault();
    if (!gForm.name || !registrant) return alert('必須項目(登録者名・商品名)を入力してください。');
    
    if (isEdit) {
      await updateGift(editId, { ...gForm, registrant });
      alert('情報を更新しました！');
    } else {
      await addGift({ ...gForm, registrant });
      alert('手土産を登録しました！');
    }
    navigate('/gifts');
  };

  const toggleAlcohol = (type) => {
    setRForm(prev => {
      const current = prev.alcohol_types;
      if (current.includes(type)) {
        return { ...prev, alcohol_types: current.filter(t => t !== type) };
      } else {
        return { ...prev, alcohol_types: [...current, type] };
      }
    });
  };

  const parseTabelogHTML = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    let name = "";
    const ogTitle = doc.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      const content = ogTitle.getAttribute('content');
      if (content && content.includes(' - ')) name = content.split(' - ')[0].trim();
    }
    if (!name) {
      const displayName = doc.querySelector('.display-name span') || doc.querySelector('.display-name');
      if (displayName) name = displayName.textContent.trim();
    }
    const addressNode = doc.querySelector('.rstinfo-table__address') || doc.querySelector('.adr');
    const address = addressNode ? addressNode.textContent.trim().replace(/\s+/g, ' ') : "";
    const telNode = doc.querySelector('.rstinfo-table__tel-number') || doc.querySelector('.tel');
    const phone = telNode ? telNode.textContent.trim() : "";
    let area = "その他";
    const areaKeywords = filterOptions.areas.filter(a => a !== 'すべて' && a !== 'その他');
    for (const ak of areaKeywords) {
      if (address.includes(ak)) {
        area = ak;
        break;
      }
    }
    return { name, address, phone, area };
  };

  const handleAutoFetch = async () => {
    if (!rForm.tabelog_url) return;
    setIsFetching(true);
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rForm.tabelog_url)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const htmlString = data.contents;
      if (!htmlString) throw new Error('Could not retrieve HTML content');
      const result = parseTabelogHTML(htmlString);
      setRForm(prev => ({
        ...prev,
        ...result,
        name: result.name || prev.name,
        address: result.address || prev.address,
        phone: result.phone || prev.phone,
        area: result.area || prev.area
      }));
    } catch (error) {
      alert("情報取得に失敗しました。URLを確認してください。");
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="page-title">{isEdit ? '情報を編集' : '新規登録'}</h1>
      <p className="mb-8 text-secondary">訪問した店舗や利用した手土産を登録し、次の方の参考にしましょう。</p>
      
      {!isEdit && (
        <div className="filters-section" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
            <button 
              className={`btn-primary ${tab !== 'restaurant' ? 'btn-ghost' : ''}`}
              onClick={() => setTab('restaurant')}
              style={tab === 'restaurant' ? {} : { backgroundColor: 'transparent', border: '1px solid var(--text-secondary)' }}
            >
              <Building size={18} /> 店舗を登録
            </button>
            <button 
              className={`btn-primary ${tab !== 'gift' ? 'btn-ghost' : ''}`}
              onClick={() => setTab('gift')}
              style={tab === 'gift' ? {} : { backgroundColor: 'transparent', border: '1px solid var(--text-secondary)' }}
            >
              <Gift size={18} /> 手土産を登録
            </button>
          </div>
        </div>
      )}

      <div className="filter-group mb-8" style={{ marginTop: '1rem' }}>
        <label className="filter-label">登録者名 (自分のお名前) <span style={{color: 'var(--danger-red)'}}>*</span></label>
        <input 
          type="text" 
          className="text-input" 
          placeholder="山田 太郎" 
          value={registrant}
          onChange={e => setRegistrant(e.target.value)}
          required
          style={{ maxWidth: '300px' }}
        />
      </div>

      <div className="detail-container">
        <div className="detail-content" style={{ marginTop: '0', paddingTop: '2rem' }}>
          
          {tab === 'restaurant' && (
            <form onSubmit={handleRSubmit} className="detail-section">
              {!isEdit && (
                <div style={{ 
                  backgroundColor: 'rgba(197, 160, 89, 0.05)', 
                  border: '1px solid rgba(197, 160, 89, 0.3)', 
                  padding: '1.5rem', 
                  borderRadius: '8px',
                  marginBottom: '2rem'
                }}>
                  <label className="filter-label" style={{ color: 'var(--accent-gold)' }}>🚀 食べログURLから情報を自動取得 (推奨)</label>
                  <div className="flex gap-2" style={{ marginTop: '0.5rem' }}>
                    <input 
                      type="url" 
                      className="text-input" 
                      value={rForm.tabelog_url} 
                      onChange={e => setRForm({...rForm, tabelog_url: e.target.value})} 
                      placeholder="https://tabelog.com/..."
                      style={{ flex: 1 }}
                    />
                    <button 
                      type="button" 
                      onClick={handleAutoFetch}
                      disabled={!rForm.tabelog_url || isFetching}
                      className="btn-primary"
                      style={{ whiteSpace: 'nowrap', opacity: (!rForm.tabelog_url || isFetching) ? 0.5 : 1 }}
                    >
                      {isFetching ? <Loader2 size={18} className="spin" /> : <DownloadCloud size={18} />}
                    </button>
                  </div>
                  <button type="button" onClick={() => setShowSourceInput(!showSourceInput)} style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontSize: '0.75rem', cursor: 'pointer', marginTop: '0.5rem', textDecoration: 'underline' }}>
                    自動取得に失敗する場合
                  </button>
                  {showSourceInput && (
                    <div style={{ marginTop: '1rem' }}>
                      <textarea className="text-input" rows="3" placeholder="ソースを貼り付けてください" value={pastedSource} onChange={e => setPastedSource(e.target.value)} style={{ fontSize: '0.7rem' }}></textarea>
                      <button type="button" className="btn-primary mt-2" style={{ width: '100%' }} onClick={() => {
                        const res = parseTabelogHTML(pastedSource);
                        if (res.name) { setRForm(p => ({...p, ...res})); setShowSourceInput(false); }
                        else alert("失敗しました。");
                      }}>抽出実行</button>
                    </div>
                  )}
                </div>
              )}

              <div className="detail-grid">
                <div className="filter-group">
                  <label className="filter-label">店名 <span style={{color: 'var(--danger-red)'}}>*</span></label>
                  <input type="text" className="text-input" value={rForm.name} onChange={e => setRForm({...rForm, name: e.target.value})} required />
                </div>
                <div className="filter-group">
                  <label className="filter-label">エリア</label>
                  <select className="select-input" value={rForm.area} onChange={e => setRForm({...rForm, area: e.target.value})}>
                    {filterOptions.areas.filter(a => a !== 'すべて').map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label className="filter-label">住所</label>
                  <input type="text" className="text-input" value={rForm.address} onChange={e => setRForm({...rForm, address: e.target.value})} />
                </div>
                <div className="filter-group">
                  <label className="filter-label">電話番号</label>
                  <input type="tel" className="text-input" value={rForm.phone} onChange={e => setRForm({...rForm, phone: e.target.value})} />
                </div>
                <div className="filter-group">
                  <label className="filter-label">料理ジャンル</label>
                  <select className="select-input" value={rForm.category} onChange={e => setRForm({...rForm, category: e.target.value})}>
                    {filterOptions.categories.filter(c => c !== 'すべて').map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label className="filter-label">価格帯</label>
                  <select className="select-input" value={rForm.price_range} onChange={e => setRForm({...rForm, price_range: e.target.value})}>
                    {filterOptions.priceRanges.filter(p => p !== 'すべて').map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label className="filter-label">対象役職</label>
                  <select className="select-input" value={rForm.role_level} onChange={e => setRForm({...rForm, role_level: e.target.value})}>
                    {filterOptions.roleLevels.filter(r => r !== 'すべて').map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label className="filter-label">静かさ</label>
                  <select className="select-input" value={rForm.quiet_level} onChange={e => setRForm({...rForm, quiet_level: e.target.value})}>
                    {filterOptions.quietLevels.filter(q => q !== 'すべて').map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div className="detail-grid mt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                <label className="filter-label flex items-center gap-2"><input type="checkbox" checked={rForm.private_room} onChange={e => setRForm({...rForm, private_room: e.target.checked})} /> 個室あり</label>
                <label className="filter-label flex items-center gap-2"><input type="checkbox" checked={rForm.all_you_can_drink} onChange={e => setRForm({...rForm, all_you_can_drink: e.target.checked})} /> 飲み放題あり</label>
              </div>

              <div className="filter-group mt-6">
                <label className="filter-label mb-2">お酒の種類 (複数選択)</label>
                <div className="flex flex-wrap gap-4">
                  {filterOptions.alcoholTypes.map(type => (
                    <label key={type} className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input type="checkbox" checked={rForm.alcohol_types.includes(type)} onChange={() => toggleAlcohol(type)} /> {type}
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-group mt-6">
                  <label className="filter-label flex items-center gap-2" style={{ color: 'var(--danger-red)' }}>
                    <input type="checkbox" checked={rForm.ng_flag} onChange={e => setRForm({...rForm, ng_flag: e.target.checked})} /> NG店舗として登録
                  </label>
              </div>

              <div className="filter-group mt-6">
                <label className="filter-label">特記事項・メモ</label>
                <textarea className="text-input" rows="4" value={rForm.memo} onChange={e => setRForm({...rForm, memo: e.target.value})} placeholder="利用した感想など"></textarea>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={() => navigate('/restaurants')} className="btn-ghost" style={{ border: '1px solid var(--text-secondary)' }}>キャンセル</button>
                <button type="submit" className="btn-primary"><Check size={18} /> {isEdit ? '更新する' : '登録する'}</button>
              </div>
            </form>
          )}

          {tab === 'gift' && (
            <form onSubmit={handleGSubmit} className="detail-section">
              <div className="detail-grid">
                <div className="filter-group">
                  <label className="filter-label">商品名 <span style={{color: 'var(--danger-red)'}}>*</span></label>
                  <input type="text" className="text-input" value={gForm.name} onChange={e => setGForm({...gForm, name: e.target.value})} required />
                </div>
                <div className="filter-group">
                  <label className="filter-label">ブランド・店名</label>
                  <input type="text" className="text-input" value={gForm.brand} onChange={e => setGForm({...gForm, brand: e.target.value})} />
                </div>
                <div className="filter-group">
                  <label className="filter-label">価格帯</label>
                  <select className="select-input" value={gForm.price} onChange={e => setGForm({...gForm, price: e.target.value})}>
                    {filterOptions.giftPrices.filter(p => p !== 'すべて').map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label className="filter-label">用途 (シーン)</label>
                  <select className="select-input" value={gForm.scene} onChange={e => setGForm({...gForm, scene: e.target.value})}>
                    {filterOptions.giftScenes.filter(s => s !== 'すべて').map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label className="filter-label">日持ち</label>
                  <select className="select-input" value={gForm.expiry} onChange={e => setGForm({...gForm, expiry: e.target.value})}>
                    {filterOptions.giftExpiries.filter(e => e !== 'すべて').map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label className="filter-label">購入場所</label>
                  <input type="text" className="text-input" value={gForm.buy_place} onChange={e => setGForm({...gForm, buy_place: e.target.value})} />
                </div>
              </div>

              <div className="filter-group mt-6">
                  <label className="filter-label flex items-center gap-2" style={{ color: 'var(--danger-red)' }}>
                    <input type="checkbox" checked={gForm.ng_flag} onChange={e => setGForm({...gForm, ng_flag: e.target.checked})} /> NG手土産として登録
                  </label>
              </div>

              <div className="filter-group mt-6">
                <label className="filter-label">特記事項・メモ</label>
                <textarea className="text-input" rows="4" value={gForm.memo} onChange={e => setGForm({...gForm, memo: e.target.value})} placeholder="利用した感想など"></textarea>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={() => navigate('/gifts')} className="btn-ghost" style={{ border: '1px solid var(--text-secondary)' }}>キャンセル</button>
                <button type="submit" className="btn-primary"><Check size={18} /> {isEdit ? '更新する' : '登録する'}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
