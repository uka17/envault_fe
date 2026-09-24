import { describe, it, expect, vi, beforeEach } from "vitest";
import { http } from "../http";
import {
  registerApi,
  loginApi,
  refreshTokenApi,
  logoutApi,
  checkAuthApi,
  updateNameApi,
  requestEmailChangeApi,
  confirmEmailChangeApi,
  resendEmailChangeApi,
  updatePasswordApi,
  verifyEmailApi,
  resendVerificationApi,
} from "../authApi";

vi.mock("../http", () => ({
  http: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockedHttp = vi.mocked(http, true);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("registerApi", () => {
  it("posts payload to /users and returns the created user", async () => {
    const user = { id: 1, email: "a@b.com", name: "A", createdOn: "", modifiedOn: "" };
    mockedHttp.post.mockResolvedValue({ data: user });

    const result = await registerApi({ email: "a@b.com", password: "Passw0rd", name: "A" });

    expect(mockedHttp.post).toHaveBeenCalledWith("/users", {
      email: "a@b.com",
      password: "Passw0rd",
      name: "A",
    });
    expect(result).toEqual(user);
  });
});

describe("loginApi", () => {
  it("posts credentials and returns the token", async () => {
    mockedHttp.post.mockResolvedValue({ data: { token: "tok123" } });

    const token = await loginApi({ email: "a@b.com", password: "pw" });

    expect(mockedHttp.post).toHaveBeenCalledWith("/users/login", { email: "a@b.com", password: "pw" });
    expect(token).toBe("tok123");
  });
});

describe("refreshTokenApi", () => {
  it("posts to the refresh endpoint and returns the new token", async () => {
    mockedHttp.post.mockResolvedValue({ data: { token: "newtok" } });

    const token = await refreshTokenApi();

    expect(mockedHttp.post).toHaveBeenCalledWith("/token/refresh");
    expect(token).toBe("newtok");
  });
});

describe("logoutApi", () => {
  it("posts to the logout endpoint", async () => {
    mockedHttp.post.mockResolvedValue({ data: undefined });

    await logoutApi();

    expect(mockedHttp.post).toHaveBeenCalledWith("/users/logout");
  });
});

describe("checkAuthApi", () => {
  it("gets the current user profile", async () => {
    const user = { id: 1, email: "a@b.com", name: "A", createdOn: "", modifiedOn: "" };
    mockedHttp.get.mockResolvedValue({ data: user });

    const result = await checkAuthApi();

    expect(mockedHttp.get).toHaveBeenCalledWith("/users/whoami");
    expect(result).toEqual(user);
  });
});

describe("updateNameApi", () => {
  it("patches the name and returns the updated user", async () => {
    const user = { id: 1, email: "a@b.com", name: "New Name", createdOn: "", modifiedOn: "" };
    mockedHttp.patch.mockResolvedValue({ data: user });

    const result = await updateNameApi("New Name");

    expect(mockedHttp.patch).toHaveBeenCalledWith("/users/me", { name: "New Name" });
    expect(result).toEqual(user);
  });
});

describe("requestEmailChangeApi", () => {
  it("posts the new email and returns the updated user", async () => {
    const user = { id: 1, email: "a@b.com", pendingEmail: "new@b.com", name: "A", createdOn: "", modifiedOn: "" };
    mockedHttp.post.mockResolvedValue({ data: user });

    const result = await requestEmailChangeApi("new@b.com");

    expect(mockedHttp.post).toHaveBeenCalledWith("/users/email-change/request", { email: "new@b.com" });
    expect(result).toEqual(user);
  });
});

describe("confirmEmailChangeApi", () => {
  it("posts the token to the confirm endpoint", async () => {
    mockedHttp.post.mockResolvedValue({ data: undefined });

    await confirmEmailChangeApi("tok123");

    expect(mockedHttp.post).toHaveBeenCalledWith("/users/email-change/confirm", { token: "tok123" });
  });
});

describe("resendEmailChangeApi", () => {
  it("posts to the resend endpoint", async () => {
    mockedHttp.post.mockResolvedValue({ data: undefined });

    await resendEmailChangeApi();

    expect(mockedHttp.post).toHaveBeenCalledWith("/users/email-change/resend");
  });
});

describe("updatePasswordApi", () => {
  it("patches the password endpoint", async () => {
    mockedHttp.patch.mockResolvedValue({ data: undefined });

    await updatePasswordApi({ currentPassword: "old", newPassword: "New1word" });

    expect(mockedHttp.patch).toHaveBeenCalledWith("/users/me/password", {
      currentPassword: "old",
      newPassword: "New1word",
    });
  });
});

describe("verifyEmailApi", () => {
  it("posts the code to the verify-email endpoint", async () => {
    mockedHttp.post.mockResolvedValue({ data: undefined });

    await verifyEmailApi("abc123");

    expect(mockedHttp.post).toHaveBeenCalledWith("/users/verify-email", { code: "abc123" });
  });
});

describe("resendVerificationApi", () => {
  it("posts the email to the resend endpoint", async () => {
    mockedHttp.post.mockResolvedValue({ data: undefined });

    await resendVerificationApi("a@b.com");

    expect(mockedHttp.post).toHaveBeenCalledWith("/users/verify-email/resend", { email: "a@b.com" });
  });
});
