"use client";

import { driver, type DriveStep } from "driver.js";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { isDemoMode } from "@/lib/auth";
import "driver.js/dist/driver.css";
import "./demo-tour.css";

const DISMISSED_KEY = "demo-tour-dismissed";
const DISMISSED_EVENT = "demo-tour-dismissed-change";

const highlights = [
  "Tabela de tickets",
  "Criação de chamados",
  "Gerenciamento de usuários",
  "Chat com IA e RAG",
];

export function DemoTourPrompt() {
  const visible = useSyncExternalStore(
    (callback) => {
      window.addEventListener(DISMISSED_EVENT, callback);
      return () => window.removeEventListener(DISMISSED_EVENT, callback);
    },
    () => {
      try {
        return isDemoMode() && sessionStorage.getItem(DISMISSED_KEY) !== "1";
      } catch {
        return isDemoMode();
      }
    },
    () => false,
  );
  const startRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    try {
      sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // ignora
    }
    window.dispatchEvent(new Event(DISMISSED_EVENT));
  };

  useEffect(() => {
    if (!visible) return;
    startRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#0F3D2A]/60 p-4 backdrop-blur-[2px] sm:items-center"
      onClick={close}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-tour-title"
        aria-describedby="demo-tour-desc"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white text-zinc-900 shadow-2xl dark:bg-zinc-900 dark:text-white"
      >
        <div className="flex items-center gap-3 bg-[#0F3D2A] px-6 py-4 text-white">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#22C55E]/20 text-[#22C55E]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
            </svg>
          </span>
          <span className="text-sm font-medium text-white/90">
            Modo demonstração
          </span>
        </div>

        <div className="px-6 pb-6 pt-5">
          <h2
            id="demo-tour-title"
            className="text-xl font-semibold tracking-tight text-[#0F3D2A] dark:text-white"
          >
            Quer conhecer o Chamou em 1 minuto?
          </h2>
          <p
            id="demo-tour-desc"
            className="mt-2 text-sm text-[#4B5E54] dark:text-zinc-400"
          >
            Um tour rápido mostra onde fica cada recurso. Você pode sair quando
            quiser.
          </p>

          <ul className="mt-4 space-y-2 text-sm">
            {highlights.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2.5 text-zinc-700 dark:text-zinc-300"
              >
                <svg
                  viewBox="0 0 20 20"
                  className="h-4 w-4 shrink-0 text-[#15803D]"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0z" />
                </svg>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={close}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-[#4B5E54] transition hover:bg-[#F2F6F3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15803D] dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Agora não
            </button>
            <button
              ref={startRef}
              type="button"
              onClick={() => {
                close();
                startDemoTour();
              }}
              className="rounded-lg bg-[#15803D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#116A32] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15803D]"
            >
              Iniciar tour
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

const allSteps: DriveStep[] = [
  {
    element: '[data-tour="tickets-table"]',
    popover: {
      title: "Tabela de tickets",
      description: "Acompanhe status, prioridade e responsável de cada ticket.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="create-ticket"]',
    popover: {
      title: "Criar ticket",
      description:
        "Abra um novo ticket por aqui. No demo, a criação é simulada.",
      side: "bottom",
      align: "end",
    },
  },
  {
    element: '[data-tour="manage-users"]',
    popover: {
      title: "Gerenciar usuários",
      description: "Consulte os usuários de demonstração.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="ai-chat"]',
    popover: {
      title: "Chat com IA e RAG",
      description:
        "O RAG busca trechos relevantes na base de conhecimento e entrega esse contexto à IA, para respostas mais precisas.",
      side: "left",
      align: "end",
    },
  },
  {
    popover: {
      title: "Tudo pronto",
      description:
        "Explore o demo à vontade. Você pode rever o tour recarregando a página.",
    },
  },
];

export function startDemoTour() {
  // Ignora passos cujo elemento não existe na tela atual (evita popover solto).
  const steps = allSteps.filter(
    (s) => !s.element || document.querySelector(s.element as string),
  );

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const driverObj = driver({
    steps,
    popoverClass: "chamou-tour",
    animate: !reduceMotion,
    smoothScroll: !reduceMotion,
    overlayColor: "#0F3D2A",
    overlayOpacity: 0.65,
    stagePadding: 8,
    stageRadius: 10,
    showProgress: true,
    progressText: "{{current}} de {{total}}",
    allowClose: true,
    nextBtnText: "Próximo",
    prevBtnText: "Anterior",
    doneBtnText: "Concluir",
  });

  driverObj.drive();
}
