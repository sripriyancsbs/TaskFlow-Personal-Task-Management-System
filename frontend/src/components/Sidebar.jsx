import React from 'react';
import {
  IconOverview,
  IconTasks,
  IconToday,
  IconUpcoming,
  IconCompleted,
  IconFocus,
  IconSettings,
  IconPlus,
} from './Icons';

export default function Sidebar({
  activeNav,
  onSelectNav,
  stats = { total: 0, pending: 0, completed: 0 },
  todayCount = 0,
  upcomingCount = 0,
  onOpenNewTask,
  onOpenShortcuts,
}) {
  const navLinks = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <IconOverview className="sidebar-icon" />,
      badge: stats.total > 0 ? stats.total : null,
      badgeColor: 'badge-blue',
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: (
        <svg className="sidebar-icon" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      badge: null,
    },
  ];

  return (
    <aside className="reference-sidebar" aria-label="Main navigation">
      {/* Brand Header */}
      <div className="sidebar-brand-block">
        <div className="sidebar-brand-row">
          <div className="sidebar-lightning-icon">
            <svg className="w-5 h-5 text-blue-500" width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-title">TaskFlow</span>
            <span className="sidebar-brand-slogan">Plan. Focus. Achieve.</span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav-container">
        <ul className="sidebar-nav-menu">
          {navLinks.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`sidebar-menu-btn ${isActive ? 'btn-active-dashboard' : ''}`}
                  onClick={() => onSelectNav(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="sidebar-btn-icon-wrap">{item.icon}</span>
                  <span className="sidebar-btn-label">{item.label}</span>
                  {item.badge !== null && (
                    <span className={`sidebar-count-circle ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Mountain Card & New Task CTA */}
      <div className="sidebar-bottom-panel">
        {/* Real Productivity Progress Card */}
        <div className="sidebar-progress-card">
          <div className="sidebar-progress-header">
            <span className="sidebar-progress-title">Daily Progress</span>
            <span className="sidebar-progress-pct">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </span>
          </div>
          <div className="sidebar-progress-track">
            <div
              className="sidebar-progress-fill"
              style={{
                width: `${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%`,
              }}
            />
          </div>
          <p className="sidebar-progress-quote">
            {stats.completed} of {stats.total} tasks completed
          </p>
        </div>

        {/* Full-Width New Task Button with 'N' tag */}
        <button
          type="button"
          className="sidebar-bottom-add-btn"
          onClick={onOpenNewTask}
          title="Create task (N)"
        >
          <div className="btn-add-left">
            <IconPlus className="w-4 h-4 mr-1.5" />
            <span>New Task</span>
          </div>
          <kbd className="btn-add-kbd-pill">N</kbd>
        </button>
      </div>
    </aside>
  );
}
