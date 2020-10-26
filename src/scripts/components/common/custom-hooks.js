import { useRef, useCallback, useEffect, useMemo } from 'haunted';

export function useDebouncedCallback(
  func,
  rawWait,
  options = { leading: false, trailing: true }
) {
  const lastCallTime = useRef(undefined);
  const lastInvokeTime = useRef(0);
  const timerId = useRef(undefined);
  const lastArgs = useRef([]);
  const lastThis = useRef(null);
  const result = useRef(null);
  const funcRef = useRef(func);
  const mounted = useRef(true);
  funcRef.current = func;

  // Bypass `requestAnimationFrame` by explicitly setting `wait=0`.
  const useRAF =
    !rawWait &&
    rawWait !== 0 &&
    typeof window !== 'undefined' &&
    typeof window.requestAnimationFrame === 'function';

  if (typeof func !== 'function') {
    throw new TypeError('Expected a function');
  }
  const wait = Number(rawWait) || 0;
  const leading = !!options.leading;
  const trailing = 'trailing' in options ? !!options.trailing : true;
  const maxing = 'maxWait' in options;
  const maxWait = maxing
    ? Math.max(Number(options.maxWait) || 0, wait)
    : undefined;

  const invokeFunc = useCallback((time) => {
    const args = lastArgs.current;
    const thisArg = lastThis.current;

    lastThis.current = undefined;
    lastArgs.current = undefined;
    lastInvokeTime.current = time;
    result.current = funcRef.current.apply(thisArg, args);
    return result.current;
  }, []);

  const startTimer = useCallback(
    (pendingFunc, timeout) => {
      if (useRAF) {
        window.cancelAnimationFrame(timerId.current);
        return window.requestAnimationFrame(pendingFunc);
      }
      return setTimeout(pendingFunc, timeout);
    },
    [useRAF]
  );

  const cancelTimer = useCallback(
    (id) => {
      if (useRAF) {
        return window.cancelAnimationFrame(id);
      }
      clearTimeout(id);
      return true;
    },
    [useRAF]
  );

  const remainingWait = useCallback(
    (time) => {
      const timeSinceLastCall = time - lastCallTime.current;
      const timeSinceLastInvoke = time - lastInvokeTime.current;
      const timeWaiting = wait - timeSinceLastCall;

      return maxing
        ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
        : timeWaiting;
    },
    [maxWait, maxing, wait]
  );

  const shouldInvoke = useCallback(
    (time) => {
      if (!mounted.current) return false;

      const timeSinceLastCall = time - lastCallTime.current;
      const timeSinceLastInvoke = time - lastInvokeTime.current;

      // Either this is the first call, activity has stopped and we're at the
      // trailing edge, the system time has gone backwards and we're treating
      // it as the trailing edge, or we've hit the `maxWait` limit.
      return (
        lastCallTime.current === undefined ||
        timeSinceLastCall >= wait ||
        timeSinceLastCall < 0 ||
        (maxing && timeSinceLastInvoke >= maxWait)
      );
    },
    [maxWait, maxing, wait]
  );

  const trailingEdge = useCallback(
    (time) => {
      timerId.current = undefined;

      // Only invoke if we have `lastArgs` which means `func` has been
      // debounced at least once.
      if (trailing && lastArgs.current) {
        return invokeFunc(time);
      }
      lastThis.current = undefined;
      lastArgs.current = undefined;
      return result.current;
    },
    [invokeFunc, trailing]
  );

  const timerExpired = useCallback(() => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId.current = startTimer(timerExpired, remainingWait(time));
    return true;
  }, [remainingWait, shouldInvoke, startTimer, trailingEdge]);

  const leadingEdge = useCallback(
    (time) => {
      // Reset any `maxWait` timer.
      lastInvokeTime.current = time;
      // Start the timer for the trailing edge.
      timerId.current = startTimer(timerExpired, wait);
      // Invoke the leading edge.
      return leading ? invokeFunc(time) : result.current;
    },
    [invokeFunc, startTimer, leading, timerExpired, wait]
  );

  const cancel = useCallback(() => {
    if (timerId.current !== undefined) {
      cancelTimer(timerId.current);
    }
    lastInvokeTime.current = 0;
    timerId.current = undefined;
    lastThis.current = undefined;
    lastCallTime.current = undefined;
    lastArgs.current = undefined;
  }, [cancelTimer]);

  const flush = useCallback(
    () =>
      timerId.current === undefined ? result.current : trailingEdge(Date.now()),
    [trailingEdge]
  );

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const debounced = useCallback(
    (...args) => {
      const time = Date.now();
      const isInvoking = shouldInvoke(time);

      lastArgs.current = args;
      lastThis.current = this;
      lastCallTime.current = time;

      if (isInvoking) {
        if (timerId.current === undefined && mounted.current) {
          return leadingEdge(lastCallTime.current);
        }
        if (maxing) {
          // Handle invocations in a tight loop.
          timerId.current = startTimer(timerExpired, wait);
          return invokeFunc(lastCallTime.current);
        }
      }
      if (timerId.current === undefined) {
        timerId.current = startTimer(timerExpired, wait);
      }
      return result.current;
    },
    [
      invokeFunc,
      leadingEdge,
      maxing,
      shouldInvoke,
      startTimer,
      timerExpired,
      wait,
    ]
  );

  const pending = useCallback(() => timerId.current !== undefined, []);

  const debouncedState = useMemo(
    () => ({
      callback: debounced,
      cancel,
      flush,
      pending,
    }),
    [debounced, cancel, flush, pending]
  );

  return debouncedState;
}

export default { useDebouncedCallback };
