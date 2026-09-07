import React, { useState, useMemo } from 'react';
import { IconChevronLeft, IconChevronRight } from './Icons';

const pad = (n) => String(n).padStart(2, '0');
const formatLocalDate = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

export default function CalendarWidget({ tasks = [], onSelectDate, selectedDate = null }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Calculate calendar grid for current month using local dates
  const calendarData = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month padding
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonth = month === 0 ? 11 : month - 1;
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dNum = prevMonthDays - i;
      days.push({
        day: dNum,
        isCurrentMonth: false,
        dateString: formatLocalDate(prevYear, prevMonth, dNum),
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      days.push({
        day: d,
        isCurrentMonth: true,
        dateString: formatLocalDate(year, month, d),
      });
    }

    // Next month padding to fill complete weeks (35 or 42 cells)
    const nextYear = month === 11 ? year + 1 : year;
    const nextMonth = month === 11 ? 0 : month + 1;
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let n = 1; n <= remainingCells; n++) {
      days.push({
        day: n,
        isCurrentMonth: false,
        dateString: formatLocalDate(nextYear, nextMonth, n),
      });
    }

    return days;
  }, [year, month]);

  // Set of dates with task deadlines from active tasks (using local date strings)
  const taskDueDates = useMemo(() => {
    const dateMap = new Map();
    tasks.forEach((t) => {
      if (t.due_date) {
        const d = new Date(t.due_date);
        const dStr = formatLocalDate(d.getFullYear(), d.getMonth(), d.getDate());
        dateMap.set(dStr, (dateMap.get(dStr) || 0) + 1);
      }
    });
    return dateMap;
  }, [tasks]);

  const now = new Date();
  const todayStr = formatLocalDate(now.getFullYear(), now.getMonth(), now.getDate());

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
          const isSelected = cell.dateString === selectedDate;
          const hasTasks = taskDueDates.has(cell.dateString);
          const taskCount = taskDueDates.get(cell.dateString) || 0;

          return (
            <button
              key={idx}
              type="button"
              className={`cal-day-cell ${
                !cell.isCurrentMonth ? 'day-outside-month' : ''
              } ${isToday ? 'day-is-today' : ''} ${
                isSelected ? 'day-is-selected' : ''
              } ${hasTasks ? 'day-has-deadlines' : ''}`}
              onClick={() => onSelectDate?.(cell.dateString)}
              title={
                hasTasks
                  ? `${taskCount} task${taskCount > 1 ? 's' : ''} due on ${cell.dateString}`
                  : cell.dateString
              }
            >
              <span className="cal-day-number">{cell.day}</span>
              {hasTasks && !isToday && !isSelected && <span className="cal-deadline-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}