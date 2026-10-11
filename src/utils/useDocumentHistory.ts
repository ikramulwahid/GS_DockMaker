import { useState, useCallback, useRef } from 'react';

export interface HistoryState<T> {
  canUndo: boolean;
  canRedo: boolean;
  undoCount: number;
  redoCount: number;
}

const DEFAULT_MAX_HISTORY = 60;
const DEBOUNCE_COALESCE_MS = 600; // Coalesce rapid typing into a single history step

export function useDocumentHistory<T>(
  initialPresent: T,
  options: {
    maxHistory?: number;
    areEqual?: (a: T, b: T) => boolean;
  } = {}
) {
  const maxHistory = options.maxHistory || DEFAULT_MAX_HISTORY;
  const areEqual = options.areEqual || ((a, b) => JSON.stringify(a) === JSON.stringify(b));

  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initialPresent);
  const [future, setFuture] = useState<T[]>([]);

  // Ref to track last edit time and type for intelligent grouping (e.g., continuous typing)
  const lastPushTimestampRef = useRef<number>(0);
  const lastCoalesceKeyRef = useRef<string | null>(null);

  /**
   * Pushes a new document state into history.
   * If coalesceKey matches within DEBOUNCE_COALESCE_MS, replaces the current present state instead of appending.
   */
  const setWithHistory = useCallback(
    (newPresentOrUpdater: T | ((curr: T) => T), coalesceKey?: string) => {
      setPresent((currentPresent) => {
        const nextPresent =
          typeof newPresentOrUpdater === 'function'
            ? (newPresentOrUpdater as (curr: T) => T)(currentPresent)
            : newPresentOrUpdater;

        if (areEqual(currentPresent, nextPresent)) {
          return currentPresent;
        }

        const now = Date.now();
        const shouldCoalesce =
          Boolean(coalesceKey) &&
          coalesceKey === lastCoalesceKeyRef.current &&
          now - lastPushTimestampRef.current < DEBOUNCE_COALESCE_MS;

        lastPushTimestampRef.current = now;
        lastCoalesceKeyRef.current = coalesceKey || null;

        if (shouldCoalesce) {
          // Just update present without adding extra past stack items
          return nextPresent;
        }

        // Add current state to past stack and clear future (redo) stack
        setPast((prevPast) => {
          const updated = [...prevPast, currentPresent];
          if (updated.length > maxHistory) {
            return updated.slice(updated.length - maxHistory);
          }
          return updated;
        });

        setFuture([]);
        return nextPresent;
      });
    },
    [areEqual, maxHistory]
  );

  /**
   * Resets entire history with new present state (e.g. on New document or Open file)
   */
  const resetHistory = useCallback((newPresent: T) => {
    setPast([]);
    setPresent(newPresent);
    setFuture([]);
    lastPushTimestampRef.current = 0;
    lastCoalesceKeyRef.current = null;
  }, []);

  /**
   * Undo to previous state
   */
  const undo = useCallback((): T | null => {
    let restored: T | null = null;
    setPresent((currentPresent) => {
      if (past.length === 0) return currentPresent;

      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);

      setPast(newPast);
      setFuture((prevFuture) => [currentPresent, ...prevFuture]);
      restored = previous;
      lastPushTimestampRef.current = 0;
      lastCoalesceKeyRef.current = null;
      return previous;
    });
    return restored;
  }, [past]);

  /**
   * Redo to future state
   */
  const redo = useCallback((): T | null => {
    let restored: T | null = null;
    setPresent((currentPresent) => {
      if (future.length === 0) return currentPresent;

      const next = future[0];
      const newFuture = future.slice(1);

      setPast((prevPast) => [...prevPast, currentPresent]);
      setFuture(newFuture);
      restored = next;
      lastPushTimestampRef.current = 0;
      lastCoalesceKeyRef.current = null;
      return next;
    });
    return restored;
  }, [future]);

  return {
    document: present,
    setDocument: setWithHistory,
    resetHistory,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    undoCount: past.length,
    redoCount: future.length,
  };
}
