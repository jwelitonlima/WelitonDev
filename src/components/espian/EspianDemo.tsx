// src/components/espian/EspianDemo.tsx — demonstração pública e interativa do EspIAn (dados fictícios)
// Carregada sob demanda (lazy) só na página do projeto. O painel é o mesmo do /admin;
// a única diferença é a fonte de dados: aqui é em memória, sem rede e sem nenhum visitante real.

import { useMemo, type ReactNode } from "react";
import { EspianPanel, EspianShell } from "./EspianPanel";
import { createDemoSource, buildDemoTelegram } from "./demoData";

const TG_CSS = `
.ea .tg-wrap{padding:22px;display:grid;gap:22px;grid-template-columns:1fr;align-items:start}
@media (min-width:860px){.ea .tg-wrap{grid-template-columns:minmax(0,320px) 1fr;gap:34px;padding:30px}}
.ea .tg-title{font-size:20px;font-weight:600;letter-spacing:-.02em;margin-bottom:6px}
.ea .tg-sub{font-size:14px;color:var(--ea-muted);line-height:1.55}
.ea .tg-chat{display:flex;flex-direction:column;gap:10px;padding:16px;border-radius:16px;background:#0e1621;border:1px solid var(--ea-line)}
.ea .tg-bubble{max-width:540px;padding:10px 12px 6px;border-radius:14px 14px 14px 4px;background:#182533;font-size:13px;line-height:1.5;white-space:pre-wrap;word-break:break-word;animation:ea-rise .45s cubic-bezier(.2,.7,.2,1) both}
.ea .tg-time{display:block;text-align:right;font-size:10px;color:#6c7f94;margin-top:2px}
.ea .tg-bot{font-size:11px;color:#6ab3f3;margin-bottom:6px}
.ea .tg-bubble pre{margin:4px 0;padding:6px 10px;border-radius:4px 8px 8px 4px;border-left:3px solid #6ab3f3;background:rgba(0,0,0,.28);font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre;overflow-x:auto}
.ea .tg-bubble a{color:#6ab3f3;text-decoration:none}
`;

// Converte <b>, <i>, <a> e <pre> (o HTML que o Telegram aceita) em elementos React, sem innerHTML
function Inline({ text }: { text: string }) {
  const parts = text.split(/(<b>.*?<\/b>|<i>.*?<\/i>|<a>.*?<\/a>)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i): ReactNode => {
        if (p.startsWith("<b>")) return <b key={i}>{p.slice(3, -4)}</b>;
        if (p.startsWith("<i>")) return <i key={i} style={{ color: "#8fa3b8" }}>{p.slice(3, -4)}</i>;
        if (p.startsWith("<a>")) return <a key={i} href="#" onClick={(e) => e.preventDefault()}>{p.slice(3, -4)}</a>;
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

function Rich({ text }: { text: string }) {
  const parts = text.split(/(<pre>[\s\S]*?<\/pre>)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i): ReactNode =>
        p.startsWith("<pre>") ? <pre key={i}>{p.slice(5, -6)}</pre> : <Inline key={i} text={p.replace(/^\n+|\n+$/g, "")} />
      )}
    </>
  );
}

function TelegramExamples() {
  const mensagens = useMemo(() => buildDemoTelegram(), []);
  return (
    <div className="tg-wrap">
      <div>
        <h3 className="tg-title">Como os alertas chegam no celular</h3>
        <p className="tg-sub">
          Cada visita vira uma mensagem no Telegram: aparelho identificado, cidade e origem. Quando a pessoa sai, chega o
          relatório completo da visita: tempo em cada página, cliques, o que despertou interesse e a linha do tempo.
          Quem já visitou antes aparece como aparelho recorrente.
        </p>
        <p className="tg-sub" style={{ marginTop: 10 }}>As mensagens ao lado têm o mesmo formato das reais, com um visitante inventado.</p>
      </div>
      <div className="tg-chat" role="log" aria-label="Exemplo de mensagens do Telegram">
        {mensagens.map((m, i) => (
          <div key={i} className="tg-bubble" style={{ animationDelay: `${i * 90}ms` }}>
            <div className="tg-bot">EspIAn Bot</div>
            <Rich text={m.texto} />
            <span className="tg-time">{m.hora}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EspianDemo() {
  // Fonte criada uma vez por montagem: edições feitas na demo somem ao recarregar
  const source = useMemo(() => createDemoSource(), []);
  return (
    <div className="w-full space-y-6 text-left">
      <EspianShell embedded>
        <EspianPanel source={source} demo />
      </EspianShell>
      <EspianShell embedded>
        <style>{TG_CSS}</style>
        <TelegramExamples />
      </EspianShell>
    </div>
  );
}