<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
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
  MailOutline,
  PersonOutline,
} from "@vicons/ionicons5";
import { useAuthStore } from "@/stores/auth";
import { extractApiFieldErrors } from "@/api/apiError";
import { emailRules, nameRules, newPasswordRules, confirmPasswordRules } from "@/utils/formRules";

const router = useRouter();
const auth = useAuthStore();
const message = useMessage();
const { t } = useI18n();
const formRef = ref<FormInst | null>(null);
const isSubmitting = ref(false);

const formValue = reactive({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const REGISTER_FIELDS = ["name", "email", "password"] as const;
type RegisterField = (typeof REGISTER_FIELDS)[number];

const serverErrors = reactive<Record<RegisterField, string>>({
  name: "",
  email: "",
  password: "",
});

const rules = computed<FormRules>(() => ({
  name: nameRules(),
  email: emailRules(),
  password: newPasswordRules(),
  confirmPassword: confirmPasswordRules(() => formValue.password),
}));

const submit = async () => {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }
  serverErrors.name = "";
  serverErrors.email = "";
  serverErrors.password = "";
  isSubmitting.value = true;
  try {
    await auth.register({
      name: formValue.name,
      email: formValue.email,
      password: formValue.password,
    });
    router.push("/login");
  } catch (err) {
    handleRegisterError(err);
  } finally {
    isSubmitting.value = false;
  }
};

/**
 * Map a registration API error onto the form, showing field-specific messages
 * for known fields (name, email, password) and a toast for anything else.
 * @param err Error thrown by the register API call.
 */
function handleRegisterError(err: unknown) {
  const { fieldErrors, genericErrors } = extractApiFieldErrors(err, REGISTER_FIELDS);

  if (!Object.keys(fieldErrors).length && !genericErrors.length) {
    message.error(t("auth.register.error"));
    return;
  }

  Object.assign(serverErrors, fieldErrors);
  genericErrors.forEach((text) => message.error(text));
}
</script>

<template>
  <n-layout class="register-page envault-page-shell">
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
              <h1>{{ t("auth.register.title") }}</h1>
              <p>{{ t("auth.register.subtitle") }}</p>
            </header>

            <n-form ref="formRef" :model="formValue" :rules="rules" label-placement="top" class="env-auth-form">
              <n-form-item
                path="name"
                :label="t('auth.register.nameLabel')"
                :feedback="serverErrors.name"
                :validation-status="serverErrors.name ? 'error' : undefined"
              >
                <n-input
                  v-model:value="formValue.name"
                  :placeholder="t('auth.register.namePlaceholder')"
                  size="large"
                  @update:value="serverErrors.name = ''"
                >
                  <template #prefix>
                    <n-icon :size="18">
                      <PersonOutline />
                    </n-icon>
                  </template>
                </n-input>
              </n-form-item>

              <n-form-item
                path="email"
                :label="t('auth.register.emailLabel')"
                :feedback="serverErrors.email"
                :validation-status="serverErrors.email ? 'error' : undefined"
              >
                <n-input
                  v-model:value="formValue.email"
                  :placeholder="t('auth.register.emailPlaceholder')"
                  size="large"
                  @update:value="serverErrors.email = ''"
                >
                  <template #prefix>
                    <n-icon :size="18">
                      <MailOutline />
                    </n-icon>
                  </template>
                </n-input>
              </n-form-item>

              <n-form-item
                path="password"
                :label="t('auth.register.passwordLabel')"
                :feedback="serverErrors.password"
                :validation-status="serverErrors.password ? 'error' : undefined"
              >
                <n-input
                  v-model:value="formValue.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  size="large"
                  @update:value="serverErrors.password = ''"
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

              <n-form-item path="confirmPassword" :label="t('auth.register.confirmPasswordLabel')">
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

              <n-button
                type="primary"
                size="large"
                class="submit-btn"
                block
                :loading="isSubmitting"
                @click="submit"
              >
                {{ t("auth.register.submit") }}
              </n-button>
            </n-form>

            <footer class="card-footer">
              <n-text depth="3">{{ t("auth.register.haveAccount") }}</n-text>
              <RouterLink to="/login" class="text-link login-link">{{ t("auth.register.loginLink") }}</RouterLink>
            </footer>
          </n-space>
        </n-card>
      </div>
    </n-layout-content>
  </n-layout>
</template>
