import React from 'react';
import {
  IconOverview,
  IconTasks,
  IconToday,
  IconUpcoming,
  IconCompleted,
  IconSettings,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
} from './Icons';

export default function Sidebar({
  activeNav,
  onSelectNav,
  isCollapsed,
  onToggleCollapse,
  stats = { total: 0, pending: 0, completed: 0 },
  todayCount = 0,
  upcomingCount = 0,
  onOpenNewTask,
  onOpenShortcuts,
}) {
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <IconOverview className="sidebar-nav-icon" />,
      badge: null,
    },
    {
      id: 'tasks',
      label: 'My Tasks',
      icon: <IconTasks className="sidebar-nav-icon" />,
      badge: stats.pending > 0 ? stats.pending : null,
      badgeType: 'pending',
    },
    {
      id: 'today',
      label: 'Today',
      icon: <IconToday className="sidebar-nav-icon" />,
      badge: todayCount > 0 ? todayCount : null,
      badgeType: 'today',
    },
    {
      id: 'upcoming',
      label: 'Upcoming',
      icon: <IconUpcoming className="sidebar-nav-icon" />,
      badge: upcomingCount > 0 ? upcomingCount : null,
      badgeType: 'neutral',
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: <IconCompleted className="sidebar-nav-icon" />,
      badge: stats.completed > 0 ? stats.completed : null,
      badgeType: 'completed',
    },
  ];

  return (
    <aside className={`app-sidebar ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      <div className="sidebar-inner">
        {/* Quick Action: New Task */}
        <div className="sidebar-action-wrap">
          <button
            type="button"
            className="sidebar-quick-add-btn"
            onClick={onOpenNewTask}
            title="Create new task (N)"
            aria-label="Create new task"
          >
            <IconPlus className="w-4 h-4 btn-plus-icon" />
            {!isCollapsed && <span className="btn-add-text">New Task</span>}
            {!isCollapsed && <kbd className="btn-add-kbd">N</kbd>}
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="sidebar-nav" aria-label="Main navigation">
          {!isCollapsed && <div className="sidebar-nav-heading">WORKSPACE</div>}
          <ul className="sidebar-nav-list">
            {navItems.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <li key={item.id} className="sidebar-nav-item">
                  <button
                    type="button"
                    className={`sidebar-nav-link ${isActive ? 'nav-link-active' : ''}`}
                    onClick={() => onSelectNav(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="sidebar-nav-icon-wrap">{item.icon}</span>
                    {!isCollapsed && <span className="sidebar-nav-label">{item.label}</span>}
                    {!isCollapsed && item.badge !== null && (
                      <span className={`sidebar-badge badge-${item.badgeType}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Preferences / Collapse section */}
        <div className="sidebar-bottom-cluster">
          <button
            type="button"
            className="sidebar-nav-link sidebar-settings-btn"
            onClick={onOpenShortcuts}
            title="Shortcuts & System Guide (?)"
          >
            <span className="sidebar-nav-icon-wrap">
              <IconSettings className="sidebar-nav-icon" />
            </span>
            {!isCollapsed && <span className="sidebar-nav-label">Help & Keys</span>}
            {!isCollapsed && <kbd className="sidebar-help-kbd">?</kbd>}
          </button>

          {/* Collapse / Expand Toggle */}
          <button
            type="button"
            className="sidebar-collapse-toggle-btn"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <IconChevronRight className="w-4 h-4" />
            ) : (
              <>
                <IconChevronLeft className="w-4 h-4" />
                <span className="collapse-text">Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
