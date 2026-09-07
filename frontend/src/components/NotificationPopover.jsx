import React, { useMemo, useEffect, useRef } from 'react';
import { formatRelativeTime, formatDueDate } from '../utils/dateUtils';
import { IconCheck, IconPlus, IconClock, IconClose, IconFire } from './Icons';

export default function NotificationPopover({
  isOpen,
  onClose,
  tasks = [],
  onSelectTask,
}) {
  const popoverRef = useRef(null);

  // Derive real notifications from application state
  const notifications = useMemo(() => {
    const list = [];

    tasks.forEach((t) => {
      const dueInfo = formatDueDate(t.due_date, t.status);
      if (dueInfo?.isToday && t.status === 'Pending') {
        list.push({
          id: `due-${t.id}`,
          type: 'urgent',
          title: 'Priority Due Today',
          message: t.title,
          time: t.due_date,
          task: t,
        });
      }
      if (dueInfo?.isOverdue && t.status === 'Pending') {
        list.push({
          id: `overdue-${t.id}`,
          type: 'overdue',
          title: 'Overdue Task',
          message: t.title,
          time: t.due_date,
          task: t,
        });
      }
      if (t.status === 'Completed') {
        list.push({
          id: `completed-${t.id}`,
          type: 'completed',
          title: 'Task Completed',
          message: t.title,
          time: t.created_at,
          task: t,
        });
      } else {
        list.push({
          id: `created-${t.id}`,
          type: 'created',
          title: 'Task in Queue',
          message: t.title,
          time: t.created_at,
          task: t,
        });
      }
    });

    // Sort by timestamp descending, top 6
    return list
      .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0))
      .slice(0, 6);
  }, [tasks]);

  // Handle outside click & Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="notification-popover" ref={popoverRef} role="dialog" aria-label="Notifications">
      <div className="notification-popover-header">
        <div className="notification-title-wrap">
          <h4 className="notif-title">Notifications</h4>
          <span className="notif-count-pill">{notifications.length}</span>
        </div>
        <button
          type="button"
          className="notif-close-btn"
          onClick={onClose}
          aria-label="Close notifications"
        >
          <IconClose className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="notification-items-list">
        {notifications.length === 0 ? (
          <div className="notif-empty-state">
            <p>No notifications right now.</p>
            <span>Your workflow is calm and on schedule.</span>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className="notif-item"
              onClick={() => {
                onSelectTask?.(item.task);
                onClose();
              }}
              role="button"
              tabIndex={0}
            >
              <div className={`notif-icon-circle notif-${item.type}`}>
                {item.type === 'urgent' || item.type === 'overdue' ? (
                  <IconFire className="w-3.5 h-3.5 text-rose-400" />
                ) : item.type === 'completed' ? (
                  <IconCheck className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <IconPlus className="w-3.5 h-3.5 text-cyan-400" />
                )}
              </div>

              <div className="notif-content">
                <div className="notif-row-top">
                  <span className="notif-category">{item.title}</span>
                  <span className="notif-time">{formatRelativeTime(item.time)}</span>
                </div>
                <p className="notif-message">{item.message}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="notification-popover-footer">
        <button
          type="button"
          className="notif-mark-read-btn"
          onClick={onClose}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
