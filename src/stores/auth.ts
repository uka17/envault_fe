import { defineStore } from "pinia";
import {
  loginApi,
  logoutApi,
  refreshTokenApi,
  checkAuthApi,
  updateNameApi,
  requestEmailChangeApi,
  confirmEmailChangeApi,
  resendEmailChangeApi,
  updatePasswordApi,
  registerApi,
  verifyEmailApi,
  resendVerificationApi,
  type UserResponse,
  type UpdatePasswordPayload,
  type RegisterPayload,
} from "@/api/authApi";

interface AuthState {
  accessToken: string | null;
  user: UserResponse | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    accessToken: null,
    user: null,
  }),

  getters: {
    isAuthenticated: (state) => state.accessToken !== null,
  },

  actions: {
    /**
     * Authenticate with email and password.
     * Stores the access token in memory and sets an HttpOnly refresh token cookie via the server.
     * @param email User email address.
     * @param password User password.
     */
    async login(email: string, password: string) {
      const token = await loginApi({ email, password });
      this.accessToken = token;
      localStorage.setItem("hasSession", "1");
      await this.fetchUser();
    },

    /**
     * Register a new user account.
     * Does not authenticate the user; a separate login is required afterwards.
     * @param payload Registration data (email, password, name).
     */
    async register(payload: RegisterPayload) {
      await registerApi(payload);
    },

    /**
     * Verify a user's email using the code received by email at registration time.
     * Does not authenticate the user; a separate login is required afterwards.
     * @param code Verification code.
     */
    async verifyEmail(code: string) {
      await verifyEmailApi(code);
    },

    /**
     * Resend the email verification code for the given address.
     * @param email Email address to resend the verification code to.
     */
    async resendVerification(email: string) {
      await resendVerificationApi(email);
    },

    /**
     * Exchange the HttpOnly refresh token cookie for a new access token.
     * Called automatically by the axios interceptor on 401 responses.
     * @returns New access token string.
     */
    async refresh(): Promise<string> {
      const token = await refreshTokenApi();
      this.accessToken = token;
      return token;
    },

    /**
     * Clear in-memory auth state without calling the server.
     * Used when the server rejects the refresh token.
     * @returns Nothing.
     */
    clearAuth() {
      this.accessToken = null;
      this.user = null;
      localStorage.removeItem("hasSession");
    },

    /**
     * Revoke the refresh token on the server and clear local auth state.
     */
    async logout() {
      try {
        await logoutApi();
      } finally {
        this.accessToken = null;
        this.user = null;
        localStorage.removeItem("hasSession");
      }
    },

    /**
     * Fetch the current user profile using the stored access token.
     * Clears auth state if the token is invalid or missing.
     */
    async fetchUser() {
      if (!this.accessToken) return;
      try {
        this.user = await checkAuthApi();
      } catch {
        this.accessToken = null;
        this.user = null;
      }
    },

    /**
     * Update the current user's display name and sync local state.
     * @param name New display name.
     * @returns Resolves once the updated profile is stored.
     */
    async updateName(name: string) {
      this.user = await updateNameApi(name);
    },

    /**
     * Request an email change for the current user and sync local state
     * (the address stays pending until confirmed).
     * @param email New email address to request.
     * @returns Resolves once the profile with the pending address is stored.
     */
    async requestEmailChange(email: string) {
      this.user = await requestEmailChangeApi(email);
    },

    /**
     * Confirm a pending email change using the token from the email link.
     * The server revokes every session on success, so local auth state is cleared too.
     * @param token Confirmation token from the email link.
     * @returns Resolves once the change is confirmed and local auth state is cleared.
     */
    async confirmEmailChange(token: string) {
      await confirmEmailChangeApi(token);
      this.accessToken = null;
      this.user = null;
      localStorage.removeItem("hasSession");
    },

    /**
     * Resend the current user's pending email change confirmation.
     * @returns Resolves once the server accepts the resend request.
     */
    async resendEmailChange() {
      await resendEmailChangeApi();
    },

    /**
     * Change the current user's password.
     * @param data Current and new password.
     */
    async updatePassword(data: UpdatePasswordPayload) {
      await updatePasswordApi(data);
    },

    /**
     * Restore auth state on app startup by attempting a silent token refresh.
     * Only runs if a session flag is present in localStorage to avoid unnecessary
     * refresh requests on public pages (login, register).
     */
    async init() {
      if (!localStorage.getItem("hasSession")) return;
      try {
        await this.refresh();
        await this.fetchUser();
      } catch {
        this.accessToken = null;
        this.user = null;
        localStorage.removeItem("hasSession");
      }
    },
  },
});
