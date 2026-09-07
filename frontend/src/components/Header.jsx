import React from 'react';

export default function Header({
  theme,
  toggleTheme,
  onOpenShortcuts,
  onExportCSV,
  onExportJSON,
  tasksCount,
}) {
  const isDark = theme === 'dark';

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-brand">
          <div className="brand-logo-badge">
            <svg
              className="brand-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="brand-text">
            <div className="brand-title-wrap">
              <span className="brand-name">TaskFlow</span>
              <span className="brand-version-pill">Pro v1.1</span>
            </div>
            <span className="brand-tagline">Plan less. Accomplish more.</span>
          </div>
        </div>

        <div className="header-actions">
          {/* Quick Export Menu */}
          {tasksCount > 0 && (
            <div className="export-btn-group">
              <button
                type="button"
                className="header-icon-btn"
                onClick={onExportCSV}
                title="Export tasks to CSV file"
                aria-label="Export CSV"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span className="btn-label-desktop">Export CSV</span>
              </button>
            </div>
          )}

          {/* Keyboard Shortcuts Trigger */}
          <button
            type="button"
            className="header-icon-btn"
            onClick={onOpenShortcuts}
            title="Keyboard shortcuts (Press ?)"
            aria-label="View keyboard shortcuts"
          >
            <kbd className="header-kbd-key">?</kbd>
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Switch to light mode (Press D)' : 'Switch to dark mode (Press D)'}
          >
            {isDark ? (
              <>
                <svg
                  className="theme-icon sun-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="12" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
                <span className="theme-toggle-label">Light</span>
              </>
            ) : (
              <>
                <svg
                  className="theme-icon moon-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
                <span className="theme-toggle-label">Dark</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
