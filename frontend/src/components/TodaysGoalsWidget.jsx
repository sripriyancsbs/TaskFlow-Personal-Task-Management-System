import React from 'react';
import { IconCheck, IconPlus, IconTasks } from './Icons';

export default function TodaysGoalsWidget({
  tasks = [],
  onToggleStatus,
  onOpenNewTask,
  isActionLoading,
}) {
  // Take up to 4 priorities as today's goals
  const goals = tasks.slice(0, 4);
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.status === 'Completed').length;
  const completionPercent = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  return (
    <div className="rail-widget todays-goals-widget">
      {/* Header */}
      <div className="goals-widget-header">
        <div className="goals-title-wrap">
          <IconTasks className="w-4 h-4 text-cyan-400" />
          <h4 className="goals-title">Today's Goals</h4>
        </div>
        <div className="goals-counter-info">
          <span>
            {completedGoals} of {totalGoals} completed
          </span>
          <span className="goals-pct-badge">{completionPercent}%</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="goals-progress-track">
        <div
          className="goals-progress-bar"
          style={{ width: `${completionPercent}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="goals-checklist">
        {goals.length === 0 ? (
          <div className="goals-empty-state">
            <p>No goals logged for today.</p>
          </div>
        ) : (
          goals.map((task) => {
            const isDone = task.status === 'Completed';
            return (
              <div
                key={task.id}
                className="goal-item-row"
                onClick={() => onToggleStatus(task)}
                role="checkbox"
                aria-checked={isDone}
                tabIndex={0}
              >
                <button
                  type="button"
                  className={`goal-checkbox ${isDone ? 'goal-checkbox-checked' : ''}`}
                  disabled={isActionLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStatus(task);
                  }}
                  aria-label={`Toggle status for ${task.title}`}
                >
                  {isDone && <IconCheck className="w-3 h-3 text-white" />}
                </button>
                <span className={`goal-text ${isDone ? 'goal-text-completed' : ''}`}>
                  {task.title}
                </span>
              </div>
            );
          })
        )}

        {/* Add goal button */}
        <button
          type="button"
          className="goal-add-link-btn"
          onClick={onOpenNewTask}
        >
          <IconPlus className="w-3.5 h-3.5 mr-1" />
          <span>Add a goal</span>
        </button>
      </div>
    </div>
  );
}
