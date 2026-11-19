import axios from "axios";
import { apiUrl } from "../api-url";
import { getStoredToken, isDemoMode } from "@/lib/auth";
import type { Ticket } from "@/lib/tickets";
import { mapApiTicket } from "./getTicket";
import { MOCK_TICKETS } from "@/lib/mocks";

const GET_TICKETS_URL = apiUrl("/tickets");

export class TicketsRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "TicketsRequestError";
  }
}

export type TicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING_FOR_CUSTOMER"
  | "RESOLVED"
  | "CLOSED";

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface GetTicketsParams {
  name?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category_id?: number;
  page?: number;
  perPage?: number;
}

export interface ApiTicketUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface ApiTicket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  requester?: ApiTicketUser;
  assigned_to?: ApiTicketUser | Record<string, never> | null;
  created_at: string;
  updated_at: string;
}

export interface GetTicketsResponse {
  data: ApiTicket[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}

export async function getTicketById(
  id: string,
  signal?: AbortSignal,
  tokenOverride?: string,
  baseUrl?: string,
): Promise<Ticket> {
  if (isDemoMode()) {
    const ticket = MOCK_TICKETS.find((item) => item.id === id);
    if (!ticket) throw new TicketsRequestError("Chamado não encontrado.", 404);
    return mapApiTicket(ticket);
  }

  const token = tokenOverride ?? getStoredToken();
  if (!token) {
    throw new Error("Sua sessão expirou. Faça login novamente.");
  }

  const ticketUrl = baseUrl
    ? new URL(`${GET_TICKETS_URL}/${encodeURIComponent(id)}`, baseUrl).toString()
    : `${GET_TICKETS_URL}/${encodeURIComponent(id)}`;

  const response = await axios.get<ApiTicket | { data: ApiTicket }>(
    ticketUrl,
    {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + token,
      },
      signal,
      validateStatus: () => true,
    },
  );

  if (response.status < 200 || response.status >= 300) {
    if (response.status === 401) {
      throw new TicketsRequestError("Sua sessão expirou. Faça login novamente.", response.status);
    }

    throw new TicketsRequestError(
      response.status === 404
        ? "Chamado não encontrado."
        : `Não foi possível carregar o chamado (${response.status}).`,
      response.status,
    );
  }

  const ticket = "data" in response.data ? response.data.data : response.data;
  return mapApiTicket(ticket);
}

export function isRequestCanceled(
  reason: unknown,
  signal?: AbortSignal,
): boolean {
  return (
    signal?.aborted === true ||
    axios.isCancel(reason) ||
    (reason instanceof Error && reason.name === "AbortError")
  );
}

const statusLabels: Record<TicketStatus, string> = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em andamento",
  WAITING_FOR_CUSTOMER: "Aguardando cliente",
  RESOLVED: "Resolvido",
  CLOSED: "Fechado",
};

const priorityLabels: Record<TicketPriority, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
};


export async function getTickets(
  params: GetTicketsParams = {},
  signal?: AbortSignal
): Promise<GetTicketsResponse> {
  if (isDemoMode()) {
    const filtered = MOCK_TICKETS.filter((ticket) =>
      (!params.status || ticket.status === params.status) &&
      (!params.priority || ticket.priority === params.priority) &&
      (!params.name || `${ticket.title} ${ticket.description}`.toLowerCase().includes(params.name.toLowerCase()))
    );
    const page = params.page ?? 1;
    const perPage = params.perPage ?? filtered.length;
    const start = (page - 1) * perPage;
    return {
      data: filtered.slice(start, start + perPage),
      meta: { total: filtered.length, lastPage: Math.max(1, Math.ceil(filtered.length / perPage)), currentPage: page, perPage, prev: page > 1 ? page - 1 : null, next: start + perPage < filtered.length ? page + 1 : null },
    };
  }

  const token = getStoredToken();
  if (!token) {
    throw new Error("Sua sessão expirou. Faça login novamente.");
  }

  const response = await axios.get<GetTicketsResponse>(GET_TICKETS_URL, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    params,
    signal,
    validateStatus: () => true,
  });

  if (response.status < 200 || response.status >= 300) {
    if (response.status === 401) {
      throw new TicketsRequestError("Sua sessão expirou. Faça login novamente.", response.status);
    }

    throw new TicketsRequestError(
      `Não foi possível carregar os tickets (${response.status}).`,
      response.status,
    );
  }

  return response.data;
}
