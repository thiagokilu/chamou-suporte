import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TicketTableHeader } from "./TicketTableHeader";

describe("TicketTableHeader", () => {
  it("envia a coluna correta ao selecionar uma ordenação", () => {
    const onSort = vi.fn();
    render(<table><TicketTableHeader sort="created" desc={false} onSort={onSort} /></table>);
    fireEvent.click(screen.getByRole("button", { name: /prioridade/i }));
    expect(onSort).toHaveBeenCalledWith("priority");
  });

  it("apresenta a direção da ordenação ativa", () => {
    const { container } = render(<table><TicketTableHeader sort="created" desc={true} onSort={vi.fn()} /></table>);
    expect(container.querySelector("th:nth-child(7) button svg")).toBeInTheDocument();
  });
});
