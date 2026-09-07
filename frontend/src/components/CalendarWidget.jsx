import React, { useState, useMemo } from 'react';
import { IconChevronLeft, IconChevronRight } from './Icons';

export default function CalendarWidget({ tasks = [], onSelectDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Calculate calendar grid for current month
  const calendarData = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        dateString: new Date(year, month - 1, prevMonthDays - i).toISOString().slice(0, 10),
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      days.push({
        day: d,
        isCurrentMonth: true,
        dateString: new Date(year, month, d).toISOString().slice(0, 10),
      });
    }

    // Next month padding to fill complete weeks (35 or 42 cells)
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let n = 1; n <= remainingCells; n++) {
      days.push({
        day: n,
        isCurrentMonth: false,
        dateString: new Date(year, month + 1, n).toISOString().slice(0, 10),
      });
    }

    return days;
  }, [year, month]);

  // Set of dates with task deadlines from active tasks
  const taskDueDates = useMemo(() => {
    const dateMap = new Map();
    tasks.forEach((t) => {
      if (t.due_date) {
        const dStr = new Date(t.due_date).toISOString().slice(0, 10);
        dateMap.set(dStr, (dateMap.get(dStr) || 0) + 1);
      }
    });
    return dateMap;
  }, [tasks]);

  const todayStr = new Date().toISOString().slice(0, 10);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="rail-widget calendar-widget">
      {/* Calendar Header */}
      <div className="calendar-widget-header">
        <h4 className="calendar-month-title">
          {monthNames[month]} {year}
        </h4>
        <div className="calendar-nav-arrows">
          <button
            type="button"
            className="cal-arrow-btn"
            onClick={handlePrevMonth}
            title="Previous month"
            aria-label="Previous month"
          >
            <IconChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="cal-arrow-btn"
            onClick={handleNextMonth}
            title="Next month"
            aria-label="Next month"
          >
            <IconChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="calendar-weekdays-row">
        {daysOfWeek.map((day) => (
          <span key={day} className="cal-weekday-label">
            {day}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="calendar-days-grid">
        {calendarData.map((cell, idx) => {
          const isToday = cell.dateString === todayStr;
          const hasTasks = taskDueDates.has(cell.dateString);
          const taskCount = taskDueDates.get(cell.dateString) || 0;

          return (
            <button
              key={idx}
              type="button"
              className={`cal-day-cell ${
                !cell.isCurrentMonth ? 'day-outside-month' : ''
              } ${isToday ? 'day-is-today' : ''} ${
                hasTasks ? 'day-has-deadlines' : ''
              }`}
              onClick={() => onSelectDate?.(cell.dateString)}
              title={
                hasTasks
                  ? `${taskCount} task${taskCount > 1 ? 's' : ''} due on ${cell.dateString}`
                  : cell.dateString
              }
            >
              <span className="cal-day-number">{cell.day}</span>
              {hasTasks && !isToday && <span className="cal-deadline-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
