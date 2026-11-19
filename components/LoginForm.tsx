"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { login } from "@/lib/http/auth/login";
import { getMe } from "@/lib/http/auth/me";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  enterDemoMode,
  getUserFromToken,
  normalizeUser,
  setStoredToken,
  setStoredUser,
} from "@/lib/auth";
import Image from "next/image";
import chamouLogo from "@/assets/img/chamoulogo.png";
import { toast } from "sonner";
import { useEffect } from "react";

type LoginResponse = {
  token?: string;
  accessToken?: string;
  access_token?: string;
};

const loginSchema = z.object({
  email: z.email("Digite um email válido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const inputBase =
  "mt-1.5 block w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#10241A] placeholder:text-[#87958D] transition focus:outline-none focus:ring-2";
const inputOk =
  "border-[#D8E1DA] focus:border-[#15803D] focus:ring-[#15803D]/20";
const inputBad = "border-red-400 focus:border-red-500 focus:ring-red-500/20";

export default function LoginForm() {
  const router = useRouter();

  useEffect(() => {
    toast.warning(
      "A API no Render pode levar até 5 minutos para iniciar. A primeira requisição pode demorar.",
      {
        id: "render-api-warning",
        duration: 8000,
      },
    );
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await login<LoginResponse>(data.email, data.password);
      const token =
        response.token ?? response.accessToken ?? response.access_token;

      if (!token) {
        throw new Error("O login não retornou um token de autenticação.");
      }

      setStoredToken(token);

      const profile = await getMe<unknown>(token);
      const user = normalizeUser(profile);
      setStoredUser(user);
      switch (user?.role ?? getUserFromToken()?.role) {
        case "ADMIN":
          router.push("/admin");
          break;
        case "AGENT":
          router.push("/agent");
          break;
        case "CLIENT":
          router.push("/client");
          break;
        default:
          router.push("/");
      }
    } catch (err) {
      setStoredToken(null);
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const onEnterDemo = () => {
    setError(null);
    enterDemoMode();
    // A navegação completa envia o cookie recém gravado ao servidor e evita
    // reaproveitar uma resposta RSC de /admin gerada antes de entrar no demo.
    window.location.assign("/admin");
  };

  return (
    <main className="grid min-h-screen bg-[#F5F7F4] lg:grid-cols-[1.05fr_0.95fr]">
      {/* Painel lateral */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#0F3D2A] px-12 py-10 text-white lg:flex xl:px-16">
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#0F3D2A]"
          >
            <Image
              src={chamouLogo}
              alt="Chamou Suporte de TI"
              width={2000}
              height={617}
              priority
              className="h-auto w-40 brightness-0 invert"
            />
          </Link>
        </div>

        <div className="my-12 max-w-xl">
          <p className="max-w-lg text-4xl font-semibold leading-[1.12] tracking-tight xl:text-5xl">
            Acompanhe seu suporte sem perder o fio.
          </p>
          <p className="mt-4 max-w-md text-base leading-7 text-emerald-50/75">
            Seus pedidos e as atualizações da equipe ficam reunidos em um só
            lugar.
          </p>

          <div
            aria-hidden="true"
            className="mt-9 max-w-lg border-l border-white/20 pl-5"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-medium text-emerald-50/65">
                Chamado #2048
              </span>
              <span className="inline-flex items-center gap-2 text-xs font-medium text-[#BDEBC9]">
                <span className="h-2 w-2 rounded-full bg-[#7ED99A]" /> Em
                atendimento
              </span>
            </div>
            <p className="mt-3 text-lg font-semibold text-white">
              Acesso ao e-mail
            </p>
            <p className="mt-1 text-sm text-emerald-50/65">
              A equipe já está verificando sua solicitação.
            </p>
            <div className="mt-6 flex items-center gap-3 text-xs">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7ED99A] text-[#0F3D2A]">
                <svg
                  viewBox="0 0 16 16"
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    d="m3 8 3 3 7-7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-white/85">Solicitação recebida</span>
              <span className="h-px flex-1 bg-white/25" />
              <span className="h-2.5 w-2.5 rounded-full border-2 border-[#7ED99A] bg-[#0F3D2A]" />
              <span className="text-[#BDEBC9]">Em análise</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-white/55">Suporte de TI para sua equipe</p>
      </aside>

      {/* Formulário */}
      <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-9 lg:hidden">
            <Image
              src={chamouLogo}
              alt="Chamou Suporte de TI"
              width={2000}
              height={617}
              priority
              className="h-auto w-40"
            />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-[#0F3D2A]">
              Acesse sua conta
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#4B5E54]">
              Entre para acompanhar seus chamados e falar com o suporte.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#263B30]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email")}
                className={`${inputBase} ${errors.email ? inputBad : inputOk}`}
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p id="email-error" className="mt-1.5 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[#263B30]"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  {...register("password")}
                  className={`${inputBase} pr-20 ${errors.password ? inputBad : inputOk}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute inset-y-0 right-0 mt-1.5 flex items-center rounded-r-xl px-3.5 text-sm font-semibold text-[#4B5E54] hover:text-[#0F3D2A] focus-visible:outline-none focus-visible:text-[#15803D]"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="mt-1.5 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#15803D] px-3 py-3.5 text-sm font-semibold text-white shadow-sm shadow-[#15803D]/15 transition-colors hover:bg-[#116A32] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15803D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading && (
                <svg
                  className="h-4 w-4 animate-spin motion-reduce:hidden"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="opacity-25"
                  />
                  <path
                    d="M21 12a9 9 0 0 0-9-9"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <button
            type="button"
            onClick={onEnterDemo}
            className="mt-4 flex w-full items-center justify-center rounded-xl border border-[#15803D] px-3 py-3 text-sm font-semibold text-[#15803D] transition-colors hover:bg-[#EAF5ED] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15803D]"
          >
            Acessar como Administrador (Demo)
          </button>
        </div>
      </section>
    </main>
  );
}
