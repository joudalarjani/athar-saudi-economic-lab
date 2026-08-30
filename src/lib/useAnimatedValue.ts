import { useEffect, useRef, useState } from 'react';

/**
 * Smoothly animates to a target numeric value whenever it changes.
 * Good for live figure updates on slider drag.
 */
export function useAnimatedValue(target: number, durationMs = 450): number {
  const [display, setDisplay] = useState(target);
  const frame = useRef<number | null>(null);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = from + (target - from) * eased;
      setDisplay(value);
      if (t < 1) {
        frame.current = requestAnimationFrame(step);
      } else {
        fromRef.current = target;
      }
    };
    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      fromRef.current = target;
    };
  }, [target, durationMs]);

  return display;
}
