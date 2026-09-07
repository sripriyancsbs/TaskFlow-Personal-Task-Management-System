import React from 'react';

export default function StatsOverview({ stats }) {
  const { total = 0, pending = 0, completed = 0 } = stats;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="stats-overview-section" aria-label="Task Statistics">
      <div className="stats-grid">
        {/* Total Tasks Card */}
        <div className="stat-card stat-card-total">
          <div className="stat-card-header">
            <span className="stat-label">TOTAL TASKS</span>
            <div className="stat-icon-wrapper total-icon-bg">
              <svg
                className="stat-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
          </div>
          <div className="stat-value-row">
            <span className="stat-value" id="stat-total">{total}</span>
          </div>
          <div className="stat-footer">
            <span className="stat-subtext">All managed workflow tasks</span>
          </div>
        </div>

        {/* Pending Tasks Card */}
        <div className="stat-card stat-card-pending">
          <div className="stat-card-header">
            <span className="stat-label">PENDING</span>
            <div className="stat-icon-wrapper pending-icon-bg">
              <svg
                className="stat-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div className="stat-value-row">
            <span className="stat-value" id="stat-pending">{pending}</span>
          </div>
          <div className="stat-footer">
            <span className="stat-subtext">Needs your focus & action</span>
          </div>
        </div>

        {/* Completed Tasks Card */}
        <div className="stat-card stat-card-completed">
          <div className="stat-card-header">
            <span className="stat-label">COMPLETED</span>
            <div className="stat-icon-wrapper completed-icon-bg">
              <svg
                className="stat-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <div className="stat-value-row">
            <span className="stat-value" id="stat-completed">{completed}</span>
            <span className="stat-badge-rate">{completionRate}% Done</span>
          </div>
          <div className="stat-footer">
            <div className="completion-bar-track">
              <div
                className="completion-bar-fill"
                style={{ width: `${completionRate}%` }}
                role="progressbar"
                aria-valuenow={completionRate}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
