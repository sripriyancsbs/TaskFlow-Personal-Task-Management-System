import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { IconSettings, IconSun, IconMoon, IconClose } from './Icons';

export default function UserProfileDropdown({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  onOpenShortcuts,
  onOpenAuthModal,
}) {
  const { user, isAuthenticated, logout } = useAuth();
  const menuRef = useRef(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const initial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'G';
  const displayName = user?.name || 'Guest Explorer';
  const displayEmail = user?.email || 'Not signed in';

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <div className="user-profile-menu" ref={menuRef} role="menu" aria-label="User Account">
      {/* Header Info */}
      <div className="profile-menu-header">
        <div className="profile-menu-avatar">
          <span>{initial}</span>
        </div>
        <div className="profile-menu-info">
          <span className="profile-name">{displayName}</span>
          <span className="profile-role">{displayEmail}</span>
        </div>
      </div>

      <div className="profile-menu-divider" />

      {/* Menu Options */}
      <div className="profile-menu-list">
        {!isAuthenticated ? (
          <button
            type="button"
            className="profile-menu-item profile-auth-action-btn"
            onClick={() => {
              onClose();
              onOpenAuthModal?.('signin');
            }}
            role="menuitem"
          >
            <span className="profile-item-icon">🔐</span>
            <span>Sign In / Create Account</span>
          </button>
        ) : null}

        <button
          type="button"
          className="profile-menu-item"
          onClick={() => {
            onClose();
            onOpenShortcuts();
          }}
          role="menuitem"
        >
          <IconSettings width={16} height={16} className="profile-item-icon text-muted" />
          <span>Keyboard Shortcuts</span>
          <kbd className="profile-item-kbd">?</kbd>
        </button>

        <button
          type="button"
          className="profile-menu-item"
          onClick={() => {
            onToggleTheme();
          }}
          role="menuitem"
        >
          {theme === 'dark' ? (
            <>
              <IconSun width={16} height={16} className="profile-item-icon text-amber-400" />
              <span>Switch to Light Theme</span>
            </>
          ) : (
            <>
              <IconMoon width={16} height={16} className="profile-item-icon text-indigo-400" />
              <span>Switch to Dark Theme</span>
            </>
          )}
        </button>

        {isAuthenticated && (
          <button
            type="button"
            className="profile-menu-item profile-menu-logout"
            onClick={handleLogout}
            role="menuitem"
          >
            <span className="profile-item-icon">🚪</span>
            <span>Sign Out</span>
          </button>
        )}
      </div>

      <div className="profile-menu-divider" />

      <div className="profile-menu-footer">
        <span className="profile-version-text">TaskFlow v3.0 Multi-User Pro</span>
      </div>
    </div>
  );
}
