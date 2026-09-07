import React, { useEffect } from 'react';
import { IconClose } from './Icons';

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcutGroups = [
    {
      group: 'General & Command',
      items: [
        { key: 'Ctrl + K', desc: 'Open Developer Command Palette' },
        { key: '/', desc: 'Quickly focus search bar' },
        { key: 'D', desc: 'Toggle Dark / Light theme' },
        { key: '?', desc: 'Open this shortcuts guide' },
        { key: 'Esc', desc: 'Close any active modal, panel, or focus mode' },
      ],
    },
    {
      group: 'Task Actions',
      items: [
        { key: 'N', desc: 'Create new task composer' },
        { key: 'Ctrl + ↵', desc: 'Submit and save task in composer/editor' },
        { key: 'L', desc: 'Switch to List view' },
        { key: 'B', desc: 'Switch to Kanban Board view' },
        { key: 'F', desc: 'Switch to Focus sprint mode' },
      ],
    },
  ];

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
    >
      <div className="modal-dialog-card shortcuts-dialog-card">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h3 id="shortcuts-modal-title" className="modal-title">
              Command Center Shortcuts
            </h3>
            <p className="modal-subtitle">High-velocity keyboard controls for power users</p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close shortcuts guide"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>

        <div className="shortcuts-list">
          {shortcutGroups.map((grp, gIdx) => (
            <div key={gIdx} className="shortcut-group-block">
              <span className="shortcut-group-title">{grp.group}</span>
              {grp.items.map((s, idx) => (
                <div key={idx} className="shortcut-row">
                  <span className="shortcut-desc">{s.desc}</span>
                  <kbd className="shortcut-kbd">{s.key}</kbd>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="modal-actions-row">
          <button type="button" className="btn-primary" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
