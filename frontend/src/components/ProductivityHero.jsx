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

      {/* Right Dusk / Mountain Atmospheric Artwork */}
      <div className="hero-artwork-wrap">
        <div className="hero-mountain-illustration">
          <svg className="hero-dusk-svg" viewBox="0 0 240 100" fill="none">
            {/* Glowing warm moon/sun */}
            <circle cx="160" cy="42" r="18" fill="#fdba74" opacity="0.85" />
            <circle cx="160" cy="42" r="28" fill="#fb923c" opacity="0.15" />
            {/* Mountains */}
            <polygon points="40,100 110,40 180,100" fill="#1e293b" opacity="0.9" />
            <polygon points="120,100 170,55 220,100" fill="#0f172a" opacity="0.95" />
            <polygon points="0,100 60,65 130,100" fill="#334155" opacity="0.75" />
            {/* Ambient mist */}
            <path d="M0,90 Q60,82 120,90 T240,90 L240,100 L0,100 Z" fill="#090d16" opacity="0.9" />
          </svg>
        </div>
        <p className="hero-discipline-quote">
          &ldquo;Discipline today builds the freedom tomorrow.&rdquo;
        </p>
      </div>
    </div>
  );
}
