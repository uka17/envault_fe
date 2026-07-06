import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises, DOMWrapper } from "@vue/test-utils";
import ProfileView from "../ProfileView.vue";
import { mountWithProviders } from "@/test/mountWithProviders";
import { useAuthStore } from "@/stores/auth";
import { updateProfileApi, updatePasswordApi } from "@/api/authApi";

vi.mock("@/api/authApi", () => ({
  updateProfileApi: vi.fn(),
  updatePasswordApi: vi.fn(),
  loginApi: vi.fn(),
  logoutApi: vi.fn(),
  refreshTokenApi: vi.fn(),
  checkAuthApi: vi.fn(),
  registerApi: vi.fn(),
}));

const baseUser = {
  id: 1,
  email: "alice@example.com",
  name: "Alice",
  createdOn: "2025-01-01T00:00:00.000Z",
  modifiedOn: "2025-01-01T00:00:00.000Z",
};

/** naive-ui's NModal teleports its content to document.body, so modal content must be queried there. */
function modalInputs(): DOMWrapper<HTMLInputElement>[] {
  return Array.from(document.querySelectorAll(".n-modal input")).map(
    (el) => new DOMWrapper(el as HTMLInputElement),
  );
}

function modalSaveButton(): DOMWrapper<HTMLElement> {
  const buttons = Array.from(document.querySelectorAll(".n-modal .modal-footer button"));
  return new DOMWrapper(buttons[buttons.length - 1] as HTMLElement);
}

async function mountProfile() {
  const result = await mountWithProviders(ProfileView);
  const auth = useAuthStore();
  auth.accessToken = "tok";
  auth.user = { ...baseUser };
  await result.wrapper.vm.$nextTick();
  return result;
}

beforeEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = "";
});

describe("ProfileView.vue", () => {
  it("renders the current user's account details", async () => {
    const { wrapper } = await mountProfile();
    expect(wrapper.text()).toContain("alice@example.com");
    expect(wrapper.text()).toContain("Alice");
  });

  describe("name form", () => {
    it("opens pre-filled with the current name and submits successfully", async () => {
      vi.mocked(updateProfileApi).mockResolvedValue({ ...baseUser, name: "Alicia" });
      const { wrapper } = await mountProfile();

      await wrapper.findAll(".edit-link")[0].trigger("click");
      await flushPromises();
      const [nameInput] = modalInputs();
      expect(nameInput.element.value).toBe("Alice");

      await nameInput.setValue("Alicia");
      await modalSaveButton().trigger("click");
      await flushPromises();

      expect(updateProfileApi).toHaveBeenCalledWith({ name: "Alicia" });
    });

    it("shows an error message when the update fails", async () => {
      vi.mocked(updateProfileApi).mockRejectedValue(new Error("network error"));
      const { wrapper } = await mountProfile();

      await wrapper.findAll(".edit-link")[0].trigger("click");
      await flushPromises();
      const [nameInput] = modalInputs();
      await nameInput.setValue("Alicia");
      await modalSaveButton().trigger("click");
      await flushPromises();
      await flushPromises();

      expect(document.body.textContent).toContain("Failed to update name");
    });
  });

  describe("email form", () => {
    it("opens pre-filled with the current email and submits successfully", async () => {
      vi.mocked(updateProfileApi).mockResolvedValue({ ...baseUser, email: "new@example.com" });
      const { wrapper } = await mountProfile();

      await wrapper.findAll(".edit-link")[1].trigger("click");
      await flushPromises();
      const [emailInput] = modalInputs();
      expect(emailInput.element.value).toBe("alice@example.com");

      await emailInput.setValue("new@example.com");
      await modalSaveButton().trigger("click");
      await flushPromises();

      expect(updateProfileApi).toHaveBeenCalledWith({ email: "new@example.com" });
    });

    it("does not submit when the email field is empty", async () => {
      const { wrapper } = await mountProfile();

      await wrapper.findAll(".edit-link")[1].trigger("click");
      await flushPromises();
      const [emailInput] = modalInputs();
      await emailInput.setValue("");
      await modalSaveButton().trigger("click");
      await flushPromises();

      expect(updateProfileApi).not.toHaveBeenCalled();
    });
  });

  describe("password form", () => {
    it("opens the password modal via the account action button", async () => {
      const { wrapper } = await mountProfile();
      const changePasswordBtn = wrapper
        .findAll("button")
        .find((b) => b.text().includes("Change password"));

      await changePasswordBtn?.trigger("click");
      await flushPromises();

      expect(modalInputs()).toHaveLength(2);
    });

    it("submits the password change successfully", async () => {
      vi.mocked(updatePasswordApi).mockResolvedValue(undefined);
      const { wrapper } = await mountProfile();
      const changePasswordBtn = wrapper
        .findAll("button")
        .find((b) => b.text().includes("Change password"));
      await changePasswordBtn?.trigger("click");
      await flushPromises();

      const [currentPasswordInput, newPasswordInput] = modalInputs();
      await currentPasswordInput.setValue("OldPass1");
      await newPasswordInput.setValue("NewPass1");
      await modalSaveButton().trigger("click");
      await flushPromises();

      expect(updatePasswordApi).toHaveBeenCalledWith({
        currentPassword: "OldPass1",
        newPassword: "NewPass1",
      });
    });

    it("maps known field errors from the server onto the password form", async () => {
      const { AxiosError } = await import("axios");
      const err = new AxiosError("Request failed");
      err.response = {
        data: { errors: [{ path: "currentPassword", msg: { translation: "Current password is wrong" } }] },
        status: 400,
        statusText: "Bad Request",
        headers: {},
        config: {} as never,
      };
      vi.mocked(updatePasswordApi).mockRejectedValue(err);
      const { wrapper } = await mountProfile();
      const changePasswordBtn = wrapper
        .findAll("button")
        .find((b) => b.text().includes("Change password"));
      await changePasswordBtn?.trigger("click");
      await flushPromises();

      const [currentPasswordInput, newPasswordInput] = modalInputs();
      await currentPasswordInput.setValue("WrongPass1");
      await newPasswordInput.setValue("NewPass1");
      await modalSaveButton().trigger("click");
      await flushPromises();
      await flushPromises();

      expect(document.body.textContent).toContain("Current password is wrong");
    });
  });
});
