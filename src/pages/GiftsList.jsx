import React, { useState, useMemo, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { filterOptions } from '../data/mockData';
import { AppContext } from '../context/AppContext';
import { Coins, Clock, Search, ShieldAlert, SlidersHorizontal, X, Plus, ThumbsUp, ThumbsDown, Award, AlertTriangle, Trash2, Edit3 } from 'lucide-react';

export default function GiftsList() {
  const { gifts, toggleLike, userLikes, deleteGift } = useContext(AppContext);
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    price: 'すべて',
    scene: 'すべて',
    expiry: 'すべて'
  });
  const [sortBy, setSortBy] = useState('recommended');

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== 'すべて').length;

  const resetFilters = () => {
    setFilters({ price: 'すべて', scene: 'すべて', expiry: 'すべて' });
  };

  const filteredGifts = useMemo(() => {
    let result = [...gifts];

    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      result = result.filter(g =>
        g.name.toLowerCase().includes(q) ||
        (g.brand && g.brand.toLowerCase().includes(q))
      );
    }

    if (filters.price !== 'すべて') {
      result = result.filter(g => g.price === filters.price);
    }
    if (filters.scene !== 'すべて') {
      result = result.filter(g => g.scene === filters.scene);
    }
    if (filters.expiry !== 'すべて') {
      result = result.filter(g => g.expiry === filters.expiry);
    }

    result.sort((a, b) => {
      if (sortBy === 'recommended') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'likeDesc') return ((b.like_count || 0) - (b.bad_count || 0)) - ((a.like_count || 0) - (a.bad_count || 0));
      if (sortBy === 'priceAsc') return a.price.localeCompare(b.price);
      if (sortBy === 'priceDesc') return b.price.localeCompare(a.price);
      return 0;
    });
    return result;
  }, [gifts, filters, sortBy, searchText]);

  const isRecommended = (g) => (g.like_count || 0) >= 3 && (g.like_count || 0) > (g.bad_count || 0) * 2;
  const isCaution = (g) => (g.bad_count || 0) >= 3 && (g.bad_count || 0) > (g.like_count || 0);

  const handleReaction = (e, id, type) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(id, type);
  };

  const handleDelete = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('削除すると元に戻せませんが、よろしいですか？')) {
      deleteGift(id);
    }
  };

  const handleEdit = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/register?type=gift&id=${id}`);
  };

  return (
    <div>
      <h1 className="page-title">手土産を探す</h1>

      <div className="search-bar-sticky">
        <div className="search-input-wrap">
          <Search size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="商品名・ブランドで検索..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>
        <button
          className={`filter-trigger-btn ${activeFilterCount > 0 ? 'has-filter' : ''}`}
          onClick={() => setShowFilterModal(true)}
        >
          <SlidersHorizontal size={20} />
          {activeFilterCount > 0 && (
            <span className="filter-count-dot">{activeFilterCount}</span>
          )}
        </button>
      </div>

      <div className="sort-chips">
        {[
          { key: 'recommended', label: 'おすすめ順' },
          { key: 'likeDesc', label: '評価が高い順' },
          { key: 'priceAsc', label: '価格↑' },
          { key: 'priceDesc', label: '価格↓' },
        ].map(s => (
          <button
            key={s.key}
            className={`sort-chip ${sortBy === s.key ? 'active' : ''}`}
            onClick={() => setSortBy(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="results-count mb-2">
        {filteredGifts.length}件の手土産
      </div>

      <div className="card-grid">
        {filteredGifts.map(g => {
          const recommended = isRecommended(g);
          const caution = isCaution(g);
          const dimmed = (g.ng_flag || caution) && !recommended;
          const userVote = userLikes[g.id];

          return (
            <Link
              to={`/gifts/${g.id}`}
              key={g.id}
              className={`item-card ${g.ng_flag ? 'is-ng' : ''} ${dimmed ? 'is-dimmed' : ''}`}
            >
              <div className="card-image-wrap">
                <img src={g.image_url} alt={g.name} className="card-image" loading="lazy" />
                <div style={{ position: 'absolute', top: '6px', right: '6px', display: 'flex', gap: '4px' }}>
                   <button className="action-icon-btn" onClick={(e) => handleEdit(e, g.id)} style={{ background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '4px', padding: '4px', color: 'white', display: 'flex' }}>
                    <Edit3 size={14} />
                  </button>
                  <button className="action-icon-btn" onClick={(e) => handleDelete(e, g.id)} style={{ background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '4px', padding: '4px', color: '#ff6b6b', display: 'flex' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
                {g.ng_flag && (
                  <div style={{ position: 'absolute', top: '6px', left: '6px' }} className="badge ng-badge">
                    <ShieldAlert size={10} /> NG
                  </div>
                )}
                {recommended && !g.ng_flag && (
                  <div style={{ position: 'absolute', top: '6px', left: '6px' }} className="badge recommend-badge">
                    <Award size={10} /> おすすめ
                  </div>
                )}
                {caution && !g.ng_flag && (
                  <div style={{ position: 'absolute', top: '6px', left: '6px' }} className="badge caution-badge">
                    <AlertTriangle size={10} /> 注意
                  </div>
                )}
              </div>
              <div className="card-content">
                <h3 className="card-title">{g.name}</h3>
                <div className="card-tags">
                  {g.brand && <span className="badge">{g.brand}</span>}
                  <span className="badge boolean-badge true">{g.scene}</span>
                </div>
                <div className="card-info">
                  <div className="info-row">
                    <Coins size={12} color="var(--accent-gold)" />
                    <span>{g.price}</span>
                  </div>
                  <div className="info-row">
                    <Clock size={12} color="var(--accent-gold)" />
                    <span>{g.expiry}</span>
                  </div>
                  {g.registrant && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      登録者: {g.registrant}
                    </div>
                  )}
                </div>
                <div className="card-reactions">
                  <button
                    className={`reaction-btn like ${userVote?.type === 'like' ? 'active' : ''}`}
                    onClick={(e) => handleReaction(e, g.id, 'like')}
                  >
                    <ThumbsUp size={14} /> {g.like_count || 0}
                  </button>
                  <button
                    className={`reaction-btn bad ${userVote?.type === 'bad' ? 'active' : ''}`}
                    onClick={(e) => handleReaction(e, g.id, 'bad')}
                  >
                    <ThumbsDown size={14} /> {g.bad_count || 0}
                  </button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <button className="fab" onClick={() => navigate('/register')}>
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {showFilterModal && (
        <>
          <div className="filter-modal-backdrop" onClick={() => setShowFilterModal(false)} />
          <div className="filter-modal">
            <div className="filter-modal-handle" />
            <div className="filter-modal-header">
              <h3 className="filter-modal-title">絞り込み</h3>
              <button className="btn-ghost" onClick={() => setShowFilterModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="filter-modal-body">
              <div className="filter-group">
                <label className="filter-label">価格帯</label>
                <select className="select-input" value={filters.price} onChange={e => handleFilterChange('price', e.target.value)}>
                  {filterOptions.giftPrices.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">用途 (シーン)</label>
                <select className="select-input" value={filters.scene} onChange={e => handleFilterChange('scene', e.target.value)}>
                  {filterOptions.giftScenes.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">日持ち</label>
                <select className="select-input" value={filters.expiry} onChange={e => handleFilterChange('expiry', e.target.value)}>
                  {filterOptions.giftExpiries.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="filter-modal-actions">
              <button className="btn-ghost" onClick={resetFilters} style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                リセット
              </button>
              <button className="btn-primary" onClick={() => setShowFilterModal(false)}>
                {filteredGifts.length}件を表示
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
