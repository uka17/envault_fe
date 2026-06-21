<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { NButton, NIcon, NLayoutHeader, NSpace, NText } from "naive-ui";
import { useAuthStore } from "@/stores/auth";
import {
  AddOutline,
  LockClosedOutline,
  SettingsOutline,
  LogOutOutline,
} from "@vicons/ionicons5";

const router = useRouter();
const authStore = useAuthStore();

/** Whether the user dropdown menu is open. */
const menuOpen = ref(false);

/** Ref to the avatar button for dropdown positioning. */
const avatarBtn = ref<HTMLButtonElement | null>(null);

/** Fixed position of the dropdown relative to the viewport. */
const dropdownPos = ref({ top: 0, right: 0 });

/** Derived user info from the auth store. */
const currentUser = computed(() => {
  const email = authStore.user?.email ?? "";
  const initials = email.slice(0, 2).toUpperCase() || "US";
  return { email, initials };
});

/**
 * Toggles the dropdown and recalculates its position.
 */
const toggleMenu = () => {
  if (!menuOpen.value && avatarBtn.value) {
    const rect = avatarBtn.value.getBoundingClientRect();
    dropdownPos.value = {
      top: rect.bottom + 10,
      right: window.innerWidth - rect.right,
    };
  }
  menuOpen.value = !menuOpen.value;
};

/**
 * Closes the dropdown.
 */
const closeMenu = () => {
  menuOpen.value = false;
};

/**
 * Navigates to the dashboard (My stashes).
 */
const goToDashboard = () => {
  closeMenu();
  router.push({ name: "dashboard" });
};

/**
 * Navigates to the profile / settings page.
 */
const goToSettings = () => {
  closeMenu();
  router.push({ name: "profile" });
};

/**
 * Logs the user out and redirects to login.
 */
const handleLogout = () => {
  closeMenu();
  authStore.logout();
  router.push({ name: "login" });
};
</script>

<template>
  <n-layout-header bordered class="app-header">
    <div class="app-header-inner">
      <n-space align="center" :size="10" class="brand-link" role="link" aria-label="На главную" @click="router.push({ name: 'home' })">
        <div class="envault-brand-mark" role="img" aria-label="Envault">
          <n-icon :size="16">
            <LockClosedOutline />
          </n-icon>
        </div>
        <n-text class="brand-name">Envault</n-text>
      </n-space>

      <div class="user-menu-wrap">
        <template v-if="authStore.isAuthenticated">
          <button
            ref="avatarBtn"
            class="avatar-badge"
            type="button"
            :aria-expanded="menuOpen"
            aria-haspopup="true"
            aria-label="Меню пользователя"
            @click="toggleMenu"
          >
            {{ currentUser.initials }}
          </button>
        </template>
        <template v-else>
          <n-space :size="10">
            <n-button ghost class="header-btn-login" @click="router.push({ name: 'login' })">
              Войти
            </n-button>
            <n-button type="primary" class="header-btn-start" @click="router.push({ name: 'register' })">
              Начать
            </n-button>
          </n-space>
        </template>

        <Teleport to="body">
          <template v-if="menuOpen">
            <div class="dropdown-backdrop" @click="closeMenu" />
            <div
              class="user-dropdown"
              role="menu"
              :style="{ top: dropdownPos.top + 'px', right: dropdownPos.right + 'px' }"
            >
              <div class="dropdown-user-header">
                <span class="dropdown-avatar">{{ currentUser.initials }}</span>
                <span class="dropdown-email">{{ currentUser.email }}</span>
              </div>

              <div class="dropdown-divider" />

              <button type="button" class="dropdown-item" role="menuitem" @click="goToDashboard">
                <n-icon :size="16"><LockClosedOutline /></n-icon>
                My stashes
              </button>
              <button type="button" class="dropdown-item" role="menuitem" @click="() => { closeMenu(); router.push({ name: 'create-stash' }); }">
                <n-icon :size="16"><AddOutline /></n-icon>
                Create stash
              </button>
              <button type="button" class="dropdown-item" role="menuitem" @click="goToSettings">
                <n-icon :size="16"><SettingsOutline /></n-icon>
                Profile
              </button>

              <div class="dropdown-divider" />

              <button
                type="button"
                class="dropdown-item dropdown-item--danger"
                role="menuitem"
                @click="handleLogout"
              >
                <n-icon :size="16"><LogOutOutline /></n-icon>
                Logout
              </button>
            </div>
          </template>
        </Teleport>
      </div>
    </div>
  </n-layout-header>
</template>

<style scoped>
.app-header {
  backdrop-filter: blur(10px);
  background: rgba(7, 8, 15, 0.84);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.app-header-inner {
  width: 100%;
  padding: 0 2rem;
  box-sizing: border-box;
  min-height: 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-link {
  cursor: pointer;
}

.brand-name {
  color: var(--env-text);
  font-size: 2rem;
  font-weight: 680;
  letter-spacing: -0.01em;
}

.envault-brand-mark {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--env-accent-soft) 0%, var(--env-accent-deep) 100%);
  color: #ffffff;
}

.avatar-badge {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  color: #bca9d6;
  font-size: 0.9rem;
  font-weight: 600;
  background: rgba(137, 116, 180, 0.18);
  cursor: pointer;
}

.user-menu-wrap {
  position: relative;
}

:deep(.header-btn-login.n-button) {
  border-color: rgba(255, 255, 255, 0.2);
  color: #c0c7d1;
}

:deep(.header-btn-login.n-button:hover) {
  border-color: rgba(255, 255, 255, 0.4);
  color: #eef1f5;
}

:deep(.header-btn-start.n-button) {
  background: linear-gradient(135deg, var(--env-accent-soft) 0%, var(--env-accent) 100%);
  border: none;
  color: #14111d;
  font-weight: 600;
}

:deep(.header-btn-start.n-button:hover) {
  filter: brightness(1.08);
}

.dropdown-backdrop {
  position: fixed;
  inset: 0;
  z-index: 90;
}

.user-dropdown {
  position: fixed;
  z-index: 9999;
  min-width: 220px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #13141f;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  padding: 0.5rem 0;
  overflow: hidden;
}

.dropdown-user-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem 0.65rem;
}

.dropdown-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 0.78rem;
  font-weight: 600;
  color: #bca9d6;
  background: rgba(137, 116, 180, 0.18);
  flex-shrink: 0;
}

.dropdown-email {
  font-size: 0.92rem;
  color: #dadce4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 0.35rem 0;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem 1rem;
  background: none;
  border: none;
  color: #c0c7d1;
  font-size: 0.95rem;
  cursor: pointer;
  text-align: left;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #eef1f5;
}

.dropdown-item--danger {
  color: #e05c5c;
}

.dropdown-item--danger:hover {
  background: rgba(224, 92, 92, 0.08);
  color: #e87373;
}

@media (max-width: 760px) {
  .brand-name {
    font-size: 1.75rem;
  }

  .app-header-inner {
    padding: 0 1rem;
  }
}
</style>
