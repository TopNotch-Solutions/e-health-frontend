import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authRoleSlug, homePathForRole, isRoleAllowedForPath } from '../../utils/homePathForRole';
import AuthPageShell from './components/AuthPageShell';
import { auth } from './styles/authClasses';

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
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const returnTo = (() => {
    const params = new URLSearchParams(location.search);
    const fromQuery = params.get('from');
    if (fromQuery) {
      try {
        return decodeURIComponent(fromQuery);
      } catch {
        return fromQuery;
      }
    }
    return location.state?.from;
  })();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === '1') {
      setLoginError('Your session has expired. Please sign in again.');
    }
    if (params.get('forbidden') === '1') {
      setLoginError('You do not have access to that page. Sign in with the correct role.');
    }
  }, [location.search]);

  const now = new Date();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoginError('');
    setSubmitting(true);
     const API_BASE = process.env.REACT_APP_API_URL || 'https://api-health.kopanovertex.com';
      
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok && json.success && json.data?.user && json.data?.accessToken) {
        const { user, accessToken, refreshToken } = json.data;
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        const defaultHome = homePathForRole(authRoleSlug(user));
        const forbidden = new URLSearchParams(location.search).get('forbidden') === '1';
        const useReturnTo =
          !forbidden &&
          returnTo &&
          returnTo.startsWith('/') &&
          isRoleAllowedForPath(returnTo, user);
        navigate(useReturnTo ? returnTo : defaultHome, { replace: true });
        return;
      }

      setLoginError(json.message || 'Invalid credentials');
    } catch {
      setLoginError(
        'Cannot reach the server. Start the backend (port 5000), then sign in with your hospital account.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthPageShell>
      <div className={auth.split}>
        <aside className={auth.heroPanel} aria-label="Health Management System">
          <div className={auth.heroInner}>
            <p className={auth.heroKicker}>E-Health Management System</p>
            <h1 className={auth.heroTitle}>Login</h1>
            <p className={auth.heroMeta}>
              {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              {' · '}
              {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className={auth.heroLead}>
              Sign in with your hospital account to access front office, clinical modules, and
              administration tools across the national health network.
            </p>
          </div>
          <p className={auth.heroFooter}>
            A digital national solution by{' '}
            <a
              href={KOPANO_VERTEX_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-teal-100 underline-offset-2 hover:underline"
            >
              Kopano-Vertex
            </a>
          </p>
        </aside>

        <section className={auth.formPanel} aria-labelledby="login-form-title">
          <div className={auth.formInner}>
            <div className={auth.card}>
              <img
                className={auth.coat}
                src={COAT_OF_ARMS_SRC}
                alt="Coat of arms of Namibia"
                width={80}
                height={80}
                decoding="async"
              />
              <h2 id="login-form-title" className={auth.cardTitle}>
                Sign in
              </h2>
              <p className={auth.cardSubtitle}>Enter your credentials to access your account.</p>

              {process.env.NODE_ENV === 'development' ? (
                <p className={auth.devHint}>
                  Demo supervisors:{' '}
                  <span className="font-mono">nurse_supervisor@demo.ehealth.gov</span>,{' '}
                  <span className="font-mono">doctor_supervisor@demo.ehealth.gov</span>,{' '}
                  <span className="font-mono">laboratory_supervisor@demo.ehealth.gov</span>,{' '}
                  <span className="font-mono">radiologist_supervisor@demo.ehealth.gov</span>,{' '}
                  <span className="font-mono">kitchen_staff@demo.ehealth.gov</span>,{' '}
                  <span className="font-mono">kitchen_manager@demo.ehealth.gov</span>,{' '}
                  <span className="font-mono">billing_clerk@demo.ehealth.gov</span>,{' '}
                  <span className="font-mono">revenue_officer@demo.ehealth.gov</span>,{' '}
                  <span className="font-mono">admin@ehealth.gov</span> / Demo123! (admin: admin123)
                </p>
              ) : null}

              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <div className={auth.field}>
                  <label htmlFor="login-email" className={auth.label}>
                    Email
                  </label>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    className={auth.input}
                    autoComplete="email"
                    placeholder="you@hospital.gov"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className={auth.field}>
                  <label htmlFor="login-password" className={auth.label}>
                    Password
                  </label>
                  <div className={auth.passwordWrap}>
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      className={`${auth.input} pr-11`}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className={auth.passwordToggle}
                      onClick={() => setShowPassword((v) => !v)}
                      aria-pressed={showPassword}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>

                {loginError ? (
                  <p role="alert" className={auth.error}>
                    {loginError}
                  </p>
                ) : null}

                <button type="submit" className={auth.submit} disabled={submitting}>
                  {submitting ? 'Signing in…' : 'Sign in'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </AuthPageShell>
  );
}
