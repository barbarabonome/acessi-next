"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AlertMessage from "../components/alerta";

export default function CriarNotificacao() {
  const router = useRouter();

  useEffect(() => {
    document.title = "Criar Notificação";
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
  }, [router]);

  const [titulo, setTitulo] = useState("");
  const [linha, setLinha] = useState("");
  const [tipo, setTipo] = useState("");
  const [conteudo, setConteudo] = useState("");

  const [alerta, setAlerta] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (alerta) {
      const timer = setTimeout(() => setAlerta(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alerta]);

  const opcoesLinha = [
    "Linha 4 - Amarela",
    "Linha 5 - Lilás",
    "Linha 8 - Diamante",
    "Linha 9 - Esmeralda",
  ];

  const opcoesTipo = [
    "Falha em Equipamentos",
    "Atrasos e Interrupções",
    "Superlotação",
    "Situação de Risco",
    "Alterações no Serviço",
    "Campanhas de Conscientização",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let corLinha = "";
    let numeroLinha = "";

    switch (linha) {
      case "Linha 4 - Amarela":
        corLinha = "bg-yellow-400";
        numeroLinha = "4";
        break;
      case "Linha 5 - Lilás":
        corLinha = "bg-purple-600";
        numeroLinha = "5";
        break;
      case "Linha 8 - Diamante":
        corLinha = "bg-gray-600";
        numeroLinha = "8";
        break;
      case "Linha 9 - Esmeralda":
        corLinha = "bg-emerald-400";
        numeroLinha = "9";
        break;
      default:
        corLinha = "bg-gray-600";
        numeroLinha = "?";
    }

    const novaNotificacao = {
      titulo,
      linha,
      tipoOcorrencia: tipo,
      conteudo,
      horario: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      cor: corLinha,
      numeroLinha,
    };

    try {
      //const resposta = await fetch("https://quarkus-teste-production-5988.up.railway.app/notificacao/criar", {
      const resposta = await fetch("http://localhost:8080/notificacao/criar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(novaNotificacao),
      });

      const data = await resposta.text();
      console.log(data);

      if (resposta.ok) {
        setAlerta({ type: "success", message: "Notificação enviada com sucesso!" });
        setTitulo("");
        setLinha("");
        setTipo("");
        setConteudo("");
      } else {
        setAlerta({ type: "error", message: "Erro ao enviar notificação: " + data });
      }
    } catch (error) {
      console.error("Erro:", error);
      setAlerta({ type: "error", message: "Erro ao conectar com o servidor." });
    }
  };

  return (
    <>
      {alerta && (
        <AlertMessage
          type={alerta.type}
          message={alerta.message}
          onClose={() => setAlerta(null)}
        />
      )}

      <main>
        <form
          onSubmit={handleSubmit}
          className="max-w-[400px] sm:max-w-[450px] md:max-w-[580px] lg:max-w-[800px] mx-auto bg-gray-100 dark:bg-gray-700 p-6 rounded-lg shadow-md mt-8 mb-10"
        >
          <p className="text-xl font-bold text-gray-700 dark:text-white text-center mb-4">
            Preencha os dados abaixo para criar uma Notificação
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-white font-medium mt-2 mb-2">
                Título da Notificação
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-white font-medium mt-2 mb-2">
                Linha
              </label>
              <input
                type="text"
                list="linhas"
                value={linha}
                onChange={(e) => setLinha(e.target.value)}
                placeholder="Digite ou selecione uma linha"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
              <datalist id="linhas">
                {opcoesLinha.map((opcao, index) => (
                  <option key={index} value={opcao} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-white font-medium mt-2 mb-2">
                Tipo de Ocorrência
              </label>
              <input
                type="text"
                list="tipos"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                placeholder="Digite ou selecione o tipo"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
              <datalist id="tipos">
                {opcoesTipo.map((opcao, index) => (
                  <option key={index} value={opcao} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-white font-medium mb-2">
                Conteúdo
              </label>
              <textarea
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                rows={5}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                required
              />
            </div>

            <div className="text-center mt-4">
              <button
                type="submit"
                className="inline-block px-6 py-2 bg-green-500 dark:bg-green-600 text-white font-bold rounded-md hover:bg-green-600 transition"
              >
                Enviar Notificação
              </button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
