import axios from "axios";
import { apiUrl } from "../api-url";
import { getStoredToken, isDemoMode } from "@/lib/auth";
import { TicketsRequestError, type ApiTicket } from "./getTicket";
import { MOCK_TICKETS } from "@/lib/mocks";

export interface CreateTicketInput {
  title: string;
  description: string;
  category_id: number;
  attachments?: File[];
}

export async function createTicket(input: CreateTicketInput): Promise<ApiTicket> {
  if (isDemoMode()) {
    const now = new Date().toISOString();
    const ticket: ApiTicket = {
      id: `demo-${Date.now()}`,
      title: input.title,
      description: input.description,
      status: "OPEN",
      priority: "MEDIUM",
      requester: { id: "demo-admin", username: "Administrador Demo", email: "admin@demo.com", role: "ADMIN" },
      assigned_to: null,
      created_at: now,
      updated_at: now,
    };
    MOCK_TICKETS.unshift(ticket);
    return ticket;
  }

  const token = getStoredToken();
  if (!token) {
    throw new Error("Sua sessão expirou. Faça login novamente.");
  }

  const body = input.attachments?.length
    ? (() => {
        const formData = new FormData();
        formData.append("title", input.title);
        formData.append("description", input.description);
        formData.append("category_id", String(input.category_id));
        Array.from(input.attachments).forEach((file) => formData.append("attachments", file));
        return formData;
      })()
    : {
        title: input.title,
        description: input.description,
        category_id: input.category_id,
      };

  const response = await axios.post<ApiTicket>(apiUrl("/tickets"), body, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    validateStatus: () => true,
  });

  if (response.status < 200 || response.status >= 300) {
    if (response.status === 401) {
      throw new TicketsRequestError("Sua sessão expirou. Faça login novamente.", response.status);
    }

    const message =
      typeof response.data === "object" &&
      response.data !== null &&
      "message" in response.data &&
      typeof response.data.message === "string"
        ? response.data.message
        : `Não foi possível criar o ticket (${response.status}).`;

    throw new TicketsRequestError(message, response.status);
  }

  return response.data;
}
