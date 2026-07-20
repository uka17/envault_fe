import { createI18n } from "vue-i18n";

import enCommon from "@/locales/en/common.json";
import enAuth from "@/locales/en/auth.json";
import enValidation from "@/locales/en/validation.json";
import enProfile from "@/locales/en/profile.json";
import enStash from "@/locales/en/stash.json";
import enHome from "@/locales/en/home.json";
import enApiErrors from "@/locales/en/apiErrors.json";

import ruCommon from "@/locales/ru/common.json";
import ruAuth from "@/locales/ru/auth.json";
import ruValidation from "@/locales/ru/validation.json";
import ruProfile from "@/locales/ru/profile.json";
import ruStash from "@/locales/ru/stash.json";
import ruHome from "@/locales/ru/home.json";
import ruApiErrors from "@/locales/ru/apiErrors.json";

export const SUPPORTED_LOCALES = ["en", "ru"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "en";

const LOCALE_STORAGE_KEY = "envault-locale";

/**
 * Determines the plural form index for Russian count-based messages.
 * @param choice The count value being pluralized.
 * @param choicesLength Number of plural forms declared in the message.
 * @returns Index of the plural form to use: 0 (one), 1 (few), or 2 (many).
 */
function ruPluralizationRule(choice: number, choicesLength: number): number {
  if (choicesLength < 3) {
    return choice === 1 ? 0 : 1;
  }
  const mod10 = choice % 10;
  const mod100 = choice % 100;
  if (mod10 === 1 && mod100 !== 11) return 0;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 1;
  return 2;
}

/**
 * Reads the persisted locale from localStorage, falling back to the browser
 * language and finally to the default locale if neither is supported.
 * @returns A supported locale code.
 */
function detectInitialLocale(): SupportedLocale {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored && (SUPPORTED_LOCALES as readonly string[]).includes(stored)) {
    return stored as SupportedLocale;
  }
  const browserLocale = navigator.language.slice(0, 2);
  if ((SUPPORTED_LOCALES as readonly string[]).includes(browserLocale)) {
    return browserLocale as SupportedLocale;
  }
  return DEFAULT_LOCALE;
}

export const i18n = createI18n({
  legacy: false,
  locale: detectInitialLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  pluralRules: {
    ru: ruPluralizationRule,
  },
  messages: {
    en: {
      common: enCommon,
      auth: enAuth,
      validation: enValidation,
      profile: enProfile,
      stash: enStash,
      home: enHome,
      apiErrors: enApiErrors,
    },
    ru: {
      common: ruCommon,
      auth: ruAuth,
      validation: ruValidation,
      profile: ruProfile,
      stash: ruStash,
      home: ruHome,
      apiErrors: ruApiErrors,
    },
  },
});

/**
 * Switches the active locale and persists the choice for future sessions.
 * @param locale Locale code to switch to.
 */
export function setLocale(locale: SupportedLocale): void {
  i18n.global.locale.value = locale;
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  document.documentElement.lang = locale;
}

document.documentElement.lang = i18n.global.locale.value;

export default i18n;
