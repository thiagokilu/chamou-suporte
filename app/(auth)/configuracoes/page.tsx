"use client";

import { useState } from "react";
import {
  LuMonitor,
  LuMoon,
  LuSun,
  LuGlobe,
  LuBell,
  LuSettings,
  LuCheck,
  LuRotateCcw,
} from "react-icons/lu";
import { useTheme } from "next-themes";

interface Settings {
  theme: "light" | "dark" | "system";
  language: "pt-BR" | "en" | "es";
  emailNotifications: boolean;
  replyNotifications: boolean;
  statusNotifications: boolean;
  itemsPerPage: "10" | "25" | "50";
  confirmActions: boolean;
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY";
}

const defaultSettings: Settings = {
  theme: "dark",
  language: "pt-BR",
  emailNotifications: true,
  replyNotifications: true,
  statusNotifications: true,
  itemsPerPage: "10",
  confirmActions: true,
  dateFormat: "DD/MM/YYYY",
};

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { theme, setTheme } = useTheme();
  const selectedTheme =
    theme === "light" || theme === "dark" || theme === "system"
      ? theme
      : settings.theme;

  const handleSettingChange = <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => {
    setSettings({ ...settings, [key]: value });
    if (key === "theme") {
      setTheme(value as Settings["theme"]);
    }
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleRestoreDefaults = () => {
    setSettings(defaultSettings);
    setTheme(defaultSettings.theme);
    setHasChanges(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case "light":
        return <LuSun />;
      case "dark":
        return <LuMoon />;
      case "system":
        return <LuMonitor />;
      default:
        return <LuMonitor />;
    }
  };

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case "pt-BR":
        return "Português (Brasil)";
      case "en":
        return "Inglês";
      case "es":
        return "Espanhol";
      default:
        return lang;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto w-full max-w-4xl px-3 py-5 sm:px-6 sm:py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Configurações
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Personalize sua experiência no sistema
          </p>
        </div>

        {showSuccess && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900/50 dark:bg-green-900/20">
            <LuCheck className="text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-700 dark:text-green-300">
              Configurações salvas com sucesso!
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* Aparência */}
          <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-4 dark:border-zinc-800 sm:px-6">
              <LuMonitor className="text-zinc-600 dark:text-zinc-400" />
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Aparência
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <div>
                <label className="mb-3 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Tema
                </label>
                <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-3 sm:gap-3">
                  {["light", "dark", "system"].map((themeOption) => (
                    <button
                      key={themeOption}
                      onClick={() =>
                        handleSettingChange(
                          "theme",
                          themeOption as "light" | "dark" | "system",
                        )
                      }
                      className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                        selectedTheme === themeOption
                          ? "border-zinc-400 bg-zinc-100 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
                          : "border-zinc-300 bg-zinc-50 text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
                      }`}
                    >
                      {getThemeIcon(themeOption)}
                      {themeOption === "light" && "Claro"}
                      {themeOption === "dark" && "Escuro"}
                      {themeOption === "system" && "Sistema"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Idioma */}
          <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-4 dark:border-zinc-800 sm:px-6">
              <LuGlobe className="text-zinc-600 dark:text-zinc-400" />
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Idioma
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <div>
                <label className="mb-3 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Idioma da interface
                </label>
                <select
                  value={settings.language}
                  onChange={(e) =>
                    handleSettingChange(
                      "language",
                      e.target.value as "pt-BR" | "en" | "es",
                    )
                  }
                  className="w-full max-w-xs rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en">Inglês</option>
                  <option value="es">Espanhol</option>
                </select>
                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-500">
                  Idioma atual: {getLanguageLabel(settings.language)}
                </p>
              </div>
            </div>
          </div>

          {/* Notificações */}
          <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-4 dark:border-zinc-800 sm:px-6">
              <LuBell className="text-zinc-600 dark:text-zinc-400" />
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Notificações
              </h2>
            </div>
            <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Notificações por e-mail
                  </h3>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-500">
                    Receba atualizações importantes no seu e-mail
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleSettingChange(
                      "emailNotifications",
                      !settings.emailNotifications,
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.emailNotifications
                      ? "bg-zinc-600"
                      : "bg-zinc-300 dark:bg-zinc-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.emailNotifications
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Respostas nos tickets
                  </h3>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-500">
                    Seja notificado quando houver novas respostas
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleSettingChange(
                      "replyNotifications",
                      !settings.replyNotifications,
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.replyNotifications
                      ? "bg-zinc-600"
                      : "bg-zinc-300 dark:bg-zinc-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.replyNotifications
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Alterações de status
                  </h3>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-500">
                    Receba alertas quando o status do ticket mudar
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleSettingChange(
                      "statusNotifications",
                      !settings.statusNotifications,
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.statusNotifications
                      ? "bg-zinc-600"
                      : "bg-zinc-300 dark:bg-zinc-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.statusNotifications
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Preferências */}
          <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-4 dark:border-zinc-800 sm:px-6">
              <LuSettings className="text-zinc-600 dark:text-zinc-400" />
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Preferências
              </h2>
            </div>
            <div className="space-y-6 p-4 sm:p-6">
              <div>
                <label className="mb-3 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Itens por página
                </label>
                <div className="flex gap-2 sm:gap-3">
                  {["10", "25", "50"].map((items) => (
                    <button
                      key={items}
                      onClick={() =>
                        handleSettingChange(
                          "itemsPerPage",
                          items as "10" | "25" | "50",
                        )
                      }
                      className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                        settings.itemsPerPage === items
                          ? "border-zinc-400 bg-zinc-100 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
                          : "border-zinc-300 bg-zinc-50 text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
                      }`}
                    >
                      {items}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Confirmação de ações
                  </h3>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-500">
                    Solicitar confirmação antes de ações importantes
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleSettingChange(
                      "confirmActions",
                      !settings.confirmActions,
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.confirmActions
                      ? "bg-zinc-600"
                      : "bg-zinc-300 dark:bg-zinc-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.confirmActions
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Formato de data
                </label>
                <div className="flex gap-2 sm:gap-3">
                  {["DD/MM/YYYY", "MM/DD/YYYY"].map((format) => (
                    <button
                      key={format}
                      onClick={() =>
                        handleSettingChange(
                          "dateFormat",
                          format as "DD/MM/YYYY" | "MM/DD/YYYY",
                        )
                      }
                      className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                        settings.dateFormat === format
                          ? "border-zinc-400 bg-zinc-100 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
                          : "border-zinc-300 bg-zinc-50 text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button
              onClick={handleRestoreDefaults}
              className="flex min-h-10 items-center justify-center gap-2 rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 sm:justify-start"
            >
              <LuRotateCcw />
              Restaurar padrões
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="min-h-10 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Salvar preferências
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
