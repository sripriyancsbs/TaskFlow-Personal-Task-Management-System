import React, { useState, useEffect } from 'react';
import {
  IconClock,
  IconPlay,
  IconPause,
  IconRotateCcw,
  IconSettings,
} from './Icons';

export default function FocusTimerWidget({ onExpandFullscreen }) {
  const [mode, setMode] = useState('focus'); // 'focus' (25m) | 'short' (5m) | 'long' (15m)
  const modeTimes = {
    focus: 25 * 60,
    short: 5 * 60,
    long: 15 * 60,
  };

  const [secondsLeft, setSecondsLeft] = useState(modeTimes.focus);
  const [isRunning, setIsRunning] = useState(false);

  // Switch mode
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setIsRunning(false);
    setSecondsLeft(modeTimes[newMode]);
  };

  // Timer interval
  useEffect(() => {
    let interval = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalModeSeconds = modeTimes[mode];
  const progressPercent = ((totalModeSeconds - secondsLeft) / totalModeSeconds) * 100;

  // SVG circle circumference for radius = 46 (perimeter = 2 * PI * 46 ~ 289)
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const handleToggleRunning = () => {
    if (secondsLeft === 0) setSecondsLeft(modeTimes[mode]);
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(modeTimes[mode]);
  };

  return (
    <div className="rail-widget focus-timer-widget">
      {/* Header */}
      <div className="timer-widget-header">
        <div className="timer-widget-title-wrap">
          <IconClock className="w-4 h-4 text-muted" />
          <h4 className="timer-widget-title">Focus Timer</h4>
        </div>
        <div className="timer-mode-tag">
          <span>Pomodoro ▾</span>
        </div>
      </div>

      {/* Mode Pills: Focus | Short Break | Long Break */}
      <div className="timer-mode-pills" role="tablist">
        <button
          type="button"
          className={`timer-pill-btn ${mode === 'focus' ? 'pill-active-blue' : ''}`}
          onClick={() => handleModeChange('focus')}
        >
          Focus
        </button>
        <button
          type="button"
          className={`timer-pill-btn ${mode === 'short' ? 'pill-active-blue' : ''}`}
          onClick={() => handleModeChange('short')}
        >
          Short Break
        </button>
        <button
          type="button"
          className={`timer-pill-btn ${mode === 'long' ? 'pill-active-blue' : ''}`}
          onClick={() => handleModeChange('long')}
        >
          Long Break
        </button>
      </div>

      {/* Circular Gauge Centerpiece */}
      <div className="timer-circle-container">
        <svg className="timer-svg-dial" width="124" height="124" viewBox="0 0 124 124">
          {/* Background track circle */}
          <circle
            className="timer-track-circle"
            cx="62"
            cy="62"
            r={radius}
            fill="none"
            strokeWidth="5"
          />
          {/* Glowing progress circle */}
          <circle
            className="timer-progress-circle"
            cx="62"
            cy="62"
            r={radius}
            fill="none"
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        <div className="timer-dial-content">
          <span className="timer-digits font-mono">{timeFormatted}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="timer-controls-bar">
        <button
          type="button"
          className="timer-aux-btn"
          onClick={handleReset}
          title="Reset timer"
          aria-label="Reset timer"
        >
          <IconRotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          className="btn-timer-primary-start"
          onClick={handleToggleRunning}
          title={isRunning ? 'Pause timer' : 'Start timer'}
        >
          {isRunning ? (
            <>
              <IconPause className="w-4 h-4 mr-1.5" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <IconPlay className="w-4 h-4 mr-1.5" />
              <span>Start</span>
            </>
          )}
        </button>

        <button
          type="button"
          className="timer-aux-btn"
          onClick={onExpandFullscreen}
          title="Open distraction-free focus workspace"
          aria-label="Fullscreen focus"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </button>
      </div>
    </div>
  );
}
