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
        {/* Mountain Atmosphere Card matching reference */}
        <div className="sidebar-mountain-card">
          <div className="mountain-artwork">
            <svg className="mountain-svg" viewBox="0 0 160 70" fill="none">
              {/* Mountain silhouettes */}
              <polygon points="20,70 65,22 110,70" fill="#1e293b" opacity="0.8" />
              <polygon points="75,70 120,30 160,70" fill="#0f172a" opacity="0.9" />
              <polygon points="0,70 38,35 85,70" fill="#334155" opacity="0.6" />
              {/* Star dots */}
              <circle cx="25" cy="15" r="1" fill="#93c5fd" />
              <circle cx="85" cy="10" r="1.2" fill="#bfdbfe" />
              <circle cx="140" cy="18" r="1" fill="#93c5fd" />
            </svg>
          </div>
          <p className="mountain-quote-text">
            &ldquo;Small steps every day lead to big results.&rdquo;
          </p>
          <div className="mountain-progress-track">
            <div className="mountain-progress-fill" style={{ width: '45%' }} />
          </div>
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
