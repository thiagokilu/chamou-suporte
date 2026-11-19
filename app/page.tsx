"use client";

import Image from "next/image";
import { Sora, Manrope } from "next/font/google";
import { useSyncExternalStore } from "react";
import chamouLogo from "../assets/img/chamoulogo.png";
import DemoRequestSection from "@/components/DemoRequestSection";
import HeroSection from "@/components/HeroSection";
import Header from "@/components/Header";
import {
  Bot,
  BrainCircuit,
  History,
  Database,
  LayoutDashboard,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Rotas de autenticação já existentes no projeto.                     */
/* Ajuste aqui se os caminhos forem diferentes.                        */
/* ------------------------------------------------------------------ */
const display = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});
const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* ------------------------------ Ícones ----------------------------- */

type IconProps = { className?: string };

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const IconPlus = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);
const IconTrack = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
const IconFlag = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
  </svg>
);
const IconChat = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M4 5h16v11H9l-5 4V5z" />
  </svg>
);
const IconChart = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
);
function Logo({
  inverted = false,
  compact = false,
}: {
  inverted?: boolean;
  compact?: boolean;
}) {
  return (
    <Image
      src={chamouLogo}
      alt="Chamou - Suporte de TI"
      width={2000}
      height={617}
      className={`h-auto ${compact ? "w-[84px] sm:w-[120px] md:w-[150px]" : "w-[150px] sm:w-[170px]"} ${inverted ? "brightness-0 invert" : "dark:brightness-0 dark:invert"}`}
      priority
    />
  );
}

function CurrentYear() {
  return useSyncExternalStore(
    () => () => {},
    () => new Date().getFullYear(),
    () => null,
  );
}

/* ----------------------------- Conteúdo ---------------------------- */

const funcionalidades = [
  {
    titulo: "Classificação inteligente com IA",
    texto:
      "A inteligência artificial analisa o título e a descrição de cada chamado para identificar automaticamente o nível de prioridade, agilizando a triagem e ajudando a equipe a focar no que realmente importa.",
    Icon: BrainCircuit,
    prioridades: [
      { nome: "Baixa", dot: "bg-blue-400" },
      { nome: "Média", dot: "bg-yellow-400" },
      { nome: "Alta", dot: "bg-orange-400" },
      { nome: "Urgente", dot: "bg-red-400" },
    ],
  },
  {
    titulo: "Assistente virtual inteligente",
    texto:
      "Converse com um assistente baseado em IA que utiliza informações dos chamados para responder perguntas, consultar atendimentos e auxiliar na resolução de problemas.",
    Icon: Bot,
  },
  {
    titulo: "Base de conhecimento com RAG",
    texto:
      "A IA consulta documentos e materiais técnicos por meio de busca semântica, recuperando informações relevantes para gerar respostas mais contextualizadas e úteis.",
    Icon: Database,
  },
  {
    titulo: "Gerenciamento centralizado",
    texto:
      "Organize chamados em um único ambiente, acompanhe status, responsáveis, categorias e prioridades durante todas as etapas do atendimento.",
    Icon: LayoutDashboard,
  },
  {
    titulo: "Histórico e rastreabilidade",
    texto:
      "Acompanhe todas as alterações realizadas em cada chamado, mantendo o registro das movimentações e facilitando o acompanhamento dos atendimentos.",
    Icon: History,
  },
];

/* -------------------------------- Página --------------------------- */

export default function Home() {
  return (
    <div
      className={`${body.className} flex min-h-screen flex-col overflow-x-clip bg-[#000000] text-zinc-100 selection:bg-violet-400/30 selection:text-violet-50`}
    >
      <Header />

      <main className="flex-1 bg-[#000000]">
        <HeroSection />

        {/* --------------------------- Funcionalidades -------------------------- */}
        <section
          id="funcionalidades"
          className="relative border-y border-white/[0.07] bg-[#000000]"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/40 to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-1/3 -z-0 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-600/10 blur-[110px]"
          />

          <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20 lg:py-28">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <h2
                className={`${display.className} max-w-md text-3xl font-semibold leading-tight tracking-[-0.035em] text-zinc-50 sm:text-4xl`}
              >
                Um fluxo completo, sem perder o contexto.
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-7 text-zinc-400 sm:text-base">
                Do primeiro chamado até a resolução, cada detalhe no lugar certo
                e cada pessoa na mesma página.
              </p>
            </div>

            <ul className="relative">
              {/* trilho que conecta as etapas do fluxo */}
              <div
                aria-hidden="true"
                className="absolute bottom-8 left-5 top-8 w-px bg-gradient-to-b from-violet-300/50 via-violet-400/20 to-transparent"
              />
              {funcionalidades.map(({ titulo, texto, Icon, prioridades }) => (
                <li
                  key={titulo}
                  className="group relative flex gap-5 py-6 sm:gap-7 sm:py-7"
                >
                  <span className="relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-300/25 bg-[#150F26] text-violet-200 shadow-[0_0_24px_-10px_rgba(139,92,246,0.9)] transition-colors group-hover:border-violet-300/50 group-hover:bg-[#1D1438]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3
                      className={`${display.className} text-lg font-semibold tracking-tight text-zinc-50`}
                    >
                      {titulo}
                    </h3>
                    <p className="mt-1.5 max-w-xl text-sm leading-6 text-zinc-400">
                      {texto}
                    </p>
                    {prioridades && (
                      <ul
                        className="mt-4 flex flex-wrap gap-2"
                        aria-label="Níveis de prioridade"
                      >
                        {prioridades.map((p) => (
                          <li
                            key={p.nome}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-zinc-300"
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${p.dot}`}
                            />
                            {p.nome}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <DemoRequestSection />
      </main>

      {/* ------------------------------ Footer ------------------------------ */}
      <footer className="border-t border-violet-300/10 bg-[#000000] text-violet-50">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-7 px-4 py-10 sm:px-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-sm">
            <Logo inverted />
            <p className="mt-4 text-sm leading-relaxed text-zinc-500">
              Plataforma de gerenciamento de chamados de suporte de TI.
            </p>
          </div>
          <p className="text-xs text-zinc-600">
            © <CurrentYear /> Chamou – Suporte de TI. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
