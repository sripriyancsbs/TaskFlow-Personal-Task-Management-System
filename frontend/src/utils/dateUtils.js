/**
 * Format ISO date string into a user-friendly format (e.g., 'Sep 7, 2026')
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatDate(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Format due dates with smart relative statuses (Overdue, Due Today, Due Tomorrow)
 * @param {string|Date} dateInput
 * @param {string} status - 'Pending' | 'Completed'
 * @returns {Object} { text, isOverdue, isToday, isTomorrow, isUpcoming }
 */
export function formatDueDate(dateInput, status = 'Pending') {
  if (!dateInput) return null;
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return null;

  const now = new Date();
  // Strip times to compare calendar dates
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const isCompleted = status === 'Completed';
    return {
      text: isCompleted ? `Was due ${formatDate(date)}` : `Overdue (${Math.abs(diffDays)}d ago)`,
      isOverdue: !isCompleted,
      isToday: false,
      isTomorrow: false,
      isUpcoming: false,
    };
  }

  if (diffDays === 0) {
    return {
      text: 'Due Today',
      isOverdue: false,
      isToday: true,
      isTomorrow: false,
      isUpcoming: false,
    };
  }

  if (diffDays === 1) {
    return {
      text: 'Due Tomorrow',
      isOverdue: false,
      isToday: false,
      isTomorrow: true,
      isUpcoming: false,
    };
  }

  return {
    text: `Due ${formatDate(date)}`,
    isOverdue: false,
    isToday: false,
    isTomorrow: false,
    isUpcoming: true,
  };
}

/**
 * Dynamic greeting according to time of day
 */
export function getTimeBasedGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning 👋';
  if (hour < 18) return 'Good afternoon ☀️';
  return 'Good evening 🌙';
}

export function formatFullTodayDate() {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
}

/**
 * Format timestamp into human-readable relative time (e.g. '10m ago', '2h ago', 'Yesterday')
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatRelativeTime(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 45) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDate(date);
}
