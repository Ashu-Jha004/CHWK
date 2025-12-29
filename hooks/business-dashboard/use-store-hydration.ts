"use client";

import { useSyncExternalStore } from "react";

/**
 * Hook to check if the app is running on the client (hydrated).
 * satisfies 'react-hooks/set-state-in-effect' by using useSyncExternalStore.
 */
export function useStoreHydration() {
  return useSyncExternalStore(
    // 1. Subscribe function (not needed for simple hydration check)
    () => () => {},
    // 2. Client-side snapshot (the value in the browser)
    () => true,
    // 3. Server-side snapshot (the value on the server)
    () => false
  );
}
