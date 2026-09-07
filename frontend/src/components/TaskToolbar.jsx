import React from 'react';
import {
  IconList,
  IconBoard,
  IconFocus,
  IconPlus,
  IconFilter,
  IconSearch,
} from './Icons';

export default function TaskToolbar({
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  onOpenAddModal,
  totalMatching = 0,
  onResetFilters,
}) {
  const isFiltered = statusFilter !== 'All' || priorityFilter !== 'All' || searchQuery.trim() !== '';

  return (
    <div className="workspace-toolbar">
      {/* Top row: Title + View Switcher + New Task */}
      <div className="toolbar-top-row">
        <div className="toolbar-heading-cluster">
          <h2 className="workspace-title">My Tasks</h2>
          <span className="workspace-counter-badge">{totalMatching}</span>
        </div>

        {/* View Switcher: List | Board | Focus */}
        <div className="view-mode-selector" role="group" aria-label="Task view mode">
          <button
            type="button"
            className={`view-mode-btn ${viewMode === 'list' ? 'view-mode-active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List View (L)"
            aria-pressed={viewMode === 'list'}
          >
            <IconList className="w-3.5 h-3.5 mr-1.5" />
            <span>List</span>
          </button>

          <button
            type="button"
            className={`view-mode-btn ${viewMode === 'board' ? 'view-mode-active' : ''}`}
            onClick={() => setViewMode('board')}
            title="Kanban Board View (B)"
            aria-pressed={viewMode === 'board'}
          >
            <IconBoard className="w-3.5 h-3.5 mr-1.5" />
            <span>Board</span>
          </button>

          <button
            type="button"
            className={`view-mode-btn ${viewMode === 'focus' ? 'view-mode-active' : ''}`}
            onClick={() => setViewMode('focus')}
            title="Focus Timer Mode (F)"
            aria-pressed={viewMode === 'focus'}
          >
            <IconFocus className="w-3.5 h-3.5 mr-1.5" />
            <span>Focus</span>
          </button>
        </div>

        {/* Primary CTA */}
        <button
          type="button"
          className="btn-new-task-primary"
          onClick={onOpenAddModal}
          title="Create task (N)"
        >
          <IconPlus className="w-4 h-4 mr-1.5" />
          <span>New Task</span>
          <kbd className="kbd-shortcut-hint">N</kbd>
        </button>
      </div>

      {/* Bottom row: Search + Status Filters + Priority Filters + Sort */}
      <div className="toolbar-filters-row">
        {/* Search inside workspace */}
        <div className="toolbar-search-wrap">
          <IconSearch className="toolbar-search-icon" />
          <input
            type="search"
            className="toolbar-search-input"
            placeholder="Filter tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Filter tasks"
          />
          {searchQuery && (
            <button
              type="button"
              className="toolbar-clear-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              &times;
            </button>
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="filter-pill-group" role="radiogroup" aria-label="Filter by status">
          {['All', 'Pending', 'Completed'].map((status) => (
            <button
              key={status}
              type="button"
              className={`filter-pill ${statusFilter === status ? 'pill-active' : ''}`}
              onClick={() => setStatusFilter(status)}
              role="radio"
              aria-checked={statusFilter === status}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="select-dropdown-wrap">
          <label htmlFor="priority-filter-select" className="sr-only">Filter by Priority</label>
          <select
            id="priority-filter-select"
            className="toolbar-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="High">🔥 High Priority</option>
            <option value="Medium">⚡ Medium Priority</option>
            <option value="Low">🌿 Low Priority</option>
          </select>
        </div>

        {/* Sort Selector */}
        <div className="select-dropdown-wrap">
          <label htmlFor="sort-select" className="sr-only">Sort Tasks</label>
          <select
            id="sort-select"
            className="toolbar-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">By Priority</option>
            <option value="due_date">By Due Date</option>
          </select>
        </div>

        {/* Reset Filter button if filtered */}
        {isFiltered && (
          <button
            type="button"
            className="btn-reset-filters"
            onClick={onResetFilters}
            title="Clear all filters"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
