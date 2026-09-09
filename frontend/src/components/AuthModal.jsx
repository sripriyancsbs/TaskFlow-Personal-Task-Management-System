import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { IconClose } from './Icons';

export default function AuthModal({ isOpen, onClose, defaultTab = 'signin', onAuthSuccess }) {
  const { login, register } = useAuth();

  const [tab, setTab] = useState(defaultTab); // 'signin' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'signin') {
        if (!email.trim() || !password) {
          throw new Error('Please enter both your email and password.');
        }
        await login(email.trim(), password);
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your full name.');
        }
        if (!email.trim()) {
          throw new Error('Please enter your email address.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        await register(name.trim(), email.trim(), password);
      }

      onAuthSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setError(null);
    setLoading(true);
    try {
      // Automatic quick demo account login
      const demoEmail = 'demo@taskflow.local';
      const demoPass = 'taskflow2026';
      try {
        await login(demoEmail, demoPass);
      } catch (loginErr) {
        // If not registered yet, auto-register
        await register('Demo Explorer', demoEmail, demoPass);
      }
      onAuthSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Could not launch demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <div className="auth-modal-card">
        {/* Close button */}
        <button
          type="button"
          className="auth-modal-close-btn"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <IconClose width={18} height={18} />
        </button>

        {/* Brand Header */}
        <div className="auth-brand-header">
          <div className="auth-brand-badge">TF</div>
          <h2 id="auth-modal-title" className="auth-modal-heading">
            {tab === 'signin' ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p className="auth-modal-subheading">
            {tab === 'signin'
              ? 'Access your personal tasks and productivity analytics.'
              : 'Start organizing your workflow in your private workspace.'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            className={`auth-tab-btn ${tab === 'signin' ? 'active' : ''}`}
            onClick={() => {
              setTab('signin');
              setError(null);
            }}
            role="tab"
            aria-selected={tab === 'signin'}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setTab('signup');
              setError(null);
            }}
            role="tab"
            aria-selected={tab === 'signup'}
          >
            Create Account
          </button>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="auth-error-banner" role="alert">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {tab === 'signup' && (
            <div className="auth-form-group">
              <label htmlFor="auth-name-input" className="auth-label">
                Full Name
              </label>
              <input
                id="auth-name-input"
                type="text"
                className="auth-input"
                placeholder="e.g. Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                disabled={loading}
                required
              />
            </div>
          )}

          <div className="auth-form-group">
            <label htmlFor="auth-email-input" className="auth-label">
              Email Address
            </label>
            <input
              id="auth-email-input"
              type="email"
              className="auth-input"
              placeholder="alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
              required
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="auth-password-input" className="auth-label">
              Password
            </label>
            <input
              id="auth-password-input"
              type="password"
              className="auth-input"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-spinner-wrap">
                <span className="auth-spinner" />
                <span>{tab === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
              </span>
            ) : (
              <span>{tab === 'signin' ? 'Sign In to TaskFlow' : 'Create Free Account'}</span>
            )}
          </button>
        </form>

        {/* Quick Demo Option */}
        <div className="auth-demo-divider">
          <span>or explore instantly</span>
        </div>

        <button
          type="button"
          className="auth-demo-btn"
          onClick={handleQuickDemo}
          disabled={loading}
        >
          🚀 1-Click Demo Guest Workspace
        </button>
      </div>
    </div>
  );
}
