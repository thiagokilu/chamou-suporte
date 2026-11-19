"use client";

import { useEffect, useMemo, useState } from "react";
import { LuPen, LuSearch } from "react-icons/lu";
import EditUserRoleModal from "@/components/EditUserRoleModal";
import { getUsers, type ApiUser } from "@/lib/http/auth/getUsers";
import { isDemoMode } from "@/lib/auth";

const roleLabels: Record<string, string> = {
  ADMIN: "Administrador",
  AGENT: "Agente",
  CLIENT: "Cliente",
  USER: "Usuário",
};

function getRoleLabel(role: string) {
  return roleLabels[role.toUpperCase()] ?? role;
}

function getRoleColor(role: string) {
  switch (role.toUpperCase()) {
    case "ADMIN":
      return "bg-violet-100 text-violet-900";
    case "AGENT":
      return "bg-sky-100 text-sky-900";
    default:
      return "bg-[#F2F6F3] text-[#4B5E54]";
  }
}

export default function UsuariosClient() {
  const [isDemo] = useState(isDemoMode);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Todos");
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getUsers(controller.signal)
      .then((response) => {
        if (!Array.isArray(response)) {
          throw new Error("A resposta da API de usuários é inválida.");
        }

        setUsers(response);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        if (reason instanceof Error) {
          setError(reason.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  const roles = useMemo(
    () => ["Todos", ...Array.from(new Set(users.map((user) => user.role)))],
    [users],
  );

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);
      const matchesRole = roleFilter === "Todos" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  return (
    <div className="min-h-screen bg-[#F5F7F4]">
      <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 sm:py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#0F3D2A] sm:text-3xl">
            Gerenciamento de usuários
          </h1>
          <p className="mt-2 text-sm text-[#4B5E54]">
            Gerencie os usuários do sistema
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#D8E1DA] bg-white">
          <div className="border-b border-[#D8E1DA] px-4 py-4 sm:px-6">
            <h2 className="text-lg font-semibold text-[#0F3D2A]">Usuários</h2>
          </div>

          <div className="flex flex-col gap-3 border-b border-[#D8E1DA] px-4 py-4 sm:flex-row sm:px-6">
            <div className="relative flex-1">
              <LuSearch
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5E54]"
              />
              <input
                type="search"
                placeholder="Buscar por nome ou e-mail..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-lg border border-[#D8E1DA] bg-white py-2 pl-10 pr-4 text-sm text-[#10241A] placeholder:text-[#718078] outline-none focus-visible:border-[#15803D] focus-visible:ring-2 focus-visible:ring-[#15803D]/20"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="w-full rounded-lg border border-[#D8E1DA] bg-white px-4 py-2 text-sm text-[#10241A] outline-none focus-visible:border-[#15803D] focus-visible:ring-2 focus-visible:ring-[#15803D]/20 sm:w-auto"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role === "Todos" ? "Todos os perfis" : getRoleLabel(role)}
                </option>
              ))}
            </select>
          </div>

          {isLoading && (
            <p className="p-8 text-center text-sm text-[#4B5E54]">
              Carregando usuários...
            </p>
          )}
          {error && (
            <p role="alert" className="p-8 text-center text-sm text-red-700">
              {error}
            </p>
          )}
          {!isLoading && !error && (
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[560px] border-collapse">
                <thead>
                  <tr className="border-b border-[#D8E1DA] bg-[#F2F6F3]">
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-[#4B5E54]"
                    >
                      Usuário
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-[#4B5E54]"
                    >
                      E-mail
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-[#4B5E54]"
                    >
                      Perfil
                    </th>
                    {!isDemo && (
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-semibold text-[#4B5E54]"
                      >
                        Ações
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6ECE7]">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-[#F2F6F3] motion-reduce:transition-none"
                    >
                      <td className="px-6 py-4 text-sm font-medium">
                        <span className="text-[#10241A]">{user.username}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3F5248]">
                        {user.email}
                      </td>
                      {!isDemo && (
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getRoleColor(user.role)}`}
                          >
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                      )}
                      <td className="px-6 py-4 text-sm">
                        <button
                          type="button"
                          onClick={() => setEditingUser(user)}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#0F3D2A] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#145A3E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] motion-reduce:transition-none"
                        >
                          <LuPen aria-hidden="true" />
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!isLoading && !error && filteredUsers.length === 0 && (
            <p className="p-8 text-center text-sm text-[#4B5E54]">
              Nenhum usuário encontrado.
            </p>
          )}
          {!isLoading && !error && filteredUsers.length > 0 && (
            <ul className="divide-y divide-[#E6ECE7] sm:hidden">
              {filteredUsers.map((user) => (
                <li
                  key={user.id}
                  className="flex min-w-0 items-start justify-between gap-3 px-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold text-[#10241A]">
                      {user.username}
                    </p>
                    <p className="mt-1 break-all text-xs text-[#3F5248]">
                      {user.email}
                    </p>
                    {!isDemo && (
                      <span
                        className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getRoleColor(user.role)}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingUser(user)}
                    aria-label={`Editar ${user.username}`}
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#0F3D2A] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#145A3E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] motion-reduce:transition-none"
                  >
                    <LuPen aria-hidden="true" />
                    <span className="hidden min-[360px]:inline">Editar</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {!isDemo && editingUser && (
        <EditUserRoleModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={(updatedUser) => {
            setUsers((currentUsers) =>
              currentUsers.map((user) =>
                user.id === updatedUser.id ? updatedUser : user,
              ),
            );
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
}
