import axios from "axios";
import { getStoredToken, isDemoMode } from "@/lib/auth";

import { apiUrl } from "../api-url";

const LOGOUT_URL = apiUrl("/auth/logout");

export async function Logout<T>(): Promise<T> {
  if (isDemoMode()) return { success: true } as T;

  const token = getStoredToken();
  const response = await axios.post<T>(LOGOUT_URL, undefined, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    validateStatus: () => true,
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Não foi possível fazer logout (${response.status}).`);
  }

  return response.data;
}
