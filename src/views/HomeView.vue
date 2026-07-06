<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  NButton,
  NCard,
  NGrid,
  NGridItem,
  NH1,
  NIcon,
  NLayout,
  NLayoutContent,
  NLayoutFooter,
  NP,
  NSpace,
  NText,
} from "naive-ui";
import AppHeader from "@/components/AppHeader.vue";
import {
  LockClosedOutline,
  SettingsOutline,
  ShieldCheckmarkOutline,
  TimeOutline,
} from "@vicons/ionicons5";

const router = useRouter();
const { t } = useI18n();

/**
 * Navigates to the login page.
 */
const toLogin = () => router.push("/login");

/**
 * Navigates to the register page.
 */
const toSignup = () => router.push("/register");
</script>

<template>
  <n-layout class="homepage envault-page-shell">
    <AppHeader />

    <n-layout-content class="hero">
      <div class="envault-container hero-content">
        <div class="hero-lock">
          <n-icon :size="46">
            <LockClosedOutline />
          </n-icon>
        </div>

        <n-h1 class="hero-title">
          {{ t("home.hero.titleLine1") }}
          <span>{{ t("home.hero.titleLine2") }}</span>
        </n-h1>

        <n-p class="hero-subtitle">
          {{ t("home.hero.subtitle") }}
        </n-p>

        <n-space justify="center" align="center" :size="14" class="hero-actions" wrap>
          <n-button type="primary" size="large" class="btn-primary btn-lg" @click="toSignup">
            {{ t("home.hero.primaryCta") }}
          </n-button>
          <n-button ghost size="large" class="btn-outline btn-lg" @click="toLogin">
            {{ t("home.hero.secondaryCta") }}
          </n-button>
        </n-space>

        <n-grid cols="1 s:1 m:3" responsive="screen" :x-gap="16" :y-gap="16" class="features">
          <n-grid-item>
            <n-card class="feature-card" :bordered="false">
              <div class="feature-icon">
                <n-icon :size="22">
                  <ShieldCheckmarkOutline />
                </n-icon>
              </div>
              <n-text class="feature-title">{{ t("home.features.encryptionTitle") }}</n-text>
              <n-text depth="2" class="feature-description">
                {{ t("home.features.encryptionDescription") }}
              </n-text>
            </n-card>
          </n-grid-item>

          <n-grid-item>
            <n-card class="feature-card" :bordered="false">
              <div class="feature-icon">
                <n-icon :size="22">
                  <TimeOutline />
                </n-icon>
              </div>
              <n-text class="feature-title">{{ t("home.features.deliveryTitle") }}</n-text>
              <n-text depth="2" class="feature-description">
                {{ t("home.features.deliveryDescription") }}
              </n-text>
            </n-card>
          </n-grid-item>

          <n-grid-item>
            <n-card class="feature-card" :bordered="false">
              <div class="feature-icon">
                <n-icon :size="22">
                  <SettingsOutline />
                </n-icon>
              </div>
              <n-text class="feature-title">{{ t("home.features.controlTitle") }}</n-text>
              <n-text depth="2" class="feature-description">
                {{ t("home.features.controlDescription") }}
              </n-text>
            </n-card>
          </n-grid-item>
        </n-grid>
      </div>
    </n-layout-content>

    <n-layout-footer bordered class="home-footer">
      <div class="envault-container">
        <n-text depth="3">{{ t("home.footer") }}</n-text>
      </div>
    </n-layout-footer>
  </n-layout>
</template>

<style scoped>
.homepage {
  min-height: 100vh;
}


:deep(.btn-primary.n-button) {
  background: linear-gradient(135deg, var(--env-accent-soft) 0%, var(--env-accent-deep) 100%);
  border-color: rgba(137, 116, 180, 0.6);
  box-shadow: none;
}

:deep(.btn-primary.n-button:hover) {
  transform: translateY(-1px);
  box-shadow: none;
}

:deep(.btn-outline.n-button) {
  color: #d4d8dd;
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.02);
}

:deep(.btn-outline.n-button:hover) {
  color: #ffffff;
  border-color: rgba(137, 116, 180, 0.8);
  background: rgba(255, 255, 255, 0.06);
}

:deep(.btn-lg.n-button) {
  min-width: 220px;
}

.hero {
  min-height: calc(100vh - 128px);
  display: grid;
  place-items: center;
  padding: 1rem 0 3rem;
}

.hero-content {
  text-align: center;
  padding-top: 2.5rem;
}

.hero-lock {
  width: 96px;
  height: 96px;
  margin: 0 auto 1.75rem;
  border-radius: 28px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--env-accent-soft) 0%, var(--env-accent-deep) 100%);
  box-shadow: none;
  color: #ffffff;
  animation: float 2.8s ease-in-out infinite;
}

:deep(.hero-title.n-h1) {
  margin-bottom: 1.2rem;
  color: var(--env-text);
  font-size: clamp(2.3rem, 5.6vw, 4.6rem);
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.hero-title span {
  display: block;
  background: linear-gradient(135deg, #b0a2cd 0%, var(--env-accent) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

:deep(.hero-subtitle.n-p) {
  width: min(700px, 100%);
  margin: 0 auto;
  color: var(--env-muted);
  font-size: clamp(1rem, 2.1vw, 1.26rem);
  line-height: 1.55;
}

.hero-actions {
  margin-top: 2.2rem;
}

.features {
  margin-top: 4.2rem;
}

:deep(.feature-card.n-card) {
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.11);
  text-align: left;
}

:deep(.feature-card .n-card__content) {
  padding: 1.25rem;
}

.feature-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: rgba(137, 116, 180, 0.18);
  color: #baa9da;
  display: grid;
  place-items: center;
  margin-bottom: 0.95rem;
}

:deep(.feature-title.n-text) {
  display: block;
  color: var(--env-text);
  font-size: 1.05rem;
  font-weight: 650;
  margin-bottom: 0.5rem;
}

:deep(.feature-description.n-text) {
  display: block;
  color: #bac2ce;
  font-size: 0.93rem;
  line-height: 1.45;
}

.home-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  text-align: center;
  padding: 1.2rem 0;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@media (max-width: 640px) {
  .header-content-wide {
    padding: 0 1rem;
  }

  .hero {
    padding-top: 4rem;
  }

  :deep(.btn-lg.n-button) {
    width: 100%;
    max-width: 320px;
  }
}
</style>
