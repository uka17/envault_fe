import { createRouter, createMemoryHistory } from "vue-router";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { routes, requireAuth } from "../index";
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

const user = {
  id: 1,
  email: "a@b.com",
  name: "A",
  emailVerifiedAt: "2025-01-01",
  createdOn: "",
  modifiedOn: "",
};

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

it.each(["/dashboard", "/profile", "/stash/new"])("protects %s", async (path) => {
  const router = createRouter({ history: createMemoryHistory(), routes });
  router.beforeEach(requireAuth);
  await router.push(path);
  expect(router.currentRoute.value.name).toBe("login");
  useAuthStore().accessToken = "valid";
  await router.push("/dashboard");
  expect(router.currentRoute.value.name).toBe("dashboard");
});

it.each(["/", "/login", "/register", "/verify-email", "/unlock/example"])(
  "keeps %s public",
  async (path) => {
    const router = createRouter({ history: createMemoryHistory(), routes });
    router.beforeEach(requireAuth);
    await router.push(path);
    expect(router.currentRoute.value.path).toBe(path);
  },
);
