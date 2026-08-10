<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
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
  useMessage,
  type FormInst,
  type FormRules,
} from "naive-ui";
import { ArrowBackSharp, LockClosedOutline, MailOutline } from "@vicons/ionicons5";
import { useAuthStore } from "@/stores/auth";
import { getApiErrorMessage } from "@/api/apiError";
import { verificationCodeRules } from "@/utils/formRules";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const message = useMessage();
const { t } = useI18n();

const formRef = ref<FormInst | null>(null);
const isSubmitting = ref(false);
const isResending = ref(false);
const resendCooldown = ref(0);
const submitError = ref<string | null>(null);

const email = computed(() => (route.query.email as string) ?? "");

const formValue = reactive({
  code: "",
});

const rules = computed<FormRules>(() => ({
  code: verificationCodeRules(),
}));

/**
 * Validates the code input and submits it for verification. On success,
 * redirects to the login page with the email pre-filled.
 * @returns Nothing; updates local state or navigates on success.
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
    await auth.verifyEmail(formValue.code);
    message.success(t("auth.verifyEmail.successMessage"));
    router.push({ name: "login", query: { email: email.value } });
  } catch (err) {
    submitError.value = getApiErrorMessage(err) ?? t("auth.verifyEmail.error");
  } finally {
    isSubmitting.value = false;
  }
};

/**
 * Requests a new verification code for the current email address and starts
 * a short client-side cooldown before the resend button can be used again.
 * @returns Nothing; updates local state.
 */
const resend = async (): Promise<void> => {
  if (!email.value || resendCooldown.value > 0) return;
  isResending.value = true;
  try {
    await auth.resendVerification(email.value);
    message.success(t("auth.verifyEmail.resendSuccess"));
    resendCooldown.value = 60;
    const interval = setInterval(() => {
      resendCooldown.value -= 1;
      if (resendCooldown.value <= 0) clearInterval(interval);
    }, 1000);
  } catch (err) {
    submitError.value = getApiErrorMessage(err) ?? t("auth.verifyEmail.error");
  } finally {
    isResending.value = false;
  }
};

watch(
  () => route.query.code,
  (code) => {
    if (typeof code !== "string" || !code) return;
    formValue.code = code;
    void submit();
  },
  { immediate: true },
);
</script>

<template>
  <n-layout class="verify-email-page envault-page-shell">
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
              <h1>{{ t("auth.verifyEmail.title") }}</h1>
              <p>{{ t("auth.verifyEmail.subtitle", { email }) }}</p>
            </header>

            <n-form ref="formRef" :model="formValue" :rules="rules" label-placement="top" class="env-auth-form">
              <n-form-item path="code" :label="t('auth.verifyEmail.codeLabel')">
                <n-input
                  v-model:value="formValue.code"
                  :placeholder="t('auth.verifyEmail.codePlaceholder')"
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
                style="margin-bottom: 12px;"
              >
                {{ submitError }}
              </n-alert>

              <n-button type="primary" size="large" class="submit-btn" block :loading="isSubmitting" @click="submit">
                {{ t("auth.verifyEmail.submit") }}
              </n-button>
            </n-form>

            <footer class="card-footer">
              <n-text depth="3">{{ t("auth.verifyEmail.resendLabel") }}</n-text>
              <n-button
                text
                type="primary"
                class="text-link"
                :disabled="isResending || resendCooldown > 0"
                @click="resend"
              >
                {{ resendCooldown > 0 ? `${t("auth.verifyEmail.resendButton")} (${resendCooldown}s)` : t("auth.verifyEmail.resendButton") }}
              </n-button>
            </footer>

            <footer class="card-footer">
              <RouterLink to="/login" class="text-link login-link">{{ t("auth.verifyEmail.backToLogin") }}</RouterLink>
            </footer>
          </n-space>
        </n-card>
      </div>
    </n-layout-content>
  </n-layout>
</template>
