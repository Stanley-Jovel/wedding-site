"use client";

import { useSyncExternalStore } from "react";

// The current time, ticking once a second on the client and null during server render,
// so prerendered HTML never bakes in a stale clock.
function subscribe(onTick: () => void) {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
}
const snapshot = () => Math.floor(Date.now() / 1000) * 1000;
const serverSnapshot = () => null;

export function useNow(): number | null {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
