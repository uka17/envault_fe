import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import CreateStashView from "../CreateStashView.vue";
import { mountWithProviders } from "@/test/mountWithProviders";
import { createStashApi } from "@/api/stashApi";

vi.mock("@/api/stashApi", () => ({
  createStashApi: vi.fn(),
  getStashesApi: vi.fn(),
  deleteStashApi: vi.fn(),
  snoozeStashApi: vi.fn(),
}));

const stash = {
  id: 1,
  to: "a@b.com",
  body: "hello",
  key: "k",
  isSent: false,
  sendAt: "2099-01-01T00:00:00.000Z",
  createdOn: "",
  modifiedOn: "",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("CreateStashView.vue", () => {
  it("renders the recipient and message fields", async () => {
    const { wrapper } = await mountWithProviders(CreateStashView);
    expect(wrapper.find("input").exists()).toBe(true);
    expect(wrapper.find("textarea").exists()).toBe(true);
  });

  it("does not submit when required fields are empty", async () => {
    const { wrapper } = await mountWithProviders(CreateStashView);

    await wrapper.find("button.submit-btn").trigger("click");
    await flushPromises();
    await flushPromises();

    expect(createStashApi).not.toHaveBeenCalled();
  });

  it("shows a generic error message when submission fails", async () => {
    vi.mocked(createStashApi).mockRejectedValue(new Error("network error"));
    const { wrapper } = await mountWithProviders(CreateStashView);

    await wrapper.find("input").setValue("a@b.com");
    await wrapper.find("textarea").setValue("hello there");
    const inner = wrapper.findComponent(CreateStashView);
    (inner.vm as unknown as { formValue: { sendAt: number | null } }).formValue.sendAt = Date.parse(
      stash.sendAt,
    );

    await wrapper.find("button.submit-btn").trigger("click");
    await flushPromises();
    await flushPromises();

    expect(wrapper.find(".submit-error").exists()).toBe(true);
  });

  it("creates the stash and redirects to the dashboard on success", async () => {
    vi.mocked(createStashApi).mockResolvedValue(stash);
    const { wrapper, router } = await mountWithProviders(CreateStashView);
    const pushSpy = vi.spyOn(router, "push");

    await wrapper.find("input").setValue("a@b.com");
    await wrapper.find("textarea").setValue("hello there");
    const inner = wrapper.findComponent(CreateStashView);
    (inner.vm as unknown as { formValue: { sendAt: number | null } }).formValue.sendAt = Date.parse(
      stash.sendAt,
    );

    await wrapper.find("button.submit-btn").trigger("click");
    await flushPromises();
    await flushPromises();

    expect(createStashApi).toHaveBeenCalledWith({
      to: "a@b.com",
      body: "hello there",
      sendAt: new Date(Date.parse(stash.sendAt)).toISOString(),
    });
    expect(pushSpy).toHaveBeenCalledWith({ name: "dashboard" });
  });
});
