<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
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
import { KeyOutline, LockClosedOutline, LockOpenOutline } from "@vicons/ionicons5";
import { isAxiosError } from "axios";
import {
  getPublicStashApi,
  unlockStashApi,
  type PublicStashInfo,
  type UnlockedStash,
} from "@/api/stashApi";

const route = useRoute();
const { t } = useI18n();

const formRef = ref<FormInst | null>(null);
const isLoadingInfo = ref(true);
const isLinkInvalid = ref(false);
const stashInfo = ref<PublicStashInfo | null>(null);
const isSubmitting = ref(false);
const submitError = ref<string | null>(null);
const unlockedStash = ref<UnlockedStash | null>(null);

const formValue = reactive({
  key: "",
});

const rules = computed<FormRules>(() => ({
  key: [
    { required: true, message: t("validation.stash.keyRequired"), trigger: ["input", "blur"] },
  ],
}));

/**
 * Load the public stash availability info for the token in the current route.
 * Shows a neutral "invalid link" state on any failure.
 * @returns Nothing; updates local state.
 */
const loadStashInfo = async (): Promise<void> => {
  isLoadingInfo.value = true;
  isLinkInvalid.value = false;
  stashInfo.value = null;
  try {
    stashInfo.value = await getPublicStashApi(route.params.token as string);
  } catch {
    isLinkInvalid.value = true;
  } finally {
    isLoadingInfo.value = false;
  }
};

watch(() => route.params.token, () => {
  void loadStashInfo();
}, { immediate: true });

/**
 * Validate the key input and attempt to unlock the stash.
 * Shows the decrypted content on success.
 * @returns Nothing; updates local state.
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
    unlockedStash.value = await unlockStashApi(route.params.token as string, formValue.key);
  } catch (e) {
    submitError.value =
      (isAxiosError(e) && e.response?.data?.message?.translation) || t("stash.unlock.error");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <n-layout class="unlock-stash-page envault-page-shell">
    <n-layout-content class="auth-page-content">
      <div class="unlock-stash-shell">
        <n-space vertical align="center" :size="14" class="brand-block">
          <div class="brand-badge">
            <n-icon :size="28">
              <LockClosedOutline v-if="!unlockedStash" />
              <LockOpenOutline v-else />
            </n-icon>
          </div>
          <n-text class="brand-title">{{ t("stash.unlock.brandTitle") }}</n-text>
        </n-space>

        <n-card :bordered="false" class="env-auth-card">
          <n-space v-if="isLoadingInfo" vertical :size="22">
            <n-text>{{ t("stash.unlock.loading") }}</n-text>
          </n-space>

          <n-space v-else-if="isLinkInvalid" vertical :size="22">
            <header class="card-header">
              <h1>{{ t("stash.unlock.invalidTitle") }}</h1>
              <p>{{ t("stash.unlock.invalidMessage") }}</p>
            </header>
          </n-space>

          <n-space v-else-if="unlockedStash" vertical :size="22" class="unlocked-content">
            <header class="card-header">
              <h1>{{ unlockedStash.subject || t("stash.unlock.noSubject") }}</h1>
            </header>
            <n-text class="unlocked-body">{{ unlockedStash.body }}</n-text>
          </n-space>

          <n-space v-else vertical :size="22">
            <header class="card-header">
              <h1>{{ t("stash.unlock.title") }}</h1>
              <p>{{ t("stash.unlock.subtitle") }}</p>
            </header>

            <n-form
              ref="formRef"
              :model="formValue"
              :rules="rules"
              label-placement="top"
              class="env-auth-form"
            >
              <n-form-item path="key" :label="t('stash.unlock.keyLabel')">
                <n-input
                  v-model:value="formValue.key"
                  type="password"
                  show-password-on="click"
                  :placeholder="t('stash.unlock.keyPlaceholder')"
                  size="large"
                >
                  <template #prefix>
                    <n-icon :size="18">
                      <KeyOutline />
                    </n-icon>
                  </template>
                </n-input>
              </n-form-item>

              <div class="submit-row">
                <n-button
                  type="primary"
                  size="large"
                  class="submit-btn"
                  :loading="isSubmitting"
                  @click="submit"
                >
                  {{ t("stash.unlock.submit") }}
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
.unlock-stash-shell {
  width: min(600px, 100%);
}

.submit-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.25rem;
}

.unlocked-body {
  white-space: pre-wrap;
}
</style>
