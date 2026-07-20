/**
 * Maps stable backend error codes (see `envault/api/scripts/data/texts.ts`) to
 * the i18n keys that hold their localized text in `locales/{en,ru}/apiErrors.json`.
 * Used to translate API error responses on the frontend now that the backend
 * only sends English text plus a code, instead of pre-translated messages.
 */
export const API_ERROR_I18N_KEYS: Record<string, string> = {
  is_required: "apiErrors.isRequired",
  should_be_alphanumeric: "apiErrors.shouldBeAlphanumeric",
  email_format_incorrect: "apiErrors.emailFormatIncorrect",
  date_format_incorrect: "apiErrors.dateFormatIncorrect",
  should_be_numeric: "apiErrors.shouldBeNumeric",
  should_be_string: "apiErrors.shouldBeString",
  password_format_incorrect: "apiErrors.passwordFormatIncorrect",
  user_already_exists: "apiErrors.userAlreadyExists",
  user_not_found: "apiErrors.userNotFound",
  stash_not_found: "apiErrors.stashNotFound",
  stash_unlock_failed: "apiErrors.stashUnlockFailed",
  session_not_found: "apiErrors.sessionNotFound",
  incorrect_token: "apiErrors.incorrectToken",
  incorrect_password_or_email: "apiErrors.incorrectPasswordOrEmail",
  error_500: "apiErrors.error500",
  unauthorized: "apiErrors.unauthorized",
  body_required: "apiErrors.bodyRequired",
  incorrect_current_password: "apiErrors.incorrectCurrentPassword",
  email_required: "apiErrors.emailRequired",
  name_required: "apiErrors.nameRequired",
  password_required: "apiErrors.passwordRequired",
  name_alphanumeric: "apiErrors.nameAlphanumeric",
  current_password_required: "apiErrors.currentPasswordRequired",
  new_password_required: "apiErrors.newPasswordRequired",
  // Used by StashValidator ("delete" rule) but currently missing from the
  // backend's own seed list (api/scripts/data/texts.ts) - kept here so it
  // resolves once the backend adds it during the translations removal.
  id_required: "apiErrors.idRequired",
};
