"use client";

import { LuX } from "react-icons/lu";
import { TicketFilters } from "./TicketFilters";

interface TicketFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
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
}

export function TicketFiltersModal({
  isOpen,
  onClose,
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
}: TicketFiltersModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-6 py-4">
          <h2 id="modal-title" className="text-lg font-semibold text-zinc-50">
            Filtros e Pesquisa
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            aria-label="Fechar modal"
          >
            <LuX className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <TicketFilters
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            prioridadeFilter={prioridadeFilter}
            agenteFilter={agenteFilter}
            dataInicio={dataInicio}
            dataFim={dataFim}
            onSearchChange={onSearchChange}
            onStatusChange={onStatusChange}
            onPrioridadeChange={onPrioridadeChange}
            onAgenteChange={onAgenteChange}
            onDataInicioChange={onDataInicioChange}
            onDataFimChange={onDataFimChange}
            onClearFilters={onClearFilters}
            filteredCount={filteredCount}
            hasActiveFilters={hasActiveFilters}
            agentes={agentes}
            showHeader={false}
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-20 border-t border-zinc-800 bg-zinc-900 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-md bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
  );
}
