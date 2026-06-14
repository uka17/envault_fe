import { defineStore } from "pinia";
import { loginApi, checkAuthApi, type UserResponse } from "@/api/authApi";

const TOKEN_KEY = "envault_token";

interface AuthState {
  accessToken: string | null;
  user: UserResponse | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    accessToken: localStorage.getItem(TOKEN_KEY),
    user: null,
  }),

  getters: {
    isAuthenticated: (state) => state.accessToken !== null,
  },

  actions: {
    /**
     * Authenticates the user and persists the token to localStorage.
     * @param email - User email address.
     * @param password - User password.
     */
    async login(email: string, password: string) {
      const token = await loginApi({ email, password });
      this.accessToken = token;
      localStorage.setItem(TOKEN_KEY, token);
      await this.fetchUser();
    },

    /**
     * Clears auth state and removes the token from localStorage.
     */
    logout() {
      this.accessToken = null;
      this.user = null;
      localStorage.removeItem(TOKEN_KEY);
    },

    /**
     * Fetches the current user profile using the stored token.
     * Clears auth state if the token is invalid or the request fails.
     */
    async fetchUser() {
      if (!this.accessToken) return;
      try {
        this.user = await checkAuthApi();
      } catch {
        this.accessToken = null;
        this.user = null;
        localStorage.removeItem(TOKEN_KEY);
      }
    },

    /**
     * Restores auth state on app startup by fetching user info if a token exists.
     */
    async init() {
      if (this.accessToken) {
        await this.fetchUser();
      }
    },
  },
});
