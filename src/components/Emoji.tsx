// src/components/Emoji.tsx — emojis em imagem (Twemoji) para o visual ficar igual em qualquer aparelho.
// Sem dependências novas: carrega o SVG da CDN e, se falhar (offline, bloqueio), cai no emoji nativo.
// Gráficos dos emojis: Twemoji (Twitter / jdecked), licença CC-BY 4.0 — https://github.com/jdecked/twemoji
// Onde NÃO dá para usar imagem (ex.: texto de <option>, <title>, clipboard), use o caractere puro.

import { Fragment, useState, type CSSProperties, type ReactNode } from "react";

const BASE = "https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/";

// "🕵️" → "1f575" (o Twemoji tira o FE0F, exceto em sequências com ZWJ)
function toFileName(emoji: string): string {
  const cps = Array.from(emoji).map((c) => (c.codePointAt(0) as number).toString(16));
  return (cps.includes("200d") ? cps : cps.filter((c) => c !== "fe0f")).join("-");
}

type EmojiProps = { char: string; size?: string; className?: string; style?: CSSProperties };

export function Emoji({ char, size = "1.15em", className, style }: EmojiProps) {
  const [falhou, setFalhou] = useState(false);
  if (falhou) return <span className={className} style={style} aria-hidden="true">{char}</span>;
  return (
    <img
      src={`${BASE}${toFileName(char)}.svg`}
      alt=""
      aria-hidden="true"
      draggable={false}
      decoding="async"
      onError={() => setFalhou(true)}
      className={className}
      style={{ display: "inline-block", width: size, height: size, verticalAlign: "-0.2em", margin: "0 0.06em", ...style }}
    />
  );
}

// Reconhece emoji (incluindo variação FE0F e sequências ZWJ). Ignora ©, ®, ™, setas e símbolos de texto.
const EMOJI_RE = /((?:[☀-➿⭐⭕\u{1F000}-\u{1FAFF}])️?(?:‍[☀-➿⭐⭕\u{1F000}-\u{1FAFF}]️?)*)/gu;
const TEXT_ONLY = /^[✓✕✖✗]$/u; // ✓ ✕ ✖ ✗ sem FE0F = símbolo de texto, não emoji

// Troca todo emoji de um texto por <Emoji />. Use em strings: {withEmoji("🔥 Alto")}
export function withEmoji(text: string | null | undefined): ReactNode {
  if (!text) return text ?? null;
  return text.split(EMOJI_RE).map((parte, i) =>
    i % 2 === 1 && !TEXT_ONLY.test(parte)
      ? <Emoji key={i} char={parte} />
      : <Fragment key={i}>{parte}</Fragment>
  );
}
