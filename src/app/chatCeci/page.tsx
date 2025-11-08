"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Mic, Headphones, Download, FileText } from "lucide-react";

type Mensagem = {
  autor: "usuário" | "ceci";
  texto: string;
  pdfInfo?: {
    filename: string;
    colaborador: string;
  };
};

// Tipos para SpeechRecognition
type SpeechRecognitionEvent = Event & {
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionResultList = {
  [index: number]: SpeechRecognitionResult;
  length: number;
};

type SpeechRecognitionResult = {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
};

type SpeechRecognitionAlternative = {
  transcript: string;
  confidence: number;
};

// Declarações globais para SpeechRecognition no window
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function ChatCeci() {
  const [mensagem, setMensagem] = useState("");
  const [conversa, setConversa] = useState<Mensagem[]>([]);
  const [respostaTemp, setRespostaTemp] = useState("");
  const [digitando, setDigitando] = useState(false);
  const [falaAtiva, setFalaAtiva] = useState(false);
  const [reconhecimentoAtivo, setReconhecimentoAtivo] = useState(false);
  const [mostrarRelatorios, setMostrarRelatorios] = useState(false);
  const [relatorios, setRelatorios] = useState<any[]>([]);

  const socket = useRef<WebSocket | null>(null);
  const fimDaConversaRef = useRef<HTMLDivElement>(null);
  const errorReported = useRef(false);
  const respostaRef = useRef("");
  const falaAtivaRef = useRef(false);
  const pdfInfoRef = useRef<any>(null);

  useEffect(() => {
    falaAtivaRef.current = falaAtiva;
  }, [falaAtiva]);

  useEffect(() => {
    const tipoUsuario = localStorage.getItem("tipoUsuario");
    const token = localStorage.getItem("token");

    if (tipoUsuario !== "Colaborador" || !token) return;

    (async () => {
      try {
        const res = await fetch(
          "http://ceci-next-production.up.railway.app/ceci/historico",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          console.error(
            "Erro ao buscar histórico:",
            res.status,
            await res.text()
          );
          return;
        }

        const body = await res.json();

        let blocos: any[] = [];
        if (Array.isArray(body)) {
          blocos = body;
        } else if (body && typeof body === "object") {
          blocos = body[token] ?? [];
        }

        const conversaFormatada: Mensagem[] = [];
        blocos.forEach((bloco) => {
          if (bloco.mensagem_colaborador)
            conversaFormatada.push({
              autor: "usuário",
              texto: bloco.mensagem_colaborador,
            });
          if (bloco.mensagem_ceci)
            conversaFormatada.push({
              autor: "ceci",
              texto: bloco.mensagem_ceci,
            });
        });

        setConversa(conversaFormatada);
      } catch (err) {
        console.error("Falha ao carregar histórico:", err);
      }
    })();
  }, []);

  useEffect(() => {
    socket.current = new WebSocket(
      "ws://ceci-next-production.up.railway.app/ws/ceci"
    );

    socket.current.onopen = () => {
      errorReported.current = false;
    };

    socket.current.onmessage = (event) => {
      // Verifica se é informação de PDF
      if (event.data.startsWith("PDF_INFO:")) {
        try {
          const pdfData = JSON.parse(event.data.replace("PDF_INFO:", ""));
          pdfInfoRef.current = pdfData;
        } catch (e) {
          console.error("Erro ao parsear PDF_INFO:", e);
        }
        return;
      }

      if (event.data === "[DONE]") {
        const finalResposta = respostaRef.current;
        if (finalResposta) {
          const novaMensagem: Mensagem = {
            autor: "ceci",
            texto: finalResposta,
            pdfInfo: pdfInfoRef.current,
          };

          setConversa((prev) => [...prev, novaMensagem]);
          if (falaAtivaRef.current) falar(finalResposta);
          respostaRef.current = "";
          setRespostaTemp("");
          pdfInfoRef.current = null;
        }
        setDigitando(false);
        return;
      }

      setDigitando(true);
      respostaRef.current += event.data;
      setRespostaTemp(respostaRef.current);
    };

    return () => socket.current?.close();
  }, []);

  useEffect(() => {
    if (conversa.length > 0 || respostaTemp) {
      fimDaConversaRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversa, respostaTemp, digitando]);

  useEffect(() => {
    if (reconhecimentoAtivo) {
      ouvir();
    }
  }, [reconhecimentoAtivo]);

  const falar = (texto: string) => {
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = "pt-BR";
    speechSynthesis.speak(utterance);
  };

  const enviarMensagem = () => {
    if (!mensagem.trim() || socket.current?.readyState !== WebSocket.OPEN)
      return;
    const tipoUsuario = localStorage.getItem("tipoUsuario") || "Passageiro";
    const payload: any = {
      usuario: tipoUsuario,
      texto: mensagem,
    };
    if (tipoUsuario === "Colaborador") {
      const token = localStorage.getItem("token");
      payload.token = token;
    }
    setConversa((prev) => [...prev, { autor: "usuário", texto: mensagem }]);
    setMensagem("");
    respostaRef.current = "";
    setRespostaTemp("");
    pdfInfoRef.current = null;
    socket.current!.send(JSON.stringify(payload));
  };

  const ouvir = () => {
    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return alert("SpeechRecognition não suportado.");
    const recognition = new Recognition();
    recognition.lang = "pt-BR";
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      setMensagem(event.results[0][0].transcript);
    };
    recognition.onerror = console.error;
    recognition.start();
  };

  const downloadPDF = async (filename: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token necessário para download");
      return;
    }

    try {
      const response = await fetch(
        `http://ceci-next-production.up.railway.app/reports/download/${filename}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Adiciona mensagem de sucesso
        setConversa((prev) => [
          ...prev,
          {
            autor: "ceci",
            texto: "✅ PDF baixado com sucesso!",
          },
        ]);
      } else {
        setConversa((prev) => [
          ...prev,
          {
            autor: "ceci",
            texto: "❌ Erro ao baixar PDF",
          },
        ]);
      }
    } catch (error) {
      console.error("Erro no download:", error);
      setConversa((prev) => [
        ...prev,
        {
          autor: "ceci",
          texto: "❌ Erro de conexão ao baixar PDF",
        },
      ]);
    }
  };

  const listarRelatorios = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token necessário para listar relatórios");
      return;
    }

    try {
      const response = await fetch(
        "http://ceci-next-production.up.railway.app/reports/list",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRelatorios(data.reports);
        setMostrarRelatorios(true);
      } else {
        alert("Erro ao listar relatórios");
      }
    } catch (error) {
      console.error("Erro ao listar:", error);
      alert("Erro de conexão ao listar relatórios");
    }
  };

  // Função para detectar se a mensagem contém referência a PDF
  const contemPDF = (texto: string) => {
    return (
      texto.includes("📁 Arquivo:") ||
      texto.includes("PDF gerado") ||
      texto.includes(".pdf")
    );
  };

  const extrairNomePDF = (texto: string) => {
    const match = texto.match(/📁 Arquivo: (.+?)(?:\n|$)/);
    return match ? match[1] : null;
  };

  return (
    <main className="w-[85%] mx-auto my-4">
      <div className="flex items-center p-1 bg-gray-100 dark:bg-slate-800 dark:text-white rounded-lg shadow space-x-4">
        <Image
          src="/images/Ceci_S_BG.png"
          width={50}
          height={50}
          alt="Ceci"
          className="rounded-full"
        />
        <p className="text-lg">
          Olá! Eu sou a <b>Ceci</b>, sua Assistente Virtual. Como posso te
          ajudar?
        </p>
      </div>

      {/* Botão para listar relatórios (só para colaboradores) */}
      {localStorage.getItem("tipoUsuario") === "Colaborador" && (
        <div className="mt-2">
          <button
            onClick={listarRelatorios}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Ver Meus Relatórios</span>
          </button>
        </div>
      )}

      {/* Modal de lista de relatórios */}
      {mostrarRelatorios && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg max-w-md w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">📋 Meus Relatórios</h3>
              <button
                onClick={() => setMostrarRelatorios(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {relatorios.length === 0 ? (
              <p className="text-gray-500">Nenhum relatório encontrado.</p>
            ) : (
              <div className="space-y-2">
                {relatorios.map((report, i) => (
                  <div key={i} className="border rounded p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{report.filename}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(report.created * 1000).toLocaleString()} |{" "}
                          {Math.round(report.size / 1024)}KB
                        </p>
                      </div>
                      <button
                        onClick={() => downloadPDF(report.filename)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 flex items-center space-x-1"
                      >
                        <Download className="w-4 h-4" />
                        <span>Baixar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div
        className="h-[330px] bg-white dark:bg-slate-800 dark:text-white rounded-lg shadow-md mt-4 p-4 overflow-y-auto space-y-2"
        aria-live="polite"
      >
        {conversa.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.autor === "usuário" ? "justify-end" : "justify-start"
            } items-start`}
          >
            {msg.autor === "ceci" && (
              <Image
                src="/images/Ceci_S_BG.png"
                width={32}
                height={32}
                alt="Ceci"
                className="rounded-full mr-2 mt-1"
              />
            )}
            <div className="max-w-[70%]">
              <div
                className={`px-4 py-2 rounded-2xl shadow ${
                  msg.autor === "usuário"
                    ? "bg-green-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-900 rounded-bl-none dark:bg-slate-600 dark:text-white"
                }`}
              >
                {msg.texto}
              </div>

              {/* Botão de download automático se contém PDF */}
              {msg.autor === "ceci" &&
                (contemPDF(msg.texto) || msg.pdfInfo) && (
                  <div className="mt-2">
                    <button
                      onClick={() => {
                        const filename =
                          msg.pdfInfo?.filename || extrairNomePDF(msg.texto);
                        if (filename) downloadPDF(filename);
                      }}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 flex items-center space-x-2 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>📄 Baixar PDF</span>
                    </button>
                    {msg.pdfInfo && (
                      <p className="text-xs text-gray-500 mt-1">
                        Colaborador: {msg.pdfInfo.colaborador}
                      </p>
                    )}
                  </div>
                )}
            </div>
          </div>
        ))}

        {respostaTemp && (
          <div className="flex justify-start items-start">
            <Image
              src="/images/Ceci_S_BG.png"
              width={32}
              height={32}
              alt="Ceci"
              className="rounded-full mr-2 mt-1"
            />
            <div className="max-w-[70%] px-4 py-2 rounded-2xl shadow bg-gray-200 text-gray-900 dark:bg-slate-800 dark:text-white rounded-bl-none">
              {respostaTemp}
            </div>
          </div>
        )}
        {digitando && (
          <div className="text-sm italic text-gray-400">
            Ceci está digitando...
          </div>
        )}
        <div ref={fimDaConversaRef} />
      </div>

      <div className="flex items-center mt-1 space-x-2 bg-white dark:bg-slate-800 dark:text-white p-4 rounded-lg shadow-md">
        <input
          type="text"
          placeholder="Pergunte alguma coisa..."
          className="flex-1 p-2 border border-gray-300 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviarMensagem()}
        />
        <button
          onClick={enviarMensagem}
          className="bg-green-500 p-2 rounded-full text-white hover:bg-green-600 active:bg-green-700 transition"
        >
          Enviar
        </button>

        <button
          onClick={() => setFalaAtiva((prev) => !prev)}
          className={`p-2 rounded-full transition ${
            falaAtiva ? "bg-green-300" : "bg-gray-300"
          }`}
          title="Ativar/desativar fala"
        >
          <Headphones className="w-6 h-6 text-gray-700" />
        </button>

        <button
          onClick={() => setReconhecimentoAtivo((prev) => !prev)}
          className={`p-2 rounded-full transition ${
            reconhecimentoAtivo ? "bg-blue-300" : "bg-gray-300"
          }`}
          title="Ativar/desativar voz"
        >
          <Mic className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 italic">
        📝 A Ceci pode cometer erros. Considere se certificar das informações.
      </div>
    </main>
  );
}
