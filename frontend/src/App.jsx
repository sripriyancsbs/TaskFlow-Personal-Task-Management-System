import React, { useState, useEffect, useMemo } from 'react';
import GlobalHeader from './components/GlobalHeader';
import Sidebar from './components/Sidebar';
import RightRail from './components/RightRail';
import MobileBottomNav from './components/MobileBottomNav';
import ProductivityHero from './components/ProductivityHero';
import StatsOverview from './components/StatsOverview';
import TodayFocus from './components/TodayFocus';
import TaskToolbar from './components/TaskToolbar';
import TaskList from './components/TaskList';
import TaskDetailPanel from './components/TaskDetailPanel';
import TaskModal from './components/TaskModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import ActivityTimeline from './components/ActivityTimeline';
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

  // Navigation: 'dashboard' | 'tasks' | 'today' | 'upcoming' | 'completed' | 'focus' | 'insights' | 'settings'
  const [activeNav, setActiveNav] = useState('dashboard');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'board' | 'focus'

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

  // Start Focus Mode from Today's Focus or Right Rail
  const handleStartFocus = (task) => {
    setFocusedTaskId(task.id);
    setViewMode('focus');
    toast.info(`Focus Sprint started: "${task.title.slice(0, 26)}..."`);
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

  // Filter tasks based on selected navigation tab
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
          upcomingCount={upcomingCount}
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
          <div className="reference-body-columns">
            {/* Center Main Productivity Workspace */}
            <main className="reference-center-workspace">
              {/* TAB 1: DASHBOARD (Full visual match to reference image) */}
              {activeNav === 'dashboard' && (
                <>
                  {/* Top Hero Banner matching reference */}
                  <ProductivityHero />

                  {/* 4 Horizontal Metric Cards matching reference */}
                  <StatsOverview stats={stats} />

                  {/* Today's Focus Card matching reference */}
                  <TodayFocus
                    tasks={tasks}
                    onStartFocus={handleStartFocus}
                    onToggleStatus={handleToggleStatus}
                    onOpenAddModal={() => setIsAddModalOpen(true)}
                    isActionLoading={actionLoading}
                  />

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

              {/* TAB 2: MY TASKS (Clean, dedicated tasks view without dashboard clutter) */}
              {activeNav === 'tasks' && (
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
              )}

              {/* TAB 3: TODAY (Today's Priorities) */}
              {activeNav === 'today' && (
                <section className="my-tasks-section-wrap" aria-label="Today's Priorities">
                  <div className="tab-dedicated-header">
                    <h2 className="tab-dedicated-title">Today's Priorities</h2>
                    <span className="tab-dedicated-badge">{displayedTasks.length} Due Today</span>
                  </div>

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
                    onResetFilters={() => setSearchQuery('')}
                    actionLoading={actionLoading}
                    focusedTaskId={focusedTaskId}
                    onSelectFocusedTaskId={(id) => setFocusedTaskId(id)}
                    onExitFocus={() => setViewMode('list')}
                  />
                </section>
              )}

              {/* TAB 4: UPCOMING (Upcoming Milestones) */}
              {activeNav === 'upcoming' && (
                <section className="my-tasks-section-wrap" aria-label="Upcoming Milestones">
                  <div className="tab-dedicated-header">
                    <h2 className="tab-dedicated-title">Upcoming Tasks</h2>
                    <span className="tab-dedicated-badge">{displayedTasks.length} Scheduled</span>
                  </div>

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
                    onResetFilters={() => setSearchQuery('')}
                    actionLoading={actionLoading}
                    focusedTaskId={focusedTaskId}
                    onSelectFocusedTaskId={(id) => setFocusedTaskId(id)}
                    onExitFocus={() => setViewMode('list')}
                  />
                </section>
              )}

              {/* TAB 5: COMPLETED (Completed Archive) */}
              {activeNav === 'completed' && (
                <section className="my-tasks-section-wrap" aria-label="Completed Archive">
                  <div className="tab-dedicated-header">
                    <h2 className="tab-dedicated-title">Completed Tasks</h2>
                    <span className="tab-dedicated-badge">{stats.completed} Completed</span>
                  </div>

                  <TaskList
                    tasks={tasks.filter((t) => t.status === 'Completed')}
                    loading={loading}
                    statusFilter="Completed"
                    priorityFilter={priorityFilter}
                    searchQuery={searchQuery}
                    hasAnyTasks={stats.completed > 0}
                    viewMode={viewMode}
                    onToggleStatus={handleToggleStatus}
                    onEdit={(task) => setEditingTask(task)}
                    onDelete={(task) => setDeletingTask(task)}
                    onSelectTask={(task) => setSelectedDetailTask(task)}
                    onStartFocus={handleStartFocus}
                    onOpenAddModal={() => setIsAddModalOpen(true)}
                    onResetFilters={() => setSearchQuery('')}
                    actionLoading={actionLoading}
                    focusedTaskId={focusedTaskId}
                    onSelectFocusedTaskId={(id) => setFocusedTaskId(id)}
                    onExitFocus={() => setViewMode('list')}
                  />
                </section>
              )}

              {/* TAB 6: FOCUS MODE (Distraction-Free Sprint) */}
              {activeNav === 'focus' && (
                <section className="my-tasks-section-wrap" aria-label="Focus Sprint">
                  <TaskList
                    tasks={tasks}
                    loading={loading}
                    statusFilter="Pending"
                    priorityFilter="All"
                    searchQuery=""
                    hasAnyTasks={stats.total > 0}
                    viewMode="focus"
                    onToggleStatus={handleToggleStatus}
                    onEdit={(task) => setEditingTask(task)}
                    onDelete={(task) => setDeletingTask(task)}
                    onSelectTask={(task) => setSelectedDetailTask(task)}
                    onStartFocus={handleStartFocus}
                    onOpenAddModal={() => setIsAddModalOpen(true)}
                    onResetFilters={() => {}}
                    actionLoading={actionLoading}
                    focusedTaskId={focusedTaskId}
                    onSelectFocusedTaskId={(id) => setFocusedTaskId(id)}
                    onExitFocus={() => setActiveNav('dashboard')}
                  />
                </section>
              )}

              {/* TAB 7: INSIGHTS */}
              {activeNav === 'insights' && (
                <section className="insights-view-stack" aria-label="Productivity Insights">
                  <div className="tab-dedicated-header">
                    <h2 className="tab-dedicated-title">Productivity Insights</h2>
                  </div>
                  <StatsOverview stats={stats} />
                  <ActivityTimeline
                    tasks={tasks}
                    onSelectTask={(t) => setSelectedDetailTask(t)}
                  />
                </section>
              )}

              {/* TAB 8: SETTINGS */}
              {activeNav === 'settings' && (
                <section className="settings-view-stack" aria-label="Settings">
                  <div className="tab-dedicated-header">
                    <h2 className="tab-dedicated-title">Settings & Preferences</h2>
                    <span className="tab-dedicated-badge">TaskFlow v2.4 Pro</span>
                  </div>

                  <div className="settings-card-group">
                    {/* Appearance */}
                    <div className="ref-metric-card" style={{ height: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <h4 style={{ fontWeight: 700, fontSize: '15px' }}>Appearance</h4>
                      <p style={{ color: 'var(--ref-text-secondary)', fontSize: '13px' }}>
                        Choose your interface theme. Current: <strong style={{ color: 'var(--ref-text-primary)' }}>{theme === 'dark' ? 'Dark Futuristic' : 'Sleek Light'}</strong>
                      </p>
                      <button
                        type="button"
                        className="btn-start-focus-electric"
                        onClick={toggleTheme}
                        style={{ alignSelf: 'flex-start' }}
                      >
                        {theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                      </button>
                    </div>

                    {/* Keyboard Controls */}
                    <div className="ref-metric-card" style={{ height: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <h4 style={{ fontWeight: 700, fontSize: '15px' }}>Keyboard Shortcuts</h4>
                      <p style={{ color: 'var(--ref-text-secondary)', fontSize: '13px' }}>
                        Press <kbd>N</kbd> new task, <kbd>Ctrl + K</kbd> command palette, <kbd>/</kbd> search, <kbd>?</kbd> modal.
                      </p>
                      <button
                        type="button"
                        className="btn-add-task-reference"
                        onClick={() => setIsShortcutsOpen(true)}
                        style={{ alignSelf: 'flex-start' }}
                      >
                        Open Shortcuts Cheatsheet
                      </button>
                    </div>

                    {/* Data Backup & Export */}
                    <div className="ref-metric-card" style={{ height: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <h4 style={{ fontWeight: 700, fontSize: '15px' }}>Data Backup</h4>
                      <p style={{ color: 'var(--ref-text-secondary)', fontSize: '13px' }}>
                        Export your tasks to portable formats for backup or reporting.
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="ref-status-pill pill-active-electric"
                          onClick={handleExportCSV}
                        >
                          Export CSV
                        </button>
                        <button
                          type="button"
                          className="ref-status-pill"
                          onClick={handleExportJSON}
                        >
                          Export JSON
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </main>

            {/* 3. Right Information Rail matching reference */}
            <RightRail
              tasks={tasks}
              onToggleStatus={handleToggleStatus}
              onOpenNewTask={() => setIsAddModalOpen(true)}
              onExpandFocusMode={() => setViewMode('focus')}
              onSelectCalendarDate={handleCalendarSelectDate}
              isActionLoading={actionLoading}
            />
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
