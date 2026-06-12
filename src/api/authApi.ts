import { http } from "./http";

const USERS_LOGIN_URL = "/users/login";
const USERS_WHOAMI_URL = "/users/whoami";

export interface LoginPayload {
  email: string;
  password: string;
}

export async function loginApi(payload: LoginPayload): Promise<string> {
  const { data } = await http.post<{ token: string }>(USERS_LOGIN_URL, payload);
  return data.token;
}

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  createdOn: string;
  modifiedOn: string;
}

export async function checkAuthApi(): Promise<UserResponse> {
  const { data } = await http.get<UserResponse>(USERS_WHOAMI_URL);
  return data;
}
