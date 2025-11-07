"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const MenuTopoColaborador = () => {
    const caminhoAtual = usePathname();
    const [rotaAtiva, setRotaAtiva] = useState("");

    useEffect(() => {
        setRotaAtiva(caminhoAtual);  // Atualiza a rota ativa sempre que a página mudar
    }, [caminhoAtual]);

    return (
        <div className="hidden xl:flex items-center justify-center mt-3 mb-3">
            <a href="/home">
                <button 
                    className={`bg-gray-200 dark:bg-[#2a0094] dark:text-white pt-2 pb-2 pr-3 pl-3 rounded-full m-1 ${rotaAtiva === "/home" ? "border-2 border-black dark:border-white" : ""}`}
                >
                    HOME
                </button>
            </a>

            <a href="/mapaMetro">
                <button 
                    className={`bg-gray-200 dark:bg-[#2a0094] dark:text-white pt-2 pb-2 pr-3 pl-3 rounded-full m-1 ${rotaAtiva === "/mapaMetro" ? "border-2 border-black dark:border-white" : ""}`}
                >
                    MAPA DO METRÔ/TREM
                </button>
            </a>

            <a href="/gerenciarNotificacoes">
                <button 
                    className={`bg-gray-200 dark:bg-[#2a0094] dark:text-white pt-2 pb-2 pr-3 pl-3 rounded-full m-1 ${rotaAtiva === "/gerenciarNotificacoes" ? "border-2 border-black dark:border-white" : ""}`}
                >
                    GERENCIAR NOTIFICAÇÕES
                </button>
            </a>

            <a href="/criarNotificacao">
                <button 
                    className={`bg-gray-200 dark:bg-[#2a0094] dark:text-white pt-2 pb-2 pr-3 pl-3 rounded-full m-1 ${rotaAtiva === "/criarNotificacao" ? "border-2 border-black dark:border-white" : ""}`}
                >
                    CRIAR NOTIFICAÇÃO
                </button>
            </a>

            <a href="/chatCeci">
                <button 
                    className={`${
                        rotaAtiva === "/chatCeci" // Verifica se a rota atual é "/chatCeci"
                            ? "bg-orange-500 dark:bg-orange-500 text-white border-2 border-orange-500" // Aplica a cor laranja se for a rota
                            : "bg-gray-200 dark:bg-[#2a0094] text-black dark:text-white border-2 border-orange-500" // Caso contrário, mantém o estilo normal
                    } pt-2 pb-2 pr-3 pl-3 rounded-full m-1`}
                >
                    FALAR COM A CECI
                </button>
            </a>

            <a href="/integrantes">
                <button 
                    className={`bg-gray-200 dark:bg-[#2a0094] dark:text-white pt-2 pb-2 pr-3 pl-3 rounded-full m-1 ${rotaAtiva === "/integrantes" ? "border-2 border-black dark:border-white" : ""}`}
                >
                    INTEGRANTES
                </button>
            </a>
        </div>
    );
};

export default MenuTopoColaborador;
