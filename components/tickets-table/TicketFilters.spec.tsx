import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TicketFilters } from "./TicketFilters";

function renderFilters(overrides: Record<string, unknown> = {}) {
  const props = {
    searchTerm: "",
    statusFilter: "Todos",
    prioridadeFilter: "Todas",
    agenteFilter: "Todos",
    dataInicio: "",
    dataFim: "",
    onSearchChange: vi.fn(),
    onStatusChange: vi.fn(),
    onPrioridadeChange: vi.fn(),
    onAgenteChange: vi.fn(),
    onDataInicioChange: vi.fn(),
    onDataFimChange: vi.fn(),
    onClearFilters: vi.fn(),
    filteredCount: 2,
    hasActiveFilters: false,
    agentes: ["Todos", "Ana"],
    ...overrides,
  };
  render(<TicketFilters {...props} />);
  return props;
}

afterEach(cleanup);

describe("TicketFilters", () => {
  it("notifica busca e remoção do chip de status", () => {
    const props = renderFilters({ statusFilter: "Aberto" });
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "servidor" },
    });
    expect(props.onSearchChange).toHaveBeenCalledWith("servidor");
    fireEvent.click(
      screen.getByRole("button", { name: /remover filtro status: aberto/i }),
    );
    expect(props.onStatusChange).toHaveBeenCalledWith("Todos");
  });

  it("aplica o preset de últimos 7 dias", () => {
    const props = renderFilters();
    fireEvent.click(screen.getByRole("button", { name: /agente e período/i }));
    fireEvent.click(screen.getByRole("button", { name: "Últimos 7 dias" }));
    expect(props.onDataInicioChange).toHaveBeenCalledWith(
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    );
    expect(props.onDataFimChange).toHaveBeenCalledWith(
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    );
  });

  it("usa / para focar a busca fora de campos de texto", () => {
    renderFilters();
    fireEvent.keyDown(window, { key: "/" });
    expect(screen.getByRole("searchbox")).toHaveFocus();
  });
});
