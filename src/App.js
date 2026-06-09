import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import AppShell from './pages/AppShell';
import { Pricing, Admin } from './pages/Secondary';
import { authService, paymentService } from './services/api';
import './App.css';

// Fires a GA4 page_view on every React Router navigation
function PageTracker() {
  const location = useLocation();
  useEffect(() => {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
    });
  }, [location]);
  return null;
}

// Map backend plan ('free'|'pro'|'max') to frontend tier ('free'|'pro').
function planToTier(plan) {
  return (plan === 'pro' || plan === 'max') ? 'pro' : 'free';
}

export const TierContext = createContext({ tier: 'free', setTier: () => {} });
export const useTier = () => useContext(TierContext);

export const AuthContext = createContext({
  user: null, token: null,
  setAuth: () => {}, clearAuth: () => {}, openAuthModal: () => {},
});
export const useAuth = () => useContext(AuthContext);

// ---------------------------------------------------------------------------
// Shared input style
// ---------------------------------------------------------------------------
const inputSt = {
  padding: '10px 12px', borderRadius: 8,
  border: '1px solid #e0e0e0', fontSize: 14,
  width: '100%', boxSizing: 'border-box', outline: 'none',
  fontFamily: 'inherit',
};

// ---------------------------------------------------------------------------
// Auth Modal — blurred backdrop overlay
// ---------------------------------------------------------------------------
function AuthModal({ initialMode = 'signin', onClose }) {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    let responseData = null;
    try {
      const { data } = mode === 'signin'
        ? await authService.login(username, password)
        : await authService.register(username, email, password);
      responseData = data;
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
      setLoading(false);
      return;
    }
    setLoading(false);
    setAuth({ token: responseData.token, user: responseData.user });
    onClose();
    navigate(responseData.is_new ? '/onboarding' : '/app/matches');
  };

  return (
    <>
      {/* Backdrop — click outside to close */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(8, 10, 18, 0.58)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 999,
          animation: 'backdropIn 0.18s ease both',
        }}
      />

      {/* Modal card */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000, width: '100%', maxWidth: 420, padding: '0 20px',
      }}>
        <div style={{
          background: 'white', borderRadius: 16,
          border: '1px solid rgba(0,0,0,0.07)',
          boxShadow: '0 28px 72px rgba(0,0,0,0.24)',
          padding: '32px 32px 28px',
          position: 'relative',
          animation: 'modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 12, right: 12,
              background: 'none', border: 0, cursor: 'pointer',
              width: 30, height: 30, borderRadius: 8,
              display: 'grid', placeItems: 'center',
              color: '#bbb', fontSize: 20, lineHeight: 1,
              transition: 'background 0.12s, color 0.12s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#555'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#bbb'; }}
          >
            ×
          </button>

          {/* Brand */}
          <div style={{ marginBottom: 22, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 4 }}>
              Find My Professor
            </div>
            <p style={{ color: '#888', fontSize: 13, margin: 0 }}>
              {mode === 'signin' ? 'Welcome back.' : 'Start matching with advisors — free.'}
            </p>
          </div>

          {/* Sign in / Sign up tabs */}
          <div style={{ display: 'flex', marginBottom: 22, borderBottom: '1px solid #e5e7eb' }}>
            {[['signin', 'Sign in'], ['signup', 'Sign up']].map(([id, label]) => (
              <button key={id}
                onClick={() => { setMode(id); setError(''); }}
                style={{
                  flex: 1, padding: '9px 0', background: 'none', border: 0,
                  borderBottom: mode === id ? '2px solid #1a1a1a' : '2px solid transparent',
                  fontWeight: mode === id ? 600 : 400, fontSize: 14,
                  cursor: 'pointer', color: mode === id ? '#1a1a1a' : '#999',
                  marginBottom: -1, transition: 'color 0.12s',
                }}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 12.5, fontWeight: 500 }}>Username</label>
              <input style={inputSt} value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username" required autoFocus/>
            </div>

            {mode === 'signup' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 12.5, fontWeight: 500 }}>
                  Email <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span>
                </label>
                <input style={inputSt} type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"/>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 12.5, fontWeight: 500 }}>Password</label>
              <input style={inputSt} type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required/>
            </div>

            {error && (
              <div style={{ fontSize: 13, color: '#c0392b', padding: '9px 12px', background: '#fff5f5', borderRadius: 7, border: '1px solid #fdd' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ marginTop: 4, padding: '11px 0', background: '#1a1a1a', color: 'white', border: 0, borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.65 : 1 }}>
              {loading ? '…' : (mode === 'signin' ? 'Sign in' : 'Create account')}
            </button>
          </form>

          <div style={{ textAlign: 'center', color: '#ccc', fontSize: 12, margin: '14px 0 8px' }}>or</div>
          <GoogleLogin
            onSuccess={({ credential }) => {
              setLoading(true);
              authService.googleAuth(credential)
                .then(({ data }) => {
                  setAuth({ token: data.token, user: data.user });
                  onClose();
                  navigate(data.is_new ? '/onboarding' : '/app/matches');
                })
                .catch(err => setError(err.response?.data?.error || 'Google sign-in failed'))
                .finally(() => setLoading(false));
            }}
            onError={() => setError('Google sign-in failed. Please try again.')}
            width="100%"
            text="continue_with"
            shape="rectangular"
          />
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// ProtectedRoute — redirect unauthenticated users to landing page
// ---------------------------------------------------------------------------
function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/" replace />;
  return children;
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export default function App() {
  const storedToken = localStorage.getItem('auth_token');
  const storedUser  = (() => { try { return JSON.parse(localStorage.getItem('auth_user')); } catch { return null; } })();

  const [authState, setAuthState] = useState({ user: storedUser, token: storedToken });
  const [tier, setTier] = useState(() => planToTier(storedUser?.plan || 'free'));
  const [authModal, setAuthModal] = useState({ open: false, mode: 'signin' });
  const [paymentToast, setPaymentToast] = useState(null);

  // Initialize Paddle.js on mount
  useEffect(() => {
    const Paddle = window.Paddle;
    const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;
    if (Paddle && clientToken) {
      if (import.meta.env.VITE_PADDLE_SANDBOX === 'true') {
        Paddle.Environment.set('sandbox');
      }
      Paddle.Initialize({ token: clientToken });
    }
  }, []);

  // On boot, re-verify plan from server (handles expiries + admin grants).
  // Also handles ?payment=success / ?payment=cancelled redirect from Paddle.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentResult = params.get('payment');

    if (paymentResult === 'success' && storedToken) {
      // Wait briefly for the webhook to process, then refresh plan
      setTimeout(() => {
        paymentService.getStatus()
          .then(({ data }) => {
            const newTier = planToTier(data.plan);
            setTier(newTier);
            const updated = { ...(storedUser || {}), plan: data.plan };
            localStorage.setItem('auth_user', JSON.stringify(updated));
            setPaymentToast(newTier === 'pro'
              ? '🎉 Welcome to Pro! Your features are now unlocked.'
              : 'Payment received — your plan will activate shortly.');
          })
          .catch(() => setPaymentToast('Payment received — refresh if features don\'t appear.'));
      }, 1500);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (paymentResult === 'cancelled') {
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (storedToken) {
      authService.me().then(({ data }) => {
        if (data.plan) setTier(planToTier(data.plan));
        const updated = { ...(storedUser || {}), ...data };
        localStorage.setItem('auth_user', JSON.stringify(updated));
      }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAuth = ({ user, token }) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    setAuthState({ user, token });
    if (user?.plan) setTier(planToTier(user.plan));
  };

  const clearAuth = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setAuthState({ user: null, token: null });
    setTier('free');
  };

  const openAuthModal = (mode = 'signin') => setAuthModal({ open: true, mode });
  const closeAuthModal = () => setAuthModal({ open: false, mode: 'signin' });

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <AuthContext.Provider value={{ ...authState, setAuth, clearAuth, openAuthModal }}>
        <TierContext.Provider value={{ tier, setTier }}>
          <BrowserRouter>
            <PageTracker />
            <Routes>
              <Route path="/"           element={<Landing />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/pricing"    element={<Pricing />} />
              <Route path="/admin"      element={<Admin />} />
              <Route path="/app/*"      element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
              <Route path="*"           element={<Navigate to="/" replace />} />
            </Routes>

            {/* Auth modal — rendered inside BrowserRouter so useNavigate works */}
            {authModal.open && (
              <AuthModal initialMode={authModal.mode} onClose={closeAuthModal} />
            )}

            {/* Payment success / error toast */}
            {paymentToast && (
              <div style={{
                position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                background: '#1a1a1a', color: 'white', padding: '12px 20px',
                borderRadius: 12, fontSize: 14, zIndex: 9999, whiteSpace: 'nowrap',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              }}>
                {paymentToast}
                <button onClick={() => setPaymentToast(null)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', marginLeft: 12, fontSize: 16 }}>
                  ×
                </button>
              </div>
            )}
          </BrowserRouter>
        </TierContext.Provider>
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
}
