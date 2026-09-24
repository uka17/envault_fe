import axios, { type AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API,
  withCredentials: true,
});

let refreshPromise: Promise<string> | null = null;
let onSessionExpired: (() => Promise<unknown>) | undefined;

/**
 * Register navigation after a session expires without importing the router.
 * @param handler Application navigation callback.
 * @returns Nothing.
 */
export function setSessionExpiredHandler(handler: () => Promise<unknown>): void {
  onSessionExpired = handler;
}

http.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
});

/**
 * Refresh the shared session and handle a rejected refresh token once.
 * @returns The new access token.
 */
async function refreshSession(): Promise<string> {
  const auth = useAuthStore();
  try {
    return await auth.refresh();
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      auth.clearAuth();
      await onSessionExpired?.();
    }
    throw error;
  } finally {
    refreshPromise = null;
  }
}

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original: (AxiosRequestConfig & { _retry?: boolean }) | undefined = error.config;
    const skipRefreshUrls = [
      "/token/refresh",
      "/users/login",
      "/users/verify-email",
      "/users/email-change/confirm",
    ];
    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      skipRefreshUrls.some((url) => original.url?.includes(url))
    ) {
      return Promise.reject(error);
    }

    original._retry = true;
    refreshPromise ??= refreshSession();
    let token: string;
    try {
      token = await refreshPromise;
    } catch {
      return Promise.reject(error);
    }
    original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
    return http(original);
  },
);
