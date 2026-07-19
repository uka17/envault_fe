import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import UnlockStashView from "../UnlockStashView.vue";
import { mountWithProviders } from "@/test/mountWithProviders";
import { getPublicStashApi } from "@/api/stashApi";
import { encryptStashBody } from "@/utils/stashCrypto";

vi.mock("@/api/stashApi", () => ({
  getPublicStashApi: vi.fn(),
}));

const token = "abcdefgh23456789jkmn";

const stashInfo = {
  sendAt: "2099-01-01T00:00:00.000Z",
  body: "not-a-valid-ciphertext",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("UnlockStashView.vue", () => {
  it("shows an invalid link message when the token cannot be resolved", async () => {
    vi.mocked(getPublicStashApi).mockRejectedValue(new Error("not found"));
    const { wrapper, router } = await mountWithProviders(UnlockStashView);

    await router.push({ path: `/unlock/${token}` });
    await flushPromises();
    await flushPromises();

    expect(getPublicStashApi).toHaveBeenCalledWith(token);
    expect(wrapper.text()).toContain("Link unavailable");
  });

  it("shows the key form once the link is validated", async () => {
    vi.mocked(getPublicStashApi).mockResolvedValue(stashInfo);
    const { wrapper, router } = await mountWithProviders(UnlockStashView);

    await router.push({ path: `/unlock/${token}` });
    await flushPromises();
    await flushPromises();

    expect(wrapper.find("input").exists()).toBe(true);
  });

  it("does not attempt decryption when the key is empty", async () => {
    vi.mocked(getPublicStashApi).mockResolvedValue(stashInfo);
    const { wrapper, router } = await mountWithProviders(UnlockStashView);

    await router.push({ path: `/unlock/${token}` });
    await flushPromises();
    await flushPromises();

    await wrapper.find("button.submit-btn").trigger("click");
    await flushPromises();
    await flushPromises();

    expect(wrapper.find(".submit-error").exists()).toBe(false);
    expect(wrapper.find(".unlocked-body").exists()).toBe(false);
  });

  it("shows a neutral error message when the key is wrong", async () => {
    const ciphertext = await encryptStashBody("the secret message", "correct-key");
    vi.mocked(getPublicStashApi).mockResolvedValue({ ...stashInfo, body: ciphertext });
    const { wrapper, router } = await mountWithProviders(UnlockStashView);

    await router.push({ path: `/unlock/${token}` });
    await flushPromises();
    await flushPromises();

    await wrapper.find("input").setValue("wrong-key");
    await wrapper.find("button.submit-btn").trigger("click");
    await vi.waitFor(() => {
      expect(wrapper.find(".submit-error").exists()).toBe(true);
    });
  });

  it("decrypts and shows the content locally after a successful unlock, with no further stash fetch", async () => {
    const ciphertext = await encryptStashBody("the secret message", "correct-key");
    vi.mocked(getPublicStashApi).mockResolvedValue({ ...stashInfo, body: ciphertext });
    const { wrapper, router } = await mountWithProviders(UnlockStashView);

    await router.push({ path: `/unlock/${token}` });
    await flushPromises();
    await flushPromises();
    const callsBeforeUnlock = vi.mocked(getPublicStashApi).mock.calls.length;

    await wrapper.find("input").setValue("correct-key");
    await wrapper.find("button.submit-btn").trigger("click");
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain("the secret message");
    });

    expect(vi.mocked(getPublicStashApi).mock.calls.length).toBe(callsBeforeUnlock);
  });
});
