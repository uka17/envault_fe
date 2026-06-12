import { defineStore } from "pinia";
import { loginApi, checkAuthApi, type UserResponse } from "@/api/authApi";

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
    async login(email: string, password: string) {
      const token = await loginApi({ email, password });
      this.accessToken = token;
      await this.fetchUser();
    },

    logout() {
      this.accessToken = null;
      this.user = null;
    },

    async fetchUser() {
      try {
        this.user = await checkAuthApi();
      } catch {
        this.accessToken = null;
        this.user = null;
      }
    },
  },
});
