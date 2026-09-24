import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { AxiosError } from "axios";
import ResetPasswordView from "../ResetPasswordView.vue";
import { mountWithProviders } from "@/test/mountWithProviders";
import { confirmPasswordResetApi } from "@/api/authApi";
import { useAuthStore } from "@/stores/auth";

vi.mock("@/api/authApi", () => ({
  loginApi: vi.fn(),
  checkAuthApi: vi.fn(),
  logoutApi: vi.fn(),
  refreshTokenApi: vi.fn(),
  requestPasswordResetApi: vi.fn(),
  confirmPasswordResetApi: vi.fn(),
}));

const TOKEN = "a".repeat(64);

/** Builds a minimal AxiosError carrying the given status, response body and headers. */
function makeApiError(
  status: number,
  data: Record<string, unknown>,
  headers: Record<string, string> = {},
): AxiosError {
  const err = new AxiosError("Request failed");
  err.response = { data, status, statusText: "", headers, config: {} as never };
  return err;
}

/**
 * Mounts the view on the reset route with the given query.
 * @param query Route query, usually carrying the reset token.
 * @returns The mounted wrapper, pinia and router.
 */
async function mountAt(query: Record<string, string>) {
  const mounted = await mountWithProviders(ResetPasswordView);
  await mounted.router.push({ path: "/reset-password", query });
  await flushPromises();
  return mounted;
}

/**
 * Fills both password fields and submits the form.
 * @param wrapper Mounted view wrapper.
 * @param password New password value.
 * @param confirm Confirmation value.
 * @returns Nothing.
 */
async function submitPasswords(
  wrapper: Awaited<ReturnType<typeof mountAt>>["wrapper"],
  password: string,
  confirm = password,
) {
  const inputs = wrapper.findAll("input");
  await inputs[0].setValue(password);
  await inputs[1].setValue(confirm);
  await wrapper.find("button.submit-btn").trigger("click");
  await flushPromises();
  await flushPromises();
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ResetPasswordView.vue", () => {
  it("shows an invalid link state without a form when the token is missing", async () => {
    const { wrapper } = await mountAt({});

    expect(wrapper.find(".invalid-link").exists()).toBe(true);
    expect(wrapper.find("form").exists()).toBe(false);
    expect(wrapper.find(".request-link").attributes("href")).toBe("/forgot-password");
  });

  it("explains that resetting the password does not recover stash keys", async () => {
    const { wrapper } = await mountAt({ token: TOKEN });

    expect(wrapper.find(".keys-notice").text()).toContain("can't recover their encryption keys");
  });

  it("does not call the API when the passwords do not match", async () => {
    const { wrapper } = await mountAt({ token: TOKEN });

    await submitPasswords(wrapper, "New1word", "Other1word");

    expect(confirmPasswordResetApi).not.toHaveBeenCalled();
  });

  it("changes the password, clears local auth and sends the user to sign in", async () => {
    vi.mocked(confirmPasswordResetApi).mockResolvedValue(undefined);
    const { wrapper, router } = await mountAt({ token: TOKEN });
    const auth = useAuthStore();
    auth.accessToken = "stale";

    await submitPasswords(wrapper, "New1word");

    expect(confirmPasswordResetApi).toHaveBeenCalledWith({ token: TOKEN, newPassword: "New1word" });
    expect(auth.accessToken).toBeNull();
    expect(router.currentRoute.value.name).toBe("login");
  });

  it("hides the form and offers a new link when the token is expired or already used", async () => {
    vi.mocked(confirmPasswordResetApi).mockRejectedValue(
      makeApiError(400, { code: "password_reset_invalid" }),
    );
    const { wrapper, router } = await mountAt({ token: TOKEN });

    await submitPasswords(wrapper, "New1word");

    expect(wrapper.find(".invalid-link").exists()).toBe(true);
    expect(wrapper.find("form").exists()).toBe(false);
    expect(router.currentRoute.value.name).toBe("reset-password");
  });

  it("shows server password validation errors on the password field", async () => {
    vi.mocked(confirmPasswordResetApi).mockRejectedValue(
      makeApiError(422, {
        errors: [{ field: "newPassword", code: "password_format_incorrect", message: "bad" }],
      }),
    );
    const { wrapper } = await mountAt({ token: TOKEN });

    await submitPasswords(wrapper, "New1word");

    expect(wrapper.text()).toContain("Password should have minimum eight characters");
    expect(wrapper.find(".invalid-link").exists()).toBe(false);
  });

  it("shows the retry time when confirmations are rate-limited", async () => {
    vi.mocked(confirmPasswordResetApi).mockRejectedValue(
      makeApiError(429, { code: "password_reset_rate_limited" }, { "retry-after": "60" }),
    );
    const { wrapper } = await mountAt({ token: TOKEN });

    await submitPasswords(wrapper, "New1word");

    expect(wrapper.find(".submit-error").text()).toContain("Try again in 1 minute.");
  });
});
