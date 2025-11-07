"use client";

import Image, { ImageProps } from "next/image";
import { useEffect, useMemo, useState } from "react";

type Locale = "pt" | "en" | "es";

type Props = Omit<ImageProps, "src" | "alt"> & {
  /** Caminhos da imagem por idioma */
  srcByLang: Record<Locale, string>;
  /** alt por idioma (opcional) */
  altByLang?: Partial<Record<Locale, string>>;
  /** fallback quando não detectar cookie */
  fallback?: Locale;
};

/** Lê o cookie do GTranslate (ex.: "/pt/en", "/auto/es") e retorna "pt" | "en" | "es" */
function readGTranslateLocale(): Locale {
  const m = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
  if (!m) return "pt";
  const v = decodeURIComponent(m[1]); // "/pt/en" ou "/auto/es"
  const parts = v.split("/").filter(Boolean);
  const target = (parts.pop() || "pt").toLowerCase();
  if (target.startsWith("en")) return "en";
  if (target.startsWith("es")) return "es";
  return "pt";
}

/** Observa mudanças do idioma via cookie (widget atualiza o cookie) */
function useGTranslateLocale(pollMs = 800): Locale {
  const [loc, setLoc] = useState<Locale>("pt");

  useEffect(() => {
    // leitura inicial
    try { setLoc(readGTranslateLocale()); } catch {}

    // observa mudanças (poll simples é o mais robusto pro widget)
    const id = setInterval(() => {
      try {
        const cur = readGTranslateLocale();
        setLoc(prev => (prev === cur ? prev : cur));
      } catch {}
    }, pollMs);

    return () => clearInterval(id);
  }, [pollMs]);

  return loc;
}

export default function TranslatedImage({
  srcByLang,
  altByLang,
  fallback = "pt",
  ...imgProps
}: Props) {
  const loc = useGTranslateLocale();
  const lang: Locale = useMemo(
    () => (srcByLang[loc] ? loc : fallback),
    [loc, srcByLang, fallback]
  );

  const src = srcByLang[lang] ?? srcByLang[fallback];
  const alt =
    (altByLang?.[lang] ??
      altByLang?.[fallback] ??
      imgProps.alt ??
      "image") as string;

  return <Image {...imgProps} src={src} alt={alt} />;
}
