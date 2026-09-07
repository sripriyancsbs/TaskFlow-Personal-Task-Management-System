import React from 'react';

export default function EmptyState({
  statusFilter,
  searchQuery,
  hasAnyTasks,
  onOpenAddModal,
  onResetFilters,
}) {
  let title = 'No tasks yet';
  let subtitle = 'Create your first task and start getting things done.';
  let showAddBtn = true;

  if (searchQuery && searchQuery.trim()) {
    title = 'No tasks found';
    subtitle = `No results matching "${searchQuery}". Try a different keyword or reset filters.`;
    showAddBtn = false;
  } else if (statusFilter === 'Pending') {
    title = 'No pending tasks';
    subtitle = 'All caught up! Great job clearing your queue.';
    showAddBtn = false;
  } else if (statusFilter === 'Completed') {
    title = 'No completed tasks';
    subtitle = 'Complete a pending task to see your progress recorded here.';
    showAddBtn = false;
  }

  return (
    <div className="empty-state-wrapper">
      <div className="empty-state-card">
        <div className="empty-illustration">
          <svg
            className="empty-icon-svg"
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="10" y="14" width="44" height="42" rx="6" />
            <path d="M22 6v8" />
            <path d="M42 6v8" />
            <line x1="10" y1="24" x2="54" y2="24" />
            <circle cx="32" cy="38" r="7" strokeDasharray="3 3" />
            <path d="M30 38l2 2 4-4" />
          </svg>
        </div>

        <h3 className="empty-title">{title}</h3>
        <p className="empty-subtitle">{subtitle}</p>

        <div className="empty-actions-row">
          {showAddBtn ? (
            <button
              type="button"
              className="btn-primary empty-add-btn"
              onClick={onOpenAddModal}
            >
              <svg
                className="btn-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Create Your First Task</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-secondary empty-reset-btn"
              onClick={onResetFilters}
            >
              <span>Clear Filter / Search</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
