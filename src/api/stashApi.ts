import { http } from "./http";

const STASHES_URL = "/stashes";

export interface StashResponse {
  id: number;
  to: string;
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
