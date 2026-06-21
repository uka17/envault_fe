import { http } from "./http";

const USERS_LOGIN_URL = "/users/login";
const USERS_LOGOUT_URL = "/users/logout";
const USERS_WHOAMI_URL = "/users/whoami";
const TOKEN_REFRESH_URL = "/token/refresh";
const USERS_ME_URL = "/users/me";
const USERS_ME_PASSWORD_URL = "/users/me/password";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  createdOn: string;
  modifiedOn: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
}

export interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

/**
 * Authenticate with email and password.
 * @param payload Login credentials.
 * @returns Access token string.
 */
export async function loginApi(payload: LoginPayload): Promise<string> {
  const { data } = await http.post<{ token: string }>(USERS_LOGIN_URL, payload);
  return data.token;
}

/**
 * Exchange the HttpOnly refresh token cookie for a new access token.
 * @returns New access token string.
 */
export async function refreshTokenApi(): Promise<string> {
  const { data } = await http.post<{ token: string }>(TOKEN_REFRESH_URL);
  return data.token;
}

/**
 * Revoke the refresh token and clear the cookie on the server.
 * @returns void
 */
export async function logoutApi(): Promise<void> {
  await http.post(USERS_LOGOUT_URL);
}

/**
 * Fetch the currently authenticated user profile.
 * @returns User profile object.
 */
export async function checkAuthApi(): Promise<UserResponse> {
  const { data } = await http.get<UserResponse>(USERS_WHOAMI_URL);
  return data;
}

/**
 * Update the current user's profile (name and/or email).
 * @param payload Fields to update.
 * @returns Updated user profile object.
 */
export async function updateProfileApi(payload: UpdateProfilePayload): Promise<UserResponse> {
  const { data } = await http.patch<UserResponse>(USERS_ME_URL, payload);
  return data;
}

/**
 * Change the current user's password.
 * @param payload Current and new password.
 * @returns void
 */
export async function updatePasswordApi(payload: UpdatePasswordPayload): Promise<void> {
  await http.patch(USERS_ME_PASSWORD_URL, payload);
}
