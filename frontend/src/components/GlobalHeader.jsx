import React, { useRef, useEffect, useState } from 'react';
import {
  IconLogo,
  IconSearch,
  IconSun,
  IconMoon,
  IconBell,
  IconChevronRight,
} from './Icons';
import NotificationPopover from './NotificationPopover';
import UserProfileDropdown from './UserProfileDropdown';

export default function GlobalHeader({
  theme,
  toggleTheme,
  searchQuery,
  setSearchQuery,
  onOpenCommandPalette,
  onOpenShortcuts,
  tasks = [],
  onSelectTask,
}) {
  const searchInputRef = useRef(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Focus search on "/" keypress
  useEffect(() => {
    function handleKeyDown(e) {
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="slim-global-header">
      {/* Center: Search Field matching reference */}
      <div className="header-search-container">
        <div
          className="header-search-bar"
          onClick={() => searchInputRef.current?.focus()}
        >
          <IconSearch className="search-bar-icon" />
          <input
            ref={searchInputRef}
            type="search"
            className="search-bar-input"
            placeholder="Search tasks, descriptions, or commands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Global task search"
          />
          <button
            type="button"
            className="search-cmd-badge"
            onClick={(e) => {
              e.stopPropagation();
              onOpenCommandPalette();
            }}
            title="Open Command Palette (Ctrl+K)"
          >
            Ctrl + K
          </button>
        </div>
      </div>

      {/* Right Controls matching reference: Theme Toggle, Bell, Profile */}
      <div className="header-controls-group">
        {/* Theme Toggle Switch */}
        <button
          type="button"
          className="theme-switch-slider"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle dark/light theme"
        >
          <div className={`theme-switch-handle ${theme === 'dark' ? 'switch-dark' : 'switch-light'}`}>
            {theme === 'dark' ? (
              <IconMoon className="w-3 h-3 text-indigo-300" />
            ) : (
              <IconSun className="w-3 h-3 text-amber-400" />
            )}
          </div>
        </button>

        {/* Notification Bell Anchor */}
        <div className="header-popover-anchor">
          <button
            type="button"
            className="header-action-btn bell-btn"
            onClick={() => {
              setIsNotifOpen((prev) => !prev);
              setIsProfileOpen(false);
            }}
            title="Notifications"
            aria-label="Notifications"
          >
            <IconBell className="w-4 h-4" />
            {tasks.length > 0 && <span className="unread-red-dot" />}
          </button>

          <NotificationPopover
            isOpen={isNotifOpen}
            onClose={() => setIsNotifOpen(false)}
            tasks={tasks}
            onSelectTask={onSelectTask}
          />
        </div>

        {/* User Profile Avatar Anchor */}
        <div className="header-popover-anchor">
          <button
            type="button"
            className="header-user-btn"
            onClick={() => {
              setIsProfileOpen((prev) => !prev);
              setIsNotifOpen(false);
            }}
            title="Account & Preferences"
            aria-label="User Account"
          >
            <div className="user-avatar-circle">
              <span>SK</span>
            </div>
            <span className="user-greeting-name">Hi, Sripriyan</span>
            <svg className="w-3 h-3 text-muted ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <UserProfileDropdown
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            theme={theme}
            onToggleTheme={toggleTheme}
            onOpenShortcuts={onOpenShortcuts}
          />
        </div>
      </div>
    </header>
  );
}
