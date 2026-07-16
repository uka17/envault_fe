import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import DashboardView from "../DashboardView.vue";
import { mountWithProviders } from "@/test/mountWithProviders";
import { getStashesApi, snoozeStashApi } from "@/api/stashApi";

vi.mock("@/api/stashApi", () => ({
  getStashesApi: vi.fn(),
  createStashApi: vi.fn(),
  deleteStashApi: vi.fn(),
  snoozeStashApi: vi.fn(),
}));

const makeStash = (
  overrides: Partial<{ id: number; isSent: boolean; sendAt: string; subject: string | null }> = {},
) => ({
  id: 1,
  to: "a@b.com",
  subject: null,
  body: "hello",
  key: "k",
  isSent: false,
  sendAt: "2099-01-01T00:00:00.000Z",
  createdOn: "",
  modifiedOn: "",
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DashboardView.vue", () => {
  it("fetches and renders stashes on mount", async () => {
    vi.mocked(getStashesApi).mockResolvedValue([
      makeStash({ id: 1, isSent: false }),
      makeStash({ id: 2, isSent: true }),
    ]);
    const { wrapper } = await mountWithProviders(DashboardView);
    await flushPromises();

    expect(getStashesApi).toHaveBeenCalled();
    expect(wrapper.findAll(".stash-row")).toHaveLength(2);
  });

  it("filters stashes by planned/sent", async () => {
    vi.mocked(getStashesApi).mockResolvedValue([
      makeStash({ id: 1, isSent: false }),
      makeStash({ id: 2, isSent: true }),
    ]);
    const { wrapper } = await mountWithProviders(DashboardView);
    await flushPromises();

    const buttons = wrapper.findAll(".filter-pill");
    await buttons[2].trigger("click");
    expect(wrapper.findAll(".stash-row")).toHaveLength(1);
    expect(wrapper.find(".stash-row .recipient-name").text()).toBe("a@b.com");

    await buttons[1].trigger("click");
    expect(wrapper.findAll(".stash-row")).toHaveLength(1);
  });

  it("snoozes a planned stash for 24 hours", async () => {
    vi.mocked(getStashesApi).mockResolvedValue([makeStash({ id: 1, isSent: false })]);
    const updated = makeStash({ id: 1, isSent: false, sendAt: "2099-02-01T00:00:00.000Z" });
    vi.mocked(snoozeStashApi).mockResolvedValue(updated);
    const { wrapper } = await mountWithProviders(DashboardView);
    await flushPromises();

    await wrapper.find(".postpone-btn").trigger("click");
    await flushPromises();

    expect(snoozeStashApi).toHaveBeenCalledWith(1, 24);
  });

  it("renders the subject when present and hides it when absent", async () => {
    vi.mocked(getStashesApi).mockResolvedValue([
      makeStash({ id: 1, subject: "Important update" }),
      makeStash({ id: 2, subject: null }),
    ]);
    const { wrapper } = await mountWithProviders(DashboardView);
    await flushPromises();

    const rows = wrapper.findAll(".stash-row");
    expect(rows[0].find(".stash-subject").text()).toBe("Important update");
    expect(rows[1].find(".stash-subject").exists()).toBe(false);
  });

  it("navigates to the create-stash page", async () => {
    vi.mocked(getStashesApi).mockResolvedValue([]);
    const { wrapper, router } = await mountWithProviders(DashboardView);
    await flushPromises();
    const pushSpy = vi.spyOn(router, "push");

    await wrapper.find(".new-stash-btn").trigger("click");

    expect(pushSpy).toHaveBeenCalledWith({ name: "create-stash" });
  });
});
