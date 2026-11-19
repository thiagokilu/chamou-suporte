"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  LuSearch,
  LuX,
  LuFilter,
  LuChevronDown,
  LuCalendar,
  LuUser,
} from "react-icons/lu";

interface TicketFiltersProps {
  searchTerm: string;
  statusFilter: string;
  prioridadeFilter: string;
  agenteFilter: string;
  dataInicio: string;
  dataFim: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPrioridadeChange: (value: string) => void;
  onAgenteChange: (value: string) => void;
  onDataInicioChange: (value: string) => void;
  onDataFimChange: (value: string) => void;
  onClearFilters: () => void;
  filteredCount: number;
  hasActiveFilters: boolean;
  agentes: string[];
  showHeader?: boolean;
}

const STATUS_OPTIONS = [
  { value: "Todos", dot: null },
  { value: "Aberto", dot: "bg-sky-400" },
  { value: "Em andamento", dot: "bg-amber-400" },
  { value: "Resolvido", dot: "bg-emerald-400" },
  { value: "Fechado", dot: "bg-zinc-500" },
];

const PRIORIDADE_OPTIONS = [
  { value: "Todas", dot: null },
  { value: "Baixa", dot: "bg-zinc-400" },
  { value: "Média", dot: "bg-amber-400" },
  { value: "Alta", dot: "bg-orange-500" },
  { value: "Urgente", dot: "bg-red-500" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900";

const inputBase =
  "w-full rounded-md border border-zinc-700 bg-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors hover:border-zinc-600 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500";

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISODate(d);
}

function formatBR(iso: string) {
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${d}/${m}/${y}` : iso;
}

interface ChipGroupProps {
  label: string;
  options: { value: string; dot: string | null }[];
  value: string;
  onChange: (value: string) => void;
}

function ChipGroup({ label, options, value, onChange }: ChipGroupProps) {
  const labelId = useId();
  return (
    <div role="group" aria-labelledby={labelId}>
      <span
        id={labelId}
        className="mb-2 block text-sm font-medium text-zinc-300"
      >
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(opt.value)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${focusRing} ${
                selected
                  ? "border-zinc-100 bg-zinc-100 font-medium text-zinc-900"
                  : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800"
              }`}
            >
              {opt.dot && (
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 rounded-full ${opt.dot}`}
                />
              )}
              {opt.value}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TicketFilters({
  searchTerm,
  statusFilter,
  prioridadeFilter,
  agenteFilter,
  dataInicio,
  dataFim,
  onSearchChange,
  onStatusChange,
  onPrioridadeChange,
  onAgenteChange,
  onDataInicioChange,
  onDataFimChange,
  onClearFilters,
  filteredCount,
  hasActiveFilters,
  agentes,
  showHeader = true,
}: TicketFiltersProps) {
  const searchId = useId();
  const agenteId = useId();
  const inicioId = useId();
  const fimId = useId();
  const searchRef = useRef<HTMLInputElement>(null);

  const defaultAgente = agentes[0] ?? "";
  const agenteActive = agenteFilter !== defaultAgente;
  const periodoActive = Boolean(dataInicio || dataFim);
  const advancedCount = (agenteActive ? 1 : 0) + (periodoActive ? 1 : 0);

  const [advancedOpen, setAdvancedOpen] = useState(advancedCount > 0);

  // Atalho "/" foca a pesquisa
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const presets = [
    { label: "Hoje", inicio: daysAgo(0), fim: daysAgo(0) },
    { label: "Últimos 7 dias", inicio: daysAgo(6), fim: daysAgo(0) },
    { label: "Últimos 30 dias", inicio: daysAgo(29), fim: daysAgo(0) },
  ];

  const applyPreset = (inicio: string, fim: string) => {
    onDataInicioChange(inicio);
    onDataFimChange(fim);
  };

  const clearPeriodo = () => {
    onDataInicioChange("");
    onDataFimChange("");
  };

  // Chips de filtros ativos, cada um removível individualmente
  const activeChips: { key: string; label: string; onRemove: () => void }[] =
    [];
  if (searchTerm) {
    activeChips.push({
      key: "search",
      label: `Busca: ${searchTerm}`,
      onRemove: () => onSearchChange(""),
    });
  }
  if (statusFilter !== "Todos") {
    activeChips.push({
      key: "status",
      label: `Status: ${statusFilter}`,
      onRemove: () => onStatusChange("Todos"),
    });
  }
  if (prioridadeFilter !== "Todas") {
    activeChips.push({
      key: "prioridade",
      label: `Prioridade: ${prioridadeFilter}`,
      onRemove: () => onPrioridadeChange("Todas"),
    });
  }
  if (agenteActive) {
    activeChips.push({
      key: "agente",
      label: `Agente: ${agenteFilter}`,
      onRemove: () => onAgenteChange(defaultAgente),
    });
  }
  if (periodoActive) {
    const text =
      dataInicio && dataFim
        ? `${formatBR(dataInicio)} a ${formatBR(dataFim)}`
        : dataInicio
          ? `a partir de ${formatBR(dataInicio)}`
          : `até ${formatBR(dataFim)}`;
    activeChips.push({
      key: "periodo",
      label: `Período: ${text}`,
      onRemove: clearPeriodo,
    });
  }

  return (
    <section
      aria-label="Filtros de tickets"
      className={`${showHeader ? "rounded-lg border border-zinc-800 bg-zinc-900 shadow-sm" : ""}`}
    >
      {showHeader && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <LuFilter className="text-zinc-400" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-zinc-50">
              Filtros e pesquisa
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <p
              className="text-sm text-zinc-400"
              aria-live="polite"
              aria-atomic="true"
            >
              <span className="font-semibold text-zinc-100 tabular-nums">
                {filteredCount}
              </span>{" "}
              {filteredCount === 1
                ? "ticket encontrado"
                : "tickets encontrados"}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className={`inline-flex items-center gap-2 rounded-md border border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-50 ${focusRing}`}
              >
                <LuX aria-hidden="true" />
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      )}

      <div className={`space-y-5 ${showHeader ? "p-4 sm:p-6" : ""}`}>
        {/* Pesquisa */}
        <div>
          <label
            htmlFor={searchId}
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Pesquisar
          </label>
          <div className="relative">
            <LuSearch
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              ref={searchRef}
              id={searchId}
              type="search"
              autoComplete="off"
              placeholder="ID, título ou cliente"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape" && searchTerm) {
                  e.preventDefault();
                  onSearchChange("");
                }
              }}
              className={`${inputBase} appearance-none py-2.5 pl-10 pr-20 [&::-webkit-search-cancel-button]:hidden`}
            />
            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange("");
                    searchRef.current?.focus();
                  }}
                  aria-label="Limpar pesquisa"
                  className={`rounded p-1 text-zinc-500 transition-colors hover:text-zinc-200 ${focusRing}`}
                >
                  <LuX />
                </button>
              ) : (
                <kbd
                  aria-hidden="true"
                  className="hidden rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-xs text-zinc-500 sm:block"
                >
                  /
                </kbd>
              )}
            </div>
          </div>
        </div>

        {/* Status e prioridade como chips */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ChipGroup
            label="Status"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={onStatusChange}
          />
          <ChipGroup
            label="Prioridade"
            options={PRIORIDADE_OPTIONS}
            value={prioridadeFilter}
            onChange={onPrioridadeChange}
          />
        </div>

        {/* Filtros avançados: agente e período */}
        <div className="border-t border-zinc-800 pt-4">
          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            aria-expanded={advancedOpen}
            aria-controls={`${agenteId}-panel`}
            className={`inline-flex items-center gap-2 rounded-md py-1 text-sm font-medium text-zinc-300 transition-colors hover:text-zinc-50 ${focusRing}`}
          >
            <LuChevronDown
              aria-hidden="true"
              className={`transition-transform ${advancedOpen ? "rotate-180" : ""}`}
            />
            Agente e período
            {advancedCount > 0 && (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-900">
                {advancedCount}
              </span>
            )}
          </button>

          {advancedOpen && (
            <div
              id={`${agenteId}-panel`}
              className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"
            >
              <div>
                <label
                  htmlFor={agenteId}
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Agente
                </label>
                <div className="relative">
                  <LuUser
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                  />
                  <select
                    id={agenteId}
                    value={agenteFilter}
                    onChange={(e) => onAgenteChange(e.target.value)}
                    className={`${inputBase} py-2.5 pl-10 pr-4`}
                  >
                    {agentes.map((agente) => (
                      <option key={agente} value={agente}>
                        {agente}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-zinc-300">
                    Período
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {presets.map((p) => {
                      const selected =
                        dataInicio === p.inicio && dataFim === p.fim;
                      return (
                        <button
                          key={p.label}
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            selected
                              ? clearPeriodo()
                              : applyPreset(p.inicio, p.fim)
                          }
                          className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${focusRing} ${
                            selected
                              ? "border-zinc-100 bg-zinc-100 font-medium text-zinc-900"
                              : "border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800"
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor={inicioId} className="sr-only">
                      Data inicial
                    </label>
                    <div className="relative">
                      <LuCalendar
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                      />
                      <input
                        id={inicioId}
                        type="date"
                        value={dataInicio}
                        max={dataFim || undefined}
                        onChange={(e) => onDataInicioChange(e.target.value)}
                        className={`${inputBase} py-2.5 pl-10 pr-3 [color-scheme:dark]`}
                      />
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">De</p>
                  </div>
                  <div>
                    <label htmlFor={fimId} className="sr-only">
                      Data final
                    </label>
                    <div className="relative">
                      <LuCalendar
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                      />
                      <input
                        id={fimId}
                        type="date"
                        value={dataFim}
                        min={dataInicio || undefined}
                        onChange={(e) => onDataFimChange(e.target.value)}
                        className={`${inputBase} py-2.5 pl-10 pr-3 [color-scheme:dark]`}
                      />
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">Até</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filtros ativos, removíveis um a um */}
        {activeChips.length > 0 && (
          <ul
            aria-label="Filtros ativos"
            className="flex flex-wrap gap-2 border-t border-zinc-800 pt-4"
          >
            {activeChips.map((chip) => (
              <li key={chip.key}>
                <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 py-1 pl-3 pr-1 text-sm text-zinc-200">
                  <span className="truncate">{chip.label}</span>
                  <button
                    type="button"
                    onClick={chip.onRemove}
                    aria-label={`Remover filtro ${chip.label}`}
                    className={`rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-50 ${focusRing}`}
                  >
                    <LuX className="h-3.5 w-3.5" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
