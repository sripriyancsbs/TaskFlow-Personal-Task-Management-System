import React from 'react';
import CalendarWidget from './CalendarWidget';
import TodaysGoalsWidget from './TodaysGoalsWidget';

export default function RightRail({
  tasks = [],
  onToggleStatus,
  onOpenNewTask,
  onExpandFocusMode,
  onSelectCalendarDate,
  selectedCalendarDate = null,
  isActionLoading,
}) {
  return (
    <aside className="right-information-rail" aria-label="Productivity Widgets">
      {/* 1. Monthly Calendar */}
      <CalendarWidget
        tasks={tasks}
        selectedDate={selectedCalendarDate}
        onSelectDate={onSelectCalendarDate}
      />

      {/* 3. Today's Goals Widget */}
      <TodaysGoalsWidget
        tasks={tasks}
        onToggleStatus={onToggleStatus}
        onOpenNewTask={onOpenNewTask}
        isActionLoading={isActionLoading}
      />

      {/* 4. Small Motivational Quote Card */}
      <div className="rail-widget quote-widget">
        <div className="quote-leaf-icon-wrap">
          <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 20A7 7 0 0 1 4 13C4 7 11 3 11 3s7 4 7 10a7 7 0 0 1-7 7z" />
            <path d="M11 20v-9" />
          </svg>
        </div>
        <p className="quote-text">
          &ldquo;A more organized you, a brighter tomorrow.&rdquo;
        </p>
      </div>
    </aside>
  );
}