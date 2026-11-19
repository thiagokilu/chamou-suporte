import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/http/tickets/updateTicket", () => ({ updateTicket: vi.fn() }));

import { updateTicket } from "@/lib/http/tickets/updateTicket";
import { UpdateTicketModal, type TicketForEdit } from "./UpdateTicketModal";

const ticket: TicketForEdit = {
  id: "42",
  title: "Erro ao acessar o sistema",
  status: "Aberto",
  priority: "Alta",
};

const props = {
  onClose: vi.fn(),
  onUpdated: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("UpdateTicketModal", () => {
  it("não renderiza nada quando ticket é null", () => {
    const { container } = render(
      <UpdateTicketModal ticket={null} {...props} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("pré-preenche os campos a partir do ticket", () => {
    render(<UpdateTicketModal ticket={ticket} {...props} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("#42")).toBeInTheDocument();
    expect(screen.getByLabelText(/assunto/i)).toHaveValue(
      "Erro ao acessar o sistema",
    );
    expect(screen.getByLabelText(/status/i)).toHaveValue("OPEN");
    expect(screen.getByLabelText(/prioridade/i)).toHaveValue("HIGH");
  });

  it("chama updateTicket com o payload convertido para a API", async () => {
    vi.mocked(updateTicket).mockResolvedValue({} as never);

    render(<UpdateTicketModal ticket={ticket} {...props} />);
    fireEvent.change(screen.getByLabelText(/descrição/i), {
      target: { value: "Atualização importante" },
    });
    fireEvent.click(screen.getByRole("button", { name: /salvar alterações/i }));

    await waitFor(() => {
      expect(updateTicket).toHaveBeenCalledWith("42", {
        title: "Erro ao acessar o sistema",
        description: "Atualização importante",
        status: "OPEN",
        priority: "HIGH",
      });
    });
    await waitFor(() => {
      expect(props.onUpdated).toHaveBeenCalled();
    });
  });

  it("omite a descrição quando o campo está vazio", async () => {
    vi.mocked(updateTicket).mockResolvedValue({} as never);

    render(<UpdateTicketModal ticket={ticket} {...props} />);
    fireEvent.click(screen.getByRole("button", { name: /salvar alterações/i }));

    await waitFor(() => {
      expect(updateTicket).toHaveBeenCalledWith(
        "42",
        expect.objectContaining({ description: undefined }),
      );
    });
  });

  it("exibe erro quando a atualização falha", async () => {
    vi.mocked(updateTicket).mockRejectedValue(
      new Error("Chamado não encontrado."),
    );

    render(<UpdateTicketModal ticket={ticket} {...props} />);
    fireEvent.click(screen.getByRole("button", { name: /salvar alterações/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Chamado não encontrado.",
    );
    expect(props.onUpdated).not.toHaveBeenCalled();
  });

  it("exige o assunto", async () => {
    render(<UpdateTicketModal ticket={ticket} {...props} />);
    fireEvent.change(screen.getByLabelText(/assunto/i), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: /salvar alterações/i }));

    expect(await screen.findByText("Informe o assunto.")).toBeInTheDocument();
    expect(updateTicket).not.toHaveBeenCalled();
  });

  it("oculta status e prioridade quando isClient é true", () => {
    render(<UpdateTicketModal ticket={ticket} {...props} isClient />);

    expect(screen.queryByLabelText(/status/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/prioridade/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/assunto/i)).toBeInTheDocument();
  });

  it("fecha com Escape e com o botão de fechar", () => {
    render(<UpdateTicketModal ticket={ticket} {...props} />);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(props.onClose).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /fechar modal/i }));
    expect(props.onClose).toHaveBeenCalledTimes(2);
  });
});
