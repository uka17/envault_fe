<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
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
import { ArrowBackSharp, EyeOffOutline, EyeOutline, KeyOutline, LockClosedOutline, MailOutline } from "@vicons/ionicons5";
import { useAuthStore } from "@/stores/auth";
import { getApiErrorMessage } from "@/api/apiError";
import { emailRules, requiredPasswordRules } from "@/utils/formRules";

const router = useRouter();
const auth = useAuthStore();
const { t } = useI18n();
const formRef = ref<FormInst | null>(null);
const isSubmitting = ref(false);
const submitError = ref<string | null>(null);

const formValue = reactive({
  email: "",
  password: "",
});

const showPassword = ref(false);

const rules = computed<FormRules>(() => ({
  email: emailRules(),
  password: requiredPasswordRules(),
}));

/**
 * Validates the login form and authenticates the user.
 * On failure, displays the error message inside the form; on success, redirects to the dashboard.
 * @returns {Promise<void>} Promise that resolves once the login attempt completes.
 */
const submit = async () => {
  await formRef.value?.validate();
  isSubmitting.value = true;
  submitError.value = null;
  try {
    await auth.login(formValue.email, formValue.password);
    router.push({ name: "dashboard" });
  } catch (err) {
    submitError.value = getApiErrorMessage(err) ?? t("auth.login.error");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <n-layout class="login-page envault-page-shell">
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
              <h1>{{ t("auth.login.title") }}</h1>
              <p>{{ t("auth.login.subtitle") }}</p>
            </header>

            <n-form ref="formRef" :model="formValue" :rules="rules" label-placement="top" class="env-auth-form">
              <n-form-item path="email" :label="t('auth.login.emailLabel')">
                <n-input v-model:value="formValue.email" :placeholder="t('auth.login.emailPlaceholder')" size="large">
                  <template #prefix>
                    <n-icon :size="18">
                      <MailOutline />
                    </n-icon>
                  </template>
                </n-input>
              </n-form-item>

              <n-form-item path="password" :label="t('auth.login.passwordLabel')">
                <n-input
                  v-model:value="formValue.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  size="large"
                >
                  <template #prefix>
                    <n-icon :size="18">
                      <KeyOutline />
                    </n-icon>
                  </template>
                  <template #suffix>
                    <n-icon class="password-visibility" :size="18" @click="showPassword = !showPassword">
                      <component :is="showPassword ? EyeOffOutline : EyeOutline" />
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
                {{ t("auth.login.submit") }}
              </n-button>
            </n-form>

            <footer class="card-footer">
              <n-text depth="3">{{ t("auth.login.noAccount") }}</n-text>
              <RouterLink to="/register" class="text-link switch-link">{{ t("auth.login.createLink") }}</RouterLink>
            </footer>
          </n-space>
        </n-card>
      </div>
    </n-layout-content>
  </n-layout>
</template>
