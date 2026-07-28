"use client";

import { useCallback, useSyncExternalStore } from "react";

const DEFAULT_DESKTOP_QUERY = "(min-width: 768px)";

/** Server snapshot is a module constant, not an inline arrow — returning a new
 * value identity here makes React throw "getServerSnapshot should be cached". */
function getServerSnapshot() {
  return false;
}

/**
 * SSR-safe desktop-breakpoint hook. Returns false on the server so stepped
 * (mobile) layouts render first and hydrate without a layout flash.
 *
 * `subscribe` and `getSnapshot` must be memoized on `query` — useSyncExternalStore
 * resubscribes whenever `subscribe` changes identity, so inlining them would
 * tear down and rebuild the matchMedia listener on every single render.
 */
export function useBreakpoint(query: string = DEFAULT_DESKTOP_QUERY) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onStoreChange);
      return () => mql.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );

  const isDesktop = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return { isDesktop };
}
