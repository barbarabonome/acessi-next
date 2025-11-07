"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const Footer = () => {
  const pathname = usePathname();

  // Verifica se está na página inicial OU na página de login
  const esconderLinks = pathname === "/" || pathname === "/login" || pathname === "/cadastro";

  return (
    <div className="bg-gray-200 dark:bg-gray-950 h-[85px] text-xs flex items-center justify-between dark:text-white">
      
      <div className={`flex ${esconderLinks ? "invisible" : ""} justify-start sm:gap-5 lg:gap-40 ml-24`} aria-hidden={esconderLinks}>
        <div className="flex flex-col underline">
          <Link href="/home">HOME</Link>
          <Link href="/chatCeci">FALAR COM A CECI</Link>
        </div>
        <div className="flex flex-col underline">
          <Link href="/mapaMetro">MAPA DO METRÔ</Link>
          <Link href="/integrantes">INTEGRANTES</Link>
        </div>
      </div>

      <div className="flex flex-col items-end mr-24 lg:text-xs">
        <Image src="/images/logo.png" width={65} height={0} alt="logo" />
        <p className="hidden xl:block">© Copyright 2025 | Motiva</p>
      </div>
    </div>
  );
};

export default Footer;
