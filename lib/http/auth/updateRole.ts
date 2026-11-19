import axios from "axios";
import { getStoredToken, isDemoMode } from "@/lib/auth";

import { apiUrl } from "../api-url";

const PROFILE_URL = apiUrl("/auth/updaterole");

export interface UpdateRolePayload {
  userId: string;
  role: string;
}

export async function updateRole<T>(
  userId: string,
  role: string,
  signal?: AbortSignal
): Promise<T> {
  if (isDemoMode()) return { success: true, userId, role } as T;

  const token = getStoredToken();

  if (!token) {
    throw new Error("Sua sessão expirou. Faça login novamente.");
  }

  const response = await axios.post<T>(
    PROFILE_URL,
    { userId, role },
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
