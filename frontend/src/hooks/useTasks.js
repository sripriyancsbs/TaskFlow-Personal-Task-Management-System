import { useState, useEffect, useCallback, useRef } from 'react';
import { taskService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';

export function useTasks(toast, onOpenAuthModal) {
  const { user, isAuthenticated, authLoading } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, high_priority: 0 });
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState(null);

  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('due_date');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Stable ref for toast methods
  const toastRef = useRef(toast);
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  // Modal dialog states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  // Debounce search input
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch metrics dynamically for the authenticated user
  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) {
      setStats({ total: 0, pending: 0, completed: 0, high_priority: 0 });
      return;
    }
    try {
      const statsData = await taskService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, [isAuthenticated]);

  // Fetch tasks for the authenticated user
  const fetchTasks = useCallback(async (showSkeleton = false) => {
    if (!isAuthenticated) {
      setTasks([]);
      setLoading(false);
      return;
    }

    if (showSkeleton) setLoading(true);
    try {
      const data = await taskService.getTasks({
        sort: sortBy,
      });
      setTasks(data || []);
      setServerError(null);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      const errorMsg = err.message || 'Unable to connect to the PostgreSQL database.';
      setServerError(errorMsg);
      toastRef.current?.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, sortBy]);

  // Trigger fetch whenever user authentication changes or sort changes
  useEffect(() => {
    if (!authLoading) {
      fetchTasks(true);
      fetchStats();
    }
  }, [authLoading, user?.id, fetchTasks, fetchStats]);

  // Create Task (Requires Authentication)
  const handleCreateTask = async (taskData) => {
    if (!isAuthenticated) {
      onOpenAuthModal?.('signin');
      toastRef.current?.info('Please sign in to create and save tasks.');
      return false;
    }

    setActionLoading(true);
    try {
      await taskService.createTask(taskData);
      toastRef.current?.success('Task created successfully.');
      setIsAddModalOpen(false);
      setServerError(null);
      await Promise.all([fetchTasks(false), fetchStats()]);
      return true;
    } catch (err) {
      toastRef.current?.error(err.message || 'Failed to create task.');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Update Task
  const handleUpdateTask = async (id, taskData) => {
    if (!isAuthenticated) return false;
    setActionLoading(true);
    try {
      await taskService.updateTask(id, taskData);
      toastRef.current?.success('Task updated successfully.');
      setEditingTask(null);
      setServerError(null);
      await Promise.all([fetchTasks(false), fetchStats()]);
      return true;
    } catch (err) {
      toastRef.current?.error(err.message || 'Failed to update task.');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Task Status (Pending <-> Completed) with optimistic update
  const handleToggleStatus = async (task) => {
    if (!isAuthenticated) return;
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    const originalTasks = [...tasks];
    const originalStats = { ...stats };

    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));
    setStats((prev) => ({
      ...prev,
      pending: newStatus === 'Pending' ? prev.pending + 1 : Math.max(0, prev.pending - 1),
      completed: newStatus === 'Completed' ? prev.completed + 1 : Math.max(0, prev.completed - 1),
    }));

    try {
      await taskService.updateTaskStatus(task.id, newStatus);
      toastRef.current?.success(
        newStatus === 'Completed' ? 'Task marked as completed.' : 'Task changed to pending.'
      );
      setServerError(null);
      fetchStats();
    } catch (err) {
      setTasks(originalTasks);
      setStats(originalStats);
      toastRef.current?.error(err.message || 'Failed to update task status.');
    }
  };

  // Delete Task with optimistic update
  const handleDeleteTask = async (id) => {
    if (!isAuthenticated) return false;
    setActionLoading(true);
    const originalTasks = [...tasks];
    const originalStats = { ...stats };
    const taskToDelete = tasks.find((t) => t.id === id);

    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (taskToDelete) {
      setStats((prev) => ({
        total: Math.max(0, prev.total - 1),
        pending: taskToDelete.status === 'Pending' ? Math.max(0, prev.pending - 1) : prev.pending,
        completed: taskToDelete.status === 'Completed' ? Math.max(0, prev.completed - 1) : prev.completed,
        high_priority:
          taskToDelete.priority === 'High' && taskToDelete.status === 'Pending'
            ? Math.max(0, prev.high_priority - 1)
            : prev.high_priority,
      }));
    }

    try {
      await taskService.deleteTask(id);
      toastRef.current?.success('Task deleted successfully.');
      setDeletingTask(null);
      setServerError(null);
      fetchStats();
      return true;
    } catch (err) {
      setTasks(originalTasks);
      setStats(originalStats);
      toastRef.current?.error(err.message || 'Failed to delete task.');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return {
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

    // Modals
    isAddModalOpen,
    setIsAddModalOpen,
    editingTask,
    setEditingTask,
    deletingTask,
    setDeletingTask,

    // Actions
    handleCreateTask,
    handleUpdateTask,
    handleToggleStatus,
    handleDeleteTask,
    refreshTasks: fetchTasks,
  };
}
