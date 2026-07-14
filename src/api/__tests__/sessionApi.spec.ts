import { describe, it, expect, vi, beforeEach } from "vitest";
import { http } from "../http";
import { getSessionsApi, terminateSessionApi, terminateOtherSessionsApi } from "../sessionApi";

vi.mock("../http", () => ({
  http: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedHttp = vi.mocked(http, true);

const session = {
  id: 7,
  expiresAt: "2025-12-31T23:59:59.000Z",
  revokedAt: null,
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  ip: "203.0.113.42",
  createdOn: "2025-01-01T00:00:00.000Z",
  modifiedOn: "2025-01-01T00:00:00.000Z",
  current: true,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getSessionsApi", () => {
  it("fetches all active sessions", async () => {
    mockedHttp.get.mockResolvedValue({ data: [session] });

    const result = await getSessionsApi();

    expect(mockedHttp.get).toHaveBeenCalledWith("/users/sessions");
    expect(result).toEqual([session]);
  });
});

describe("terminateSessionApi", () => {
  it("deletes a session by id", async () => {
    mockedHttp.delete.mockResolvedValue({ data: undefined });

    await terminateSessionApi(7);

    expect(mockedHttp.delete).toHaveBeenCalledWith("/users/sessions/7");
  });
});

describe("terminateOtherSessionsApi", () => {
  it("deletes all other sessions", async () => {
    mockedHttp.delete.mockResolvedValue({ data: undefined });

    await terminateOtherSessionsApi();

    expect(mockedHttp.delete).toHaveBeenCalledWith("/users/sessions");
  });
});
