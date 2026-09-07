import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DashboardGreeting from './components/DashboardGreeting';
import StatsOverview from './components/StatsOverview';
import TaskToolbar from './components/TaskToolbar';
import TaskList from './components/TaskList';
import TaskModal from './components/TaskModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import ToastContainer from './components/ToastContainer';

import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import { useTasks } from './hooks/useTasks';
import { exportToCSV, exportToJSON } from './utils/exportUtils';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem('taskflow_view_mode') || 'list';
    } catch {
      return 'list';
    }
  });

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('taskflow_view_mode', mode);
    } catch {
      // Ignore
    }
  };

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

  // Global Keyboard Shortcuts (N for New, D for Dark, ? for Help, B for Board toggle)
  useEffect(() => {
    function handleKeyDown(e) {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        return;
      }
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsAddModalOpen(true);
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        toggleTheme();
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        handleViewModeChange(viewMode === 'list' ? 'board' : 'list');
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme, setIsAddModalOpen, viewMode]);

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
    toast.info(`Copied "${title.slice(0, 30)}${title.length > 30 ? '...' : ''}" to clipboard.`);
  };

  return (
    <div className="app-layout">
      {/* Toast Notifications */}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      {/* App Navigation Header */}
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        tasksCount={tasks.length}
      />

      {/* Main Content Dashboard */}
      <main className="main-content-container">
        {/* Personalized Greeting */}
        <DashboardGreeting />

        {/* Dynamic Statistics Cards with Gauge */}
        <StatsOverview stats={stats} />

        {/* Task Management Section */}
        <section className="task-management-section" aria-label="Task Management">
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
            stats={stats}
          />

          <TaskList
            tasks={tasks}
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
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onResetFilters={handleResetFilters}
            actionLoading={actionLoading}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <p className="footer-copyright">
            TaskFlow Pro &copy; {new Date().getFullYear()} — Engineered with React, Vite, Express & PostgreSQL.
          </p>
        </div>
      </footer>

      {/* Add Task Modal */}
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

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
