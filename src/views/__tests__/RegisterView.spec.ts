import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { AxiosError } from "axios";
import RegisterView from "../RegisterView.vue";
import { mountWithProviders } from "@/test/mountWithProviders";
import { registerApi } from "@/api/authApi";

vi.mock("@/api/authApi", () => ({
  registerApi: vi.fn(),
  loginApi: vi.fn(),
  logoutApi: vi.fn(),
  refreshTokenApi: vi.fn(),
  checkAuthApi: vi.fn(),
  updateProfileApi: vi.fn(),
  updatePasswordApi: vi.fn(),
}));

/** Builds a minimal AxiosError with the given field errors as its response body. */
function makeFieldErrorResponse(errors: Array<{ field: string; message: string }>) {
  const err = new AxiosError("Request failed");
  err.response = { data: { errors }, status: 400, statusText: "Bad Request", headers: {}, config: {} as never };
  return err;
}

async function fillForm(wrapper: Awaited<ReturnType<typeof mountWithProviders>>["wrapper"]) {
  const inputs = wrapper.findAll("input");
  await inputs[0].setValue("Alice");
  await inputs[1].setValue("alice@example.com");
  await inputs[2].setValue("Passw0rd");
  await inputs[3].setValue("Passw0rd");
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("RegisterView.vue", () => {
  it("renders the registration form", async () => {
    const { wrapper } = await mountWithProviders(RegisterView);
    expect(wrapper.findAll("input")).toHaveLength(4);
  });

  it("registers and redirects to login on success", async () => {
    vi.mocked(registerApi).mockResolvedValue({ id: 1, email: "a", name: "A", createdOn: "", modifiedOn: "" });
    const { wrapper, router } = await mountWithProviders(RegisterView);
    const pushSpy = vi.spyOn(router, "push");

    await fillForm(wrapper);
    await wrapper.find("button.submit-btn").trigger("click");
    await flushPromises();
    await flushPromises();

    expect(registerApi).toHaveBeenCalledWith({
      name: "Alice",
      email: "alice@example.com",
      password: "Passw0rd",
    });
    expect(pushSpy).toHaveBeenCalledWith("/login");
  });

  it("maps known field errors from the server onto the form", async () => {
    vi.mocked(registerApi).mockRejectedValue(
      makeFieldErrorResponse([{ field: "email", message: "Email already taken" }]),
    );
    const { wrapper, router } = await mountWithProviders(RegisterView);
    const pushSpy = vi.spyOn(router, "push");

    await fillForm(wrapper);
    await wrapper.find("button.submit-btn").trigger("click");
    await flushPromises();
    await flushPromises();

    expect(pushSpy).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Email already taken");
  });

  it("toggles password and confirm password visibility independently", async () => {
    const { wrapper } = await mountWithProviders(RegisterView);
    const visibilityIcons = wrapper.findAll(".password-visibility");
    const inputs = wrapper.findAll("input");

    expect(inputs[2].attributes("type")).toBe("password");
    expect(inputs[3].attributes("type")).toBe("password");

    await visibilityIcons[0].trigger("click");
    expect(wrapper.findAll("input")[2].attributes("type")).toBe("text");
    expect(wrapper.findAll("input")[3].attributes("type")).toBe("password");
  });
});
