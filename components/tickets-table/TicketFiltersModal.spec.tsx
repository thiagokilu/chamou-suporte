import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TicketFiltersModal } from "./TicketFiltersModal";

function props(isOpen: boolean, onClose = vi.fn()) {
  return {
    isOpen, onClose, searchTerm: "", statusFilter: "Todos", prioridadeFilter: "Todas", agenteFilter: "Todos",
    dataInicio: "", dataFim: "", onSearchChange: vi.fn(), onStatusChange: vi.fn(), onPrioridadeChange: vi.fn(),
    onAgenteChange: vi.fn(), onDataInicioChange: vi.fn(), onDataFimChange: vi.fn(), onClearFilters: vi.fn(),
    filteredCount: 0, hasActiveFilters: false, agentes: ["Todos"],
  };
}

describe("TicketFiltersModal", () => {
  it("não renderiza quando fechado", () => {
    render(<TicketFiltersModal {...props(false)} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("fecha pelo botão e pelo backdrop", () => {
    const onClose = vi.fn();
    const { container } = render(<TicketFiltersModal {...props(true, onClose)} />);
    expect(screen.getByRole("dialog", { name: /filtros e pesquisa/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /fechar modal/i }));
    fireEvent.click(container.querySelector('[aria-hidden="true"]')!);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
