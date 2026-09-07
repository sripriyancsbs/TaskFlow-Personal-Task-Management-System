import React from 'react';
import { IconPlus, IconCheck, IconSearch } from './Icons';

export default function EmptyState({
  statusFilter,
  priorityFilter,
  searchQuery,
  hasAnyTasks,
  onOpenAddModal,
  onResetFilters,
}) {
  let title = 'Nothing on your board.';
  let subtitle = 'Create a task and start moving.';
  let showAddBtn = true;
  let icon = <IconPlus className="w-8 h-8 text-cyan-400" />;

  if (searchQuery && searchQuery.trim()) {
    title = 'No matching tasks.';
    subtitle = 'Try a different search term or clear the filter.';
    showAddBtn = false;
    icon = <IconSearch className="w-8 h-8 text-muted" />;
  } else if (statusFilter === 'Pending' || (!hasAnyTasks && statusFilter === 'All')) {
    title = 'Nothing on your board.';
    subtitle = 'Create a task and start moving.';
    showAddBtn = true;
    icon = <IconPlus className="w-8 h-8 text-cyan-400" />;
  } else if (statusFilter === 'Completed') {
    title = "You're done for now.";
    subtitle = 'Your task list is clear. Complete pending tasks to see history.';
    showAddBtn = false;
    icon = <IconCheck className="w-8 h-8 text-emerald-400" />;
  } else if (priorityFilter && priorityFilter !== 'All') {
    title = `No ${priorityFilter} priority tasks.`;
    subtitle = `No tasks currently assigned ${priorityFilter} priority.`;
    showAddBtn = false;
    icon = <IconSearch className="w-8 h-8 text-muted" />;
  } else if (hasAnyTasks) {
    title = "You're done for now.";
    subtitle = 'Your task list is clear.';
    showAddBtn = true;
    icon = <IconCheck className="w-8 h-8 text-emerald-400" />;
  }

  return (
    <div className="empty-state-wrapper">
      <div className="empty-state-card">
        <div className="empty-icon-halo">{icon}</div>

        <h3 className="empty-title">{title}</h3>
        <p className="empty-subtitle">{subtitle}</p>

        <div className="empty-actions-row">
          {showAddBtn ? (
            <button
              type="button"
              className="btn-new-task-primary empty-add-btn"
              onClick={onOpenAddModal}
            >
              <IconPlus className="w-4 h-4 mr-1.5" />
              <span>Create Task</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-reset-filters empty-reset-btn"
              onClick={onResetFilters}
            >
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
