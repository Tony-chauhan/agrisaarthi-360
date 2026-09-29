/** Supported UI languages. English is the deterministic SSR default. */
export type Lang = "en" | "hi";

/** localStorage key for the persisted language choice. */
export const LANGUAGE_STORAGE_KEY = "agrisaarthi.lang";

/** Languages offered by the switcher, in display order. */
export const LANGUAGES: ReadonlyArray<{ id: Lang; nativeLabel: string }> = [
  { id: "en", nativeLabel: "English" },
  { id: "hi", nativeLabel: "हिन्दी" },
];
