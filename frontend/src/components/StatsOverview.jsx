import React from 'react';
import { IconTasks, IconClock, IconCheck, IconChevronRight } from './Icons';

export default function StatsOverview({ stats = { total: 0, pending: 0, completed: 0 } }) {
  const { total = 0, pending = 0, completed = 0 } = stats;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Mini circular gauge calculation (radius = 16, circumference ~ 100.5)
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <div className="reference-metrics-row" aria-label="Quick metrics">
      {/* 1. Total Tasks */}
      <div className="ref-metric-card">
        <div className="metric-icon-box purple-box">
          <IconTasks className="w-4 h-4 text-purple-400" />
        </div>
        <div className="metric-details">
          <span className="metric-big-num">{total}</span>
          <span className="metric-small-label">Total Tasks</span>
        </div>
        <IconChevronRight className="metric-chevron text-muted" />
      </div>

      {/* 2. Pending */}
      <div className="ref-metric-card">
        <div className="metric-icon-box orange-box">
          <IconClock className="w-4 h-4 text-amber-400" />
        </div>
        <div className="metric-details">
          <span className="metric-big-num">{pending}</span>
          <span className="metric-small-label">Pending</span>
        </div>
        <IconChevronRight className="metric-chevron text-muted" />
      </div>

      {/* 3. Completed */}
      <div className="ref-metric-card">
        <div className="metric-icon-box green-box">
          <IconCheck className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="metric-details">
          <span className="metric-big-num">{completed}</span>
          <span className="metric-small-label">Completed</span>
        </div>
      </div>

      {/* 4. Completion Rate with Circular Ring */}
      <div className="ref-metric-card">
        <div className="metric-gauge-wrap">
          <svg className="metric-mini-gauge" width="42" height="42" viewBox="0 0 42 42">
            <circle
              className="gauge-bg-ring"
              cx="21"
              cy="21"
              r={radius}
              fill="none"
              strokeWidth="3.5"
            />
            <circle
              className="gauge-fill-ring"
              cx="21"
              cy="21"
              r={radius}
              fill="none"
              strokeWidth="3.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <span className="gauge-center-text">{completionRate}%</span>
        </div>
        <div className="metric-details">
          <span className="metric-small-label">Completion Rate</span>
        </div>
        <IconChevronRight className="metric-chevron text-muted" />
      </div>
    </div>
  );
}
