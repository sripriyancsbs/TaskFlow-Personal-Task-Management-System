import React, { useState, useEffect, useMemo } from 'react';
import {
  IconPlay,
  IconPause,
  IconRotateCcw,
  IconCheck,
  IconClose,
  IconFire,
  IconFocus,
} from './Icons';
import { formatDueDate } from '../utils/dateUtils';

const DEFAULT_FOCUS_SECONDS = 25 * 60; // 25 minutes

export default function TaskFocusView({
  tasks = [],
  focusedTaskId,
  onSelectFocusedTaskId,
  onToggleStatus,
  onExitFocus,
  isActionLoading,
}) {
  const pendingTasks = useMemo(
    () => tasks.filter((t) => t.status === 'Pending'),
    [tasks]
  );

  // Find the active task
  const activeTask = useMemo(() => {
    if (focusedTaskId) {
      const found = tasks.find((t) => t.id === focusedTaskId);
      if (found) return found;
    }
    return pendingTasks[0] || tasks[0] || null;
  }, [tasks, focusedTaskId, pendingTasks]);

  // Native JavaScript Focus Timer (25:00)
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_FOCUS_SECONDS);
  const [isRunning, setIsRunning] = useState(false);

  // Interval timer tick
  useEffect(() => {
    let interval = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  // Reset timer if active task changes
  useEffect(() => {
    setSecondsLeft(DEFAULT_FOCUS_SECONDS);
    setIsRunning(false);
  }, [activeTask?.id]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const timerProgress = ((DEFAULT_FOCUS_SECONDS - secondsLeft) / DEFAULT_FOCUS_SECONDS) * 100;

  const handleTogglePlay = () => {
    if (secondsLeft === 0) setSecondsLeft(DEFAULT_FOCUS_SECONDS);
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(DEFAULT_FOCUS_SECONDS);
  };

  const handleAddFiveMin = () => {
    setSecondsLeft((prev) => prev + 300);
  };

  const handleCompleteActive = async () => {
    if (!activeTask) return;
    await onToggleStatus(activeTask);
    setIsRunning(false);
  };

  const dueDateInfo = activeTask ? formatDueDate(activeTask.due_date, activeTask.status) : null;

  return (
    <div className="focus-mode-viewport" aria-label="Distraction-free focus mode">
      {/* Top Bar: Exit + Task Switcher */}
      <div className="focus-mode-topbar">
        <div className="focus-topbar-left">
          <div className="focus-mode-badge">
            <IconFocus className="w-4 h-4 text-cyan-400 mr-2" />
            <span>FOCUS SPRINT</span>
          </div>

          {/* Quick task selector */}
          {pendingTasks.length > 1 && (
            <div className="focus-task-switcher-wrap">
              <label htmlFor="focus-task-select" className="sr-only">Switch Task</label>
              <select
                id="focus-task-select"
                className="focus-task-select"
                value={activeTask?.id || ''}
                onChange={(e) => onSelectFocusedTaskId?.(Number(e.target.value))}
              >
                {pendingTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button
          type="button"
          className="focus-exit-btn"
          onClick={onExitFocus}
          title="Exit focus mode (Esc or L)"
        >
          <IconClose className="w-4 h-4 mr-1.5" />
          <span>Exit Focus</span>
        </button>
      </div>

      {/* Main Focus Centerpiece */}
      <div className="focus-center-stage">
        {activeTask ? (
          <div className="focus-card-grand">
            {/* Meta row */}
            <div className="focus-grand-meta">
              <span className={`priority-badge priority-badge-${(activeTask.priority || 'medium').toLowerCase()}`}>
                {activeTask.priority === 'High' && <IconFire className="w-3 h-3 mr-1 text-rose-400" />}
                {activeTask.priority || 'Medium'} Priority
              </span>
              {dueDateInfo && (
                <span className="due-date-pill pill-today">
                  {dueDateInfo.text}
                </span>
              )}
            </div>

            {/* Task Title */}
            <h1 className="focus-grand-title">{activeTask.title}</h1>

            {/* Task Description */}
            {activeTask.description && (
              <p className="focus-grand-desc">{activeTask.description}</p>
            )}

            {/* Grand Timer Display */}
            <div className="focus-timer-cluster">
              <div className="timer-display-ring">
                <span className="timer-clock-text font-mono">{timeFormatted}</span>
                <span className="timer-mode-caption">
                  {isRunning ? 'SPRINT IN PROGRESS' : secondsLeft === 0 ? 'SESSION COMPLETE' : 'READY TO SPRINT'}
                </span>
              </div>

              {/* Progress bar underneath timer */}
              <div className="timer-progress-track">
                <div
                  className="timer-progress-bar"
                  style={{ width: `${timerProgress}%` }}
                />
              </div>

              {/* Timer Controls */}
              <div className="timer-controls-row">
                <button
                  type="button"
                  className={`btn-timer-toggle ${isRunning ? 'btn-timer-running' : 'btn-timer-paused'}`}
                  onClick={handleTogglePlay}
                  title={isRunning ? 'Pause timer' : 'Start sprint'}
                >
                  {isRunning ? (
                    <>
                      <IconPause className="w-5 h-5 mr-2" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <IconPlay className="w-5 h-5 mr-2" />
                      <span>Start</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn-timer-aux"
                  onClick={handleReset}
                  title="Reset to 25:00"
                >
                  <IconRotateCcw className="w-4 h-4 mr-1.5" />
                  <span>Reset</span>
                </button>

                <button
                  type="button"
                  className="btn-timer-aux"
                  onClick={handleAddFiveMin}
                  title="Add 5 minutes"
                >
                  <span>+5 min</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="focus-completion-row">
              <button
                type="button"
                className="btn-complete-sprint"
                onClick={handleCompleteActive}
                disabled={isActionLoading || activeTask.status === 'Completed'}
              >
                <IconCheck className="w-5 h-5 mr-2" />
                <span>
                  {activeTask.status === 'Completed'
                    ? 'Task Already Completed'
                    : 'Complete Task & Wrap Sprint'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="focus-empty-stage">
            <h2 className="focus-empty-title">No pending tasks to focus on</h2>
            <p className="focus-empty-desc">
              All your tasks are marked completed. Create a new task to launch your next focus sprint.
            </p>
            <button
              type="button"
              className="btn-new-task-primary"
              onClick={onExitFocus}
            >
              Return to Workspace
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
