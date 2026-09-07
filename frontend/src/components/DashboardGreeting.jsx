import React from 'react';
import { getTimeBasedGreeting } from '../utils/dateUtils';

export default function DashboardGreeting() {
  const greeting = getTimeBasedGreeting();
  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <section className="dashboard-greeting-section" aria-label="Dashboard Greeting">
      <div className="greeting-content">
        <div className="greeting-pill-date">
          <span className="live-dot"></span>
          <span>{todayStr}</span>
        </div>
        <h1 className="greeting-heading">{greeting}</h1>
        <p className="greeting-subtext">Stay organized and keep moving forward.</p>
      </div>
    </section>
  );
}
