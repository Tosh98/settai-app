import React, { useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { MapPin, Phone, ExternalLink, ArrowLeft, ShieldAlert, User, Wine, ThumbsUp, ThumbsDown, Award, AlertTriangle, DoorOpen, Edit3, Flame } from 'lucide-react';

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { restaurants, toggleLike, userLikes } = useContext(AppContext);
  const restaurant = restaurants.find(r => r.id === id);

  if (!restaurant) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>店舗が見つかりません。</p>
        <Link to="/restaurants" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> 一覧に戻る
        </Link>
      </div>
    );
  }

  const userVote = userLikes[restaurant.id];
  const isRecommended = (restaurant.like_count || 0) >= 3 && (restaurant.like_count || 0) > (restaurant.bad_count || 0) * 2;
  const isCaution = (restaurant.bad_count || 0) >= 3 && (restaurant.bad_count || 0) > (restaurant.like_count || 0);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/restaurants" className="btn-ghost flex items-center gap-2 mb-2" style={{ display: 'inline-flex' }}>
        <ArrowLeft size={16} /> 一覧に戻る
      </Link>

      <div className="detail-container">
        <div className="detail-hero" style={{ backgroundImage: `url(${restaurant.image_url})` }}>
          <div className="detail-hero-overlay"></div>
        </div>

        <div className="detail-content">
          {restaurant.ng_flag && (
            <div className="ng-banner">
              <ShieldAlert size={20} />
              <span>NG店舗に指定されています</span>
            </div>
          )}

          <div className="detail-header">
            <div className="flex justify-between items-start mb-2">
              <div className="card-tags">
                <span className="badge">{restaurant.category}</span>
                <span className={`badge boolean-badge ${restaurant.private_room ? 'true' : ''}`}>
                  <DoorOpen size={10} /> {restaurant.private_room ? '個室あり' : '個室なし'}
                </span>
                {restaurant.smoking_allowed && (
                  <span className="badge boolean-badge true" style={{ backgroundColor: '#fdf2f2', color: '#e05a5a', border: '1px solid #f9d6d6' }}>
                    <Flame size={10} /> 喫煙可
                  </span>
                )}
                {restaurant.all_you_can_drink && (
                  <span className="badge" style={{ backgroundColor: 'var(--accent-gold-bg)', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold-border)' }}>
                    飲み放題
                  </span>
                )}
                {isRecommended && (
                  <span className="badge recommend-badge">
                    <Award size={10} /> おすすめ
                  </span>
                )}
                {isCaution && (
                  <span className="badge caution-badge">
                    <AlertTriangle size={10} /> 注意
                  </span>
                )}
              </div>
              <button 
                className="btn-ghost flex items-center gap-1" 
                onClick={() => navigate(`/register?type=restaurant&id=${restaurant.id}`)}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <Edit3 size={14} /> 編集
              </button>
            </div>

            <h1 className="detail-title">{restaurant.name}</h1>

            <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
              <div className="flex items-center gap-2 text-secondary" style={{ fontSize: '0.9rem' }}>
                <MapPin size={16} color="var(--accent-gold)" />
                {restaurant.area}
              </div>
              {restaurant.phone && (
                <div className="flex items-center gap-2 text-secondary" style={{ fontSize: '0.9rem' }}>
                  <Phone size={16} color="var(--accent-gold)" />
                  {restaurant.phone}
                </div>
              )}
            </div>
          </div>

          {/* Like/Bad Buttons */}
          <div className="detail-reactions">
            <button
              className={`detail-reaction-btn like ${userVote?.type === 'like' ? 'active' : ''}`}
              onClick={() => toggleLike(restaurant.id, 'like')}
            >
              <ThumbsUp size={20} /> いいね {restaurant.like_count || 0}
            </button>
            <button
              className={`detail-reaction-btn bad ${userVote?.type === 'bad' ? 'active' : ''}`}
              onClick={() => toggleLike(restaurant.id, 'bad')}
            >
              <ThumbsDown size={20} /> うーん {restaurant.bad_count || 0}
            </button>
          </div>

          <div className="detail-grid">
            <div className="detail-section">
              <div className="detail-item">
                <span className="detail-item-label">対象役職</span>
                <span className="detail-item-value">{restaurant.role_level}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">価格帯</span>
                <span className="detail-item-value">{restaurant.price_range}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">静かさ</span>
                <span className="detail-item-value">{restaurant.quiet_level}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">雰囲気</span>
                <span className="detail-item-value">{restaurant.atmosphere}</span>
              </div>
            </div>

            <div className="detail-section">
              <div className="detail-item">
                <span className="detail-item-label flex items-center gap-1"><Wine size={12} /> お酒の種類</span>
                <div className="detail-item-value flex flex-wrap gap-2 mt-1">
                  {restaurant.alcohol_types && restaurant.alcohol_types.length > 0 ? (
                    restaurant.alcohol_types.map(a => (
                      <span key={a} className="badge" style={{ backgroundColor: 'var(--accent-gold-bg)', color: 'var(--text-primary)', border: '1px solid var(--accent-gold-border)' }}>{a}</span>
                    ))
                  ) : (
                    <span className="text-secondary" style={{ fontSize: '0.85rem' }}>登録なし</span>
                  )}
                </div>
              </div>
              <div className="detail-item mt-2">
                <span className="detail-item-label">住所</span>
                <span className="detail-item-value" style={{ fontSize: '0.9rem' }}>{restaurant.address}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">参考リンク</span>
                <span className="detail-item-value">
                  {restaurant.tabelog_url ? (
                    <a href={restaurant.tabelog_url} target="_blank" rel="noreferrer" className="detail-url">
                      食べログを見る <ExternalLink size={14} />
                    </a>
                  ) : (
                    <span className="text-secondary">-</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="detail-section" style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
            <div className="detail-item">
              <span className="detail-item-label">特記事項・メモ</span>
              <div className="detail-item-value" style={{
                lineHeight: '1.7',
                backgroundColor: 'var(--bg-input)',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                borderLeft: '3px solid var(--accent-gold)',
                fontSize: '0.9rem'
              }}>
                {restaurant.memo || "特になし"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
