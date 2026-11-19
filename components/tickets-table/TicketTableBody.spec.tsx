import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiTicket } from "@/lib/http/http";

const { pushMock, routerMock } = vi.hoisted(() => {
  const pushMock = vi.fn();
  return { pushMock, routerMock: { push: pushMock } };
});

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
  usePathname: () => "/admin",
}));

vi.mock("@/lib/http/http", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/http/http")>();
  return { ...actual, getTickets: vi.fn() };
});

import { getTickets, TicketsRequestError } from "@/lib/http/http";
import TicketsTableBody from "./TicketTableBody";

const apiTicket: ApiTicket = {
  id: "1",
  title: "Erro ao acessar o sistema",
  description: "Não consigo fazer login",
  status: "OPEN",
  priority: "HIGH",
  requester: { id: "u1", username: "Maria Souza", email: "maria@x.com", role: "CLIENT" },
  assigned_to: { id: "u2", username: "Carlos", email: "carlos@x.com", role: "AGENT" },
  created_at: "2026-11-10T10:00:00.000Z",
  updated_at: "2026-11-11T10:00:00.000Z",
};

const meta = {
  total: 1,
  lastPage: 1,
  currentPage: 1,
  perPage: 10,
  prev: null,
  next: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("TicketsTableBody", () => {
  it("carrega e exibe os tickets retornados pela API", async () => {
    vi.mocked(getTickets).mockResolvedValue({ data: [apiTicket], meta });

    render(<TicketsTableBody />);

    expect(await screen.findByText("Erro ao acessar o sistema")).toBeInTheDocument();
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("Maria Souza")).toBeInTheDocument();
    expect(screen.getAllByText("Carlos").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Aberto").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Alta").length).toBeGreaterThan(0);
    expect(screen.getByRole("status")).toHaveTextContent("1 chamado encontrado");
  });

  it("exibe estado de erro com opção de tentar novamente", async () => {
    vi.mocked(getTickets).mockRejectedValue(new Error("Falha de rede"));

    render(<TicketsTableBody />);

    expect(
      await screen.findByText("Não foi possível carregar os chamados"),
    ).toBeInTheDocument();
    expect(screen.getByText("Falha de rede")).toBeInTheDocument();

    vi.mocked(getTickets).mockResolvedValue({ data: [apiTicket], meta });
    fireEvent.click(screen.getByRole("button", { name: /tentar novamente/i }));
    expect(await screen.findByText("Erro ao acessar o sistema")).toBeInTheDocument();
  });

  it("redireciona para /login quando a API responde 401", async () => {
    vi.mocked(getTickets).mockRejectedValue(new TicketsRequestError("expirado", 401));

    render(<TicketsTableBody />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login");
    });
  });

  it("filtra os tickets pela busca", async () => {
    vi.mocked(getTickets).mockResolvedValue({
      data: [apiTicket, { ...apiTicket, id: "2", title: "Dúvida de senha" }],
      meta: { ...meta, total: 2 },
    });

    render(<TicketsTableBody />);
    await screen.findByText("Erro ao acessar o sistema");
    await screen.findByText("Dúvida de senha");

    fireEvent.change(screen.getByPlaceholderText(/buscar por id/i), {
      target: { value: "senha" },
    });

    expect(screen.queryByText("Erro ao acessar o sistema")).not.toBeInTheDocument();
    expect(screen.getByText("Dúvida de senha")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("1 chamado encontrado");
  });
});
