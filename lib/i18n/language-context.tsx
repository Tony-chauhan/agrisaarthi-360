"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Dictionary } from "./en";
import type { Lang } from "./types";
import { LANGUAGE_STORAGE_KEY } from "./types";
import { t as getDictionary } from "./index";

type LanguageContextValue = {
  /** Current UI language. "en" during SSR and first hydration (deterministic). */
  lang: Lang;
  /** Switch language; persists to localStorage and updates <html lang>. */
  setLang: (lang: Lang) => void;
  /** Dictionary for the current language. */
  t: Dictionary;
  /** True only after the client has loaded the persisted choice. */
  hydrated: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLang(value: unknown): value is Lang {
  return value === "en" || value === "hi";
}

/**
 * Language provider — client component.
 *
 * Hydration safety rules (no suppressHydrationWarning anywhere):
 *  - SSR and the first client render always use English, so markup matches.
 *  - The persisted language is read from localStorage in an effect (after
 *    hydration), then applied to state — a re-render, not a hydration diff.
 *  - <html lang="en"> is rendered by the server; documentElement.lang is
 *    updated imperatively post-mount only.
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [hydrated, setHydrated] = useState(false);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    document.documentElement.lang = next === "hi" ? "hi" : "en";
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // Persisting is best-effort; the choice still applies for this session.
    }
  }, []);

  // Load persisted choice after hydration.
  useEffect(() => {
    let stored: unknown = null;
    try {
      stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    } catch {
      // localStorage unavailable (private mode, disabled storage): keep English.
    }
    if (isLang(stored)) {
      setLangState(stored);
      document.documentElement.lang = stored === "hi" ? "hi" : "en";
    }
    setHydrated(true);
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      t: getDictionary(lang),
      hydrated,
    }),
    [lang, setLang, hydrated],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Access the current language state and dictionary. */
export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within <LanguageProvider>");
  }
  return ctx;
}
