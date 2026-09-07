import React from 'react';
import {
  IconCheck,
  IconEdit,
  IconTrash,
  IconPlus,
  IconClock,
  IconFire,
} from './Icons';
import { formatDueDate, formatRelativeTime } from '../utils/dateUtils';

export default function TaskGridView({
  tasks = [],
  onToggleStatus,
  onEdit,
  onDelete,
  onSelectTask,
  onOpenAddModal,
  actionLoading = false,
}) {
  return (
    <div className="task-grid-gallery" role="feed" aria-label="Task Grid Gallery">
      {tasks.map((task) => {
        const isCompleted = task.status === 'Completed';
        const dueDateInfo = formatDueDate(task.due_date, task.status);

        return (
          <article
            key={task.id}
            className={`grid-task-card priority-${task.priority.toLowerCase()} ${
              isCompleted ? 'card-completed' : 'card-pending'
            }`}
            onClick={() => onSelectTask(task)}
          >
            {/* Top Color Accent Strip */}
            <div className={`grid-card-accent-bar accent-${task.priority.toLowerCase()}`} />

            {/* Card Header */}
            <div className="grid-card-header">
              <div className="grid-card-left-header">
                <button
                  type="button"
                  className={`grid-checkbox ${isCompleted ? 'checked' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStatus(task);
                  }}
                  disabled={actionLoading}
                  aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
                >
                  {isCompleted && <IconCheck className="w-3.5 h-3.5" />}
                </button>

                <span className={`grid-priority-tag tag-${task.priority.toLowerCase()}`}>
                  {task.priority === 'High' && '🔥 High'}
                  {task.priority === 'Medium' && '⚡ Medium'}
                  {task.priority === 'Low' && '🌿 Low'}
                </span>
              </div>

              <div className="grid-card-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="grid-action-icon-btn"
                  onClick={() => onEdit(task)}
                  title="Edit task"
                  aria-label="Edit task"
                >
                  <IconEdit className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="grid-action-icon-btn btn-action-delete"
                  onClick={() => onDelete(task)}
                  title="Delete task"
                  aria-label="Delete task"
                >
                  <IconTrash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card Body */}
            <div className="grid-card-body">
              <h4 className={`grid-card-title ${isCompleted ? 'title-completed' : ''}`}>
                {task.title}
              </h4>
              {task.description ? (
                <p className="grid-card-desc">{task.description}</p>
              ) : (
                <p className="grid-card-desc-empty">No additional notes</p>
              )}
            </div>

            {/* Card Footer */}
            <div className="grid-card-footer">
              <div className="grid-footer-meta">
                {dueDateInfo ? (
                  <span
                    className={`grid-due-pill ${
                      dueDateInfo.isOverdue
                        ? 'pill-overdue'
                        : dueDateInfo.isToday
                        ? 'pill-today'
                        : 'pill-upcoming'
                    }`}
                  >
                    <IconClock className="w-3 h-3 mr-1 inline" />
                    {dueDateInfo.text}
                  </span>
                ) : (
                  <span className="grid-no-due-pill">No due date</span>
                )}
              </div>

              <span className="grid-card-time-ago" title={new Date(task.created_at).toLocaleString()}>
                {formatRelativeTime(task.created_at)}
              </span>
            </div>
          </article>
        );
      })}

      {/* Quick Add Card */}
      <button
        type="button"
        className="grid-add-new-card"
        onClick={onOpenAddModal}
        title="Create a new task"
      >
        <div className="grid-add-icon-circle">
          <IconPlus className="w-5 h-5" />
        </div>
        <span className="grid-add-text">Add New Task</span>
        <span className="grid-add-subtext">Click or press 'N'</span>
      </button>
    </div>
  );
}
