import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/http/chat", () => ({ PostchatIa: vi.fn() }));

import { PostchatIa } from "@/lib/http/chat";
import ChatModal from "./chat";

beforeEach(() => {
  vi.clearAllMocks();
  // jsdom não implementa scrollTo
  window.HTMLElement.prototype.scrollTo = vi.fn();
});

afterEach(() => {
  cleanup();
});

function openChat() {
  fireEvent.click(screen.getByRole("button", { name: /abrir chat/i }));
}

function sendMessage(text: string) {
  fireEvent.change(screen.getByPlaceholderText(/digite sua mensagem/i), {
    target: { value: text },
  });
  fireEvent.click(screen.getByRole("button", { name: /^enviar$/i }));
}

describe("ChatModal", () => {
  it("abre o chat e mostra a mensagem inicial", () => {
    render(<ChatModal />);
    openChat();

    expect(screen.getByRole("dialog", { name: /chat/i })).toBeInTheDocument();
    expect(screen.getByText("Escreva uma mensagem para começar.")).toBeInTheDocument();
  });

  it("envia a mensagem e exibe a resposta do assistente", async () => {
    vi.mocked(PostchatIa).mockResolvedValue({ reply: "Olá! Como posso ajudar?" } as never);

    render(<ChatModal />);
    openChat();
    sendMessage("Preciso de ajuda");

    await waitFor(() => {
      expect(PostchatIa).toHaveBeenCalledWith("Preciso de ajuda", []);
    });
    expect(await screen.findByText("Olá! Como posso ajudar?")).toBeInTheDocument();
    expect(screen.getByText("Preciso de ajuda")).toBeInTheDocument();
  });

  it("envia o histórico das mensagens anteriores", async () => {
    vi.mocked(PostchatIa)
      .mockResolvedValueOnce({ reply: "Primeira resposta" } as never)
      .mockResolvedValueOnce({ reply: "Segunda resposta" } as never);

    render(<ChatModal />);
    openChat();
    sendMessage("primeira");
    await screen.findByText("Primeira resposta");
    sendMessage("segunda");

    await waitFor(() => {
      expect(PostchatIa).toHaveBeenLastCalledWith("segunda", [
        { role: "user", text: "primeira" },
        { role: "model", text: "Primeira resposta" },
      ]);
    });
  });

  it("exibe erro e permite tentar novamente", async () => {
    vi.mocked(PostchatIa)
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ reply: "Consegui agora" } as never);

    render(<ChatModal />);
    openChat();
    sendMessage("oi");

    expect(await screen.findByText(/sem conexão com o chat/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /tentar de novo/i }));
    expect(await screen.findByText("Consegui agora")).toBeInTheDocument();
    expect(PostchatIa).toHaveBeenCalledTimes(2);
  });

  it("fecha com Escape", () => {
    render(<ChatModal />);
    openChat();
    expect(screen.getByRole("dialog", { name: /chat/i })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: /chat/i })).not.toBeInTheDocument();
  });
});
