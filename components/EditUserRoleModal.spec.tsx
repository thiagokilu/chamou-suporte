import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/http/auth/updateRole", () => ({ updateRole: vi.fn() }));

import { updateRole } from "@/lib/http/auth/updateRole";
import type { ApiUser } from "@/lib/http/auth/getUsers";
import EditUserRoleModal from "./EditUserRoleModal";

const user: ApiUser = {
  id: "u1",
  username: "maria",
  email: "maria@empresa.com",
  role: "CLIENT",
  is_active: true,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const props = {
  onClose: vi.fn(),
  onSaved: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("EditUserRoleModal", () => {
  it("renderiza os dados do usuário e o role atual", () => {
    render(<EditUserRoleModal user={user} {...props} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Usuário")).toHaveValue("maria");
    expect(screen.getByLabelText(/e-mail/i)).toHaveValue("maria@empresa.com");
    expect(screen.getByLabelText(/perfil/i)).toHaveValue("CLIENT");
  });

  it("chama updateRole com o novo role e notifica onSaved", async () => {
    vi.mocked(updateRole).mockResolvedValue({} as never);

    render(<EditUserRoleModal user={user} {...props} />);
    fireEvent.change(screen.getByLabelText(/perfil/i), {
      target: { value: "AGENT" },
    });
    fireEvent.click(screen.getByRole("button", { name: /salvar alterações/i }));

    await waitFor(() => {
      expect(updateRole).toHaveBeenCalledWith("u1", "AGENT");
    });
    await waitFor(() => {
      expect(props.onSaved).toHaveBeenCalledWith({ ...user, role: "AGENT" });
    });
  });

  it("exibe erro quando a atualização falha", async () => {
    vi.mocked(updateRole).mockRejectedValue(new Error("Sem permissão."));

    render(<EditUserRoleModal user={user} {...props} />);
    fireEvent.click(screen.getByRole("button", { name: /salvar alterações/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Sem permissão.",
    );
    expect(props.onSaved).not.toHaveBeenCalled();
  });

  it("fecha pelos botões de cancelar e de fechar", () => {
    render(<EditUserRoleModal user={user} {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(props.onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /^fechar$/i }));
    expect(props.onClose).toHaveBeenCalledTimes(2);
  });
});
