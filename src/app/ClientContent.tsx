"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import MenuTopo from "./components/menuTopo";
import MenuTopoColaborador from "./components/menuTopoColaborador";
import Header from "./components/header";
import HeaderColaborador from "./components/headerColaborador";
import Footer from "./components/footer";
import FooterColaborador from "./components/footerColaborador";
import Acessi from "./components/acessi";
import VLibras from "./components/VLibras";
import ClickToRead from "./components/ClickToRead";

export default function ClientContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let tipo = localStorage.getItem("tipoUsuario");
    if (!tipo) {
      tipo = "Passageiro";
      localStorage.setItem("tipoUsuario", "Passageiro");
    }
    setTipoUsuario(tipo);

    const rotasPublicas = ["/login", "/esqueciSenha"];

    if (!tipo && !rotasPublicas.includes(pathname)) {
      router.push("/login");
    }

    setIsLoading(false);

    const handleTipoChange = () => {
      setTipoUsuario(localStorage.getItem("tipoUsuario"));
    };

    window.addEventListener("tipoUsuarioChange", handleTipoChange);
    return () => {
      window.removeEventListener("tipoUsuarioChange", handleTipoChange);
    };
  }, [pathname, router]);

  if (isLoading) return null;

  return (
    <>
      {tipoUsuario === "Colaborador" ? <HeaderColaborador /> : <Header />}

      {pathname !== "/login" &&
        pathname !== "/esqueciSenha" &&
        pathname !== "/cadastro" &&
        (tipoUsuario === "Colaborador" ? <MenuTopoColaborador /> : <MenuTopo />)}

      {children}

      {tipoUsuario === "Colaborador" ? <FooterColaborador /> : <Footer />}
      <Acessi />
      <VLibras />
      <ClickToRead />
    </>
  );
}