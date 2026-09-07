import React, { useRef, useEffect } from 'react';
import {
  IconLogo,
  IconSearch,
  IconSun,
  IconMoon,
  IconBell,
  IconCommand,
} from './Icons';

export default function GlobalHeader({
  theme,
  toggleTheme,
  searchQuery,
  setSearchQuery,
  onOpenCommandPalette,
  onOpenShortcuts,
  onToggleActivity,
  hasRecentActivity,
  pendingCount = 0,
}) {
  const searchInputRef = useRef(null);

  // Focus search when user presses "/"
  useEffect(() => {
    function handleKeyDown(e) {
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="global-header">
      <div className="header-left-cluster">
        <div className="brand-badge-wrap" tabIndex={0} role="banner">
          <div className="brand-logo-icon">
            <IconLogo className="w-5 h-5 text-accent-cyan" />
          </div>
          <div className="brand-text-block">
            <span className="brand-name">TaskFlow</span>
            <span className="brand-tag">Command Center</span>
          </div>
        </div>
      </div>

      {/* Center Search / Command Input */}
      <div className="header-center-cluster">
        <div className="global-search-bar" onClick={() => searchInputRef.current?.focus()}>
          <IconSearch className="search-icon text-muted" />
          <input
            ref={searchInputRef}
            type="search"
            className="global-search-input"
            placeholder="Search tasks, descriptions, or commands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Global search"
          />
          {searchQuery ? (
            <button
              type="button"
              className="search-clear-btn"
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery('');
              }}
              title="Clear search"
            >
              &times;
            </button>
          ) : (
            <kbd className="search-hotkey-pill" title="Press / to focus search">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Right Actions Cluster */}
      <div className="header-right-cluster">
        {/* Command Palette Trigger */}
        <button
          type="button"
          className="cmd-palette-trigger"
          onClick={onOpenCommandPalette}
          title="Open Command Palette (Ctrl+K or Cmd+K)"
          aria-label="Open Command Palette"
        >
          <IconCommand className="w-4 h-4 cmd-icon" />
          <span className="cmd-label">Commands</span>
          <kbd className="cmd-kbd">Ctrl K</kbd>
        </button>

        {/* Activity / Timeline Trigger */}
        <button
          type="button"
          className="header-icon-btn activity-trigger-btn"
          onClick={onToggleActivity}
          title="Recent Activity Log"
          aria-label="Toggle activity log"
        >
          <IconBell className="w-4 h-4" />
          {hasRecentActivity && <span className="notification-pulse-dot" />}
        </button>

        {/* Theme Switcher */}
        <button
          type="button"
          className="header-icon-btn theme-toggle-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <IconSun className="w-4 h-4 text-amber-400" />
          ) : (
            <IconMoon className="w-4 h-4 text-indigo-400" />
          )}
        </button>

        {/* User / Avatar Placeholder */}
        <div className="header-avatar-badge" title="Active Commander Profile">
          <span className="avatar-initials">TF</span>
          <span className="avatar-status-dot" title="System Online" />
        </div>
      </div>
    </header>
  );
}
