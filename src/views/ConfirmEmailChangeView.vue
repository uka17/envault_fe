<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  NAlert,
  NCard,
  NIcon,
  NLayout,
  NLayoutContent,
  NSpace,
  NSpin,
  NText,
} from "naive-ui";
import { ArrowBackSharp, LockClosedOutline } from "@vicons/ionicons5";
import { useAuthStore } from "@/stores/auth";
import { getApiErrorMessage } from "@/api/apiError";

const route = useRoute();
const auth = useAuthStore();
const { t } = useI18n();

const isConfirming = ref(true);
const errorMessage = ref<string | null>(null);

/**
 * Confirms the pending email change using the token from the URL, if present.
 * @returns Nothing; updates local state.
 */
async function confirm(): Promise<void> {
  const token = route.query.token;
  isConfirming.value = true;
  errorMessage.value = null;
  if (typeof token !== "string" || !token) {
    errorMessage.value = t("auth.confirmEmailChange.invalidLink");
    isConfirming.value = false;
    return;
  }
  try {
    await auth.confirmEmailChange(token);
  } catch (err) {
    errorMessage.value = getApiErrorMessage(err) ?? t("auth.confirmEmailChange.error");
  } finally {
    isConfirming.value = false;
  }
}

watch(
  () => route.query.token,
  () => {
    void confirm();
  },
  { immediate: true },
);
</script>

<template>
  <n-layout class="confirm-email-change-page envault-page-shell">
    <n-layout-content class="auth-page-content">
      <div class="auth-shell">
        <div class="top-link-row">
          <RouterLink to="/" class="text-link env-back-link">
            <n-icon :size="19" class="env-back-link__icon" aria-hidden="true">
              <ArrowBackSharp />
            </n-icon>
            <span>{{ t("common.backHome") }}</span>
          </RouterLink>
        </div>

        <n-space vertical align="center" :size="14" class="brand-block">
          <div class="brand-badge">
            <n-icon :size="28">
              <LockClosedOutline />
            </n-icon>
          </div>
          <n-text class="brand-title">{{ t("common.appName") }}</n-text>
        </n-space>

        <n-card :bordered="false" class="env-auth-card">
          <n-space vertical align="center" :size="22">
            <header class="card-header">
              <h1>{{ t("auth.confirmEmailChange.title") }}</h1>
            </header>

            <n-spin v-if="isConfirming" :size="32" />

            <n-alert v-else-if="errorMessage" type="error" :bordered="false" style="width: 100%;">
              {{ errorMessage }}
            </n-alert>

            <n-alert v-else type="success" :bordered="false" style="width: 100%;">
              {{ t("auth.confirmEmailChange.successMessage") }}
            </n-alert>

            <footer v-if="!isConfirming" class="card-footer">
              <RouterLink to="/login" class="text-link login-link">
                {{ t("auth.confirmEmailChange.backToLogin") }}
              </RouterLink>
            </footer>
          </n-space>
        </n-card>
      </div>
    </n-layout-content>
  </n-layout>
</template>
