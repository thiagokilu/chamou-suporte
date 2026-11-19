"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import chamouLogo from "@/assets/img/chamoulogo.png";
import { toast } from "sonner";

const registerSchema = z
  .object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const inputBase =
  "mt-1.5 block w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#10241A] placeholder:text-[#87958D] transition focus:outline-none focus:ring-2";
const inputOk = "border-[#D8E1DA] focus:border-[#15803D] focus:ring-[#15803D]/20";
const inputBad = "border-red-400 focus:border-red-500 focus:ring-red-500/20";

export default function RegisterForm() {
  useEffect(() => {
    toast.warning("A API no Render pode levar até 5 minutos para iniciar. A primeira requisição pode demorar.", {
      id: "render-api-warning",
      duration: 8000,
    });
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (_data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    const form = document.getElementById("register-form") as HTMLFormElement | null;
    if (!form) return;

    // FormSubmit envia os campos por e-mail; nunca encaminhar senhas em texto puro.
    form.querySelector<HTMLInputElement>("#password")?.removeAttribute("name");
    form.querySelector<HTMLInputElement>("#confirmPassword")?.removeAttribute("name");
    HTMLFormElement.prototype.submit.call(form);
  };

  return (
    <main className="grid min-h-screen bg-[#F5F7F4] lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#0F3D2A] px-12 py-10 text-white lg:flex xl:px-16">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#0F3D2A]">
            <Image src={chamouLogo} alt="Chamou Suporte de TI" width={2000} height={617} priority className="h-auto w-40 brightness-0 invert" />
          </Link>
        </div>

        <div className="my-12 max-w-xl">
          <h2 className="max-w-lg text-4xl font-semibold leading-[1.12] tracking-tight xl:text-5xl">
            Do primeiro pedido até a solução, tudo acompanhado.
          </h2>
          <p className="mt-4 max-w-md text-base leading-7 text-emerald-50/75">
            Crie seu acesso para conversar com a equipe e acompanhar o andamento dos seus chamados.
          </p>

          <div aria-hidden="true" className="mt-9 max-w-lg border-l border-white/20 pl-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-medium text-emerald-50/65">Exemplo · Chamado #2048</span>
              <span className="inline-flex items-center gap-2 text-xs font-medium text-[#BDEBC9]">
                <span className="h-2 w-2 rounded-full bg-[#7ED99A]" /> Em atendimento
              </span>
            </div>
            <p className="mt-3 text-lg font-semibold text-white">Acesso ao e-mail</p>
            <p className="mt-1 text-sm text-emerald-50/65">A equipe já está verificando a solicitação.</p>
            <div className="mt-6 flex items-center gap-3 text-xs">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7ED99A] text-[#0F3D2A]">
                <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="m3 8 3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-white/85">Recebido</span>
              <span className="h-px flex-1 bg-white/25" />
              <span className="h-2.5 w-2.5 rounded-full border-2 border-[#7ED99A] bg-[#0F3D2A]" />
              <span className="text-[#BDEBC9]">Em análise</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-white/55">Suporte de TI para sua equipe</p>
      </aside>

      <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 lg:hidden">
            <Image src={chamouLogo} alt="Chamou Suporte de TI" width={2000} height={617} priority className="h-auto w-40" />
          </div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-[#0F3D2A]">Crie sua conta</h1>
            <p className="mt-2 text-sm leading-6 text-[#4B5E54]">Preencha seus dados para acessar a central de suporte.</p>
          </div>

          <form id="register-form" action="https://formspree.io/f/mwlobwrd" method="POST" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-[#263B30]">Nome completo</label>
              <input id="name" type="text" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} {...register("name")} className={`${inputBase} ${errors.name ? inputBad : inputOk}`} placeholder="Seu nome completo" />
              {errors.name && <p id="name-error" className="mt-1.5 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#263B30]">Email</label>
              <input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} {...register("email")} className={`${inputBase} ${errors.email ? inputBad : inputOk}`} placeholder="seu@email.com" />
              {errors.email && <p id="email-error" className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#263B30]">Senha</label>
              <input id="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} aria-describedby={errors.password ? "password-error" : undefined} {...register("password")} className={`${inputBase} ${errors.password ? inputBad : inputOk}`} placeholder="Mínimo de 6 caracteres" />
              {errors.password && <p id="password-error" className="mt-1.5 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#263B30]">Confirme sua senha</label>
              <input id="confirmPassword" type="password" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined} {...register("confirmPassword")} className={`${inputBase} ${errors.confirmPassword ? inputBad : inputOk}`} placeholder="Digite a senha novamente" />
              {errors.confirmPassword && <p id="confirm-password-error" className="mt-1.5 text-sm text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <button type="submit" disabled={isLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#15803D] px-3 py-3.5 text-sm font-semibold text-white shadow-sm shadow-[#15803D]/15 transition-colors hover:bg-[#116A32] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15803D] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none">
              {isLoading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#4B5E54]">
            Já tem uma conta? <Link href="/login" className="rounded-sm font-semibold text-[#15803D] underline-offset-4 hover:text-[#116A32] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] focus-visible:ring-offset-2">Entrar</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
