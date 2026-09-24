<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  NAlert,
  NButton,
  NCard,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NLayout,
  NLayoutContent,
  NSpace,
  NText,
  type FormInst,
  type FormRules,
} from "naive-ui";
import { ArrowBackSharp, LockClosedOutline, MailOutline } from "@vicons/ionicons5";
import { useAuthStore } from "@/stores/auth";
import { getApiErrorCode, getApiErrorMessage, getApiErrorRetryAfter } from "@/api/apiError";
import { emailRules } from "@/utils/formRules";

const auth = useAuthStore();
const { t } = useI18n();

const formRef = ref<FormInst | null>(null);
const isSubmitting = ref(false);
const isSent = ref(false);
const submitError = ref<string | null>(null);

const formValue = reactive({
  email: "",
});

const rules = computed<FormRules>(() => ({
  email: emailRules(),
}));

/**
 * Build the message for a failed reset request, turning a rate limit into a retry time.
 * @param err Error thrown by the reset request.
 * @returns Localized error message to show the user.
 */
function requestErrorMessage(err: unknown): string {
  const retryAfter = getApiErrorRetryAfter(err);
  if (getApiErrorCode(err) === "password_reset_rate_limited" && retryAfter !== undefined) {
    const minutes = Math.ceil(retryAfter / 60);
    return t("auth.forgotPassword.rateLimited", { n: minutes }, minutes);
  }
  return getApiErrorMessage(err) ?? t("auth.forgotPassword.error");
}

/**
 * Validates the email and requests a reset link. The same neutral confirmation is shown
 * whether or not the address belongs to an account.
 * @returns Nothing; updates local state.
 */
const submit = async (): Promise<void> => {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }
  isSubmitting.value = true;
  submitError.value = null;
  try {
    await auth.requestPasswordReset(formValue.email.trim());
    isSent.value = true;
  } catch (err) {
    submitError.value = requestErrorMessage(err);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <n-layout class="forgot-password-page envault-page-shell">
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
          <n-space vertical :size="22">
            <header class="card-header">
              <h1>{{ t("auth.forgotPassword.title") }}</h1>
              <p>{{ t("auth.forgotPassword.subtitle") }}</p>
            </header>

            <n-alert v-if="isSent" type="success" :bordered="false" class="sent-message">
              {{ t("auth.forgotPassword.sentMessage") }}
            </n-alert>

            <n-form
              v-else
              ref="formRef"
              :model="formValue"
              :rules="rules"
              label-placement="top"
              class="env-auth-form"
            >
              <n-form-item path="email" :label="t('auth.forgotPassword.emailLabel')">
                <n-input
                  v-model:value="formValue.email"
                  :placeholder="t('auth.forgotPassword.emailPlaceholder')"
                  size="large"
                >
                  <template #prefix>
                    <n-icon :size="18">
                      <MailOutline />
                    </n-icon>
                  </template>
                </n-input>
              </n-form-item>

              <n-alert
                v-if="submitError"
                type="error"
                :bordered="false"
                class="submit-error"
                style="margin-bottom: 12px"
              >
                {{ submitError }}
              </n-alert>

              <n-button
                type="primary"
                size="large"
                class="submit-btn"
                block
                :loading="isSubmitting"
                @click="submit"
              >
                {{ t("auth.forgotPassword.submit") }}
              </n-button>
            </n-form>

            <footer class="card-footer">
              <RouterLink to="/login" class="text-link login-link">{{
                t("auth.forgotPassword.backToLogin")
              }}</RouterLink>
            </footer>
          </n-space>
        </n-card>
      </div>
    </n-layout-content>
  </n-layout>
</template>
