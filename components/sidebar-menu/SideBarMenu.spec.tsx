import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AnchorHTMLAttributes, ReactNode } from "react";

const { pathnameMock } = vi.hoisted(() => ({ pathnameMock: vi.fn(() => "/admin") }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { children?: ReactNode }) => (
    <a href={typeof href === "string" ? href : "#"} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt="" />
  ),
}));

vi.mock("next/font/google", () => ({
  Bricolage_Grotesque: () => ({ className: "font-mock" }),
}));

vi.mock("@/lib/http/auth/me", () => ({ getMe: vi.fn() }));
vi.mock("@/lib/http/auth/logout", () => ({ Logout: vi.fn() }));

import { Logout } from "@/lib/http/auth/logout";
import { getStoredUser, setStoredUser } from "@/lib/auth";
import { SideBarMenu } from "./SideBarMenu";

const admin = { id: "a1", name: "Ana Admin", email: "ana@x.com", role: "ADMIN" as const };
const client = { id: "c1", name: "Beto Client", email: "beto@x.com", role: "CLIENT" as const };

beforeEach(() => {
  vi.clearAllMocks();
  pathnameMock.mockReturnValue("/admin");
  localStorage.clear();
  document.cookie = "tickets_token=; Path=/; Max-Age=0";
});

afterEach(() => {
  cleanup();
});

describe("SideBarMenu", () => {
  it("exibe o item Usuários para admin", () => {
    render(<SideBarMenu user={admin} />);
    expect(screen.getByRole("link", { name: /usuários/i })).toBeInTheDocument();
  });

  it("oculta o item Usuários para cliente", () => {
    pathnameMock.mockReturnValue("/client");
    render(<SideBarMenu user={client} />);
    expect(screen.queryByRole("link", { name: /usuários/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /tickets/i })).toBeInTheDocument();
  });

  it("mantém Usuários visível em /admin enquanto o perfil é restaurado", () => {
    render(<SideBarMenu />);
    expect(screen.getByRole("link", { name: /usuários/i })).toBeInTheDocument();
  });

  it("alterna entre recolhido e expandido", () => {
    render(<SideBarMenu user={admin} />);

    const toggle = screen.getByRole("button", { name: /recolher menu/i });
    fireEvent.click(toggle);

    expect(screen.getByRole("button", { name: /expandir menu/i })).toBeInTheDocument();
    expect(localStorage.getItem("chamou:sidebar-collapsed")).toBe("1");

    fireEvent.click(screen.getByRole("button", { name: /expandir menu/i }));
    expect(localStorage.getItem("chamou:sidebar-collapsed")).toBe("0");
  });

  it("abre e fecha o menu mobile", () => {
    render(<SideBarMenu user={admin} />);

    const openButton = screen.getByRole("button", { name: /abrir menu/i });
    fireEvent.click(openButton);
    expect(openButton).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.getByRole("button", { name: /abrir menu/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("faz logout limpando o usuário armazenado", async () => {
    vi.mocked(Logout).mockResolvedValue({ success: true } as never);
    setStoredUser(admin);

    render(<SideBarMenu user={admin} />);
    fireEvent.click(screen.getByRole("button", { name: /^sair$/i }));

    await waitFor(() => {
      expect(Logout).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(getStoredUser()).toBeNull();
    });
  });
});
