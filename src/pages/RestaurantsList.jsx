import React, { useState, useMemo, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { filterOptions } from '../data/mockData';
import { AppContext } from '../context/AppContext';
import { Users, Search, ShieldAlert, SlidersHorizontal, X, Plus, DoorOpen, ThumbsUp, ThumbsDown, Award, AlertTriangle, Trash2, Edit3, Flame } from 'lucide-react';

export default function RestaurantsList() {
  const { restaurants, toggleLike, userLikes, deleteRestaurant } = useContext(AppContext);
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    area: 'すべて',
    roleLevel: 'すべて',
    privateRoom: 'すべて',
    smokingAllowed: 'すべて',
    priceRange: 'すべて',
    quietLevel: 'すべて'
  });
  const [sortBy, setSortBy] = useState('recommended');

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== 'すべて').length;

  const resetFilters = () => {
    setFilters({
      area: 'すべて',
      roleLevel: 'すべて',
      privateRoom: 'すべて',
      smokingAllowed: 'すべて',
      priceRange: 'すべて',
      quietLevel: 'すべて'
    });
  };

  const filteredRestaurants = useMemo(() => {
    let result = [...restaurants];

    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.area.toLowerCase().includes(q) ||
        (r.category && r.category.toLowerCase().includes(q))
      );
    }

    if (filters.area !== 'すべて') {
      result = result.filter(r => r.area === filters.area);
    }
    if (filters.roleLevel !== 'すべて') {
      result = result.filter(r => r.role_level === filters.roleLevel);
    }
    if (filters.privateRoom !== 'すべて') {
      const isReqPrivate = filters.privateRoom === 'あり';
      result = result.filter(r => r.private_room === isReqPrivate);
    }
    if (filters.smokingAllowed !== 'すべて') {
      const isReqSmoking = filters.smokingAllowed === 'あり';
      result = result.filter(r => r.smoking_allowed === isReqSmoking);
    }
    if (filters.priceRange !== 'すべて') {
      result = result.filter(r => r.price_range === filters.priceRange);
    }
    if (filters.quietLevel !== 'すべて') {
      result = result.filter(r => r.quiet_level === filters.quietLevel);
    }

    result.sort((a, b) => {
      if (sortBy === 'recommended') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'likeDesc') return ((b.like_count || 0) - (b.bad_count || 0)) - ((a.like_count || 0) - (a.bad_count || 0));
      if (sortBy === 'priceAsc') return a.price_range.localeCompare(b.price_range);
      if (sortBy === 'priceDesc') return b.price_range.localeCompare(a.price_range);
      if (sortBy === 'myVoted') {
        const aVoted = userLikes[a.id] ? 1 : 0;
        const bVoted = userLikes[b.id] ? 1 : 0;
        return bVoted - aVoted;
      }
      return 0;
    });
    return result;
  }, [restaurants, filters, sortBy, searchText, userLikes]);

  const isRecommended = (r) => (r.like_count || 0) >= 3 && (r.like_count || 0) > (r.bad_count || 0) * 2;
  const isCaution = (r) => (r.bad_count || 0) >= 3 && (r.bad_count || 0) > (r.like_count || 0);

  const handleReaction = (e, id, type) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(id, type);
  };

  const handleDelete = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('削除すると元に戻せませんが、よろしいですか？')) {
      deleteRestaurant(id);
    }
  };

  const handleEdit = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/register?type=restaurant&id=${id}`);
  };

  return (
    <div>
      <h1 className="page-title">店舗を探す</h1>

      <div className="search-bar-sticky">
        <div className="search-input-wrap">
          <Search size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="店名・エリア・ジャンルで検索..."
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
          { key: 'myVoted', label: '自分の評価済み' },
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
        {filteredRestaurants.length}件の店舗
      </div>

      <div className="card-grid">
        {filteredRestaurants.map(r => {
          const recommended = isRecommended(r);
          const caution = isCaution(r);
          const dimmed = (r.ng_flag || caution) && !recommended;
          const userVote = userLikes[r.id];

          return (
            <Link
              to={`/restaurants/${r.id}`}
              key={r.id}
              className={`item-card ${r.ng_flag ? 'is-ng' : ''} ${dimmed ? 'is-dimmed' : ''}`}
            >
              <div className="card-image-wrap">
                <img src={r.image_url} alt={r.name} className="card-image" loading="lazy" />
                <div style={{ position: 'absolute', top: '6px', right: '6px', display: 'flex', gap: '4px' }}>
                  <button className="action-icon-btn" onClick={(e) => handleEdit(e, r.id)} style={{ background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '4px', padding: '4px', color: 'white', display: 'flex' }}>
                    <Edit3 size={14} />
                  </button>
                  <button className="action-icon-btn" onClick={(e) => handleDelete(e, r.id)} style={{ background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '4px', padding: '4px', color: '#ff6b6b', display: 'flex' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
                {r.ng_flag && (
                  <div style={{ position: 'absolute', top: '6px', left: '6px' }} className="badge ng-badge">
                    <ShieldAlert size={10} /> NG
                  </div>
                )}
                {recommended && !r.ng_flag && (
                  <div style={{ position: 'absolute', top: '6px', left: '6px' }} className="badge recommend-badge">
                    <Award size={10} /> おすすめ
                  </div>
                )}
                {caution && !r.ng_flag && (
                  <div style={{ position: 'absolute', top: '6px', left: '6px' }} className="badge caution-badge">
                    <AlertTriangle size={10} /> 注意
                  </div>
                )}
              </div>
              <div className="card-content">
                <h3 className="card-title">{r.name}</h3>
                <div className="card-tags">
                  <span className="badge">{r.area}</span>
                  <span className="badge">{r.price_range}</span>
                  {r.private_room && (
                    <span className="badge boolean-badge true">
                      <DoorOpen size={10} /> 個室
                    </span>
                  )}
                  {r.smoking_allowed && (
                    <span className="badge boolean-badge true" style={{ backgroundColor: '#fdf2f2', color: '#e05a5a', border: '1px solid #f9d6d6' }}>
                      <Flame size={10} /> 喫煙可
                    </span>
                  )}
                </div>
                <div className="card-info">
                  <div className="info-row">
                    <Users size={12} color="var(--accent-gold)" />
                    <span>{r.role_level}</span>
                  </div>
                  {r.registrant && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      登録者: {r.registrant}
                    </div>
                  )}
                </div>
                <div className="card-reactions">
                  <button
                    className={`reaction-btn like ${userVote?.type === 'like' ? 'active' : ''}`}
                    onClick={(e) => handleReaction(e, r.id, 'like')}
                  >
                    <ThumbsUp size={14} /> {r.like_count || 0}
                  </button>
                  <button
                    className={`reaction-btn bad ${userVote?.type === 'bad' ? 'active' : ''}`}
                    onClick={(e) => handleReaction(e, r.id, 'bad')}
                  >
                    <ThumbsDown size={14} /> {r.bad_count || 0}
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
                <label className="filter-label">エリア</label>
                <select className="select-input" value={filters.area} onChange={e => handleFilterChange('area', e.target.value)}>
                  {filterOptions.areas.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">対象役職</label>
                <select className="select-input" value={filters.roleLevel} onChange={e => handleFilterChange('roleLevel', e.target.value)}>
                  {filterOptions.roleLevels.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">個室</label>
                <select className="select-input" value={filters.privateRoom} onChange={e => handleFilterChange('privateRoom', e.target.value)}>
                  <option value="すべて">すべて</option>
                  <option value="あり">あり</option>
                  <option value="なし">なし</option>
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">喫煙可</label>
                <select className="select-input" value={filters.smokingAllowed} onChange={e => handleFilterChange('smokingAllowed', e.target.value)}>
                  <option value="すべて">すべて</option>
                  <option value="あり">あり</option>
                  <option value="なし">なし</option>
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">価格帯</label>
                <select className="select-input" value={filters.priceRange} onChange={e => handleFilterChange('priceRange', e.target.value)}>
                  {filterOptions.priceRanges.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">静かさ</label>
                <select className="select-input" value={filters.quietLevel} onChange={e => handleFilterChange('quietLevel', e.target.value)}>
                  {filterOptions.quietLevels.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="filter-modal-actions">
              <button className="btn-ghost" onClick={resetFilters} style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                リセット
              </button>
              <button className="btn-primary" onClick={() => setShowFilterModal(false)}>
                {filteredRestaurants.length}件を表示
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
