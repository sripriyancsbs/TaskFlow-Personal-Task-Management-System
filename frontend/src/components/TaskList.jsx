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
  onSelectTask,
  onStartFocus,
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
        {[1, 2, 3].map((n) => (
          <div key={n} className="ref-task-row skeleton-row">
            <div className="skeleton-square" />
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


  // Board / Kanban View Mode
  if (viewMode === 'board') {
    return (
      <TaskBoardView
        tasks={tasks}
        onToggleStatus={onToggleStatus}
        onEdit={onEdit}
        onDelete={onDelete}
        onSelectTask={onSelectTask}
        onOpenAddModal={onOpenAddModal}
        actionLoading={actionLoading}
      />
    );
  }

  // Empty State
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

  // List View (Default matching reference)
  return (
    <div className="task-rows-stack" role="feed" aria-label="Task list feed">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleStatus={onToggleStatus}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelectTask={onSelectTask}
          onStartFocus={onStartFocus}
          isActionLoading={actionLoading}
        />
      ))}
    </div>
  );
}
