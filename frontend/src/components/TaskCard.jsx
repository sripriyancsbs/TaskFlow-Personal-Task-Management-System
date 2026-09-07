import React, { useState } from 'react';
import { formatDate, formatDueDate } from '../utils/dateUtils';
import {
  IconCheck,
  IconCopy,
  IconEdit,
  IconTrash,
  IconChevronRight,
  IconFire,
} from './Icons';

export default function TaskCard({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  onCopyTitle,
  onSelectTask,
  isActionLoading,
  isDraggable = false,
  onDragStart,
}) {
  const isCompleted = task.status === 'Completed';
  const priority = task.priority || 'Medium';
  const dueDateInfo = formatDueDate(task.due_date, task.status);
  const [copied, setCopied] = useState(false);

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onToggleStatus?.(task);
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(task.title);
    setCopied(true);
    onCopyTitle?.(task.title);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit?.(task);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(task);
  };

  const handleCardClick = () => {
    onSelectTask?.(task);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectTask?.(task);
    }
  };

  return (
    <article
      className={`task-row-card ${isCompleted ? 'task-row-completed' : 'task-row-pending'} priority-${priority.toLowerCase()}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Task: ${task.title}. Status: ${task.status}. Priority: ${priority}. Click for details.`}
      draggable={isDraggable}
      onDragStart={onDragStart ? (e) => onDragStart(e, task) : undefined}
    >
      {/* Left: Custom Status Indicator / Toggle Button */}
      <button
        type="button"
        className={`task-status-btn ${isCompleted ? 'status-btn-completed' : 'status-btn-pending'}`}
        onClick={handleCheckboxClick}
        disabled={isActionLoading}
        title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
        aria-label={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
      >
        <span className="status-indicator-circle">
          {isCompleted && <IconCheck className="w-3.5 h-3.5 status-check-icon" />}
        </span>
      </button>

      {/* Main Details Body */}
      <div className="task-content-main">
        <div className="task-title-line">
          <h3 className={`task-title-text ${isCompleted ? 'task-completed-strikethrough' : ''}`}>
            {task.title}
          </h3>

          {/* Priority Badge */}
          <span className={`task-badge-priority badge-${priority.toLowerCase()}`}>
            {priority === 'High' && <IconFire className="w-3 h-3 mr-1 text-rose-400" />}
            <span>{priority}</span>
          </span>

          {/* Due Date Pill if set */}
          {dueDateInfo && (
            <span
              className={`task-due-pill ${
                dueDateInfo.isOverdue
                  ? 'due-pill-overdue'
                  : dueDateInfo.isToday
                  ? 'due-pill-today'
                  : 'due-pill-normal'
              }`}
            >
              {dueDateInfo.text}
            </span>
          )}
        </div>

        {task.description && (
          <p className={`task-desc-text ${isCompleted ? 'desc-muted-completed' : ''}`}>
            {task.description}
          </p>
        )}

        <div className="task-meta-footer">
          <span className="task-date-created">Created {formatDate(task.created_at)}</span>
        </div>
      </div>

      {/* Right: Contextual Actions (Revealed cleanly on row hover) */}
      <div className="task-actions-cluster" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="task-action-icon-btn"
          onClick={handleCopy}
          title={copied ? 'Copied!' : 'Copy title'}
          aria-label="Copy task title"
        >
          {copied ? (
            <IconCheck className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <IconCopy className="w-3.5 h-3.5" />
          )}
        </button>

        <button
          type="button"
          className="task-action-icon-btn"
          onClick={handleEdit}
          title="Edit task"
          aria-label="Edit task"
          disabled={isActionLoading}
        >
          <IconEdit className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          className="task-action-icon-btn action-delete-btn"
          onClick={handleDelete}
          title="Delete task"
          aria-label="Delete task"
          disabled={isActionLoading}
        >
          <IconTrash className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          className="task-action-icon-btn action-inspect-btn"
          onClick={handleCardClick}
          title="Inspect details"
          aria-label="Inspect task details"
        >
          <IconChevronRight className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
}
