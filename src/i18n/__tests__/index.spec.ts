import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const LOCALE_STORAGE_KEY = "envault-locale";

describe("i18n", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("falls back to the default locale when nothing is stored and browser language is unsupported", async () => {
    Object.defineProperty(navigator, "language", { value: "fr-FR", configurable: true });
    const { i18n, DEFAULT_LOCALE } = await import("../index");
    expect(i18n.global.locale.value).toBe(DEFAULT_LOCALE);
  });

  it("uses the stored locale when present", async () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, "ru");
    const { i18n } = await import("../index");
    expect(i18n.global.locale.value).toBe("ru");
  });

  it("falls back to the browser language when it is supported", async () => {
    Object.defineProperty(navigator, "language", { value: "ru-RU", configurable: true });
    const { i18n } = await import("../index");
    expect(i18n.global.locale.value).toBe("ru");
  });

  it("setLocale updates the active locale, persists it and updates document lang", async () => {
    const { i18n, setLocale } = await import("../index");
    setLocale("ru");
    expect(i18n.global.locale.value).toBe("ru");
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("ru");
    expect(document.documentElement.lang).toBe("ru");
  });

  it("applies Russian plural rules: one/few/many", async () => {
    const { i18n, setLocale } = await import("../index");
    setLocale("ru");
    const t = i18n.global.t;

    expect(t("stash.dashboard.inYears", { n: 1 }, 1)).toBe("Через 1 год");
    expect(t("stash.dashboard.inYears", { n: 3 }, 3)).toBe("Через 3 года");
    expect(t("stash.dashboard.inYears", { n: 5 }, 5)).toBe("Через 5 лет");
    expect(t("stash.dashboard.inYears", { n: 11 }, 11)).toBe("Через 11 лет");
    expect(t("stash.dashboard.inYears", { n: 21 }, 21)).toBe("Через 21 год");
  });
});
