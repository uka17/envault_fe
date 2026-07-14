import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useSessionsStore } from "../sessions";
import { getSessionsApi, terminateSessionApi, terminateOtherSessionsApi } from "@/api/sessionApi";

vi.mock("@/api/sessionApi", () => ({
  getSessionsApi: vi.fn(),
  terminateSessionApi: vi.fn(),
  terminateOtherSessionsApi: vi.fn(),
}));

const makeSession = (overrides: Partial<{ id: number; current: boolean }> = {}) => ({
  id: 1,
  expiresAt: "2026-01-01T00:00:00.000Z",
  revokedAt: null,
  userAgent: "Mozilla/5.0",
  ip: "203.0.113.42",
  createdOn: "2025-01-01T00:00:00.000Z",
  modifiedOn: "2025-01-01T00:00:00.000Z",
  current: false,
  ...overrides,
});

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});

describe("fetchSessions", () => {
  it("loads sessions and toggles the loading flag", async () => {
    const sessions = [makeSession()];
    vi.mocked(getSessionsApi).mockResolvedValue(sessions);
    const store = useSessionsStore();

    const promise = store.fetchSessions();
    expect(store.loading).toBe(true);
    await promise;

    expect(store.loading).toBe(false);
    expect(store.sessions).toEqual(sessions);
    expect(store.error).toBeNull();
  });

  it("sets an error message and clears loading on failure", async () => {
    vi.mocked(getSessionsApi).mockRejectedValue(new Error("network error"));
    const store = useSessionsStore();

    await store.fetchSessions();

    expect(store.loading).toBe(false);
    expect(store.error).toBeTruthy();
  });
});

describe("terminateSession", () => {
  it("removes the terminated session from the list", async () => {
    vi.mocked(terminateSessionApi).mockResolvedValue(undefined);
    const store = useSessionsStore();
    store.sessions = [makeSession({ id: 1 }), makeSession({ id: 2 })];

    await store.terminateSession(1);

    expect(terminateSessionApi).toHaveBeenCalledWith(1);
    expect(store.sessions.map((s) => s.id)).toEqual([2]);
  });
});

describe("terminateOtherSessions", () => {
  it("keeps only the current session in the list", async () => {
    vi.mocked(terminateOtherSessionsApi).mockResolvedValue(undefined);
    const store = useSessionsStore();
    store.sessions = [makeSession({ id: 1, current: true }), makeSession({ id: 2, current: false })];

    await store.terminateOtherSessions();

    expect(terminateOtherSessionsApi).toHaveBeenCalled();
    expect(store.sessions.map((s) => s.id)).toEqual([1]);
  });
});
