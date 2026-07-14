import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises, DOMWrapper } from "@vue/test-utils";
import ProfileView from "../ProfileView.vue";
import { mountWithProviders } from "@/test/mountWithProviders";
import { useAuthStore } from "@/stores/auth";
import { useSessionsStore } from "@/stores/sessions";
import { updateProfileApi, updatePasswordApi } from "@/api/authApi";
import { getSessionsApi, terminateSessionApi, terminateOtherSessionsApi } from "@/api/sessionApi";

vi.mock("@/api/authApi", () => ({
  updateProfileApi: vi.fn(),
  updatePasswordApi: vi.fn(),
  loginApi: vi.fn(),
  logoutApi: vi.fn(),
  refreshTokenApi: vi.fn(),
  checkAuthApi: vi.fn(),
  registerApi: vi.fn(),
}));

vi.mock("@/api/sessionApi", () => ({
  getSessionsApi: vi.fn(),
  terminateSessionApi: vi.fn(),
  terminateOtherSessionsApi: vi.fn(),
}));

const baseSession = {
  id: 1,
  expiresAt: "2026-12-31T23:59:59.000Z",
  revokedAt: null,
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0 Safari/537.36",
  ip: "192.168.1.1",
  createdOn: "2025-01-01T00:00:00.000Z",
  modifiedOn: "2025-01-01T00:00:00.000Z",
  current: true,
};

const otherSession = {
  ...baseSession,
  id: 2,
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  ip: "10.0.0.5",
  current: false,
};

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
  await flushPromises();
  await result.wrapper.vm.$nextTick();
  return result;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getSessionsApi).mockResolvedValue([baseSession, otherSession]);
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

      expect(modalInputs()).toHaveLength(3);
    });

    it("submits the password change successfully", async () => {
      vi.mocked(updatePasswordApi).mockResolvedValue(undefined);
      const { wrapper } = await mountProfile();
      const changePasswordBtn = wrapper
        .findAll("button")
        .find((b) => b.text().includes("Change password"));
      await changePasswordBtn?.trigger("click");
      await flushPromises();

      const [currentPasswordInput, newPasswordInput, confirmNewPasswordInput] = modalInputs();
      await currentPasswordInput.setValue("OldPass1");
      await newPasswordInput.setValue("NewPass1");
      await confirmNewPasswordInput.setValue("NewPass1");
      await modalSaveButton().trigger("click");
      await flushPromises();

      expect(updatePasswordApi).toHaveBeenCalledWith({
        currentPassword: "OldPass1",
        newPassword: "NewPass1",
      });
    });

    it("does not submit when the confirmation does not match the new password", async () => {
      const { wrapper } = await mountProfile();
      const changePasswordBtn = wrapper
        .findAll("button")
        .find((b) => b.text().includes("Change password"));
      await changePasswordBtn?.trigger("click");
      await flushPromises();

      const [currentPasswordInput, newPasswordInput, confirmNewPasswordInput] = modalInputs();
      await currentPasswordInput.setValue("OldPass1");
      await newPasswordInput.setValue("NewPass1");
      await confirmNewPasswordInput.setValue("Mismatch1");
      await modalSaveButton().trigger("click");
      await flushPromises();

      expect(updatePasswordApi).not.toHaveBeenCalled();
      expect(document.body.textContent).toContain("Passwords do not match");
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

      const [currentPasswordInput, newPasswordInput, confirmNewPasswordInput] = modalInputs();
      await currentPasswordInput.setValue("WrongPass1");
      await newPasswordInput.setValue("NewPass1");
      await confirmNewPasswordInput.setValue("NewPass1");
      await modalSaveButton().trigger("click");
      await flushPromises();
      await flushPromises();

      expect(document.body.textContent).toContain("Current password is wrong");
    });
  });

  describe("sessions", () => {
    it("loads and renders active sessions with the current one flagged", async () => {
      const { wrapper } = await mountProfile();

      expect(getSessionsApi).toHaveBeenCalled();
      expect(wrapper.text()).toContain("Chrome 120");
      expect(wrapper.text()).toContain("Firefox 121");
      expect(wrapper.text()).toContain("current");
    });

    it("shows a load error message when fetching sessions fails", async () => {
      vi.mocked(getSessionsApi).mockRejectedValue(new Error("network error"));
      const { wrapper } = await mountProfile();

      expect(wrapper.text()).toContain("Failed to load sessions");
    });

    it("terminates a single non-current session after confirmation", async () => {
      vi.mocked(terminateSessionApi).mockResolvedValue(undefined);
      const { wrapper } = await mountProfile();
      const sessionsStore = useSessionsStore();

      await wrapper.find(".session-end-btn").trigger("click");
      await flushPromises();
      await modalSaveButton().trigger("click");
      await flushPromises();

      expect(terminateSessionApi).toHaveBeenCalledWith(2);
      expect(sessionsStore.sessions.map((s) => s.id)).toEqual([1]);
    });

    it("terminates all other sessions after confirmation", async () => {
      vi.mocked(terminateOtherSessionsApi).mockResolvedValue(undefined);
      const { wrapper } = await mountProfile();
      const sessionsStore = useSessionsStore();

      const endAllBtn = wrapper.findAll("button").find((b) => b.text().includes("Terminate other sessions"));
      await endAllBtn?.trigger("click");
      await flushPromises();
      await modalSaveButton().trigger("click");
      await flushPromises();

      expect(terminateOtherSessionsApi).toHaveBeenCalled();
      expect(sessionsStore.sessions.map((s) => s.id)).toEqual([1]);
    });

    it("hides the terminate-other-sessions link when there are no other sessions", async () => {
      vi.mocked(getSessionsApi).mockResolvedValue([baseSession]);
      const { wrapper } = await mountProfile();

      const endAllBtn = wrapper.findAll("button").find((b) => b.text().includes("Terminate other sessions"));
      expect(endAllBtn).toBeUndefined();
    });
  });
});
