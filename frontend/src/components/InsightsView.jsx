import React, { useMemo } from 'react';
import { formatDueDate, formatRelativeTime } from '../utils/dateUtils';
import ActivityTimeline from './ActivityTimeline';
import { IconOverview, IconCheck, IconClock, IconUpcoming, IconFire, IconTasks } from './Icons';

export default function InsightsView({
  tasks = [],
  stats = { total: 0, pending: 0, completed: 0 },
  onSelectTask,
  onExportCSV,
  onExportJSON,
}) {
  // Completion percentage
  const completionRate = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  // Breakdown by priority
  const priorityStats = useMemo(() => {
    let high = 0;
    let medium = 0;
    let low = 0;

    tasks.forEach((t) => {
      const p = t.priority || 'Medium';
      if (p === 'High') high++;
      else if (p === 'Medium') medium++;
      else if (p === 'Low') low++;
    });

    const total = tasks.length || 1;
    return {
      high,
      medium,
      low,
      highPct: Math.round((high / total) * 100),
      mediumPct: Math.round((medium / total) * 100),
      lowPct: Math.round((low / total) * 100),
    };
  }, [tasks]);

  // Breakdown by schedule
  const scheduleStats = useMemo(() => {
    let dueToday = 0;
    let overdue = 0;
    let upcoming = 0;
    let noDueDate = 0;

    tasks.forEach((t) => {
      if (t.status === 'Completed') return;
      if (!t.due_date) {
        noDueDate++;
        return;
      }
      const info = formatDueDate(t.due_date, t.status);
      if (info?.isOverdue) overdue++;
      else if (info?.isToday) dueToday++;
      else if (info?.isUpcoming || info?.isTomorrow) upcoming++;
      else upcoming++;
    });

    return { dueToday, overdue, upcoming, noDueDate };
  }, [tasks]);

  // Velocity health badge
  const velocityStatus = useMemo(() => {
    if (scheduleStats.overdue > 0) {
      return { label: 'Attention Needed', class: 'velocity-warning', text: `${scheduleStats.overdue} overdue task(s)` };
    }
    if (completionRate >= 50) {
      return { label: 'High Velocity', class: 'velocity-high', text: 'On track to exceed target' };
    }
    return { label: 'Steady Progress', class: 'velocity-steady', text: 'Priorities flowing smoothly' };
  }, [scheduleStats, completionRate]);

  return (
    <div className="insights-dashboard-view">
      {/* Top Header */}
      <div className="insights-header-banner">
        <div className="insights-header-left">
          <div className="insights-icon-circle">
            <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <div>
            <h2 className="insights-title">Productivity Insights</h2>
            <p className="insights-sub">
              Real-time velocity tracking, workload distribution, and milestone analytics.
            </p>
          </div>
        </div>

        <div className="insights-header-actions">
          <div className={`insights-velocity-badge ${velocityStatus.class}`}>
            <span className="velocity-dot" />
            <span>{velocityStatus.label}</span>
          </div>

          <button
            type="button"
            className="insights-export-btn"
            onClick={onExportCSV}
            title="Download CSV Backup"
          >
            Export CSV
          </button>
          <button
            type="button"
            className="insights-export-btn"
            onClick={onExportJSON}
            title="Download JSON Backup"
          >
            Export JSON
          </button>
        </div>
      </div>

      {/* 4 Key Metric Cards */}
      <div className="insights-metrics-grid">
        <div className="insight-metric-card">
          <div className="insight-card-top">
            <span className="insight-card-label">Total Workload</span>
            <div className="insight-card-icon icon-blue">
              <IconTasks width={18} height={18} />
            </div>
          </div>
          <div className="insight-card-val">{stats.total}</div>
          <div className="insight-card-sub">
            <span>{stats.pending} active</span> &bull; <span>{stats.completed} archived</span>
          </div>
        </div>

        <div className="insight-metric-card">
          <div className="insight-card-top">
            <span className="insight-card-label">Pending Action</span>
            <div className="insight-card-icon icon-amber">
              <IconClock width={18} height={18} />
            </div>
          </div>
          <div className="insight-card-val">{stats.pending}</div>
          <div className="insight-card-sub">
            <span className="text-amber-400 font-semibold">{priorityStats.high} high-priority</span> in queue
          </div>
        </div>

        <div className="insight-metric-card">
          <div className="insight-card-top">
            <span className="insight-card-label">Completed Tasks</span>
            <div className="insight-card-icon icon-emerald">
              <IconCheck width={18} height={18} />
            </div>
          </div>
          <div className="insight-card-val">{stats.completed}</div>
          <div className="insight-card-sub">
            Successfully finished milestones
          </div>
        </div>

        <div className="insight-metric-card">
          <div className="insight-card-top">
            <span className="insight-card-label">Completion Velocity</span>
            <div className="insight-card-icon icon-purple">
              <span className="font-bold text-xs">{completionRate}%</span>
            </div>
          </div>
          <div className="insight-card-val">{completionRate}%</div>
          <div className="insight-meter-track">
            <div
              className="insight-meter-fill"
              style={{ width: `${Math.min(100, Math.max(0, completionRate))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Deep Analytics Row: Priority Breakdown & Due Date Health */}
      <div className="insights-dual-columns">
        {/* Priority Breakdown Card */}
        <div className="insight-analytics-panel">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <IconFire width={16} height={16} className="text-rose-400" />
              <h3 className="panel-title">Priority Distribution</h3>
            </div>
            <span className="panel-tag">{tasks.length} tasks</span>
          </div>

          <div className="priority-bars-container">
            {/* High */}
            <div className="priority-bar-row">
              <div className="priority-bar-label">
                <span className="priority-badge-pill high-pill">🔥 High</span>
                <span className="priority-count-text">{priorityStats.high} tasks ({priorityStats.highPct}%)</span>
              </div>
              <div className="priority-track">
                <div
                  className="priority-fill fill-high"
                  style={{ width: `${priorityStats.highPct}%` }}
                />
              </div>
            </div>

            {/* Medium */}
            <div className="priority-bar-row">
              <div className="priority-bar-label">
                <span className="priority-badge-pill med-pill">⚡ Medium</span>
                <span className="priority-count-text">{priorityStats.medium} tasks ({priorityStats.mediumPct}%)</span>
              </div>
              <div className="priority-track">
                <div
                  className="priority-fill fill-medium"
                  style={{ width: `${priorityStats.mediumPct}%` }}
                />
              </div>
            </div>

            {/* Low */}
            <div className="priority-bar-row">
              <div className="priority-bar-label">
                <span className="priority-badge-pill low-pill">🌿 Low</span>
                <span className="priority-count-text">{priorityStats.low} tasks ({priorityStats.lowPct}%)</span>
              </div>
              <div className="priority-track">
                <div
                  className="priority-fill fill-low"
                  style={{ width: `${priorityStats.lowPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Proportional Multi-Segment Bar */}
          <div className="segmented-distribution-bar">
            <div
              className="segment-high"
              style={{ width: `${priorityStats.highPct}%` }}
              title={`High: ${priorityStats.highPct}%`}
            />
            <div
              className="segment-med"
              style={{ width: `${priorityStats.mediumPct}%` }}
              title={`Medium: ${priorityStats.mediumPct}%`}
            />
            <div
              className="segment-low"
              style={{ width: `${priorityStats.lowPct}%` }}
              title={`Low: ${priorityStats.lowPct}%`}
            />
          </div>
        </div>

        {/* Schedule & Due Date Health Card */}
        <div className="insight-analytics-panel">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <IconUpcoming width={16} height={16} className="text-blue-400" />
              <h3 className="panel-title">Deadline & Schedule Health</h3>
            </div>
            <span className="panel-tag">{scheduleStats.overdue > 0 ? 'Urgent Actions' : 'Healthy'}</span>
          </div>

          <div className="schedule-pills-grid">
            <div className="schedule-stat-box box-due-today">
              <div className="schedule-box-val">{scheduleStats.dueToday}</div>
              <div className="schedule-box-label">Due Today</div>
            </div>

            <div className="schedule-stat-box box-upcoming">
              <div className="schedule-box-val">{scheduleStats.upcoming}</div>
              <div className="schedule-box-label">Upcoming Scheduled</div>
            </div>

            <div className={`schedule-stat-box ${scheduleStats.overdue > 0 ? 'box-overdue-alert' : 'box-overdue'}`}>
              <div className="schedule-box-val">{scheduleStats.overdue}</div>
              <div className="schedule-box-label">Overdue</div>
            </div>

            <div className="schedule-stat-box box-flexible">
              <div className="schedule-box-val">{scheduleStats.noDueDate}</div>
              <div className="schedule-box-label">Flexible (No Date)</div>
            </div>
          </div>

          <div className="schedule-insight-note">
            {scheduleStats.overdue > 0 ? (
              <span className="note-alert">
                ⚠️ You have {scheduleStats.overdue} overdue task(s). Prioritize completing them first!
              </span>
            ) : scheduleStats.dueToday > 0 ? (
              <span className="note-info">
                🎯 {scheduleStats.dueToday} priority task(s) due today. Keep your momentum going!
              </span>
            ) : (
              <span className="note-success">
                ✨ All scheduled milestones are up to date! Great job maintaining pace.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Activity Timeline Section */}
      <div className="insights-timeline-section">
        <ActivityTimeline tasks={tasks} onSelectTask={onSelectTask} />
      </div>
    </div>
  );
}
