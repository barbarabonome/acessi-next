// app/components/ClickToRead.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, Power, Globe } from "lucide-react";

type LangCode = "pt-BR" | "en-US" | "es-ES";

const READABLE_SELECTOR =
  "p, h1, h2, h3, h4, h5, h6, li, blockquote, figcaption, td, th, article, section";

/* -------- util: quebra textos longos em partes -------- */
function splitIntoChunks(text: string, maxLen = 350) {
  const parts = text
    .replace(/\s+/g, " ")
    .trim()
    .split(/([.!?…]+)\s+/)
    .reduce<string[]>((acc, cur, i, arr) => {
      if (i % 2 === 0) {
        const sentence = cur + (arr[i + 1] ?? "");
        if (!acc.length || (acc[acc.length - 1] + " " + sentence).length > maxLen) {
          acc.push(sentence);
        } else {
          acc[acc.length - 1] += " " + sentence;
        }
      }
      return acc;
    }, [])
    .filter(Boolean);
  return parts.length ? parts : [text];
}

/* -------- garante que as vozes estejam carregadas -------- */
function ensureVoices(timeoutMs = 1500): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const tryGet = () => {
      const v = speechSynthesis.getVoices();
      if (v && v.length) {
        resolve(v);
        return true;
      }
      return false;
    };
    if (tryGet()) return;

    const handler = () => {
      if (tryGet()) speechSynthesis.onvoiceschanged = null;
    };
    speechSynthesis.onvoiceschanged = handler;

    // fallback por tempo (alguns browsers não disparam o evento)
    setTimeout(() => resolve(speechSynthesis.getVoices()), timeoutMs);
  });
}

/* -------- escolha da melhor voz para o idioma -------- */
function scoreVoice(v: SpeechSynthesisVoice, want: LangCode) {
  const vLang = (v.lang || "").replace("_", "-");
  const wantBase = want.split("-")[0];
  const vBase = vLang.split("-")[0];
  let score = 0;
  if (vLang.toLowerCase() === want.toLowerCase()) score += 100; // match exato
  if (vBase === wantBase) score += 50; // mesmo idioma base
  const name = (v.name || "").toLowerCase();
  if (/google/.test(name)) score += 20;
  if (/microsoft/.test(name)) score += 14;
  // favoritos comuns por idioma/SO
  if (want === "en-US" && /(samantha|zira|us english|alloy|ava|aria)/.test(name)) score += 8;
  if (want === "es-ES" && /(monica|paulina|esperanza|espa[nñ]ol)/.test(name)) score += 8;
  if (want === "pt-BR" && /(portugu[eê]s|brasil|brazil|luciana|felipe)/.test(name)) score += 8;
  if (!v.localService) score -= 2; // remotas costumam ser piores
  return score;
}

function pickBestVoice(voices: SpeechSynthesisVoice[], want: LangCode) {
  if (!voices?.length) return null;
  const sorted = [...voices].sort((a, b) => scoreVoice(b, want) - scoreVoice(a, want));
  const best = sorted[0];
  // se o melhor ainda não for aceitável (score baixo), tenta ao menos “mesmo idioma base”
  if (best && (best.lang || "").slice(0, 2) === want.slice(0, 2)) return best;
  // última tentativa: exato
  const exact = voices.find(v => (v.lang || "").toLowerCase() === want.toLowerCase());
  return exact || best || null;
}

export default function ClickToRead() {
  const [enabled, setEnabled] = useState(false);
  const [lang, setLang] = useState<LangCode>(() => {
    if (typeof window === "undefined") return "pt-BR";
    return (localStorage.getItem("clickToReadLang") as LangCode) || "pt-BR";
  });
  const [showLang, setShowLang] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const speakingRef = useRef(false);

  // carrega/atualiza vozes
  useEffect(() => {
    const load = () => (voicesRef.current = speechSynthesis.getVoices());
    load();
    speechSynthesis.onvoiceschanged = load;
    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // salva a língua
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("clickToReadLang", lang);
  }, [lang]);

  // handler global de clique
  useEffect(() => {
    if (!enabled) return;

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("#click-to-read-widget")) return; // ignora cliques no widget

      const el = target.closest(READABLE_SELECTOR) as HTMLElement | null;
      if (!el) return;

      const text = el.innerText?.trim() || "";
      if (!text) return;

      speak(text, lang);
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true } as any);
  }, [enabled, lang]);

  const speak = async (text: string, langCode: LangCode) => {
    try {
      speechSynthesis.cancel();
      speakingRef.current = false;

      // garante vozes carregadas
      const voices = voicesRef.current.length ? voicesRef.current : await ensureVoices();
      voicesRef.current = voices;

      const chosen = pickBestVoice(voices, langCode);
      const chunks = splitIntoChunks(text);

      const speakChunk = (i: number) => {
        if (i >= chunks.length) {
          speakingRef.current = false;
          return;
        }
        const u = new SpeechSynthesisUtterance(chunks[i]);
        u.lang = chosen?.lang || langCode; // define lang e voice
        if (chosen) u.voice = chosen;
        u.rate = 1;
        u.pitch = 1;
        u.onend = () => speakChunk(i + 1);
        speakingRef.current = true;
        speechSynthesis.speak(u);
      };

      speakChunk(0);
    } catch (err) {
      console.error("Erro ao falar:", err);
    }
  };

  const stop = () => {
    speechSynthesis.cancel();
    speakingRef.current = false;
  };

  return (
    <div
      id="click-to-read-widget"
      className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2"
    >
      {/* Popover de idioma */}
      {showLang && (
        <div className="rounded-2xl shadow-lg bg-white dark:bg-slate-800 p-2 flex gap-2">
          {[
            { code: "pt-BR" as LangCode, label: "PT", bg: "bg-green-500" },
            { code: "en-US" as LangCode, label: "EN", bg: "bg-blue-500" },
            { code: "es-ES" as LangCode, label: "ES", bg: "bg-red-500" },
          ].map(({ code, label, bg }) => {
            const active = lang === code;
            return (
              <button
                key={code}
                onClick={() => setLang(code)}
                title={
                  code === "pt-BR"
                    ? "Português (Brasil)"
                    : code === "en-US"
                    ? "English (US)"
                    : "Español (España)"
                }
                className={[
                  "w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold uppercase ring-2 transition",
                  active
                    ? `${bg} text-white ring-black/0`
                    : "bg-gray-100 text-gray-700 ring-transparent hover:bg-gray-200 dark:bg-slate-700 dark:text-white",
                ].join(" ")}
                aria-pressed={active}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Botões flutuantes */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowLang((v) => !v)}
          className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-md ring-1 ring-black/10 flex items-center justify-center hover:shadow-lg transition"
          title="Idioma da leitura"
          aria-expanded={showLang}
        >
          <Globe className="w-6 h-6" />
        </button>

        <button
          onClick={() => {
            if (speakingRef.current) stop();
            setEnabled((v) => !v);
          }}
          className={[
            "w-12 h-12 rounded-full shadow-md flex items-center justify-center transition",
            enabled
              ? "bg-emerald-500 text-white hover:bg-emerald-600"
              : "bg-white dark:bg-slate-800 ring-1 ring-black/10 hover:shadow-lg",
          ].join(" ")}
          title={enabled ? "Clique-para-ler: ligado" : "Clique-para-ler: desligado"}
          aria-pressed={enabled}
        >
          {enabled ? <Volume2 className="w-6 h-6" /> : <Power className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}
