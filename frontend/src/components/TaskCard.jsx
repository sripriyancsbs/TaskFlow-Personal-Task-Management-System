import React from 'react';
import { formatDate } from '../utils/dateUtils';

export default function TaskCard({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  isActionLoading,
}) {
  const isCompleted = task.status === 'Completed';

  return (
    <article
      className={`task-card ${isCompleted ? 'task-card-completed' : 'task-card-pending'}`}
      data-task-id={task.id}
    >
      <div className="card-top-row">
        <div className="card-status-date-group">
          <span
            className={`status-badge ${isCompleted ? 'badge-completed' : 'badge-pending'}`}
          >
            <span className="badge-dot" />
            {task.status}
          </span>
          <span className="card-date-text">
            <svg
              className="calendar-mini-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {formatDate(task.created_at)}
          </span>
        </div>

        <div className="card-actions-group">
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
      </div>
    </article>
  );
}
