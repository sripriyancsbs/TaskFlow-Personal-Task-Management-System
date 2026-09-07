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
