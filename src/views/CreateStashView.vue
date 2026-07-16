<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
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
} from "@vicons/ionicons5";
import { isAxiosError } from "axios";
import { useStashStore } from "@/stores/stash";

const router = useRouter();
const stashStore = useStashStore();
const { t } = useI18n();
const formRef = ref<FormInst | null>(null);
const isSubmitting = ref(false);
const submitError = ref<string | null>(null);

const formValue = reactive({
  to: "",
  subject: "",
  body: "",
  sendAt: null as number | null,
});

const rules = computed<FormRules>(() => ({
  to: [
    { required: true, message: t("validation.stash.recipientRequired"), trigger: ["input", "blur"] },
    { type: "email", message: t("validation.stash.emailInvalid"), trigger: ["input", "blur"] },
  ],
  body: [
    { required: true, message: t("validation.stash.bodyRequired"), trigger: ["input", "blur"] },
    { min: 1, message: t("validation.stash.bodyEmpty"), trigger: ["input", "blur"] },
  ],
  sendAt: [
    {
      required: true,
      type: "number",
      message: t("validation.stash.sendAtRequired"),
      trigger: ["change", "blur"],
    },
    {
      validator: (_rule, value: number | null) => {
        if (!value) return true;
        return value > Date.now() || new Error(t("validation.stash.sendAtFuture"));
      },
      trigger: ["change", "blur"],
    },
  ],
}));

/**
 * Validate the form and submit the stash to the API.
 * Redirects to the dashboard on success.
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
    await stashStore.createStash({
      to: formValue.to,
      subject: formValue.subject || null,
      body: formValue.body,
      sendAt: new Date(formValue.sendAt!).toISOString(),
    });
    router.push({ name: "dashboard" });
  } catch (e) {
    submitError.value =
      (isAxiosError(e) && e.response?.data?.message?.translation) || t("stash.create.error");
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
            <span>{{ t("stash.create.backToStashes") }}</span>
          </RouterLink>
        </div>

        <n-space vertical align="center" :size="14" class="brand-block">
          <div class="brand-badge">
            <n-icon :size="28">
              <LockClosedOutline />
            </n-icon>
          </div>
          <n-text class="brand-title">{{ t("stash.create.brandTitle") }}</n-text>
        </n-space>

        <n-card :bordered="false" class="env-auth-card">
          <n-space vertical :size="22">
            <header class="card-header">
              <h1>{{ t("stash.create.title") }}</h1>
              <p>{{ t("stash.create.subtitle") }}</p>
            </header>

            <n-form
              ref="formRef"
              :model="formValue"
              :rules="rules"
              label-placement="top"
              class="env-auth-form"
            >
              <n-form-item path="to" :label="t('stash.create.recipientLabel')">
                <n-input
                  v-model:value="formValue.to"
                  :placeholder="t('stash.create.recipientPlaceholder')"
                  size="large"
                >
                  <template #prefix>
                    <n-icon :size="18">
                      <MailOutline />
                    </n-icon>
                  </template>
                </n-input>
              </n-form-item>

              <n-form-item path="subject" :label="t('stash.create.subjectLabel')">
                <n-input
                  v-model:value="formValue.subject"
                  :placeholder="t('stash.create.subjectPlaceholder')"
                  size="large"
                />
              </n-form-item>

              <n-form-item path="body" :label="t('stash.create.messageLabel')">
                <n-input
                  v-model:value="formValue.body"
                  type="textarea"
                  :placeholder="t('stash.create.messagePlaceholder')"
                  :autosize="{ minRows: 5, maxRows: 14 }"
                  class="body-textarea"
                />
              </n-form-item>

              <n-form-item path="sendAt" :label="t('stash.create.sendAtLabel')">
                <n-date-picker
                  v-model:value="formValue.sendAt"
                  type="datetime"
                  :placeholder="t('stash.create.sendAtPlaceholder')"
                  :is-date-disabled="disablePastDate"
                  size="large"
                  class="date-picker"
                />
              </n-form-item>

              <div class="submit-row">
                <n-button
                  type="primary"
                  size="large"
                  class="submit-btn"
                  :loading="isSubmitting"
                  @click="submit"
                >
                  {{ t("stash.create.submit") }}
                </n-button>
              </div>

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

.submit-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.25rem;
}
</style>
