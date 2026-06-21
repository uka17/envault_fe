<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import {
  NAlert,
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
import { isAxiosError } from "axios";
import { useStashStore } from "@/stores/stash";

const router = useRouter();
const stashStore = useStashStore();
const formRef = ref<FormInst | null>(null);
const isSubmitting = ref(false);
const submitError = ref<string | null>(null);

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
  submitError.value = null;
  try {
    await stashStore.createStash({
      to: formValue.to,
      body: formValue.body,
      sendAt: new Date(formValue.sendAt!).toISOString(),
    });
    router.push({ name: "dashboard" });
  } catch (e) {
    submitError.value =
      (isAxiosError(e) && e.response?.data?.message?.translation) ||
      "Не удалось создать stash. Попробуйте ещё раз.";
  } finally {
    isSubmitting.value = false;
  }
};

/** Disallow selecting dates in the past in the date picker. */
const disablePastDate = (ts: number): boolean => ts < Date.now() - 86_400_000;
</script>

<template>
  <n-layout class="create-stash-page envault-page-shell">
    <n-layout-content class="auth-page-content">
      <div class="create-stash-shell">
        <div class="top-link-row">
          <RouterLink to="/dashboard" class="text-link env-back-link">
            <n-icon :size="19" class="env-back-link__icon" aria-hidden="true">
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

        <n-card :bordered="false" class="env-auth-card">
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
              class="env-auth-form"
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

              <n-alert v-if="submitError" type="error" :bordered="false" class="submit-error" style="margin-top: 12px;">
                {{ submitError }}
              </n-alert>
            </n-form>
          </n-space>
        </n-card>
      </div>
    </n-layout-content>
  </n-layout>
</template>

<style scoped>
.create-stash-shell {
  width: min(600px, 100%);
}

:deep(.body-textarea .n-input__textarea) {
  resize: vertical;
}

.date-picker {
  width: 100%;
}
</style>
