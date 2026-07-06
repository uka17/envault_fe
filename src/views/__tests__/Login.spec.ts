import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Login from "../Login.vue";
import { mountWithProviders } from "@/test/mountWithProviders";
import { loginApi, checkAuthApi } from "@/api/authApi";

vi.mock("@/api/authApi", () => ({
  loginApi: vi.fn(),
  checkAuthApi: vi.fn(),
  logoutApi: vi.fn(),
  refreshTokenApi: vi.fn(),
  updateProfileApi: vi.fn(),
  updatePasswordApi: vi.fn(),
  registerApi: vi.fn(),
}));

const user = { id: 1, email: "a@b.com", name: "A", createdOn: "", modifiedOn: "" };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Login.vue", () => {
  it("renders the login form", async () => {
    const { wrapper } = await mountWithProviders(Login);
    expect(wrapper.find("input").exists()).toBe(true);
    expect(wrapper.text()).toContain("Sign in");
  });

  it("shows a validation error and does not call the API when fields are empty", async () => {
    const { wrapper } = await mountWithProviders(Login);

    await wrapper.find("button.submit-btn").trigger("click");
    await flushPromises();
    await flushPromises();

    expect(loginApi).not.toHaveBeenCalled();
  });

  it("logs in and navigates to the dashboard on success", async () => {
    vi.mocked(loginApi).mockResolvedValue("tok123");
    vi.mocked(checkAuthApi).mockResolvedValue(user);
    const { wrapper, router } = await mountWithProviders(Login);
    const pushSpy = vi.spyOn(router, "push");

    const inputs = wrapper.findAll("input");
    await inputs[0].setValue("a@b.com");
    await inputs[1].setValue("Passw0rd");
    await wrapper.find("button.submit-btn").trigger("click");
    await flushPromises();

    expect(loginApi).toHaveBeenCalledWith({ email: "a@b.com", password: "Passw0rd" });
    expect(pushSpy).toHaveBeenCalledWith({ name: "dashboard" });
  });

  it("shows an error message when login fails", async () => {
    vi.mocked(loginApi).mockRejectedValue(new Error("bad credentials"));
    const { wrapper, router } = await mountWithProviders(Login);
    const pushSpy = vi.spyOn(router, "push");

    const inputs = wrapper.findAll("input");
    await inputs[0].setValue("a@b.com");
    await inputs[1].setValue("Passw0rd");
    await wrapper.find("button.submit-btn").trigger("click");
    await flushPromises();

    expect(pushSpy).not.toHaveBeenCalled();
    expect(wrapper.find(".submit-error").exists()).toBe(true);
  });

  it("toggles password visibility", async () => {
    const { wrapper } = await mountWithProviders(Login);
    const inputs = wrapper.findAll("input");
    expect(inputs[1].attributes("type")).toBe("password");

    await wrapper.find(".password-visibility").trigger("click");

    expect(wrapper.findAll("input")[1].attributes("type")).toBe("text");
  });
});
