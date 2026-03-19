import React, { useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ExternalLink, ArrowLeft, ShieldAlert, User, ThumbsUp, ThumbsDown, Award, AlertTriangle } from 'lucide-react';

export default function GiftDetail() {
  const { id } = useParams();
  const { gifts, toggleLike, userLikes } = useContext(AppContext);
  const gift = gifts.find(g => g.id === id);

  if (!gift) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>手土産が見つかりません。</p>
        <Link to="/gifts" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> 一覧に戻る
        </Link>
      </div>
    );
  }

  const userVote = userLikes[gift.id];
  const isRecommended = (gift.like_count || 0) >= 3 && (gift.like_count || 0) > (gift.bad_count || 0) * 2;
  const isCaution = (gift.bad_count || 0) >= 3 && (gift.bad_count || 0) > (gift.like_count || 0);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/gifts" className="btn-ghost flex items-center gap-2 mb-2" style={{ display: 'inline-flex' }}>
        <ArrowLeft size={16} /> 一覧に戻る
      </Link>

      <div className="detail-container">
        <div className="detail-hero" style={{ backgroundImage: `url(${gift.image_url})` }}>
          <div className="detail-hero-overlay"></div>
        </div>

        <div className="detail-content">
          {gift.ng_flag && (
            <div className="ng-banner">
              <ShieldAlert size={20} />
              <span>NG手土産に指定されています</span>
            </div>
          )}

          <div className="detail-header">
            <div className="card-tags mb-2">
              {gift.brand && <span className="badge">{gift.brand}</span>}
              <span className="badge boolean-badge true">{gift.scene}</span>
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
              {gift.registrant && (
                <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', border: 'none' }}>
                  <User size={10} /> {gift.registrant}
                </span>
              )}
            </div>

            <h1 className="detail-title">{gift.name}</h1>
          </div>

          {/* Like/Bad Buttons */}
          <div className="detail-reactions">
            <button
              className={`detail-reaction-btn like ${userVote?.type === 'like' ? 'active' : ''}`}
              onClick={() => toggleLike(gift.id, 'like')}
            >
              <ThumbsUp size={20} /> いいね {gift.like_count || 0}
            </button>
            <button
              className={`detail-reaction-btn bad ${userVote?.type === 'bad' ? 'active' : ''}`}
              onClick={() => toggleLike(gift.id, 'bad')}
            >
              <ThumbsDown size={20} /> うーん {gift.bad_count || 0}
            </button>
          </div>

          <div className="detail-grid">
            <div className="detail-section">
              <div className="detail-item">
                <span className="detail-item-label">価格帯</span>
                <span className="detail-item-value">{gift.price}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">日持ち</span>
                <span className="detail-item-value">{gift.expiry}</span>
              </div>
            </div>

            <div className="detail-section">
              <div className="detail-item">
                <span className="detail-item-label">購入場所</span>
                <span className="detail-item-value">{gift.buy_place}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">参考リンク</span>
                <span className="detail-item-value">
                  {gift.url ? (
                    <a href={gift.url} target="_blank" rel="noreferrer" className="detail-url">
                      公式サイトを見る <ExternalLink size={14} />
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
                {gift.memo || "特になし"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
