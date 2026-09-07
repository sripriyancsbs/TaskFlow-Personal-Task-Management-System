import React, { useState, useEffect, useMemo } from 'react';
import GlobalHeader from './components/GlobalHeader';
import Sidebar from './components/Sidebar';
import RightRail from './components/RightRail';
import MobileBottomNav from './components/MobileBottomNav';
import ProductivityHero from './components/ProductivityHero';
import TaskToolbar from './components/TaskToolbar';
import TaskList from './components/TaskList';
import TaskDetailPanel from './components/TaskDetailPanel';
import TaskModal from './components/TaskModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import InsightsView from './components/InsightsView';
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

  // Navigation: 'dashboard' | 'insights'
  const [activeNav, setActiveNav] = useState('dashboard');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'board'

  const [focusedTaskId, setFocusedTaskId] = useState(null);
  const [selectedDetailTask, setSelectedDetailTask] = useState(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

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
  } = useTasks(toast);

  // Sync selectedDetailTask if tasks update
  useEffect(() => {
    if (selectedDetailTask) {
      const refreshed = tasks.find((t) => t.id === selectedDetailTask.id);
      if (refreshed) {
        setSelectedDetailTask(refreshed);
      }
    }
  }, [tasks]);

  // Handle navigation selection
  const handleSelectNav = (navId) => {
    setActiveNav(navId);
    setSelectedDetailTask(null);
    if (navId === 'completed') {
      setStatusFilter('Completed');
    } else if (navId === 'today' || navId === 'upcoming') {
      setStatusFilter('Pending');
    } else if (navId === 'tasks' || navId === 'dashboard') {
      setStatusFilter('All');
    } else if (navId === 'focus') {
      setViewMode('focus');
    }
  };

  // Start focus action
  const handleStartFocus = (task) => {
    setFocusedTaskId(task.id);
    toast.info(`Focusing on: "${task.title.slice(0, 28)}..."`);
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

      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsAddModalOpen(true);
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        toggleTheme();
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      } else if (e.key === 'Escape') {
        if (selectedDetailTask) setSelectedDetailTask(null);
        if (isCommandPaletteOpen) setIsCommandPaletteOpen(false);
        if (isShortcutsOpen) setIsShortcutsOpen(false);
        if (viewMode === 'focus') setViewMode('list');
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

  // Derived counts for toolbar pills & widgets
  const todayCount = useMemo(() => {
    return tasks.filter((t) => {
      if (t.status !== 'Pending') return false;
      const info = formatDueDate(t.due_date, t.status);
      return Boolean(info?.isToday);
    }).length;
  }, [tasks]);

  // Filter tasks based on toolbar status/timeline pills, priority, search, and sort
  const displayedTasks = useMemo(() => {
    let list = [...tasks];

    // Status / Timeline Filter from pills
    if (statusFilter === 'Pending') {
      list = list.filter((t) => t.status === 'Pending');
    } else if (statusFilter === 'Completed') {
      list = list.filter((t) => t.status === 'Completed');
    } else if (statusFilter === 'Today') {
      list = list.filter((t) => {
        const info = formatDueDate(t.due_date, t.status);
        return Boolean(info?.isToday);
      });
    }

    // Priority filter
    if (priorityFilter && priorityFilter !== 'All') {
      list = list.filter((t) => t.priority === priorityFilter);
    }

    // Search query
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Sort order
    list.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      if (sortBy === 'priority') {
        const weights = { High: 3, Medium: 2, Low: 1 };
        return (weights[b.priority] || 2) - (weights[a.priority] || 2);
      }
      if (sortBy === 'due_date' || sortBy === 'dueDate') {
        const weights = { High: 3, Medium: 2, Low: 1 };
        // Both have no due date: order by priority (High > Medium > Low), then newest created
        if (!a.due_date && !b.due_date) {
          const pDiff = (weights[b.priority] || 2) - (weights[a.priority] || 2);
          if (pDiff !== 0) return pDiff;
          return new Date(b.created_at) - new Date(a.created_at);
        }
        // Task without due date appears on top
        if (!a.due_date && b.due_date) return -1;
        if (a.due_date && !b.due_date) return 1;

        // Both have due dates: sort chronologically (earliest first)
        const timeA = new Date(a.due_date).getTime();
        const timeB = new Date(b.due_date).getTime();
        if (timeA !== timeB) return timeA - timeB;
        return (weights[b.priority] || 2) - (weights[a.priority] || 2);
      }
      return 0;
    });

    return list;
  }, [tasks, statusFilter, priorityFilter, searchQuery, sortBy]);

  const handleExportCSV = () => {
    const ok = exportToCSV(tasks);
    if (ok) toast.success('Tasks exported to CSV.');
  };

  const handleExportJSON = () => {
    const ok = exportToJSON(tasks);
    if (ok) toast.success('Tasks exported to JSON.');
  };

  const handleCalendarSelectDate = (dateStr) => {
    setSearchQuery(dateStr);
    toast.info(`Filtered tasks for date: ${dateStr}`);
  };

  return (
    <div className="reference-app-root">
      {/* Toast Notifications */}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      {/* 3-Column Shell Structure */}
      <div className="reference-layout-shell">
        {/* 1. Left Sidebar */}
        <Sidebar
          activeNav={activeNav}
          onSelectNav={handleSelectNav}
          stats={stats}
          todayCount={todayCount}
          onOpenNewTask={() => setIsAddModalOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
        />

        {/* 2. Main Center & Header Area */}
        <div className="reference-content-frame">
          {/* Top Slim Header */}
          <GlobalHeader
            theme={theme}
            toggleTheme={toggleTheme}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onOpenShortcuts={() => setIsShortcutsOpen(true)}
            tasks={tasks}
            onSelectTask={(t) => setSelectedDetailTask(t)}
          />

          {/* Body Columns: Center Workspace + Right Information Rail */}
          <div className={`reference-body-columns ${activeNav === 'insights' ? 'insights-fullwidth-columns' : ''}`}>
            {/* Center Main Productivity Workspace */}
            <main className="reference-center-workspace">
              {/* TAB 1: DASHBOARD (Home Command Center) */}
              {activeNav !== 'insights' && (
                <>
                  {/* Top Hero Banner matching reference */}
                  <ProductivityHero />

                  {/* My Tasks Section */}
                  <section className="my-tasks-section-wrap" aria-label="My Tasks Workspace">
                    <TaskToolbar
                      statusFilter={statusFilter}
                      setStatusFilter={setStatusFilter}
                      priorityFilter={priorityFilter}
                      setPriorityFilter={setPriorityFilter}
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      viewMode={viewMode}
                      setViewMode={setViewMode}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      onOpenAddModal={() => setIsAddModalOpen(true)}
                      stats={stats}
                      todayCount={todayCount}
                    />

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
                      onSelectTask={(task) => setSelectedDetailTask(task)}
                      onStartFocus={handleStartFocus}
                      onOpenAddModal={() => setIsAddModalOpen(true)}
                      onResetFilters={() => {
                        setStatusFilter('All');
                        setPriorityFilter('All');
                        setSearchQuery('');
                      }}
                      actionLoading={actionLoading}
                      focusedTaskId={focusedTaskId}
                      onSelectFocusedTaskId={(id) => setFocusedTaskId(id)}
                      onExitFocus={() => setViewMode('list')}
                    />
                  </section>
                </>
              )}

              {/* TAB 2: INSIGHTS (Comprehensive Productivity Analytics & Activity) */}
              {activeNav === 'insights' && (
                <InsightsView
                  tasks={tasks}
                  stats={stats}
                  onSelectTask={(t) => setSelectedDetailTask(t)}
                  onExportCSV={handleExportCSV}
                  onExportJSON={handleExportJSON}
                />
              )}
            </main>

            {/* 3. Right Information Rail (rendered on Dashboard) */}
            {activeNav !== 'insights' && (
              <RightRail
                tasks={tasks}
                onToggleStatus={handleToggleStatus}
                onOpenNewTask={() => setIsAddModalOpen(true)}
                onExpandFocusMode={() => setViewMode('focus')}
                onSelectCalendarDate={handleCalendarSelectDate}
                isActionLoading={actionLoading}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation (<= 768px) */}
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
          setViewMode(mode);
        }}
        onSelectStatusFilter={(st) => {
          setStatusFilter(st);
        }}
        onSelectTask={(task) => setSelectedDetailTask(task)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onToggleTheme={toggleTheme}
        theme={theme}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
      />

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateTask}
        isSaving={actionLoading}
      />

      {/* Edit Task Modal */}
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

      {/* Keyboard Shortcuts Cheatsheet Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
