import React, { useMemo } from 'react';
import { formatRelativeTime } from '../utils/dateUtils';
import { IconCheck, IconPlus, IconClock } from './Icons';

export default function ActivityTimeline({ tasks = [], onSelectTask }) {
  // Derive real activity log from task creation & completion timestamps
  const activities = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    const events = [];

    // Map real tasks to chronological activity items
    tasks.forEach((task) => {
      if (task.status === 'Completed') {
        events.push({
          id: `completed-${task.id}`,
          type: 'completed',
          title: task.title,
          timestamp: task.created_at,
          task,
        });
      } else {
        events.push({
          id: `created-${task.id}`,
          type: 'created',
          title: task.title,
          timestamp: task.created_at,
          task,
        });
      }
    });

    // Sort by timestamp descending
    return events
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 6);
  }, [tasks]);

  return (
    <div className="activity-timeline-panel">
      <div className="timeline-header">
        <div className="timeline-title-wrap">
          <IconClock className="w-4 h-4 text-muted" />
          <h3 className="timeline-title">Activity Feed</h3>
        </div>
        <span className="timeline-live-tag">LIVE</span>
      </div>

      <div className="timeline-items-list">
        {activities.length === 0 ? (
          <div className="timeline-empty-state">
            <p>No recent activity logged.</p>
            <span>Create or complete tasks to see live feed.</span>
          </div>
        ) : (
          activities.map((item) => (
            <div
              key={item.id}
              className="timeline-item"
              onClick={() => onSelectTask?.(item.task)}
              role="button"
              tabIndex={0}
              title="Click to view details"
            >
              <div
                className={`timeline-icon-dot ${
                  item.type === 'completed' ? 'dot-completed' : 'dot-created'
                }`}
              >
                {item.type === 'completed' ? (
                  <IconCheck className="w-3 h-3 text-emerald-400" />
                ) : (
                  <IconPlus className="w-3 h-3 text-cyan-400" />
                )}
              </div>

              <div className="timeline-item-content">
                <div className="timeline-item-header">
                  <span className="timeline-action-label">
                    {item.type === 'completed' ? 'Task completed' : 'Task created'}
                  </span>
                  <span className="timeline-time">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                </div>
                <p className="timeline-task-title">{item.title}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
