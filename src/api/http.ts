import axios from "axios";
import { useAuthStore } from "@/stores/auth";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API,
});

http.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
});
