"use client";

import { useRouter } from "next/navigation";
import {
  getStatusColor,
  getStatusDot,
  getPrioridadeColor,
  formatDate,
  getInitials,
  getAvatarColor,
} from "@/utils/ticketHelpers";
import { Ticket } from "@/lib/tickets";

interface TicketRowProps {
  ticket: Ticket;
}

function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const initials = getInitials(name);
  const colorClass = getAvatarColor(name);
  const sizeClass = size === "sm" ? "h-7 w-7 text-xs" : "h-8 w-8 text-sm";
  return (
    <div
      className={`${sizeClass} ${colorClass} flex shrink-0 items-center justify-center rounded-full font-semibold text-white`}
    >
      {initials}
    </div>
  );
}

export function TicketRow({ ticket }: TicketRowProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/chamado/${ticket.id}`);
  };

  const dataAtualizacao = ticket.dataAtualizacao || ticket.dataCriacao;

  return (
    <tr
      onClick={handleClick}
      className="cursor-pointer transition-colors duration-150 hover:bg-zinc-800/60"
    >
      {/* ID */}
      <td className="px-4 py-3.5">
        <span className="font-mono text-xs font-medium text-zinc-500">
          #{ticket.id}
        </span>
      </td>

      {/* Assunto */}
      <td className="max-w-[260px] px-4 py-3.5">
        <div className="font-medium text-zinc-50 leading-snug">{ticket.titulo}</div>
        <div className="mt-0.5 truncate text-xs text-zinc-500">{ticket.descricao}</div>
      </td>

      {/* Cliente */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <Avatar name={ticket.cliente} />
          <span className="text-sm text-zinc-300">{ticket.cliente}</span>
        </div>
      </td>

      {/* Agente */}
      <td className="px-4 py-3.5">
        {ticket.agente ? (
          <div className="flex items-center gap-2.5">
            <Avatar name={ticket.agente} />
            <span className="text-sm text-zinc-300">{ticket.agente}</span>
          </div>
        ) : (
          <span className="text-sm italic text-zinc-600">Não atribuído</span>
        )}
      </td>

      {/* Prioridade */}
      <td className="px-4 py-3.5">
        <span
          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getPrioridadeColor(
            ticket.prioridade
          )}`}
        >
          {ticket.prioridade}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-3.5">
        <span
          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${getStatusColor(
            ticket.status
          )}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(ticket.status)}`} />
          {ticket.status}
        </span>
      </td>

      {/* Criado em */}
      <td className="whitespace-nowrap px-4 py-3.5 text-sm text-zinc-400">
        {formatDate(ticket.dataCriacao)}
      </td>

      {/* Atualizado em */}
      <td className="whitespace-nowrap px-4 py-3.5 text-sm text-zinc-400">
        {formatDate(dataAtualizacao)}
      </td>
    </tr>
  );
}
