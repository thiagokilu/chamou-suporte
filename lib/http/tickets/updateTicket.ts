import axios from "axios";
import { getStoredToken, isDemoMode } from "@/lib/auth";
import type { Ticket } from "@/lib/tickets";
import {
  TicketsRequestError,
  type ApiTicket,
  type TicketPriority,
  type TicketStatus,
} from "./getTicketById";
import { mapApiTicket } from "./getTicket";
import { MOCK_TICKETS } from "@/lib/mocks";

import { apiUrl } from "../api-url";

const TICKETS_URL = apiUrl("/tickets");

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  category_id?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
}

type UpdateTicketResponse = ApiTicket | { data: ApiTicket };

export async function updateTicket(
  id: string,
  input: UpdateTicketInput,
  signal?: AbortSignal,
  tokenOverride?: string,
  baseUrl?: string,
): Promise<Ticket> {
  if (isDemoMode()) {
    const current = MOCK_TICKETS.find((item) => item.id === id);
    const ticket = {
      ...(current ?? {}),
      id,
      title: input.title ?? current?.title ?? "Chamado de demonstração",
      description:
        input.description ??
        current?.description ??
        "Atualização simulada no modo de demonstração.",
      status: input.status ?? current?.status ?? "OPEN",
      priority: input.priority ?? current?.priority ?? "MEDIUM",
      created_at: current?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as ApiTicket;
    return mapApiTicket(ticket);
  }

  const token = tokenOverride ?? getStoredToken();
  if (!token) {
    throw new Error("Sua sessão expirou. Faça login novamente.");
  }

  const ticketUrl = baseUrl
    ? new URL(`${TICKETS_URL}/${encodeURIComponent(id)}`, baseUrl).toString()
    : `${TICKETS_URL}/${encodeURIComponent(id)}`;

  const response = await axios.patch<UpdateTicketResponse>(ticketUrl, input, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    signal,
    validateStatus: () => true,
  });

  if (response.status < 200 || response.status >= 300) {
    if (response.status === 401) {
      throw new TicketsRequestError(
        "Sua sessão expirou. Faça login novamente.",
        response.status,
      );
    }

    throw new TicketsRequestError(
      response.status === 404
        ? "Chamado não encontrado."
        : `Não foi possível atualizar o chamado (${response.status}).`,
      response.status,
    );
  }

  const ticket = "data" in response.data ? response.data.data : response.data;
  return mapApiTicket(ticket);
}
