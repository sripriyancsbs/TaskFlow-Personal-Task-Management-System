import React, { useState, useEffect, useMemo, useCallback } from 'react';
import GlobalHeader from './components/GlobalHeader';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/MobileBottomNav';
import ProductivityHero from './components/ProductivityHero';
import TodayFocus from './components/TodayFocus';
import StatsOverview from './components/StatsOverview';
import ActivityTimeline from './components/ActivityTimeline';
import TaskToolbar from './components/TaskToolbar';
import TaskList from './components/TaskList';
import TaskDetailPanel from './components/TaskDetailPanel';
import TaskModal from './components/TaskModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import CommandPalette from './components/CommandPalette';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import ToastContainer from './components/ToastContainer';

import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import { useTasks } from './hooks/useTasks';
import { exportToCSV, exportToJSON } from './utils/exportUtils';
import { formatDueDate } from './utils/dateUtils';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();

  // Navigation and Workspace state
  const [activeNav, setActiveNav] = useState('overview'); // 'overview' | 'tasks' | 'today' | 'upcoming' | 'completed'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('taskflow_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem('taskflow_view_mode') || 'list';
    } catch {
      return 'list';
    }
  });

  const [focusedTaskId, setFocusedTaskId] = useState(null);
  const [selectedDetailTask, setSelectedDetailTask] = useState(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);

  // Hook for tasks state and API actions
  const {
    tasks,
    stats,
    loading,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    actionLoading,

    isAddModalOpen,
    setIsAddModalOpen,
    editingTask,
    setEditingTask,
    deletingTask,
    setDeletingTask,

    handleCreateTask,
    handleUpdateTask,
    handleToggleStatus,
    handleDeleteTask,
    refreshTasks,
  } = useTasks(toast);

  // Keep selectedDetailTask in sync if tasks list updates
  useEffect(() => {
    if (selectedDetailTask) {
      const refreshed = tasks.find((t) => t.id === selectedDetailTask.id);
      if (refreshed) {
        setSelectedDetailTask(refreshed);
      }
    }
  }, [tasks]);

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('taskflow_sidebar_collapsed', String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('taskflow_view_mode', mode);
    } catch {
      // Ignore
    }
  };

  // Switch navigation tabs
  const handleSelectNav = (navId) => {
    setActiveNav(navId);
    if (navId === 'completed') {
      setStatusFilter('Completed');
    } else if (navId === 'today' || navId === 'upcoming') {
      setStatusFilter('Pending');
    } else if (navId === 'tasks') {
      setStatusFilter('All');
    }
  };

  // Launch focus sprint from Today's Focus or details drawer
  const handleStartFocus = (task) => {
    setFocusedTaskId(task.id);
    setActiveNav('tasks');
    handleViewModeChange('focus');
    toast.info(`Focus Sprint started for: "${task.title.slice(0, 28)}..."`);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      // Command palette: Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // If user is actively typing in an input or textarea, don't trigger single-letter hotkeys
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsAddModalOpen(true);
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        toggleTheme();
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setActiveNav('tasks');
        handleViewModeChange('list');
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        setActiveNav('tasks');
        handleViewModeChange('board');
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setActiveNav('tasks');
        handleViewModeChange('focus');
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      } else if (e.key === 'Escape') {
        if (selectedDetailTask) setSelectedDetailTask(null);
        if (isCommandPaletteOpen) setIsCommandPaletteOpen(false);
        if (isShortcutsOpen) setIsShortcutsOpen(false);
        if (viewMode === 'focus') handleViewModeChange('list');
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    toggleTheme,
    setIsAddModalOpen,
    viewMode,
    selectedDetailTask,
    isCommandPaletteOpen,
    isShortcutsOpen,
  ]);

  // Derived counts for sidebar badges
  const todayCount = useMemo(() => {
    return tasks.filter((t) => {
      if (t.status !== 'Pending') return false;
      const info = formatDueDate(t.due_date, t.status);
      return info?.isToday || info?.isOverdue;
    }).length;
  }, [tasks]);

  const upcomingCount = useMemo(() => {
    return tasks.filter((t) => {
      if (t.status !== 'Pending') return false;
      const info = formatDueDate(t.due_date, t.status);
      return info?.isUpcoming || info?.isTomorrow;
    }).length;
  }, [tasks]);

  // Filter tasks displayed when in specific nav views (Today / Upcoming)
  const displayedTasks = useMemo(() => {
    if (activeNav === 'today') {
      return tasks.filter((t) => {
        const info = formatDueDate(t.due_date, t.status);
        return info?.isToday || info?.isOverdue;
      });
    }
    if (activeNav === 'upcoming') {
      return tasks.filter((t) => {
        const info = formatDueDate(t.due_date, t.status);
        return info?.isUpcoming || info?.isTomorrow;
      });
    }
    return tasks;
  }, [tasks, activeNav]);

  const handleResetFilters = () => {
    setStatusFilter('All');
    setPriorityFilter('All');
    setSearchQuery('');
  };

  const handleExportCSV = () => {
    const ok = exportToCSV(tasks);
    if (ok) {
      toast.success('Tasks exported to CSV successfully.');
    } else {
      toast.error('No tasks available to export.');
    }
  };

  const handleExportJSON = () => {
    const ok = exportToJSON(tasks);
    if (ok) {
      toast.success('Tasks exported to JSON successfully.');
    } else {
      toast.error('No tasks available to export.');
    }
  };

  const handleCopyTitle = (title) => {
    toast.info(`Copied to clipboard: "${title.slice(0, 25)}${title.length > 25 ? '...' : ''}"`);
  };

  return (
    <div className="command-app-shell">
      {/* Toast Notifications */}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      {/* Global Command Center Header */}
      <GlobalHeader
        theme={theme}
        toggleTheme={toggleTheme}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onToggleActivity={() => setIsActivityOpen((prev) => !prev)}
        hasRecentActivity={tasks.length > 0}
        pendingCount={stats.pending}
      />

      {/* Main App Layout: Sidebar + Workspace */}
      <div className="app-body-layout">
        <Sidebar
          activeNav={activeNav}
          onSelectNav={handleSelectNav}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebarCollapse}
          stats={stats}
          todayCount={todayCount}
          upcomingCount={upcomingCount}
          onOpenNewTask={() => setIsAddModalOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
        />

        {/* Main Central Workspace */}
        <main className="main-command-workspace">
          {/* VIEW: OVERVIEW */}
          {activeNav === 'overview' && (
            <div className="overview-container">
              {/* Dynamic Productivity Hero */}
              <ProductivityHero stats={stats} />

              {/* Today's Focus Priority Card */}
              <TodayFocus
                tasks={tasks}
                onStartFocus={handleStartFocus}
                onToggleStatus={handleToggleStatus}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                isActionLoading={actionLoading}
              />

              {/* Command Metrics Strip */}
              <StatsOverview stats={stats} />

              {/* Real Activity Timeline */}
              <ActivityTimeline
                tasks={tasks}
                onSelectTask={(task) => setSelectedDetailTask(task)}
              />
            </div>
          )}

          {/* VIEW: MY TASKS / TODAY / UPCOMING / COMPLETED */}
          {activeNav !== 'overview' && (
            <div className="task-workspace-container">
              {/* Workspace Toolbar */}
              <TaskToolbar
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                priorityFilter={priorityFilter}
                setPriorityFilter={setPriorityFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                viewMode={viewMode}
                setViewMode={handleViewModeChange}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                totalMatching={displayedTasks.length}
                onResetFilters={handleResetFilters}
              />

              {/* Task Feed / Board / Focus View */}
              <TaskList
                tasks={displayedTasks}
                loading={loading}
                statusFilter={statusFilter}
                priorityFilter={priorityFilter}
                searchQuery={searchQuery}
                hasAnyTasks={stats.total > 0}
                viewMode={viewMode}
                onToggleStatus={handleToggleStatus}
                onEdit={(task) => setEditingTask(task)}
                onDelete={(task) => setDeletingTask(task)}
                onCopyTitle={handleCopyTitle}
                onSelectTask={(task) => setSelectedDetailTask(task)}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onResetFilters={handleResetFilters}
                actionLoading={actionLoading}
                focusedTaskId={focusedTaskId}
                onSelectFocusedTaskId={(id) => setFocusedTaskId(id)}
                onExitFocus={() => handleViewModeChange('list')}
              />
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Dock (viewports <= 768px) */}
      <MobileBottomNav
        activeNav={activeNav}
        onSelectNav={handleSelectNav}
        onOpenNewTask={() => setIsAddModalOpen(true)}
        stats={stats}
      />

      {/* Right Slide-In Task Detail Panel */}
      <TaskDetailPanel
        task={selectedDetailTask}
        isOpen={Boolean(selectedDetailTask)}
        onClose={() => setSelectedDetailTask(null)}
        onUpdateTask={async (id, data) => {
          const ok = await handleUpdateTask(id, data);
          if (ok && selectedDetailTask) {
            setSelectedDetailTask((prev) => ({ ...prev, ...data }));
          }
        }}
        onToggleStatus={async (task) => {
          await handleToggleStatus(task);
        }}
        onDeleteTask={(task) => {
          setSelectedDetailTask(null);
          setDeletingTask(task);
        }}
        onStartFocus={(task) => handleStartFocus(task)}
        isSaving={actionLoading}
      />

      {/* Developer Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tasks={tasks}
        onOpenNewTask={() => setIsAddModalOpen(true)}
        onSelectViewMode={(mode) => {
          setActiveNav('tasks');
          handleViewModeChange(mode);
        }}
        onSelectStatusFilter={(st) => {
          setActiveNav('tasks');
          setStatusFilter(st);
        }}
        onSelectTask={(task) => setSelectedDetailTask(task)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onToggleTheme={toggleTheme}
        theme={theme}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
      />

      {/* New Task Composer Modal */}
      <TaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateTask}
        isSaving={actionLoading}
      />

      {/* Edit Task Modal (fallback or direct edit) */}
      <TaskModal
        isOpen={Boolean(editingTask)}
        initialData={editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={(data) => handleUpdateTask(editingTask.id, data)}
        isSaving={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingTask)}
        task={deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteTask}
        isDeleting={actionLoading}
      />

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
