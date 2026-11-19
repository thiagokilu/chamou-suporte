import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getMessages, postMessage, socket, ioMock, authMocks } = vi.hoisted(
  () => {
    const socket = {
      connected: false,
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      disconnect: vi.fn(),
    };
    return {
      getMessages: vi.fn(),
      postMessage: vi.fn(),
      socket,
      ioMock: vi.fn(() => socket),
      authMocks: {
        getStoredToken: vi.fn(() => "token"),
        getStoredUser: vi.fn(() => null),
        getUserFromToken: vi.fn(() => null),
        isDemoMode: vi.fn(() => false),
      },
    };
  },
);
vi.mock("socket.io-client", () => ({ io: ioMock }));
vi.mock("@/lib/auth", () => authMocks);
vi.mock("@/lib/http/tickets/chat-ticket", () => ({
  getTicketChatMessages: getMessages,
  PostchatTicket: postMessage,
}));

import TicketChat from "./TicketChat";

beforeEach(() => {
  vi.clearAllMocks();
  authMocks.isDemoMode.mockReturnValue(false);
  authMocks.getStoredToken.mockReturnValue("token");
  getMessages.mockResolvedValue([]);
  postMessage.mockResolvedValue({
    id: "sent-1",
    text: "Oi",
    senderName: "Ana",
    senderId: "me",
  });
  HTMLElement.prototype.scrollIntoView = vi.fn();
});
afterEach(cleanup);

describe("TicketChat", () => {
  it("carrega mensagens históricas e conecta à sala do chamado", async () => {
    getMessages.mockResolvedValue([
      {
        id: "m1",
        text: "Olá",
        senderName: "Suporte",
        timestamp: "2026-11-19T10:00:00Z",
      },
    ]);
    render(<TicketChat ticketId="ticket-7" />);
    expect(await screen.findByText("Olá")).toBeInTheDocument();
    expect(ioMock).toHaveBeenCalledWith(
      expect.stringContaining("/ticket-chat"),
      { auth: { token: "token" } },
    );
    expect(socket.on).toHaveBeenCalledWith("newMessage", expect.any(Function));
  });

  it("envia mensagem e mostra o retorno da API", async () => {
    render(<TicketChat ticketId="ticket-7" />);
    const input = screen.getByPlaceholderText(/digite uma mensagem/i);
    fireEvent.change(input, { target: { value: "  Oi  " } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: false });
    await waitFor(() =>
      expect(postMessage).toHaveBeenCalledWith("ticket-7", "Oi"),
    );
    expect(await screen.findByText("Oi")).toBeInTheDocument();
  });

  it("explica por que o chat não está disponível no modo demonstração", async () => {
    authMocks.isDemoMode.mockReturnValue(true);
    render(<TicketChat ticketId="ticket-7" />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /não está disponível no modo demonstração/i,
    );
    expect(ioMock).not.toHaveBeenCalled();
  });
});
