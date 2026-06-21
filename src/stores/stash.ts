import { defineStore } from "pinia";
import {
  getStashesApi,
  deleteStashApi,
  snoozeStashApi,
  type StashResponse,
} from "@/api/stashApi";

interface StashState {
  stashes: StashResponse[];
  loading: boolean;
  error: string | null;
}

export const useStashStore = defineStore("stash", {
  state: (): StashState => ({
    stashes: [],
    loading: false,
    error: null,
  }),

  getters: {
    /** Total number of stashes. */
    total: (state) => state.stashes.length,
    /** Number of stashes not yet sent. */
    plannedCount: (state) => state.stashes.filter((s) => !s.isSent).length,
    /** Number of stashes already sent. */
    sentCount: (state) => state.stashes.filter((s) => s.isSent).length,
  },

  actions: {
    /**
     * Load all stashes from the API and replace the local list.
     */
    async fetchStashes() {
      this.loading = true;
      this.error = null;
      try {
        this.stashes = await getStashesApi();
      } catch {
        this.error = "Не удалось загрузить stash'и";
      } finally {
        this.loading = false;
      }
    },

    /**
     * Delete a stash by ID and remove it from the local list.
     * @param id Stash ID to delete.
     */
    async deleteStash(id: number) {
      await deleteStashApi(id);
      this.stashes = this.stashes.filter((s) => s.id !== id);
    },

    /**
     * Snooze a stash by N hours and update it in the local list.
     * @param id Stash ID to snooze.
     * @param hours Number of hours to postpone.
     */
    async snoozeStash(id: number, hours: number) {
      const updated = await snoozeStashApi(id, hours);
      const idx = this.stashes.findIndex((s) => s.id === id);
      if (idx !== -1) this.stashes[idx] = updated;
    },
  },
});
