import React from 'react';
import {
  IconOverview,
  IconTasks,
  IconToday,
  IconCompleted,
  IconPlus,
} from './Icons';

export default function MobileBottomNav({
  activeNav,
  onSelectNav,
  onOpenNewTask,
  stats = { pending: 0 },
}) {
  return (
    <nav className="mobile-bottom-dock" aria-label="Mobile navigation">
      <button
        type="button"
        className={`mobile-dock-item ${activeNav === 'dashboard' ? 'dock-item-active' : ''}`}
        onClick={() => onSelectNav('dashboard')}
        aria-label="Dashboard"
      >
        <IconOverview className="dock-icon" />
        <span className="dock-label">Dashboard</span>
      </button>

      {/* Center Floating Action Button */}
      <button
        type="button"
        className="mobile-dock-fab"
        onClick={onOpenNewTask}
        title="Create Task"
        aria-label="Create new task"
      >
        <IconPlus className="fab-icon" />
      </button>

      <button
        type="button"
        className={`mobile-dock-item ${activeNav === 'insights' ? 'dock-item-active' : ''}`}
        onClick={() => onSelectNav('insights')}
        aria-label="Productivity Insights"
      >
        <svg className="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        <span className="dock-label">Insights</span>
      </button>
    </nav>
  );
}
