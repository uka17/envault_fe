<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
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

const rules: FormRules = {
  name: nameRules,
  email: emailRules,
  password: newPasswordRules,
  confirmPassword: confirmPasswordRules(() => formValue.password),
};

const submit = async () => {
  await formRef.value?.validate();
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
    message.error("Не удалось зарегистрироваться. Проверьте данные и попробуйте снова.");
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
            <span>На главную</span>
          </RouterLink>
        </div>

        <n-space vertical align="center" :size="14" class="brand-block">
          <div class="brand-badge">
            <n-icon :size="28">
              <LockClosedOutline />
            </n-icon>
          </div>
          <n-text class="brand-title">Envault</n-text>
        </n-space>

        <n-card :bordered="false" class="env-auth-card">
          <n-space vertical :size="22">
            <header class="card-header">
              <h1>Создание аккаунта</h1>
              <p>Зарегистрируйтесь, чтобы начать отправлять stash'и</p>
            </header>

            <n-form ref="formRef" :model="formValue" :rules="rules" label-placement="top" class="env-auth-form">
              <n-form-item
                path="name"
                label="Имя"
                :feedback="serverErrors.name"
                :validation-status="serverErrors.name ? 'error' : undefined"
              >
                <n-input
                  v-model:value="formValue.name"
                  placeholder="Иван Иванов"
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
                label="Email"
                :feedback="serverErrors.email"
                :validation-status="serverErrors.email ? 'error' : undefined"
              >
                <n-input
                  v-model:value="formValue.email"
                  placeholder="your@email.com"
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
                label="Пароль"
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

              <n-form-item path="confirmPassword" label="Подтвердите пароль">
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
                Создать аккаунт
              </n-button>
            </n-form>

            <footer class="card-footer">
              <n-text depth="3">Уже есть аккаунт?</n-text>
              <RouterLink to="/login" class="text-link login-link">Войти</RouterLink>
            </footer>
          </n-space>
        </n-card>
      </div>
    </n-layout-content>
  </n-layout>
</template>
