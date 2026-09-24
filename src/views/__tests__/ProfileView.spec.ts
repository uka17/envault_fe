import { describe, it, expect, vi, beforeEach } from "vitest";
import { AxiosError } from "axios";
import { flushPromises, DOMWrapper } from "@vue/test-utils";
import ProfileView from "../ProfileView.vue";
import { mountWithProviders } from "@/test/mountWithProviders";
import { useAuthStore } from "@/stores/auth";
import { useSessionsStore } from "@/stores/sessions";
import {
  updateNameApi,
  requestEmailChangeApi,
  resendEmailChangeApi,
  updatePasswordApi,
} from "@/api/authApi";
import { getSessionsApi, terminateSessionApi, terminateOtherSessionsApi } from "@/api/sessionApi";

vi.mock("@/api/authApi", () => ({
  updateNameApi: vi.fn(),
  requestEmailChangeApi: vi.fn(),
  resendEmailChangeApi: vi.fn(),
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
  pendingEmail: null,
  name: "Alice",
  emailVerifiedAt: "2025-01-01T00:00:00.000Z",
  createdOn: "2025-01-01T00:00:00.000Z",
  modifiedOn: "2025-01-01T00:00:00.000Z",
};

/** Builds a minimal AxiosError carrying the given response data and headers. */
function makeApiError(code: string, message: string, headers: Record<string, string> = {}): AxiosError {
  const err = new AxiosError("Request failed");
  err.response = {
    data: { code, message, errors: [] },
    status: 400,
    statusText: "Bad Request",
    headers,
    config: {} as never,
  };
  return err;
}

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
      vi.mocked(updateNameApi).mockResolvedValue({ ...baseUser, name: "Alicia" });
      const { wrapper } = await mountProfile();

      await wrapper.findAll(".edit-link")[0].trigger("click");
      await flushPromises();
      const [nameInput] = modalInputs();
      expect(nameInput.element.value).toBe("Alice");

      await nameInput.setValue("Alicia");
      await modalSaveButton().trigger("click");
      await flushPromises();

      expect(updateNameApi).toHaveBeenCalledWith("Alicia");
    });

    it("shows an error message when the update fails", async () => {
      vi.mocked(updateNameApi).mockRejectedValue(new Error("network error"));
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
    it("opens with an empty field and submits successfully", async () => {
      vi.mocked(requestEmailChangeApi).mockResolvedValue({ ...baseUser, pendingEmail: "new@example.com" });
      const { wrapper } = await mountProfile();

      await wrapper.findAll(".edit-link")[1].trigger("click");
      await flushPromises();
      const [emailInput] = modalInputs();
      expect(emailInput.element.value).toBe("");

      await emailInput.setValue("new@example.com");
      await modalSaveButton().trigger("click");
      await flushPromises();

      expect(requestEmailChangeApi).toHaveBeenCalledWith("new@example.com");
    });

    it("opens with an empty field even when a change is already pending", async () => {
      const result = await mountWithProviders(ProfileView);
      const auth = useAuthStore();
      auth.accessToken = "tok";
      auth.user = { ...baseUser, pendingEmail: "pending@example.com" };
      await flushPromises();
      await result.wrapper.vm.$nextTick();

      await result.wrapper.findAll(".edit-link")[1].trigger("click");
      await flushPromises();
      const [emailInput] = modalInputs();

      expect(emailInput.element.value).toBe("");
    });

    it("blocks Save and shows a hint when typing the already-pending address", async () => {
      const result = await mountWithProviders(ProfileView);
      const auth = useAuthStore();
      auth.accessToken = "tok";
      auth.user = { ...baseUser, pendingEmail: "pending@example.com" };
      await flushPromises();
      await result.wrapper.vm.$nextTick();

      await result.wrapper.findAll(".edit-link")[1].trigger("click");
      await flushPromises();
      const [emailInput] = modalInputs();
      await emailInput.setValue("pending@example.com");

      expect(modalSaveButton().attributes("disabled")).toBeDefined();
      expect(document.body.textContent).toContain("A confirmation was already sent to this address");

      await modalSaveButton().trigger("click");
      await flushPromises();
      expect(requestEmailChangeApi).not.toHaveBeenCalled();
    });

    it("allows Save once changed to a different address than the pending one", async () => {
      vi.mocked(requestEmailChangeApi).mockResolvedValue({ ...baseUser, pendingEmail: "third@example.com" });
      const result = await mountWithProviders(ProfileView);
      const auth = useAuthStore();
      auth.accessToken = "tok";
      auth.user = { ...baseUser, pendingEmail: "pending@example.com" };
      await flushPromises();
      await result.wrapper.vm.$nextTick();

      await result.wrapper.findAll(".edit-link")[1].trigger("click");
      await flushPromises();
      const [emailInput] = modalInputs();
      await emailInput.setValue("pending@example.com");
      expect(modalSaveButton().attributes("disabled")).toBeDefined();

      await emailInput.setValue("third@example.com");
      expect(modalSaveButton().attributes("disabled")).toBeUndefined();
      expect(document.body.textContent).not.toContain("A confirmation was already sent to this address");

      await modalSaveButton().trigger("click");
      await flushPromises();

      expect(requestEmailChangeApi).toHaveBeenCalledWith("third@example.com");
    });

    it("shows a cancellation message, not a success one, when resubmitting the current confirmed address", async () => {
      vi.mocked(requestEmailChangeApi).mockResolvedValue({ ...baseUser, pendingEmail: null });
      const result = await mountWithProviders(ProfileView);
      const auth = useAuthStore();
      auth.accessToken = "tok";
      auth.user = { ...baseUser, pendingEmail: "pending@example.com" };
      await flushPromises();
      await result.wrapper.vm.$nextTick();

      await result.wrapper.findAll(".edit-link")[1].trigger("click");
      await flushPromises();
      const [emailInput] = modalInputs();
      await emailInput.setValue(baseUser.email);
      await modalSaveButton().trigger("click");
      await flushPromises();

      expect(requestEmailChangeApi).toHaveBeenCalledWith(baseUser.email);
      expect(document.body.textContent).toContain("Email change cancelled");
      expect(document.body.textContent).not.toContain("Confirmation email sent");
    });

    it("does not submit when the email field is empty", async () => {
      const { wrapper } = await mountProfile();

      await wrapper.findAll(".edit-link")[1].trigger("click");
      await flushPromises();
      const [emailInput] = modalInputs();
      await emailInput.setValue("");
      await modalSaveButton().trigger("click");
      await flushPromises();

      expect(requestEmailChangeApi).not.toHaveBeenCalled();
    });

    it("shows inline feedback and does not submit for an invalid email format", async () => {
      const { wrapper } = await mountProfile();

      await wrapper.findAll(".edit-link")[1].trigger("click");
      await flushPromises();
      const [emailInput] = modalInputs();
      await emailInput.setValue("not-an-email");
      await modalSaveButton().trigger("click");
      await flushPromises();

      expect(document.body.textContent).toContain("Invalid email format");
      expect(requestEmailChangeApi).not.toHaveBeenCalled();
    });

    it("shows the exact retry countdown when rate-limited", async () => {
      vi.mocked(requestEmailChangeApi).mockRejectedValue(
        makeApiError("email_change_rate_limited", "Too many email change requests", { "retry-after": "60" }),
      );
      const { wrapper } = await mountProfile();

      await wrapper.findAll(".edit-link")[1].trigger("click");
      await flushPromises();
      const [emailInput] = modalInputs();
      await emailInput.setValue("new@example.com");
      await modalSaveButton().trigger("click");
      await flushPromises();
      await flushPromises();

      expect(document.body.textContent).toContain("Try again in 60 seconds");
    });

    it("shows the server's reason when the address is already taken", async () => {
      vi.mocked(requestEmailChangeApi).mockRejectedValue(
        makeApiError("user_already_exists", "Email is invalid or already taken"),
      );
      const { wrapper } = await mountProfile();

      await wrapper.findAll(".edit-link")[1].trigger("click");
      await flushPromises();
      const [emailInput] = modalInputs();
      await emailInput.setValue("new@example.com");
      await modalSaveButton().trigger("click");
      await flushPromises();
      await flushPromises();

      expect(document.body.textContent).toContain("Email is invalid or already taken");
    });
  });

  describe("pending email banner", () => {
    it("shows a hint with a resend button when an email change is pending", async () => {
      const result = await mountWithProviders(ProfileView);
      const auth = useAuthStore();
      auth.accessToken = "tok";
      auth.user = { ...baseUser, pendingEmail: "new@example.com" };
      await flushPromises();
      await result.wrapper.vm.$nextTick();

      expect(result.wrapper.text()).toContain("new@example.com");

      const resendBtn = result.wrapper.findAll(".edit-link").find((b) => b.text().includes("Resend confirmation"));
      expect(resendBtn).toBeDefined();
    });

    it("resends the confirmation email when the resend button is clicked", async () => {
      vi.mocked(resendEmailChangeApi).mockResolvedValue(undefined);
      const result = await mountWithProviders(ProfileView);
      const auth = useAuthStore();
      auth.accessToken = "tok";
      auth.user = { ...baseUser, pendingEmail: "new@example.com" };
      await flushPromises();
      await result.wrapper.vm.$nextTick();

      const resendBtn = result.wrapper.findAll(".edit-link").find((b) => b.text().includes("Resend confirmation"));
      await resendBtn?.trigger("click");
      await flushPromises();

      expect(resendEmailChangeApi).toHaveBeenCalled();
    });

    it("shows the exact retry countdown when resend is rate-limited", async () => {
      vi.mocked(resendEmailChangeApi).mockRejectedValue(
        makeApiError("email_change_rate_limited", "Too many email change requests", { "retry-after": "5" }),
      );
      const result = await mountWithProviders(ProfileView);
      const auth = useAuthStore();
      auth.accessToken = "tok";
      auth.user = { ...baseUser, pendingEmail: "new@example.com" };
      await flushPromises();
      await result.wrapper.vm.$nextTick();

      const resendBtn = result.wrapper.findAll(".edit-link").find((b) => b.text().includes("Resend confirmation"));
      await resendBtn?.trigger("click");
      await flushPromises();
      await flushPromises();

      expect(document.body.textContent).toContain("Try again in 5 second");
    });

    it("shows the server's reason when there is nothing pending to resend", async () => {
      vi.mocked(resendEmailChangeApi).mockRejectedValue(
        makeApiError("email_change_not_pending", "No email change is pending"),
      );
      const result = await mountWithProviders(ProfileView);
      const auth = useAuthStore();
      auth.accessToken = "tok";
      auth.user = { ...baseUser, pendingEmail: "new@example.com" };
      await flushPromises();
      await result.wrapper.vm.$nextTick();

      const resendBtn = result.wrapper.findAll(".edit-link").find((b) => b.text().includes("Resend confirmation"));
      await resendBtn?.trigger("click");
      await flushPromises();
      await flushPromises();

      expect(document.body.textContent).toContain("No email change is pending");
    });

    it("does not show the hint when there is no pending email change", async () => {
      const { wrapper } = await mountProfile();

      expect(wrapper.text()).not.toContain("Resend confirmation");
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
        data: { errors: [{ field: "currentPassword", message: "Current password is wrong" }] },
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
