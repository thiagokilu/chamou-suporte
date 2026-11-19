"use client";

import {
  createTicket,
  type CreateTicketInput,
} from "@/lib/http/tickets/createTicket";
import { useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FiPaperclip, FiX } from "react-icons/fi";
import { toast } from "sonner";

const MAX_FILES = 5;
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

interface CreateTicketModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const inputClassName =
  "mt-1 w-full rounded-lg border border-[#D8E1DA] bg-white px-3 py-2.5 text-sm text-[#10241A] outline-none placeholder:text-[#718078] focus-visible:border-[#15803D] focus-visible:ring-2 focus-visible:ring-[#15803D]/20";

export function CreateTicketModal({
  open,
  onClose,
  onCreated,
}: CreateTicketModalProps) {
  const titleId = useId();
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateTicketInput>({
    defaultValues: { title: "", description: "", category_id: 1 },
  });

  const addFiles = (incoming: File[]) => {
    const valid = incoming.filter((file) => file.size <= MAX_SIZE);
    if (valid.length < incoming.length) {
      setError("root", {
        message: "Alguns arquivos passam de 5 MB e foram ignorados.",
      });
    }
    setFiles((previous) => [...previous, ...valid].slice(0, MAX_FILES));
  };

  const removeFile = (index: number) => {
    setFiles((previous) =>
      previous.filter((_, fileIndex) => fileIndex !== index),
    );
  };

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onClose, open]);

  if (!open) return null;

  const onSubmit = async (data: CreateTicketInput) => {
    try {
      await createTicket({
        title: data.title,
        description: data.description,
        category_id: 1,
        attachments: files,
      });
      reset();
      setFiles([]);
      onCreated();
      toast.success("Ticket criado com sucesso!");
    } catch (reason: unknown) {
      setError("root", {
        message:
          reason instanceof Error
            ? reason.message
            : "Não foi possível criar o ticket.",
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/45 p-4"
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
              Novo chamado
            </h2>
            <p className="mt-1 text-sm text-[#4B5E54]">
              Descreva a solicitação de suporte.
            </p>
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
          <label className="block text-sm font-medium text-[#3F5248]">
            Assunto
            <input
              {...register("title", { required: "Informe o assunto." })}
              className={inputClassName}
              placeholder="Ex.: Erro ao acessar o sistema"
              autoFocus
            />
            {errors.title && (
              <span className="mt-1 block text-xs text-red-700">
                {errors.title.message}
              </span>
            )}
          </label>

          <label className="block text-sm font-medium text-[#3F5248]">
            Descrição
            <textarea
              {...register("description", { required: "Informe a descrição." })}
              className={`${inputClassName} min-h-28 resize-y`}
              placeholder="Explique o que aconteceu e como podemos ajudar."
            />
            {errors.description && (
              <span className="mt-1 block text-xs text-red-700">
                {errors.description.message}
              </span>
            )}
          </label>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={(e) => {
                addFiles(Array.from(e.target.files ?? []));
                e.target.value = ""; // permite selecionar o mesmo arquivo de novo
              }}
            />

            <button
              type="button"
              disabled={isSubmitting || files.length >= MAX_FILES}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#D8E1DA] px-3 py-2 text-sm text-[#0F3D2A] transition-colors hover:border-[#15803D] hover:bg-[#DDF3E4] disabled:opacity-50"
            >
              <FiPaperclip size={16} />
              Anexar arquivos
            </button>

            {files.length > 0 && (
              <ul className="mt-3 space-y-2">
                {files.map((file, i) => (
                  <li
                    key={`${file.name}-${i}`}
                    className="flex items-center justify-between gap-3 rounded-lg bg-[#F2F6F3] px-3 py-2 text-sm text-[#3F5248]"
                  >
                    <span className="truncate">
                      {file.name}{" "}
                      <span className="text-xs text-[#4B5E54]">
                        ({(file.size / 1024).toFixed(0)} KB)
                      </span>
                    </span>
                    <button
                      type="button"
                      aria-label={`Remover ${file.name}`}
                      onClick={() => removeFile(i)}
                      className="rounded-md text-[#4B5E54] transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D]"
                    >
                      <FiX size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

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
              {isSubmitting ? "Criando..." : "Criar chamado"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
