import { createRouter, createWebHistory, type NavigationGuard } from "vue-router";
import HomeView from "../views/HomeView.vue";
import Login from "@/views/Login.vue";
import RegisterView from "@/views/RegisterView.vue";
import VerifyEmailView from "@/views/VerifyEmailView.vue";
import ConfirmEmailChangeView from "@/views/ConfirmEmailChangeView.vue";
import ForgotPasswordView from "@/views/ForgotPasswordView.vue";
import ResetPasswordView from "@/views/ResetPasswordView.vue";
import DashboardView from "@/views/DashboardView.vue";
import ProfileView from "@/views/ProfileView.vue";
import CreateStashView from "@/views/CreateStashView.vue";
import UnlockStashView from "@/views/UnlockStashView.vue";
import { useAuthStore } from "@/stores/auth";

export const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/register",
    name: "register",
    component: RegisterView,
  },
  {
    path: "/verify-email",
    name: "verify-email",
    component: VerifyEmailView,
  },
  {
    path: "/confirm-email-change",
    name: "confirm-email-change",
    component: ConfirmEmailChangeView,
  },
  {
    path: "/forgot-password",
    name: "forgot-password",
    component: ForgotPasswordView,
  },
  {
    path: "/reset-password",
    name: "reset-password",
    component: ResetPasswordView,
  },
  {
    path: "/dashboard",
    name: "dashboard",
    meta: { requiresAuth: true },
    component: DashboardView,
  },
  {
    path: "/profile",
    name: "profile",
    meta: { requiresAuth: true },
    component: ProfileView,
    beforeEnter: async () => {
      const auth = useAuthStore();
      await auth.fetchUser();
    },
  },
  {
    path: "/stash/new",
    name: "create-stash",
    meta: { requiresAuth: true },
    component: CreateStashView,
  },
  {
    path: "/unlock/:token",
    name: "unlock-stash",
    component: UnlockStashView,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export const requireAuth: NavigationGuard = (to) => {
  if (to.meta.requiresAuth && !useAuthStore().isAuthenticated) {
    return { name: "login", replace: true };
  }
  return true;
};

router.beforeEach(requireAuth);

export default router;
