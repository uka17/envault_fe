import { http } from "./http";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export async function loginApi(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>("/users/login", payload);
  return data;
}
