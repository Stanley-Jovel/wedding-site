import { en, type Dict } from "@/content/dictionaries/en";
import { es } from "@/content/dictionaries/es";

export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

const dictionaries: Record<Locale, Dict> = { en, es };

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDictionary(locale: Locale): Dict {
  return dictionaries[locale];
}

export function otherLocale(locale: Locale): Locale {
  return locale === "es" ? "en" : "es";
}

export type { Dict };
