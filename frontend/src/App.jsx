import React from 'react';
import Header from './components/Header';
import DashboardGreeting from './components/DashboardGreeting';
import StatsOverview from './components/StatsOverview';
import TaskToolbar from './components/TaskToolbar';
import TaskList from './components/TaskList';
import TaskModal from './components/TaskModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import ToastContainer from './components/ToastContainer';

import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import { useTasks } from './hooks/useTasks';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const {
    tasks,
    stats,
    loading,
    statusFilter,
    setStatusFilter,
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

  const handleResetFilters = () => {
    setStatusFilter('All');
    setSearchQuery('');
  };

  return (
    <div className="app-layout">
      {/* Toast Notifications */}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      {/* App Navigation Header */}
      <Header theme={theme} toggleTheme={toggleTheme} />

      {/* Main Content Dashboard */}
      <main className="main-content-container">
        {/* Personalized Greeting */}
        <DashboardGreeting />

        {/* Dynamic Statistics Cards */}
        <StatsOverview stats={stats} />

        {/* Task Management Section */}
        <section className="task-management-section" aria-label="Task Management">
          <TaskToolbar
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            stats={stats}
          />

          <TaskList
            tasks={tasks}
            loading={loading}
            statusFilter={statusFilter}
            searchQuery={searchQuery}
            hasAnyTasks={stats.total > 0}
            onToggleStatus={handleToggleStatus}
            onEdit={(task) => setEditingTask(task)}
            onDelete={(task) => setDeletingTask(task)}
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
            TaskFlow &copy; {new Date().getFullYear()} — Personal Task Management System. Built with React, Vite, Express & PostgreSQL.
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
    </div>
  );
}
