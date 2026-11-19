import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TicketTableRow } from "./TicketTableRow";
import type { Ticket } from "./TicketTableTypes";

const ticket: Ticket = {
  id: "42", subject: "Acesso ao sistema", requester: { name: "Ana", initials: "A", tone: "teal" },
  agent: null, status: "Aberto", priority: "Urgente", createdAt: "19/11/2026", updatedAt: "19/11/2026",
};

afterEach(cleanup);

describe("TicketTableRow", () => {
  it("seleciona o chamado por clique ou tecla Enter", () => {
    const onSelect = vi.fn();
    render(<table><tbody><TicketTableRow ticket={ticket} onSelect={onSelect} /></tbody></table>);
    const row = screen.getByText("Acesso ao sistema").closest("tr")!;
    fireEvent.click(row);
    fireEvent.keyDown(row, { key: "Enter" });
    expect(onSelect).toHaveBeenNthCalledWith(1, ticket);
    expect(onSelect).toHaveBeenNthCalledWith(2, ticket);
  });

  it("botão de detalhes seleciona sem propagar o clique para a linha", () => {
    const onSelect = vi.fn();
    render(<table><tbody><TicketTableRow ticket={ticket} onSelect={onSelect} /></tbody></table>);
    fireEvent.click(screen.getByRole("button", { name: /ver detalhes do chamado 42/i }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(ticket);
  });
});
