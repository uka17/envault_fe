import { http } from "./http";

const USERS_LOGIN_URL = "/users/login";
const USERS_LOGOUT_URL = "/users/logout";
const USERS_WHOAMI_URL = "/users/whoami";
const TOKEN_REFRESH_URL = "/token/refresh";

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
