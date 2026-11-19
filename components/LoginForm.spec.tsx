import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));

vi.mock("@/lib/http/auth/login", () => ({ login: vi.fn() }));
vi.mock("@/lib/http/auth/me", () => ({ getMe: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

import { login } from "@/lib/http/auth/login";
import { getMe } from "@/lib/http/auth/me";
import LoginForm from "./LoginForm";

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

function fillAndSubmit(email: string, password: string) {
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/^senha/i), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: /entrar/i }));
}

describe("LoginForm", () => {
  // 1 and 2: your existing tests stay here...

  it("should call login with the form data and redirect on success", async () => {
    vi.mocked(login).mockResolvedValue({ token: "test-token" } as never);
    vi.mocked(getMe).mockResolvedValue({ id: "client-1", name: "Cliente", email: "user@email.com", role: "CLIENT" } as never);

    render(<LoginForm />);
    fillAndSubmit("user@email.com", "123456");

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith("user@email.com", "123456");
    });
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/client");
    });
  });

  it("should show an error and not redirect when login fails", async () => {
    vi.mocked(login).mockRejectedValue(new Error("Credenciais inválidas"));

    render(<LoginForm />);
    fillAndSubmit("user@email.com", "wrongpassword");

    expect(await screen.findByText(/credenciais inválidas|erro/i)).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
