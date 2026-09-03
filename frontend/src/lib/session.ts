"use client";

import { useSyncExternalStore } from "react";

const KEY = "autopsy_user_id";

export function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(KEY);
}

export function setUserId(id: string) {
  window.localStorage.setItem(KEY, id);
  window.dispatchEvent(new Event("autopsy-session"));
}

export function clearUserId() {
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("autopsy-session"));
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("autopsy-session", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("autopsy-session", callback);
  };
}

/** Reactive read of the signed-in user id, safe across SSR/hydration (no setState-in-effect). */
export function useUserId(): string | null {
  return useSyncExternalStore(subscribe, getUserId, () => null);
}
