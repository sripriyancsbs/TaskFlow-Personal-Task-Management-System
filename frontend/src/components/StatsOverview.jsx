import React from 'react';
import { IconTasks, IconToday, IconCompleted, IconFire } from './Icons';

export default function StatsOverview({ stats = { total: 0, pending: 0, completed: 0, high_priority: 0 } }) {
  const { total = 0, pending = 0, completed = 0, high_priority = 0 } = stats;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="command-metrics-strip" aria-label="Command Center Metrics">
      {/* Metric 1: Total */}
      <div className="metric-cell metric-total">
        <div className="metric-icon-wrap">
          <IconTasks className="metric-icon text-muted" />
        </div>
        <div className="metric-data-block">
          <span className="metric-label">TOTAL TASKS</span>
          <span className="metric-value">{total}</span>
        </div>
      </div>

      {/* Metric 2: Pending */}
      <div className="metric-cell metric-pending">
        <div className="metric-icon-wrap icon-wrap-amber">
          <IconToday className="metric-icon text-amber-400" />
        </div>
        <div className="metric-data-block">
          <span className="metric-label">PENDING</span>
          <span className="metric-value text-amber-400">{pending}</span>
        </div>
      </div>

      {/* Metric 3: Completed */}
      <div className="metric-cell metric-completed">
        <div className="metric-icon-wrap icon-wrap-emerald">
          <IconCompleted className="metric-icon text-emerald-400" />
        </div>
        <div className="metric-data-block">
          <span className="metric-label">COMPLETED</span>
          <span className="metric-value text-emerald-400">{completed}</span>
        </div>
      </div>

      {/* Metric 4: Urgent High Priority */}
      <div className="metric-cell metric-urgent">
        <div className="metric-icon-wrap icon-wrap-crimson">
          <IconFire className="metric-icon text-rose-400" />
        </div>
        <div className="metric-data-block">
          <span className="metric-label">URGENT</span>
          <span className="metric-value text-rose-400">{high_priority}</span>
        </div>
      </div>

      {/* Metric 5: Completion Rate */}
      <div className="metric-cell metric-rate">
        <div className="metric-rate-content">
          <div className="metric-rate-header">
            <span className="metric-label">VELOCITY</span>
            <span className="metric-rate-pct">{completionRate}%</span>
          </div>
          <div className="metric-rate-track">
            <div
              className="metric-rate-fill"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
