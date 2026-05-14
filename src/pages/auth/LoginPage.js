import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { authRoleSlug, demoHomePathFromEmail, homePathForRole } from '../../utils/homePathForRole';

const COAT_OF_ARMS_SRC =
  '/coat-of-arms-of-namibia-fde79406-29d7-4998-b650-8a01436de59-resize-750-removebg-preview.png';

const KOPANO_VERTEX_URL = 'https://kopanovertex.com/';

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoginError('');
    setSubmitting(true);
    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok && json.success && json.data?.user) {
        const { user, accessToken, refreshToken } = json.data;
        if (accessToken) localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        navigate(homePathForRole(authRoleSlug(user)), { replace: true });
        return;
      }

      setLoginError(json.message || 'Invalid credentials');
    } catch {
      // API unreachable (e.g. dev without backend / CORS): route by email for UI demos only
      navigate(demoHomePathFromEmail(email), { replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <section className="login-promo" aria-label="Product information">
          <div className="login-promo-image" />
        </section>

        <div className="login-panel">
          <div className="login-panel-container">
            <img
              className="login-panel-coat"
              src={COAT_OF_ARMS_SRC}
              alt="Coat of arms of Namibia"
              width={150}
              height={150}
              decoding="async"
            />
            <h1 className="login-panel-title">Login</h1>
            <p className="login-panel-sub">Enter your credentials to login to your account.</p>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-field">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@hospital.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="login-password">Password</label>
                <div className="login-password-wrap">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-pressed={showPassword}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              {loginError ? (
                <p role="alert" style={{ margin: 0, fontSize: '0.8125rem', color: '#b91c1c' }}>
                  {loginError}
                </p>
              ) : null}

              <button type="submit" className="login-submit" disabled={submitting}>
                {submitting ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <p className="login-vendor-credit">
              A digital national solution by{' '}
              <a href={KOPANO_VERTEX_URL} target="_blank" rel="noopener noreferrer">
                Kopano-Vertex
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
