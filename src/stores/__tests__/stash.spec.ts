import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useStashStore } from "../stash";
import { getStashesApi, createStashApi, deleteStashApi, snoozeStashApi } from "@/api/stashApi";

vi.mock("@/api/stashApi", () => ({
  getStashesApi: vi.fn(),
  createStashApi: vi.fn(),
  deleteStashApi: vi.fn(),
  snoozeStashApi: vi.fn(),
}));

const makeStash = (overrides: Partial<{ id: number; isSent: boolean; subject: string | null }> = {}) => ({
  id: 1,
  to: "a@b.com",
  subject: null,
  body: "hello",
  isSent: false,
  sendAt: "2026-01-01T00:00:00.000Z",
  createdOn: "",
  modifiedOn: "",
  ...overrides,
});

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});

describe("getters", () => {
  it("compute total, plannedCount and sentCount", () => {
    const store = useStashStore();
    store.stashes = [makeStash({ id: 1, isSent: false }), makeStash({ id: 2, isSent: true }), makeStash({ id: 3, isSent: false })];

    expect(store.total).toBe(3);
    expect(store.plannedCount).toBe(2);
    expect(store.sentCount).toBe(1);
  });
});

describe("fetchStashes", () => {
  it("loads stashes and toggles the loading flag", async () => {
    const stashes = [makeStash()];
    vi.mocked(getStashesApi).mockResolvedValue(stashes);
    const store = useStashStore();

    const promise = store.fetchStashes();
    expect(store.loading).toBe(true);
    await promise;

    expect(store.loading).toBe(false);
    expect(store.stashes).toEqual(stashes);
    expect(store.error).toBeNull();
  });

  it("sets an error message and clears loading on failure", async () => {
    vi.mocked(getStashesApi).mockRejectedValue(new Error("network error"));
    const store = useStashStore();

    await store.fetchStashes();

    expect(store.loading).toBe(false);
    expect(store.error).toBeTruthy();
  });
});

describe("createStash", () => {
  it("prepends the created stash to the list", async () => {
    const created = makeStash({ id: 5 });
    vi.mocked(createStashApi).mockResolvedValue(created);
    const store = useStashStore();
    store.stashes = [makeStash({ id: 1 })];

    const result = await store.createStash({ to: "a@b.com", body: "hi", sendAt: created.sendAt });

    expect(result).toEqual(created);
    expect(store.stashes[0]).toEqual(created);
    expect(store.stashes).toHaveLength(2);
  });
});

describe("deleteStash", () => {
  it("removes the deleted stash from the list", async () => {
    vi.mocked(deleteStashApi).mockResolvedValue(undefined);
    const store = useStashStore();
    store.stashes = [makeStash({ id: 1 }), makeStash({ id: 2 })];

    await store.deleteStash(1);

    expect(store.stashes.map((s) => s.id)).toEqual([2]);
  });
});

describe("snoozeStash", () => {
  it("replaces the snoozed stash with the updated version", async () => {
    const updated = makeStash({ id: 1 });
    updated.sendAt = "2026-02-01T00:00:00.000Z";
    vi.mocked(snoozeStashApi).mockResolvedValue(updated);
    const store = useStashStore();
    store.stashes = [makeStash({ id: 1 }), makeStash({ id: 2 })];

    await store.snoozeStash(1, 24);

    expect(snoozeStashApi).toHaveBeenCalledWith(1, 24);
    expect(store.stashes[0]).toEqual(updated);
  });

  it("does nothing to the list when the stash id is not found", async () => {
    const updated = makeStash({ id: 99 });
    vi.mocked(snoozeStashApi).mockResolvedValue(updated);
    const store = useStashStore();
    store.stashes = [makeStash({ id: 1 })];

    await store.snoozeStash(99, 24);

    expect(store.stashes).toEqual([makeStash({ id: 1 })]);
  });
});
