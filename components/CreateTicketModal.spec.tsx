import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/http/tickets/createTicket", () => ({ createTicket: vi.fn() }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { createTicket } from "@/lib/http/tickets/createTicket";
import { CreateTicketModal } from "./CreateTicketModal";

const props = {
  onClose: vi.fn(),
  onCreated: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

function fillForm(
  title = "Erro ao acessar",
  description = "Não consigo entrar",
) {
  fireEvent.change(screen.getByLabelText(/assunto/i), {
    target: { value: title },
  });
  fireEvent.change(screen.getByLabelText(/descrição/i), {
    target: { value: description },
  });
}

describe("CreateTicketModal", () => {
  it("não renderiza nada quando fechado", () => {
    const { container } = render(<CreateTicketModal open={false} {...props} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renderiza o formulário quando aberto", () => {
    render(<CreateTicketModal open {...props} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Novo chamado")).toBeInTheDocument();
  });

  it("exibe erros de validação quando campos obrigatórios estão vazios", async () => {
    render(<CreateTicketModal open {...props} />);
    fireEvent.click(screen.getByRole("button", { name: /criar chamado/i }));

    expect(await screen.findByText("Informe o assunto.")).toBeInTheDocument();
    expect(screen.getByText("Informe a descrição.")).toBeInTheDocument();
    expect(createTicket).not.toHaveBeenCalled();
  });

  it("chama createTicket com os dados do formulário e notifica sucesso", async () => {
    vi.mocked(createTicket).mockResolvedValue({} as never);

    render(<CreateTicketModal open {...props} />);
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: /criar chamado/i }));

    await waitFor(() => {
      expect(createTicket).toHaveBeenCalledWith({
        title: "Erro ao acessar",
        description: "Não consigo entrar",
        category_id: 1,
        attachments: [],
      });
    });
    await waitFor(() => {
      expect(props.onCreated).toHaveBeenCalled();
    });
  });

  it("exibe mensagem de erro quando a criação falha", async () => {
    vi.mocked(createTicket).mockRejectedValue(new Error("Falha no servidor"));

    render(<CreateTicketModal open {...props} />);
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: /criar chamado/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Falha no servidor",
    );
    expect(props.onCreated).not.toHaveBeenCalled();
  });

  it("fecha com Escape e com o botão de fechar", () => {
    render(<CreateTicketModal open {...props} />);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(props.onClose).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /fechar modal/i }));
    expect(props.onClose).toHaveBeenCalledTimes(2);
  });

  it("ignora arquivos acima de 5 MB e avisa o usuário", async () => {
    render(<CreateTicketModal open {...props} />);

    const bigFile = new File(["x".repeat(6 * 1024 * 1024)], "grande.pdf", {
      type: "application/pdf",
    });
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [bigFile] } });

    expect(
      await screen.findByText(/passam de 5 MB e foram ignorados/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/grande\.pdf/)).not.toBeInTheDocument();
  });
});
