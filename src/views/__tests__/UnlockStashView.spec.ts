import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import UnlockStashView from "../UnlockStashView.vue";
import { mountWithProviders } from "@/test/mountWithProviders";
import { getPublicStashApi, unlockStashApi } from "@/api/stashApi";

vi.mock("@/api/stashApi", () => ({
  getPublicStashApi: vi.fn(),
  unlockStashApi: vi.fn(),
}));

const token = "abcdefgh23456789jkmn";

const stashInfo = {
  subject: "Hello",
  sendAt: "2099-01-01T00:00:00.000Z",
};

const unlockedStash = {
  subject: "Hello",
  sendAt: "2099-01-01T00:00:00.000Z",
  body: "the secret message",
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

  it("does not submit when the key is empty", async () => {
    vi.mocked(getPublicStashApi).mockResolvedValue(stashInfo);
    const { wrapper, router } = await mountWithProviders(UnlockStashView);

    await router.push({ path: `/unlock/${token}` });
    await flushPromises();
    await flushPromises();

    await wrapper.find("button.submit-btn").trigger("click");
    await flushPromises();
    await flushPromises();

    expect(unlockStashApi).not.toHaveBeenCalled();
  });

  it("shows a neutral error message when unlock fails", async () => {
    vi.mocked(getPublicStashApi).mockResolvedValue(stashInfo);
    vi.mocked(unlockStashApi).mockRejectedValue(new Error("wrong key"));
    const { wrapper, router } = await mountWithProviders(UnlockStashView);

    await router.push({ path: `/unlock/${token}` });
    await flushPromises();
    await flushPromises();

    await wrapper.find("input").setValue("wrong-key");
    await wrapper.find("button.submit-btn").trigger("click");
    await flushPromises();
    await flushPromises();

    expect(wrapper.find(".submit-error").exists()).toBe(true);
  });

  it("shows the decrypted content after a successful unlock", async () => {
    vi.mocked(getPublicStashApi).mockResolvedValue(stashInfo);
    vi.mocked(unlockStashApi).mockResolvedValue(unlockedStash);
    const { wrapper, router } = await mountWithProviders(UnlockStashView);

    await router.push({ path: `/unlock/${token}` });
    await flushPromises();
    await flushPromises();

    await wrapper.find("input").setValue("correct-key");
    await wrapper.find("button.submit-btn").trigger("click");
    await flushPromises();
    await flushPromises();

    expect(unlockStashApi).toHaveBeenCalledWith(token, "correct-key");
    expect(wrapper.text()).toContain("the secret message");
  });
});
