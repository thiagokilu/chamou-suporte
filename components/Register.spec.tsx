import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { warningMock } = vi.hoisted(() => ({ warningMock: vi.fn() }));
vi.mock("sonner", () => ({ toast: { warning: warningMock } }));
vi.mock("next/image", () => ({ default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} /> }));
vi.mock("next/link", () => ({ default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a> }));

import RegisterForm from "./RegisterForm";

const submitSpy = vi.fn();
let submittedFieldNames: string[] = [];
beforeEach(() => {
  vi.clearAllMocks();
  submittedFieldNames = [];
  vi.spyOn(HTMLFormElement.prototype, "submit").mockImplementation(function (this: HTMLFormElement) {
    submittedFieldNames = Array.from(this.elements)
      .filter((element): element is HTMLInputElement => element instanceof HTMLInputElement)
      .map((element) => element.name);
    submitSpy();
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("RegisterForm", () => {
  it("avisa sobre a inicialização da API ao abrir o cadastro", () => {
    render(<RegisterForm />);
    expect(warningMock).toHaveBeenCalledWith(expect.stringMatching(/api no Render/i), expect.objectContaining({ id: "render-api-warning" }));
  });

  it("valida dados e impede envio quando as senhas não coincidem", async () => {
    render(<RegisterForm />);
    fireEvent.change(screen.getByLabelText(/nome completo/i), { target: { value: "Ana Souza" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "ana@example.com" } });
    fireEvent.change(screen.getByLabelText(/^senha$/i), { target: { value: "123456" } });
    fireEvent.change(screen.getByLabelText(/confirme sua senha/i), { target: { value: "654321" } });
    fireEvent.click(screen.getByRole("button", { name: /criar conta/i }));
    expect(await screen.findByText(/as senhas não coincidem/i)).toBeInTheDocument();
    expect(submitSpy).not.toHaveBeenCalled();
  });

  it("remove campos de senha antes de submeter o formulário", async () => {
    render(<RegisterForm />);
    fireEvent.change(screen.getByLabelText(/nome completo/i), { target: { value: "Ana Souza" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "ana@example.com" } });
    fireEvent.change(screen.getByLabelText(/^senha$/i), { target: { value: "123456" } });
    fireEvent.change(screen.getByLabelText(/confirme sua senha/i), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /criar conta/i }));
    await waitFor(() => expect(submitSpy).toHaveBeenCalled());
    expect(submittedFieldNames).not.toContain("password");
    expect(submittedFieldNames).not.toContain("confirmPassword");
  });
});
