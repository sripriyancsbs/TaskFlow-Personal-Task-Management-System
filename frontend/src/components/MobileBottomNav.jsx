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
        className={`mobile-dock-item ${activeNav === 'overview' ? 'dock-item-active' : ''}`}
        onClick={() => onSelectNav('overview')}
        aria-label="Overview"
      >
        <IconOverview className="dock-icon" />
        <span className="dock-label">Overview</span>
      </button>

      <button
        type="button"
        className={`mobile-dock-item ${activeNav === 'tasks' ? 'dock-item-active' : ''}`}
        onClick={() => onSelectNav('tasks')}
        aria-label="My Tasks"
      >
        <div className="dock-icon-wrap">
          <IconTasks className="dock-icon" />
          {stats.pending > 0 && (
            <span className="dock-badge">{stats.pending}</span>
          )}
        </div>
        <span className="dock-label">Tasks</span>
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
        className={`mobile-dock-item ${activeNav === 'today' ? 'dock-item-active' : ''}`}
        onClick={() => onSelectNav('today')}
        aria-label="Today's Priorities"
      >
        <IconToday className="dock-icon" />
        <span className="dock-label">Today</span>
      </button>

      <button
        type="button"
        className={`mobile-dock-item ${activeNav === 'completed' ? 'dock-item-active' : ''}`}
        onClick={() => onSelectNav('completed')}
        aria-label="Completed archive"
      >
        <IconCompleted className="dock-icon" />
        <span className="dock-label">Done</span>
      </button>
    </nav>
  );
}
