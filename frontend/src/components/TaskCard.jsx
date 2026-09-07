import React from 'react';
import { formatDate } from '../utils/dateUtils';
import {
  IconCheck,
  IconPlay,
  IconEdit,
  IconTrash,
  IconUpcoming,
} from './Icons';

export default function TaskCard({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  onSelectTask,
  onStartFocus,
  isActionLoading,
  isDraggable = false,
  onDragStart,
}) {
  const isCompleted = task.status === 'Completed';
  const priority = task.priority || 'Medium';

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onToggleStatus?.(task);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit?.(task);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(task);
  };

  const handleStartFocus = (e) => {
    e.stopPropagation();
    onStartFocus?.(task);
  };

  const formattedDate = task.due_date ? formatDate(task.due_date) : formatDate(task.created_at);

  return (
    <article
      className={`ref-task-row ${isCompleted ? 'task-row-is-completed' : ''}`}
      onClick={() => onSelectTask?.(task)}
      tabIndex={0}
      role="button"
      aria-label={`Task: ${task.title}. Status: ${task.status}. Click to open details.`}
      draggable={isDraggable}
      onDragStart={onDragStart ? (e) => onDragStart(e, task) : undefined}
    >
      {/* Checkbox Square on Left matching reference */}
      <button
        type="button"
        className={`ref-checkbox-box ${isCompleted ? 'checkbox-is-checked' : ''}`}
        onClick={handleCheckboxClick}
        disabled={isActionLoading}
        title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
        aria-label={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
      >
        {isCompleted && <IconCheck className="w-3.5 h-3.5 text-white stroke-[3]" />}
      </button>

      {/* Main Content: Title & Description */}
      <div className="ref-task-content">
        <h4 className={`ref-task-title ${isCompleted ? 'title-completed-strikethrough' : ''}`}>
          {task.title}
        </h4>
        {task.description && (
          <p className="ref-task-description">{task.description}</p>
        )}
      </div>

      {/* Right Details: Priority, Due Date, Actions */}
      <div className="ref-task-right-meta" onClick={(e) => e.stopPropagation()}>
        {/* Priority Badge matching reference */}
        <span className={`ref-priority-pill pill-priority-${priority.toLowerCase()}`}>
          <span className="ref-priority-dot" />
          <span>{priority}</span>
        </span>

        {/* Due Date with Calendar icon */}
        <div className="ref-due-date-label">
          <IconUpcoming className="w-3.5 h-3.5 text-muted mr-1.5" />
          <span>{formattedDate}</span>
        </div>

        {/* Action Icons: Edit, Trash */}
        <div className="ref-actions-bar">

          <button
            type="button"
            className="ref-action-icon-btn"
            onClick={handleEdit}
            title="Edit task"
            aria-label="Edit task"
            disabled={isActionLoading}
          >
            <IconEdit className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            className="ref-action-icon-btn btn-trash-action"
            onClick={handleDelete}
            title="Delete task"
            aria-label="Delete task"
            disabled={isActionLoading}
          >
            <IconTrash className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
