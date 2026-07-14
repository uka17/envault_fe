export interface ParsedUserAgent {
  browser: string;
  os: string;
}

const BROWSER_PATTERNS: Array<[RegExp, string]> = [
  [/Edg\/([\d.]+)/, "Edge"],
  [/OPR\/([\d.]+)/, "Opera"],
  [/Chrome\/([\d.]+)/, "Chrome"],
  [/Firefox\/([\d.]+)/, "Firefox"],
  [/Version\/([\d.]+).*Safari/, "Safari"],
];

const OS_PATTERNS: Array<[RegExp, string]> = [
  [/Windows NT/, "Windows"],
  [/Android/, "Android"],
  [/iPhone|iPad|iPod/, "iOS"],
  [/Mac OS X/, "macOS"],
  [/Linux/, "Linux"],
];

/**
 * Parse a browser/OS pair out of a raw `User-Agent` header string for display purposes.
 * Falls back to "Unknown" for either part when no pattern matches.
 * @param userAgent Raw User-Agent header string.
 * @returns Human-readable browser name (with major version, if found) and OS name.
 */
export function parseUserAgent(userAgent: string | undefined | null): ParsedUserAgent {
  const ua = userAgent ?? "";

  let browser = "Unknown";
  for (const [pattern, name] of BROWSER_PATTERNS) {
    const match = ua.match(pattern);
    if (match) {
      const version = match[1]?.split(".")[0];
      browser = version ? `${name} ${version}` : name;
      break;
    }
  }

  let os = "Unknown";
  for (const [pattern, name] of OS_PATTERNS) {
    if (pattern.test(ua)) {
      os = name;
      break;
    }
  }

  return { browser, os };
}
