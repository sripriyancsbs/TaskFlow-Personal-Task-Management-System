import React, { useMemo } from 'react';
import { formatDueDate } from '../utils/dateUtils';
import { IconPlay, IconCheck, IconPlus } from './Icons';

export default function TodayFocus({
  tasks = [],
  onStartFocus,
  onToggleStatus,
  onOpenAddModal,
  isActionLoading,
}) {
  // Derive the most important pending task dynamically from real data
  const focusTask = useMemo(() => {
    const pending = tasks.filter((t) => t.status === 'Pending');
    if (pending.length === 0) return null;

    // Sort order: High priority first, then nearest due date, then newest
    return [...pending].sort((a, b) => {
      const priorityWeights = { High: 3, Medium: 2, Low: 1 };
      const weightA = priorityWeights[a.priority] || 2;
      const weightB = priorityWeights[b.priority] || 2;
      if (weightB !== weightA) return weightB - weightA;

      // Check due dates if available
      if (a.due_date && b.due_date) {
        return new Date(a.due_date) - new Date(b.due_date);
      }
      if (a.due_date && !b.due_date) return -1;
      if (!a.due_date && b.due_date) return 1;

      // Fallback: newest created
      return new Date(b.created_at) - new Date(a.created_at);
    })[0];
  }, [tasks]);

  const dueDateInfo = focusTask ? formatDueDate(focusTask.due_date, focusTask.status) : null;

  return (
    <section className="todays-focus-card" aria-label="Today's Focus">
      <div className="focus-card-header">
        <div className="focus-tag-wrap">
          <span className="focus-beacon-ring">
            <span className="focus-beacon-dot" />
          </span>
          <span className="focus-tag-text">TODAY'S FOCUS</span>
        </div>
        {focusTask && focusTask.priority === 'High' && (
          <span className="focus-urgent-chip">High Priority</span>
        )}
      </div>

      {focusTask ? (
        <div className="focus-body">
          <div className="focus-details">
            <div className="focus-meta-row">
              <span className={`priority-badge priority-badge-${(focusTask.priority || 'medium').toLowerCase()}`}>
                {focusTask.priority || 'Medium'}
              </span>
              {dueDateInfo && (
                <span
                  className={`due-date-pill ${
                    dueDateInfo.isOverdue
                      ? 'pill-overdue'
                      : dueDateInfo.isToday
                      ? 'pill-today'
                      : 'pill-future'
                  }`}
                >
                  {dueDateInfo.text}
                </span>
              )}
            </div>

            <h2 className="focus-task-title">{focusTask.title}</h2>
            <p className="focus-task-desc">
              {focusTask.description ||
                'Clear your mind and execute on this key milestone.'}
            </p>
          </div>

          <div className="focus-actions-row">
            <button
              type="button"
              className="btn-start-focus"
              onClick={() => onStartFocus(focusTask)}
              title="Launch distraction-free focus timer"
            >
              <IconPlay className="w-4 h-4 btn-icon" />
              <span>Start Task</span>
            </button>

            <button
              type="button"
              className="btn-mark-complete-focus"
              onClick={() => onToggleStatus(focusTask)}
              disabled={isActionLoading}
              title="Mark this focus task completed"
            >
              <IconCheck className="w-4 h-4 btn-icon" />
              <span>Mark Complete</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="focus-cleared-state">
          <div className="focus-cleared-icon-wrap">
            <IconCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="focus-cleared-content">
            <h3 className="focus-cleared-title">You're all clear.</h3>
            <p className="focus-cleared-sub">
              No pending tasks require immediate focus right now. Great momentum!
            </p>
          </div>
          <button
            type="button"
            className="btn-clear-add"
            onClick={onOpenAddModal}
          >
            <IconPlus className="w-4 h-4 mr-1.5" />
            <span>Create Next Task</span>
          </button>
        </div>
      )}
    </section>
  );
}
