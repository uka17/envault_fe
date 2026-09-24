import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { http, setSessionExpiredHandler } from "../http";

vi.mock("../authApi", () => ({
  refreshTokenApi: vi.fn(),
  loginApi: vi.fn(),
  logoutApi: vi.fn(),
  checkAuthApi: vi.fn(),
  updateNameApi: vi.fn(),
  requestEmailChangeApi: vi.fn(),
  confirmEmailChangeApi: vi.fn(),
  resendEmailChangeApi: vi.fn(),
  updatePasswordApi: vi.fn(),
  registerApi: vi.fn(),
}));

import { refreshTokenApi } from "../authApi";

function interceptorHandlers<T>(manager: unknown) {
  return (manager as { handlers: Array<{ fulfilled: T; rejected: T }> }).handlers[0];
}

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});

describe("request interceptor", () => {
  it("attaches the Authorization header when an access token is present", async () => {
    const auth = useAuthStore();
    auth.accessToken = "abc123";
    const { fulfilled } = interceptorHandlers<(config: never) => never>(http.interceptors.request);

    const config = await fulfilled({ headers: {} } as never);

    expect((config as { headers: Record<string, string> }).headers.Authorization).toBe(
      "Bearer abc123",
    );
  });

  it("leaves the headers untouched when there is no access token", async () => {
    const { fulfilled } = interceptorHandlers<(config: never) => never>(http.interceptors.request);

    const config = await fulfilled({ headers: {} } as never);

    expect((config as { headers: Record<string, string> }).headers.Authorization).toBeUndefined();
  });
});

describe("response interceptor", () => {
  const getResponseRejected = () =>
    interceptorHandlers<(err: never) => never>(http.interceptors.response).rejected;

  it("rejects immediately for non-401 errors", async () => {
    const rejected = getResponseRejected();
    const error = { response: { status: 500 }, config: { url: "/stashes" } };

    await expect(rejected(error as never)).rejects.toBe(error);
  });

  it("rejects immediately for requests already retried", async () => {
    const rejected = getResponseRejected();
    const error = { response: { status: 401 }, config: { url: "/stashes", _retry: true } };

    await expect(rejected(error as never)).rejects.toBe(error);
  });

  it("rejects immediately for login/refresh URLs to avoid refresh loops", async () => {
    const rejected = getResponseRejected();
    const error = { response: { status: 401 }, config: { url: "/users/login" } };

    await expect(rejected(error as never)).rejects.toBe(error);
  });

  it("refreshes the token and retries the original request on 401", async () => {
    vi.mocked(refreshTokenApi).mockResolvedValue("new-token");
    const auth = useAuthStore();
    auth.accessToken = "old-token";

    const originalAdapter = http.defaults.adapter;
    const adapter = vi.fn().mockResolvedValue({
      data: "ok",
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    });
    http.defaults.adapter = adapter;

    const rejected = getResponseRejected();
    const error = { response: { status: 401 }, config: { url: "/stashes", headers: {} } };

    const result = await rejected(error as never);

    expect(auth.accessToken).toBe("new-token");
    expect(adapter).toHaveBeenCalled();
    expect((result as { data: string }).data).toBe("ok");
    http.defaults.adapter = originalAdapter;
  });

  it("clears auth and rejects when the refresh call itself fails", async () => {
    vi.mocked(refreshTokenApi).mockRejectedValue({ isAxiosError: true, response: { status: 401 } });
    const auth = useAuthStore();
    auth.accessToken = "old-token";

    const rejected = getResponseRejected();
    const error = { response: { status: 401 }, config: { url: "/stashes", headers: {} } };

    await expect(rejected(error as never)).rejects.toBe(error);
    expect(auth.accessToken).toBeNull();
  });
});

it("rejects concurrent requests and expires the session once", async () => {
  const navigate = vi.fn().mockResolvedValue(undefined);
  setSessionExpiredHandler(navigate);
  const auth = useAuthStore();
  auth.accessToken = "old";
  localStorage.setItem("hasSession", "1");
  vi.mocked(refreshTokenApi).mockRejectedValue({ isAxiosError: true, response: { status: 401 } });
  const { rejected } = interceptorHandlers<(error: never) => Promise<unknown>>(
    http.interceptors.response,
  );
  const error = { response: { status: 401 }, config: { url: "/stashes" } };
  const results = await Promise.allSettled([
    rejected(error as never),
    rejected({ ...error, config: { url: "/users/whoami" } } as never),
  ]);
  expect(results.map((result) => result.status)).toEqual(["rejected", "rejected"]);
  expect(refreshTokenApi).toHaveBeenCalledTimes(1);
  expect(navigate).toHaveBeenCalledTimes(1);
  expect(auth.accessToken).toBeNull();
  expect(localStorage.getItem("hasSession")).toBeNull();
});

it.each([new Error("offline"), { isAxiosError: true, response: { status: 500 } }])(
  "preserves authentication on transient refresh failure: %s",
  async (failure) => {
    const navigate = vi.fn().mockResolvedValue(undefined);
    setSessionExpiredHandler(navigate);
    const auth = useAuthStore();
    auth.accessToken = "old";
    vi.mocked(refreshTokenApi).mockRejectedValue(failure);
    const { rejected } = interceptorHandlers<(error: never) => Promise<unknown>>(
      http.interceptors.response,
    );
    const error = { response: { status: 401 }, config: { url: "/stashes" } };
    await expect(rejected(error as never)).rejects.toBe(error);
    expect(auth.accessToken).toBe("old");
    expect(navigate).not.toHaveBeenCalled();
  },
);

it("retries concurrent requests with a single refreshed token", async () => {
  vi.mocked(refreshTokenApi).mockResolvedValue("shared-token");
  const originalAdapter = http.defaults.adapter;
  const adapter = vi
    .fn()
    .mockResolvedValue({ data: "ok", status: 200, statusText: "OK", headers: {}, config: {} });
  http.defaults.adapter = adapter;
  try {
    const { rejected } = interceptorHandlers<(error: never) => Promise<unknown>>(
      http.interceptors.response,
    );
    await Promise.all([
      rejected({ response: { status: 401 }, config: { url: "/stashes" } } as never),
      rejected({ response: { status: 401 }, config: { url: "/users/whoami" } } as never),
    ]);
    expect(refreshTokenApi).toHaveBeenCalledTimes(1);
    expect(adapter).toHaveBeenCalledTimes(2);
    for (const [config] of adapter.mock.calls) {
      expect(config.headers.Authorization).toBe("Bearer shared-token");
      expect(config._retry).toBe(true);
    }
  } finally {
    http.defaults.adapter = originalAdapter;
  }
});

it.each(["/users/verify-email", "/users/verify-email/resend", "/users/email-change/confirm"])(
  "does not refresh on public verification errors from %s",
  async (url) => {
    const navigate = vi.fn().mockResolvedValue(undefined);
    setSessionExpiredHandler(navigate);
    const { rejected } = interceptorHandlers<(error: never) => Promise<unknown>>(
      http.interceptors.response,
    );
    const error = { response: { status: 401 }, config: { url } };
    await expect(rejected(error as never)).rejects.toBe(error);
    expect(refreshTokenApi).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  },
);

it("still refreshes on a 401 from the authenticated email-change resend endpoint", async () => {
  vi.mocked(refreshTokenApi).mockResolvedValue("new-token");
  const originalAdapter = http.defaults.adapter;
  const adapter = vi
    .fn()
    .mockResolvedValue({ data: "ok", status: 200, statusText: "OK", headers: {}, config: {} });
  http.defaults.adapter = adapter;
  try {
    const { rejected } = interceptorHandlers<(error: never) => Promise<unknown>>(
      http.interceptors.response,
    );
    const error = { response: { status: 401 }, config: { url: "/users/email-change/resend", headers: {} } };

    await rejected(error as never);

    expect(refreshTokenApi).toHaveBeenCalled();
  } finally {
    http.defaults.adapter = originalAdapter;
  }
});
