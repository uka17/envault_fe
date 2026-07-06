import { describe, it, expect } from "vitest";
import { AxiosError } from "axios";
import { getApiErrorMessage, extractApiFieldErrors } from "../apiError";

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
  it("returns undefined for non-axios errors", () => {
    expect(getApiErrorMessage(new Error("boom"))).toBeUndefined();
    expect(getApiErrorMessage("plain string")).toBeUndefined();
    expect(getApiErrorMessage(undefined)).toBeUndefined();
  });

  it("returns undefined when the response has no errors array", () => {
    const err = makeAxiosError({ message: "Something went wrong" });
    expect(getApiErrorMessage(err)).toBeUndefined();
  });

  it("returns the first error's translation", () => {
    const err = makeAxiosError({
      errors: [{ path: "email", msg: { translation: "Email is invalid" } }],
    });
    expect(getApiErrorMessage(err)).toBe("Email is invalid");
  });
});

describe("extractApiFieldErrors", () => {
  const KNOWN_FIELDS = ["name", "email", "password"] as const;

  it("returns empty results for non-axios errors", () => {
    const result = extractApiFieldErrors(new Error("boom"), KNOWN_FIELDS);
    expect(result).toEqual({ fieldErrors: {}, genericErrors: [] });
  });

  it("maps known field errors onto fieldErrors", () => {
    const err = makeAxiosError({
      errors: [{ path: "email", msg: { translation: "Email already used" } }],
    });
    const result = extractApiFieldErrors(err, KNOWN_FIELDS);
    expect(result.fieldErrors).toEqual({ email: "Email already used" });
    expect(result.genericErrors).toEqual([]);
  });

  it("routes errors for unknown fields into genericErrors", () => {
    const err = makeAxiosError({
      errors: [{ path: "captcha", msg: { translation: "Captcha failed" } }],
    });
    const result = extractApiFieldErrors(err, KNOWN_FIELDS);
    expect(result.fieldErrors).toEqual({});
    expect(result.genericErrors).toEqual(["Captcha failed"]);
  });

  it("routes errors without a path into genericErrors", () => {
    const err = makeAxiosError({
      errors: [{ msg: { translation: "General failure" } }],
    });
    const result = extractApiFieldErrors(err, KNOWN_FIELDS);
    expect(result.genericErrors).toEqual(["General failure"]);
  });

  it("skips errors without a translation message", () => {
    const err = makeAxiosError({
      errors: [{ path: "email", msg: {} }],
    });
    const result = extractApiFieldErrors(err, KNOWN_FIELDS);
    expect(result.fieldErrors).toEqual({});
    expect(result.genericErrors).toEqual([]);
  });

  it("handles a mix of known, unknown and missing-path errors", () => {
    const err = makeAxiosError({
      errors: [
        { path: "email", msg: { translation: "Email invalid" } },
        { path: "captcha", msg: { translation: "Captcha failed" } },
        { msg: { translation: "General failure" } },
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
