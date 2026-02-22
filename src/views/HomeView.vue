<script setup lang="ts">
import { useRouter } from "vue-router";
import {
  darkTheme,
  NButton,
  NCard,
  NConfigProvider,
  NGrid,
  NGridItem,
  NH1,
  NIcon,
  NLayout,
  NLayoutContent,
  NLayoutFooter,
  NLayoutHeader,
  NP,
  NSpace,
  NText,
} from "naive-ui";
import {
  LockClosedOutline,
  SettingsOutline,
  ShieldCheckmarkOutline,
  TimeOutline,
} from "@vicons/ionicons5";

const router = useRouter();

const themeOverrides = {
  common: {
    primaryColor: "hsl(260 30% 58%)",
    primaryColorHover: "hsl(260 30% 62%)",
    primaryColorPressed: "hsl(260 30% 50%)",
    primaryColorSuppl: "hsl(260 30% 58%)",
    borderRadius: "5px",
  },
};

const toLogin = () => router.push("/login");
const toSignup = () => router.push("/login?mode=signup");
</script>

<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
    <n-layout class="homepage">
      <n-layout-header bordered class="home-header">
        <div class="container header-content">
          <n-space align="center" :size="10">
            <div class="brand-icon">
              <n-icon :size="16">
                <LockClosedOutline />
              </n-icon>
            </div>
            <n-text class="brand-name">Envault</n-text>
          </n-space>

          <n-space align="center" :size="12" class="header-actions">
            <n-button @click="toLogin" dashed>Войти</n-button>
            <n-button type="primary" @click="toSignup">Начать</n-button>
          </n-space>
        </div>
      </n-layout-header>

      <n-layout-content class="hero">
        <div class="container hero-content">
          <div class="hero-lock">
            <n-icon :size="46">
              <LockClosedOutline />
            </n-icon>
          </div>

          <n-h1 class="hero-title">
            Защити свои слова
            <span>временем</span>
          </n-h1>

          <n-p class="hero-subtitle">
            Отправляй зашифрованные сообщения в будущее. Письма близким, важные данные или
            послания самому себе, доставка точно в назначенное время.
          </n-p>

          <n-space justify="center" align="center" :size="14" class="hero-actions" wrap>
            <n-button type="primary" size="large" class="btn btn-primary btn-lg" @click="toSignup">
              Создать первый stash
            </n-button>
            <n-button ghost size="large" class="btn btn-outline btn-lg" @click="toLogin">
              У меня есть ключ
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
                <n-text class="feature-title">End-to-end шифрование</n-text>
                <n-text depth="2" class="feature-description">
                  Только получатель с ключом может прочитать сообщение. Даже мы не имеем доступа.
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
                <n-text class="feature-title">Точная доставка</n-text>
                <n-text depth="2" class="feature-description">
                  Запланируй отправку на любую дату - через день, год или десятилетие.
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
                <n-text class="feature-title">Гибкий контроль</n-text>
                <n-text depth="2" class="feature-description">
                  Откладывай отправку или получай напоминания перед доставкой сообщения.
                </n-text>
              </n-card>
            </n-grid-item>
          </n-grid>
        </div>
      </n-layout-content>

      <n-layout-footer bordered class="home-footer">
        <div class="container">
          <n-text depth="3">© 2026 Envault. Защищай важное.</n-text>
        </div>
      </n-layout-footer>
    </n-layout>
  </n-config-provider>
</template>

<style scoped>
.homepage {
  --accent: hsl(260 30% 58%);
  --accent-soft: hsl(260 30% 68%);
  --accent-deep: hsl(260 30% 48%);
  min-height: 100vh;
  background: radial-gradient(circle at 20% 10%, hsl(260 30% 58% / 0.22), transparent 30%),
    radial-gradient(circle at 90% 80%, hsl(260 30% 58% / 0.12), transparent 35%), #080a0d;
  color: #eef1f5;
}

.container {
  width: min(1120px, 100% - 2rem);
  margin: 0 auto;
}

.home-header {
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(8px);
  background: rgba(8, 10, 13, 0.7);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.header-content {
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--accent-soft) 0%, var(--accent-deep) 100%);
  color: #ffffff;
}

.brand-name {
  color: #eef1f5;
  font-size: 1.2rem;
  font-weight: 700;
}

:deep(.btn.n-button) {
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
}

:deep(.btn-ghost.n-button) {
  color: #d4d8dd;
}

:deep(.btn-ghost.n-button:hover) {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}

:deep(.btn-primary.n-button) {
  background: linear-gradient(135deg, var(--accent-soft) 0%, var(--accent-deep) 100%);
  border-color: hsl(260 30% 58% / 0.6);
  box-shadow: 0 8px 22px hsl(260 30% 58% / 0.25);
}

:deep(.btn-primary.n-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px hsl(260 30% 58% / 0.35);
}

:deep(.btn-outline.n-button) {
  color: #d4d8dd;
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.02);
}

:deep(.btn-outline.n-button:hover) {
  color: #ffffff;
  border-color: hsl(260 30% 58% / 0.8);
  background: rgba(255, 255, 255, 0.06);
}

:deep(.btn-lg.n-button) {
  min-width: 220px;
  padding: 0.85rem 1.3rem;
}

.hero {
  min-height: calc(100vh - 128px);
  display: grid;
  place-items: center;
  padding: 4rem 0 3rem;
}

.hero-content {
  text-align: center;
}

.hero-lock {
  width: 96px;
  height: 96px;
  margin: 0 auto 1.75rem;
  border-radius: 28px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--accent-soft) 0%, var(--accent-deep) 100%);
  box-shadow: 0 0 38px hsl(260 30% 58% / 0.45);
  color: #ffffff;
  animation: float 2.8s ease-in-out infinite;
}

:deep(.hero-title.n-h1) {
  margin-bottom: 1.2rem;
  color: #eef1f5;
  font-size: clamp(2.3rem, 5.6vw, 4.6rem);
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.hero-title span {
  display: block;
  background: linear-gradient(135deg, hsl(260 30% 72%) 0%, var(--accent) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

:deep(.hero-subtitle.n-p) {
  width: min(700px, 100%);
  margin: 0 auto;
  color: #c0c7d1;
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
  background: hsl(260 30% 58% / 0.18);
  color: hsl(260 40% 76%);
  display: grid;
  place-items: center;
  margin-bottom: 0.95rem;
}

:deep(.feature-title.n-text) {
  display: block;
  color: #eef1f5;
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
  .hero {
    padding-top: 3rem;
  }

  .header-actions {
    gap: 0.5rem;
  }

  :deep(.btn-lg.n-button) {
    width: 100%;
    max-width: 320px;
  }
}
</style>
