"use client";

import { FormEvent, useState } from "react";
import { LuX } from "react-icons/lu";
import type { ApiUser } from "@/lib/http/auth/getUsers";
import { updateRole } from "@/lib/http/auth/updateRole";

interface EditUserRoleModalProps {
  user: ApiUser;
  onClose: () => void;
  onSaved: (user: ApiUser) => void;
}

const roles = [
  { value: "ADMIN", label: "Administrador" },
  { value: "AGENT", label: "Agente" },
  { value: "CLIENT", label: "Cliente" },
  { value: "USER", label: "Usuário" },
];

export default function EditUserRoleModal({
  user,
  onClose,
  onSaved,
}: EditUserRoleModalProps) {
  const [role, setRole] = useState(user.role.toUpperCase());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await updateRole(user.id, role);
      onSaved({ ...user, role });
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Não foi possível atualizar o perfil.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A2A1D]/45 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="edit-user-title" className="w-full max-w-md rounded-2xl border border-[#D8E1DA] bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 id="edit-user-title" className="text-lg font-semibold text-[#0F3D2A]">Editar usuário</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-[#4B5E54] hover:bg-[#DDF3E4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D]" aria-label="Fechar">
            <LuX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-user-username" className="mb-1 block text-sm font-medium text-[#4B5E54]">Usuário</label>
            <input id="edit-user-username" value={user.username} readOnly className="w-full rounded-lg border border-[#D8E1DA] bg-[#F2F6F3] px-3 py-2 text-sm text-[#4B5E54]" />
          </div>
          <div>
            <label htmlFor="edit-user-email" className="mb-1 block text-sm font-medium text-[#4B5E54]">E-mail</label>
            <input id="edit-user-email" value={user.email} readOnly className="w-full rounded-lg border border-[#D8E1DA] bg-[#F2F6F3] px-3 py-2 text-sm text-[#4B5E54]" />
          </div>
          <div>
            <label htmlFor="edit-user-role" className="mb-1 block text-sm font-medium text-[#4B5E54]">Perfil</label>
            <select id="edit-user-role" value={role} onChange={(event) => setRole(event.target.value)} className="w-full rounded-lg border border-[#D8E1DA] bg-white px-3 py-2 text-sm text-[#10241A] outline-none focus-visible:border-[#15803D] focus-visible:ring-2 focus-visible:ring-[#15803D]/20">
              {roles.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>

          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-[#D8E1DA] px-4 py-2 text-sm font-medium text-[#4B5E54] hover:bg-[#F2F6F3]">Cancelar</button>
            <button type="submit" disabled={isSaving} className="rounded-lg bg-[#0F3D2A] px-4 py-2 text-sm font-medium text-white hover:bg-[#145A3E] disabled:cursor-not-allowed disabled:opacity-60">
              {isSaving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}