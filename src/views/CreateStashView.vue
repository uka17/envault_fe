<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import {
  NButton,
  NCard,
  NDatePicker,
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
import {
  ArrowBackSharp,
  LockClosedOutline,
  MailOutline,
  DocumentTextOutline,
  TimeOutline,
} from "@vicons/ionicons5";
import { useStashStore } from "@/stores/stash";

const router = useRouter();
const stashStore = useStashStore();
const formRef = ref<FormInst | null>(null);
const isSubmitting = ref(false);

const formValue = reactive({
  to: "",
  body: "",
  sendAt: null as number | null,
});

const rules: FormRules = {
  to: [
    { required: true, message: "Введите email получателя", trigger: ["input", "blur"] },
    { type: "email", message: "Неверный формат email", trigger: ["input", "blur"] },
  ],
  body: [
    { required: true, message: "Введите текст сообщения", trigger: ["input", "blur"] },
    { min: 1, message: "Сообщение не может быть пустым", trigger: ["input", "blur"] },
  ],
  sendAt: [
    {
      required: true,
      type: "number",
      message: "Укажите дату и время отправки",
      trigger: ["change", "blur"],
    },
    {
      validator: (_rule, value: number | null) => {
        if (!value) return true;
        return value > Date.now() || new Error("Дата должна быть в будущем");
      },
      trigger: ["change", "blur"],
    },
  ],
};

/**
 * Validate the form and submit the stash to the API.
 * Redirects to the dashboard on success.
 */
const submit = async (): Promise<void> => {
  await formRef.value?.validate();
  isSubmitting.value = true;
  try {
    await stashStore.createStash({
      to: formValue.to,
      body: formValue.body,
      sendAt: new Date(formValue.sendAt!).toISOString(),
    });
    router.push({ name: "dashboard" });
  } finally {
    isSubmitting.value = false;
  }
};

/** Disallow selecting dates in the past in the date picker. */
const disablePastDate = (ts: number): boolean => ts < Date.now() - 86_400_000;
</script>

<template>
  <n-layout class="create-stash-page envault-page-shell">
    <n-layout-content class="create-stash-content">
      <div class="create-stash-shell">
        <div class="top-link-row">
          <RouterLink to="/dashboard" class="text-link back-link">
            <n-icon :size="19" class="back-link__icon" aria-hidden="true">
              <ArrowBackSharp />
            </n-icon>
            <span>К моим stash'ам</span>
          </RouterLink>
        </div>

        <n-space vertical align="center" :size="14" class="brand-block">
          <div class="brand-badge">
            <n-icon :size="28">
              <LockClosedOutline />
            </n-icon>
          </div>
          <n-text class="brand-title">Новый stash</n-text>
        </n-space>

        <n-card :bordered="false" class="stash-card">
          <n-space vertical :size="22">
            <header class="card-header">
              <h1>Создать stash</h1>
              <p>Зашифрованное сообщение, которое будет отправлено получателю в нужный момент</p>
            </header>

            <n-form
              ref="formRef"
              :model="formValue"
              :rules="rules"
              label-placement="top"
              class="stash-form"
            >
              <n-form-item path="to" label="Email получателя">
                <n-input
                  v-model:value="formValue.to"
                  placeholder="recipient@example.com"
                  size="large"
                >
                  <template #prefix>
                    <n-icon :size="18">
                      <MailOutline />
                    </n-icon>
                  </template>
                </n-input>
              </n-form-item>

              <n-form-item path="body" label="Сообщение">
                <n-input
                  v-model:value="formValue.body"
                  type="textarea"
                  placeholder="Введите текст сообщения, которое будет зашифровано и отправлено..."
                  :autosize="{ minRows: 5, maxRows: 14 }"
                  class="body-textarea"
                >
                  <template #prefix>
                    <n-icon :size="18">
                      <DocumentTextOutline />
                    </n-icon>
                  </template>
                </n-input>
              </n-form-item>

              <n-form-item path="sendAt" label="Дата и время отправки">
                <n-date-picker
                  v-model:value="formValue.sendAt"
                  type="datetime"
                  placeholder="Выберите дату и время"
                  :is-date-disabled="disablePastDate"
                  size="large"
                  class="date-picker"
                />
              </n-form-item>

              <n-button
                type="primary"
                size="large"
                class="submit-btn"
                block
                :loading="isSubmitting"
                @click="submit"
              >
                Создать stash
              </n-button>
            </n-form>
          </n-space>
        </n-card>
      </div>
    </n-layout-content>
  </n-layout>
</template>

<style scoped>
.create-stash-content {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem 1rem;
  position: relative;
}

.create-stash-shell {
  width: min(600px, 100%);
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

:deep(.stash-card.n-card) {
  border-radius: 16px;
  border: 1px solid var(--env-surface-border);
  background: linear-gradient(180deg, rgba(17, 19, 30, 0.96), rgba(13, 14, 25, 0.97));
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.38);
}

:deep(.stash-card .n-card__content) {
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

:deep(.stash-form .n-form-item-label__text) {
  color: #e1e3eb;
  font-weight: 500;
}

:deep(.stash-form .n-input) {
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

:deep(.stash-form .body-textarea .n-input__textarea) {
  resize: vertical;
}

:deep(.stash-form .date-picker) {
  width: 100%;
  --n-color: rgba(255, 255, 255, 0.03);
  --n-border: 1px solid rgba(255, 255, 255, 0.12);
  --n-border-hover: 1px solid rgba(137, 116, 180, 0.65);
  --n-border-focus: 1px solid rgba(137, 116, 180, 0.85);
  --n-box-shadow-active: 0 0 0 2px rgba(137, 116, 180, 0.16);
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

.text-link {
  display: inline-block;
  font-weight: 600;
}

.back-link {
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

.back-link:hover {
  color: rgba(231, 236, 245, 0.9);
  background: rgba(10, 12, 19, 0.9);
}

.back-link__icon {
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

  :deep(.stash-card .n-card__content) {
    padding: 1.15rem;
  }
}
</style>
