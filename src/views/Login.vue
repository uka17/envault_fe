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
  email: [
    { required: true, message: "Введите email", trigger: ["input", "blur"] },
    { type: "email", message: "Неверный формат email", trigger: ["input", "blur"] },
  ],
  password: [{ required: true, message: "Введите пароль", trigger: ["input", "blur"] }],
};

const submit = async () => {
  await formRef.value?.validate();
  isSubmitting.value = true;
  try {
    await auth.login(formValue.email, formValue.password);
    //router.push("/");
    alert(auth.user?.name);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <n-layout class="login-page envault-page-shell">
    <n-layout-content class="login-content">
      <div class="login-shell">
        <div class="top-link-row">
          <RouterLink to="/" class="text-link back-home-link">
            <n-icon :size="19" class="back-home-link__icon" aria-hidden="true">
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

        <n-card :bordered="false" class="auth-card">
          <n-space vertical :size="22">
            <header class="card-header">
              <h1>Вход в аккаунт</h1>
              <p>Войдите, чтобы управлять stash'ами и отправками</p>
            </header>

            <n-form ref="formRef" :model="formValue" :rules="rules" label-placement="top" class="auth-form">
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

<style scoped>
.login-content {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem 1rem;
  position: relative;
}

.login-shell {
  width: min(560px, 100%);
}

.top-link-row {
  position: absolute;
  top: 1rem;
  left: 2rem;
  z-index: 1;
}

.brand-block {
  margin-bottom: 2rem;
}

.brand-badge {
  width: 82px;
  height: 82px;
  border-radius: 24px;
  display: grid;
  place-items: center;
  color: #0f0d17;
  background: linear-gradient(135deg, var(--env-accent-soft) 0%, var(--env-accent) 100%);
  box-shadow: 0 12px 36px rgba(137, 116, 180, 0.38);
}

.brand-title {
  color: var(--env-text);
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1;
}

:deep(.auth-card.n-card) {
  border-radius: 16px;
  border: 1px solid var(--env-surface-border);
  background: linear-gradient(180deg, rgba(17, 19, 30, 0.96), rgba(13, 14, 25, 0.97));
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.38);
}

:deep(.auth-card .n-card__content) {
  padding: 1.5rem;
}

.card-header {
  text-align: center;
}

.card-header h1 {
  margin: 0;
  color: #e8e9ef;
  font-size: 2rem;
  font-weight: 700;
}

.card-header p {
  margin: 0.45rem 0 0;
  color: #9096a9;
  font-size: 1.05rem;
}

:deep(.auth-form .n-form-item-label__text) {
  color: #e1e3eb;
  font-weight: 500;
}

:deep(.auth-form .n-input) {
  --n-color: rgba(255, 255, 255, 0.03);
  --n-color-focus: rgba(255, 255, 255, 0.04);
  --n-border: 1px solid rgba(255, 255, 255, 0.12);
  --n-border-hover: 1px solid rgba(137, 116, 180, 0.65);
  --n-border-focus: 1px solid rgba(137, 116, 180, 0.85);
  --n-box-shadow-focus: 0 0 0 2px rgba(137, 116, 180, 0.16);
  --n-text-color: #e6e8ee;
  --n-placeholder-color: #757c91;
  --n-border-radius: 12px;
}

:deep(.submit-btn.n-button) {
  margin-top: 0.25rem;
  height: 50px;
  font-weight: 700;
  color: #16131f;
  background: linear-gradient(135deg, var(--env-accent-soft) 0%, var(--env-accent) 100%);
  border: none;
}

:deep(.submit-btn.n-button:hover) {
  filter: brightness(1.04);
  transform: translateY(-1px);
}

.password-visibility {
  color: #8188a0;
  cursor: pointer;
}

.password-visibility:hover {
  color: #c4c9d6;
}

.card-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.35rem;
}

.text-link {
  display: inline-block;
  font-weight: 600;
}

.back-home-link {
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
  color: rgba(209, 216, 229, 0.72);
  font-weight: 500;
  padding: 0.4rem 0.75rem 0.42rem 0.56rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(7, 9, 15, 0.72);
}

.back-home-link:hover {
  color: rgba(231, 236, 245, 0.9);
  background: rgba(10, 12, 19, 0.9);
}

.back-home-link__icon {
  display: grid;
  place-items: center;
}

@media (max-width: 640px) {
  .top-link-row {
    left: 1rem;
  }

  .brand-title {
    font-size: 1.9rem;
  }

  .card-header h1 {
    font-size: 1.65rem;
  }

  :deep(.auth-card .n-card__content) {
    padding: 1.15rem;
  }
}
</style>
