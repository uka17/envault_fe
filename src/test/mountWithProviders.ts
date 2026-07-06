import { mount, type MountingOptions } from "@vue/test-utils";
import { createPinia, setActivePinia, type Pinia } from "pinia";
import { createRouter, createMemoryHistory, type Router } from "vue-router";
import { NMessageProvider } from "naive-ui";
import i18n from "@/i18n";
import { routes } from "@/router";

/**
 * Mounts a component wrapped in the providers it needs at runtime (Pinia, i18n, router,
 * naive-ui's message provider) so views relying on useAuthStore/useI18n/useRouter/useMessage
 * behave as they do in the real app.
 * @param component Component to mount.
 * @param options `@vue/test-utils` mounting options merged with the provider setup.
 * @returns The mounted wrapper plus the pinia and router instances used, for further test setup.
 */
export async function mountWithProviders<T extends Record<string, unknown>>(
  component: T,
  options: MountingOptions<never> = {},
) {
  const pinia: Pinia = createPinia();
  setActivePinia(pinia);

  const router: Router = createRouter({
    history: createMemoryHistory(),
    routes,
  });
  await router.push("/");
  await router.isReady();

  const wrapper = mount(
    {
      components: { NMessageProvider, Target: component },
      template: "<n-message-provider><Target v-bind=\"$attrs\" /></n-message-provider>",
    },
    {
      ...options,
      global: {
        ...options.global,
        plugins: [pinia, router, i18n, ...(options.global?.plugins ?? [])],
      },
    } as never,
  );

  return { wrapper, pinia, router };
}
