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
import { useAuthStore } from "@/stores/auth";
import { emailRules, requiredPasswordRules } from "@/utils/formRules";

const router = useRouter();
const auth = useAuthStore();
const formRef = ref<FormInst | null>(null);
const isSubmitting = ref(false);

const formValue = reactive({
  email: "",
  password: "",
});

const showPassword = ref(false);

const rules: FormRules = {
  email: emailRules,
  password: requiredPasswordRules,
};

const submit = async () => {
  await formRef.value?.validate();
  isSubmitting.value = true;
  try {
    await auth.login(formValue.email, formValue.password);
    router.push({ name: "dashboard" });
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
              <h1>Вход в аккаунт</h1>
              <p>Войдите, чтобы управлять stash'ами и отправками</p>
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

              <n-button type="primary" size="large" class="submit-btn" block :loading="isSubmitting" @click="submit">
                Войти
              </n-button>
            </n-form>

            <footer class="card-footer">
              <n-text depth="3">Нет аккаунта?</n-text>
              <RouterLink to="/register" class="text-link switch-link">Создать</RouterLink>
            </footer>
          </n-space>
        </n-card>
      </div>
    </n-layout-content>
  </n-layout>
</template>
