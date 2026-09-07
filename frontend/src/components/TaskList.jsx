import React from 'react';
import TaskCard from './TaskCard';
import EmptyState from './EmptyState';

export default function TaskList({
  tasks,
  loading,
  statusFilter,
  priorityFilter,
  searchQuery,
  hasAnyTasks,
  viewMode = 'list',
  onToggleStatus,
  onEdit,
  onDelete,
  onCopyTitle,
  onOpenAddModal,
  onResetFilters,
  actionLoading,
}) {
  if (loading) {
    return (
      <div className="task-grid-container skeleton-grid" aria-busy="true" aria-label="Loading tasks">
        {[1, 2, 3].map((n) => (
          <div key={n} className="task-card skeleton-card">
            <div className="skeleton-line skeleton-badge" />
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-line skeleton-desc" />
            <div className="skeleton-line skeleton-btn" />
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        searchQuery={searchQuery}
        hasAnyTasks={hasAnyTasks}
        onOpenAddModal={onOpenAddModal}
        onResetFilters={onResetFilters}
      />
    );
  }

  // --- Board / Kanban View ---
  if (viewMode === 'board') {
    const pendingTasks = tasks.filter((t) => t.status === 'Pending');
    const completedTasks = tasks.filter((t) => t.status === 'Completed');

    return (
      <div className="kanban-board-container" aria-label="Kanban task board">
        {/* Pending Column */}
        <div className="kanban-column column-pending">
          <div className="kanban-column-header">
            <div className="column-title-wrap">
              <span className="column-dot dot-pending" />
              <h3 className="column-title">Pending</h3>
              <span className="column-counter-badge">{pendingTasks.length}</span>
            </div>
            <button
              type="button"
              className="column-add-btn"
              onClick={onOpenAddModal}
              title="Add task to Pending"
              aria-label="Add task"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          <div className="kanban-cards-stack">
            {pendingTasks.length === 0 ? (
              <div className="column-empty-state">
                <p>No pending tasks</p>
                <span>You're all caught up!</span>
              </div>
            ) : (
              pendingTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleStatus={onToggleStatus}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onCopyTitle={onCopyTitle}
                  isActionLoading={actionLoading}
                />
              ))
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div className="kanban-column column-completed">
          <div className="kanban-column-header">
            <div className="column-title-wrap">
              <span className="column-dot dot-completed" />
              <h3 className="column-title">Completed</h3>
              <span className="column-counter-badge">{completedTasks.length}</span>
            </div>
          </div>

          <div className="kanban-cards-stack">
            {completedTasks.length === 0 ? (
              <div className="column-empty-state">
                <p>No completed tasks yet</p>
                <span>Mark a pending task complete to move it here.</span>
              </div>
            ) : (
              completedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleStatus={onToggleStatus}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onCopyTitle={onCopyTitle}
                  isActionLoading={actionLoading}
                />
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- List View (Default) ---
  return (
    <div className="task-grid-container" role="feed" aria-label="Task list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleStatus={onToggleStatus}
          onEdit={onEdit}
          onDelete={onDelete}
          onCopyTitle={onCopyTitle}
          isActionLoading={actionLoading}
        />
      ))}
    </div>
  );
}
