import React from 'react';
import { formatFullTodayDate, getTimeBasedGreeting } from '../utils/dateUtils';

export default function ProductivityHero() {
  const dateFormatted = formatFullTodayDate();
  const greetingBase = getTimeBasedGreeting();
  // Format greeting: "Good morning, Sripriyan 👋"
  const greetingPrefix = greetingBase.replace(' 👋', '').replace(' ☀️', '').replace(' 🌙', '');

  return (
    <div className="reference-hero-banner">
      {/* Left Greeting Content */}
      <div className="hero-text-content">
        <span className="hero-date-top">{dateFormatted}</span>
        <h1 className="hero-greeting-heading">
          {greetingPrefix}, Sripriyan 👋
        </h1>
        <p className="hero-greeting-sub">
          &ldquo;Let's turn today's priorities into progress.&rdquo;
        </p>
      </div>

      {/* Right Atmospheric Quote & Status Pill */}
      <div className="hero-artwork-wrap">
        <div className="hero-badge-pill">
          <span className="hero-pulse-dot" />
          <span className="hero-badge-text">Command Center Active</span>
        </div>
        <p className="hero-discipline-quote">
          &ldquo;Discipline today builds the freedom tomorrow.&rdquo;
        </p>
      </div>
    </div>
  );
}
