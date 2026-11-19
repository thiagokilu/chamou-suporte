import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { submitMock, formState } = vi.hoisted(() => ({
  submitMock: vi.fn(),
  formState: { succeeded: false, submitting: false, errors: null as unknown },
}));
vi.mock("@formspree/react", () => ({ useForm: () => [formState, submitMock] }));

import DemoRequestSection from "./DemoRequestSection";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  formState.succeeded = false;
  formState.submitting = false;
  formState.errors = null;
});

function fillForm() {
  fireEvent.change(screen.getByLabelText(/nome completo/i), {
    target: { value: "Ana Souza" },
  });
  fireEvent.change(screen.getByLabelText(/e-mail/i), {
    target: { value: "ana@example.com" },
  });
  fireEvent.change(screen.getByLabelText(/empresa ou organização/i), {
    target: { value: "Empresa" },
  });
  fireEvent.change(screen.getByLabelText(/cargo ou departamento/i), {
    target: { value: "Suporte" },
  });
  fireEvent.change(screen.getByLabelText(/perfil/i), {
    target: { value: "Gestor" },
  });
  fireEvent.click(screen.getByRole("checkbox"));
}

describe("DemoRequestSection", () => {
  it("valida campos obrigatórios antes de enviar", async () => {
    render(<DemoRequestSection />);
    fireEvent.click(
      screen.getByRole("button", { name: /solicitar demonstração/i }),
    );
    expect(
      await screen.findByText("Informe seu nome completo."),
    ).toBeInTheDocument();
    expect(submitMock).not.toHaveBeenCalled();
  });

  it("envia os dados autorizados ao Formspree", async () => {
    render(<DemoRequestSection />);
    fillForm();
    fireEvent.click(
      screen.getByRole("button", { name: /solicitar demonstração/i }),
    );
    await waitFor(() =>
      expect(submitMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Ana Souza",
          email: "ana@example.com",
          organization: "Empresa",
          department: "Suporte",
          profile: "Gestor",
          consent: "Autorizado",
        }),
      ),
    );
  });

  it("exibe confirmação e avança a etapa após o sucesso", () => {
    formState.succeeded = true;
    render(<DemoRequestSection />);
    expect(screen.getByRole("status")).toHaveTextContent(
      /solicitação enviada com sucesso/i,
    );
    expect(
      screen.getByText(/nossa equipe entra em contato/i).closest("li"),
    ).toHaveAttribute("aria-current", "step");
  });
});
