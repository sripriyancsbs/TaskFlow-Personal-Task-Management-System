import { useState, useEffect, useCallback, useRef } from 'react';
import { taskService, ApiError } from '../services/taskService';

export function useTasks(toast) {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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

  // Fetch metrics dynamically
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await taskService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  // Fetch tasks according to current filter and debounced search
  const fetchTasks = useCallback(async (showSkeleton = false) => {
    if (showSkeleton) setLoading(true);
    try {
      const data = await taskService.getTasks({
        status: statusFilter,
        search: debouncedSearch,
      });
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      toast.error(err.message || 'Unable to load tasks from server.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch, toast]);

  // Initial load
  useEffect(() => {
    fetchTasks(true);
    fetchStats();
  }, [fetchTasks, fetchStats]);

  // Create Task
  const handleCreateTask = async (taskData) => {
    setActionLoading(true);
    try {
      const newTask = await taskService.createTask(taskData);
      toast.success('Task created successfully.');
      setIsAddModalOpen(false);
      // Refresh list and stats
      await Promise.all([fetchTasks(false), fetchStats()]);
      return true;
    } catch (err) {
      toast.error(err.message || 'Failed to create task.');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Update Task
  const handleUpdateTask = async (id, taskData) => {
    setActionLoading(true);
    try {
      const updated = await taskService.updateTask(id, taskData);
      toast.success('Task updated successfully.');
      setEditingTask(null);
      // Refresh list and stats
      await Promise.all([fetchTasks(false), fetchStats()]);
      return true;
    } catch (err) {
      toast.error(err.message || 'Failed to update task.');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Task Status (Pending <-> Completed) with optimistic update
  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    const originalTasks = [...tasks];
    const originalStats = { ...stats };

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );
    setStats((prev) => ({
      ...prev,
      pending: newStatus === 'Pending' ? prev.pending + 1 : Math.max(0, prev.pending - 1),
      completed: newStatus === 'Completed' ? prev.completed + 1 : Math.max(0, prev.completed - 1),
    }));

    try {
      await taskService.updateTaskStatus(task.id, newStatus);
      toast.success(
        newStatus === 'Completed' ? 'Task marked as completed.' : 'Task changed to pending.'
      );
      // Fetch latest stats to ensure consistency
      fetchStats();
    } catch (err) {
      // Revert on error
      setTasks(originalTasks);
      setStats(originalStats);
      toast.error(err.message || 'Failed to update task status.');
    }
  };

  // Delete Task
  const handleDeleteTask = async (id) => {
    setActionLoading(true);
    const originalTasks = [...tasks];
    const originalStats = { ...stats };
    const taskToDelete = tasks.find((t) => t.id === id);

    // Optimistically remove
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (taskToDelete) {
      setStats((prev) => ({
        total: Math.max(0, prev.total - 1),
        pending: taskToDelete.status === 'Pending' ? Math.max(0, prev.pending - 1) : prev.pending,
        completed: taskToDelete.status === 'Completed' ? Math.max(0, prev.completed - 1) : prev.completed,
      }));
    }

    try {
      await taskService.deleteTask(id);
      toast.success('Task deleted successfully.');
      setDeletingTask(null);
      fetchStats();
      return true;
    } catch (err) {
      // Rollback
      setTasks(originalTasks);
      setStats(originalStats);
      toast.error(err.message || 'Failed to delete task.');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    tasks,
    stats,
    loading,
    statusFilter,
    setStatusFilter,
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
