import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';

const Login = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useChatStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usernameFocus, setUsernameFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('請輸入用戶名稱');
      return;
    }

    if (!password.trim()) {
      setError('請輸入密碼');
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (password.length >= 4) {
        setCurrentUser(username);
        sessionStorage.setItem('chatapp_user', username);
        sessionStorage.setItem('chatapp_token', crypto.randomUUID()); // TODO: replace with real auth API
        navigate('/');
      } else {
        setError('密碼至少需要 4 個字元');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        /* intentional: hero is always dark */
        background: `
          radial-gradient(1200px 700px at 20% 30%, rgba(99,102,241,0.18), transparent 60%),
          radial-gradient(1000px 600px at 90% 80%, rgba(139,92,246,0.14), transparent 60%),
          radial-gradient(800px 600px at 50% 100%, rgba(34,211,238,0.06), transparent 50%),
          #060A14
        `,
        display: 'grid',
        gridTemplateColumns: '1fr 560px',
        fontFamily: 'var(--font-sans)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle grid texture overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* ===== LEFT: Hero ===== */}
      <section style={{ position: 'relative', padding: '36px 56px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11,
            background: 'linear-gradient(135deg, #2563EB, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(99,102,241,0.35), 0 0 0 1px rgba(255,255,255,0.06) inset',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="10" r="2.4" fill="#fff"/>
              <circle cx="15" cy="10" r="2.4" fill="#fff"/>
              <circle cx="9" cy="10" r="1" fill="#0B1220"/>
              <circle cx="15" cy="10" r="1" fill="#0B1220"/>
              <path d="M11 14.5 L12 16 L13 14.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M12 4 L13.6 5.6 M12 4 L10.4 5.6" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', color: '#E5E7EB' }}>ChatOwl</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1, letterSpacing: '0.02em' }}>企業即時通訊・接案媒合平台</div>
          </div>
        </div>

        {/* Hero body */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 640, position: 'relative', zIndex: 2 }}>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 11px 5px 6px', borderRadius: 999,
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
            fontSize: 12, color: '#C7D2FE', width: 'fit-content', marginBottom: 22,
          }}>
            <span style={{
              width: 18, height: 18, borderRadius: 999,
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 11, fontWeight: 600,
            }}>B2B</span>
            <span>專為台灣企業打造的合作網絡</span>
          </div>

          {/* Tagline */}
          <h1 style={{
            fontFamily: "'Noto Sans TC', 'Inter', sans-serif",
            fontWeight: 700, fontSize: 64, lineHeight: 1.08,
            letterSpacing: '-0.025em', margin: '0 0 20px 0',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #C7D2FE 100%)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          }}>
            連結企業
            <span style={{ color: '#6366F1', WebkitTextFillColor: '#6366F1', margin: '0 4px' }}>．</span>
            媒合專案
            <span style={{ color: '#6366F1', WebkitTextFillColor: '#6366F1', margin: '0 4px' }}>．</span>
            共創商機
          </h1>

          <p style={{ fontSize: 17, lineHeight: 1.65, color: '#94A3B8', maxWidth: 520, margin: '0 0 36px 0', fontWeight: 400 }}>
            從上市公司到新創團隊，超過 12,000 家企業在 ChatOwl 上發掘合作夥伴、發布專案需求，並以加密通訊安心協作。
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 36, marginTop: 16, paddingTop: 28, borderTop: '1px solid rgba(148,163,184,0.12)' }}>
            {[
              { num: '12,400+', lbl: '已認證企業' },
              { num: '86,200', lbl: '本月新發專案' },
              { num: 'NT$ 4.8B', lbl: '累計媒合金額' },
              { num: '98.6%', lbl: '合作完成率' },
            ].map(s => (
              <div key={s.lbl}>
                <div style={{
                  fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em',
                  background: 'linear-gradient(180deg, #fff, #C7D2FE)',
                  WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>{s.num}</div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2, letterSpacing: '0.02em' }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero SVG illustration */}
        <svg
          aria-hidden="true"
          style={{ position: 'absolute', right: -80, top: 80, width: 720, height: 720, zIndex: 1, pointerEvents: 'none' }}
          viewBox="0 0 720 720" fill="none"
        >
          <defs>
            <radialGradient id="globeG" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1E293B" stopOpacity="0.9"/>
              <stop offset="60%" stopColor="#0F172A" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="#0B1220" stopOpacity="0"/>
            </radialGradient>
            <linearGradient id="lineG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0"/>
              <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#22D3EE" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="cardG1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1E293B"/>
              <stop offset="100%" stopColor="#0B1220"/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <circle cx="360" cy="360" r="320" fill="url(#globeG)"/>
          <circle cx="360" cy="360" r="280" stroke="rgba(148,163,184,0.12)" strokeWidth="1" fill="none"/>
          <circle cx="360" cy="360" r="220" stroke="rgba(148,163,184,0.16)" strokeWidth="1" fill="none" strokeDasharray="2 6"/>
          <circle cx="360" cy="360" r="160" stroke="rgba(148,163,184,0.2)" strokeWidth="1" fill="none"/>
          <circle cx="360" cy="360" r="100" stroke="rgba(99,102,241,0.3)" strokeWidth="1" fill="none"/>
          <g opacity="0.55">
            <path d="M120 460 L120 420 L140 420 L140 380 L160 380 L160 410 L185 410 L185 360 L210 360 L210 340 L225 340 L225 320 L245 320 L245 380 L265 380 L265 350 L290 350 L290 330 L315 330 L315 290 L335 290 L335 270 L355 270 L355 250 L380 250 L380 290 L405 290 L405 320 L425 320 L425 280 L450 280 L450 350 L475 350 L475 310 L500 310 L500 360 L525 360 L525 330 L550 330 L550 380 L575 380 L575 410 L600 410 L600 460 Z"
              fill="#0B1220" stroke="rgba(99,102,241,0.4)" strokeWidth="0.8"/>
          </g>
          <g strokeLinecap="round" fill="none">
            <path d="M180 250 Q 360 100 540 220" stroke="url(#lineG)" strokeWidth="1.5" strokeDasharray="4 6"/>
            <path d="M120 380 Q 250 320 420 380" stroke="url(#lineG)" strokeWidth="1.5" strokeDasharray="4 6"/>
            <path d="M540 220 Q 580 350 460 460" stroke="url(#lineG)" strokeWidth="1.5" strokeDasharray="4 6"/>
          </g>
          <g filter="url(#glow)">
            <g transform="translate(180 250)">
              <circle r="26" fill="url(#cardG1)" stroke="rgba(99,102,241,0.5)" strokeWidth="1.5"/>
              <rect x="-9" y="-6" width="18" height="13" rx="2" fill="none" stroke="#A78BFA" strokeWidth="1.5"/>
              <path d="M-5 -6 V-9 H5 V-6" stroke="#A78BFA" strokeWidth="1.5" fill="none"/>
            </g>
            <g transform="translate(540 220)">
              <circle r="30" fill="url(#cardG1)" stroke="rgba(139,92,246,0.6)" strokeWidth="1.5"/>
              <path d="M-10 8 V-6 L-2 -10 L-2 -2 L8 -6 V8 Z" fill="none" stroke="#C4B5FD" strokeWidth="1.5"/>
              <rect x="0" y="3" width="4" height="5" fill="#C4B5FD"/>
            </g>
            <g transform="translate(420 380)">
              <circle r="34" fill="url(#cardG1)" stroke="rgba(99,102,241,0.6)" strokeWidth="1.5"/>
              <path d="M-14 0 L-6 -8 L0 -2 L6 -8 L14 0 L8 6 L4 2 L-4 10 L-10 4 Z"
                fill="none" stroke="#A78BFA" strokeWidth="1.5" strokeLinejoin="round"/>
            </g>
          </g>
          <g>
            <circle cx="280" cy="180" r="3" fill="#A78BFA"/>
            <circle cx="460" cy="150" r="2.5" fill="#67E8F9"/>
            <circle cx="600" cy="340" r="2.5" fill="#A78BFA"/>
          </g>
        </svg>

        {/* Floating card 1 */}
        <div aria-hidden="true" style={{
          position: 'absolute', right: 80, top: 180, width: 220,
          background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(148,163,184,0.2)',
          borderRadius: 12, padding: '12px 14px', backdropFilter: 'blur(12px)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.5)', fontSize: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #2563EB, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>台</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 12.5, color: '#E5E7EB' }}>台積電子</div>
              <div style={{ fontSize: 10.5, color: '#64748B' }}>已驗證 · 半導體</div>
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: '#94A3B8', lineHeight: 1.5 }}>徵求 PCB 後段組裝合作夥伴 · 預算 NT$ 2.4M</div>
        </div>

        {/* Floating card 2 */}
        <div aria-hidden="true" style={{
          position: 'absolute', left: 60, bottom: 180, width: 200,
          background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(148,163,184,0.2)',
          borderRadius: 12, padding: '12px 14px', backdropFilter: 'blur(12px)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.5)', fontSize: 12,
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(34,211,238,0.15)', color: '#22D3EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#E5E7EB' }}>端對端加密</div>
              <div style={{ fontSize: 10.5, color: '#64748B' }}>商業機密安全傳輸</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== RIGHT: Login ===== */}
      <section style={{ padding: '36px 56px 36px 0', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 999,
            background: 'var(--color-input-bg)', border: '1px solid var(--color-main-border)',
            fontSize: 12, color: 'var(--color-main-text-dim)', backdropFilter: 'blur(10px)',
          }}>
            繁體中文
          </span>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Login card */}
          <div style={{
            width: 480,
            background: 'var(--color-main-bg-2)',
            border: '1px solid var(--color-main-border)',
            borderRadius: 20,
            padding: '36px 36px 28px 36px',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 30px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 -1px 0 rgba(255,255,255,0.06) inset',
            position: 'relative',
          }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 6px 0', color: 'var(--color-main-text)' }}>登入帳號</h2>
            <p style={{ fontSize: 13.5, color: 'var(--color-main-text-dim)', margin: '0 0 26px 0' }}>使用您的帳號登入，開始安全加密對話。</p>

            {error && (
              <div
                role="alert"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', marginBottom: 16,
                  background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 10, fontSize: 13, color: '#FCA5A5',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Username field */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--color-main-text-dim)', marginBottom: 7, fontWeight: 500 }}>
                  <label htmlFor="login-username">用戶名稱</label>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  height: 46, padding: '0 14px',
                  background: 'var(--color-input-bg)',
                  border: `1px solid ${usernameFocus ? 'var(--color-indigo)' : 'var(--color-main-border)'}`,
                  borderRadius: 11,
                  boxShadow: usernameFocus ? '0 0 0 4px rgba(99,102,241,0.16)' : 'none',
                  transition: 'border-color 150ms, box-shadow 150ms',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-main-text-dim)" strokeWidth="1.75"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  <input
                    id="login-username"
                    type="text"
                    autoComplete="username"
                    placeholder="請輸入用戶名稱"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    onFocus={() => setUsernameFocus(true)}
                    onBlur={() => setUsernameFocus(false)}
                    style={{
                      flex: 1, fontSize: 14, background: 'transparent',
                      border: 'none', outline: 'none', color: 'var(--color-main-text)',
                    }}
                  />
                </div>
              </div>

              {/* Password field */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--color-main-text-dim)', marginBottom: 7, fontWeight: 500 }}>
                  <label htmlFor="login-password">密碼</label>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  height: 46, padding: '0 14px',
                  background: 'var(--color-input-bg)',
                  border: `1px solid ${passwordFocus ? 'var(--color-indigo)' : 'var(--color-main-border)'}`,
                  borderRadius: 11,
                  boxShadow: passwordFocus ? '0 0 0 4px rgba(99,102,241,0.16)' : 'none',
                  transition: 'border-color 150ms, box-shadow 150ms',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-main-text-dim)" strokeWidth="1.75"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="請輸入密碼"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    onFocus={() => setPasswordFocus(true)}
                    onBlur={() => setPasswordFocus(false)}
                    style={{
                      flex: 1, fontSize: 14, background: 'transparent',
                      border: 'none', outline: 'none', color: 'var(--color-main-text)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
                    style={{ color: 'var(--color-main-text-dim)', fontSize: 12, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {showPassword ? '隱藏' : '顯示'}
                  </button>
                </div>
              </div>

              {/* Remember / Forgot */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0 22px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-main-text-dim)', cursor: 'pointer' }}>
                  <span style={{ width: 16, height: 16, borderRadius: 5, background: 'var(--color-indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12.5 10 17l9-10"/></svg>
                  </span>
                  記住此裝置 30 天
                </label>
                <span style={{ fontSize: 13, color: '#C7D2FE' }}>忘記密碼？</span>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%', height: 48, borderRadius: 12,
                  background: 'linear-gradient(135deg, #2563EB 0%, #6366F1 50%, #8B5CF6 100%)',
                  color: '#fff', fontWeight: 600, fontSize: 15, border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: '0 10px 24px rgba(99,102,241,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset',
                  letterSpacing: '0.02em', cursor: isLoading ? 'wait' : 'pointer',
                  opacity: isLoading ? 0.75 : 1, transition: 'opacity 150ms',
                }}
              >
                {isLoading ? (
                  <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} aria-hidden="true" />
                ) : null}
                {isLoading ? '登入中...' : '登入 ChatOwl'}
                {!isLoading && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0 16px 0', color: 'var(--color-main-text-dim)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <span style={{ flex: 1, height: 1, background: 'var(--color-main-border)' }} />
              或使用 SSO 登入
              <span style={{ flex: 1, height: 1, background: 'var(--color-main-border)' }} />
            </div>

            {/* SSO grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              {[
                { label: 'Google', icon: <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 1 1-3.3-12.6l5.7-5.7A20 20 0 1 0 44 24a20 20 0 0 0-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8A12 12 0 0 1 24 12a12 12 0 0 1 7.7 2.8l5.7-5.7A20 20 0 0 0 6.3 14.7z"/><path fill="#4CAF50" d="M24 44a20 20 0 0 0 13.5-5.2l-6.2-5.3A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.5l6.2 5.3C37 39.8 44 34 44 24a20 20 0 0 0-.4-3.5z"/></svg> },
                { label: 'Microsoft', icon: <svg width="14" height="14" viewBox="0 0 24 24"><rect x="1" y="1" width="10" height="10" fill="#F25022"/><rect x="13" y="1" width="10" height="10" fill="#7FBA00"/><rect x="1" y="13" width="10" height="10" fill="#00A4EF"/><rect x="13" y="13" width="10" height="10" fill="#FFB900"/></svg> },
                { label: 'Apple', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M17 12.5c0-2.6 2.1-3.8 2.2-3.9-1.2-1.7-3-2-3.7-2-1.6-.2-3 .9-3.8.9s-2-.9-3.3-.9c-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.5 1.3 0 1.8-.8 3.4-.8s2 .8 3.4.8c1.4 0 2.3-1.2 3.1-2.4.6-.9 1.1-1.8 1.4-2.8-1.5-.6-3-2.2-3-4.1zM14.5 4.7c.7-.8 1.2-2 1-3.2-1 0-2.3.7-3 1.5-.7.7-1.2 1.9-1.1 3.1 1.1 0 2.3-.6 3.1-1.4z"/></svg> },
                { label: 'LINE Works', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A66C2" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="3" fill="#0A66C2"/><circle cx="7" cy="8" r="1.6" fill="#fff"/><line x1="7" y1="11" x2="7" y2="18" stroke="#fff" strokeLinecap="round" strokeWidth="3"/><path d="M11 18v-7M11 14c0-2 1.5-3 3-3s3 1 3 3v4" stroke="#fff" strokeLinecap="round" strokeWidth="3"/></svg> },
              ].map(sso => (
                <button
                  key={sso.label}
                  type="button"
                  style={{
                    height: 42, borderRadius: 10,
                    background: 'var(--color-input-bg)', border: '1px solid var(--color-main-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontSize: 13, fontWeight: 500, color: 'var(--color-main-text)', cursor: 'pointer',
                    transition: 'background 150ms, border-color 150ms',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  {sso.icon}
                  {sso.label}
                </button>
              ))}
            </div>
            {/* Enterprise SSO wide button */}
            <button
              type="button"
              style={{
                width: '100%', height: 42, borderRadius: 10,
                background: 'linear-gradient(180deg, rgba(99,102,241,0.1), rgba(139,92,246,0.06))',
                border: '1px solid rgba(99,102,241,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontSize: 13, fontWeight: 500, color: 'var(--color-main-text)', cursor: 'pointer',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="1.75"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01"/></svg>
              <span>企業單一登入 (SAML 2.0 / OIDC)</span>
              <span style={{ fontSize: 10, color: 'var(--color-main-text-dim)', marginLeft: 4 }}>為大型企業設計</span>
            </button>

            {/* Footer */}
            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-main-text-dim)', marginTop: 22, paddingTop: 20, borderTop: '1px solid var(--color-main-border)' }}>
              還沒有帳號？
              <Link
                to="/register"
                style={{ color: '#C7D2FE', fontWeight: 600, marginLeft: 4 }}
              >
                立即註冊
              </Link>
            </div>

            {/* Legal */}
            <div style={{ paddingTop: 16, textAlign: 'center', fontSize: 11, color: 'var(--color-main-text-dim)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#22D3EE', marginRight: 8 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
                SOC 2 Type II · ISO 27001
              </span>
              <span style={{ color: 'var(--color-main-text-dim)', margin: '0 6px' }}>服務條款</span>·
              <span style={{ color: 'var(--color-main-text-dim)', margin: '0 6px' }}>隱私政策</span>·
              <span style={{ color: 'var(--color-main-text-dim)', margin: '0 6px' }}>企業合約</span>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Login;
