import React from 'react';
import TaskCard from './TaskCard';
import TaskBoardView from './TaskBoardView';
import TaskFocusView from './TaskFocusView';
import EmptyState from './EmptyState';

export default function TaskList({
  tasks = [],
  loading = false,
  statusFilter = 'All',
  priorityFilter = 'All',
  searchQuery = '',
  hasAnyTasks = false,
  viewMode = 'list',
  onToggleStatus,
  onEdit,
  onDelete,
  onCopyTitle,
  onSelectTask,
  onOpenAddModal,
  onResetFilters,
  actionLoading = false,
  focusedTaskId,
  onSelectFocusedTaskId,
  onExitFocus,
}) {
  // Skeleton Loading View
  if (loading) {
    return (
      <div className="task-feed-container skeleton-feed" aria-busy="true" aria-label="Loading tasks">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="task-row-card skeleton-card">
            <div className="skeleton-circle" />
            <div className="skeleton-content-col">
              <div className="skeleton-line skeleton-title-line" />
              <div className="skeleton-line skeleton-desc-line" />
            </div>
            <div className="skeleton-line skeleton-pill" />
          </div>
        ))}
      </div>
    );
  }

  // Focus View Mode
  if (viewMode === 'focus') {
    return (
      <TaskFocusView
        tasks={tasks}
        focusedTaskId={focusedTaskId}
        onSelectFocusedTaskId={onSelectFocusedTaskId}
        onToggleStatus={onToggleStatus}
        onExitFocus={onExitFocus}
        isActionLoading={actionLoading}
      />
    );
  }

  // Board / Kanban View Mode
  if (viewMode === 'board') {
    return (
      <TaskBoardView
        tasks={tasks}
        onToggleStatus={onToggleStatus}
        onEdit={onEdit}
        onDelete={onDelete}
        onCopyTitle={onCopyTitle}
        onSelectTask={onSelectTask}
        onOpenAddModal={onOpenAddModal}
        actionLoading={actionLoading}
      />
    );
  }

  // Empty State (when in List View or filters return zero items)
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

  // List View (Default)
  return (
    <div className="task-feed-container" role="feed" aria-label="Task list feed">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleStatus={onToggleStatus}
          onEdit={onEdit}
          onDelete={onDelete}
          onCopyTitle={onCopyTitle}
          onSelectTask={onSelectTask}
          isActionLoading={actionLoading}
        />
      ))}
    </div>
  );
}
