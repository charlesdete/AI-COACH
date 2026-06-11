import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, DEMO_CREDENTIALS } from '../../../store/authStore';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const { login, isLoading, error, clearError, getDefaultRoute } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) navigate(getDefaultRoute());
  };

  const fillDemo = (cred: { email: string; password: string }) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setShowDemo(false);
    clearError();
  };

  return (
    <div className="login-root">
      <div className="login-left">
        <div className="login-hero">
          <div className="login-hero-icon">🎓</div>
          <h2 className="login-hero-title">AI Coach Platform</h2>
          <p className="login-hero-desc">
            Empowering teachers through personalised coaching, tracked progress, and meaningful conversations.
          </p>
          <div className="login-hero-features">
            <div className="hero-feature"><span>✅</span> AI-powered coaching sessions</div>
            <div className="hero-feature"><span>✅</span> Teacher–Coach messaging</div>
            <div className="hero-feature"><span>✅</span> Admin analytics & oversight</div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h1 className="login-card-title">Welcome back</h1>
            <p className="login-card-sub">Sign in to your account</p>
          </div>

          {error && (
            <div className="login-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@school.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                required
                autoComplete="email"
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? <span className="login-spinner" /> : 'Sign In →'}
            </button>
          </form>

          <div className="login-demo-section">
            <button
              type="button"
              className="login-demo-toggle"
              onClick={() => setShowDemo(!showDemo)}
            >
              {showDemo ? '▲' : '▼'} Demo credentials
            </button>
            {showDemo && (
              <div className="login-demo-list">
                {DEMO_CREDENTIALS.map((cred) => (
                  <button
                    key={cred.role}
                    className={`login-demo-item demo-${cred.role.toLowerCase()}`}
                    onClick={() => fillDemo(cred)}
                    type="button"
                  >
                    <span className="demo-role">{cred.role}</span>
                    <span className="demo-email">{cred.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="login-footer-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
