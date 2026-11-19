"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import chamouLogo from "../assets/img/chamoulogo.png";
import { enterDemoMode } from "@/lib/auth";

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1b0f55]";
const navLink = `rounded-full text-base font-medium text-white transition-opacity hover:opacity-75 ${focus}`;
const actionButton = `inline-flex h-10 items-center justify-center rounded-full bg-black px-3.5 text-xs font-medium text-white transition-transform duration-150 hover:-translate-y-px sm:h-14 sm:px-6 sm:text-base ${focus}`;

export default function Header() {
  const pathname = usePathname();

  const openDemo = () => {
    enterDemoMode();
    window.location.assign("/demo");
  };

  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <header className="fixed inset-x-0 top-0 z-30 px-3 pt-3.5 sm:px-5">
      <div className="relative mx-auto flex w-full max-w-[1008px] items-center justify-between gap-3 rounded-full border border-white/[0.22] bg-white/[0.04] px-3 py-2.5 backdrop-blur-[8px] sm:gap-6 sm:pl-4 sm:pr-3">
        <Link
          href="/"
          aria-label="Chamou – Suporte de TI, página inicial"
          className={`shrink-0 rounded-md ${focus}`}
        >
          <Image
            src={chamouLogo}
            alt="Chamou - Suporte de TI"
            width={2000}
            height={617}
            className="h-auto w-[84px] sm:w-[120px] md:w-[150px] brightness-0 invert"
            priority
          />
        </Link>

        <nav
          aria-label="Navegação principal"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 min-[1101px]:flex"
        >
          <a href="#inicio" className={navLink}>
            Início
          </a>
          <a href="#funcionalidades" className={navLink}>
            Funcionalidades
          </a>
          <a href="#demonstracao" className={navLink}>
            Demonstração
          </a>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link href="/login" className={actionButton}>
            Entrar
          </Link>
          <button type="button" onClick={openDemo} className={actionButton}>
            Testar demo
          </button>
        </div>
      </div>
    </header>
  );
}
