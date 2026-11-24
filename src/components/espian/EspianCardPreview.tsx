// src/components/espian/EspianCardPreview.tsx — miniatura do painel para o card do catálogo (Work.tsx)
// Só estilos inline e SVG: não depende de Tailwind nem carrega o painel completo (fica leve na listagem).

import { Emoji } from "../Emoji";

const COLS = [3, 5, 4, 7, 6, 9, 5, 8, 11, 7, 10, 13, 9, 12];

export function EspianCardPreview() {
  const max = Math.max(...COLS);
  return (
    <div
      aria-hidden="true"
      style={{
        width: "88%", borderRadius: 14, padding: 14, color: "#f2f4f8", textAlign: "left",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        background: "radial-gradient(420px 220px at 10% -10%, rgba(57,135,229,.28), transparent 60%), radial-gradient(360px 200px at 100% 0%, rgba(98,80,214,.22), transparent 60%), #090b10",
        border: "1px solid rgba(255,255,255,.1)", boxShadow: "0 18px 40px -18px rgba(0,0,0,.65)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600 }}><Emoji char="🕵️" /> EspIAn</span>
        <span style={{ fontSize: 9, letterSpacing: ".05em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 999, color: "#ffd9c9", background: "rgba(217,89,38,.18)", border: "1px solid rgba(217,89,38,.45)" }}>
          Demo
        </span>
        <span style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          {["Visão geral", "Visitas", "Aparelhos"].map((t, i) => (
            <span key={t} style={{ fontSize: 9, padding: "3px 7px", borderRadius: 7, color: i === 0 ? "#fff" : "#9aa3b2", background: i === 0 ? "linear-gradient(135deg,rgba(57,135,229,.55),rgba(98,80,214,.5))" : "transparent" }}>{t}</span>
          ))}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 10 }}>
        {[["Visitas", "128"], ["Aparelhos", "14"], ["Interesse alto", "26%"]].map(([k, v]) => (
          <div key={k} style={{ borderRadius: 10, padding: "7px 9px", background: "linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.025))", border: "1px solid rgba(255,255,255,.09)" }}>
            <div style={{ fontSize: 9, color: "#9aa3b2" }}>{k}</div>
            <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-.02em" }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ borderRadius: 10, padding: "8px 9px 6px", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ fontSize: 9, color: "#9aa3b2", marginBottom: 4 }}>Visitas por dia</div>
        <svg viewBox="0 0 280 64" style={{ display: "block", width: "100%", height: "auto" }}>
          <defs>
            <linearGradient id="espian-card-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3987e5" />
              <stop offset="1" stopColor="#3987e5" stopOpacity=".45" />
            </linearGradient>
          </defs>
          <line x1="0" y1="63.5" x2="280" y2="63.5" stroke="rgba(255,255,255,.22)" strokeWidth="1" />
          {COLS.map((v, i) => {
            const h = Math.max(3, (v / max) * 56);
            return <rect key={i} x={i * 20 + 5} y={63 - h} width={10} height={h} rx={3} fill="url(#espian-card-grad)" />;
          })}
        </svg>
      </div>
    </div>
  );
}
