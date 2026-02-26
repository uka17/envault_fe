<script setup lang="ts">
import { computed, ref } from "vue";
import { NButton, NIcon, NLayout, NLayoutContent, NLayoutHeader, NSpace, NText } from "naive-ui";
import {
  AddOutline,
  CheckmarkCircleOutline,
  LockClosedOutline,
  MailOutline,
  PaperPlaneOutline,
  PersonOutline,
  TimeOutline,
} from "@vicons/ionicons5";

type StashStatus = "planned" | "sent";
type DashboardFilter = "all" | StashStatus;

interface StashItem {
  id: string;
  recipientName: string;
  recipientEmail: string;
  scheduledAt: string;
  status: StashStatus;
  subtitle: string;
  postponeLabel?: string;
}

const stashes: StashItem[] = [
  {
    id: "1",
    recipientName: "Анна Иванова",
    recipientEmail: "anna@example.com",
    scheduledAt: "2025-06-15T12:00:00",
    status: "planned",
    subtitle: "Ожидает отправки",
    postponeLabel: "Отложить на 7 дней",
  },
  {
    id: "2",
    recipientName: "Дочь",
    recipientEmail: "daughter@example.com",
    scheduledAt: "2030-01-01T00:00:00",
    status: "planned",
    subtitle: "Через почти 4 года",
    postponeLabel: "Отложить на 1 месяц",
  },
  {
    id: "3",
    recipientName: "Сергей Петров",
    recipientEmail: "sergey@example.com",
    scheduledAt: "2024-12-25T10:00:00",
    status: "sent",
    subtitle: "Отправлен",
  },
];

const activeFilter = ref<DashboardFilter>("all");

const summary = computed(() => ({
  total: stashes.length,
  planned: stashes.filter((stash) => stash.status === "planned").length,
  sent: stashes.filter((stash) => stash.status === "sent").length,
}));

const filteredStashes = computed(() => {
  if (activeFilter.value === "all") {
    return stashes;
  }
  return stashes.filter((stash) => stash.status === activeFilter.value);
});

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day} ${month} ${year}, ${hours}:${minutes}`;
};
</script>

<template>
  <n-layout class="dashboard-page">
    <n-layout-header bordered class="dashboard-header">
      <div class="dashboard-container header-content">
        <n-space align="center" :size="10">
          <div class="envault-brand-mark">
            <n-icon :size="16">
              <LockClosedOutline />
            </n-icon>
          </div>
          <n-text class="brand-name">Envault</n-text>
        </n-space>

        <button class="avatar-badge" type="button" aria-label="Текущий пользователь">US</button>
      </div>
    </n-layout-header>

    <n-layout-content class="dashboard-content">
      <div class="dashboard-container">
        <section class="summary-grid">
          <article class="summary-card">
            <p class="summary-label">Всего stash'ей</p>
            <div class="summary-value-row">
              <n-icon class="summary-icon lock" :size="22">
                <LockClosedOutline />
              </n-icon>
              <strong>{{ summary.total }}</strong>
            </div>
          </article>

          <article class="summary-card">
            <p class="summary-label">Запланировано</p>
            <div class="summary-value-row">
              <n-icon class="summary-icon planned" :size="22">
                <TimeOutline />
              </n-icon>
              <strong>{{ summary.planned }}</strong>
            </div>
          </article>

          <article class="summary-card">
            <p class="summary-label">Отправлено</p>
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
              Все
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
              Запланированные
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
              Отправленные
            </button>
          </div>

          <n-button type="primary" class="new-stash-btn">
            <template #icon>
              <n-icon :size="18">
                <AddOutline />
              </n-icon>
            </template>
            Новый stash
          </n-button>
        </section>

        <section class="stash-list">
          <article v-for="stash in filteredStashes" :key="stash.id" class="stash-row">
            <div class="status-badge" :class="stash.status">
              <n-icon :size="24">
                <component
                  :is="stash.status === 'planned' ? TimeOutline : CheckmarkCircleOutline"
                />
              </n-icon>
            </div>

            <div class="recipient-block">
              <div class="recipient-name-row">
                <n-icon :size="16">
                  <PersonOutline />
                </n-icon>
                <strong class="recipient-name">{{ stash.recipientName }}</strong>
              </div>
              <div class="recipient-mail-row">
                <n-icon :size="15">
                  <MailOutline />
                </n-icon>
                <span>{{ stash.recipientEmail }}</span>
              </div>
            </div>

            <div class="schedule-block">
              <p class="scheduled-at">
                <n-icon :size="16">
                  <PaperPlaneOutline />
                </n-icon>
                <span>{{ formatDate(stash.scheduledAt) }}</span>
              </p>
              <p class="scheduled-subtitle" :class="stash.status">
                {{ stash.subtitle }}
              </p>
            </div>

            <div class="row-action">
              <n-button v-if="stash.status === 'planned'" ghost class="postpone-btn">
                <template #icon>
                  <n-icon :size="16">
                    <TimeOutline />
                  </n-icon>
                </template>
                {{ stash.postponeLabel }}
              </n-button>
            </div>
          </article>
        </section>
      </div>
    </n-layout-content>
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

.dashboard-header {
  backdrop-filter: blur(10px);
  background: rgba(7, 8, 15, 0.84);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dashboard-container {
  width: min(1400px, calc(100% - 1rem));
  margin: 0 auto;
}

.header-content {
  min-height: 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-name {
  color: var(--env-text);
  font-size: 2rem;
  font-weight: 680;
  letter-spacing: -0.01em;
}

.avatar-badge {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  color: #bca9d6;
  font-size: 0.9rem;
  font-weight: 600;
  background: rgba(137, 116, 180, 0.18);
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
