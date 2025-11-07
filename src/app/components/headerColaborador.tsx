"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import TemaEscuro from "./temaEscuro";
import {usePathname } from "next/navigation";

const HeaderColaborador = () => {
  const [menuAberto, setMenuAberto] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  const isPaginaInicial = pathname === "/";
  const isPaginaLogin = pathname === "/login";
  const isPaginaCadastrar = pathname === "/cadastro";

  const toggleMenu = () => {
    setMenuAberto(!menuAberto);
  };

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.setItem("tipoUsuario", "Passageiro"); // garante passageiro
  setUsuarioLogado(false);
  window.location.assign("/"); // recarrega e mostra menus corretos
};

  useEffect(() => {
    // Verificar se o usuário está logado (token presente)
    const token = localStorage.getItem("token");
    if (token) {
      setUsuarioLogado(true); // Se o token estiver presente, o usuário está logado
    }

    const handleClickFora = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAberto(false);
      }
    };

    if (menuAberto) {
      document.addEventListener("mousedown", handleClickFora);
    } else {
      document.removeEventListener("mousedown", handleClickFora);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickFora);
    };
  }, [menuAberto]);

  return (
    <>
      <div className="bg-[#5e22f3] dark:bg-[#2a0094] h-[75px] flex items-center justify-between">
        {/* Escondendo o botão de menu de hambúrguer na página de login e na página inicial */}
        <div className={`ml-24 ${isPaginaLogin || isPaginaInicial || isPaginaCadastrar? "invisible" : ""}`}>
          <button className="text-white" aria-label="Menu" onClick={toggleMenu}>
            <span className="block w-7 h-0.5 bg-white mb-1 rounded"></span>
            <span className="block w-7 h-0.5 bg-white mb-1 rounded"></span>
            <span className="block w-7 h-0.5 bg-white rounded"></span>
          </button>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2">
          {pathname !== "/login" && pathname !== "/cadastro"? (
            <Link href="/home">
              <Image src="/images/logo.png" width={80} height={0} alt="Logo" />
            </Link>
          ) : (
            <Image src="/images/logo.png" width={80} height={0} alt="Logo" />
          )}
        </div>
        <div className="flex items-center text-white text-sm mr-24 gap-4">
          <TemaEscuro />
          {usuarioLogado ? (
            <Link href="/atualizarCadastro">
              <Image
                src="/images/usuario_branco.png"
                width={30}
                height={30}
                alt="perfil"
              />
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-white text-red-700 px-4 py-1 rounded text-sm font-semibold hover:bg-gray-100"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* MENU LATERAL: Escondido se estiver na página de login ou página inicial */}
      <div
        ref={menuRef}
        className={`absolute top-0 left-0 w-[300px] h-full bg-gray-300 dark:bg-slate-700 border-2 border-gray-900 
                    ${isPaginaLogin || isPaginaInicial ? "invisible" : (menuAberto ? "block" : "hidden")} transition-all ease-in-out duration-300`}
        style={{ zIndex: 999 }}
      >
        <div className="flex justify-end p-6">
          <button className="text-white text-3xl" onClick={toggleMenu}></button>
        </div>

        <div className="flex flex-col place-items-end mr-3">
          <div className="flex items-center gap-[180px]">
            <Image
              src="/images/home.png"
              width={30}
              height={0}
              alt="Ícone da página inicial"
            />
            <Link href="/home" className="text-lg dark:text-white">
              Home
            </Link>
          </div>
          <div className="w-full border-t border-gray-700 dark:border-gray-600 my-2"></div>
          <div className="flex items-center gap-[57px]">
            <Image
              src="/images/mapa.png"
              width={30}
              height={0}
              alt="Ícone de mapa do metrô e trem"
            />
            <Link href="/mapaMetro" className="text-lg dark:text-white">
              Mapa do Metrô/Trem
            </Link>
          </div>
          <div className="w-full border-t border-gray-700 dark:border-gray-600 my-2"></div>
          <div className="flex items-center gap-[100px]">
            <Image
              src="/images/falar.png"
              width={30}
              height={0}
              alt="Ícone para pedir ajuda à Ceci"
            />
            <Link href="/chatCeci" className="text-lg dark:text-white">
              Falar com a Ceci
            </Link>
          </div>
          <div className="w-full border-t border-gray-700 dark:border-gray-600 my-2"></div>
          <div className="flex items-center gap-[100px]">
            <Image
              src="/images/notificar.png"
              width={30}
              height={0}
              alt="Ícone para criar notificação"
            />
            <Link href="/criarNotificacao" className="text-lg dark:text-white">
              Criar Notificação
            </Link>
          </div>
          <div className="w-full border-t border-gray-700 dark:border-gray-600 my-2"></div>


          <div className="flex items-center gap-[60px]">
            <Image
              src="/images/gerenciar.png"
              width={28}
              height={0}
              alt="Ícone para gerenciar notificação"
            />
            <Link href="/gerenciarNotificacoes" className="text-lg dark:text-white">
              Gerenciar Notificação
            </Link>
          </div>
          <div className="w-full border-t border-gray-700 dark:border-gray-600 my-2"></div>


          <div className="flex items-center gap-[140px]">
            <Image
              src="/images/usuario.png"
              width={30}
              height={0}
              alt="Ícone de integrantes da equipe"
            />
            <Link href="/integrantes" className="text-lg dark:text-white">
              Integrantes
            </Link>
          </div>
          <div className="w-full border-t border-gray-700 dark:border-gray-600 my-2"></div>
          {usuarioLogado && (
            <div className="flex items-center gap-[130px]">
              <Image
                src="/images/deslogar.png"
                width={30}
                height={0}
                alt="Ícone para desconectar"
              />
              <button
                onClick={handleLogout}
                className="text-lg dark:text-white"
              >
                Desconectar
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HeaderColaborador;
