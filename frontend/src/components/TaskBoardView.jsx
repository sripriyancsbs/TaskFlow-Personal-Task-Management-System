import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { IconPlus, IconCheck, IconRotateCcw } from './Icons';

export default function TaskBoardView({
  tasks = [],
  onToggleStatus,
  onEdit,
  onDelete,
  onCopyTitle,
  onSelectTask,
  onOpenAddModal,
  actionLoading,
}) {
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const pendingTasks = tasks.filter((t) => t.status === 'Pending');
  const completedTasks = tasks.filter((t) => t.status === 'Completed');

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('text/plain', String(task.id));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnStatus) {
      setDragOverColumn(columnStatus);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverColumn(null);
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskIdStr = e.dataTransfer.getData('text/plain');
    if (!taskIdStr) return;

    const taskId = Number(taskIdStr) || taskIdStr;
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== targetStatus) {
      // Trigger real status toggle to update backend
      onToggleStatus(task);
    }
  };

  return (
    <div className="kanban-command-board" aria-label="Kanban board">
      {/* Column 1: Pending */}
      <div
        className={`kanban-col col-pending ${
          dragOverColumn === 'Pending' ? 'col-drag-over' : ''
        }`}
        onDragOver={(e) => handleDragOver(e, 'Pending')}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, 'Pending')}
      >
        <div className="kanban-col-header">
          <div className="col-header-info">
            <span className="col-status-dot dot-pending" />
            <h3 className="col-status-title">Pending Priorities</h3>
            <span className="col-count-pill">{pendingTasks.length}</span>
          </div>

          <button
            type="button"
            className="col-add-btn"
            onClick={onOpenAddModal}
            title="Add task to Pending"
            aria-label="Add task to pending"
          >
            <IconPlus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="kanban-cards-container">
          {pendingTasks.length === 0 ? (
            <div className="kanban-empty-dropzone">
              <p>No pending tasks</p>
              <span>Drag completed tasks here to reactivate</span>
            </div>
          ) : (
            pendingTasks.map((task) => (
              <div key={task.id} className="kanban-card-wrapper">
                <TaskCard
                  task={task}
                  onToggleStatus={onToggleStatus}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onCopyTitle={onCopyTitle}
                  onSelectTask={onSelectTask}
                  isActionLoading={actionLoading}
                  isDraggable={true}
                  onDragStart={handleDragStart}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Column 2: Completed */}
      <div
        className={`kanban-col col-completed ${
          dragOverColumn === 'Completed' ? 'col-drag-over' : ''
        }`}
        onDragOver={(e) => handleDragOver(e, 'Completed')}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, 'Completed')}
      >
        <div className="kanban-col-header">
          <div className="col-header-info">
            <span className="col-status-dot dot-completed" />
            <h3 className="col-status-title">Completed Tasks</h3>
            <span className="col-count-pill pill-completed-count">
              {completedTasks.length}
            </span>
          </div>
        </div>

        <div className="kanban-cards-container">
          {completedTasks.length === 0 ? (
            <div className="kanban-empty-dropzone">
              <p>No completed tasks yet</p>
              <span>Drag pending tasks here when done</span>
            </div>
          ) : (
            completedTasks.map((task) => (
              <div key={task.id} className="kanban-card-wrapper">
                <TaskCard
                  task={task}
                  onToggleStatus={onToggleStatus}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onCopyTitle={onCopyTitle}
                  onSelectTask={onSelectTask}
                  isActionLoading={actionLoading}
                  isDraggable={true}
                  onDragStart={handleDragStart}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
