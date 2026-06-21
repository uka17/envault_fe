import axios, { type AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API,
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

/**
 * Drain the queue of requests that were waiting for a token refresh.
 * @param token New access token to replay requests with.
 */
function resolveQueue(token: string) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original: AxiosRequestConfig & { _retry?: boolean } = error.config;

    if (
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes("/token/refresh")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token) => {
          original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
          original._retry = true;
          resolve(http(original));
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const auth = useAuthStore();
      const newToken = await auth.refresh();
      resolveQueue(newToken);
      original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` };
      return http(original);
    } catch {
      refreshQueue = [];
      const auth = useAuthStore();
      auth.clearAuth();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);
