import React, { useState } from 'react';
import { Lock, LogIn, AlertCircle } from 'lucide-react';

const PASSCODE = 'pasco';

export default function Login({ onLogin }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code === PASSCODE) {
      sessionStorage.setItem('settai_auth', 'true');
      onLogin();
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0c0d12 0%, #16171e 50%, #0c0d12 100%)',
      padding: '1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '380px',
        animation: shaking ? 'shake 0.4s ease' : 'fadeInUp 0.6s ease',
      }}>
        {/* Logo Area */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem',
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '0.5rem',
          }}>🍽️</div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #c5a059, #eeda9b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.25rem',
          }}>
            せったいくん
          </h1>
          <p style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            letterSpacing: '1px',
          }}>
            接待店舗・手土産管理
          </p>
        </div>

        {/* Login Card */}
        <form onSubmit={handleSubmit} style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          padding: '2rem 1.5rem',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}>
            <Lock size={16} color="var(--accent-gold)" />
            社内専用 - パスコードを入力
          </div>

          <div style={{
            fontSize: '0.85rem',
            lineHeight: '1.6',
            color: 'rgba(255,255,255,0.7)',
            background: 'rgba(197, 160, 89, 0.08)',
            padding: '1.25rem',
            borderRadius: '10px',
            border: '1px solid rgba(197, 160, 89, 0.2)',
            marginBottom: '1.5rem',
            textAlign: 'left',
          }}>
            <p style={{ margin: 0 }}>
              お店選び困りますよね。過去に実際に行ってよかったところを登録してください。<br />
              また行ってみてよかった・わるかったのリアクションもお願いします。みんなで情報共有しましょう。
            </p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <input
              type="password"
              className="text-input"
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(false); }}
              placeholder="パスコード"
              autoFocus
              autoComplete="off"
              style={{
                width: '100%',
                fontSize: '1.1rem',
                textAlign: 'center',
                letterSpacing: '4px',
                padding: '0.85rem 1rem',
                borderColor: error ? 'var(--danger-red)' : undefined,
              }}
            />
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--danger-red)',
              fontSize: '0.8rem',
              fontWeight: 500,
              marginBottom: '1rem',
              justifyContent: 'center',
            }}>
              <AlertCircle size={14} />
              パスコードが正しくありません
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              padding: '0.85rem',
              fontSize: '1rem',
              borderRadius: '10px',
            }}
          >
            <LogIn size={18} /> ログイン
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.2)',
          marginTop: '1.5rem',
        }}>
          © せったいくん - Internal Use Only
        </p>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
