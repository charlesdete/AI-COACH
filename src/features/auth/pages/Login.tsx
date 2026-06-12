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
          <div className="login-brand">
            <div className="login-logo">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="20" fill="rgba(255,255,255,0.15)" />
                <path d="M10 28l10-16 10 16H10z" fill="white" opacity="0.9"/>
                <circle cx="20" cy="14" r="4" fill="white"/>
              </svg>
            </div>
            <span className="login-brand-name">AI Coach Platform</span>
          </div>

          <h2 className="login-hero-title">
            Unlock every teacher's<br />full potential
          </h2>
          <p className="login-hero-desc">
            Personalised AI coaching, real-time progress tracking, and meaningful conversations between teachers and coaches.
          </p>

          <div className="login-hero-image-wrap">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=640&q=80&auto=format&fit=crop"
              alt="Teachers collaborating in a coaching session"
              className="login-hero-img"
            />
            <div className="login-hero-stat-card">
              <div className="stat-card-icon">📈</div>
              <div className="stat-card-body">
                <span className="stat-card-value">+34%</span>
                <span className="stat-card-label">avg. growth this term</span>
              </div>
            </div>
            <div className="login-hero-ai-badge">
              <span className="ai-badge-dot" />
              AI coaching active
            </div>
          </div>

          <div className="login-hero-features">
            <div className="hero-feature">
              <div className="hero-feature-icon" style={{ background: 'rgba(255,255,255,0.2)' }}>🤖</div>
              <div className="hero-feature-text">
                <strong>AI-powered sessions</strong>
                <span>Tailored growth loops for every teacher</span>
              </div>
            </div>
            <div className="hero-feature">
              <div className="hero-feature-icon" style={{ background: 'rgba(255,255,255,0.2)' }}>💬</div>
              <div className="hero-feature-text">
                <strong>Direct messaging</strong>
                <span>Stay connected with your assigned coach</span>
              </div>
            </div>
            <div className="hero-feature">
              <div className="hero-feature-icon" style={{ background: 'rgba(255,255,255,0.2)' }}>📊</div>
              <div className="hero-feature-text">
                <strong>Live analytics</strong>
                <span>Admin-level insight across all cohorts</span>
              </div>
            </div>
          </div>

          <div className="login-social-proof">
            <div className="social-proof-avatars">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&q=80&auto=format&fit=crop&crop=face" alt="Teacher" className="proof-avatar" />
              <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&q=80&auto=format&fit=crop&crop=face" alt="Coach" className="proof-avatar" />
              <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=80&q=80&auto=format&fit=crop&crop=face" alt="Admin" className="proof-avatar" />
              <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&q=80&auto=format&fit=crop&crop=face" alt="Teacher" className="proof-avatar" />
              <div className="proof-avatar proof-avatar-count">+42</div>
            </div>
            <p className="social-proof-text">Trusted by <strong>46 educators</strong> across 8 schools</p>
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
