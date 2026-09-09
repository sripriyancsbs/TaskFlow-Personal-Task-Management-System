import React from 'react';
import { formatFullTodayDate, getTimeBasedGreeting } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';

export default function ProductivityHero({ onOpenAuthModal }) {
  const { user, isAuthenticated } = useAuth();
  const dateFormatted = formatFullTodayDate();
  const greetingPrefix = getTimeBasedGreeting();
  const displayName = user?.name ? user.name.trim().split(' ')[0] : 'Explorer';

  return (
    <div className="reference-hero-banner">
      {/* Left Greeting Content */}
      <div className="hero-text-content">
        <span className="hero-date-top">{dateFormatted}</span>
        <h1 className="hero-greeting-heading">
          {greetingPrefix}, {displayName} 👋
        </h1>
        <p className="hero-greeting-sub">
          {isAuthenticated
            ? "Let's turn your personal priorities into progress."
            : 'Sign in to access your private workspace and sync your tasks.'}
        </p>
      </div>

      {/* Right Atmospheric Quote & Status Pill */}
      <div className="hero-artwork-wrap">
        {isAuthenticated ? (
          <div className="hero-badge-pill">
            <span className="hero-pulse-dot" />
            <span className="hero-badge-text">Personal Workspace Active</span>
          </div>
        ) : (
          <button
            type="button"
            className="hero-badge-pill hero-auth-pill"
            onClick={() => onOpenAuthModal?.('signin')}
          >
            <span>🔐</span>
            <span className="hero-badge-text">Sign In / Register</span>
          </button>
        )}
        <p className="hero-discipline-quote">
          &ldquo;Discipline today builds the freedom tomorrow.&rdquo;
        </p>
      </div>
    </div>
  );
}