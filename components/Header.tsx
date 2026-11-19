"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LuMenu, LuX } from "react-icons/lu";
import chamouLogo from "../assets/img/chamoulogo.png";
import { enterDemoMode } from "@/lib/auth";

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1b0f55]";
const navLink = `whitespace-nowrap rounded-full text-xs font-medium text-white transition-opacity hover:opacity-75 sm:text-sm min-[1101px]:text-base ${focus}`;
const actionButton = `inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full bg-[#ffffff] px-3 text-xs font-medium text-[#000000] transition-transform duration-150 hover:-translate-y-px sm:h-10 sm:px-4 md:h-11 md:px-5 md:text-sm ${focus}`;

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const openDemo = () => {
    enterDemoMode();
    window.location.assign("/demo");
  };

  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <header className="fixed inset-x-0 top-0 z-30 px-3 pt-3.5 sm:px-5">
      <div className="relative mx-auto flex w-full max-w-[1008px] flex-wrap items-center justify-between gap-x-2 gap-y-1 rounded-2xl border border-white/[0.22] bg-white/[0.04] px-2.5 py-2 backdrop-blur-[8px] sm:gap-x-4 sm:px-4 sm:py-2.5 min-[1101px]:flex-nowrap min-[1101px]:rounded-full">
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
            className="h-auto w-[72px] min-[360px]:w-[84px] sm:w-[120px] md:w-[150px] brightness-0 invert"
            priority
          />
        </Link>

        <nav
          aria-label="Navegação principal"
          id="mobile-primary-navigation"
          className={`${isMobileMenuOpen ? "flex" : "hidden"} order-3 w-full flex-col items-stretch gap-1 border-t border-white/15 pt-2 min-[1101px]:absolute min-[1101px]:left-1/2 min-[1101px]:order-none min-[1101px]:flex min-[1101px]:w-auto min-[1101px]:-translate-x-1/2 min-[1101px]:flex-row min-[1101px]:items-center min-[1101px]:gap-8 min-[1101px]:border-0 min-[1101px]:pt-0`}
        >
          <a
            href="#inicio"
            onClick={() => setIsMobileMenuOpen(false)}
            className={navLink}
          >
            Início
          </a>
          <a
            href="#funcionalidades"
            onClick={() => setIsMobileMenuOpen(false)}
            className={navLink}
          >
            Funcionalidades
          </a>
          <a
            href="#demonstracao"
            onClick={() => setIsMobileMenuOpen(false)}
            className={navLink}
          >
            Demonstração
          </a>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-primary-navigation"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className={`inline-flex size-9 items-center justify-center rounded-full text-white hover:bg-white/10 min-[1101px]:hidden ${focus}`}
          >
            {isMobileMenuOpen ? (
              <LuX aria-hidden="true" className="size-5" />
            ) : (
              <LuMenu aria-hidden="true" className="size-5" />
            )}
          </button>
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
