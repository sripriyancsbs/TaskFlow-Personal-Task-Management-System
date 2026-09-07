import React, { useState, useMemo } from 'react';
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconCheck,
  IconFire,
  IconClock,
} from './Icons';
import { formatDate } from '../utils/dateUtils';

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
  // Current viewing month and year (defaults to current date)
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
    <div className="task-calendar-view" aria-label="Schedule Calendar View">
      {/* Calendar Header Navigation */}
      <div className="calendar-nav-toolbar">
        <div className="calendar-nav-left">
          <h4 className="calendar-month-title">
            {MONTH_NAMES[month]} <span className="calendar-year-text">{year}</span>
          </h4>
          <span className="calendar-month-task-count">
            {monthTasksCount} {monthTasksCount === 1 ? 'task' : 'tasks'} scheduled
          </span>
        </div>

        <div className="calendar-nav-actions">
          <button
            type="button"
            className="calendar-btn-today"
            onClick={handleGoToday}
            title="Jump to today"
          >
            Today
          </button>

          <div className="calendar-month-arrows">
            <button
              type="button"
              className="calendar-arrow-btn"
              onClick={handlePrevMonth}
              title="Previous Month"
              aria-label="Previous Month"
            >
              <IconChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="calendar-arrow-btn"
              onClick={handleNextMonth}
              title="Next Month"
              aria-label="Next Month"
            >
              <IconChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            className="calendar-btn-new-task"
            onClick={onOpenAddModal}
            title="Create task"
          >
            <IconPlus className="w-3.5 h-3.5 mr-1" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Weekday Header Row */}
      <div className="calendar-weekdays-row" role="row">
        {WEEKDAYS.map((day) => (
          <div key={day} className="calendar-weekday-cell" role="columnheader">
            {day}
          </div>
        ))}
      </div>

      {/* Days Matrix Grid */}
      <div className="calendar-grid-matrix" role="grid" aria-label="Month Calendar">
        {calendarData.cells.map((cell, idx) => (
          <div
            key={`${cell.dateKey}-${idx}`}
            className={`calendar-day-cell ${
              cell.isCurrentMonth ? 'day-in-month' : 'day-out-of-month'
            } ${cell.isToday ? 'day-is-today' : ''} ${
              cell.tasks.length > 0 ? 'day-has-tasks' : ''
            }`}
          >
            <div className="day-header">
              <span className={`day-number ${cell.isToday ? 'today-badge' : ''}`}>
                {cell.dayNum}
              </span>
              {cell.tasks.length > 0 && (
                <span className="day-task-count-pill">{cell.tasks.length}</span>
              )}
            </div>

            <div className="day-tasks-container">
              {cell.tasks.map((task) => {
                const isCompleted = task.status === 'Completed';
                return (
                  <div
                    key={task.id}
                    className={`calendar-task-chip priority-${task.priority.toLowerCase()} ${
                      isCompleted ? 'chip-completed' : 'chip-pending'
                    }`}
                    onClick={() => onSelectTask(task)}
                    title={`${task.title} (${task.priority} Priority - ${task.status})`}
                  >
                    <button
                      type="button"
                      className="chip-status-check"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStatus(task);
                      }}
                      aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
                    >
                      {isCompleted ? (
                        <IconCheck className="w-3 h-3" />
                      ) : (
                        <span className={`chip-dot dot-${task.priority.toLowerCase()}`} />
                      )}
                    </button>
                    <span className="chip-task-title">{task.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Unscheduled Tasks Drawer */}
      {calendarData.unscheduledTasks.length > 0 && (
        <div className="calendar-unscheduled-section">
          <div className="unscheduled-header">
            <div className="unscheduled-title-wrap">
              <IconClock className="w-4 h-4 text-amber-500 mr-2" />
              <h5 className="unscheduled-title">Tasks Without Due Date</h5>
              <span className="unscheduled-count">
                {calendarData.unscheduledTasks.length}
              </span>
            </div>
            <span className="unscheduled-subtitle">
              Click any task to inspect details or assign a deadline
            </span>
          </div>

          <div className="unscheduled-chips-row">
            {calendarData.unscheduledTasks.map((task) => {
              const isCompleted = task.status === 'Completed';
              return (
                <div
                  key={task.id}
                  className={`unscheduled-task-badge priority-${task.priority.toLowerCase()} ${
                    isCompleted ? 'badge-completed' : ''
                  }`}
                  onClick={() => onSelectTask(task)}
                  title={`${task.title} (${task.priority} Priority)`}
                >
                  <button
                    type="button"
                    className="unscheduled-check-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStatus(task);
                    }}
                  >
                    {isCompleted ? (
                      <IconCheck className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <span className={`chip-dot dot-${task.priority.toLowerCase()}`} />
                    )}
                  </button>
                  <span className="unscheduled-task-name">{task.title}</span>
                  <span className={`unscheduled-priority-tag tag-${task.priority.toLowerCase()}`}>
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
