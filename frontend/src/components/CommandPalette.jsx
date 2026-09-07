import React, { useState, useEffect, useRef } from 'react';
import {
  IconSearch,
  IconPlus,
  IconList,
  IconBoard,
  IconFocus,
  IconToday,
  IconCompleted,
  IconSun,
  IconMoon,
  IconSettings,
  IconChevronRight,
} from './Icons';

export default function CommandPalette({
  isOpen,
  onClose,
  tasks = [],
  onOpenNewTask,
  onSelectViewMode,
  onSelectStatusFilter,
  onSelectTask,
  onOpenShortcuts,
  onToggleTheme,
  theme,
  onExportCSV,
  onExportJSON,
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Commands definition
  const staticCommands = [
    {
      id: 'new-task',
      label: 'Create new task',
      category: 'Actions',
      icon: <IconPlus className="w-4 h-4 text-cyan-400" />,
      shortcut: 'N',
      run: () => {
        onClose();
        onOpenNewTask();
      },
    },
    {
      id: 'view-list',
      label: 'Switch to List View',
      category: 'Views',
      icon: <IconList className="w-4 h-4 text-indigo-400" />,
      shortcut: 'L',
      run: () => {
        onClose();
        onSelectViewMode('list');
      },
    },
    {
      id: 'view-board',
      label: 'Switch to Kanban Board View',
      category: 'Views',
      icon: <IconBoard className="w-4 h-4 text-violet-400" />,
      shortcut: 'B',
      run: () => {
        onClose();
        onSelectViewMode('board');
      },
    },
    {
      id: 'view-focus',
      label: 'Switch to Focus Sprint Mode',
      category: 'Views',
      icon: <IconFocus className="w-4 h-4 text-emerald-400" />,
      shortcut: 'F',
      run: () => {
        onClose();
        onSelectViewMode('focus');
      },
    },
    {
      id: 'filter-pending',
      label: 'Show Pending Tasks',
      category: 'Filters',
      icon: <IconToday className="w-4 h-4 text-amber-400" />,
      run: () => {
        onClose();
        onSelectStatusFilter('Pending');
      },
    },
    {
      id: 'filter-completed',
      label: 'Show Completed Tasks',
      category: 'Filters',
      icon: <IconCompleted className="w-4 h-4 text-emerald-400" />,
      run: () => {
        onClose();
        onSelectStatusFilter('Completed');
      },
    },
    {
      id: 'filter-all',
      label: 'Show All Tasks',
      category: 'Filters',
      icon: <IconList className="w-4 h-4 text-muted" />,
      run: () => {
        onClose();
        onSelectStatusFilter('All');
      },
    },
    {
      id: 'toggle-theme',
      label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      category: 'Preferences',
      icon: theme === 'dark' ? <IconSun className="w-4 h-4 text-amber-400" /> : <IconMoon className="w-4 h-4 text-indigo-400" />,
      shortcut: 'D',
      run: () => {
        onClose();
        onToggleTheme();
      },
    },
    {
      id: 'open-shortcuts',
      label: 'Keyboard Shortcuts Cheatsheet',
      category: 'Help',
      icon: <IconSettings className="w-4 h-4 text-muted" />,
      shortcut: '?',
      run: () => {
        onClose();
        onOpenShortcuts();
      },
    },
    {
      id: 'export-csv',
      label: 'Export Tasks to CSV',
      category: 'Data',
      icon: <IconChevronRight className="w-4 h-4 text-muted" />,
      run: () => {
        onClose();
        onExportCSV?.();
      },
    },
    {
      id: 'export-json',
      label: 'Export Tasks to JSON',
      category: 'Data',
      icon: <IconChevronRight className="w-4 h-4 text-muted" />,
      run: () => {
        onClose();
        onExportJSON?.();
      },
    },
  ];

  // Filter commands by query
  const matchingCommands = staticCommands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  // Filter tasks by query
  const matchingTasks = query.trim()
    ? tasks
        .filter((t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          (t.description && t.description.toLowerCase().includes(query.toLowerCase()))
        )
        .slice(0, 5)
        .map((t) => ({
          id: `task-${t.id}`,
          label: t.title,
          category: `Task (${t.status})`,
          icon: <IconToday className="w-4 h-4 text-cyan-400" />,
          isTask: true,
          task: t,
          run: () => {
            onClose();
            onSelectTask(t);
          },
        }))
    : [];

  const combinedItems = [...matchingCommands, ...matchingTasks];

  // Keyboard navigation inside palette (ArrowDown, ArrowUp, Enter, Escape)
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, combinedItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + combinedItems.length) % Math.max(1, combinedItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = combinedItems[selectedIndex];
      if (selected) {
        selected.run();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="command-palette-backdrop" onClick={onClose}>
      <div
        className="command-palette-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Command Palette"
      >
        {/* Search Bar */}
        <div className="palette-input-wrap">
          <IconSearch className="palette-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="palette-input"
            placeholder="Type a command or search tasks..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            aria-label="Command search"
          />
          <kbd className="palette-esc-hint">ESC</kbd>
        </div>

        {/* Commands / Results List */}
        <div className="palette-results-list" ref={listRef}>
          {combinedItems.length === 0 ? (
            <div className="palette-empty-state">
              <p>No matching commands or tasks found.</p>
              <span>Try typing "task", "view", or "filter"</span>
            </div>
          ) : (
            combinedItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  className={`palette-item ${isSelected ? 'palette-item-selected' : ''}`}
                  onClick={() => item.run()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="palette-item-left">
                    <span className="palette-item-icon">{item.icon}</span>
                    <span className="palette-item-title">{item.label}</span>
                  </div>

                  <div className="palette-item-right">
                    <span className="palette-item-category">{item.category}</span>
                    {item.shortcut && (
                      <kbd className="palette-shortcut-badge">{item.shortcut}</kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="palette-footer">
          <div className="palette-footer-hint">
            <span>Use</span> <kbd>&uarr;</kbd> <kbd>&darr;</kbd> <span>to navigate</span>
            <span>&bull;</span> <kbd>&crarr;</kbd> <span>to select</span>
            <span>&bull;</span> <kbd>esc</kbd> <span>to dismiss</span>
          </div>
        </div>
      </div>
    </div>
  );
}
