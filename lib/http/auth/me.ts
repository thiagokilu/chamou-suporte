import axios from "axios";
import { apiUrl } from "../api-url";

const ME_URL = apiUrl("/auth/me");

export async function getMe<T>(
  token: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await axios.get<T>(ME_URL, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    signal,
    validateStatus: () => true,
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      `Não foi possível carregar o usuário (${response.status}).`,
    );
  }

  return response.data;
}
