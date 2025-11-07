"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Check, X } from "lucide-react";
import AlertMessage from "../components/alerta";
import Dialogo from "../components/dialogo";

type Notificacao = {
  id?: number;
  titulo: string;
  linha: string;
  conteudo: string;
  cor?: string;
  numeroLinha?: string;
};

type AlertType = "success" | "error";

export default function GerenciarNotificacao() {
  const router = useRouter();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editandoNotificacao, setEditandoNotificacao] = useState<Notificacao | null>(null);
  const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [notificacaoParaDeletar, setNotificacaoParaDeletar] = useState<number | null>(null);

  const buscarNotificacoes = async () => {
    try {
      //const response = await fetch("https://quarkus-teste-production-5988.up.railway.app/notificacao/listar");
      const response = await fetch("http://localhost:8080/notificacao/listar");
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

        return { ...n, cor, numeroLinha };
      });

      setNotificacoes(notificacoesComEstilo);
    } catch (error) {
      setAlert({ type: "error", message: "Erro ao buscar notificações" });
      setNotificacoes([]);
      console.error(error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    buscarNotificacoes();
    document.title = "Gerenciar Notificações";
  }, [router]);

  const iniciarEdicao = (notificacao: Notificacao) => {
    setEditandoId(notificacao.id ?? null);
    setEditandoNotificacao({ ...notificacao });
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setEditandoNotificacao(null);
  };

  const salvarEdicao = async () => {
    if (!editandoNotificacao || editandoId === null) return;

    try {
      const payload = {
        titulo: editandoNotificacao.titulo,
        conteudo: editandoNotificacao.conteudo,
        linha: editandoNotificacao.linha,
      };

      const response = await fetch(`https://quarkus-teste-production-5988.up.railway.app/notificacao/${editandoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar notificação");
      }

      const notificacaoAtualizada = await response.json();

      setNotificacoes((prev) =>
        prev.map((n) =>
          n.id === editandoId ? { ...notificacaoAtualizada, cor: n.cor, numeroLinha: n.numeroLinha } : n
        )
      );

      setAlert({ type: "success", message: "Notificação atualizada com sucesso!" });
      cancelarEdicao();
    } catch (error) {
      setAlert({ type: "error", message: "Erro ao salvar notificação" });
      console.error(error);
    }
  };

  const confirmarDelecao = (id?: number) => {
    if (!id) return;
    setNotificacaoParaDeletar(id);
    setConfirmDialogVisible(true);
  };

  const deletarNotificacaoConfirmada = async () => {
    if (!notificacaoParaDeletar) return;

    try {
      const response = await fetch(`https://quarkus-teste-production-5988.up.railway.app/notificacao/${notificacaoParaDeletar}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Falha ao deletar notificação");
      }

      setNotificacoes((prev) => prev.filter((n) => n.id !== notificacaoParaDeletar));
      setAlert({ type: "success", message: "Notificação deletada com sucesso!" });
    } catch (error) {
      setAlert({ type: "error", message: "Erro ao deletar notificação" });
      console.error(error);
    } finally {
      setConfirmDialogVisible(false);
      setNotificacaoParaDeletar(null);
    }
  };

  const onChangeEditando = (field: keyof Notificacao, value: string) => {
    if (!editandoNotificacao) return;

    setEditandoNotificacao({
      ...editandoNotificacao,
      [field]: value,
    });
  };

  return (
    <main className="w-[85%] mx-auto mb-10">
      <h3 className="text-xl font-medium mb-6 text-center text-white bg-red-700 dark:bg-red-700 dark:text-white rounded-lg shadow-md">
        GERENCIAR NOTIFICAÇÕES
      </h3>

      {alert && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {notificacoes.length === 0 && (
        <p className="text-center text-gray-400 dark:text-white">Nenhuma notificação disponível.</p>
      )}

      <div className="space-y-4">
        {notificacoes.map((n) => (
          <div
            key={n.id}
            className="flex items-start bg-gray-100 border-2 border-red-700 dark:bg-slate-800 dark:text-white p-4 rounded-lg shadow-md"
          >
            <p
              className={`flex justify-center items-center text-2xl font-bold text-white mr-4 rounded-full w-10 h-10 ${n.cor}`}
            >
              {n.numeroLinha}
            </p>

            <div className="flex-1">
              {editandoId === n.id ? (
                <>
                  <input
                    type="text"
                    value={editandoNotificacao?.linha || ""}
                    onChange={(e) => onChangeEditando("linha", e.target.value)}
                    className="mb-1 w-full rounded px-2 py-1 text-black"
                  />
                  <input
                    type="text"
                    value={editandoNotificacao?.titulo || ""}
                    onChange={(e) => onChangeEditando("titulo", e.target.value)}
                    className="mb-1 w-full rounded px-2 py-1 text-black"
                  />
                  <textarea
                    value={editandoNotificacao?.conteudo || ""}
                    onChange={(e) => onChangeEditando("conteudo", e.target.value)}
                    className="w-full rounded px-2 py-1 text-black"
                  />
                </>
              ) : (
                <>
                  <p className="text-lg font-bold">
                    {n.linha} | {n.titulo}
                  </p>
                  <p className="text-gray-700 dark:text-white">{n.conteudo}</p>
                </>
              )}
            </div>

            {editandoId === n.id ? (
              <>
                <button
                  onClick={salvarEdicao}
                  title="Salvar"
                  className="mr-2 text-green-600 hover:text-green-400"
                >
                  <Check size={20} />
                </button>
                <button
                  onClick={cancelarEdicao}
                  title="Cancelar"
                  className="text-red-600 hover:text-red-400"
                >
                  <X size={20} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => iniciarEdicao(n)}
                  title="Editar"
                  className="mr-2 text-blue-600 hover:text-blue-400"
                >
                  <Pencil size={20} />
                </button>
                <button
                  onClick={() => confirmarDelecao(n.id)}
                  title="Deletar"
                  className="text-red-600 hover:text-red-400"
                >
                  <Trash2 size={20} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {confirmDialogVisible && (
        <Dialogo
          title="Confirmar Exclusão"
          message="Tem certeza que deseja deletar essa notificação?"
          onConfirm={deletarNotificacaoConfirmada}
          onCancel={() => setConfirmDialogVisible(false)}
        />
      )}
    </main>
  );
}
