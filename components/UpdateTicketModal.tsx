"use client";

import { updateTicket, type UpdateTicketInput } from "@/lib/http/tickets/updateTicket";
import { type TicketStatus, type TicketPriority, TicketsRequestError } from "@/lib/http/tickets/getTicketById";
import { useEffect, useId } from "react";
import { useForm } from "react-hook-form";
import { FiX } from "react-icons/fi";

/** Dados mínimos do ticket que o modal precisa para pré-preencher o form. */
export interface TicketForEdit {
  id: string | number;
  /** Título/assunto do ticket */
  title: string;
  /** Status em português (ex.: "Aberto", "Em andamento") ou no formato da API (ex.: "OPEN") */
  status: string;
  /** Prioridade em português (ex.: "Alta") ou no formato da API (ex.: "HIGH") */
  priority: string;
}

interface UpdateTicketModalProps {
  ticket: TicketForEdit | null;
  onClose: () => void;
  onUpdated: () => void;
  /** Se true, oculta os campos de status e prioridade (uso para clientes). */
  isClient?: boolean;
}

type FormValues = {
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
};

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

/** Converte label em PT-BR ou valor da API para o valor esperado pela API */
const statusToApi: Record<string, TicketStatus> = {
  // labels PT-BR
  "Aberto": "OPEN",
  "Em andamento": "IN_PROGRESS",
  "Aguardando resposta": "WAITING_FOR_CUSTOMER",
  "Aguardando cliente": "WAITING_FOR_CUSTOMER",
  "Resolvido": "RESOLVED",
  "Fechado": "CLOSED",
  // valores diretos da API (passthrough)
  "OPEN": "OPEN",
  "IN_PROGRESS": "IN_PROGRESS",
  "WAITING_FOR_CUSTOMER": "WAITING_FOR_CUSTOMER",
  "RESOLVED": "RESOLVED",
  "CLOSED": "CLOSED",
};

const priorityToApi: Record<string, TicketPriority> = {
  // labels PT-BR
  "Baixa": "LOW",
  "Média": "MEDIUM",
  "Alta": "HIGH",
  "Urgente": "URGENT",
  // valores diretos da API (passthrough)
  "LOW": "LOW",
  "MEDIUM": "MEDIUM",
  "HIGH": "HIGH",
  "URGENT": "URGENT",
};

const inputClassName =
  "mt-1 w-full rounded-lg border border-[#D8E1DA] bg-white px-3 py-2.5 text-sm text-[#10241A] outline-none placeholder:text-[#718078] focus-visible:border-[#15803D] focus-visible:ring-2 focus-visible:ring-[#15803D]/20";

export function UpdateTicketModal({ ticket, onClose, onUpdated, isClient = false }: UpdateTicketModalProps) {
  const titleId = useId();
  const open = ticket !== null;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  /* Preenche o formulário sempre que o ticket selecionado mudar */
  useEffect(() => {
    if (!ticket) return;
    reset({
      title: ticket.title,
      description: "",
      status: statusToApi[ticket.status] ?? "OPEN",
      priority: priorityToApi[ticket.priority] ?? "LOW",
    });
  }, [ticket, reset]);

  /* Fecha com Esc */
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onClose, open]);

  if (!open) return null;

  const onSubmit = async (data: FormValues) => {
    const payload: UpdateTicketInput = {
      title: data.title,
      description: data.description || undefined,
      status: data.status,
      priority: data.priority,
    };

    try {
      await updateTicket(String(ticket!.id), payload);
      onUpdated();
    } catch (reason: unknown) {
      const message =
        reason instanceof TicketsRequestError || reason instanceof Error
          ? reason.message
          : "Não foi possível atualizar o ticket.";
      setError("root", { message });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A2A1D]/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-[#D8E1DA] bg-white p-6 text-[#10241A]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-xl font-bold text-[#0F3D2A]">
              Editar chamado <span className="text-[#4B5E54]">#{ticket!.id}</span>
            </h2>
            <p className="mt-1 text-sm text-[#4B5E54]">Atualize as informações do chamado.</p>
          </div>
          <button
            type="button"
            aria-label="Fechar modal"
            disabled={isSubmitting}
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#4B5E54] transition-colors hover:bg-[#DDF3E4] hover:text-[#0F3D2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
          >
            <FiX size={20} />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Assunto */}
          <label className="block text-sm font-medium text-[#3F5248]">
            Assunto
            <input
              {...register("title", { required: "Informe o assunto." })}
              className={inputClassName}
              placeholder="Título do chamado"
              autoFocus
            />
            {errors.title && (
              <span className="mt-1 block text-xs text-red-700">{errors.title.message}</span>
            )}
          </label>

          {/* Descrição (opcional na edição) */}
          <label className="block text-sm font-medium text-[#3F5248]">
            Descrição <span className="text-[#4B5E54]">(opcional)</span>
            <textarea
              {...register("description")}
              className={`${inputClassName} min-h-24 resize-y`}
              placeholder="Descreva a atualização ou complemento..."
            />
          </label>

          {!isClient && (
            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <label className="block text-sm font-medium text-[#3F5248]">
                Status
                <select {...register("status")} className={inputClassName}>
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              {/* Prioridade */}
              <label className="block text-sm font-medium text-[#3F5248]">
                Prioridade
                <select {...register("priority")} className={inputClassName}>
                  {priorityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {errors.root && (
            <p className="text-sm text-red-700" role="alert">
              {errors.root.message}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-lg border border-[#15803D] px-4 py-2.5 text-sm font-semibold text-[#0F3D2A] transition-colors hover:bg-[#DDF3E4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-[#15803D] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#116A32] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
            >
              {isSubmitting ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
