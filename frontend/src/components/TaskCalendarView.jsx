import React, { useState, useMemo } from 'react';
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconCheck,
  IconClock,
} from './Icons';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function TaskCalendarView({
  tasks = [],
  onToggleStatus,
  onSelectTask,
  onOpenAddModal,
  actionLoading = false,
}) {
  // Current viewing month and year
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleGoToday = () => {
    setCurrentDate(new Date());
  };

  // Build calendar matrix
  const calendarData = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const today = new Date();
    const isThisCurrentMonth =
      today.getFullYear() === year && today.getMonth() === month;

    // Group tasks by "YYYY-MM-DD"
    const tasksByDate = {};
    const unscheduledTasks = [];

    tasks.forEach((t) => {
      if (!t.due_date) {
        unscheduledTasks.push(t);
        return;
      }
      const d = new Date(t.due_date);
      if (isNaN(d.getTime())) {
        unscheduledTasks.push(t);
        return;
      }
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!tasksByDate[key]) {
        tasksByDate[key] = [];
      }
      tasksByDate[key].push(t);
    });

    const cells = [];

    // 1. Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const key = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}`;
      cells.push({
        dayNum,
        isCurrentMonth: false,
        isToday: false,
        dateKey: key,
        tasks: tasksByDate[key] || [],
      });
    }

    // 2. Current month days
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const isToday = isThisCurrentMonth && today.getDate() === day;
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        dayNum: day,
        isCurrentMonth: true,
        isToday,
        dateKey: key,
        tasks: tasksByDate[key] || [],
      });
    }

    // 3. Next month leading days to complete grid rows
    const totalSlots = Math.ceil(cells.length / 7) * 7;
    const remaining = totalSlots - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const key = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
      cells.push({
        dayNum: i,
        isCurrentMonth: false,
        isToday: false,
        dateKey: key,
        tasks: tasksByDate[key] || [],
      });
    }

    return { cells, unscheduledTasks };
  }, [tasks, year, month]);

  const monthTasksCount = useMemo(() => {
    let count = 0;
    calendarData.cells.forEach((cell) => {
      if (cell.isCurrentMonth) {
        count += cell.tasks.length;
      }
    });
    return count;
  }, [calendarData]);

  return (
    <div className="sched-cal-container" aria-label="Schedule Calendar View">
      {/* Calendar Header Navigation */}
      <div className="sched-cal-nav">
        <div className="sched-cal-nav-left">
          <h3 className="sched-cal-title">
            {MONTH_NAMES[month]} <span className="sched-cal-year">{year}</span>
          </h3>
          <span className="sched-cal-badge">
            {monthTasksCount} {monthTasksCount === 1 ? 'task' : 'tasks'} scheduled
          </span>
        </div>

        <div className="sched-cal-controls">
          <button
            type="button"
            className="sched-cal-today-btn"
            onClick={handleGoToday}
            title="Jump to current date"
          >
            Today
          </button>

          <div className="sched-cal-nav-arrows">
            <button
              type="button"
              className="sched-cal-nav-btn"
              onClick={handlePrevMonth}
              title="Previous Month"
              aria-label="Previous Month"
            >
              <IconChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="sched-cal-nav-btn"
              onClick={handleNextMonth}
              title="Next Month"
              aria-label="Next Month"
            >
              <IconChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            className="sched-cal-add-btn"
            onClick={onOpenAddModal}
            title="Create new task"
          >
            <IconPlus className="w-3.5 h-3.5 mr-1" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Weekday Columns Header */}
      <div className="sched-cal-weekdays" role="row">
        {WEEKDAYS.map((day) => (
          <div key={day} className="sched-cal-weekday-col" role="columnheader">
            {day}
          </div>
        ))}
      </div>

      {/* 7x5 Days Matrix Grid */}
      <div className="sched-cal-matrix" role="grid" aria-label="Monthly Schedule Grid">
        {calendarData.cells.map((cell, idx) => (
          <div
            key={`${cell.dateKey}-${idx}`}
            className={`sched-cal-cell ${
              cell.isCurrentMonth ? 'sched-cell-current-month' : 'sched-cell-other-month'
            } ${cell.isToday ? 'sched-cell-is-today' : ''}`}
          >
            <div className="sched-cell-header">
              <span className={`sched-cell-num ${cell.isToday ? 'sched-today-circle' : ''}`}>
                {cell.dayNum}
              </span>
              {cell.tasks.length > 0 && (
                <span className="sched-cell-count">{cell.tasks.length}</span>
              )}
            </div>

            <div className="sched-cell-tasks">
              {cell.tasks.map((task) => {
                const isCompleted = task.status === 'Completed';
                const p = (task.priority || 'Medium').toLowerCase();

                return (
                  <div
                    key={task.id}
                    className={`sched-task-chip priority-${p} ${
                      isCompleted ? 'sched-chip-completed' : ''
                    }`}
                    onClick={() => onSelectTask(task)}
                    title={`${task.title} (${task.priority} Priority - ${task.status})`}
                  >
                    <button
                      type="button"
                      className="sched-chip-check"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStatus(task);
                      }}
                      disabled={actionLoading}
                      aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
                    >
                      {isCompleted ? (
                        <IconCheck className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <span className={`sched-chip-dot dot-${p}`} />
                      )}
                    </button>
                    <span className="sched-chip-title">{task.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Unscheduled Tasks Section */}
      {calendarData.unscheduledTasks.length > 0 && (
        <div className="sched-unscheduled-drawer">
          <div className="sched-unscheduled-header">
            <div className="sched-unscheduled-title-wrap">
              <IconClock className="w-4 h-4 text-amber-500 mr-2" />
              <h4 className="sched-unscheduled-heading">Tasks Without Due Date</h4>
              <span className="sched-unscheduled-badge">
                {calendarData.unscheduledTasks.length}
              </span>
            </div>
            <span className="sched-unscheduled-hint">
              Click any task to view details or set a deadline
            </span>
          </div>

          <div className="sched-unscheduled-items">
            {calendarData.unscheduledTasks.map((task) => {
              const isCompleted = task.status === 'Completed';
              const p = (task.priority || 'Medium').toLowerCase();

              return (
                <div
                  key={task.id}
                  className={`sched-unscheduled-card priority-${p} ${
                    isCompleted ? 'card-completed' : ''
                  }`}
                  onClick={() => onSelectTask(task)}
                  title={`${task.title} (${task.priority} Priority)`}
                >
                  <button
                    type="button"
                    className="sched-unscheduled-check"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStatus(task);
                    }}
                    disabled={actionLoading}
                  >
                    {isCompleted ? (
                      <IconCheck className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <span className={`sched-chip-dot dot-${p}`} />
                    )}
                  </button>
                  <span className="sched-unscheduled-name">{task.title}</span>
                  <span className={`sched-priority-pill pill-${p}`}>
                    {task.priority}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
