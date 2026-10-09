"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

const KEY = "apartee_saved";
const listeners = new Set<() => void>();

function readRaw(): string {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function write(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable: saving just won't persist */
  }
  listeners.forEach((l) => l());
}

const noopSubscribe = () => () => {};

interface SavedValue {
  ids: string[];
  /** false until the browser has read saved stays (avoids an empty-state flash) */
  ready: boolean;
  isSaved: (id: string) => boolean;
  toggle: (id: string) => void;
}

const SavedContext = createContext<SavedValue | null>(null);

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]");
  const ready = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );

  const ids = useMemo<string[]>(() => {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }, [raw]);

  const toggle = useCallback((id: string) => {
    let current: string[] = [];
    try {
      current = JSON.parse(readRaw());
    } catch {
      /* ignore */
    }
    write(
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  }, []);

  const value = useMemo<SavedValue>(
    () => ({ ids, ready, isSaved: (id) => ids.includes(id), toggle }),
    [ids, ready, toggle]
  );

  return (
    <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
  );
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used within SavedProvider");
  return ctx;
}
