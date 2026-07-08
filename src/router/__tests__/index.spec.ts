import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { routes } from "../index";
import { useAuthStore } from "@/stores/auth";
import { checkAuthApi } from "@/api/authApi";

vi.mock("@/api/authApi", () => ({
  loginApi: vi.fn(),
  logoutApi: vi.fn(),
  refreshTokenApi: vi.fn(),
  checkAuthApi: vi.fn(),
  updateProfileApi: vi.fn(),
  updatePasswordApi: vi.fn(),
  registerApi: vi.fn(),
}));

const user = { id: 1, email: "a@b.com", name: "A", createdOn: "", modifiedOn: "" };

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});

describe("profile route guard", () => {
  it("refetches the current user every time the /profile route is entered", async () => {
    const profileRoute = routes.find((route) => route.name === "profile");
    expect(profileRoute?.beforeEnter).toBeDefined();

    const auth = useAuthStore();
    auth.accessToken = "tok";
    vi.mocked(checkAuthApi).mockResolvedValue(user);

    // @ts-expect-error beforeEnter is typed as a NavigationGuard union; call it directly with no args for this test.
    await profileRoute!.beforeEnter();

    expect(checkAuthApi).toHaveBeenCalledTimes(1);
    expect(auth.user).toEqual(user);
  });
});
