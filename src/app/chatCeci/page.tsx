"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Mic, Headphones } from "lucide-react";

type Mensagem = {
  autor: "usuário" | "ceci";
  texto: string;
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

  const socket = useRef<WebSocket | null>(null);
  const fimDaConversaRef = useRef<HTMLDivElement>(null);
  const errorReported = useRef(false);
  const respostaRef = useRef("");
  const falaAtivaRef = useRef(false);

  useEffect(() => {
    falaAtivaRef.current = falaAtiva;
  }, [falaAtiva]);

useEffect(() => {
  const tipoUsuario = localStorage.getItem("tipoUsuario");
  const token = localStorage.getItem("token");

  if (tipoUsuario !== "Colaborador" || !token) return;

  (async () => {
    try {
      const res = await fetch("http://localhost:5000/ceci/historico", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Erro ao buscar histórico:", res.status, await res.text());
        return;
      }

      const body = await res.json();

      // body pode ser:
      // 1) um array de blocos -> [ {mensagem_colaborador, mensagem_ceci}, ... ]
      // 2) um objeto { "<token>": [blocos], ... } -> legacy
      let blocos: any[] = [];
      if (Array.isArray(body)) {
        blocos = body;
      } else if (body && typeof body === "object") {
        // se servidor retornou { token: [...] } (legacy), tenta pegar por token
        blocos = body[token] ?? [];
      }

      const conversaFormatada: Mensagem[] = [];
      blocos.forEach((bloco) => {
        if (bloco.mensagem_colaborador)
          conversaFormatada.push({ autor: "usuário", texto: bloco.mensagem_colaborador });
        if (bloco.mensagem_ceci)
          conversaFormatada.push({ autor: "ceci", texto: bloco.mensagem_ceci });
      });

      // sobrescreve histórico local com o que veio do arquivo
      setConversa(conversaFormatada);
    } catch (err) {
      console.error("Falha ao carregar histórico:", err);
    }
  })();
}, []);
  useEffect(() => {
    socket.current = new WebSocket("ws://localhost:5000/ws/ceci");
    //socket.current = new WebSocket("wss://cecieco-production.up.railway.app/ws/ceci");
    socket.current.onopen = () => {
      errorReported.current = false;
    };

    socket.current.onmessage = (event) => {
      if (event.data === "[DONE]") {
        const finalResposta = respostaRef.current;
        if (finalResposta) {
          setConversa((prev) => [...prev, { autor: "ceci", texto: finalResposta }]);
          if (falaAtivaRef.current) falar(finalResposta);
          respostaRef.current = "";
          setRespostaTemp("");
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
    if (!mensagem.trim() || socket.current?.readyState !== WebSocket.OPEN) return;
    const tipoUsuario = localStorage.getItem("tipoUsuario") || "Passageiro";
    const payload: any = {
      usuario: tipoUsuario,
      texto: mensagem,
    };
    if (tipoUsuario === "Colaborador") {
    const token = localStorage.getItem("token");
    payload.token = token; }
    setConversa((prev) => [...prev, { autor: "usuário", texto: mensagem }]);
    setMensagem("");
    respostaRef.current = "";
    setRespostaTemp("");
    socket.current!.send(JSON.stringify(payload));
  };

  const ouvir = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return alert("SpeechRecognition não suportado.");
    const recognition = new Recognition();
    recognition.lang = "pt-BR";
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      setMensagem(event.results[0][0].transcript);
    };
    recognition.onerror = console.error;
    recognition.start();
  };

  return (
    <main className="w-[85%] mx-auto my-4">
      <div className="flex items-center p-1 bg-gray-100 dark:bg-slate-800 dark:text-white rounded-lg shadow space-x-4">
        <Image src="/images/Ceci_S_BG.png" width={50} height={50} alt="Ceci" className="rounded-full" />
        <p className="text-lg">
          Olá! Eu sou a <b>Ceci</b>, sua Assistente Virtual. Como posso te ajudar?
        </p>
      </div>

      <div
        className="h-[330px] bg-white dark:bg-slate-800 dark:text-white rounded-lg shadow-md mt-4 p-4 overflow-y-auto space-y-2"
        aria-live="polite"
      >
        {conversa.map((msg, i) => (
          <div key={i} className={`flex ${msg.autor === "usuário" ? "justify-end" : "justify-start"} items-start`}>
            {msg.autor === "ceci" && (
              <Image
                src="/images/Ceci_S_BG.png"
                width={32}
                height={32}
                alt="Ceci"
                className="rounded-full mr-2 mt-1"
              />
            )}
            <div
              className={`max-w-[70%] px-4 py-2 rounded-2xl shadow ${
                msg.autor === "usuário"
                  ? "bg-green-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-900 rounded-bl-none dark:bg-slate-600 dark:text-white"
              }`}
            >
              {msg.texto}
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
        {digitando && <div className="text-sm italic text-gray-400">Ceci está digitando...</div>}
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
          className={`p-2 rounded-full transition ${falaAtiva ? "bg-green-300" : "bg-gray-300"}`}
          title="Ativar/desativar fala"
        >
          <Headphones className="w-6 h-6 text-gray-700" />
        </button>

        <button
          onClick={() => setReconhecimentoAtivo((prev) => !prev)}
          className={`p-2 rounded-full transition ${reconhecimentoAtivo ? "bg-blue-300" : "bg-gray-300"}`}
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
