import React, { useMemo } from 'react';
import { formatDueDate } from '../utils/dateUtils';
import { IconPlay, IconCheck, IconFocus, IconPlus } from './Icons';

export default function TodayFocus({
  tasks = [],
  onStartFocus,
  onToggleStatus,
  onOpenAddModal,
  isActionLoading,
}) {
  // Derive the most important pending task dynamically from real tasks
  const focusTask = useMemo(() => {
    const pending = tasks.filter((t) => t.status === 'Pending');
    if (pending.length === 0) return null;

    return [...pending].sort((a, b) => {
      const priorityWeights = { High: 3, Medium: 2, Low: 1 };
      const weightA = priorityWeights[a.priority] || 2;
      const weightB = priorityWeights[b.priority] || 2;
      if (weightB !== weightA) return weightB - weightA;

      if (a.due_date && b.due_date) {
        return new Date(a.due_date) - new Date(b.due_date);
      }
      if (a.due_date && !b.due_date) return -1;
      if (!a.due_date && b.due_date) return 1;

      return new Date(b.created_at) - new Date(a.created_at);
    })[0];
  }, [tasks]);

  return (
    <section className="reference-today-focus-card" aria-label="Today's Focus">
      {focusTask ? (
        <div className="focus-card-inner-grid">
          {/* Left Side: Details & Actions */}
          <div className="focus-content-column">
            {/* Header: Tag + Priority Pill */}
            <div className="focus-tag-header">
              <div className="focus-target-badge">
                <IconFocus className="w-4 h-4 text-blue-400 mr-1.5" />
                <span className="focus-tag-title">TODAY&apos;S FOCUS</span>
              </div>
              <span className="focus-priority-pill">
                <span className="focus-pill-dot" />
                <span>{focusTask.priority || 'High'} Priority</span>
              </span>
            </div>

            {/* Task Title */}
            <h2 className="focus-headline-title">{focusTask.title}</h2>

            {/* Task Description */}
            <p className="focus-headline-desc">
              {focusTask.description ||
                'Check the clean REST API, database schema, and responsive UI components.'}
            </p>

            {/* Action Buttons matching reference */}
            <div className="focus-buttons-cluster">
              <button
                type="button"
                className="btn-start-focus-electric"
                onClick={() => onStartFocus(focusTask)}
                title="Start Focus Sprint"
              >
                <IconPlay className="w-3.5 h-3.5 mr-2" />
                <span>Start Focus</span>
              </button>

              <button
                type="button"
                className="btn-mark-complete-outline"
                onClick={() => onToggleStatus(focusTask)}
                disabled={isActionLoading}
                title="Mark Complete"
              >
                <IconCheck className="w-3.5 h-3.5 mr-2 text-muted" />
                <span>Mark Complete</span>
              </button>
            </div>
          </div>

          {/* Right Side: Desk Artwork with Laptop, Mug, Plant */}
          <div className="focus-artwork-column">
            <div className="desk-scene-wrap">
              <svg className="desk-scene-svg" viewBox="0 0 240 140" fill="none">
                {/* Desk surface line */}
                <path d="M10,125 L230,125" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
                {/* Plant on left */}
                <path d="M30,125 L36,105 L44,105 L50,125 Z" fill="#1e293b" />
                <path d="M40,105 Q32,80 20,82 Q35,90 40,105 Z" fill="#10b981" opacity="0.85" />
                <path d="M40,105 Q42,70 44,68 Q48,85 40,105 Z" fill="#34d399" opacity="0.9" />
                <path d="M40,105 Q48,78 60,80 Q45,92 40,105 Z" fill="#059669" opacity="0.85" />
                {/* Laptop in center */}
                <polygon points="70,120 160,120 150,85 80,85" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
                <polygon points="78,116 152,116 145,88 85,88" fill="#1e293b" />
                {/* Laptop base */}
                <path d="M60,122 L170,122 Q172,125 168,125 L62,125 Q58,125 60,122 Z" fill="#334155" />
                {/* TaskFlow Coffee Mug on right */}
                <rect x="180" y="98" width="28" height="26" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
                <path d="M208,103 Q215,103 215,110 Q215,117 208,117" stroke="#334155" strokeWidth="2" fill="none" />
                <text x="184" y="114" fill="#60a5fa" fontSize="6" fontFamily="sans-serif" fontWeight="bold">TaskFlow</text>
                {/* Notebook & Pen */}
                <polygon points="85,130 135,130 130,122 80,122" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                <line x1="85" y1="126" x2="125" y2="126" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <div className="desk-decorative-slogan">
                <span>Focus</span>
                <span>Create</span>
                <span>Achieve</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="focus-all-clear-state">
          <div className="all-clear-icon-circle">
            <IconCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="all-clear-text-block">
            <h3 className="all-clear-title">You&apos;re all clear.</h3>
            <p className="all-clear-sub">
              No pending tasks right now. Create a new task to queue your next milestone.
            </p>
          </div>
          <button
            type="button"
            className="btn-start-focus-electric"
            onClick={onOpenAddModal}
          >
            <IconPlus className="w-4 h-4 mr-1.5" />
            <span>Create Task</span>
          </button>
        </div>
      )}
    </section>
  );
}
