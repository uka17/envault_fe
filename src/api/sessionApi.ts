import { http } from "./http";

const SESSIONS_URL = "/users/sessions";

export interface SessionResponse {
  id: number;
  expiresAt: string;
  revokedAt: string | null;
  userAgent: string;
  ip: string;
  createdOn: string;
  modifiedOn: string;
  current: boolean;
}

/**
 * Fetch every active (non-revoked, non-expired) session of the authenticated user.
 * @returns Array of session objects, most recently created first.
 */
export async function getSessionsApi(): Promise<SessionResponse[]> {
  const { data } = await http.get<SessionResponse[]>(SESSIONS_URL);
  return data;
}

/**
 * Terminate a single session by its numeric ID.
 * @param id Session ID.
 * @returns void
 */
export async function terminateSessionApi(id: number): Promise<void> {
  await http.delete(`${SESSIONS_URL}/${id}`);
}

/**
 * Terminate every session of the authenticated user except the current one.
 * @returns void
 */
export async function terminateOtherSessionsApi(): Promise<void> {
  await http.delete(SESSIONS_URL);
}
