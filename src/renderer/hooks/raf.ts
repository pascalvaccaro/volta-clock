import { useCallback, useEffect, useMemo, useRef } from 'react';

export type RafLoopReturns = [() => void, () => void, () => boolean];

/**
 * @todo: remove this hook when 'react-use' updates its dependency to react 18.x.x
 * @link https://github.com/streamich/react-use/blob/325f5bd69904346788ea981ec18bfc7397c611df/package.json#L113
 */
export function useRafLoop(
  callback: Parameters<typeof window.requestAnimationFrame>[0],
  initiallyActive = true,
): RafLoopReturns {
  const raf = useRef<number | null>(null);
  const rafActivity = useRef<boolean>(false);
  const rafCallback = useRef(callback);
  rafCallback.current = callback;

  const step = useCallback((time: number) => {
    if (rafActivity.current) {
      rafCallback.current(time);
      raf.current = requestAnimationFrame(step);
    }
  }, []);

  const result = useMemo(
    () =>
      [
        () => {
          // stop
          if (rafActivity.current) {
            rafActivity.current = false;
            if (raf.current) cancelAnimationFrame(raf.current);
          }
        },
        () => {
          // start
          if (!rafActivity.current) {
            rafActivity.current = true;
            raf.current = requestAnimationFrame(step);
          }
        },
        (): boolean => rafActivity.current, // isActive
      ] as RafLoopReturns,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    if (initiallyActive) {
      result[1]();
    }

    return result[0];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return result;
}
