import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import Login from "@/views/Login.vue";
import RegisterView from "@/views/RegisterView.vue";
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
    path: "/dashboard",
    name: "dashboard",
    component: DashboardView,
  },
  {
    path: "/profile",
    name: "profile",
    component: ProfileView,
    /**
     * Refetch the current user profile every time this route is entered,
     * so the profile page always reflects the latest server state
     * instead of a possibly stale cached value in the auth store.
     * @returns Nothing; navigation proceeds unconditionally after the fetch attempt.
     */
    beforeEnter: async () => {
      const auth = useAuthStore();
      await auth.fetchUser();
    },
  },
  {
    path: "/stash/new",
    name: "create-stash",
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

export default router;
