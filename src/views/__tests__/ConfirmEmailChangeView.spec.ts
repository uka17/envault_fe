import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import ConfirmEmailChangeView from "../ConfirmEmailChangeView.vue";
import { mountWithProviders } from "@/test/mountWithProviders";
import { confirmEmailChangeApi } from "@/api/authApi";

vi.mock("@/api/authApi", () => ({
  loginApi: vi.fn(),
  checkAuthApi: vi.fn(),
  logoutApi: vi.fn(),
  refreshTokenApi: vi.fn(),
  updateNameApi: vi.fn(),
  requestEmailChangeApi: vi.fn(),
  confirmEmailChangeApi: vi.fn(),
  resendEmailChangeApi: vi.fn(),
  updatePasswordApi: vi.fn(),
  registerApi: vi.fn(),
  verifyEmailApi: vi.fn(),
  resendVerificationApi: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ConfirmEmailChangeView.vue", () => {
  it("confirms the token from the query string and shows a success message", async () => {
    vi.mocked(confirmEmailChangeApi).mockResolvedValue(undefined);
    const { wrapper, router } = await mountWithProviders(ConfirmEmailChangeView);

    await router.push({ path: "/confirm-email-change", query: { token: "abc123" } });
    await flushPromises();

    expect(confirmEmailChangeApi).toHaveBeenCalledWith("abc123");
    expect(wrapper.text()).toContain("Email updated");
  });

  it("shows an error message when the token is invalid or expired", async () => {
    vi.mocked(confirmEmailChangeApi).mockRejectedValue(new Error("invalid token"));
    const { wrapper, router } = await mountWithProviders(ConfirmEmailChangeView);

    await router.push({ path: "/confirm-email-change", query: { token: "bad" } });
    await flushPromises();

    expect(wrapper.text()).toContain("invalid or has expired");
  });

  it("shows an error message when there is no token in the URL", async () => {
    const { wrapper, router } = await mountWithProviders(ConfirmEmailChangeView);

    await router.push({ path: "/confirm-email-change" });
    await flushPromises();

    expect(confirmEmailChangeApi).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("missing its token");
  });
});
