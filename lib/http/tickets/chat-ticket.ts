import axios from "axios";
import { getStoredToken, isDemoMode } from "@/lib/auth";

import { apiUrl } from "../api-url";

function authHeaders() {
  const token = getStoredToken();
  if (!token) {
    throw new Error("Sua sessão expirou. Faça login novamente.");
  }

  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getTicketChatMessages<T>(
  ticketId: string,
  signal?: AbortSignal,
): Promise<T> {
  if (isDemoMode()) return [] as T;

  const response = await axios.get<T>(
    apiUrl(`/ticket-chat/${encodeURIComponent(ticketId)}/messages`),
    {
      headers: authHeaders(),
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
      `Não foi possível carregar as mensagens (${response.status}): ${details}`,
    );
  }

  return response.data;
}

export async function PostchatTicket<T>(
  ticketId: string,
  message: string,
  signal?: AbortSignal,
): Promise<T> {
  if (isDemoMode()) {
    return {
      reply:
        "Esta é uma conversa de demonstração. As mensagens não são enviadas ao suporte.",
    } as T;
  }

  const response = await axios.post<T>(
    apiUrl(`/ticket-chat/${encodeURIComponent(ticketId)}/messages`),
    { message },
    {
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json",
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
