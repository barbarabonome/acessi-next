"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Notificacao = {
  id?: number;
  titulo: string;
  linha: string;
  tipo?: string;
  conteudo: string;
  data?: string;
  horario?: string; // pode manter, mas não vai usar
  cor: string;
  numeroLinha: string;
};

type StatusLinhas = {
  codigo: number;
  situacao: string;
};

export default function Home() {
  const router = useRouter();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [dataAtual, setDataAtual] = useState<string>("");
  const [statusLinhas, setStatusLinhas] = useState<StatusLinhas[]>([]);

  const buscarStatusLinhas = async () => {
    try {
      const response = await fetch("https://ceci-ye57.onrender.com/api/status");
      const data = await response.json();
      setStatusLinhas(data.linhas);
    } catch (error) {
      console.error("Erro ao buscar status das linhas:", error);
      setStatusLinhas([]);
    }
  };

  const buscarNotificacoes = async () => {
    try {
      //const response = await fetch("https://quarkus-teste-production-5988.up.railway.app/notificacao/listar");
      const response = await fetch("acessi-next-java-production.up.railway.app/notificacao/listar");
      const data = await response.json();

      const notificacoesComEstilo = data.map((n: Notificacao) => {
        let cor = "";
        let numeroLinha = "";

        switch (n.linha) {
          case "Linha 4 - Amarela":
            cor = "bg-yellow-400";
            numeroLinha = "4";
            break;
          case "Linha 5 - Lilás":
            cor = "bg-purple-600";
            numeroLinha = "5";
            break;
          case "Linha 8 - Diamante":
            cor = "bg-gray-600";
            numeroLinha = "8";
            break;
          case "Linha 9 - Esmeralda":
            cor = "bg-emerald-400";
            numeroLinha = "9";
            break;
          default:
            cor = "bg-gray-300";
            numeroLinha = "?";
        }

        // Removido o horário aqui

        return { ...n, cor, numeroLinha };
      });

      setNotificacoes(notificacoesComEstilo);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
      setNotificacoes([]);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    buscarNotificacoes();
    buscarStatusLinhas();

    const data = new Date();
    const dataFormatada = data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    setDataAtual(dataFormatada);
    document.title = "Home";
  }, []);

  return (
    <main>
      <div className="w-[85%] mx-auto mb-10">
        <h4 className="text-gray-500 dark:text-white mt-2 text-right text-sm sm:mt-5 md:mt-5">
          atualizado em {dataAtual}
        </h4>
        <h3 className="text-xl font-medium mt-2 text-center bg-slate-100 dark:bg-slate-600 dark:text-white rounded-lg shadow-md">
          STATUS DAS LINHAS
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-1 mt-2">
          {statusLinhas.length === 0 ? (
            <p className="text-center text-gray-400 dark:text-white">
              Status indisponível no momento.
            </p>
          ) : (
            statusLinhas.map((linha, i) => {
              let corLinha = "";

              switch (linha.codigo) {
                case 4:
                  corLinha = "bg-yellow-400";
                  break;
                case 5:
                  corLinha = "bg-purple-600";
                  break;
                case 8:
                  corLinha = "bg-gray-600";
                  break;
                case 9:
                  corLinha = "bg-emerald-400";
                  break;
                default:
                  corLinha = "bg-gray-300";
              }

              return (
                <div key={i} className="w-full p-2">
                  <div
                    className={`p-3 rounded shadow-md flex justify-between ${corLinha}`}
                  >
                    <span className="font-semibold text-white">
                      Linha {linha.codigo}
                    </span>
                    <span className="font-semibold text-white">
                      {linha.situacao}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <h3 className="text-xl font-medium mt-2 text-center bg-slate-100 dark:bg-slate-600 dark:text-white rounded-lg shadow-md">
          ÚLTIMAS NOTIFICAÇÕES
        </h3>

        <div className="space-y-4 mt-4">
          {notificacoes.length === 0 ? (
            <p className="text-center text-gray-400 dark:text-white">
              Nenhuma notificação disponível.
            </p>
          ) : (
            notificacoes.map((n, i) => (
              <div
                key={i}
                className="flex items-start bg-gray-100 dark:bg-slate-800 dark:text-white p-4 rounded-lg shadow-md"
              >
                <p
                  className={`flex justify-center items-center text-2xl font-bold text-white mr-4 ${n.cor} rounded-full w-10 h-10`}
                >
                  {String(n.numeroLinha)}
                </p>
                <div className="flex-1">
                  <p className="text-lg font-bold">
                    {String(n.linha)} | {String(n.titulo)}
                  </p>
                  <p className="text-gray-700 dark:text-white">
                    {String(n.conteudo)}
                  </p>
                </div>
                {/* Removido o horário */}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
