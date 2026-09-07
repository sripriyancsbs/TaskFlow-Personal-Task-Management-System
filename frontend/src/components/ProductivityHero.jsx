import React from 'react';
import { getTimeBasedGreeting, formatFullTodayDate } from '../utils/dateUtils';

export default function ProductivityHero({ stats = { total: 0, completed: 0, pending: 0 } }) {
  const { total = 0, completed = 0, pending = 0 } = stats;
  const greeting = getTimeBasedGreeting();
  const dateFormatted = formatFullTodayDate();
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="productivity-hero-card">
      <div className="hero-top-row">
        <div className="hero-greeting-block">
          <h1 className="hero-greeting-title">{greeting}</h1>
          <p className="hero-motto">"Let's turn today's priorities into progress."</p>
        </div>
        <div className="hero-date-badge">
          <span className="hero-date-dot" />
          <span className="hero-date-text">Today &middot; {dateFormatted}</span>
        </div>
      </div>

      {/* Dynamic Progress Indicator */}
      <div className="hero-progress-section">
        <div className="progress-info-row">
          <div className="progress-label-wrap">
            <span className="progress-title">Today's Progress</span>
            <span className="progress-fraction-text">
              {total > 0
                ? `${completed} of ${total} ${total === 1 ? 'priority' : 'priorities'} completed`
                : 'No priorities tracked yet'}
            </span>
          </div>
          <span className="progress-percentage-badge">{progressPercent}%</span>
        </div>

        <div className="progress-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin="0" aria-valuemax="100">
          <div
            className="progress-fill-bar"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
