import type { Dictionary } from "./en";
import type { Lang } from "./types";
import { en } from "./en";
import { hi } from "./hi";

/**
 * Dictionary registry. English stays the deterministic SSR/render default:
 * every server render and the first client hydration use `en`, and the Hindi
 * dictionary only applies after the language context mounts (client-side).
 */
const dictionaries: Record<Lang, Dictionary> = {
  en,
  hi,
};

/** Type-safe dictionary accessor. Never returns undefined for a valid Lang. */
export function t(lang: Lang): Dictionary {
  return dictionaries[lang] ?? en;
}

export { dictionaries };

export type { Dictionary, Lang };
export { LANGUAGES, LANGUAGE_STORAGE_KEY } from "./types";
export { LanguageProvider, useLanguage } from "./language-context";
