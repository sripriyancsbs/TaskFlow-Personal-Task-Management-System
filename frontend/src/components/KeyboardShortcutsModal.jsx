import React, { useEffect } from 'react';

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

  const shortcuts = [
    { key: '/', desc: 'Quickly focus search bar' },
    { key: 'N', desc: 'Open "+ Add Task" modal' },
    { key: 'D', desc: 'Toggle Dark / Light mode' },
    { key: '?', desc: 'Open this shortcuts guide' },
    { key: 'Esc', desc: 'Close any active modal dialogue' },
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
              Keyboard Shortcuts
            </h3>
            <p className="modal-subtitle">Supercharge your productivity workflow</p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close shortcuts guide"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="shortcuts-list">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="shortcut-row">
              <span className="shortcut-desc">{s.desc}</span>
              <kbd className="shortcut-kbd">{s.key}</kbd>
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
