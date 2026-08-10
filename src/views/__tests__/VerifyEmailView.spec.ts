import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import VerifyEmailView from "../VerifyEmailView.vue";
import { mountWithProviders } from "@/test/mountWithProviders";
import { verifyEmailApi, resendVerificationApi } from "@/api/authApi";

vi.mock("@/api/authApi", () => ({
  loginApi: vi.fn(),
  checkAuthApi: vi.fn(),
  logoutApi: vi.fn(),
  refreshTokenApi: vi.fn(),
  updateProfileApi: vi.fn(),
  updatePasswordApi: vi.fn(),
  registerApi: vi.fn(),
  verifyEmailApi: vi.fn(),
  resendVerificationApi: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("VerifyEmailView.vue", () => {
  it("shows the email address from the query string", async () => {
    const { wrapper, router } = await mountWithProviders(VerifyEmailView);

    await router.push({ path: "/verify-email", query: { email: "a@b.com" } });
    await flushPromises();

    expect(wrapper.text()).toContain("a@b.com");
  });

  it("verifies the code and redirects to login on success", async () => {
    vi.mocked(verifyEmailApi).mockResolvedValue(undefined);
    const { wrapper, router } = await mountWithProviders(VerifyEmailView);
    const pushSpy = vi.spyOn(router, "push");

    await router.push({ path: "/verify-email", query: { email: "a@b.com" } });
    await flushPromises();

    await wrapper.find("input").setValue("abc123");
    await wrapper.find("button.submit-btn").trigger("click");
    await flushPromises();

    expect(verifyEmailApi).toHaveBeenCalledWith("abc123");
    expect(pushSpy).toHaveBeenCalledWith({ name: "login", query: { email: "a@b.com" } });
  });

  it("shows an error message when the code is rejected", async () => {
    vi.mocked(verifyEmailApi).mockRejectedValue(new Error("invalid code"));
    const { wrapper, router } = await mountWithProviders(VerifyEmailView);

    await router.push({ path: "/verify-email", query: { email: "a@b.com" } });
    await flushPromises();

    await wrapper.find("input").setValue("wrong");
    await wrapper.find("button.submit-btn").trigger("click");
    await flushPromises();

    expect(wrapper.find(".submit-error").exists()).toBe(true);
  });

  it("auto-submits the code found in the query string", async () => {
    vi.mocked(verifyEmailApi).mockResolvedValue(undefined);
    const { router } = await mountWithProviders(VerifyEmailView);
    const pushSpy = vi.spyOn(router, "push");

    await router.push({ path: "/verify-email", query: { email: "a@b.com", code: "fromlink" } });
    await flushPromises();
    await flushPromises();

    expect(verifyEmailApi).toHaveBeenCalledWith("fromlink");
    expect(pushSpy).toHaveBeenCalledWith({ name: "login", query: { email: "a@b.com" } });
  });

  it("resends the verification code", async () => {
    vi.mocked(resendVerificationApi).mockResolvedValue(undefined);
    const { wrapper, router } = await mountWithProviders(VerifyEmailView);

    await router.push({ path: "/verify-email", query: { email: "a@b.com" } });
    await flushPromises();

    await wrapper.find("button.text-link").trigger("click");
    await flushPromises();

    expect(resendVerificationApi).toHaveBeenCalledWith("a@b.com");
  });
});
