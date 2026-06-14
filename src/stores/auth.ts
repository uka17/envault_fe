import { defineStore } from "pinia";
import {
  loginApi,
  logoutApi,
  refreshTokenApi,
  checkAuthApi,
  type UserResponse,
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
      await this.fetchUser();
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
     * Restore auth state on app startup by attempting a silent token refresh.
     * If the refresh token cookie is present the server returns a new access token.
     */
    async init() {
      try {
        await this.refresh();
        await this.fetchUser();
      } catch {
        this.accessToken = null;
        this.user = null;
      }
    },
  },
});
