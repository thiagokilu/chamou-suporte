"use client";

import { useState } from "react";
import { LuCamera, LuCheck, LuX } from "react-icons/lu";
import { updateProfile } from "@/lib/http/auth/updateProfile";

interface UserProfile {
  name: string;
  email: string;
  role: "Admin" | "Agent" | "User";
  avatar: string;
}

const initialProfile: UserProfile = {
  name: "Admin",
  email: "admin@tickets.com",
  role: "Admin",
  avatar: "",
};

export default function EditProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [originalProfile, setOriginalProfile] =
    useState<UserProfile>(initialProfile);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const getAvatarInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-violet-100 text-violet-900";
      case "Agent":
        return "bg-sky-100 text-sky-900";
      case "User":
        return "bg-[#F2F6F3] text-[#4B5E54]";
      default:
        return "bg-[#F2F6F3] text-[#4B5E54]";
    }
  };

  const handleNameChange = (value: string) => {
    setProfile({ ...profile, name: value });
    setHasChanges(true);
  };

  const handleAvatarChange = () => {
    // Simulação de upload de avatar
    const newAvatar = "avatar-uploaded";
    setProfile({ ...profile, avatar: newAvatar });
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateProfile(profile.name);
      setOriginalProfile(profile);
      setHasChanges(false);
      setShowSuccess(true);
      setShowError(false);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      setShowError(true);
      setErrorMessage(
        error instanceof Error ? error.message : "Erro ao atualizar perfil",
      );
      setTimeout(() => setShowError(false), 5000);
    }
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setHasChanges(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F7F4]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#0F3D2A]">
            Editar Perfil
          </h1>
          <p className="mt-2 text-sm text-[#4B5E54]">
            Atualize suas informações pessoais
          </p>
        </div>

        {showSuccess && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <LuCheck aria-hidden="true" className="text-emerald-800" />
            <p className="text-sm text-emerald-900">
              Perfil atualizado com sucesso!
            </p>
          </div>
        )}

        {showError && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
            <LuX aria-hidden="true" className="text-rose-800" />
            <p className="text-sm text-rose-900">{errorMessage}</p>
          </div>
        )}

        <div className="max-w-2xl">
          <div className="overflow-hidden rounded-2xl border border-[#D8E1DA] bg-white">
            <div className="border-b border-[#D8E1DA] px-6 py-4">
              <h2 className="text-lg font-semibold text-[#0F3D2A]">
                Informações pessoais
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Foto de perfil
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 text-3xl font-bold">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt="Avatar"
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      getAvatarInitials(profile.name)
                    )}
                  </div>
                  <button
                    onClick={handleAvatarChange}
                    className="absolute bottom-0 right-0 rounded-full bg-zinc-700 p-2 text-zinc-300 hover:bg-zinc-600 hover:text-zinc-100 transition-colors"
                    title="Trocar foto"
                  >
                    <LuCamera size={16} />
                  </button>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-50">
                    Foto de perfil
                  </h3>
                  <p className="mt-1 text-xs text-zinc-400">
                    Clique no ícone para trocar sua foto
                  </p>
                </div>
              </div> */}

              {/* Nome completo */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#3F5248]">
                  Nome completo
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full rounded-lg border border-[#D8E1DA] bg-white px-4 py-2.5 text-sm text-[#10241A] placeholder:text-[#718078] outline-none focus-visible:border-[#15803D] focus-visible:ring-2 focus-visible:ring-[#15803D]/20"
                  placeholder="Seu nome completo"
                />
              </div>

              {/* E-mail (somente leitura) */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#3F5248]">
                  E-mail
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-[#D8E1DA] bg-[#F2F6F3] px-4 py-2.5 text-sm text-[#4B5E54]"
                  placeholder="seu@email.com"
                />
                <p className="mt-1 text-xs text-[#4B5E54]">
                  O e-mail não pode ser alterado
                </p>
              </div>

              {/* Cargo/Role (somente leitura) */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#3F5248]">
                  Cargo
                </label>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-sm font-medium ${getRoleColor(profile.role)}`}
                  >
                    {profile.role}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#4B5E54]">
                  Seu cargo é definido pelo administrador do sistema
                </p>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex items-center justify-end gap-3 border-t border-[#D8E1DA] px-6 py-4">
              <button
                onClick={handleCancel}
                disabled={!hasChanges}
                className="rounded-lg border border-[#15803D] px-4 py-2 text-sm font-semibold text-[#0F3D2A] transition-colors hover:bg-[#DDF3E4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="rounded-lg bg-[#15803D] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#116A32] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
              >
                Salvar alterações
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
