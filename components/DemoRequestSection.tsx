"use client";

import { useState } from "react";
import { useForm as useFormspree } from "@formspree/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const demoRequestSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome completo.").max(120),
  email: z.email("Digite um e-mail válido."),
  organization: z
    .string()
    .trim()
    .min(2, "Informe sua empresa ou organização.")
    .max(120),
  department: z
    .string()
    .trim()
    .min(2, "Informe seu cargo ou departamento.")
    .max(120),
  profile: z.enum(["Administrador", "Gestor", "Agente de suporte", "Outro"], {
    error: "Selecione seu perfil.",
  }),
  consent: z
    .boolean()
    .refine((value) => value, "Autorize o uso dos dados para continuar."),
});

type DemoRequestData = z.infer<typeof demoRequestSchema>;

const steps = [
  {
    title: "Você solicita uma demonstração",
    description: "Conte um pouco sobre sua equipe e o que precisa.",
  },
  {
    title: "Nossa equipe entra em contato",
    description: "Combinamos um horário que funcione para você.",
  },
  {
    title: "Você conhece a plataforma funcionando",
    description: "Veja como organizar o suporte da sua empresa.",
  },
];

/* ---------- Estilos compartilhados ---------- */

const label = "block text-[13px] font-medium text-zinc-300";

const field =
  "mt-2 block w-full rounded-md border border-white/[0.12] bg-white/[0.03] px-3.5 py-2.5 text-base text-zinc-100 outline-none transition-colors " +
  "placeholder:text-zinc-600 hover:border-white/25 " +
  "focus:border-violet-300/70 focus:bg-white/[0.05] focus:ring-4 focus:ring-violet-300/10 " +
  "aria-[invalid=true]:border-red-400/60 aria-[invalid=true]:focus:ring-red-400/10 sm:text-[15px]";

const errorText = "mt-1.5 text-[13px] leading-5 text-red-300";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      fill="none"
      className={className}
    >
      <path
        d="M2.5 6.25 4.9 8.6 9.5 3.6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DemoRequestSection() {
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [formspreeState, formspreeSubmit] = useFormspree("mwlobwrd");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DemoRequestData>({
    resolver: zodResolver(demoRequestSchema),
    defaultValues: { consent: false },
  });

  const onSubmit = async (data: DemoRequestData) => {
    setFeedback(null);
    await formspreeSubmit({
      ...data,
      consent: "Autorizado",
      _subject: "Solicitação de demonstração — Chamou",
    });
  };
  const currentFeedback = formspreeState.succeeded
    ? {
        type: "success" as const,
        text: "Solicitação enviada com sucesso. Nossa equipe entrará em contato em breve.",
      }
    : formspreeState.errors
      ? {
          type: "error" as const,
          text: "Não foi possível enviar sua solicitação. Tente novamente mais tarde.",
        }
      : feedback;

  // A linha do tempo acompanha o formulário: ao enviar, a etapa 1 é concluída e a 2 passa a ser a atual.
  const activeStep = formspreeState.succeeded ? 1 : 0;

  return (
    <section
      id="demonstracao"
      aria-labelledby="demo-request-title"
      className="border-y border-white/[0.08]"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-14 px-4 py-20 sm:px-8 sm:py-24 lg:grid-cols-[5fr_6fr] lg:gap-0 lg:py-28">
        {/* ---------- Coluna informativa ---------- */}
        <div className="lg:sticky lg:top-24 lg:self-start lg:pr-16">
          <h2
            id="demo-request-title"
            className="max-w-md text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.035em] text-zinc-50 sm:text-4xl lg:text-[2.6rem]"
          >
            Conheça nossa plataforma em funcionamento
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-zinc-400">
            Solicite uma apresentação personalizada e descubra como o Chamou
            pode ajudar sua equipe a organizar o suporte.
          </p>

          <ol className="mt-12 max-w-md">
            {steps.map((step, index) => {
              const done = index < activeStep;
              const current = index === activeStep;
              const last = index === steps.length - 1;

              return (
                <li
                  key={step.title}
                  aria-current={current ? "step" : undefined}
                  className={`relative pl-12 ${last ? "" : "pb-9"}`}
                >
                  {!last && (
                    <span
                      aria-hidden="true"
                      className={`absolute left-[13px] top-8 bottom-1 w-px transition-colors duration-500 ${
                        done ? "bg-violet-300/50" : "bg-white/[0.1]"
                      }`}
                    />
                  )}
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-0 grid h-[27px] w-[27px] place-items-center rounded-full border text-xs font-medium tabular-nums transition-colors duration-500 ${
                      done
                        ? "border-violet-300 bg-violet-300 text-violet-950"
                        : current
                          ? "border-violet-300/70 text-violet-300"
                          : "border-white/[0.15] text-zinc-500"
                    }`}
                  >
                    {done ? <CheckIcon className="h-3 w-3" /> : index + 1}
                  </span>
                  <h3
                    className={`pt-[3px] text-[15px] font-medium leading-5 transition-colors duration-500 ${
                      done || current ? "text-zinc-100" : "text-zinc-400"
                    }`}
                  >
                    <span className="sr-only">{`Etapa ${index + 1}${done ? " (concluída)" : current ? " (atual)" : ""}: `}</span>
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-zinc-500">
                    {step.description}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>

        {/* ---------- Formulário ---------- */}
        <div className="border-t border-white/[0.08] pt-12 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0">
          <div className="max-w-xl">
            <h3 className="text-xl font-semibold tracking-[-0.02em] text-zinc-50">
              Solicite sua apresentação
            </h3>
            <p className="mt-1.5 text-sm leading-6 text-zinc-500">
              Preencha seus dados para começarmos a conversa.
            </p>

            <form
              noValidate
              onSubmit={handleSubmit(onSubmit)}
              className="mt-8 space-y-5"
            >
              <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="demo-name" className={label}>
                    Nome completo
                  </label>
                  <input
                    id="demo-name"
                    autoComplete="name"
                    placeholder="Seu nome"
                    aria-invalid={!!errors.name}
                    aria-describedby={
                      errors.name ? "demo-name-error" : undefined
                    }
                    {...register("name")}
                    className={field}
                  />
                  {errors.name && (
                    <p id="demo-name-error" className={errorText}>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="demo-email" className={label}>
                    E-mail corporativo
                  </label>
                  <input
                    id="demo-email"
                    type="email"
                    autoComplete="email"
                    placeholder="voce@empresa.com"
                    aria-invalid={!!errors.email}
                    aria-describedby={
                      errors.email ? "demo-email-error" : undefined
                    }
                    {...register("email")}
                    className={field}
                  />
                  {errors.email && (
                    <p id="demo-email-error" className={errorText}>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="demo-organization" className={label}>
                    Empresa ou organização
                  </label>
                  <input
                    id="demo-organization"
                    autoComplete="organization"
                    placeholder="Nome da empresa"
                    aria-invalid={!!errors.organization}
                    aria-describedby={
                      errors.organization
                        ? "demo-organization-error"
                        : undefined
                    }
                    {...register("organization")}
                    className={field}
                  />
                  {errors.organization && (
                    <p id="demo-organization-error" className={errorText}>
                      {errors.organization.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="demo-department" className={label}>
                    Cargo ou departamento
                  </label>
                  <input
                    id="demo-department"
                    autoComplete="organization-title"
                    placeholder="Ex.: Gerência de TI"
                    aria-invalid={!!errors.department}
                    aria-describedby={
                      errors.department ? "demo-department-error" : undefined
                    }
                    {...register("department")}
                    className={field}
                  />
                  {errors.department && (
                    <p id="demo-department-error" className={errorText}>
                      {errors.department.message}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="demo-profile" className={label}>
                    Perfil
                  </label>
                  <div className="relative">
                    <select
                      id="demo-profile"
                      aria-invalid={!!errors.profile}
                      aria-describedby={
                        errors.profile ? "demo-profile-error" : undefined
                      }
                      {...register("profile")}
                      className={`${field} cursor-pointer appearance-none pr-10 has-[option[value='']:checked]:text-zinc-600`}
                    >
                      <option value="" className="bg-[#100C1A] text-zinc-400">
                        Selecione seu perfil
                      </option>
                      <option
                        value="Administrador"
                        className="bg-[#100C1A] text-zinc-100"
                      >
                        Administrador
                      </option>
                      <option
                        value="Gestor"
                        className="bg-[#100C1A] text-zinc-100"
                      >
                        Gestor
                      </option>
                      <option
                        value="Agente de suporte"
                        className="bg-[#100C1A] text-zinc-100"
                      >
                        Agente de suporte
                      </option>
                      <option
                        value="Outro"
                        className="bg-[#100C1A] text-zinc-100"
                      >
                        Outro
                      </option>
                    </select>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="pointer-events-none absolute right-3.5 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-zinc-500"
                    >
                      <path
                        d="m4 6.25 4 3.75 4-3.75"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  {errors.profile && (
                    <p id="demo-profile-error" className={errorText}>
                      {errors.profile.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-white/[0.08] pt-5">
                <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-zinc-400">
                  <span className="relative mt-1 flex h-4 w-4 shrink-0">
                    <input
                      type="checkbox"
                      aria-invalid={!!errors.consent}
                      aria-describedby={
                        errors.consent ? "demo-consent-error" : undefined
                      }
                      {...register("consent")}
                      className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-[4px] border border-white/25 bg-white/[0.03] transition-colors hover:border-white/50 checked:border-violet-300 checked:bg-violet-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 aria-[invalid=true]:border-red-400/70"
                    />
                    <CheckIcon className="pointer-events-none absolute inset-0 m-auto h-3 w-3 text-violet-950 opacity-0 transition-opacity peer-checked:opacity-100" />
                  </span>
                  <span>
                    Autorizo o uso dos meus dados de contato para tratar desta
                    solicitação.{" "}
                    <a
                      href="#demo-privacy"
                      className="font-medium text-zinc-200 underline decoration-white/30 underline-offset-[3px] transition-colors hover:text-violet-300 hover:decoration-violet-300/60 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                    >
                      Política de privacidade
                    </a>
                  </span>
                </label>
                {errors.consent && (
                  <p id="demo-consent-error" className={`${errorText} pl-7`}>
                    {errors.consent.message}
                  </p>
                )}
              </div>

              {currentFeedback && (
                <p
                  role={currentFeedback.type === "error" ? "alert" : "status"}
                  className={`rounded-r-md border-l-2 py-2.5 pl-3.5 pr-3 text-sm leading-6 ${
                    currentFeedback.type === "error"
                      ? "border-red-400 bg-red-400/[0.07] text-red-200"
                      : "border-violet-300 bg-violet-300/[0.07] text-violet-100"
                  }`}
                >
                  {currentFeedback.text}
                </p>
              )}

              <button
                type="submit"
                disabled={formspreeState.submitting}
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-md bg-violet-300 px-5 py-3 text-sm font-semibold text-violet-950 transition-colors hover:bg-violet-200 active:bg-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#100C1A] disabled:cursor-wait disabled:opacity-70 disabled:hover:bg-violet-300"
              >
                {formspreeState.submitting && (
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin rounded-full border-2 border-violet-950/25 border-t-violet-950 motion-reduce:animate-none"
                  />
                )}
                {formspreeState.submitting
                  ? "Enviando solicitação…"
                  : "Solicitar demonstração"}
              </button>

              <p
                id="demo-privacy"
                className="text-[13px] leading-5 text-zinc-500"
              >
                Os dados informados serão usados somente para responder sobre a
                demonstração.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
