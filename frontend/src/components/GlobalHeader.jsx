import React, { useRef, useEffect, useState } from 'react';
import {
  IconLogo,
  IconSearch,
  IconSun,
  IconMoon,
  IconChevronRight,
} from './Icons';
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

      {/* Right Controls: Theme Toggle, Profile */}
      <div className="header-controls-group">
        {/* Theme Toggle Button */}
        <button
          type="button"
          className={`theme-switch-slider theme-switch-${theme}`}
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle dark/light theme"
        >
          <div className={`theme-switch-handle ${theme === 'dark' ? 'switch-dark' : 'switch-light'}`}>
            {theme === 'dark' ? (
              <IconMoon width={13} height={13} className="theme-switch-icon theme-icon-moon" />
            ) : (
              <IconSun width={13} height={13} className="theme-switch-icon theme-icon-sun" />
            )}
          </div>
        </button>

        {/* User Profile Avatar Anchor */}
        <div className="header-popover-anchor">
          <button
            type="button"
            className="header-user-btn"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            title="Account & Preferences"
            aria-label="User Account"
          >
            <div className="user-avatar-circle">
              <span>S</span>
            </div>
            <span className="user-greeting-name">Hi, Sripriyan</span>
            <svg className="w-3 h-3 text-muted ml-0.5" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
