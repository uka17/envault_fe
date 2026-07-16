import axios from "axios";

/**
 * Axios instance for unauthenticated public endpoints (e.g. stash unlock links).
 * Unlike `http`, it carries no auth interceptors and targets the unversioned
 * `/api/public/*` routes instead of `/api/v1`.
 */
export const publicHttp = axios.create({
  baseURL: "/api",
});
