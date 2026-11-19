import axios from "axios";
import { apiUrl } from "../api-url";
import { getStoredToken, isDemoMode } from "@/lib/auth";
import type { Ticket } from "@/lib/tickets";
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

export interface CreateTicketInput {
  title: string;
  description: string;
  priority: TicketPriority;
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

export function mapApiTicket(ticket: ApiTicket): Ticket {
  const assignedTo =
    ticket.assigned_to && "username" in ticket.assigned_to
      ? ticket.assigned_to.username
      : null;

  return {
    id: ticket.id,
    titulo: ticket.title,
    descricao: ticket.description,
    status: statusLabels[ticket.status],
    prioridade: priorityLabels[ticket.priority],
    cliente: ticket.requester?.username ?? ticket.requester?.email ?? "Não informado",
    agente: assignedTo,
    dataCriacao: ticket.created_at,
    dataAtualizacao: ticket.updated_at,
  };
}

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

export async function createTicket(input: CreateTicketInput): Promise<ApiTicket> {
  if (isDemoMode()) {
    const now = new Date().toISOString();
    return { id: `demo-${Date.now()}`, title: input.title, description: input.description, status: "OPEN", priority: input.priority, requester: { id: "demo-admin", username: "Administrador Demo", email: "admin@demo.com", role: "ADMIN" }, assigned_to: null, created_at: now, updated_at: now };
  }

  const token = getStoredToken();
  if (!token) {
    throw new Error("Sua sessão expirou. Faça login novamente.");
  }

  const response = await axios.post<ApiTicket>(GET_TICKETS_URL, input, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    validateStatus: () => true,
  });

  if (response.status < 200 || response.status >= 300) {
    if (response.status === 401) {
      throw new TicketsRequestError("Sua sessão expirou. Faça login novamente.", response.status);
    }

    throw new TicketsRequestError(
      `Não foi possível criar o ticket (${response.status}).`,
      response.status,
    );
  }

  return response.data;
}
