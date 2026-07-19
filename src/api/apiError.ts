import axios from "axios";
import { i18n } from "@/i18n";
import { API_ERROR_I18N_KEYS } from "@/i18n/apiErrorCodes";

export interface ApiFieldError {
  field?: string;
  code?: string;
  message?: string;
}

export interface ApiErrorResponse {
  code?: string;
  message?: string;
  errors?: ApiFieldError[];
}

/**
 * Translate a backend error code to the active locale, falling back to the
 * backend's own (English) message when the code isn't in the known map.
 * @param code Stable backend error code, if present.
 * @param fallback English fallback text sent by the backend.
 * @returns Localized message, or undefined if neither a mapped code nor fallback text is available.
 */
function localize(code: string | undefined, fallback: string | undefined): string | undefined {
  const i18nKey = code ? API_ERROR_I18N_KEYS[code] : undefined;
  return i18nKey ? i18n.global.t(i18nKey) : fallback;
}

/**
 * Extract the first user-facing error message from an API error response,
 * localized via the backend error code when it's recognized.
 * @param err Error thrown by an API call.
 * @returns Localized error message, or undefined if the error isn't in the expected format.
 */
export function getApiErrorMessage(err: unknown): string | undefined {
  if (!axios.isAxiosError<ApiErrorResponse>(err)) return undefined;
  const data = err.response?.data;

  const firstFieldError = data?.errors?.[0];
  if (firstFieldError) {
    const message = localize(firstFieldError.code, firstFieldError.message);
    if (message) return message;
  }

  return localize(data?.code, data?.message);
}

/**
 * Map field-level API validation errors onto known form fields.
 * Errors for fields the form can't display inline are returned as generic messages instead.
 * @param err Error thrown by an API call.
 * @param knownFields Field names the form can show inline errors for.
 * @returns Object with `fieldErrors` (field name to message) and `genericErrors` (messages without a matching field).
 */
export function extractApiFieldErrors<T extends string>(
  err: unknown,
  knownFields: readonly T[],
): { fieldErrors: Partial<Record<T, string>>; genericErrors: string[] } {
  const fieldErrors: Partial<Record<T, string>> = {};
  const genericErrors: string[] = [];

  if (!axios.isAxiosError<ApiErrorResponse>(err)) return { fieldErrors, genericErrors };

  for (const fieldError of err.response?.data?.errors ?? []) {
    const text = localize(fieldError.code, fieldError.message);
    if (!text) continue;

    if (fieldError.field && (knownFields as readonly string[]).includes(fieldError.field)) {
      fieldErrors[fieldError.field as T] = text;
    } else {
      genericErrors.push(text);
    }
  }

  return { fieldErrors, genericErrors };
}
