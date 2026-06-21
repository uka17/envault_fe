<script setup lang="ts">
import { ref, computed } from "vue";
import {
  NLayout,
  NLayoutContent,
  NIcon,
  NSwitch,
  NButton,
  NInput,
  NFormItem,
  useMessage,
} from "naive-ui";
import AppHeader from "@/components/AppHeader.vue";
import {
  MailOutline,
  CalendarOutline,
  CheckmarkCircleOutline,
  ShieldOutline,
  PersonOutline,
  LogOutOutline,
  ArrowForwardOutline,
  TrashOutline,
  KeyOutline,
  CloseOutline,
} from "@vicons/ionicons5";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const message = useMessage();

const user = computed(() => auth.user);

const registeredAt = computed(() => {
  if (!user.value?.createdOn) return "—";
  return new Date(user.value.createdOn).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});

// Email form
const showEmailForm = ref(false);
const newEmail = ref("");
const emailLoading = ref(false);

/**
 * Open the email change form, pre-filling the current email.
 */
function openEmailForm() {
  newEmail.value = user.value?.email ?? "";
  showEmailForm.value = true;
}

/**
 * Submit the email change form.
 */
async function submitEmailForm() {
  if (!newEmail.value) return;
  emailLoading.value = true;
  try {
    await auth.updateProfile({ email: newEmail.value });
    message.success("Email обновлён");
    showEmailForm.value = false;
  } catch {
    message.error("Не удалось обновить email");
  } finally {
    emailLoading.value = false;
  }
}

// Name form
const showNameForm = ref(false);
const newName = ref("");
const nameLoading = ref(false);

/**
 * Open the name change form, pre-filling the current name.
 */
function openNameForm() {
  newName.value = user.value?.name ?? "";
  showNameForm.value = true;
}

/**
 * Submit the name change form.
 */
async function submitNameForm() {
  if (!newName.value) return;
  nameLoading.value = true;
  try {
    await auth.updateProfile({ name: newName.value });
    message.success("Имя обновлено");
    showNameForm.value = false;
  } catch {
    message.error("Не удалось обновить имя");
  } finally {
    nameLoading.value = false;
  }
}

// Password form
const showPasswordForm = ref(false);
const currentPassword = ref("");
const newPassword = ref("");
const passwordLoading = ref(false);

/**
 * Open the password change form and reset fields.
 */
function openPasswordForm() {
  currentPassword.value = "";
  newPassword.value = "";
  showPasswordForm.value = true;
}

/**
 * Submit the password change form.
 */
async function submitPasswordForm() {
  if (!currentPassword.value || !newPassword.value) return;
  passwordLoading.value = true;
  try {
    await auth.updatePassword({ currentPassword: currentPassword.value, newPassword: newPassword.value });
    message.success("Пароль изменён");
    showPasswordForm.value = false;
    currentPassword.value = "";
    newPassword.value = "";
  } catch {
    message.error("Не удалось изменить пароль. Проверьте текущий пароль.");
  } finally {
    passwordLoading.value = false;
  }
}

const twoFactorEnabled = ref(false);

interface Session {
  id: string;
  browser: string;
  os: string;
  ip: string;
  date: string;
  time: string;
  isCurrent: boolean;
}

const sessions: Session[] = [
  {
    id: "1",
    browser: "Chrome 120",
    os: "macOS",
    ip: "192.168.1.1",
    date: "23 февраля 2026 г.",
    time: "14:30",
    isCurrent: true,
  },
  {
    id: "2",
    browser: "Safari 17",
    os: "iPhone",
    ip: "10.0.0.5",
    date: "22 февраля 2026 г.",
    time: "09:15",
    isCurrent: false,
  },
  {
    id: "3",
    browser: "Firefox 121",
    os: "Windows",
    ip: "172.16.0.3",
    date: "20 февраля 2026 г.",
    time: "18:45",
    isCurrent: false,
  },
];
</script>

<template>
  <n-layout class="profile-page">
    <AppHeader />

    <n-layout-content class="profile-content">
      <div class="profile-container">
        <header class="page-header">
          <h1 class="page-title">Профиль</h1>
          <p class="page-subtitle">Управление аккаунтом и настройками</p>
        </header>

        <!-- Account section -->
        <section class="profile-card">
          <div class="card-heading">
            <n-icon :size="20" class="card-heading-icon">
              <PersonOutline />
            </n-icon>
            <div>
              <h2 class="card-title">Аккаунт</h2>
              <p class="card-subtitle">Основная информация о вашем аккаунте</p>
            </div>
          </div>

          <div class="divider" />

          <dl class="info-list">
            <div class="info-row">
              <div class="info-label-row">
                <n-icon :size="16" class="info-icon">
                  <PersonOutline />
                </n-icon>
                <dt class="info-label">Имя</dt>
              </div>
              <dd class="info-value">{{ user?.name ?? "—" }}</dd>
            </div>

            <div class="info-row">
              <div class="info-label-row">
                <n-icon :size="16" class="info-icon">
                  <MailOutline />
                </n-icon>
                <dt class="info-label">Email</dt>
              </div>
              <dd class="info-value">
                <span>{{ user?.email ?? "—" }}</span>
              </dd>
            </div>

            <div class="info-row">
              <div class="info-label-row">
                <n-icon :size="16" class="info-icon">
                  <CalendarOutline />
                </n-icon>
                <dt class="info-label">Дата регистрации</dt>
              </div>
              <dd class="info-value">{{ registeredAt }}</dd>
            </div>

            <div class="info-row">
              <div class="info-label-row">
                <n-icon :size="16" class="info-icon">
                  <CheckmarkCircleOutline />
                </n-icon>
                <dt class="info-label">Статус аккаунта</dt>
              </div>
              <dd class="info-value">
                <span class="badge badge-active">Активен</span>
              </dd>
            </div>
          </dl>

          <div class="divider" />

          <div class="action-list">
            <!-- Change name -->
            <button type="button" class="action-row" @click="openNameForm">
              <div class="action-row-left">
                <n-icon :size="17" class="action-icon">
                  <PersonOutline />
                </n-icon>
                <span>Изменить имя</span>
              </div>
              <n-icon :size="17" class="action-chevron">
                <ArrowForwardOutline />
              </n-icon>
            </button>

            <div v-if="showNameForm" class="inline-form">
              <n-form-item label="Новое имя" class="form-item">
                <n-input
                  v-model:value="newName"
                  placeholder="Введите новое имя"
                  @keyup.enter="submitNameForm"
                />
              </n-form-item>
              <div class="form-actions">
                <n-button
                  type="primary"
                  size="small"
                  :loading="nameLoading"
                  @click="submitNameForm"
                >
                  Сохранить
                </n-button>
                <n-button
                  ghost
                  size="small"
                  @click="showNameForm = false"
                >
                  <template #icon>
                    <n-icon><CloseOutline /></n-icon>
                  </template>
                  Отмена
                </n-button>
              </div>
            </div>

            <!-- Change email -->
            <button type="button" class="action-row" @click="openEmailForm">
              <div class="action-row-left">
                <n-icon :size="17" class="action-icon">
                  <MailOutline />
                </n-icon>
                <span>Изменить email</span>
              </div>
              <n-icon :size="17" class="action-chevron">
                <ArrowForwardOutline />
              </n-icon>
            </button>

            <div v-if="showEmailForm" class="inline-form">
              <n-form-item label="Новый email" class="form-item">
                <n-input
                  v-model:value="newEmail"
                  placeholder="Введите новый email"
                  type="text"
                  @keyup.enter="submitEmailForm"
                />
              </n-form-item>
              <div class="form-actions">
                <n-button
                  type="primary"
                  size="small"
                  :loading="emailLoading"
                  @click="submitEmailForm"
                >
                  Сохранить
                </n-button>
                <n-button
                  ghost
                  size="small"
                  @click="showEmailForm = false"
                >
                  <template #icon>
                    <n-icon><CloseOutline /></n-icon>
                  </template>
                  Отмена
                </n-button>
              </div>
            </div>

            <!-- Change password -->
            <button type="button" class="action-row" @click="openPasswordForm">
              <div class="action-row-left">
                <n-icon :size="17" class="action-icon">
                  <KeyOutline />
                </n-icon>
                <span>Сменить пароль</span>
              </div>
              <n-icon :size="17" class="action-chevron">
                <ArrowForwardOutline />
              </n-icon>
            </button>

            <div v-if="showPasswordForm" class="inline-form">
              <n-form-item label="Текущий пароль" class="form-item">
                <n-input
                  v-model:value="currentPassword"
                  type="password"
                  show-password-on="click"
                  placeholder="Текущий пароль"
                />
              </n-form-item>
              <n-form-item label="Новый пароль" class="form-item">
                <n-input
                  v-model:value="newPassword"
                  type="password"
                  show-password-on="click"
                  placeholder="Новый пароль"
                  @keyup.enter="submitPasswordForm"
                />
              </n-form-item>
              <div class="form-actions">
                <n-button
                  type="primary"
                  size="small"
                  :loading="passwordLoading"
                  @click="submitPasswordForm"
                >
                  Сменить
                </n-button>
                <n-button
                  ghost
                  size="small"
                  @click="showPasswordForm = false"
                >
                  <template #icon>
                    <n-icon><CloseOutline /></n-icon>
                  </template>
                  Отмена
                </n-button>
              </div>
            </div>

            <!-- Delete account (stub) -->
            <button type="button" class="action-row action-row--danger">
              <div class="action-row-left">
                <n-icon :size="17" class="action-icon">
                  <TrashOutline />
                </n-icon>
                <span>Удалить аккаунт</span>
              </div>
              <n-icon :size="17" class="action-chevron">
                <ArrowForwardOutline />
              </n-icon>
            </button>
          </div>
        </section>

        <!-- Security section -->
        <section class="profile-card">
          <div class="card-heading">
            <n-icon :size="20" class="card-heading-icon">
              <ShieldOutline />
            </n-icon>
            <div>
              <h2 class="card-title">Безопасность</h2>
              <p class="card-subtitle">Двухфакторная аутентификация и активные сессии</p>
            </div>
          </div>

          <div class="divider" />

          <div class="tfa-row">
            <div class="tfa-info">
              <div class="tfa-title-row">
                <n-icon :size="17" class="info-icon">
                  <ShieldOutline />
                </n-icon>
                <span class="tfa-title">Двухфакторная аутентификация</span>
              </div>
              <p class="tfa-hint">Рекомендуем включить для безопасности</p>
            </div>
            <n-switch v-model:value="twoFactorEnabled" />
          </div>

          <div class="divider" />

          <div class="sessions-header">
            <span class="sessions-label">Активные сессии</span>
            <n-button ghost size="small" class="end-all-btn">
              <template #icon>
                <n-icon :size="15">
                  <LogOutOutline />
                </n-icon>
              </template>
              Завершить все
            </n-button>
          </div>

          <ul class="sessions-list">
            <li v-for="session in sessions" :key="session.id" class="session-row">
              <div class="session-left">
                <n-icon :size="17" class="info-icon session-device-icon">
                  <ShieldOutline />
                </n-icon>
                <div>
                  <div class="session-browser-row">
                    <span class="session-browser">{{ session.browser }}</span>
                    <span v-if="session.isCurrent" class="badge badge-current">текущая</span>
                  </div>
                  <p class="session-meta">{{ session.os }} · {{ session.ip }}</p>
                </div>
              </div>
              <div class="session-right">
                <span class="session-date">{{ session.date }}</span>
                <span class="session-time">{{ session.time }}</span>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </n-layout-content>
  </n-layout>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  color: var(--env-text);
  background:
    radial-gradient(circle at 20% 10%, rgba(137, 116, 180, 0.22), transparent 30%),
    radial-gradient(circle at 90% 80%, rgba(137, 116, 180, 0.12), transparent 35%),
    #080a0d;
}

.profile-container {
  width: min(760px, calc(100% - 2rem));
  margin: 0 auto;
}

.profile-content {
  padding: 2.4rem 0 3rem;
}

.page-header {
  margin-bottom: 1.8rem;
}

.page-title {
  margin: 0;
  font-size: 1.85rem;
  font-weight: 680;
  color: var(--env-accent-soft);
}

.page-subtitle {
  margin: 0.25rem 0 0;
  color: #8f93a3;
  font-size: 0.97rem;
}

.profile-card {
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
  padding: 1.6rem;
  margin-bottom: 1.2rem;
}

.card-heading {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
}

.card-heading-icon {
  color: #9d82d4;
  margin-top: 2px;
  flex-shrink: 0;
}

.card-title {
  margin: 0;
  font-size: 1.08rem;
  font-weight: 650;
  color: #dadce4;
}

.card-subtitle {
  margin: 0.2rem 0 0;
  font-size: 0.88rem;
  color: #7f8497;
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 1.25rem 0;
}

.info-list {
  display: grid;
  gap: 1rem;
  margin: 0;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.info-label-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.info-label {
  font-size: 0.83rem;
  color: #7f8497;
}

.info-icon {
  color: #7f8497;
}

.info-value {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #dadce4;
  font-size: 1.01rem;
  margin: 0;
  padding-left: 1.5rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  border-radius: 8px;
  padding: 0.15rem 0.6rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-active {
  color: #48bf84;
  background: rgba(67, 176, 129, 0.14);
  border: 1px solid rgba(67, 176, 129, 0.3);
}

.badge-current {
  color: #c0c7d1;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  font-size: 0.76rem;
}

.action-list {
  display: grid;
  gap: 0.5rem;
}

.action-row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  color: #dadce4;
  font-size: 0.97rem;
  cursor: pointer;
  text-align: left;
}

.action-row:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.14);
}

.action-row--danger {
  color: #e05c5c;
  border-color: rgba(224, 92, 92, 0.2);
}

.action-row--danger:hover {
  background: rgba(224, 92, 92, 0.06);
  border-color: rgba(224, 92, 92, 0.36);
}

.action-row-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.action-icon {
  flex-shrink: 0;
}

.action-chevron {
  color: #5a5e70;
}

.inline-form {
  padding: 1rem 1rem 0.5rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  display: grid;
  gap: 0.5rem;
}

.form-item {
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
}

.tfa-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.tfa-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.tfa-title-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: #dadce4;
}

.tfa-title {
  font-size: 0.97rem;
}

.tfa-hint {
  margin: 0;
  font-size: 0.85rem;
  color: #7f8497;
  padding-left: 1.5rem;
}

.sessions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.sessions-label {
  font-size: 0.95rem;
  color: #c0c7d1;
}

:deep(.end-all-btn.n-button) {
  border-color: rgba(137, 116, 180, 0.4);
  color: #c0c7d1;
}

:deep(.end-all-btn.n-button:hover) {
  border-color: rgba(157, 138, 202, 0.8);
  color: #eef1f5;
}

.sessions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.6rem;
}

.session-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.02);
}

.session-left {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.session-device-icon {
  color: #5a5e70;
  flex-shrink: 0;
}

.session-browser-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.session-browser {
  font-size: 0.95rem;
  color: #dadce4;
}

.session-meta {
  margin: 0.15rem 0 0;
  font-size: 0.83rem;
  color: #5a5e70;
}

.session-right {
  text-align: right;
  flex-shrink: 0;
}

.session-date {
  display: block;
  font-size: 0.88rem;
  color: #8f93a3;
}

.session-time {
  display: block;
  font-size: 0.88rem;
  color: #5a5e70;
}

@media (max-width: 600px) {
  .page-title {
    font-size: 1.5rem;
  }

  .session-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.6rem;
  }

  .session-right {
    text-align: left;
  }
}
</style>
