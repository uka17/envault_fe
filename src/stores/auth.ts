import { defineStore } from "pinia";
import {
  loginApi,
  logoutApi,
  refreshTokenApi,
  checkAuthApi,
  updateProfileApi,
  updatePasswordApi,
  registerApi,
  type UserResponse,
  type UpdateProfilePayload,
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
     * Used by the axios interceptor when a refresh attempt fails.
     */
    clearAuth() {
      this.accessToken = null;
      this.user = null;
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
     * Update the current user's profile fields (name and/or email) and sync local state.
     * @param data Fields to update.
     */
    async updateProfile(data: UpdateProfilePayload) {
      this.user = await updateProfileApi(data);
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
