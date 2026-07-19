import { http } from "./http";
import { publicHttp } from "./publicHttp";

const STASHES_URL = "/stashes";
const PUBLIC_STASHES_URL = "/public/stashes";

export interface StashResponse {
  id: number;
  to: string;
  body: string;
  isSent: boolean;
  sendAt: string;
  createdOn: string;
  modifiedOn: string;
}

export interface StashCreatePayload {
  /** Stash message, already encrypted client-side with the sender's key. */
  body: string;
  to: string;
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
 * @param payload Stash body, recipient email, and scheduled send time.
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

export interface PublicStashResponse {
  sendAt: string;
  /** Stash message body, still encrypted; decrypted client-side with the recipient's key. */
  body: string;
}

/**
 * Fetch a public stash by its access token, including its encrypted body.
 * The body is decrypted entirely client-side; the server never sees the key.
 * Does not require authentication.
 * @param token Public access token from the unlock link.
 * @returns Public stash content (scheduled send time and encrypted body).
 */
export async function getPublicStashApi(token: string): Promise<PublicStashResponse> {
  const { data } = await publicHttp.get<PublicStashResponse>(`${PUBLIC_STASHES_URL}/${token}`);
  return data;
}
