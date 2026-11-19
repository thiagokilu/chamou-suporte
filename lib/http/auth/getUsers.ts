import axios from "axios";
import { apiUrl } from "../api-url";
import { getStoredToken, isDemoMode } from "@/lib/auth";
import { MOCK_USERS } from "@/lib/mocks";

const USERS_URL = apiUrl("/auth/users");

export interface ApiUser {
  id: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getUsers(
  signal?: AbortSignal
): Promise<ApiUser[]> {
  if (isDemoMode()) return MOCK_USERS;

  const token = getStoredToken();
  if (!token) {
    throw new Error("Sua sessão expirou. Faça login novamente.");
  }

  const response = await axios.get<ApiUser[]>(USERS_URL, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    signal,
    validateStatus: () => true,
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Não foi possível carregar os usuários (${response.status}).`);
  }

  return response.data;
}
