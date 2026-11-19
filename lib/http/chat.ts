import axios from "axios";
import { getStoredToken, isDemoMode } from "@/lib/auth";

import { apiUrl } from "./api-url";

const CHAT_URL = apiUrl("/chat");

export async function PostchatIa<T>(
  message: string,
  history: { role: "user" | "model"; text: string }[] = [],
  signal?: AbortSignal,
): Promise<T> {
  if (isDemoMode()) {
    return {
      reply:
        "Esta é uma conversa de demonstração. As mensagens não são enviadas ao suporte.",
    } as T;
  }

  const token = getStoredToken();
  if (!token) {
    throw new Error("Sua sessão expirou. Faça login novamente.");
  }

  const response = await axios.post<T>(
    CHAT_URL,
    { message, history },
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal,
      validateStatus: () => true,
    },
  );

  if (response.status < 200 || response.status >= 300) {
    const details =
      typeof response.data === "string"
        ? response.data
        : JSON.stringify(response.data);
    throw new Error(
      `Não foi possível enviar a mensagem (${response.status}): ${details}`,
    );
  }

  return response.data;
}
