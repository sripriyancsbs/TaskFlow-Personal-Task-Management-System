import React from 'react';

export default function ToastContainer({ toasts, onRemove }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <aside className="toast-container" aria-live="polite" aria-label="Notifications">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`toast-item toast-${toast.type || 'info'}`}
            role="status"
          >
            <div className="toast-icon-wrap">
              {isSuccess && (
                <svg
                  className="toast-icon"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: 18, height: 18, minWidth: 18, minHeight: 18, flexShrink: 0 }}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {isError && (
                <svg
                  className="toast-icon"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: 18, height: 18, minWidth: 18, minHeight: 18, flexShrink: 0 }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
              {!isSuccess && !isError && (
                <svg
                  className="toast-icon"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: 18, height: 18, minWidth: 18, minHeight: 18, flexShrink: 0 }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              )}
            </div>

            <div className="toast-message-content">
              <span>{toast.message}</span>
            </div>

            <button
              type="button"
              className="toast-close-btn"
              onClick={() => onRemove(toast.id)}
              aria-label="Dismiss notification"
            >
              <svg
                width={14}
                height={14}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: 14, height: 14, minWidth: 14, minHeight: 14, flexShrink: 0 }}
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        );
      })}
    </aside>
  );
}
