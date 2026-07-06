import { describe, it, expect, vi, beforeEach } from "vitest";
import { http } from "../http";
import { getStashesApi, getStashApi, createStashApi, deleteStashApi, snoozeStashApi } from "../stashApi";

vi.mock("../http", () => ({
  http: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedHttp = vi.mocked(http, true);

const stash = {
  id: 1,
  to: "a@b.com",
  body: "hello",
  key: "k",
  isSent: false,
  sendAt: "2026-01-01T00:00:00.000Z",
  createdOn: "",
  modifiedOn: "",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getStashesApi", () => {
  it("fetches all stashes", async () => {
    mockedHttp.get.mockResolvedValue({ data: [stash] });

    const result = await getStashesApi();

    expect(mockedHttp.get).toHaveBeenCalledWith("/stashes");
    expect(result).toEqual([stash]);
  });
});

describe("getStashApi", () => {
  it("fetches a single stash by id", async () => {
    mockedHttp.get.mockResolvedValue({ data: stash });

    const result = await getStashApi(1);

    expect(mockedHttp.get).toHaveBeenCalledWith("/stashes/1");
    expect(result).toEqual(stash);
  });
});

describe("createStashApi", () => {
  it("posts a new stash payload", async () => {
    mockedHttp.post.mockResolvedValue({ data: stash });

    const result = await createStashApi({ to: "a@b.com", body: "hello", sendAt: stash.sendAt });

    expect(mockedHttp.post).toHaveBeenCalledWith("/stashes", {
      to: "a@b.com",
      body: "hello",
      sendAt: stash.sendAt,
    });
    expect(result).toEqual(stash);
  });
});

describe("deleteStashApi", () => {
  it("deletes a stash by id", async () => {
    mockedHttp.delete.mockResolvedValue({ data: undefined });

    await deleteStashApi(1);

    expect(mockedHttp.delete).toHaveBeenCalledWith("/stashes/1");
  });
});

describe("snoozeStashApi", () => {
  it("posts to the snooze endpoint with hours", async () => {
    mockedHttp.post.mockResolvedValue({ data: stash });

    const result = await snoozeStashApi(1, 24);

    expect(mockedHttp.post).toHaveBeenCalledWith("/stashes/1/snooze/24");
    expect(result).toEqual(stash);
  });
});
