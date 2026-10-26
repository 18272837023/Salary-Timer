"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  clearSettings,
  defaultSettings,
  isStorageAvailable,
  loadSettings,
  saveSettings,
  type StorageStatus,
} from "./defaults";
import type { Settings } from "./types";

interface SettingsContextValue {
  settings: Settings;
  /** false during the very first render (server HTML + hydration) */
  hydrated: boolean;
  /** whether the browser is actually persisting our data */
  storageOk: boolean;
  /** true while the visitor is still looking at the demo salary */
  demo: boolean;
  update: (patch: Partial<Settings>) => void;
  replace: (next: Settings) => void;
  reset: () => void;
  /** marks the demo as converted and persists */
  commit: () => StorageStatus;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Server render and first client render must match, so we start from defaults
  // and hydrate from localStorage in an effect.
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [hydrated, setHydrated] = useState(false);
  const [storageOk, setStorageOk] = useState(true);

  useEffect(() => {
    const stored = loadSettings();
    if (stored) setSettings(stored);
    setStorageOk(isStorageAvailable());
    setHydrated(true);
  }, []);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const persist = useCallback((next: Settings): StorageStatus => {
    const result = saveSettings(next);
    setStorageOk(result.ok);
    return result;
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const replace = useCallback((next: Settings) => {
    setSettings(next);
    saveSettings(next);
  }, []);

  const reset = useCallback(() => {
    clearSettings();
    const fresh = defaultSettings();
    setSettings(fresh);
    saveSettings(fresh);
  }, []);

  const commit = useCallback((): StorageStatus => {
    const next = { ...settingsRef.current, onboarded: true };
    setSettings(next);
    return persist(next);
  }, [persist]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      hydrated,
      storageOk,
      demo: !settings.onboarded,
      update,
      replace,
      reset,
      commit,
    }),
    [settings, hydrated, storageOk, update, replace, reset, commit],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside <SettingsProvider>");
  return ctx;
}

/* -------------------------------------------------------------------------- */
/*  Toast                                                                      */
/* -------------------------------------------------------------------------- */

interface ToastContextValue {
  show: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((text: string) => {
    setMessage(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 2100);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={`toast${message ? " on" : ""}`} role="status" aria-live="polite">
        {message ?? ""}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

/* -------------------------------------------------------------------------- */
/*  Clock                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * A ticking Date, throttled to ~10fps. Only mounted inside the interactive app
 * block — the marketing sections never re-render because of it.
 *
 * Uses an `active` flag so a Strict-Mode remount (or a fast settings save)
 * can't leave a cancelled RAF loop half-alive and freeze the counter.
 */
export function useNow(intervalMs = 100): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let raf = 0;
    let last = 0;
    let active = true;

    const loop = (ts: number) => {
      if (!active) return;
      if (ts - last >= intervalMs) {
        last = ts;
        setNow(new Date());
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onVisible = () => {
      if (!document.hidden) {
        last = 0;
        setNow(new Date());
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [intervalMs]);

  return now;
}
