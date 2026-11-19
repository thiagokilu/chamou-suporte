import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TicketTablePagination } from "./TicketTablePagination";

afterEach(() => {
  cleanup();
});

function renderPagination(overrides = {}) {
  const props = {
    pageSize: 10,
    currentPage: 2,
    totalPages: 5,
    onPageSizeChange: vi.fn(),
    onPageChange: vi.fn(),
    ...overrides,
  };
  render(<TicketTablePagination {...props} />);
  return props;
}

describe("TicketTablePagination", () => {
  it("exibe a página atual e o total", () => {
    renderPagination();
    expect(screen.getByText("Página")).toBeInTheDocument();
    expect(screen.getByText("2 de 5")).toBeInTheDocument();
  });

  it("navega para a página anterior e seguinte", () => {
    const props = renderPagination();

    fireEvent.click(screen.getByRole("button", { name: /página anterior/i }));
    expect(props.onPageChange).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByRole("button", { name: /próxima página/i }));
    expect(props.onPageChange).toHaveBeenCalledWith(3);
  });

  it("desabilita anterior na primeira página e próxima na última", () => {
    renderPagination({ currentPage: 1 });
    expect(screen.getByRole("button", { name: /página anterior/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /próxima página/i })).toBeEnabled();
    cleanup();

    renderPagination({ currentPage: 5 });
    expect(screen.getByRole("button", { name: /página anterior/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /próxima página/i })).toBeDisabled();
  });

  it("notifica a mudança de itens por página", () => {
    const props = renderPagination();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "25" } });
    expect(props.onPageSizeChange).toHaveBeenCalledWith(25);
  });
});
