import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "../auth";
import {
  loginApi,
  logoutApi,
  refreshTokenApi,
  checkAuthApi,
  updateProfileApi,
  updatePasswordApi,
  registerApi,
} from "@/api/authApi";

vi.mock("@/api/authApi", () => ({
  loginApi: vi.fn(),
  logoutApi: vi.fn(),
  refreshTokenApi: vi.fn(),
  checkAuthApi: vi.fn(),
  updateProfileApi: vi.fn(),
  updatePasswordApi: vi.fn(),
  registerApi: vi.fn(),
}));

const user = { id: 1, email: "a@b.com", name: "A", createdOn: "", modifiedOn: "" };

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
  localStorage.clear();
});

describe("isAuthenticated getter", () => {
  it("is false when there is no access token", () => {
    const auth = useAuthStore();
    expect(auth.isAuthenticated).toBe(false);
  });

  it("is true when an access token is set", () => {
    const auth = useAuthStore();
    auth.accessToken = "tok";
    expect(auth.isAuthenticated).toBe(true);
  });
});

describe("login", () => {
  it("stores the token, sets the session flag, and fetches the user", async () => {
    vi.mocked(loginApi).mockResolvedValue("tok123");
    vi.mocked(checkAuthApi).mockResolvedValue(user);
    const auth = useAuthStore();

    await auth.login("a@b.com", "pw");

    expect(auth.accessToken).toBe("tok123");
    expect(auth.user).toEqual(user);
    expect(localStorage.getItem("hasSession")).toBe("1");
  });
});

describe("register", () => {
  it("delegates to registerApi without authenticating", async () => {
    vi.mocked(registerApi).mockResolvedValue(user);
    const auth = useAuthStore();

    await auth.register({ email: "a@b.com", password: "pw", name: "A" });

    expect(registerApi).toHaveBeenCalledWith({ email: "a@b.com", password: "pw", name: "A" });
    expect(auth.accessToken).toBeNull();
  });
});

describe("refresh", () => {
  it("updates the access token and returns it", async () => {
    vi.mocked(refreshTokenApi).mockResolvedValue("new-tok");
    const auth = useAuthStore();

    const token = await auth.refresh();

    expect(token).toBe("new-tok");
    expect(auth.accessToken).toBe("new-tok");
  });
});

describe("clearAuth", () => {
  it("clears the token and user in memory", () => {
    const auth = useAuthStore();
    auth.accessToken = "tok";
    auth.user = user;

    auth.clearAuth();

    expect(auth.accessToken).toBeNull();
    expect(auth.user).toBeNull();
  });
});

describe("logout", () => {
  it("revokes the token and clears local state", async () => {
    vi.mocked(logoutApi).mockResolvedValue(undefined);
    const auth = useAuthStore();
    auth.accessToken = "tok";
    auth.user = user;
    localStorage.setItem("hasSession", "1");

    await auth.logout();

    expect(auth.accessToken).toBeNull();
    expect(auth.user).toBeNull();
    expect(localStorage.getItem("hasSession")).toBeNull();
  });

  it("still clears local state when the server call fails", async () => {
    vi.mocked(logoutApi).mockRejectedValue(new Error("network error"));
    const auth = useAuthStore();
    auth.accessToken = "tok";

    await expect(auth.logout()).rejects.toThrow("network error");
    expect(auth.accessToken).toBeNull();
  });
});

describe("fetchUser", () => {
  it("does nothing when there is no access token", async () => {
    const auth = useAuthStore();

    await auth.fetchUser();

    expect(checkAuthApi).not.toHaveBeenCalled();
  });

  it("sets the user on success", async () => {
    vi.mocked(checkAuthApi).mockResolvedValue(user);
    const auth = useAuthStore();
    auth.accessToken = "tok";

    await auth.fetchUser();

    expect(auth.user).toEqual(user);
  });

  it("clears auth state when the request fails", async () => {
    vi.mocked(checkAuthApi).mockRejectedValue(new Error("unauthorized"));
    const auth = useAuthStore();
    auth.accessToken = "tok";

    await auth.fetchUser();

    expect(auth.accessToken).toBeNull();
    expect(auth.user).toBeNull();
  });
});

describe("updateProfile", () => {
  it("updates the user with the API response", async () => {
    const updated = { ...user, name: "New Name" };
    vi.mocked(updateProfileApi).mockResolvedValue(updated);
    const auth = useAuthStore();

    await auth.updateProfile({ name: "New Name" });

    expect(auth.user).toEqual(updated);
  });
});

describe("updatePassword", () => {
  it("delegates to updatePasswordApi", async () => {
    vi.mocked(updatePasswordApi).mockResolvedValue(undefined);
    const auth = useAuthStore();

    await auth.updatePassword({ currentPassword: "old", newPassword: "New1word" });

    expect(updatePasswordApi).toHaveBeenCalledWith({ currentPassword: "old", newPassword: "New1word" });
  });
});

describe("init", () => {
  it("does nothing when there is no session flag", async () => {
    const auth = useAuthStore();

    await auth.init();

    expect(refreshTokenApi).not.toHaveBeenCalled();
  });

  it("refreshes and fetches the user when a session flag is present", async () => {
    localStorage.setItem("hasSession", "1");
    vi.mocked(refreshTokenApi).mockResolvedValue("tok");
    vi.mocked(checkAuthApi).mockResolvedValue(user);
    const auth = useAuthStore();

    await auth.init();

    expect(auth.accessToken).toBe("tok");
    expect(auth.user).toEqual(user);
  });

  it("clears state and the session flag when refresh fails", async () => {
    localStorage.setItem("hasSession", "1");
    vi.mocked(refreshTokenApi).mockRejectedValue(new Error("expired"));
    const auth = useAuthStore();

    await auth.init();

    expect(auth.accessToken).toBeNull();
    expect(auth.user).toBeNull();
    expect(localStorage.getItem("hasSession")).toBeNull();
  });
});
