import { useEffect, useRef, useState } from 'react';

export type StopwatchStatus = 'idle' | 'running' | 'paused';

export function useStopwatch() {
  const [status, setStatus] = useState<StopwatchStatus>('idle');
  const [elapsedMs, setElapsedMs] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);

  useEffect(() => {
    if (status !== 'running') return;
    const id = setInterval(() => {
      setElapsedMs(accumulatedRef.current + Date.now() - startTimeRef.current!);
    }, 83);
    return () => clearInterval(id);
  }, [status]);

  const start = () => {
    startTimeRef.current = Date.now();
    setStatus('running');
  };

  const pause = () => {
    accumulatedRef.current += Date.now() - startTimeRef.current!;
    setStatus('paused');
  };

  const resume = () => {
    startTimeRef.current = Date.now();
    setStatus('running');
  };

  const end = () => {
    accumulatedRef.current = 0;
    setElapsedMs(0);
    setStatus('idle');
  };

  return { status, elapsedMs, start, pause, resume, end };
}

export function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  const centis = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
  return `${minutes} : ${seconds} . ${centis}`;
}
