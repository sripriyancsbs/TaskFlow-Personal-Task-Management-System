import React from 'react';
import { formatDate, formatDueDate } from '../utils/dateUtils';
import {
  IconCheck,
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

  const dueInfo = formatDueDate(task.due_date, task.status);
  const formattedDate = task.due_date ? formatDate(task.due_date) : 'No Due Date';

  return (
    <article
      className={`ref-task-row ${isCompleted ? 'task-row-is-completed' : ''} ${dueInfo?.isOverdue ? 'task-row-is-overdue' : ''}`}
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

      {/* Right Details: Priority, Due Date, Overdue Column, Actions */}
      <div className="ref-task-right-meta" onClick={(e) => e.stopPropagation()}>
        {/* Priority Badge matching reference */}
        <span className={`ref-priority-pill pill-priority-${priority.toLowerCase()}`}>
          <span className="ref-priority-dot" />
          <span>{priority}</span>
        </span>

        {/* Due Date Column */}
        <div className={`ref-due-date-label ${!task.due_date ? 'label-no-date' : ''}`}>
          <IconUpcoming className="w-3.5 h-3.5 text-muted mr-1.5" />
          <span>{formattedDate}</span>
        </div>

        {/* Separate Overdue Days Column */}
        <div className="ref-overdue-col" aria-label={dueInfo?.isOverdue ? `${dueInfo.overdueDays} days overdue` : 'Overdue status'}>
          {dueInfo?.isOverdue ? (
            <span className="overdue-tag-badge" title={`${dueInfo.overdueDays} day(s) overdue`}>
              <span className="overdue-dot" />
              <span>{dueInfo.overdueDays} {dueInfo.overdueDays === 1 ? 'day' : 'days'} overdue</span>
            </span>
          ) : dueInfo?.isToday ? (
            <span className="due-today-tag-badge">
              <span className="today-dot" />
              <span>Due Today</span>
            </span>
          ) : (
            <span className="no-overdue-placeholder">&mdash;</span>
          )}
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
