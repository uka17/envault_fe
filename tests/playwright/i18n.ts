import common from "../../src/locales/en/common.json" with { type: "json" };
import auth from "../../src/locales/en/auth.json" with { type: "json" };
import validation from "../../src/locales/en/validation.json" with { type: "json" };
import stash from "../../src/locales/en/stash.json" with { type: "json" };

/**
 * English locale strings used by the e2e tests, read directly from the app's
 * locale files so the tests stay in sync with any copy changes.
 */
export const t = { common, auth, validation, stash };

/**
 * Strip vue-i18n's backslash escaping (e.g. "your\\@email.com" -> "your@email.com")
 * so raw locale strings match what actually renders in the DOM.
 * @param message Raw message string as stored in a locale JSON file.
 * @returns The message as vue-i18n would render it.
 */
export function unescape(message: string): string {
  return message.replace(/\\(.)/g, "$1");
}
