import { defineStore } from "pinia";
import {
  getSessionsApi,
  terminateSessionApi,
  terminateOtherSessionsApi,
  type SessionResponse,
} from "@/api/sessionApi";
import { i18n } from "@/i18n";

interface SessionsState {
  sessions: SessionResponse[];
  loading: boolean;
  error: string | null;
}

export const useSessionsStore = defineStore("sessions", {
  state: (): SessionsState => ({
    sessions: [],
    loading: false,
    error: null,
  }),

  actions: {
    /**
     * Load all active sessions from the API and replace the local list.
     */
    async fetchSessions() {
      this.loading = true;
      this.error = null;
      try {
        this.sessions = await getSessionsApi();
      } catch {
        this.error = i18n.global.t("profile.security.loadFailed");
      } finally {
        this.loading = false;
      }
    },

    /**
     * Terminate a single session by ID and remove it from the local list.
     * @param id Session ID to terminate.
     */
    async terminateSession(id: number) {
      await terminateSessionApi(id);
      this.sessions = this.sessions.filter((s) => s.id !== id);
    },

    /**
     * Terminate every session except the current one and update the local list.
     */
    async terminateOtherSessions() {
      await terminateOtherSessionsApi();
      this.sessions = this.sessions.filter((s) => s.current);
    },
  },
});
