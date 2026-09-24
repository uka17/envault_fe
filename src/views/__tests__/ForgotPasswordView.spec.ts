import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { AxiosError } from "axios";
import ForgotPasswordView from "../ForgotPasswordView.vue";
import { mountWithProviders } from "@/test/mountWithProviders";
import { requestPasswordResetApi } from "@/api/authApi";

vi.mock("@/api/authApi", () => ({
  loginApi: vi.fn(),
  checkAuthApi: vi.fn(),
  logoutApi: vi.fn(),
  refreshTokenApi: vi.fn(),
  requestPasswordResetApi: vi.fn(),
  confirmPasswordResetApi: vi.fn(),
}));

/** Builds a minimal AxiosError carrying the given status, response body and headers. */
function makeApiError(
  status: number,
  code: string,
  headers: Record<string, string> = {},
): AxiosError {
  const err = new AxiosError("Request failed");
  err.response = {
    data: { code, message: code },
    status,
    statusText: "",
    headers,
    config: {} as never,
  };
  return err;
}

/**
 * Mounts the view, types an email and submits the form.
 * @param email Value typed into the email field.
 * @returns The mounted wrapper.
 */
async function submitEmail(email: string) {
  const { wrapper } = await mountWithProviders(ForgotPasswordView);
  await wrapper.find("input").setValue(email);
  await wrapper.find("button.submit-btn").trigger("click");
  await flushPromises();
  await flushPromises();
  return wrapper;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ForgotPasswordView.vue", () => {
  it("does not call the API when the email is invalid", async () => {
    await submitEmail("not-an-email");

    expect(requestPasswordResetApi).not.toHaveBeenCalled();
  });

  it("requests a reset link and replaces the form with a neutral confirmation", async () => {
    vi.mocked(requestPasswordResetApi).mockResolvedValue(undefined);

    const wrapper = await submitEmail("john@example.com");

    expect(requestPasswordResetApi).toHaveBeenCalledWith("john@example.com");
    expect(wrapper.find(".sent-message").exists()).toBe(true);
    expect(wrapper.find("form").exists()).toBe(false);
    // The confirmation must not echo the address back or claim an account exists.
    expect(wrapper.find(".sent-message").text()).not.toContain("john@example.com");
  });

  it("shows the retry time in minutes when the server rate-limits the request", async () => {
    vi.mocked(requestPasswordResetApi).mockRejectedValue(
      makeApiError(429, "password_reset_rate_limited", { "retry-after": "601" }),
    );

    const wrapper = await submitEmail("john@example.com");

    expect(wrapper.find(".submit-error").text()).toContain("Try again in 11 minutes");
    expect(wrapper.find(".sent-message").exists()).toBe(false);
  });

  it("falls back to a generic rate-limit message when Retry-After is missing", async () => {
    vi.mocked(requestPasswordResetApi).mockRejectedValue(
      makeApiError(429, "password_reset_rate_limited"),
    );

    const wrapper = await submitEmail("john@example.com");

    expect(wrapper.find(".submit-error").text()).toContain("Too many password reset attempts");
  });

  it("shows a connection error when the request fails without a response", async () => {
    vi.mocked(requestPasswordResetApi).mockRejectedValue(new AxiosError("Network Error"));

    const wrapper = await submitEmail("john@example.com");

    expect(wrapper.find(".submit-error").text()).toContain("Check your connection");
    expect(wrapper.find(".sent-message").exists()).toBe(false);
  });
});
