"use client";

import { Suspense, use, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getTicketById, type TicketPriority, type TicketStatus } from "@/lib/http/tickets/getTicketById";
import { updateTicket } from "@/lib/http/tickets/updateTicket";
import type { Ticket } from "@/lib/tickets";
import { getStoredUser, isAdmin, isAgent } from "@/lib/auth";
import {
  getStatusColor,
  getStatusDot,
  getPrioridadeColor,
  formatDate,
} from "@/utils/ticketHelpers";
import {
  FiClock,
  FiUser,
  FiHeadphones,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowLeft,
  FiInfo,
  FiX,
} from "react-icons/fi";
import { toast } from "sonner";
import TicketChat from "@/components/ticket-chat/TicketChat";

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusOptions: { label: string; value: TicketStatus }[] = [
  { label: "Aberto", value: "OPEN" },
  { label: "Em andamento", value: "IN_PROGRESS" },
  { label: "Aguardando cliente", value: "WAITING_FOR_CUSTOMER" },
  { label: "Resolvido", value: "RESOLVED" },
  { label: "Fechado", value: "CLOSED" },
];

const priorityOptions: { label: string; value: TicketPriority }[] = [
  { label: "Baixa", value: "LOW" },
  { label: "Média", value: "MEDIUM" },
  { label: "Alta", value: "HIGH" },
  { label: "Urgente", value: "URGENT" },
];

const statusToApi: Record<string, TicketStatus> = {
  "Aberto": "OPEN",
  "Em andamento": "IN_PROGRESS",
  "Aguardando resposta": "WAITING_FOR_CUSTOMER",
  "Aguardando cliente": "WAITING_FOR_CUSTOMER",
  "Resolvido": "RESOLVED",
  "Fechado": "CLOSED",
  "OPEN": "OPEN",
  "IN_PROGRESS": "IN_PROGRESS",
  "WAITING_FOR_CUSTOMER": "WAITING_FOR_CUSTOMER",
  "RESOLVED": "RESOLVED",
  "CLOSED": "CLOSED",
};

const priorityToApi: Record<string, TicketPriority> = {
  "Baixa": "LOW",
  "Média": "MEDIUM",
  "Alta": "HIGH",
  "Urgente": "URGENT",
  "LOW": "LOW",
  "MEDIUM": "MEDIUM",
  "HIGH": "HIGH",
  "URGENT": "URGENT",
};

export default function ChamadoDetailPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[var(--ch-bg)] text-[var(--ch-muted)] text-sm">
          Carregando chamado…
        </div>
      }
    >
      <ChamadoContent params={params} />
    </Suspense>
  );
}

function ChamadoContent({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, startUpdate] = useTransition();
  const [asideOpen, setAsideOpen] = useState(false);
  const currentUser = getStoredUser();
  const canEdit = isAdmin(currentUser) || isAgent(currentUser);

  const loadTicket = () => {
    let active = true;

    getTicketById(id)
      .then((loadedTicket) => {
        if (active) setTicket(loadedTicket);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Não foi possível carregar o chamado.");
        }
      });

    return () => {
      active = false;
    };
  };

  useEffect(loadTicket, [id]);

  const handleStatusChange = (newStatus: TicketStatus) => {
    if (!ticket) return;
    startUpdate(async () => {
      try {
        const updated = await updateTicket(String(ticket.id), { status: newStatus });
        setTicket(updated);
        toast.success("Status atualizado com sucesso!");
      } catch (err) {
        toast.error("Erro ao atualizar status.");
      }
    });
  };

  const handlePriorityChange = (newPriority: TicketPriority) => {
    if (!ticket) return;
    startUpdate(async () => {
      try {
        const updated = await updateTicket(String(ticket.id), { priority: newPriority });
        setTicket(updated);
        toast.success("Prioridade atualizada com sucesso!");
      } catch (err) {
        toast.error("Erro ao atualizar prioridade.");
      }
    });
  };

  /* ── Error state ── */
  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[var(--ch-bg)] px-4">
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-[var(--ch-action)] ring-1 ring-[var(--ch-line)] transition hover:bg-[var(--ch-tint)]"
        >
          <FiArrowLeft className="h-4 w-4" />
          Voltar
        </button>
      </div>
    );
  }

  /* ── Loading state ── */
  if (!ticket) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--ch-bg)] text-[var(--ch-muted)] text-sm">
        Carregando chamado…
      </div>
    );
  }

  const currentStatusVal = statusToApi[ticket.status] ?? "OPEN";
  const currentPriorityVal = priorityToApi[ticket.prioridade] ?? "MEDIUM";
  const statusDot = getStatusDot(ticket.status);
  const isInProgress = ticket.status === "Em andamento" || ticket.status === "IN_PROGRESS";

  /* ── Aside panel (shared between mobile overlay and desktop sidebar) ── */
  const AsideContent = () => (
    <div className="flex flex-col h-full">
      {/* ── Gerenciar ── */}
      {canEdit && (
        <section className="px-5 py-5 border-b border-[var(--ch-line)]">
          <h2 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[var(--ch-muted)]">
            Gerenciar
          </h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--ch-muted)]">
                Status
              </label>
              <select
                value={currentStatusVal}
                disabled={isUpdating}
                onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                className="w-full rounded-lg border border-[var(--ch-line)] bg-[var(--ch-bg)] px-3 py-2 text-sm text-[var(--ch-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ch-action)] focus:border-[var(--ch-action)] transition disabled:opacity-50"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--ch-muted)]">
                Prioridade
              </label>
              <select
                value={currentPriorityVal}
                disabled={isUpdating}
                onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                className="w-full rounded-lg border border-[var(--ch-line)] bg-[var(--ch-bg)] px-3 py-2 text-sm text-[var(--ch-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ch-action)] focus:border-[var(--ch-action)] transition disabled:opacity-50"
              >
                {priorityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
      )}

      {/* ── Detalhes ── */}
      <section className="px-5 py-5 border-b border-[var(--ch-line)]">
        <h2 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[var(--ch-muted)]">
          Detalhes
        </h2>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <FiUser className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ch-muted)]" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ch-muted)]">
                Cliente
              </p>
              <p className="mt-0.5 text-sm font-medium text-[var(--ch-ink)] truncate">
                {ticket.cliente}
              </p>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <FiHeadphones className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ch-muted)]" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ch-muted)]">
                Responsável
              </p>
              <p className="mt-0.5 text-sm font-medium text-[var(--ch-ink)] truncate">
                {ticket.agente || "Não atribuído"}
              </p>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <FiClock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ch-muted)]" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ch-muted)]">
                Criado em
              </p>
              <p className="mt-0.5 text-sm font-medium text-[var(--ch-ink)]">
                {formatDate(ticket.dataCriacao)}
              </p>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <FiClock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ch-muted)]" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ch-muted)]">
                Atualizado em
              </p>
              <p className="mt-0.5 text-sm font-medium text-[var(--ch-ink)]">
                {formatDate(ticket.dataAtualizacao)}
              </p>
            </div>
          </li>
        </ul>
      </section>

      {/* ── Atividades ── */}
      <section className="px-5 py-5 flex-1">
        <h2 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[var(--ch-muted)]">
          Atividades
        </h2>
        <ol className="relative ml-2 space-y-4 border-l border-[var(--ch-line)]">
          {/* Item 1: criação */}
          <li className="pl-5 relative">
            <span className="absolute -left-[9px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--ch-surface)] ring-1 ring-[var(--ch-line)]">
              <FiCheckCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            </span>
            <p className="text-xs font-medium text-[var(--ch-ink)]">
              Criado por {ticket.cliente}
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--ch-muted)]">
              {formatDate(ticket.dataCriacao)}
            </p>
          </li>

          {/* Item 2: atribuição */}
          <li className="pl-5 relative">
            <span className="absolute -left-[9px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--ch-surface)] ring-1 ring-[var(--ch-line)]">
              <FiAlertCircle className="h-3 w-3 text-amber-500" />
            </span>
            <p className="text-xs font-medium text-[var(--ch-ink)]">
              {ticket.agente ? `Atribuído a ${ticket.agente}` : "Aguardando atribuição"}
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--ch-muted)]">
              {formatDate(ticket.dataAtualizacao)}
            </p>
          </li>
        </ol>
      </section>
    </div>
  );

  /* ── Main render ── */
  return (
    <div className="flex h-full flex-col bg-[var(--ch-bg)]">
      {/* ══ Sticky page header ══ */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[var(--ch-line)] bg-[var(--ch-bg)]/90 backdrop-blur-md px-4 py-3">
        {/* Left: back + breadcrumb */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => router.back()}
            aria-label="Voltar"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-[var(--ch-muted)] transition hover:bg-[var(--ch-tint)] hover:text-[var(--ch-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ch-focus)]"
          >
            <FiArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
          <span className="hidden sm:block h-4 w-px bg-[var(--ch-line)]" aria-hidden />
          <span className="hidden sm:inline text-xs text-[var(--ch-muted)] font-medium">
            Chamados&nbsp;/&nbsp;
            <span className="font-semibold text-[var(--ch-ink)]">#{ticket.id}</span>
          </span>
        </div>

        {/* Centre: ticket title */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h1 className="truncate text-sm font-semibold text-[var(--ch-ink)] sm:text-base">
            {ticket.titulo}
          </h1>
        </div>

        {/* Right: status + priority badges + mobile aside toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Status badge */}
          <span
            className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(ticket.status)}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${statusDot} ${isInProgress ? "animate-pulse" : ""}`}
            />
            {ticket.status}
          </span>

          {/* Priority badge */}
          <span
            className={`hidden sm:inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPrioridadeColor(ticket.prioridade)}`}
          >
            {ticket.prioridade}
          </span>

          {/* Mobile aside toggle */}
          <button
            onClick={() => setAsideOpen((v) => !v)}
            aria-label={asideOpen ? "Fechar informações" : "Ver informações"}
            className="lg:hidden inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-[var(--ch-muted)] ring-1 ring-[var(--ch-line)] transition hover:bg-[var(--ch-tint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ch-focus)]"
          >
            {asideOpen ? <FiX className="h-4 w-4" /> : <FiInfo className="h-4 w-4" />}
            <span className="text-xs">Info</span>
          </button>
        </div>
      </header>

      {/* ══ Body: chat + aside ══ */}
      <div className="flex flex-1 min-h-0 relative">
        {/* ── Chat area ── */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <TicketChat ticketId={id} className="h-full" />
        </div>

        {/* ── Desktop aside ── */}
        <aside className="hidden lg:flex w-80 xl:w-[22rem] shrink-0 flex-col border-l border-[var(--ch-line)] bg-[var(--ch-surface)] overflow-y-auto">
          <AsideContent />
        </aside>

        {/* ── Mobile aside overlay ── */}
        {asideOpen && (
          <>
            {/* Backdrop */}
            <div
              className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
              onClick={() => setAsideOpen(false)}
              aria-hidden
            />
            {/* Drawer */}
            <aside className="lg:hidden fixed right-0 top-0 bottom-0 z-40 w-80 flex flex-col border-l border-[var(--ch-line)] bg-[var(--ch-surface)] overflow-y-auto shadow-2xl">
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b border-[var(--ch-line)] px-5 py-4">
                <span className="text-sm font-semibold text-[var(--ch-ink)]">Informações</span>
                <button
                  onClick={() => setAsideOpen(false)}
                  aria-label="Fechar painel"
                  className="rounded-md p-1 text-[var(--ch-muted)] transition hover:bg-[var(--ch-tint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ch-focus)]"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
              <AsideContent />
            </aside>
          </>
        )}
      </div>
    </div>
  );
}
