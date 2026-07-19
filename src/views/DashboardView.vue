<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { NButton, NIcon, NLayout, NLayoutContent, NModal, useMessage } from "naive-ui";
import AppHeader from "@/components/AppHeader.vue";
import { useStashStore } from "@/stores/stash";
import {
  CheckmarkCircleOutline,
  LockClosedOutline,
  MailOutline,
  PaperPlaneOutline,
  TimeOutline,
  AddOutline,
  TrashOutline,
} from "@vicons/ionicons5";

type DashboardFilter = "all" | "planned" | "sent";

const router = useRouter();
const stashStore = useStashStore();
const { t, locale } = useI18n();
const message = useMessage();
const activeFilter = ref<DashboardFilter>("all");
const snoozeLoadingId = ref<number | null>(null);
const showDeleteModal = ref(false);
const deleteTargetId = ref<number | null>(null);
const deleteLoadingId = ref<number | null>(null);

onMounted(() => {
  stashStore.fetchStashes();
});

const summary = computed(() => ({
  total: stashStore.total,
  planned: stashStore.plannedCount,
  sent: stashStore.sentCount,
}));

const filteredStashes = computed(() => {
  if (activeFilter.value === "all") return stashStore.stashes;
  if (activeFilter.value === "sent") return stashStore.stashes.filter((s) => s.isSent);
  return stashStore.stashes.filter((s) => !s.isSent);
});

/**
 * Format an ISO date string to a human-readable string in the active locale.
 * @param isoDate ISO 8601 date string.
 * @returns Formatted date string, e.g. "June 15, 2025, 12:00".
 */
const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat(locale.value, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

/**
 * Compute a human-readable subtitle for a stash based on its status and send time.
 * @param isSent Whether the stash has already been sent.
 * @param sendAt ISO 8601 date string of the scheduled send time.
 * @returns Subtitle string.
 */
const getSubtitle = (isSent: boolean, sendAt: string): string => {
  if (isSent) return t("stash.dashboard.statusSent");
  const diff = new Date(sendAt).getTime() - Date.now();
  if (diff <= 0) return t("stash.dashboard.statusPending");
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return t("stash.dashboard.today");
  if (days === 1) return t("stash.dashboard.tomorrow");
  if (days < 30) return t("stash.dashboard.inDays", { n: days }, days);
  const months = Math.floor(days / 30);
  if (months < 12) return t("stash.dashboard.inMonths", { n: months }, months);
  const years = Math.floor(months / 12);
  return t("stash.dashboard.inYears", { n: years }, years);
};

/**
 * Snooze a stash by 24 hours.
 * @param id Stash ID to snooze.
 */
const handleSnooze = async (id: number): Promise<void> => {
  snoozeLoadingId.value = id;
  try {
    await stashStore.snoozeStash(id, 24);
  } finally {
    snoozeLoadingId.value = null;
  }
};

/**
 * Open the delete confirmation modal for a given stash.
 * @param id Stash ID to delete.
 */
const confirmDeleteStash = (id: number): void => {
  deleteTargetId.value = id;
  showDeleteModal.value = true;
};

/**
 * Delete the stash currently selected for deletion after user confirmation.
 */
const handleDeleteStash = async (): Promise<void> => {
  if (deleteTargetId.value === null) return;
  const id = deleteTargetId.value;
  deleteLoadingId.value = id;
  try {
    await stashStore.deleteStash(id);
    showDeleteModal.value = false;
  } catch {
    message.error(t("stash.dashboard.deleteFailed"));
  } finally {
    deleteLoadingId.value = null;
    deleteTargetId.value = null;
  }
};
</script>

<template>
  <n-layout class="dashboard-page">
    <AppHeader />

    <n-layout-content class="dashboard-content">
      <div class="dashboard-container">
        <section class="summary-grid">
          <article class="summary-card">
            <p class="summary-label">{{ t("stash.dashboard.totalStashes") }}</p>
            <div class="summary-value-row">
              <n-icon class="summary-icon lock" :size="22">
                <LockClosedOutline />
              </n-icon>
              <strong>{{ summary.total }}</strong>
            </div>
          </article>

          <article class="summary-card">
            <p class="summary-label">{{ t("stash.dashboard.planned") }}</p>
            <div class="summary-value-row">
              <n-icon class="summary-icon planned" :size="22">
                <TimeOutline />
              </n-icon>
              <strong>{{ summary.planned }}</strong>
            </div>
          </article>

          <article class="summary-card">
            <p class="summary-label">{{ t("stash.dashboard.sent") }}</p>
            <div class="summary-value-row">
              <n-icon class="summary-icon sent" :size="22">
                <PaperPlaneOutline />
              </n-icon>
              <strong>{{ summary.sent }}</strong>
            </div>
          </article>
        </section>

        <section class="toolbar">
          <div class="filter-group">
            <button
              type="button"
              class="filter-pill"
              :class="{ active: activeFilter === 'all' }"
              @click="activeFilter = 'all'"
            >
              {{ t("stash.dashboard.filterAll") }}
            </button>

            <button
              type="button"
              class="filter-pill with-icon"
              :class="{ active: activeFilter === 'planned' }"
              @click="activeFilter = 'planned'"
            >
              <n-icon :size="15">
                <TimeOutline />
              </n-icon>
              {{ t("stash.dashboard.filterPlanned") }}
            </button>

            <button
              type="button"
              class="filter-pill with-icon"
              :class="{ active: activeFilter === 'sent' }"
              @click="activeFilter = 'sent'"
            >
              <n-icon :size="15">
                <PaperPlaneOutline />
              </n-icon>
              {{ t("stash.dashboard.filterSent") }}
            </button>
          </div>

          <n-button type="primary" class="new-stash-btn" @click="router.push({ name: 'create-stash' })">
            <template #icon>
              <n-icon :size="18">
                <AddOutline />
              </n-icon>
            </template>
            {{ t("stash.dashboard.newStash") }}
          </n-button>
        </section>

        <section class="stash-list">
          <article v-for="stash in filteredStashes" :key="stash.id" class="stash-row">
            <div class="status-badge" :class="stash.isSent ? 'sent' : 'planned'">
              <n-icon :size="24">
                <component :is="stash.isSent ? CheckmarkCircleOutline : TimeOutline" />
              </n-icon>
            </div>

            <div class="recipient-block">
              <div class="recipient-name-row">
                <n-icon :size="16">
                  <MailOutline />
                </n-icon>
                <strong class="recipient-name">{{ stash.to }}</strong>
              </div>
            </div>

            <div class="schedule-block">
              <p class="scheduled-at">
                <n-icon :size="16">
                  <PaperPlaneOutline />
                </n-icon>
                <span>{{ formatDate(stash.sendAt) }}</span>
              </p>
              <p class="scheduled-subtitle" :class="stash.isSent ? 'sent' : 'planned'">
                {{ getSubtitle(stash.isSent, stash.sendAt) }}
              </p>
            </div>

            <div class="row-action">
              <n-button
                v-if="!stash.isSent"
                ghost
                class="postpone-btn"
                :loading="snoozeLoadingId === stash.id"
                @click="handleSnooze(stash.id)"
              >
                <template #icon>
                  <n-icon :size="16">
                    <TimeOutline />
                  </n-icon>
                </template>
                {{ t("stash.dashboard.snooze") }}
              </n-button>
              <n-button
                ghost
                class="delete-btn"
                :loading="deleteLoadingId === stash.id"
                @click="confirmDeleteStash(stash.id)"
              >
                <template #icon>
                  <n-icon :size="16">
                    <TrashOutline />
                  </n-icon>
                </template>
                {{ t("stash.dashboard.delete") }}
              </n-button>
            </div>
          </article>
        </section>
      </div>
    </n-layout-content>

    <n-modal
      v-model:show="showDeleteModal"
      preset="card"
      :title="t('stash.dashboard.modals.deleteTitle')"
      class="edit-modal"
      :style="{ maxWidth: '420px' }"
    >
      <p>{{ t("stash.dashboard.modals.deleteText") }}</p>
      <template #footer>
        <div class="modal-footer">
          <n-button ghost @click="showDeleteModal = false">{{ t("common.actions.cancel") }}</n-button>
          <n-button type="error" :loading="deleteLoadingId !== null" @click="handleDeleteStash">
            {{ t("stash.dashboard.modals.deleteConfirm") }}
          </n-button>
        </div>
      </template>
    </n-modal>
  </n-layout>
</template>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  color: var(--env-text);
  background:
    radial-gradient(circle at 20% 10%, rgba(137, 116, 180, 0.22), transparent 30%),
    radial-gradient(circle at 90% 80%, rgba(137, 116, 180, 0.12), transparent 35%), #080a0d;
}

.dashboard-container {
  width: min(1400px, calc(100% - 1rem));
  margin: 0 auto;
}

.dashboard-content {
  padding: 2rem 0 2.8rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.summary-card {
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
  padding: 1.5rem;
  min-height: 116px;
}

.summary-label {
  margin: 0;
  color: #8f93a3;
  font-size: 1rem;
}

.summary-value-row {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.summary-value-row strong {
  font-size: 2.8rem;
  line-height: 1;
  font-weight: 650;
  color: #e8e9ef;
}

.summary-icon.lock {
  color: #9d82d4;
}

.summary-icon.planned {
  color: #a38cdf;
}

.summary-icon.sent {
  color: #48bf84;
}

.toolbar {
  margin-top: 1.8rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.filter-pill {
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.01);
  color: #dee0e6;
  padding: 0 1rem;
  font-size: 0.95rem;
  font-weight: 620;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.filter-pill.active {
  color: #121020;
  border-color: rgba(137, 116, 180, 0.8);
  background: linear-gradient(135deg, #8e79b7 0%, #7f68ad 100%);
}

.filter-pill.with-icon {
  padding: 0 0.95rem;
}

:deep(.new-stash-btn.n-button) {
  min-width: 188px;
  height: 46px;
  font-size: 1.02rem;
  font-weight: 700;
  color: #14111d;
  border: none;
  background: linear-gradient(135deg, var(--env-accent-soft) 0%, var(--env-accent) 100%);
}

:deep(.new-stash-btn.n-button:hover) {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

.stash-list {
  margin-top: 1.35rem;
  display: grid;
  gap: 1rem;
}

.stash-row {
  border-radius: 14px;
  border: 1px solid rgba(137, 116, 180, 0.32);
  background: linear-gradient(180deg, rgba(15, 17, 28, 0.96), rgba(11, 12, 22, 0.96));
  padding: 1.35rem 1.45rem;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 1.25rem;
}

.status-badge {
  width: 52px;
  height: 52px;
  border-radius: 13px;
  display: grid;
  place-items: center;
}

.status-badge.planned {
  color: #a28be3;
  background: rgba(137, 116, 180, 0.18);
}

.status-badge.sent {
  color: #46b780;
  background: rgba(67, 176, 129, 0.14);
}

.recipient-block {
  min-width: 0;
}

.recipient-name-row,
.recipient-mail-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.recipient-name-row {
  color: #dadce4;
  margin-bottom: 0.24rem;
}

.recipient-name {
  font-size: 2rem;
  font-weight: 670;
}

.recipient-mail-row {
  color: #7f8497;
  font-size: 0.95rem;
}

.schedule-block {
  min-width: 236px;
}

.scheduled-at {
  margin: 0;
  color: #d9dce4;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.45rem;
  font-size: 0.99rem;
  font-weight: 520;
}

.scheduled-subtitle {
  margin: 0.2rem 0 0;
  font-size: 0.95rem;
  text-align: right;
}

.scheduled-subtitle.planned {
  color: #9588ba;
}

.scheduled-subtitle.sent {
  color: #81889b;
}

.row-action {
  min-width: 182px;
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

:deep(.postpone-btn.n-button) {
  height: 38px;
  border-radius: 10px;
  color: #dee2ec;
  border: 1px solid rgba(137, 116, 180, 0.5);
  background: rgba(255, 255, 255, 0.01);
}

:deep(.postpone-btn.n-button:hover) {
  color: #ffffff;
  border-color: rgba(157, 138, 202, 0.9);
}

:deep(.delete-btn.n-button) {
  height: 38px;
  border-radius: 10px;
  color: #e8a3a3;
  border: 1px solid rgba(200, 90, 90, 0.4);
  background: rgba(255, 255, 255, 0.01);
}

:deep(.delete-btn.n-button:hover) {
  color: #ff8f8f;
  border-color: rgba(220, 100, 100, 0.8);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

@media (max-width: 1080px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stash-row {
    grid-template-columns: auto minmax(0, 1fr);
    gap: 1rem;
  }

  .schedule-block {
    min-width: 0;
    grid-column: 1 / -1;
    padding-left: 4.2rem;
  }

  .scheduled-at,
  .scheduled-subtitle {
    justify-content: flex-start;
    text-align: left;
  }

  .row-action {
    min-width: 0;
    justify-content: flex-start;
    padding-left: 4.2rem;
    grid-column: 1 / -1;
  }
}

@media (max-width: 760px) {
  .dashboard-container {
    width: calc(100% - 1rem);
  }

  .brand-name {
    font-size: 1.75rem;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .summary-value-row strong {
    font-size: 2.4rem;
  }

  .toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  :deep(.new-stash-btn.n-button) {
    width: 100%;
  }

  .stash-row {
    padding: 1rem;
  }

  .recipient-name {
    font-size: 1.65rem;
  }

  .schedule-block,
  .row-action {
    padding-left: 0;
  }
}

</style>
