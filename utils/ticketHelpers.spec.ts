import { describe, expect, it } from "vitest";
import {
  formatDate,
  getAvatarColor,
  getInitials,
  getPrioridadeColor,
  getStatusColor,
  getStatusDot,
} from "./ticketHelpers";

describe("getStatusColor", () => {
  it("retorna classes específicas para cada status conhecido", () => {
    expect(getStatusColor("Aberto")).toContain("sky-100");
    expect(getStatusColor("Em andamento")).toContain("sky-100");
    expect(getStatusColor("Aguardando cliente")).toContain("amber-100");
    expect(getStatusColor("Resolvido")).toContain("emerald-100");
    expect(getStatusColor("Fechado")).toContain("#F2F6F3");
  });

  it("retorna classes neutras para status desconhecido", () => {
    expect(getStatusColor("Desconhecido")).toBe(getStatusColor("Fechado"));
  });
});

describe("getStatusDot", () => {
  it("retorna a cor do indicador para cada status", () => {
    expect(getStatusDot("Aberto")).toBe("bg-blue-400");
    expect(getStatusDot("Em andamento")).toBe("bg-blue-400");
    expect(getStatusDot("Aguardando cliente")).toBe("bg-amber-400");
    expect(getStatusDot("Resolvido")).toBe("bg-emerald-400");
    expect(getStatusDot("Fechado")).toBe("bg-zinc-500");
    expect(getStatusDot("Outro")).toBe("bg-zinc-500");
  });
});

describe("getPrioridadeColor", () => {
  it("retorna classes específicas para cada prioridade", () => {
    expect(getPrioridadeColor("Urgente")).toContain("rose-100");
    expect(getPrioridadeColor("Alta")).toContain("rose-100");
    expect(getPrioridadeColor("Média")).toContain("amber-100");
    expect(getPrioridadeColor("Baixa")).toContain("emerald-100");
    expect(getPrioridadeColor("Desconhecida")).toContain("#F2F6F3");
  });
});

describe("formatDate", () => {
  it("formata a data no padrão pt-BR", () => {
    expect(formatDate("2026-10-29T10:30:00")).toBe("29/10/2026");
  });
});

describe("getInitials", () => {
  it("retorna as iniciais dos dois primeiros nomes", () => {
    expect(getInitials("João Silva")).toBe("JS");
    expect(getInitials("Maria de Souza")).toBe("MD");
    expect(getInitials("Madonna")).toBe("M");
    expect(getInitials("")).toBe("");
  });
});

describe("getAvatarColor", () => {
  it("retorna uma cor da paleta de forma determinística", () => {
    const color = getAvatarColor("João Silva");
    expect(color).toMatch(
      /^bg-(violet|blue|emerald|rose|amber|cyan|pink|indigo)-700$/,
    );
    expect(getAvatarColor("João Silva")).toBe(color);
  });
});
