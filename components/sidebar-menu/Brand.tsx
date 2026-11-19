import Image from "next/image";
import Link from "next/link";
import { Bricolage_Grotesque } from "next/font/google";
import chamouIcone from "@/assets/img/chamouicone.png";
import { focusRing } from "./constants";

const brandFont = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

function LogoMark() {
  return (
    <Image
      src={chamouIcone}
      alt=""
      width={34}
      height={34}
      className="size-[34px] shrink-0 rounded-lg object-contain brightness-0 dark:invert"
      aria-hidden="true"
    />
  );
}

export function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Chamou – Suporte de TI, página inicial"
      className={`inline-flex items-center gap-2.5 rounded-md ${focusRing}`}
    >
      <LogoMark />
      <span
        className={`flex flex-col leading-none ${collapsed ? "lg:hidden" : ""}`}
      >
        <span
          className={`${brandFont.className} text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100`}
        >
          Chamou
        </span>
        <span className="mt-0.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
          Suporte de TI
        </span>
      </span>
    </Link>
  );
}
