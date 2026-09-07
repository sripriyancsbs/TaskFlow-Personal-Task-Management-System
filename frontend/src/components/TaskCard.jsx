import React, { useState } from 'react';
import { formatDate, formatDueDate } from '../utils/dateUtils';

export default function TaskCard({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  onCopyTitle,
  isActionLoading,
}) {
  const isCompleted = task.status === 'Completed';
  const priority = task.priority || 'Medium';
  const dueDateInfo = formatDueDate(task.due_date, task.status);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(task.title);
    setCopied(true);
    onCopyTitle?.(task.title);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article
      className={`task-card ${isCompleted ? 'task-card-completed' : 'task-card-pending'} priority-${priority.toLowerCase()}`}
      data-task-id={task.id}
    >
      <div className="card-top-row">
        <div className="card-meta-badges">
          {/* Status Badge */}
          <span className={`status-badge ${isCompleted ? 'badge-completed' : 'badge-pending'}`}>
            <span className="badge-dot" />
            {task.status}
          </span>

          {/* Priority Badge */}
          <span className={`priority-badge priority-badge-${priority.toLowerCase()}`}>
            {priority === 'High' && <span className="priority-fire">🔥</span>}
            {priority === 'Medium' && <span className="priority-bolt">⚡</span>}
            {priority === 'Low' && <span className="priority-leaf">🌿</span>}
            <span>{priority}</span>
          </span>

          {/* Due Date Pill if specified */}
          {dueDateInfo && (
            <span
              className={`due-date-pill ${
                dueDateInfo.isOverdue
                  ? 'pill-overdue'
                  : dueDateInfo.isToday
                  ? 'pill-today'
                  : dueDateInfo.isTomorrow
                  ? 'pill-tomorrow'
                  : 'pill-future'
              }`}
            >
              <svg
                className="clock-mini-icon"
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
              <span>{dueDateInfo.text}</span>
            </span>
          )}
        </div>

        <div className="card-actions-group">
          {/* Copy Title Action */}
          <button
            type="button"
            className="card-action-btn copy-action-btn"
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy title'}
            aria-label="Copy task title"
          >
            {copied ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="copied-check-icon"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>

          {/* Edit Button */}
          <button
            type="button"
            className="card-action-btn edit-action-btn"
            onClick={() => onEdit(task)}
            title="Edit task"
            aria-label={`Edit task: ${task.title}`}
            disabled={isActionLoading}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>

          {/* Delete Button */}
          <button
            type="button"
            className="card-action-btn delete-action-btn"
            onClick={() => onDelete(task)}
            title="Delete task"
            aria-label={`Delete task: ${task.title}`}
            disabled={isActionLoading}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      </div>

      <div className="card-content-body">
        <h3 className={`task-card-title ${isCompleted ? 'title-strikethrough' : ''}`}>
          {task.title}
        </h3>
        {task.description && (
          <p className={`task-card-desc ${isCompleted ? 'desc-completed' : ''}`}>
            {task.description}
          </p>
        )}
      </div>

      <div className="card-bottom-row">
        <button
          type="button"
          className={`btn-status-toggle ${isCompleted ? 'toggle-completed' : 'toggle-pending'}`}
          onClick={() => onToggleStatus(task)}
          disabled={isActionLoading}
          aria-label={
            isCompleted
              ? `Mark '${task.title}' as pending`
              : `Mark '${task.title}' as completed`
          }
        >
          {isCompleted ? (
            <>
              <span className="toggle-icon-wrap check-active">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span>Completed</span>
            </>
          ) : (
            <>
              <span className="toggle-icon-wrap circle-pending" />
              <span>Mark Complete</span>
            </>
          )}
        </button>

        <span className="card-created-date" title={`Created: ${task.created_at}`}>
          Created {formatDate(task.created_at)}
        </span>
      </div>
    </article>
  );
}
