import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "../auth";
import {
  loginApi,
  logoutApi,
  refreshTokenApi,
  checkAuthApi,
  updateNameApi,
  requestEmailChangeApi,
  confirmEmailChangeApi,
  resendEmailChangeApi,
  updatePasswordApi,
  registerApi,
  verifyEmailApi,
  resendVerificationApi,
  requestPasswordResetApi,
  confirmPasswordResetApi,
} from "@/api/authApi";

vi.mock("@/api/authApi", () => ({
  loginApi: vi.fn(),
  logoutApi: vi.fn(),
  refreshTokenApi: vi.fn(),
  checkAuthApi: vi.fn(),
  updateNameApi: vi.fn(),
  requestEmailChangeApi: vi.fn(),
  confirmEmailChangeApi: vi.fn(),
  resendEmailChangeApi: vi.fn(),
  updatePasswordApi: vi.fn(),
  registerApi: vi.fn(),
  verifyEmailApi: vi.fn(),
  resendVerificationApi: vi.fn(),
  requestPasswordResetApi: vi.fn(),
  confirmPasswordResetApi: vi.fn(),
}));

const user = {
  id: 1,
  email: "a@b.com",
  pendingEmail: null,
  name: "A",
  emailVerifiedAt: "2025-01-01",
  createdOn: "",
  modifiedOn: "",
};

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

describe("verifyEmail", () => {
  it("delegates to verifyEmailApi", async () => {
    vi.mocked(verifyEmailApi).mockResolvedValue(undefined);
    const auth = useAuthStore();

    await auth.verifyEmail("abc123");

    expect(verifyEmailApi).toHaveBeenCalledWith("abc123");
  });
});

describe("resendVerification", () => {
  it("delegates to resendVerificationApi", async () => {
    vi.mocked(resendVerificationApi).mockResolvedValue(undefined);
    const auth = useAuthStore();

    await auth.resendVerification("a@b.com");

    expect(resendVerificationApi).toHaveBeenCalledWith("a@b.com");
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
  it("clears the token, user and persisted session flag", () => {
    const auth = useAuthStore();
    auth.accessToken = "tok";
    auth.user = user;

    localStorage.setItem("hasSession", "1");
    auth.clearAuth();
    expect(localStorage.getItem("hasSession")).toBeNull();

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

describe("updateName", () => {
  it("updates the user with the API response", async () => {
    const updated = { ...user, name: "New Name" };
    vi.mocked(updateNameApi).mockResolvedValue(updated);
    const auth = useAuthStore();

    await auth.updateName("New Name");

    expect(updateNameApi).toHaveBeenCalledWith("New Name");
    expect(auth.user).toEqual(updated);
  });
});

describe("requestEmailChange", () => {
  it("updates the user with the API response", async () => {
    const updated = { ...user, pendingEmail: "new@b.com" };
    vi.mocked(requestEmailChangeApi).mockResolvedValue(updated);
    const auth = useAuthStore();

    await auth.requestEmailChange("new@b.com");

    expect(requestEmailChangeApi).toHaveBeenCalledWith("new@b.com");
    expect(auth.user).toEqual(updated);
  });
});

describe("confirmEmailChange", () => {
  it("clears local auth state on success", async () => {
    vi.mocked(confirmEmailChangeApi).mockResolvedValue(undefined);
    const auth = useAuthStore();
    auth.accessToken = "tok";
    auth.user = user;
    localStorage.setItem("hasSession", "1");

    await auth.confirmEmailChange("tok123");

    expect(confirmEmailChangeApi).toHaveBeenCalledWith("tok123");
    expect(auth.accessToken).toBeNull();
    expect(auth.user).toBeNull();
    expect(localStorage.getItem("hasSession")).toBeNull();
  });

  it("leaves auth state untouched and propagates the error when the token is invalid", async () => {
    vi.mocked(confirmEmailChangeApi).mockRejectedValue(new Error("invalid token"));
    const auth = useAuthStore();
    auth.accessToken = "tok";
    auth.user = user;

    await expect(auth.confirmEmailChange("bad")).rejects.toThrow("invalid token");
    expect(auth.accessToken).toBe("tok");
    expect(auth.user).toEqual(user);
  });
});

describe("resendEmailChange", () => {
  it("delegates to resendEmailChangeApi", async () => {
    vi.mocked(resendEmailChangeApi).mockResolvedValue(undefined);
    const auth = useAuthStore();

    await auth.resendEmailChange();

    expect(resendEmailChangeApi).toHaveBeenCalled();
  });
});

describe("updatePassword", () => {
  it("delegates to updatePasswordApi", async () => {
    vi.mocked(updatePasswordApi).mockResolvedValue(undefined);
    const auth = useAuthStore();

    await auth.updatePassword({ currentPassword: "old", newPassword: "New1word" });

    expect(updatePasswordApi).toHaveBeenCalledWith({
      currentPassword: "old",
      newPassword: "New1word",
    });
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

describe("requestPasswordReset", () => {
  it("delegates to requestPasswordResetApi without touching auth state", async () => {
    vi.mocked(requestPasswordResetApi).mockResolvedValue(undefined);
    const auth = useAuthStore();
    auth.accessToken = "tok";

    await auth.requestPasswordReset("a@b.com");

    expect(requestPasswordResetApi).toHaveBeenCalledWith("a@b.com");
    expect(auth.accessToken).toBe("tok");
  });
});

describe("confirmPasswordReset", () => {
  it("clears local auth state on success because the server revoked every session", async () => {
    vi.mocked(confirmPasswordResetApi).mockResolvedValue(undefined);
    const auth = useAuthStore();
    auth.accessToken = "tok";
    auth.user = user;
    localStorage.setItem("hasSession", "1");

    await auth.confirmPasswordReset("reset-token", "New1word");

    expect(confirmPasswordResetApi).toHaveBeenCalledWith({ token: "reset-token", newPassword: "New1word" });
    expect(auth.accessToken).toBeNull();
    expect(auth.user).toBeNull();
    expect(localStorage.getItem("hasSession")).toBeNull();
  });

  it("leaves auth state untouched and propagates the error when the token is rejected", async () => {
    vi.mocked(confirmPasswordResetApi).mockRejectedValue(new Error("invalid token"));
    const auth = useAuthStore();
    auth.accessToken = "tok";
    auth.user = user;

    await expect(auth.confirmPasswordReset("bad", "New1word")).rejects.toThrow("invalid token");
    expect(auth.accessToken).toBe("tok");
    expect(auth.user).toEqual(user);
  });
});
