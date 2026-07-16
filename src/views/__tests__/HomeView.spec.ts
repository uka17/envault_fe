import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import HomeView from "../HomeView.vue";
import { mountWithProviders } from "@/test/mountWithProviders";
import { useAuthStore } from "@/stores/auth";
import { getStashesApi } from "@/api/stashApi";

vi.mock("@/api/stashApi", () => ({
  getStashesApi: vi.fn(),
  createStashApi: vi.fn(),
  deleteStashApi: vi.fn(),
  snoozeStashApi: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("HomeView.vue", () => {
  it("shows the landing page for guests", async () => {
    const { wrapper } = await mountWithProviders(HomeView);

    expect(wrapper.find(".hero").exists()).toBe(true);
    expect(wrapper.find(".stash-list").exists()).toBe(false);
  });

  it("shows the stash dashboard for authenticated users", async () => {
    vi.mocked(getStashesApi).mockResolvedValue([]);
    const { wrapper, pinia } = await mountWithProviders(HomeView);
    useAuthStore(pinia).$patch({ accessToken: "fake-token" });
    await flushPromises();

    expect(wrapper.find(".hero").exists()).toBe(false);
    expect(wrapper.find(".stash-list").exists()).toBe(true);
    expect(getStashesApi).toHaveBeenCalled();
  });
});
