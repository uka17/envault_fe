import { describe, it, expect, beforeEach } from "vitest";
import { AxiosError } from "axios";
import { getApiErrorMessage, extractApiFieldErrors } from "../apiError";
import { setLocale } from "@/i18n";

/** Builds a minimal AxiosError carrying the given response data. */
function makeAxiosError(data: unknown): AxiosError {
  const error = new AxiosError("Request failed");
  error.response = {
    data,
    status: 400,
    statusText: "Bad Request",
    headers: {},
    config: {} as never,
  };
  return error;
}

describe("getApiErrorMessage", () => {
  beforeEach(() => {
    setLocale("en");
  });

  it("returns undefined for non-axios errors", () => {
    expect(getApiErrorMessage(new Error("boom"))).toBeUndefined();
    expect(getApiErrorMessage("plain string")).toBeUndefined();
    expect(getApiErrorMessage(undefined)).toBeUndefined();
  });

  it("returns undefined when the response has neither a message nor errors", () => {
    const err = makeAxiosError({});
    expect(getApiErrorMessage(err)).toBeUndefined();
  });

  it("translates a top-level {code, message} error via the active locale", () => {
    const err = makeAxiosError({ code: "user_not_found", message: "User not found" });
    expect(getApiErrorMessage(err)).toBe("User not found");
    setLocale("ru");
    expect(getApiErrorMessage(err)).toBe("Пользователь не найден");
  });

  it("falls back to the backend's own message for an unmapped top-level code", () => {
    const err = makeAxiosError({ code: "brand_new_code", message: "Something new happened" });
    expect(getApiErrorMessage(err)).toBe("Something new happened");
  });

  it("translates the first field error via its code", () => {
    const err = makeAxiosError({
      errors: [{ field: "email", code: "email_required", message: "Email is required" }],
    });
    setLocale("ru");
    expect(getApiErrorMessage(err)).toBe("Email обязателен");
  });

  it("falls back to the backend's own message for an unmapped field error code", () => {
    const err = makeAxiosError({
      errors: [{ field: "email", code: "brand_new_code", message: "Some new validation rule" }],
    });
    setLocale("ru");
    expect(getApiErrorMessage(err)).toBe("Some new validation rule");
  });
});

describe("extractApiFieldErrors", () => {
  const KNOWN_FIELDS = ["name", "email", "password"] as const;

  beforeEach(() => {
    setLocale("en");
  });

  it("returns empty results for non-axios errors", () => {
    const result = extractApiFieldErrors(new Error("boom"), KNOWN_FIELDS);
    expect(result).toEqual({ fieldErrors: {}, genericErrors: [] });
  });

  it("maps known field errors onto fieldErrors, translated via the backend code", () => {
    setLocale("ru");
    const err = makeAxiosError({
      errors: [{ field: "email", code: "user_already_exists", message: "Email is invalid or already taken" }],
    });
    const result = extractApiFieldErrors(err, KNOWN_FIELDS);
    expect(result.fieldErrors).toEqual({ email: "Email некорректен или уже используется" });
    expect(result.genericErrors).toEqual([]);
  });

  it("routes errors for unknown fields into genericErrors", () => {
    const err = makeAxiosError({
      errors: [{ field: "captcha", message: "Captcha failed" }],
    });
    const result = extractApiFieldErrors(err, KNOWN_FIELDS);
    expect(result.fieldErrors).toEqual({});
    expect(result.genericErrors).toEqual(["Captcha failed"]);
  });

  it("routes errors without a field into genericErrors", () => {
    const err = makeAxiosError({
      errors: [{ message: "General failure" }],
    });
    const result = extractApiFieldErrors(err, KNOWN_FIELDS);
    expect(result.genericErrors).toEqual(["General failure"]);
  });

  it("skips errors without any resolvable message", () => {
    const err = makeAxiosError({
      errors: [{ field: "email" }],
    });
    const result = extractApiFieldErrors(err, KNOWN_FIELDS);
    expect(result.fieldErrors).toEqual({});
    expect(result.genericErrors).toEqual([]);
  });

  it("handles a mix of known, unknown and missing-field errors", () => {
    const err = makeAxiosError({
      errors: [
        { field: "email", message: "Email invalid" },
        { field: "captcha", message: "Captcha failed" },
        { message: "General failure" },
      ],
    });
    const result = extractApiFieldErrors(err, KNOWN_FIELDS);
    expect(result.fieldErrors).toEqual({ email: "Email invalid" });
    expect(result.genericErrors).toEqual(["Captcha failed", "General failure"]);
  });

  it("handles a response with no errors array", () => {
    const err = makeAxiosError({});
    const result = extractApiFieldErrors(err, KNOWN_FIELDS);
    expect(result).toEqual({ fieldErrors: {}, genericErrors: [] });
  });
});
