// stores/auth.ts
import { defineStore } from "pinia";
import { loginApi } from "@/api/authApi";

interface AuthState {
  accessToken: string | null;
  user: { id: string; email: string } | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    accessToken: null,
    user: null,
  }),

  actions: {
    async login(email: string, password: string) {
      const resp = await loginApi({ email, password });
      this.accessToken = resp.token;
      alert("token: " + resp.token);
      this.persist();
    },

    logout() {
      this.accessToken = null;
      this.user = null;
      this.clearPersist();
    },

    initFromStorage() {
      const token = localStorage.getItem("accessToken");
      if (token) {
        this.accessToken = token;
      }
    },

    persist() {
      if (this.accessToken) {
        localStorage.setItem("accessToken", this.accessToken);
      }
    },

    clearPersist() {
      localStorage.removeItem("accessToken");
    },
  },
});
