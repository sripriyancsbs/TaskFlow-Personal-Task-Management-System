import React, { useState, useEffect } from 'react';
import { formatDate, formatDueDate, formatDateTime } from '../utils/dateUtils';
import {
  IconClose,
  IconCheck,
  IconTrash,
  IconClock,
  IconFire,
} from './Icons';

export default function TaskDetailPanel({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onToggleStatus,
  onDeleteTask,
  isSaving,
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    due_date: '',
    status: 'Pending',
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Sync state with selected task
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'Medium',
        due_date: task.due_date ? task.due_date.slice(0, 10) : '',
        status: task.status || 'Pending',
      });
      setHasChanges(false);
    }
  }, [task]);

  // Handle escape key to close
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!formData.title.trim()) return;
    await onUpdateTask(task.id, {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      priority: formData.priority,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      status: formData.status,
    });
    setHasChanges(false);
  };

  const isCompleted = task.status === 'Completed';
  const dueDateInfo = formatDueDate(task.due_date, task.status);

  return (
    <div className="task-detail-overlay" onClick={onClose}>
      <aside
        className="task-detail-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Task Details Inspector"
      >
        {/* Drawer Header */}
        <div className="detail-drawer-header">
          <div className="drawer-header-left">
            <span
              className={`status-pill ${
                isCompleted ? 'status-pill-completed' : 'status-pill-pending'
              }`}
            >
              {task.status}
            </span>
            {task.priority === 'High' && (
              <span className="priority-pill-high">
                <IconFire className="w-3.5 h-3.5 mr-1" /> High Priority
              </span>
            )}
          </div>

          <div className="drawer-header-actions">
            <button
              type="button"
              className="drawer-close-btn"
              onClick={onClose}
              title="Close panel (Esc)"
              aria-label="Close details"
            >
              <IconClose className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <form className="detail-drawer-body" onSubmit={handleSave}>
          {/* Title input */}
          <div className="detail-form-group">
            <label className="detail-field-label" htmlFor="detail-title">
              Task Title
            </label>
            <input
              id="detail-title"
              type="text"
              className="detail-input-title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Task title..."
              required
            />
          </div>

          {/* Status quick toggle bar */}
          <div className="detail-status-bar">
            <button
              type="button"
              className={`detail-status-toggle-btn ${
                isCompleted ? 'btn-is-completed' : 'btn-is-pending'
              }`}
              onClick={() => onToggleStatus(task)}
              disabled={isSaving}
            >
              <IconCheck className="w-4 h-4 mr-2" />
              <span>{isCompleted ? 'Completed (Click to Reopen)' : 'Mark Task as Completed'}</span>
            </button>
          </div>

          {/* Description */}
          <div className="detail-form-group">
            <label className="detail-field-label" htmlFor="detail-desc">
              Description & Notes
            </label>
            <textarea
              id="detail-desc"
              rows={4}
              className="detail-textarea-desc"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Add detailed specifications, checklist notes, or criteria..."
            />
          </div>

          {/* Priority selector */}
          <div className="detail-form-group">
            <label className="detail-field-label">Priority Level</label>
            <div className="priority-button-group" role="radiogroup">
              {['High', 'Medium', 'Low'].map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`priority-select-btn ${
                    formData.priority === level ? `selected-${level.toLowerCase()}` : ''
                  }`}
                  onClick={() => handleChange('priority', level)}
                  role="radio"
                  aria-checked={formData.priority === level}
                >
                  {level === 'High' && '🔥 High'}
                  {level === 'Medium' && '⚡ Medium'}
                  {level === 'Low' && '🌿 Low'}
                </button>
              ))}
            </div>
          </div>

          {/* Due date picker */}
          <div className="detail-form-group">
            <label className="detail-field-label" htmlFor="detail-due-date">
              Due Date
            </label>
            <input
              id="detail-due-date"
              type="date"
              className="detail-input-date"
              value={formData.due_date}
              onChange={(e) => handleChange('due_date', e.target.value)}
            />
            {dueDateInfo && (
              <span className="detail-due-hint">{dueDateInfo.text}</span>
            )}
          </div>

          {/* Metadata information */}
          <div className="detail-metadata-box">
            <div className="metadata-row">
              <span className="meta-label">Created:</span>
              <span className="meta-val">{formatDateTime(task.created_at)}</span>
            </div>
            <div className="metadata-row">
              <span className="meta-label">Task ID:</span>
              <span className="meta-val font-mono">#{task.id}</span>
            </div>
            <div className="metadata-row">
              <span className="meta-label">Storage:</span>
              <span className="meta-val">PostgreSQL Record</span>
            </div>
          </div>

          {/* Drawer Actions */}
          <div className="detail-drawer-footer">
            <div className="drawer-footer-left">
              <button
                type="button"
                className="btn-danger-delete"
                onClick={() => onDeleteTask(task)}
                disabled={isSaving}
                title="Delete this task"
              >
                <IconTrash className="w-4 h-4 mr-1.5" />
                <span>Delete</span>
              </button>
            </div>

            <div className="drawer-footer-right">
              <button
                type="submit"
                className="btn-primary-save"
                disabled={isSaving || !formData.title.trim() || !hasChanges}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </aside>
    </div>
  );
}
