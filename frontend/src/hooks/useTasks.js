import { useState, useEffect, useCallback, useRef } from 'react';
import { taskService } from '../services/taskService';

const CACHE_KEY = 'taskflow_cached_tasks';

function getInitialTasks() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return [];
}

export function useTasks(toast) {
  const [tasks, setTasks] = useState(getInitialTasks);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, high_priority: 0 });
  const [loading, setLoading] = useState(() => getInitialTasks().length === 0);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('due_date');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Sync cache helper
  const updateCache = useCallback((updatedTasks) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(updatedTasks));
    } catch (e) {}
  }, []);

  // Stable ref for toast methods to avoid effect re-execution
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

  // Fetch metrics dynamically
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await taskService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  // Fetch tasks according to current sort order
  const fetchTasks = useCallback(async (showSkeleton = false) => {
    if (showSkeleton && tasks.length === 0) setLoading(true);
    try {
      const data = await taskService.getTasks({
        sort: sortBy,
      });
      setTasks(data);
      updateCache(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      toastRef.current?.error(err.message || 'Unable to load tasks from server.');
    } finally {
      setLoading(false);
    }
  }, [sortBy, tasks.length, updateCache]);

  // Trigger fetch whenever sort changes
  useEffect(() => {
    fetchTasks(true);
  }, [fetchTasks]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Create Task
  const handleCreateTask = async (taskData) => {
    setActionLoading(true);
    try {
      await taskService.createTask(taskData);
      toastRef.current?.success('Task created successfully.');
      setIsAddModalOpen(false);
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
    setActionLoading(true);
    try {
      await taskService.updateTask(id, taskData);
      toastRef.current?.success('Task updated successfully.');
      setEditingTask(null);
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
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    const originalTasks = [...tasks];
    const originalStats = { ...stats };

    setTasks((prev) => {
      const nextTasks = prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t));
      updateCache(nextTasks);
      return nextTasks;
    });
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
      fetchStats();
    } catch (err) {
      setTasks(originalTasks);
      updateCache(originalTasks);
      setStats(originalStats);
      toastRef.current?.error(err.message || 'Failed to update task status.');
    }
  };

  // Delete Task
  const handleDeleteTask = async (id) => {
    setActionLoading(true);
    const originalTasks = [...tasks];
    const originalStats = { ...stats };
    const taskToDelete = tasks.find((t) => t.id === id);

    setTasks((prev) => {
      const nextTasks = prev.filter((t) => t.id !== id);
      updateCache(nextTasks);
      return nextTasks;
    });
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
