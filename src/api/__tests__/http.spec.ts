import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { http } from "../http";

vi.mock("../authApi", () => ({
  refreshTokenApi: vi.fn(),
  loginApi: vi.fn(),
  logoutApi: vi.fn(),
  checkAuthApi: vi.fn(),
  updateProfileApi: vi.fn(),
  updatePasswordApi: vi.fn(),
  registerApi: vi.fn(),
}));

import { refreshTokenApi } from "../authApi";

/** Grabs the fulfilled/rejected handlers registered on an axios interceptor manager. */
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

    expect((config as { headers: Record<string, string> }).headers.Authorization).toBe("Bearer abc123");
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
    vi.mocked(refreshTokenApi).mockRejectedValue(new Error("refresh failed"));
    const auth = useAuthStore();
    auth.accessToken = "old-token";

    const rejected = getResponseRejected();
    const error = { response: { status: 401 }, config: { url: "/stashes", headers: {} } };

    await expect(rejected(error as never)).rejects.toBe(error);
    expect(auth.accessToken).toBeNull();
  });
});
