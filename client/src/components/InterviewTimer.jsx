import { useTimer } from '../hooks/useTimer';
import { useEffect } from 'react';

const DURATIONS = [
  { label: '1m', seconds: 60 },
  { label: '2m', seconds: 120 },
  { label: '5m', seconds: 300 },
  { label: '10m', seconds: 600 },
];

const CIRCUMFERENCE = 2 * Math.PI * 54; // r=54

export default function InterviewTimer({ onFinish, onElapsed }) {
  const { remaining, elapsed, totalSeconds, running, finished, pct, mm, ss, start, pause, reset, setDuration } = useTimer(300);

  // Notify parent when timer finishes
  useEffect(() => {
    if (finished && onFinish) onFinish(elapsed);
  }, [finished]);

  // Pass elapsed up on every tick
  useEffect(() => {
    if (onElapsed) onElapsed(elapsed);
  }, [elapsed]);

  const strokeOffset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Duration selector */}
      <div className="flex items-center gap-1 p-1 bg-surface rounded-md border border-line">
        {DURATIONS.map(({ label, seconds }) => (
          <button
            key={seconds}
            onClick={() => setDuration(seconds)}
            disabled={running}
            className={`px-3 py-1 rounded text-sm font-mono transition-colors ${
              totalSeconds === seconds
                ? 'bg-surface-overlay text-ink'
                : 'text-ink-muted hover:text-ink disabled:cursor-not-allowed'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Timer ring */}
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Track */}
          <circle cx="60" cy="60" r="54" fill="none" stroke="#1C1C1C" strokeWidth="4" />
          {/* Progress */}
          <circle
            cx="60" cy="60" r="54" fill="none"
            stroke={finished ? '#EF4444' : '#0F766E'}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeOffset}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-mono font-semibold tabular-nums ${finished ? 'text-hard' : 'text-ink'}`}>
            {mm}:{ss}
          </span>
          <span className="text-2xs text-ink-muted mt-0.5 font-mono">
            {running ? 'running' : finished ? 'done' : 'ready'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {!running ? (
          <button
            onClick={start}
            disabled={finished || remaining === 0}
            className="px-4 py-1.5 bg-accent hover:bg-accent-dim text-white text-sm font-medium rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {remaining === totalSeconds ? 'Start' : 'Resume'}
          </button>
        ) : (
          <button
            onClick={pause}
            className="px-4 py-1.5 bg-surface-overlay hover:bg-surface-border text-ink text-sm font-medium rounded border border-line transition-colors"
          >
            Pause
          </button>
        )}
        <button
          onClick={() => reset()}
          className="px-3 py-1.5 text-ink-muted hover:text-ink text-sm rounded border border-line hover:border-line-strong bg-surface transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
