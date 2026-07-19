import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import CreateStashView from "../CreateStashView.vue";
import { mountWithProviders } from "@/test/mountWithProviders";
import { createStashApi } from "@/api/stashApi";
import { decryptStashBody } from "@/utils/stashCrypto";

vi.mock("@/api/stashApi", () => ({
  createStashApi: vi.fn(),
  getStashesApi: vi.fn(),
  deleteStashApi: vi.fn(),
  snoozeStashApi: vi.fn(),
}));

const stash = {
  id: 1,
  to: "a@b.com",
  subject: null,
  body: "encrypted-body",
  isSent: false,
  sendAt: "2099-01-01T00:00:00.000Z",
  createdOn: "",
  modifiedOn: "",
};

const KEY = "correct-horse-battery-staple";

/** Fills in the recipient, message, and key, and sets the send date directly on the component. */
async function fillRequiredFields(wrapper: Awaited<ReturnType<typeof mountWithProviders>>["wrapper"]) {
  const inputs = wrapper.findAll("input");
  await inputs[0].setValue("a@b.com");
  await wrapper.find("textarea").setValue("hello there");
  await inputs[2].setValue(KEY);
  const inner = wrapper.findComponent(CreateStashView);
  (inner.vm as unknown as { formValue: { sendAt: number | null } }).formValue.sendAt = Date.parse(
    stash.sendAt,
  );
  await flushPromises();
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("CreateStashView.vue", () => {
  it("renders the recipient, message, and key fields", async () => {
    const { wrapper } = await mountWithProviders(CreateStashView);
    expect(wrapper.findAll("input").length).toBeGreaterThanOrEqual(3);
    expect(wrapper.find("textarea").exists()).toBe(true);
  });

  it("does not submit when required fields are empty", async () => {
    const { wrapper } = await mountWithProviders(CreateStashView);

    await wrapper.find("button.submit-btn").trigger("click");
    await flushPromises();
    await flushPromises();

    expect(createStashApi).not.toHaveBeenCalled();
  });

  it("fills the key field with a generated passphrase when the generate button is clicked", async () => {
    const { wrapper } = await mountWithProviders(CreateStashView);

    const buttons = wrapper.findAll("button");
    const generateButton = buttons.find((b) => b.text().includes("Generate"));
    await generateButton?.trigger("click");

    const inner = wrapper.findComponent(CreateStashView);
    const key = (inner.vm as unknown as { formValue: { key: string } }).formValue.key;
    expect(key.length).toBeGreaterThan(0);
  });

  it("shows a generic error message when submission fails", async () => {
    vi.mocked(createStashApi).mockRejectedValue(new Error("network error"));
    const { wrapper } = await mountWithProviders(CreateStashView);
    await fillRequiredFields(wrapper);

    await wrapper.find("button.submit-btn").trigger("click");
    await vi.waitFor(() => {
      expect(wrapper.find(".submit-error").exists()).toBe(true);
    });
  });

  it("encrypts the message client-side before submitting, and shows the key for the user to save", async () => {
    vi.mocked(createStashApi).mockResolvedValue(stash);
    const { wrapper } = await mountWithProviders(CreateStashView);
    await fillRequiredFields(wrapper);

    await wrapper.find("button.submit-btn").trigger("click");
    await vi.waitFor(() => {
      expect(createStashApi).toHaveBeenCalledTimes(1);
    });

    const payload = vi.mocked(createStashApi).mock.calls[0][0];
    expect(payload.to).toBe("a@b.com");
    expect(payload.subject).toBeNull();
    expect(payload.sendAt).toBe(new Date(Date.parse(stash.sendAt)).toISOString());
    expect(payload.body).not.toBe("hello there");

    const decrypted = await decryptStashBody(payload.body, KEY);
    expect(decrypted).toBe("hello there");

    // The "key saved" confirmation is a modal, teleported to document.body,
    // so it lives outside the mounted wrapper's own DOM subtree.
    await vi.waitFor(() => {
      expect(document.body.textContent).toContain("Stash created");
    });
    const keyInput = document.body.querySelector<HTMLInputElement>("input[readonly]");
    expect(keyInput?.value).toBe(KEY);
  });

  it("includes the subject in the payload when provided", async () => {
    vi.mocked(createStashApi).mockResolvedValue(stash);
    const { wrapper } = await mountWithProviders(CreateStashView);

    const inputs = wrapper.findAll("input");
    await inputs[0].setValue("a@b.com");
    await inputs[1].setValue("Important update");
    await wrapper.find("textarea").setValue("hello there");
    await inputs[2].setValue(KEY);
    const inner = wrapper.findComponent(CreateStashView);
    (inner.vm as unknown as { formValue: { sendAt: number | null } }).formValue.sendAt = Date.parse(
      stash.sendAt,
    );

    await wrapper.find("button.submit-btn").trigger("click");
    await vi.waitFor(() => {
      expect(createStashApi).toHaveBeenCalledTimes(1);
    });

    const payload = vi.mocked(createStashApi).mock.calls[0][0];
    expect(payload.subject).toBe("Important update");
  });
});
