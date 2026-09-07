import React, { useRef, useEffect } from 'react';

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
  stats,
}) {
  const searchInputRef = useRef(null);

  const statusFilters = [
    { key: 'All', label: 'All Tasks', count: stats.total },
    { key: 'Pending', label: 'Pending', count: stats.pending },
    { key: 'Completed', label: 'Completed', count: stats.completed },
  ];

  const priorityOptions = [
    { key: 'All', label: 'All Priorities' },
    { key: 'High', label: '🔥 High' },
    { key: 'Medium', label: '⚡ Medium' },
    { key: 'Low', label: '🌿 Low' },
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
          <div className="section-title-wrap">
            <h2 className="toolbar-section-title">Workflow Tasks</h2>
            <span className="tasks-count-pill">{stats.total} total</span>
          </div>
        </div>

        <div className="toolbar-actions-right">
          {/* View Switcher: List vs Board */}
          <div className="view-mode-toggle" role="group" aria-label="View mode">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
              aria-label="List View"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              <span>List</span>
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'board' ? 'active' : ''}`}
              onClick={() => setViewMode('board')}
              title="Kanban Board View"
              aria-label="Kanban Board View"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="18" rx="2" />
                <rect x="14" y="3" width="7" height="18" rx="2" />
              </svg>
              <span>Board</span>
            </button>
          </div>

          {/* New Task Button */}
          <button
            type="button"
            id="btn-add-task"
            className="btn-primary btn-add-task glowing-btn"
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
            <span>New Task</span>
            <kbd className="btn-kbd-hint">N</kbd>
          </button>
        </div>
      </div>

      <div className="toolbar-controls-row">
        {/* Search Input with Spotlight Feel */}
        <div className="search-input-container">
          <svg
            className="search-input-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
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
            placeholder="Search by title, context, or description..."
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          ) : (
            <div className="search-shortcut-hint">
              <kbd className="search-kbd-pill">/</kbd>
            </div>
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
                <span className={`filter-badge ${isActive ? 'active-badge' : ''}`}>{filter.count}</span>
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
            <option value="newest">🕒 Newest</option>
            <option value="oldest">⏳ Oldest</option>
            <option value="priority">🔥 High Priority</option>
            <option value="dueDate">📅 Due Date</option>
            <option value="title">🔤 Title (A–Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
