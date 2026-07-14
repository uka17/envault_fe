import { describe, it, expect } from "vitest";
import { parseUserAgent } from "../userAgent";

describe("parseUserAgent", () => {
  it("parses Chrome on macOS", () => {
    const ua =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    expect(parseUserAgent(ua)).toEqual({ browser: "Chrome 120", os: "macOS" });
  });

  it("parses Safari on iOS", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
    expect(parseUserAgent(ua)).toEqual({ browser: "Safari 17", os: "iOS" });
  });

  it("parses Firefox on Windows", () => {
    const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0";
    expect(parseUserAgent(ua)).toEqual({ browser: "Firefox 121", os: "Windows" });
  });

  it("falls back to Unknown for unrecognized or missing values", () => {
    expect(parseUserAgent("")).toEqual({ browser: "Unknown", os: "Unknown" });
    expect(parseUserAgent(null)).toEqual({ browser: "Unknown", os: "Unknown" });
    expect(parseUserAgent(undefined)).toEqual({ browser: "Unknown", os: "Unknown" });
  });
});
