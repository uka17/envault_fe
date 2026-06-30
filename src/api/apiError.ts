import axios from "axios";

export interface ApiFieldError {
  path?: string;
  msg?: { translation?: string; textCode?: string };
}

export interface ApiErrorResponse {
  message?: string;
  errors?: ApiFieldError[];
}

/**
 * Extract the first user-facing translation message from an API error response.
 * @param err Error thrown by an API call.
 * @returns Translated error message, or undefined if the error isn't in the expected format.
 */
export function getApiErrorMessage(err: unknown): string | undefined {
  if (!axios.isAxiosError<ApiErrorResponse>(err)) return undefined;
  return err.response?.data?.errors?.[0]?.msg?.translation;
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
    const text = fieldError.msg?.translation;
    if (!text) continue;

    if (fieldError.path && (knownFields as readonly string[]).includes(fieldError.path)) {
      fieldErrors[fieldError.path as T] = text;
    } else {
      genericErrors.push(text);
    }
  }

  return { fieldErrors, genericErrors };
}
