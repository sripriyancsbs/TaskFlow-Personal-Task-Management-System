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
import AuthModal from './components/AuthModal';

import { AuthProvider, useAuth } from './context/AuthContext';
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import { useTasks } from './hooks/useTasks';
import { exportToCSV, exportToJSON } from './utils/exportUtils';
import { formatDueDate } from './utils/dateUtils';

function TaskFlowApp() {
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const { user, isAuthenticated, authLoading } = useAuth();

  // Navigation: 'dashboard' | 'insights'
  const [activeNav, setActiveNav] = useState('dashboard');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'board'

  const [focusedTaskId, setFocusedTaskId] = useState(null);
  const [selectedDetailTask, setSelectedDetailTask] = useState(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Authentication Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('signin');

  const handleOpenAuthModal = (tab = 'signin') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  // Hook for tasks state and API actions
  const {
    tasks,
    stats,
    loading,
    serverError,
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
  } = useTasks(toast, handleOpenAuthModal);

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
        if (!isAuthenticated) {
          handleOpenAuthModal('signin');
          toast.info('Please sign in to create tasks.');
        } else {
          setIsAddModalOpen(true);
        }
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
        if (isAuthModalOpen) setIsAuthModalOpen(false);
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
    isAuthModalOpen,
    isAuthenticated,
  ]);

  // Derived counts for toolbar pills & widgets
  const todayCount = useMemo(() => {
    return tasks.filter((t) => {
      if (t.status !== 'Pending') return false;
      const info = formatDueDate(t.due_date, t.status);
      return Boolean(info?.isToday);
    }).length;
  }, [tasks]);

  // Filter tasks based on toolbar status/timeline pills, priority, calendar date, search, and sort
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

    // Specific Calendar Date Filter
    if (selectedCalendarDate) {
      list = list.filter((t) => {
        if (!t.due_date) return false;
        const d = new Date(t.due_date);
        const pad = (n) => String(n).padStart(2, '0');
        const dStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        return dStr === selectedCalendarDate;
      });
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
        if (!a.due_date && !b.due_date) {
          const pDiff = (weights[b.priority] || 2) - (weights[a.priority] || 2);
          if (pDiff !== 0) return pDiff;
          return new Date(b.created_at) - new Date(a.created_at);
        }
        if (!a.due_date && b.due_date) return -1;
        if (a.due_date && !b.due_date) return 1;

        const timeA = new Date(a.due_date).getTime();
        const timeB = new Date(b.due_date).getTime();
        if (timeA !== timeB) return timeA - timeB;
        return (weights[b.priority] || 2) - (weights[a.priority] || 2);
      }
      return 0;
    });

    return list;
  }, [tasks, statusFilter, priorityFilter, selectedCalendarDate, searchQuery, sortBy]);

  const handleExportCSV = () => {
    const ok = exportToCSV(tasks);
    if (ok) toast.success('Tasks exported to CSV.');
  };

  const handleExportJSON = () => {
    const ok = exportToJSON(tasks);
    if (ok) toast.success('Tasks exported to JSON.');
  };

  const handleCalendarSelectDate = (dateStr) => {
    if (selectedCalendarDate === dateStr) {
      setSelectedCalendarDate(null);
      toast.info('Calendar date filter cleared');
      return;
    }

    setSelectedCalendarDate(dateStr);

    const pad = (n) => String(n).padStart(2, '0');
    const matchCount = tasks.filter((t) => {
      if (!t.due_date) return false;
      const d = new Date(t.due_date);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` === dateStr;
    }).length;

    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const formatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (matchCount > 0) {
      toast.success(`Showing ${matchCount} task${matchCount > 1 ? 's' : ''} due on ${formatted}`);
    } else {
      toast.info(`No tasks scheduled for ${formatted}`);
    }
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
          onOpenNewTask={() => {
            if (!isAuthenticated) {
              handleOpenAuthModal('signin');
              toast.info('Please sign in to create tasks.');
            } else {
              setIsAddModalOpen(true);
            }
          }}
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
            onOpenAuthModal={handleOpenAuthModal}
          />

          {/* Body Columns: Center Workspace + Right Information Rail */}
          <div className={`reference-body-columns ${activeNav === 'insights' || viewMode === 'calendar' ? 'insights-fullwidth-columns' : ''}`}>
            {/* Center Main Productivity Workspace */}
            <main className="reference-center-workspace">
              {/* TAB 1: DASHBOARD (Home Command Center) */}
              {activeNav !== 'insights' && (
                <>
                  {/* Database / Backend Connection Alert Banner */}
                  {serverError && (
                    <div className="server-error-banner" role="alert">
                      <div className="server-error-icon">⚠️</div>
                      <div className="server-error-content">
                        <div className="server-error-title">Database Service Notice</div>
                        <div className="server-error-message">{serverError}</div>
                      </div>
                      <button
                        type="button"
                        className="server-error-retry-btn"
                        onClick={() => refreshTasks(true)}
                      >
                        Retry Connection
                      </button>
                    </div>
                  )}

                  {/* Top Hero Banner matching reference */}
                  <ProductivityHero onOpenAuthModal={handleOpenAuthModal} />

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
                      onOpenAddModal={() => {
                        if (!isAuthenticated) {
                          handleOpenAuthModal('signin');
                          toast.info('Please sign in to create tasks.');
                        } else {
                          setIsAddModalOpen(true);
                        }
                      }}
                      stats={stats}
                      todayCount={todayCount}
                    />

                    {/* Active Calendar Date Filter Banner */}
                    {selectedCalendarDate && (
                      <div className="active-date-filter-banner">
                        <div className="active-date-filter-info">
                          <span className="cal-filter-icon">📅</span>
                          <span>
                            Due on:{' '}
                            <strong>
                              {new Date(
                                selectedCalendarDate.split('-')[0],
                                selectedCalendarDate.split('-')[1] - 1,
                                selectedCalendarDate.split('-')[2]
                              ).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </strong>
                          </span>
                          <span className="cal-filter-count">
                            ({displayedTasks.length} {displayedTasks.length === 1 ? 'task' : 'tasks'})
                          </span>
                        </div>
                        <button
                          type="button"
                          className="cal-filter-clear-btn"
                          onClick={() => setSelectedCalendarDate(null)}
                          title="Clear date filter"
                        >
                          Clear Filter ✕
                        </button>
                      </div>
                    )}

                    <TaskList
                      tasks={displayedTasks}
                      loading={loading}
                      statusFilter={statusFilter}
                      priorityFilter={priorityFilter}
                      searchQuery={searchQuery}
                      selectedCalendarDate={selectedCalendarDate}
                      onClearCalendarDate={() => setSelectedCalendarDate(null)}
                      hasAnyTasks={stats.total > 0}
                      viewMode={viewMode}
                      onToggleStatus={handleToggleStatus}
                      onEdit={(task) => setEditingTask(task)}
                      onDelete={(task) => setDeletingTask(task)}
                      onSelectTask={(task) => setSelectedDetailTask(task)}
                      onStartFocus={handleStartFocus}
                      onOpenAddModal={() => {
                        if (!isAuthenticated) {
                          handleOpenAuthModal('signin');
                          toast.info('Please sign in to create tasks.');
                        } else {
                          setIsAddModalOpen(true);
                        }
                      }}
                      onResetFilters={() => {
                        setStatusFilter('All');
                        setPriorityFilter('All');
                        setSearchQuery('');
                        setSelectedCalendarDate(null);
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

            {/* 3. Right Information Rail */}
            {activeNav !== 'insights' && viewMode !== 'calendar' && (
              <RightRail
                tasks={tasks}
                selectedCalendarDate={selectedCalendarDate}
                onToggleStatus={handleToggleStatus}
                onOpenNewTask={() => {
                  if (!isAuthenticated) {
                    handleOpenAuthModal('signin');
                    toast.info('Please sign in to create tasks.');
                  } else {
                    setIsAddModalOpen(true);
                  }
                }}
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
        onOpenNewTask={() => {
          if (!isAuthenticated) {
            handleOpenAuthModal('signin');
            toast.info('Please sign in to create tasks.');
          } else {
            setIsAddModalOpen(true);
          }
        }}
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
        onDeleteTask={async (id) => {
          await handleDeleteTask(id);
          setSelectedDetailTask(null);
        }}
        onToggleStatus={handleToggleStatus}
        onStartFocus={handleStartFocus}
      />

      {/* Developer Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tasks={tasks}
        onOpenNewTask={() => {
          if (!isAuthenticated) {
            handleOpenAuthModal('signin');
            toast.info('Please sign in to create tasks.');
          } else {
            setIsAddModalOpen(true);
          }
        }}
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
        initialData={selectedCalendarDate ? { due_date: selectedCalendarDate } : null}
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

      {/* User Authentication Modal (Sign In / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        defaultTab={authModalTab}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => toast.success('Signed in successfully!')}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TaskFlowApp />
    </AuthProvider>
  );
}