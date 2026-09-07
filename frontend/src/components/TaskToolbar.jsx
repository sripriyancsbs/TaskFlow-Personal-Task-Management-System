import React from 'react';
import {
  IconList,
  IconBoard,
  IconPlus,
  IconSearch,
  IconFire,
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
  stats = { total: 0, pending: 0, completed: 0 },
  todayCount = 0,
  upcomingCount = 0,
}) {
  return (
    <div className="reference-my-tasks-header-block">
      {/* Top Heading Row matching reference: Flame icon + 'My Tasks' + '+ New Task' */}
      <div className="my-tasks-title-row">
        <div className="my-tasks-heading">
          <div className="my-tasks-flame-icon">
            <IconFire className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="my-tasks-title-text">My Tasks</h3>
        </div>

        <button
          type="button"
          className="btn-add-task-reference"
          onClick={onOpenAddModal}
          title="Create New Task (N)"
        >
          <IconPlus className="w-4 h-4 mr-1.5" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter Controls Row matching reference */}
      <div className="my-tasks-controls-bar">
        {/* Status Pills: All | Today | Upcoming | Pending | Completed */}
        <div className="status-pills-cluster" role="radiogroup">
          <button
            type="button"
            className={`ref-status-pill ${statusFilter === 'All' ? 'pill-active-electric' : ''}`}
            onClick={() => setStatusFilter('All')}
          >
            All ({stats.total})
          </button>
          <button
            type="button"
            className={`ref-status-pill ${statusFilter === 'Today' ? 'pill-active-electric' : ''}`}
            onClick={() => setStatusFilter('Today')}
          >
            Today ({todayCount})
          </button>
          <button
            type="button"
            className={`ref-status-pill ${statusFilter === 'Upcoming' ? 'pill-active-electric' : ''}`}
            onClick={() => setStatusFilter('Upcoming')}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            type="button"
            className={`ref-status-pill ${statusFilter === 'Pending' ? 'pill-active-electric' : ''}`}
            onClick={() => setStatusFilter('Pending')}
          >
            Pending ({stats.pending})
          </button>
          <button
            type="button"
            className={`ref-status-pill ${statusFilter === 'Completed' ? 'pill-active-electric' : ''}`}
            onClick={() => setStatusFilter('Completed')}
          >
            Completed ({stats.completed})
          </button>
        </div>

        {/* Search Input */}
        <div className="ref-inline-search-wrap">
          <IconSearch className="inline-search-icon" />
          <input
            type="search"
            className="inline-search-input"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search tasks"
          />
          {searchQuery && (
            <button
              type="button"
              className="inline-search-clear"
              onClick={() => setSearchQuery('')}
            >
              &times;
            </button>
          )}
        </div>

        {/* Priority Filter Dropdown */}
        <div className="ref-select-wrap">
          <select
            id="priority-filter-dropdown"
            className="ref-select"
            aria-label="Filter by Priority"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="High">🔥 High Priority</option>
            <option value="Medium">⚡ Medium Priority</option>
            <option value="Low">🌿 Low Priority</option>
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="ref-select-wrap">
          <select
            id="sort-tasks-dropdown"
            className="ref-select"
            aria-label="Sort Tasks"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="due_date">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* View Switcher: List vs Board */}
        <div className="ref-view-switcher">
          <button
            type="button"
            className={`view-btn ${viewMode === 'list' ? 'view-btn-active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List View"
            aria-label="List View"
          >
            <IconList className="w-4 h-4" />
          </button>
          <button
            type="button"
            className={`view-btn ${viewMode === 'board' ? 'view-btn-active' : ''}`}
            onClick={() => setViewMode('board')}
            title="Kanban Board View"
            aria-label="Board View"
          >
            <IconBoard className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
