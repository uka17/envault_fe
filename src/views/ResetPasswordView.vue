<script setup lang="ts">
import { computed, reactive, ref } from "vue";
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
import {
  ArrowBackSharp,
  EyeOffOutline,
  EyeOutline,
  KeyOutline,
  LockClosedOutline,
} from "@vicons/ionicons5";
import { useAuthStore } from "@/stores/auth";
import {
  extractApiFieldErrors,
  getApiErrorCode,
  getApiErrorMessage,
  getApiErrorRetryAfter,
} from "@/api/apiError";
import { confirmPasswordRules, newPasswordRules } from "@/utils/formRules";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const message = useMessage();
const { t } = useI18n();

const formRef = ref<FormInst | null>(null);
const isSubmitting = ref(false);
const submitError = ref<string | null>(null);
const passwordServerError = ref("");
const tokenRejected = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const token = computed(() => (typeof route.query.token === "string" ? route.query.token : ""));
const isLinkInvalid = computed(() => !token.value || tokenRejected.value);

const formValue = reactive({
  password: "",
  confirmPassword: "",
});

const rules = computed<FormRules>(() => ({
  password: newPasswordRules(),
  confirmPassword: confirmPasswordRules(() => formValue.password),
}));

/**
 * Map a failed reset confirmation onto the page: an unusable token hides the form,
 * password validation errors go to the field, anything else becomes a form-level error.
 * @param err Error thrown by the reset confirmation.
 * @returns Nothing; updates local state.
 */
function handleConfirmError(err: unknown): void {
  const code = getApiErrorCode(err);
  if (code === "password_reset_invalid") {
    tokenRejected.value = true;
    return;
  }
  const retryAfter = getApiErrorRetryAfter(err);
  if (code === "password_reset_rate_limited" && retryAfter !== undefined) {
    const minutes = Math.ceil(retryAfter / 60);
    submitError.value = t("auth.resetPassword.rateLimited", { n: minutes }, minutes);
    return;
  }
  const { fieldErrors, genericErrors } = extractApiFieldErrors(err, ["newPassword"] as const);
  if (fieldErrors.newPassword) {
    passwordServerError.value = fieldErrors.newPassword;
    return;
  }
  submitError.value = genericErrors[0] ?? getApiErrorMessage(err) ?? t("auth.resetPassword.error");
}

/**
 * Validates the new password and submits it with the token from the link.
 * On success, redirects to the login page; the user signs in manually.
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
  passwordServerError.value = "";
  try {
    await auth.confirmPasswordReset(token.value, formValue.password);
    message.success(t("auth.resetPassword.successMessage"));
    router.push({ name: "login" });
  } catch (err) {
    handleConfirmError(err);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <n-layout class="reset-password-page envault-page-shell">
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
              <h1>{{ t("auth.resetPassword.title") }}</h1>
              <p>{{ t("auth.resetPassword.subtitle") }}</p>
            </header>

            <template v-if="isLinkInvalid">
              <n-alert type="error" :bordered="false" class="invalid-link">
                {{ t("auth.resetPassword.invalidLink") }}
              </n-alert>
              <footer class="card-footer">
                <RouterLink to="/forgot-password" class="text-link request-link">
                  {{ t("auth.resetPassword.requestNewLink") }}
                </RouterLink>
              </footer>
            </template>

            <template v-else>
              <n-alert type="info" :bordered="false" class="keys-notice">
                {{ t("auth.resetPassword.keysNotice") }}
              </n-alert>

              <n-form
                ref="formRef"
                :model="formValue"
                :rules="rules"
                label-placement="top"
                class="env-auth-form"
              >
                <n-form-item
                  path="password"
                  :label="t('auth.resetPassword.passwordLabel')"
                  :feedback="passwordServerError"
                  :validation-status="passwordServerError ? 'error' : undefined"
                >
                  <n-input
                    v-model:value="formValue.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="••••••••"
                    size="large"
                    @update:value="passwordServerError = ''"
                  >
                    <template #prefix>
                      <n-icon :size="18">
                        <KeyOutline />
                      </n-icon>
                    </template>
                    <template #suffix>
                      <n-icon
                        class="password-visibility"
                        :size="18"
                        @click="showPassword = !showPassword"
                      >
                        <component :is="showPassword ? EyeOffOutline : EyeOutline" />
                      </n-icon>
                    </template>
                  </n-input>
                </n-form-item>

                <n-form-item
                  path="confirmPassword"
                  :label="t('auth.resetPassword.confirmPasswordLabel')"
                >
                  <n-input
                    v-model:value="formValue.confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    placeholder="••••••••"
                    size="large"
                  >
                    <template #prefix>
                      <n-icon :size="18">
                        <KeyOutline />
                      </n-icon>
                    </template>
                    <template #suffix>
                      <n-icon
                        class="password-visibility"
                        :size="18"
                        @click="showConfirmPassword = !showConfirmPassword"
                      >
                        <component :is="showConfirmPassword ? EyeOffOutline : EyeOutline" />
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
                  {{ t("auth.resetPassword.submit") }}
                </n-button>
              </n-form>
            </template>

            <footer class="card-footer">
              <RouterLink to="/login" class="text-link login-link">{{
                t("auth.resetPassword.backToLogin")
              }}</RouterLink>
            </footer>
          </n-space>
        </n-card>
      </div>
    </n-layout-content>
  </n-layout>
</template>
