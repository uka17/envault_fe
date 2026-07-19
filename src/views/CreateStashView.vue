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
  NInputGroup,
  NLayout,
  NLayoutContent,
  NModal,
  NSpace,
  NText,
  type FormInst,
  type FormRules,
} from "naive-ui";
import {
  ArrowBackSharp,
  KeyOutline,
  LockClosedOutline,
  MailOutline,
  RefreshOutline,
} from "@vicons/ionicons5";
import { isAxiosError } from "axios";
import { useStashStore } from "@/stores/stash";
import { encryptStashBody, generateStashKey } from "@/utils/stashCrypto";

const MIN_KEY_LENGTH = 12;

const router = useRouter();
const stashStore = useStashStore();
const { t } = useI18n();
const formRef = ref<FormInst | null>(null);
const isSubmitting = ref(false);
const submitError = ref<string | null>(null);
const createdKey = ref<string | null>(null);
const keyCopied = ref(false);

const formValue = reactive({
  to: "",
  subject: "",
  body: "",
  key: "",
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
  key: [
    { required: true, message: t("validation.stash.keyRequired"), trigger: ["input", "blur"] },
    {
      min: MIN_KEY_LENGTH,
      message: t("validation.stash.keyTooShort", { n: MIN_KEY_LENGTH }),
      trigger: ["input", "blur"],
    },
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

/** Fills the key field with a freshly generated random passphrase. */
const generateKey = (): void => {
  formValue.key = generateStashKey();
};

/**
 * Validates the form, encrypts the message body client-side with the
 * user-supplied key, and submits the already-encrypted stash to the API.
 * Shows the key one last time on success, since it is never stored anywhere.
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
    const encryptedBody = await encryptStashBody(formValue.body, formValue.key);
    await stashStore.createStash({
      to: formValue.to,
      subject: formValue.subject || null,
      body: encryptedBody,
      sendAt: new Date(formValue.sendAt!).toISOString(),
    });
    createdKey.value = formValue.key;
  } catch (e) {
    submitError.value =
      (isAxiosError(e) && e.response?.data?.message?.translation) || t("stash.create.error");
  } finally {
    isSubmitting.value = false;
  }
};

/** Copies the encryption key to the clipboard and shows a brief confirmation. */
const copyKey = async (): Promise<void> => {
  if (!createdKey.value) return;
  await navigator.clipboard.writeText(createdKey.value);
  keyCopied.value = true;
  setTimeout(() => (keyCopied.value = false), 2000);
};

/** Leaves the "key saved" confirmation and returns to the dashboard. */
const continueToDashboard = (): void => {
  router.push({ name: "dashboard" });
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

              <n-form-item path="key" :label="t('stash.create.keyLabel')">
                <n-input-group>
                  <n-input
                    v-model:value="formValue.key"
                    :input-props="{ autocomplete: 'new-password' }"
                    :placeholder="t('stash.create.keyPlaceholder')"
                    size="large"
                  >
                    <template #prefix>
                      <n-icon :size="18">
                        <KeyOutline />
                      </n-icon>
                    </template>
                  </n-input>
                  <n-button size="large" @click="generateKey">
                    <template #icon>
                      <n-icon><RefreshOutline /></n-icon>
                    </template>
                    {{ t("stash.create.keyGenerate") }}
                  </n-button>
                </n-input-group>
                <template #feedback>
                  <n-text depth="3" class="key-hint">{{ t("stash.create.keyHint") }}</n-text>
                </template>
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

    <n-modal
      :show="!!createdKey"
      preset="card"
      :closable="false"
      :mask-closable="false"
      :close-on-esc="false"
      :title="t('stash.create.savedTitle')"
      :style="{ maxWidth: '520px' }"
    >
      <n-space vertical :size="18">
        <p>{{ t("stash.create.savedMessage") }}</p>

        <n-input-group>
          <n-input :value="createdKey" readonly size="large" />
          <n-button size="large" @click="copyKey">
            {{ keyCopied ? t("stash.create.savedCopied") : t("stash.create.savedCopy") }}
          </n-button>
        </n-input-group>

        <div class="submit-row">
          <n-button type="primary" size="large" class="submit-btn" @click="continueToDashboard">
            {{ t("stash.create.savedContinue") }}
          </n-button>
        </div>
      </n-space>
    </n-modal>
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

.key-hint {
  display: block;
  margin-bottom: 20px;
}
</style>
