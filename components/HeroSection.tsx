import Image from "next/image";
import print from "@/assets/img/print.png";

export default function HeroSection() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,rgb(15,5,30)_0%,rgb(25,8,45)_10%,rgb(38,12,65)_20%,rgb(55,15,95)_30%,rgb(78,25,135)_40%,rgb(100,38,160)_50%,rgb(85,30,135)_60%,rgb(65,22,105)_70%,rgb(48,16,80)_80%,rgb(35,12,60)_84%,rgb(27,9,48)_88%,rgb(22,7,40)_92%,rgb(17,5,32)_98%,rgb(15,5,30)_100%)] px-5 text-white">
      <section className="relative z-[2] px-0 pb-12 pt-[108px] text-center">
        <a
          href="#"
          className="inline-flex items-center gap-2.5 rounded-full bg-white/[0.07] py-2 pl-2 pr-3.5 text-base text-white no-underline"
        >
          <span className="rounded-full border border-white/25 bg-white/[0.12] px-2 py-[7px]">
            New
          </span>
          Conheça a nova plataforma de suporte
        </a>

        <h1 className="mx-auto mb-7 mt-11 text-[clamp(40px,6.2vw,72px)] font-semibold leading-[1.12] tracking-[-0.035em]">
          Simplifique a Gestão de Suporte de <br />
          TI da sua Empresa
        </h1>

        <p className="mx-auto mb-11 max-w-[620px] text-base leading-[1.55] text-white/90">
          Gerencie chamados, acompanhe solicitações e organize o atendimento da
          sua equipe de TI em um só lugar. Mais agilidade, controle e eficiência
          para resolver problemas.
        </p>

        <div className="flex flex-wrap justify-center gap-6">
          <a
            href="#demonstracao"
            className="inline-flex h-14 items-center justify-center rounded-full border-2 border-[#5a3df0] bg-black px-6 text-base font-medium text-white no-underline shadow-[0_0_0_3px_rgba(90,61,240,0.25)] transition-transform duration-150 hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white motion-reduce:transition-none"
          >
            Solicitar Demonstração
          </a>
        </div>
      </section>

      <div className="relative z-[2] mx-auto max-w-[1392px] rounded-t-[48px] border border-b-0 border-white/[0.18] bg-white/[0.14] px-[15px] pt-[15px] max-[700px]:rounded-t-[28px]">
        <div className="h-[640px] overflow-hidden rounded-t-[34px] bg-[#f6f5fb]">
          <Image
            src={print}
            alt="Prévia da plataforma Chamou"
            className="w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
