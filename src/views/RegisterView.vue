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
  type FormInst,
  type FormRules,
} from "naive-ui";
import { ArrowBackSharp, EyeOffOutline, EyeOutline, KeyOutline, LockClosedOutline, MailOutline } from "@vicons/ionicons5";

const router = useRouter();
const formRef = ref<FormInst | null>(null);

const formValue = reactive({
  email: "",
  password: "",
  confirmPassword: "",
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const rules: FormRules = {
  email: [
    { required: true, message: "Введите email", trigger: ["input", "blur"] },
    { type: "email", message: "Неверный формат email", trigger: ["input", "blur"] },
  ],
  password: [{ required: true, message: "Введите пароль", trigger: ["input", "blur"] }],
  confirmPassword: [
    { required: true, message: "Подтвердите пароль", trigger: ["input", "blur"] },
    {
      validator: () =>
        formValue.confirmPassword === formValue.password ? true : new Error("Пароли не совпадают"),
      trigger: ["input", "blur"],
    },
  ],
};

const submit = async () => {
  await formRef.value?.validate();
  router.push("/login");
};
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
              <n-form-item path="email" label="Email">
                <n-input v-model:value="formValue.email" placeholder="your@email.com" size="large">
                  <template #prefix>
                    <n-icon :size="18">
                      <MailOutline />
                    </n-icon>
                  </template>
                </n-input>
              </n-form-item>

              <n-form-item path="password" label="Пароль">
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

              <n-button type="primary" size="large" class="submit-btn" block @click="submit">
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
