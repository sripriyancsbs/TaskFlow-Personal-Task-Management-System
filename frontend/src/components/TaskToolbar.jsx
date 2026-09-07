import React, { useRef, useEffect } from 'react';

export default function TaskToolbar({
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery,
  onOpenAddModal,
  stats,
}) {
  const searchInputRef = useRef(null);

  const statusFilters = [
    { key: 'All', label: 'All', count: stats.total },
    { key: 'Pending', label: 'Pending', count: stats.pending },
    { key: 'Completed', label: 'Completed', count: stats.completed },
  ];

  const priorityOptions = [
    { key: 'All', label: 'All Priorities' },
    { key: 'High', label: '🔥 High Priority' },
    { key: 'Medium', label: '⚡ Medium Priority' },
    { key: 'Low', label: '🌿 Low Priority' },
  ];

  // Focus search when pressing / or Ctrl+K
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && document.activeElement !== searchInputRef.current) {
        if (!['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="task-toolbar-wrapper">
      <div className="toolbar-top-row">
        <div className="toolbar-title-group">
          <h2 className="toolbar-section-title">My Tasks</h2>
          <span className="tasks-count-pill">{stats.total} total</span>
        </div>

        <div className="toolbar-actions-right">
          <button
            type="button"
            id="btn-add-task"
            className="btn-primary btn-add-task"
            onClick={onOpenAddModal}
            title="Create a new task (Press N)"
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
            <span>Add Task</span>
            <kbd className="btn-kbd-hint">N</kbd>
          </button>
        </div>
      </div>

      <div className="toolbar-controls-row">
        {/* Search Input */}
        <div className="search-input-container">
          <svg
            className="search-input-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            id="task-search-input"
            className="search-input"
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search tasks"
          />
          {searchQuery ? (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search query"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          ) : (
            <kbd className="search-kbd-pill" title="Press / to search">
              /
            </kbd>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="filter-tabs-group" role="tablist" aria-label="Task status filters">
          {statusFilters.map((filter) => {
            const isActive = statusFilter === filter.key;
            return (
              <button
                key={filter.key}
                type="button"
                role="tab"
                id={`filter-${filter.key.toLowerCase()}`}
                aria-selected={isActive}
                className={`filter-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setStatusFilter(filter.key)}
              >
                <span>{filter.label}</span>
                <span className="filter-badge">{filter.count}</span>
              </button>
            );
          })}
        </div>

        {/* Priority Filter Dropdown */}
        <div className="select-wrapper">
          <select
            className="toolbar-select priority-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            aria-label="Filter by priority"
          >
            {priorityOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="select-wrapper">
          <select
            className="toolbar-select sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort tasks"
          >
            <option value="newest">🕒 Newest First</option>
            <option value="oldest">⏳ Oldest First</option>
            <option value="priority">🔥 Priority (High &rarr; Low)</option>
            <option value="dueDate">📅 Due Date (Soonest)</option>
            <option value="title">🔤 Title (A &rarr; Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
