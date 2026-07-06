import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";
import AppHeader from "../AppHeader.vue";
import i18n from "@/i18n";
import { routes } from "@/router";
import { useAuthStore } from "@/stores/auth";
import { logoutApi } from "@/api/authApi";

vi.mock("@/api/authApi", () => ({
  logoutApi: vi.fn(),
  loginApi: vi.fn(),
  refreshTokenApi: vi.fn(),
  checkAuthApi: vi.fn(),
  updateProfileApi: vi.fn(),
  updatePasswordApi: vi.fn(),
  registerApi: vi.fn(),
}));

async function mountHeader() {
  const pinia = createPinia();
  setActivePinia(pinia);
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push("/");
  await router.isReady();
  const wrapper = mount(AppHeader, { global: { plugins: [pinia, router, i18n] } });
  return { wrapper, router };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AppHeader.vue", () => {
  it("shows login/register buttons when unauthenticated", async () => {
    const { wrapper } = await mountHeader();
    expect(wrapper.find(".header-btn-login").exists()).toBe(true);
    expect(wrapper.find(".avatar-badge").exists()).toBe(false);
  });

  it("shows the user avatar when authenticated", async () => {
    const { wrapper } = await mountHeader();
    const auth = useAuthStore();
    auth.accessToken = "tok";
    auth.user = { id: 1, email: "alice@example.com", name: "Alice", createdOn: "", modifiedOn: "" };
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".avatar-badge").exists()).toBe(true);
    expect(wrapper.find(".avatar-badge").text()).toBe("AL");
  });

  it("toggles the dropdown menu open and closed", async () => {
    const { wrapper } = await mountHeader();
    const auth = useAuthStore();
    auth.accessToken = "tok";
    auth.user = { id: 1, email: "alice@example.com", name: "Alice", createdOn: "", modifiedOn: "" };
    await wrapper.vm.$nextTick();

    await wrapper.find(".avatar-badge").trigger("click");
    expect(document.querySelector(".user-dropdown")).not.toBeNull();

    await wrapper.find(".avatar-badge").trigger("click");
    expect(document.querySelector(".user-dropdown")).toBeNull();
  });

  it("navigates to dashboard, create-stash and profile from the dropdown", async () => {
    const { wrapper, router } = await mountHeader();
    const pushSpy = vi.spyOn(router, "push");
    const auth = useAuthStore();
    auth.accessToken = "tok";
    auth.user = { id: 1, email: "alice@example.com", name: "Alice", createdOn: "", modifiedOn: "" };
    await wrapper.vm.$nextTick();

    await wrapper.find(".avatar-badge").trigger("click");
    const items = Array.from(document.querySelectorAll(".dropdown-item")) as HTMLElement[];
    items[0].click();
    await wrapper.vm.$nextTick();
    expect(pushSpy).toHaveBeenCalledWith({ name: "dashboard" });
  });

  it("logs out and redirects to login", async () => {
    vi.mocked(logoutApi).mockResolvedValue(undefined);
    const { wrapper, router } = await mountHeader();
    const pushSpy = vi.spyOn(router, "push");
    const auth = useAuthStore();
    auth.accessToken = "tok";
    auth.user = { id: 1, email: "alice@example.com", name: "Alice", createdOn: "", modifiedOn: "" };
    await wrapper.vm.$nextTick();

    await wrapper.find(".avatar-badge").trigger("click");
    const items = Array.from(document.querySelectorAll(".dropdown-item")) as HTMLElement[];
    items[items.length - 1].click();
    await wrapper.vm.$nextTick();

    expect(pushSpy).toHaveBeenCalledWith({ name: "login" });
  });

  it("toggles the active locale", async () => {
    const { wrapper } = await mountHeader();
    const initialLocale = i18n.global.locale.value;

    await wrapper.find(".locale-switch").trigger("click");

    expect(i18n.global.locale.value).not.toBe(initialLocale);
  });
});
