"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FiAlertCircle, FiChevronDown, FiClock, FiFilter, FiInbox, FiPlus, FiSearch, FiSliders, FiX } from "react-icons/fi";
import { clearStoredUser, isDemoMode } from "@/lib/auth";
import { getTickets, isRequestCanceled, mapApiTicket, TicketsRequestError, type ApiTicket } from "@/lib/http/http";
import { TicketTableHeader } from "./TicketTableHeader";
import { TicketTablePagination } from "./TicketTablePagination";
import { TicketTableRow } from "./TicketTableRow";
import type { Priority, SortKey, Status, Ticket } from "./TicketTableTypes";
import { CreateTicketModal } from "../CreateTicketModal";

// Nome do usuário logado. Troque pelo valor real (ex.: vindo de um contexto de autenticação).
const CURRENT_USER = "Você";

const DEMO_TICKETS: Ticket[] = [
  { id: "1048", subject: "Acesso ao painel financeiro", requester: { name: "Marina Costa", initials: "MC", tone: "teal" }, agent: { name: "Rafael Lima", initials: "RL", tone: "violet" }, status: "Aberto", priority: "Alta", createdAt: "11/11/2026 09:20", updatedAt: "11/11/2026 10:42" },
  { id: "1047", subject: "Dúvida sobre alteração de senha", requester: { name: "Lucas Mendes", initials: "LM", tone: "teal" }, agent: { name: "Ana Souza", initials: "AS", tone: "violet" }, status: "Em andamento", priority: "Média", createdAt: "11/11/2026 08:10", updatedAt: "11/11/2026 09:18" },
  { id: "1046", subject: "Relatório mensal não carrega", requester: { name: "Beatriz Alves", initials: "BA", tone: "teal" }, agent: { name: "Rafael Lima", initials: "RL", tone: "violet" }, status: "Aguardando resposta", priority: "Urgente", createdAt: "10/11/2026 14:05", updatedAt: "10/11/2026 16:35" },
  { id: "1045", subject: "Atualização dos dados cadastrais", requester: { name: "Pedro Rocha", initials: "PR", tone: "teal" }, agent: { name: "Camila Nunes", initials: "CN", tone: "violet" }, status: "Resolvido", priority: "Baixa", createdAt: "10/11/2026 10:30", updatedAt: "10/11/2026 14:07" },
  { id: "1044", subject: "Erro ao exportar arquivo CSV", requester: { name: "Julia Martins", initials: "JM", tone: "teal" }, agent: { name: "Ana Souza", initials: "AS", tone: "violet" }, status: "Em andamento", priority: "Alta", createdAt: "09/11/2026 15:42", updatedAt: "10/11/2026 11:52" },
  { id: "1043", subject: "Convite para novo membro da equipe", requester: { name: "Felipe Santos", initials: "FS", tone: "teal" }, agent: null, status: "Aberto", priority: "Média", createdAt: "09/11/2026 09:15", updatedAt: "10/11/2026 17:20" },
  { id: "1042", subject: "Como configurar notificações?", requester: { name: "Renata Oliveira", initials: "RO", tone: "teal" }, agent: { name: "Camila Nunes", initials: "CN", tone: "violet" }, status: "Fechado", priority: "Baixa", createdAt: "07/11/2026 13:00", updatedAt: "08/11/2026 16:25" },
];

const priorityWeight: Record<Priority, number> = { "Urgente": 4, "Alta": 3, "Média": 2, "Baixa": 1 };

// Aceita ISO (2025-01-31T10:00:00) e dd/mm/aaaa [hh:mm]
const parseDate = (value: string): number => {
  const br = value.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:[ ,T]+(\d{2}):(\d{2}))?/);
  if (br) return new Date(+br[3], +br[2] - 1, +br[1], +(br[4] ?? 0), +(br[5] ?? 0)).getTime();
  const time = Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
};

const toTicket = (apiTicket: ApiTicket): Ticket => {
  const ticket = mapApiTicket(apiTicket);
  const assigned = apiTicket.assigned_to;
  // `in` lança erro em valores primitivos (ex.: id numérico), por isso a checagem de objeto
  const agentName =
    assigned && typeof assigned === "object" && "username" in assigned ? String(assigned.username) : null;

  return {
    id: String(ticket.id),
    subject: ticket.titulo,
    requester: {
      name: ticket.cliente,
      initials: ticket.cliente.slice(0, 2).toUpperCase(),
      tone: "teal",
    },
    agent: agentName
      ? { name: agentName, initials: agentName.slice(0, 2).toUpperCase(), tone: "violet" }
      : null,
    status: ticket.status as Status,
    priority: ticket.prioridade as Priority,
    createdAt: ticket.dataCriacao,
    updatedAt: ticket.dataAtualizacao,
  };
};

export default function TicketsTableBody() {
  const router = useRouter();
  const pathname = usePathname();
  const [isDemo, setIsDemo] = useState(pathname === "/demo");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos");
  const [priority, setPriority] = useState("Todas");
  const [agent, setAgent] = useState("Todos");
  const [quick, setQuick] = useState("Todos");
  const [sort, setSort] = useState<SortKey>("updated");
  const [desc, setDesc] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const loadTickets = useCallback(() => {
    if (isDemo) {
      setTickets(DEMO_TICKETS);
      setError(null);
      setIsLoading(false);
      return Promise.resolve();
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);
    setError(null);

    return getTickets({}, controller.signal)
      .then((response) => setTickets(response.data.map(toTicket)))
      .catch((reason: unknown) => {
        if (isRequestCanceled(reason, controller.signal)) return;
        if (reason instanceof TicketsRequestError && reason.status === 401) {
          clearStoredUser();
          router.push("/login");
          return;
        }
        setError(reason instanceof Error ? reason.message : "Erro inesperado ao carregar os tickets.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
  }, [isDemo, router]);

  useEffect(() => {
    if (isDemoMode()) setIsDemo(true);
  }, []);

  useEffect(() => {
    loadTickets();
    return () => abortRef.current?.abort();
  }, [loadTickets]);

  const resetPage = () => setPage(1);

  const agentOptions = useMemo(() => {
    const names = Array.from(new Set(tickets.flatMap((t) => (t.agent ? [t.agent.name] : [])))).sort((a, b) =>
      a.localeCompare(b),
    );
    return ["Todos", ...names, "Sem agente"];
  }, [tickets]);

  const metrics = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((t) => t.status === "Aberto").length,
      inProgress: tickets.filter((t) => t.status === "Em andamento").length,
      waiting: tickets.filter((t) => t.status === "Aguardando resposta").length,
    }),
    [tickets],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filteredRows = tickets.filter((t) => {
      const matchesQuery = !q || [t.id, t.subject, t.requester.name].some((v) => v.toLowerCase().includes(q));
      const matchesStatus = status === "Todos" || t.status === status;
      const matchesPriority = priority === "Todas" || t.priority === priority;
      const matchesAgent =
        agent === "Todos" || (agent === "Sem agente" ? !t.agent : t.agent?.name === agent);
      const matchesQuick =
        quick === "Todos" ||
        (quick === "Abertos" && t.status === "Aberto") ||
        (quick === "Meus chamados" && t.agent?.name === CURRENT_USER) ||
        (quick === "Pendentes" && t.status === "Aguardando resposta");
      return matchesQuery && matchesStatus && matchesPriority && matchesAgent && matchesQuick;
    });

    return filteredRows.sort((a, b) => {
      let order = 0;
      if (sort === "priority") order = priorityWeight[a.priority] - priorityWeight[b.priority];
      else if (sort === "created") order = parseDate(a.createdAt) - parseDate(b.createdAt);
      else order = parseDate(a.updatedAt) - parseDate(b.updatedAt);

      // desempate estável pelo ID numérico
      if (order === 0) order = a.id.localeCompare(b.id, undefined, { numeric: true });
      return desc ? -order : order;
    });
  }, [tickets, query, status, priority, agent, quick, sort, desc]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const filtered = Boolean(
    query || status !== "Todos" || priority !== "Todas" || agent !== "Todos" || quick !== "Todos",
  );

  const changeSort = (key: SortKey) => {
    if (sort === key) setDesc(!desc);
    else {
      setSort(key);
      setDesc(true);
    }
    resetPage();
  };

  const clear = () => {
    setQuery("");
    setStatus("Todos");
    setPriority("Todas");
    setAgent("Todos");
    setQuick("Todos");
    resetPage();
  };

  const openTicket = (ticket: Ticket) => {
    if (isDemo) return;
    router.push(`/chamado/${ticket.id}`);
  };

  const tabs: { label: string; count: number }[] = [
    { label: "Todos", count: tickets.length },
    { label: "Abertos", count: metrics.open },
    { label: "Meus chamados", count: tickets.filter((t) => t.agent?.name === CURRENT_USER).length },
    { label: "Pendentes", count: metrics.waiting },
  ];

  return (
    <main className="min-h-screen bg-[var(--ch-bg)] text-[var(--ch-ink)]">
      <div className="mx-auto max-w-[1540px] px-4 py-6 sm:px-8 lg:px-12 lg:py-9">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <nav aria-label="Caminho" className="mb-3 text-xs font-medium text-[#4B5E54]">
              Suporte <span className="mx-1.5 text-[#9AA99F]">/</span> Chamados
            </nav>
            <h1 className="text-[28px] font-bold tracking-tight text-[#0F3D2A]">Chamados</h1>
            <p className="mt-1 text-sm text-[#4B5E54]">
              {isDemo ? "Modo demonstração: dados fictícios carregados no navegador." : "Acompanhe e gerencie todas as solicitações de suporte."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            data-tour="create-ticket"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#15803D] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#116A32] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F7F4] motion-reduce:transition-none"
          >
            <FiPlus aria-hidden="true" /> Novo chamado
          </button>
        </header>

        <section aria-label="Resumo de chamados" className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric label="Total de chamados" value={metrics.total} detail="Todos os registros" tone="slate" icon={<FiInbox />} />
          <Metric label="Abertos" value={metrics.open} detail="Aguardando atendimento" tone="blue" icon={<FiAlertCircle />} />
          <Metric label="Em andamento" value={metrics.inProgress} detail="Em atendimento" tone="violet" icon={<FiClock />} />
          <Metric label="Aguardando resposta" value={metrics.waiting} detail="Ação necessária" tone="amber" icon={<FiClock />} />
        </section>

        <section data-tour="tickets-table" className="overflow-hidden rounded-2xl border border-[#D8E1DA] bg-[var(--ch-surface)]">
          <div className="border-b border-[#D8E1DA] px-5 pt-4 sm:px-6">
            <div className="flex gap-1 overflow-x-auto" role="tablist">
              {tabs.map(({ label, count }) => (
                <button
                  key={label}
                  role="tab"
                  aria-selected={quick === label}
                  onClick={() => {
                    setQuick(label);
                    resetPage();
                  }}
                  className={`relative whitespace-nowrap rounded-lg px-3 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] ${
                    quick === label ? "text-[#0F3D2A]" : "text-[#4B5E54] hover:text-[#0F3D2A]"
                  }`}
                >
                  {label}
                  <span className={`ml-1.5 text-xs tabular-nums ${quick === label ? "text-[#15803D]" : "text-[#4B5E54]"}`}>{count}</span>
                  {quick === label && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#15803D]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-b border-[#D8E1DA] bg-[var(--ch-surface)] p-4 sm:p-5 lg:flex-row">
            <label className="relative block min-w-0 flex-1">
              <span className="sr-only">Buscar chamado</span>
              <FiSearch aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4B5E54]" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  resetPage();
                }}
                placeholder="Buscar por ID, assunto ou solicitante..."
                className="h-10 w-full rounded-lg border border-[#D8E1DA] bg-[var(--ch-surface)] pl-10 pr-3 text-sm text-[#10241A] outline-none placeholder:text-[#718078] focus-visible:border-[#15803D] focus-visible:ring-2 focus-visible:ring-[#15803D]/20"
              />
            </label>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Select
                label="Status"
                value={status}
                options={["Todos", "Aberto", "Em andamento", "Aguardando resposta", "Resolvido", "Fechado"]}
                onChange={(v) => {
                  setStatus(v);
                  resetPage();
                }}
              />
              <Select
                label="Prioridade"
                value={priority}
                options={["Todas", "Baixa", "Média", "Alta", "Urgente"]}
                onChange={(v) => {
                  setPriority(v);
                  resetPage();
                }}
              />
              <Select
                label="Agente"
                value={agent}
                options={agentOptions}
                onChange={(v) => {
                  setAgent(v);
                  resetPage();
                }}
              />
            </div>
            {filtered && (
              <button
                onClick={clear}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-2 text-sm font-medium text-[#4B5E54] transition-colors hover:bg-[#DDF3E4] hover:text-[#0F3D2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] motion-reduce:transition-none"
              >
                <FiX aria-hidden="true" /> Limpar
              </button>
            )}
          </div>

          <div className="flex items-center justify-between px-5 py-3.5 sm:px-6">
            <p className="text-sm text-[#4B5E54]" role="status">
              {isLoading ? (
                "Carregando chamados..."
              ) : (
                <>
                  <b className="tabular-nums text-[#10241A]">{rows.length}</b>{" "}
                  {rows.length === 1 ? "chamado encontrado" : "chamados encontrados"}
                </>
              )}
            </p>
            <button className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-[#4B5E54] transition-colors hover:text-[#0F3D2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] motion-reduce:transition-none">
              <FiSliders aria-hidden="true" /> Personalizar colunas
            </button>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <Loading />
            ) : error ? (
              <LoadError message={error} onRetry={loadTickets} />
            ) : (
              <>
                <table className="w-full min-w-[1050px] border-collapse text-left">
                  <TicketTableHeader sort={sort} desc={desc} onSort={changeSort} />
                  <tbody className="divide-y divide-[#E6ECE7]">
                    {visible.map((ticket) => (
                      <TicketTableRow key={ticket.id} ticket={ticket} onSelect={openTicket} />
                    ))}
                  </tbody>
                </table>
                {visible.length === 0 && <Empty onClear={clear} canClear={filtered} />}
              </>
            )}
          </div>

          <TicketTablePagination
            pageSize={pageSize}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageSizeChange={(size) => {
              setPageSize(size);
              resetPage();
            }}
            onPageChange={setPage}
          />
        </section>
      </div>
      <CreateTicketModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={async () => {
          setIsCreateModalOpen(false);
          setPage(1);
          await loadTickets();
          window.setTimeout(() => {
            loadTickets();
          }, 1500);
        }}
      />
    </main>
  );
}

function Metric({
  label,
  value,
  detail,
  tone,
  icon,
}: {
  label: string;
  value: number;
  detail: string;
  tone: "slate" | "blue" | "violet" | "amber";
  icon: ReactNode;
}) {
  const colors: Record<string, string> = {
    slate: "bg-[#DDF3E4] text-[#0F3D2A]",
    blue: "bg-sky-100 text-sky-900",
    violet: "bg-emerald-100 text-emerald-900",
    amber: "bg-amber-100 text-amber-900",
  };
  return (
    <article className="rounded-2xl border border-[#D8E1DA] bg-[var(--ch-surface)] p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-[#4B5E54]">{label}</p>
        <span aria-hidden="true" className={`rounded-xl p-2 ${colors[tone]}`}>{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums text-[#10241A]">{value}</p>
      <p className="mt-1 text-xs text-[#4B5E54]">{detail}</p>
    </article>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative">
      <span className="sr-only">Filtrar por {label}</span>
      <FiFilter aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#4B5E54]" size={14} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full appearance-none rounded-lg border border-[#D8E1DA] bg-[var(--ch-surface)] py-0 pl-8 pr-7 text-sm text-[#10241A] outline-none focus-visible:border-[#15803D] focus-visible:ring-2 focus-visible:ring-[#15803D]/20 sm:w-auto"
      >
        <option value={options[0]}>
          {label}: {options[0]}
        </option>
        {options.slice(1).map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <FiChevronDown aria-hidden="true" className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#4B5E54]" size={14} />
    </label>
  );
}

function Empty({ onClear, canClear }: { onClear: () => void; canClear: boolean }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
      <div aria-hidden="true" className="mb-3 rounded-full bg-[#DDF3E4] p-3 text-[#0F3D2A]">
        <FiSearch size={22} />
      </div>
      <h2 className="text-sm font-semibold text-[#0F3D2A]">Nenhum chamado encontrado</h2>
      <p className="mt-1 text-sm text-[#4B5E54]">Tente ajustar sua busca ou os filtros selecionados.</p>
      {canClear && (
        <button onClick={onClear} className="mt-4 rounded-lg text-sm font-semibold text-[#15803D] hover:text-[#116A32] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D]">
          Limpar filtros
        </button>
      )}
    </div>
  );
}

function Loading() {
  return (
    <div className="flex min-h-72 items-center justify-center gap-3 text-sm text-[#4B5E54]">
      <span aria-hidden="true" className="h-5 w-5 animate-spin rounded-full border-2 border-[#D8E1DA] border-t-[#15803D] motion-reduce:animate-none" />
      Carregando chamados...
    </div>
  );
}

function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
      <div aria-hidden="true" className="mb-3 rounded-full bg-rose-100 p-3 text-rose-900">
        <FiAlertCircle size={22} />
      </div>
      <h2 className="text-sm font-semibold text-[#0F3D2A]">Não foi possível carregar os chamados</h2>
      <p className="mt-1 max-w-md text-sm text-[#4B5E54]">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-lg bg-[#15803D] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#116A32] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] focus-visible:ring-offset-2 motion-reduce:transition-none"
      >
        Tentar novamente
      </button>
    </div>
  );
}
