import { http } from "./http";

const USERS_URL = "/users";
const USERS_LOGIN_URL = "/users/login";
const USERS_LOGOUT_URL = "/users/logout";
const USERS_WHOAMI_URL = "/users/whoami";
const TOKEN_REFRESH_URL = "/token/refresh";
const USERS_ME_URL = "/users/me";
const USERS_ME_PASSWORD_URL = "/users/me/password";
const USERS_VERIFY_EMAIL_URL = "/users/verify-email";
const USERS_VERIFY_EMAIL_RESEND_URL = "/users/verify-email/resend";
const USERS_EMAIL_CHANGE_REQUEST_URL = "/users/email-change/request";
const USERS_EMAIL_CHANGE_CONFIRM_URL = "/users/email-change/confirm";
const USERS_EMAIL_CHANGE_RESEND_URL = "/users/email-change/resend";
const USERS_PASSWORD_RESET_REQUEST_URL = "/users/password-reset/request";
const USERS_PASSWORD_RESET_CONFIRM_URL = "/users/password-reset/confirm";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface UserResponse {
  id: number;
  email: string;
  pendingEmail: string | null;
  name: string;
  emailVerifiedAt: string | null;
  createdOn: string;
  modifiedOn: string;
}

export interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ConfirmPasswordResetPayload {
  token: string;
  newPassword: string;
}

/**
 * Register a new user account.
 * @param payload Registration data (email, password, name).
 * @returns Created user profile object.
 */
export async function registerApi(payload: RegisterPayload): Promise<UserResponse> {
  const { data } = await http.post<UserResponse>(USERS_URL, payload);
  return data;
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
 * Update the current user's display name. Applies immediately, no confirmation required.
 * @param name New display name.
 * @returns Updated user profile object.
 */
export async function updateNameApi(name: string): Promise<UserResponse> {
  const { data } = await http.patch<UserResponse>(USERS_ME_URL, { name });
  return data;
}

/**
 * Requests an email change for the current user. The current address stays active
 * and logged in until the confirmation link is used.
 * @param email New email address to request.
 * @returns Updated user profile object (email unchanged until confirmed).
 */
export async function requestEmailChangeApi(email: string): Promise<UserResponse> {
  const { data } = await http.post<UserResponse>(USERS_EMAIL_CHANGE_REQUEST_URL, { email });
  return data;
}

/**
 * Confirms a pending email change using the token received by email.
 * @param token Confirmation token from the email link.
 * @returns void
 */
export async function confirmEmailChangeApi(token: string): Promise<void> {
  await http.post(USERS_EMAIL_CHANGE_CONFIRM_URL, { token });
}

/**
 * Resends the authenticated user's pending email change confirmation.
 * @returns void
 */
export async function resendEmailChangeApi(): Promise<void> {
  await http.post(USERS_EMAIL_CHANGE_RESEND_URL);
}

/**
 * Change the current user's password.
 * @param payload Current and new password.
 * @returns void
 */
export async function updatePasswordApi(payload: UpdatePasswordPayload): Promise<void> {
  await http.patch(USERS_ME_PASSWORD_URL, payload);
}

/**
 * Verify a user's email using the code received by email at registration time.
 * @param code Verification code.
 * @returns void
 */
export async function verifyEmailApi(code: string): Promise<void> {
  await http.post(USERS_VERIFY_EMAIL_URL, { code });
}

/**
 * Resend the email verification code. Always resolves, regardless of whether
 * the address is registered or already verified.
 * @param email Email address to resend the verification code to.
 * @returns void
 */
export async function resendVerificationApi(email: string): Promise<void> {
  await http.post(USERS_VERIFY_EMAIL_RESEND_URL, { email });
}

/**
 * Request a password reset link for the given address. The server responds the same way
 * whether or not the address belongs to a verified account.
 * @param email Email address to send the reset link to.
 * @returns void
 */
export async function requestPasswordResetApi(email: string): Promise<void> {
  await http.post(USERS_PASSWORD_RESET_REQUEST_URL, { email });
}

/**
 * Set a new password using the one-time token from the reset link.
 * The server revokes every session on success and does not log the user in.
 * @param payload Reset token and new password.
 * @returns void
 */
export async function confirmPasswordResetApi(payload: ConfirmPasswordResetPayload): Promise<void> {
  await http.post(USERS_PASSWORD_RESET_CONFIRM_URL, payload);
}
