<script setup lang="ts">
import { RouterLink } from "vue-router";
import {
  LockClosedOutline,
  ShieldCheckmarkOutline,
  TimeOutline,
  SettingsOutline,
} from "@vicons/ionicons5";
</script>

<template>
  <div class="homepage">
    <header class="home-header">
      <div class="container header-content">
        <div class="brand">
          <div class="brand-icon">
            <LockClosedOutline />
          </div>
          <span class="brand-name">Envault</span>
        </div>

        <div class="header-actions">
          <RouterLink to="/login" class="btn btn-ghost">Войти</RouterLink>
          <RouterLink to="/login?mode=signup" class="btn btn-primary">Начать</RouterLink>
        </div>
      </div>
    </header>

    <main class="hero">
      <div class="container hero-content">
        <div class="hero-lock">
          <LockClosedOutline />
        </div>

        <h1 class="hero-title">
          Защити свои слова
          <span>временем</span>
        </h1>

        <p class="hero-subtitle">
          Отправляй зашифрованные сообщения в будущее. Письма близким, важные данные или
          послания самому себе, доставка точно в назначенное время.
        </p>

        <div class="hero-actions">
          <RouterLink to="/login?mode=signup" class="btn btn-primary btn-lg">Создать первый stash</RouterLink>
          <RouterLink to="/login" class="btn btn-outline btn-lg">У меня есть ключ</RouterLink>
        </div>

        <section class="features">
          <article class="feature-card">
            <div class="feature-icon">
              <ShieldCheckmarkOutline />
            </div>
            <h3>End-to-end шифрование</h3>
            <p>
              Только получатель с ключом может прочитать сообщение. Даже мы не имеем доступа.
            </p>
          </article>

          <article class="feature-card">
            <div class="feature-icon">
              <TimeOutline />
            </div>
            <h3>Точная доставка</h3>
            <p>
              Запланируй отправку на любую дату - через день, год или десятилетие.
            </p>
          </article>

          <article class="feature-card">
            <div class="feature-icon">
              <SettingsOutline />
            </div>
            <h3>Гибкий контроль</h3>
            <p>
              Откладывай отправку или получай напоминания перед доставкой сообщения.
            </p>
          </article>
        </section>
      </div>
    </main>

    <footer class="home-footer">
      <div class="container">© 2026 Envault. Защищай важное.</div>
    </footer>
  </div>
</template>

<style scoped>
.homepage {
  min-height: 100vh;
  background: radial-gradient(circle at 20% 10%, rgba(24, 160, 88, 0.22), transparent 30%),
    radial-gradient(circle at 90% 80%, rgba(24, 160, 88, 0.12), transparent 35%), #080a0d;
  color: #eef1f5;
  display: flex;
  flex-direction: column;
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

.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.brand-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #1fb364 0%, #147d47 100%);
}

.brand-icon :deep(svg) {
  width: 16px;
  height: 16px;
}

.brand-name {
  font-size: 1.2rem;
  font-weight: 700;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-ghost {
  color: #d4d8dd;
  background: transparent;
}

.btn-ghost:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}

.btn-primary {
  color: #ffffff;
  background: linear-gradient(135deg, #1fb364 0%, #147d47 100%);
  border-color: rgba(31, 179, 100, 0.6);
  box-shadow: 0 8px 22px rgba(24, 160, 88, 0.25);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(24, 160, 88, 0.35);
}

.btn-outline {
  color: #d4d8dd;
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.02);
}

.btn-outline:hover {
  color: #ffffff;
  border-color: rgba(31, 179, 100, 0.8);
}

.btn-lg {
  padding: 0.85rem 1.3rem;
  min-width: 220px;
}

.hero {
  flex: 1;
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
  background: linear-gradient(135deg, #1fb364 0%, #147d47 100%);
  box-shadow: 0 0 38px rgba(24, 160, 88, 0.45);
  animation: float 2.8s ease-in-out infinite;
}

.hero-lock :deep(svg) {
  width: 46px;
  height: 46px;
}

.hero-title {
  font-size: clamp(2.3rem, 5.6vw, 4.6rem);
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 1.2rem;
}

.hero-title span {
  display: block;
  background: linear-gradient(135deg, #7ff4ba 0%, #1fb364 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-subtitle {
  width: min(700px, 100%);
  margin: 0 auto;
  color: #c0c7d1;
  font-size: clamp(1rem, 2.1vw, 1.26rem);
  line-height: 1.55;
}

.hero-actions {
  margin-top: 2.2rem;
  display: flex;
  gap: 0.9rem;
  justify-content: center;
  flex-wrap: wrap;
}

.features {
  margin-top: 4.2rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.feature-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.11);
  border-radius: 18px;
  padding: 1.25rem;
  text-align: left;
}

.feature-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: rgba(31, 179, 100, 0.14);
  color: #5ce09a;
  display: grid;
  place-items: center;
  margin-bottom: 0.95rem;
}

.feature-icon :deep(svg) {
  width: 22px;
  height: 22px;
}

.feature-card h3 {
  font-size: 1.05rem;
  font-weight: 650;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: #bac2ce;
  font-size: 0.93rem;
  line-height: 1.45;
}

.home-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  color: #96a0af;
  text-align: center;
  padding: 1.2rem 0;
  font-size: 0.9rem;
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

@media (max-width: 960px) {
  .features {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .hero {
    padding-top: 3rem;
  }

  .btn-lg {
    width: 100%;
    max-width: 320px;
  }

  .header-actions {
    gap: 0.5rem;
  }

  .btn {
    padding: 0.45rem 0.85rem;
  }
}
</style>

