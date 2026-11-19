import axios from "axios";
import { getStoredToken, isDemoMode } from "@/lib/auth";

import { apiUrl } from "../api-url";

const PROFILE_URL = apiUrl("/auth/profile");

export interface UpdateProfilePayload {
  username: string;
}

export async function updateProfile<T>(
  username: string,
  signal?: AbortSignal
): Promise<T> {
  if (isDemoMode()) return { success: true, username } as T;

  const token = getStoredToken();

  if (!token) {
    throw new Error("Sua sessão expirou. Faça login novamente.");
  }

  const response = await axios.patch<T>(
    PROFILE_URL,
    { username },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal,
      validateStatus: () => true,
    }
  );

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Não foi possível atualizar o perfil (${response.status}).`);
  }

  return response.data;
}
