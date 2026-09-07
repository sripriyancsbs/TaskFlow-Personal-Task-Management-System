import React, { useEffect, useRef } from 'react';
import { IconSettings, IconSun, IconMoon, IconClose } from './Icons';

export default function UserProfileDropdown({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  onOpenShortcuts,
}) {
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

  return (
    <div className="user-profile-menu" ref={menuRef} role="menu" aria-label="User Account">
      {/* Header Info */}
      <div className="profile-menu-header">
        <div className="profile-menu-avatar">
          <span>S</span>
        </div>
        <div className="profile-menu-info">
          <span className="profile-name">Sripriyan</span>
          <span className="profile-role">Lead Architect</span>
        </div>
      </div>

      <div className="profile-menu-divider" />

      {/* Menu Options */}
      <div className="profile-menu-list">
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
      </div>

      <div className="profile-menu-divider" />

      <div className="profile-menu-footer">
        <span className="profile-version-text">TaskFlow v2.4 Pro</span>
      </div>
    </div>
  );
}
