import { http } from "./http";
import { publicHttp } from "./publicHttp";

const STASHES_URL = "/stashes";
const PUBLIC_STASHES_URL = "/public/stashes";

export interface StashResponse {
  id: number;
  to: string;
  subject: string | null;
  body: string;
  key: string;
  isSent: boolean;
  sendAt: string;
  createdOn: string;
  modifiedOn: string;
}

export interface StashCreatePayload {
  body: string;
  to: string;
  subject?: string | null;
  sendAt: string;
}

/**
 * Fetch all stashes for the currently authenticated user.
 * @returns Array of stash objects.
 */
export async function getStashesApi(): Promise<StashResponse[]> {
  const { data } = await http.get<StashResponse[]>(STASHES_URL);
  return data;
}

/**
 * Fetch a single stash by its ID.
 * @param id Stash ID.
 * @returns Stash object.
 */
export async function getStashApi(id: number): Promise<StashResponse> {
  const { data } = await http.get<StashResponse>(`${STASHES_URL}/${id}`);
  return data;
}

/**
 * Create a new stash for the authenticated user.
 * @param payload Stash body, recipient email, optional subject, and scheduled send time.
 * @returns Created stash object.
 */
export async function createStashApi(payload: StashCreatePayload): Promise<StashResponse> {
  const { data } = await http.post<StashResponse>(STASHES_URL, payload);
  return data;
}

/**
 * Delete a stash by its ID.
 * @param id Stash ID.
 * @returns void
 */
export async function deleteStashApi(id: number): Promise<void> {
  await http.delete(`${STASHES_URL}/${id}`);
}

/**
 * Snooze a stash by postponing its send time by the given number of hours.
 * @param id Stash ID.
 * @param hours Number of hours to postpone.
 * @returns Updated stash object.
 */
export async function snoozeStashApi(id: number, hours: number): Promise<StashResponse> {
  const { data } = await http.post<StashResponse>(`${STASHES_URL}/${id}/snooze/${hours}`);
  return data;
}

export interface PublicStashInfo {
  subject: string | null;
  sendAt: string;
}

export interface UnlockedStash extends PublicStashInfo {
  body: string;
}

/**
 * Check whether a public stash is available and fetch the information
 * required to display the key input form. Does not require authentication.
 * @param token Public access token from the unlock link.
 * @returns Public stash info (subject and scheduled send time).
 */
export async function getPublicStashApi(token: string): Promise<PublicStashInfo> {
  const { data } = await publicHttp.get<PublicStashInfo>(`${PUBLIC_STASHES_URL}/${token}`);
  return data;
}

/**
 * Unlock a public stash using its decryption key. Does not require authentication.
 * @param token Public access token from the unlock link.
 * @param key Decryption key for the stash.
 * @returns Decrypted stash content.
 */
export async function unlockStashApi(token: string, key: string): Promise<UnlockedStash> {
  const { data } = await publicHttp.post<UnlockedStash>(`${PUBLIC_STASHES_URL}/${token}/unlock`, { key });
  return data;
}
