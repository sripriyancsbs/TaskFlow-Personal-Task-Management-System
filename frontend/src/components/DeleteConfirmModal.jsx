import React, { useEffect } from 'react';

export default function DeleteConfirmModal({
  isOpen,
  task,
  onClose,
  onConfirm,
  isDeleting = false,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !task) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onClose();
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-desc"
    >
      <div className="modal-dialog-card delete-dialog-card">
        <div className="delete-dialog-icon-wrap">
          <div className="delete-icon-circle">
            <svg
              className="delete-warning-icon"
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
          </div>
        </div>

        <div className="delete-dialog-body">
          <h3 id="delete-dialog-title" className="delete-dialog-title">
            Delete this task?
          </h3>
          <p id="delete-dialog-desc" className="delete-dialog-desc">
            This action cannot be undone. <strong>"{task.title}"</strong> will be permanently removed from your workflow.
          </p>
        </div>

        <div className="modal-actions-row delete-actions-row">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            id="btn-confirm-delete"
            className="btn-danger"
            onClick={() => onConfirm(task.id)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="spinner-mini" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Task</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
