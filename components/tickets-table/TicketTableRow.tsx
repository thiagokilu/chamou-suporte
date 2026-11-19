import { FiMoreHorizontal } from "react-icons/fi";
import type { PersonInfo, Ticket } from "./TicketTableTypes";

const statusStyle: Record<Ticket["status"], string> = {
  Aberto: "bg-sky-100 text-sky-900 ring-sky-200",
  "Em andamento": "bg-sky-100 text-sky-900 ring-sky-200",
  "Aguardando resposta": "bg-amber-100 text-amber-900 ring-amber-200",
  Resolvido: "bg-emerald-100 text-emerald-900 ring-emerald-200",
  Fechado: "bg-[#F2F6F3] text-[#4B5E54] ring-[#D8E1DA]",
};

const priorityStyle: Record<Ticket["priority"], string> = {
  Baixa: "bg-emerald-100 text-emerald-900",
  Média: "bg-amber-100 text-amber-900",
  Alta: "bg-rose-100 text-rose-900",
  Urgente: "bg-rose-100 text-rose-900",
};

const toneStyle: Record<PersonInfo["tone"], string> = {
  teal: "bg-[#DDF3E4] text-[#0F3D2A]",
  violet: "bg-[#F2F6F3] text-[#4B5E54]",
};

function Person({ person }: { person: PersonInfo }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${toneStyle[person.tone]}`}
      >
        {person.initials}
      </span>
      <span className="max-w-28 truncate text-sm text-[#3F5248]">
        {person.name}
      </span>
    </div>
  );
}

export function TicketTableRow({
  ticket,
  onSelect,
}: {
  ticket: Ticket;
  onSelect: (ticket: Ticket) => void;
}) {
  return (
    <tr
      tabIndex={0}
      onClick={() => onSelect(ticket)}
      onKeyDown={(event) => {
        if (event.key === "Enter") onSelect(ticket);
      }}
      className={`group cursor-pointer bg-white outline-none transition-colors hover:bg-[#F2F6F3] focus-visible:bg-[#F2F6F3] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#15803D] motion-reduce:transition-none ${
        ticket.priority === "Urgente"
          ? "border-l-2 border-l-rose-500"
          : "border-l-2 border-l-transparent"
      }`}
    >
      <td className="px-6 py-[17px] text-sm font-medium tabular-nums text-[#4B5E54]">
        #{ticket.id}
      </td>
      <td className="px-3 py-[17px]">
        <div className="max-w-[270px] truncate text-sm font-semibold text-[#10241A]">
          {ticket.subject}
        </div>
      </td>
      <td className="px-3 py-[17px]">
        <Person person={ticket.requester} />
      </td>
      <td className="px-3 py-[17px]">
        {ticket.agent ? (
          <Person person={ticket.agent} />
        ) : (
          <span className="text-sm text-[#4B5E54]">Não atribuído</span>
        )}
      </td>
      <td className="px-3 py-[17px]">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyle[ticket.status] ?? statusStyle.Fechado}`}
        >
          {ticket.status}
        </span>
      </td>
      <td className="px-3 py-[17px]">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyle[ticket.priority] ?? "bg-[#F2F6F3] text-[#4B5E54]"}`}
        >
          {ticket.priority}
        </span>
      </td>
      <td className="px-3 py-[17px] text-sm text-[#4B5E54]">
        {ticket.createdAt}
      </td>
      <td className="px-3 py-[17px] text-sm text-[#4B5E54]">
        {ticket.updatedAt}
      </td>
      <td className="px-3 py-[17px] text-right">
        <button
          aria-label={`Ver detalhes do chamado ${ticket.id}`}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(ticket);
          }}
          className="rounded-lg p-1.5 text-[#4B5E54] transition-colors hover:bg-[#DDF3E4] hover:text-[#0F3D2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] motion-reduce:transition-none"
        >
          <FiMoreHorizontal />
        </button>
      </td>
    </tr>
  );
}
