import { beforeEach, describe, expect, it } from "vitest";
import {
  clearStoredUser,
  enterDemoMode,
  getStoredToken,
  getStoredUser,
  isAdmin,
  isAgent,
  isClient,
  isDemoMode,
  setStoredToken,
  setStoredUser,
} from "./auth";

const validUser = {
  id: "1",
  name: "Ana Souza",
  email: "ana@empresa.com",
  role: "ADMIN" as const,
};

beforeEach(() => {
  localStorage.clear();
  setStoredToken(null);
});

describe("token", () => {
  it("salva e lê o token do cookie", () => {
    setStoredToken("abc123");
    expect(getStoredToken()).toBe("abc123");
  });

  it("retorna null quando não há token", () => {
    expect(getStoredToken()).toBeNull();
  });
});

describe("modo demo", () => {
  it("isDemoMode é true apenas com o token de demonstração", () => {
    expect(isDemoMode()).toBe(false);
    enterDemoMode();
    expect(getStoredToken()).toBe("demo-token");
    expect(isDemoMode()).toBe(true);
  });
});

describe("getStoredUser", () => {
  it("retorna null quando não há usuário salvo", () => {
    expect(getStoredUser()).toBeNull();
  });

  it("retorna o usuário válido salvo", () => {
    setStoredUser(validUser);
    expect(getStoredUser()).toEqual(validUser);
  });

  it("normaliza o role para maiúsculas", () => {
    localStorage.setItem(
      "tickets_user",
      JSON.stringify({ ...validUser, role: "agent" }),
    );
    expect(getStoredUser()?.role).toBe("AGENT");
  });

  it("aceita username como nome e descarta se igual ao email", () => {
    localStorage.setItem(
      "tickets_user",
      JSON.stringify({ id: "2", username: "Beto", email: "b@x.com", role: "CLIENT" }),
    );
    expect(getStoredUser()?.name).toBe("Beto");
  });

  it("retorna null e limpa o storage quando o JSON é inválido", () => {
    localStorage.setItem("tickets_user", "{invalid");
    expect(getStoredUser()).toBeNull();
    expect(localStorage.getItem("tickets_user")).toBeNull();
  });

  it("retorna null para usuário sem campos obrigatórios", () => {
    localStorage.setItem("tickets_user", JSON.stringify({ id: "3" }));
    expect(getStoredUser()).toBeNull();
  });
});

describe("clearStoredUser", () => {
  it("remove usuário e token", () => {
    setStoredUser(validUser);
    setStoredToken("token-xyz");
    clearStoredUser();
    expect(getStoredUser()).toBeNull();
    expect(getStoredToken()).toBeNull();
  });
});

describe("verificação de role", () => {
  it("isAdmin/isAgent/isClient refletem o role do usuário", () => {
    expect(isAdmin(validUser)).toBe(true);
    expect(isAgent(validUser)).toBe(false);
    expect(isClient(validUser)).toBe(false);
    expect(isAdmin(null)).toBe(false);
    expect(isAgent({ ...validUser, role: "AGENT" })).toBe(true);
    expect(isClient({ ...validUser, role: "CLIENT" })).toBe(true);
  });
});
