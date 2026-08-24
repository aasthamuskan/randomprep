import { useState, useRef, useCallback, useEffect } from 'react';

export function useTimer(initialSeconds = 300) {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [remaining, setRemaining] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef(null);

  const clear = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const start = useCallback(() => {
    if (finished || remaining === 0) return;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [finished, remaining]);

  const pause = useCallback(() => {
    setRunning(false);
    clear();
  }, []);

  const reset = useCallback((newSeconds) => {
    clear();
    const secs = newSeconds ?? totalSeconds;
    setRemaining(secs);
    setTotalSeconds(secs);
    setRunning(false);
    setFinished(false);
  }, [totalSeconds]);

  const setDuration = useCallback((seconds) => {
    clear();
    setTotalSeconds(seconds);
    setRemaining(seconds);
    setRunning(false);
    setFinished(false);
  }, []);

  useEffect(() => () => clear(), []);

  const elapsed = totalSeconds - remaining;
  const pct = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0;

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  return { remaining, elapsed, totalSeconds, running, finished, pct, mm, ss, start, pause, reset, setDuration };
}
