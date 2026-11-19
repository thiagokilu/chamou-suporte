import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = vi.hoisted(() => ({
  get: vi.fn(),
}));

const redirectMock = vi.hoisted(() =>
  vi.fn((url: string): never => {
    throw new Error(`REDIRECT:${url}`);
  }),
);

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

import { requireRole } from "./require-role";

function mockCookie(token?: string) {
  cookieStore.get.mockReturnValue(token ? { value: token } : undefined);
}

function mockMeResponse(role: string, ok = true) {
  fetchMock.mockResolvedValue({
    ok,
    json: async () => ({ id: "u1", role }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("requireRole", () => {
  it("redireciona para /login quando não há token", async () => {
    mockCookie();
    await expect(requireRole(["admin"])).rejects.toThrow("REDIRECT:/login");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("retorna usuário demo quando o token é demo e admin é permitido", async () => {
    mockCookie("demo-token");
    const user = await requireRole(["admin"]);
    expect(user).toEqual({
      id: "demo-admin",
      username: "Administrador Demo",
      role: "ADMIN",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("redireciona para /admin quando o token demo não permite a role", async () => {
    mockCookie("demo-token");
    await expect(requireRole(["agent"])).rejects.toThrow("REDIRECT:/admin");
  });

  it("consulta /auth/me e retorna o usuário quando a role é permitida", async () => {
    mockCookie("real-token");
    mockMeResponse("ADMIN");
    const user = await requireRole(["admin"]);
    expect(user).toEqual({ id: "u1", role: "ADMIN" });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/auth/me"),
      expect.objectContaining({
        headers: { Authorization: "Bearer real-token" },
      }),
    );
  });

  it("redireciona para /login quando /auth/me falha", async () => {
    mockCookie("real-token");
    mockMeResponse("ADMIN", false);
    await expect(requireRole(["admin"])).rejects.toThrow("REDIRECT:/login");
  });

  it("redireciona para o dashboard da role quando não permitida", async () => {
    mockCookie("real-token");
    mockMeResponse("client");
    await expect(requireRole(["admin"])).rejects.toThrow("REDIRECT:/client");
  });

  it("redireciona para /login para role desconhecida", async () => {
    mockCookie("real-token");
    mockMeResponse("guest");
    await expect(requireRole(["admin"])).rejects.toThrow("REDIRECT:/login");
  });
});
