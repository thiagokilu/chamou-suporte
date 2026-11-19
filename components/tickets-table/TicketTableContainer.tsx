import TicketsTableBody from "./TicketTableBody";
import { Ticket } from "@/lib/tickets";

interface TicketTableContainerProps {
  tickets: Ticket[];
}

export function TicketTableContainer({ tickets }: TicketTableContainerProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 shadow-sm">
      <div className="p-6">
        <div className="overflow-x-auto">
          <TicketsTableBody />
        </div>
      </div>
    </div>
  );
}
