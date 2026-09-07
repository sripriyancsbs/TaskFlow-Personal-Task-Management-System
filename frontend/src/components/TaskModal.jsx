import React, { useState, useEffect, useRef } from 'react';

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSaving = false,
}) {
  const isEditing = Boolean(initialData && initialData.id);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [error, setError] = useState('');

  const titleInputRef = useRef(null);
  const modalRef = useRef(null);

  // Sync state whenever modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || '');
        setDescription(initialData.description || '');
        setStatus(initialData.status || 'Pending');
      } else {
        setTitle('');
        setDescription('');
        setStatus('Pending');
      }
      setError('');

      // Focus input on next tick
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialData]);

  // Handle ESC key press
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen && !isSaving) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError('Please enter a task title.');
      titleInputRef.current?.focus();
      return;
    }

    if (trimmedTitle.length > 255) {
      setError('Task title cannot exceed 255 characters.');
      return;
    }

    setError('');
    const payload = {
      title: trimmedTitle,
      description: description.trim(),
      ...(isEditing ? { status } : {}),
    };

    const success = await onSubmit(payload);
    if (success) {
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSaving) {
      onClose();
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-dialog-card" ref={modalRef}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h3 id="modal-title" className="modal-title">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h3>
            <p className="modal-subtitle">
              {isEditing
                ? 'Update your task details and status.'
                : 'Add a new task to your personal workflow queue.'}
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close modal"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form" noValidate>
          {/* Error Banner */}
          {error && (
            <div className="modal-error-banner" role="alert">
              <svg
                className="error-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Title Field */}
          <div className="form-group">
            <label htmlFor="task-title-input" className="form-label">
              Task Title <span className="label-required">*</span>
            </label>
            <input
              id="task-title-input"
              ref={titleInputRef}
              type="text"
              className={`form-input ${error ? 'input-invalid' : ''}`}
              placeholder="e.g., Review technical specification"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              disabled={isSaving}
              maxLength={255}
              required
            />
          </div>

          {/* Description Field */}
          <div className="form-group">
            <label htmlFor="task-desc-input" className="form-label">
              Description <span className="label-optional">(optional)</span>
            </label>
            <textarea
              id="task-desc-input"
              rows={3}
              className="form-textarea"
              placeholder="Add extra context, requirements, or links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving}
            />
          </div>

          {/* Status Selection (only during edit mode) */}
          {isEditing && (
            <div className="form-group">
              <label className="form-label">Status</label>
              <div className="status-radio-group" role="radiogroup" aria-label="Task Status">
                <button
                  type="button"
                  className={`status-pill-option ${status === 'Pending' ? 'selected-pending' : ''}`}
                  onClick={() => setStatus('Pending')}
                  disabled={isSaving}
                >
                  <span className="pill-dot" />
                  <span>Pending</span>
                </button>
                <button
                  type="button"
                  className={`status-pill-option ${status === 'Completed' ? 'selected-completed' : ''}`}
                  onClick={() => setStatus('Completed')}
                  disabled={isSaving}
                >
                  <span className="pill-dot" />
                  <span>Completed</span>
                </button>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="modal-actions-row">
            <button
              type="button"
              className="btn-secondary modal-cancel-btn"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-task"
              className="btn-primary modal-submit-btn"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner-mini" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Create Task'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
