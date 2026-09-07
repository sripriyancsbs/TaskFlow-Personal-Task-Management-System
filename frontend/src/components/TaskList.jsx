import React from 'react';
import TaskCard from './TaskCard';
import TaskGridView from './TaskGridView';
import TaskCalendarView from './TaskCalendarView';
import EmptyState from './EmptyState';

export default function TaskList({
  tasks = [],
  loading = false,
  statusFilter = 'All',
  priorityFilter = 'All',
  searchQuery = '',
  hasAnyTasks = false,
  selectedCalendarDate = null,
  onClearCalendarDate,
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

  // Calendar / Schedule View Mode
  if (viewMode === 'calendar') {
    return (
      <TaskCalendarView
        tasks={tasks}
        onToggleStatus={onToggleStatus}
        onSelectTask={onSelectTask}
        onOpenAddModal={onOpenAddModal}
        actionLoading={actionLoading}
      />
    );
  }

  // Grid / Gallery View Mode
  if (viewMode === 'grid') {
    return (
      <TaskGridView
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
        selectedCalendarDate={selectedCalendarDate}
        onClearCalendarDate={onClearCalendarDate}
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