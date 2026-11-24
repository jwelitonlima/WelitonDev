// src/components/espian/EspianPanel.tsx — painel visual do EspIAn (reutilizado pelo /admin e pela demo pública)
// Não fala com o banco: recebe uma "fonte de dados" (Source). No /admin a fonte é o Supabase real;
// na demo do portfólio é uma fonte em memória com dados 100% fictícios.
// Sem dependências novas (React + SVG). Tema escuro próprio, isolado em `.ea`.

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Emoji, withEmoji } from "../Emoji";

const TZ = "America/Fortaleza";

/* ───────────────────────── Tipos ───────────────────────── */

export type Device = {
  id: string; num: number; alias: string | null; notes: string | null; is_owner: boolean; visits: number;
  first_seen: string; last_seen: string; model: string | null; os: string | null; browser: string | null;
  device_kind: string | null; screen: string | null; gpu: string | null; tz: string | null; lang: string | null;
  last_city: string | null; last_region: string | null; last_country: string | null;
  vids: string[] | null; ip_hashes: string[] | null;
};
export type PageStat = { p: string; views: number; time: number; scroll: number };
export type Session = {
  sid: string; visitor_id: string; device_id: string | null; match_confidence: string | null; match_reason: string | null;
  visit_no: number | null; started_at: string; ended_at: string | null; duration_s: number | null; active_s: number | null;
  pages: number | null; clicks: number | null; max_scroll: number | null; actions: number | null;
  city: string | null; region: string | null; country: string | null; browser: string | null; os: string | null;
  device_kind: string | null; referrer: string | null; utm: string | null; is_returning: boolean | null;
  summary: { pages?: PageStat[]; interest?: { k: string; hover: number; clicks: number }[] } | null;
};
export type Ev = { type: string; path: string | null; label: string | null; value: number | null; meta: Record<string, any> | null; created_at: string };

/* ───────────────────────── Fonte de dados (injetável) ───────────────────────── */

export type DevicePatch = Partial<Pick<Device, "alias" | "notes" | "is_owner">>;
export type Source = {
  /** Visitas do período (days = 0 → tudo) e todos os aparelhos. */
  list: (days: number) => Promise<{ sessions: Session[]; devices: Device[] }>;
  /** Eventos brutos de uma visita (linha do tempo). */
  events: (sid: string) => Promise<Ev[]>;
  /** Histórico de visitas de um aparelho. */
  history: (deviceId: string) => Promise<Session[]>;
  /** Busca uma visita específica (link direto ?sid=). */
  session: (sid: string) => Promise<Session | null>;
  /** Salva nome/anotação/"meu aparelho". Devolve o aparelho atualizado. */
  saveDevice: (id: string, patch: DevicePatch) => Promise<Device | null>;
};

/* ───────────────────────── Formatação ───────────────────────── */

const dt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, hourCycle: "h23", ...o });
const F = {
  dateTime: dt({ day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
  time: dt({ hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  full: dt({ day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
  short: dt({ day: "2-digit", month: "2-digit" }),
};
const dayKeyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const hourFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hourCycle: "h23" });
const dayKey = (t: number | string | Date) => dayKeyFmt.format(new Date(t));
const hourOf = (t: string) => Number(hourFmt.format(new Date(t))) % 24;

const fmtDur = (sec: number | null | undefined) => {
  const s = Math.max(0, Math.round(sec ?? 0));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return s % 60 ? `${m}min ${s % 60}s` : `${m}min`;
  return `${Math.floor(m / 60)}h ${m % 60}min`;
};
const fmtN = (n: number) => (n >= 10000 ? `${Math.round(n / 100) / 10}K` : String(n));
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
const rel = (iso: string) => {
  const s = Math.max(0, (Date.now() - Date.parse(iso)) / 1000);
  if (s < 90) return "há instantes";
  if (s < 3600) return `há ${Math.round(s / 60)}min`;
  if (s < 86400) return `há ${Math.round(s / 3600)}h`;
  const d = Math.round(s / 86400);
  return d === 1 ? "ontem" : `há ${d} dias`;
};
const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
const place = (x: { city: string | null; region: string | null; country: string | null }) =>
  [[x.city, x.region].filter(Boolean).join(" — "), x.country].filter(Boolean).join(" · ") || "—";
const devName = (d: Device | undefined | null) =>
  d ? `#${d.num}${d.alias ? ` · ${d.alias}` : ""}` : "—";
const kindChar = (k: string | null | undefined) => (k === "mobile" ? "📱" : "💻"); // texto puro (usado em <option>)
const kindIcon = (k: string | null | undefined) => <Emoji char={kindChar(k)} />;

type Eng = "alto" | "médio" | "baixo";
const engOf = (s: Session): Eng =>
  (s.actions ?? 0) > 0 || (s.active_s ?? 0) >= 120 ? "alto" : (s.active_s ?? 0) >= 30 || (s.pages ?? 0) >= 3 ? "médio" : "baixo";
const ENG_LABEL: Record<Eng, string> = { alto: "🔥 Alto", médio: "🙂 Médio", baixo: "💤 Baixo" };
const CONF_LABEL: Record<string, string> = { alta: "✅ Alta", média: "⚠️ Média", nova: "🆕 Novo" };

/* ───────────────────────── Linha do tempo (a partir dos eventos) ───────────────────────── */

function describe(e: Ev): string | null {
  const m = e.meta || {};
  const lab = e.label ? `"${cut(e.label, 50)}"` : "";
  const ctx = m.ctx && m.ctx !== e.label ? ` (${cut(String(m.ctx), 40)})` : "";
  switch (e.type) {
    case "session_start": return "Sessão iniciada";
    case "page_view": return `Abriu a página ${e.path}`;
    case "click": return `Clicou em ${lab}${ctx}`;
    case "hover": return `Passou o mouse em ${lab}${ctx} por ${fmtDur((e.value ?? 0) / 1000)}`;
    case "scroll_depth": return `Rolou até ${e.value}% de ${e.path}`;
    case "modal_open": return `Abriu o painel ${lab}`;
    case "outbound_click": return `Abriu link externo ${lab}${ctx} → ${m.href ?? ""}`;
    case "outbound_open":
    case "window_open": return `Abriu nova janela${e.label ? " " + lab : ""}${ctx} → ${m.href ?? ""}`;
    case "contact_click": return `Acionou contato ${lab} [${m.kind ?? "contato"}]`;
    case "download": return `Baixou arquivo ${m.href ?? lab}`;
    case "form_focus": return `Iniciou o preenchimento do campo ${lab}`;
    case "form_submit": return `Enviou o formulário ${lab}`;
    case "copy": return `Copiou texto (${e.label})`;
    case "tab_hidden": return "Deixou a aba (outra janela ou segundo plano)";
    case "tab_visible": return `Retornou à aba após ${fmtDur(e.value)}`;
    case "rage_click": return `Cliques repetidos em ${lab}`;
    case "error": return `Erro registrado: ${e.label ?? ""}`;
    case "session_resume": return "Sessão retomada";
    case "session_end": return "Sessão encerrada";
    default: return null;
  }
}
const IMPORTANT = new Set(["outbound_click", "outbound_open", "window_open", "contact_click", "download", "form_submit", "error", "rage_click"]);

function buildTimeline(evs: Ev[]) {
  const sorted = evs.map((e) => ({ e, t: Number(e.meta?.ts) || Date.parse(e.created_at) })).sort((a, b) => a.t - b.t);
  const out: { t: number; text: string; important: boolean }[] = [];
  let prev = "";
  let prevT = 0;
  let scrollIdx = -1;
  let scrollPath = "";
  for (const { e, t } of sorted) {
    const d0 = describe(e);
    if (!d0) continue;
    const text = (e.meta?.tab ? `[${e.meta.tab}] ` : "") + d0;
    if (e.type === "scroll_depth") {
      if (scrollIdx === out.length - 1 && scrollPath === e.path) { out[scrollIdx] = { ...out[scrollIdx], text }; continue; }
      scrollIdx = out.length;
      scrollPath = e.path ?? "";
    }
    if (text === prev && t - prevT < 2000) continue;
    prev = text; prevT = t;
    out.push({ t, text, important: IMPORTANT.has(e.type) });
  }
  return out;
}

function pagesFromEvents(evs: Ev[]): PageStat[] {
  const m = new Map<string, PageStat>();
  const g = (p: string) => { let x = m.get(p); if (!x) { x = { p, views: 0, time: 0, scroll: 0 }; m.set(p, x); } return x; };
  for (const e of evs) {
    if (!e.path) continue;
    if (e.type === "page_view") g(e.path).views++;
    else if (e.type === "page_leave") { const x = g(e.path); x.time += Number(e.value) || 0; x.scroll = Math.max(x.scroll, Number(e.meta?.scroll) || 0); }
    else if (e.type === "scroll_depth") { const x = g(e.path); x.scroll = Math.max(x.scroll, Number(e.value) || 0); }
  }
  return Array.from(m.values());
}

/* ───────────────────────── Estilo (cores de dados: paleta de referência, slots 1 e 2) ───────────────────────── */

export const CSS = `
.ea{
  --ea-bg:#090b10; --ea-surface:#0e1117; --ea-input:#0b0e14; --ea-fg:#f2f4f8; --ea-muted:#9aa3b2;
  --ea-line:rgba(255,255,255,.09); --ea-accent:#3987e5;
  --s1:#3987e5; --s2:#d95926; --good:#0ca30c;
  color-scheme:dark; color:var(--ea-fg); min-height:100svh;
  font-family:"Inter",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
  background:
    radial-gradient(900px 480px at 12% -8%,rgba(57,135,229,.20),transparent 60%),
    radial-gradient(760px 420px at 100% 0%,rgba(98,80,214,.16),transparent 60%),
    var(--ea-bg);
}
/* Os utilitários do Tailwind do site são redefinidos aqui dentro: o painel não depende do tema do site */
.ea .bg-background{background:var(--ea-surface)}
.ea .bg-card{background:rgba(255,255,255,.04)}
.ea .bg-muted{background:rgba(255,255,255,.07)}
.ea .hover\:bg-muted:hover{background:rgba(255,255,255,.09)}
.ea .hover\:bg-muted\/60:hover,.ea .focus-visible\:bg-muted\/60:focus-visible{background:rgba(255,255,255,.06)}
.ea .border-border{border-color:var(--ea-line)}
.ea .divide-border>:not([hidden])~:not([hidden]){border-color:var(--ea-line)}
.ea .text-foreground{color:var(--ea-fg)}
.ea .text-muted-foreground{color:var(--ea-muted)}
.ea .bg-primary{background:linear-gradient(135deg,#3987e5,#6250d6)}
.ea .text-primary-foreground{color:#fff}
.ea input,.ea select{color:var(--ea-fg);background:var(--ea-input);border-color:var(--ea-line);outline:none;transition:border-color .15s,box-shadow .15s}
.ea input::placeholder{color:#6c7585}
.ea input:focus-visible,.ea select:focus-visible{border-color:var(--ea-accent);box-shadow:0 0 0 3px rgba(57,135,229,.25)}
.ea input[type=checkbox]{accent-color:var(--ea-accent)}
.ea button{background:transparent;color:inherit;font-family:inherit;cursor:pointer;transition:background .15s,border-color .15s,transform .1s}
.ea button:active{transform:scale(.98)}
.ea button:focus-visible{outline:2px solid var(--ea-accent);outline-offset:2px}
.ea code{background:rgba(255,255,255,.08);border-radius:4px;padding:0 4px}
.ea table{font-variant-numeric:tabular-nums}
.ea table th{font-weight:500}

/* Vidro */
.ea .ea-glass{
  background:linear-gradient(180deg,rgba(255,255,255,.065),rgba(255,255,255,.025));
  border:1px solid var(--ea-line); border-radius:16px;
  -webkit-backdrop-filter:blur(14px) saturate(130%); backdrop-filter:blur(14px) saturate(130%);
  box-shadow:0 1px 0 rgba(255,255,255,.05) inset,0 12px 32px -16px rgba(0,0,0,.6);
  animation:ea-rise .45s cubic-bezier(.2,.7,.2,1) both;
}
.ea .ea-focus{border-color:var(--ea-accent);box-shadow:0 0 0 1px var(--ea-accent),0 12px 32px -16px rgba(0,0,0,.6)}
.ea .ea-header{position:sticky;top:0;z-index:20;background:rgba(9,11,16,.72);-webkit-backdrop-filter:blur(16px) saturate(140%);backdrop-filter:blur(16px) saturate(140%);border-bottom:1px solid var(--ea-line)}
.ea .ea-num{letter-spacing:-.02em;line-height:1.1}
.ea .ea-tabs{display:flex;gap:4px;padding:4px;width:fit-content;max-width:100%;overflow-x:auto;border:1px solid var(--ea-line);border-radius:12px;background:rgba(255,255,255,.03)}
.ea .ea-tab{padding:6px 14px;border-radius:9px;font-size:14px;color:var(--ea-muted);white-space:nowrap}
.ea .ea-tab:hover{color:var(--ea-fg)}
.ea .ea-tab.on{color:#fff;background:linear-gradient(135deg,rgba(57,135,229,.55),rgba(98,80,214,.5));box-shadow:0 0 0 1px rgba(255,255,255,.12) inset}
.ea .ea-tip{pointer-events:none;white-space:nowrap;border:1px solid var(--ea-line);border-radius:10px;padding:6px 10px;background:rgba(14,17,23,.92);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:0 8px 24px rgba(0,0,0,.5)}

/* Modo embutido (portfólio), portal da gaveta e avisos da demo */
.ea.ea-embedded{min-height:0;border-radius:20px;overflow:hidden;border:1px solid var(--ea-line);text-align:left}
.ea.ea-embedded .ea-header{position:static}
.ea.ea-portal{min-height:0;background:none;display:contents}
.ea .ea-badge{font-size:12px;line-height:1.35;padding:4px 11px;max-width:100%;border-radius:999px;color:#ffd9c9;background:rgba(217,89,38,.18);border:1px solid rgba(217,89,38,.45)}

/* Gráficos */
.ea .gl{stroke:rgba(255,255,255,.08);stroke-width:1}
.ea .ax{stroke:rgba(255,255,255,.22);stroke-width:1}
.ea .tk{fill:var(--ea-muted);font-size:10px}
.ea .bar{fill:url(#ea-grad);transition:filter .12s}
.ea .col{outline:none;cursor:default}
.ea .col:hover .bar,.ea .col:focus-visible .bar{filter:brightness(1.25)}
.ea .col:focus-visible .hit{stroke:#fff;stroke-opacity:.4}
.ea .hit{fill:transparent}
.ea .good{color:var(--good)}

@keyframes ea-rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes ea-fade{from{opacity:0}to{opacity:1}}
.ea aside{animation:ea-slide .28s cubic-bezier(.2,.7,.2,1) both}
@keyframes ea-slide{from{transform:translateX(24px);opacity:0}to{transform:none;opacity:1}}
@media (prefers-reduced-motion: reduce){.ea *{animation:none!important;transition:none!important}}
@media (forced-colors: active){.ea .bar{fill:Highlight}}
`;

/* ───────────────────────── Componentes de gráfico ───────────────────────── */

function niceStep(max: number) {
  const raw = Math.max(max, 1) / 4;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  return [1, 2, 5, 10].map((k) => k * pow).find((v) => v >= raw) ?? raw;
}

type Col = { label: string; value: number; tip: string };

function Columns({ data, aria }: { data: Col[]; aria: string }) {
  const W = 640, H = 200, L = 34, R = 8, T = 12, B = 24;
  const iw = W - L - R, ih = H - T - B;
  const step = niceStep(Math.max(0, ...data.map((d) => d.value)));
  const max = step * 4;
  const slot = iw / Math.max(1, data.length);
  const bw = Math.min(24, slot * 0.7);
  const every = Math.max(1, Math.ceil(data.length / 8));
  const [hot, setHot] = useState<number | null>(null);
  const ticks = [0, step * 2, step * 4];
  const yOf = (v: number) => T + ih - (v / max) * ih;

  return (
    <div className="relative" style={{ color: "inherit" }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria} className="block w-full">
        <defs>
          <linearGradient id="ea-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--s1)" />
            <stop offset="100%" stopColor="var(--s1)" stopOpacity="0.45" />
          </linearGradient>
        </defs>
        {ticks.map((v) => (
          <g key={v}>
            <line className={v === 0 ? "ax" : "gl"} x1={L} x2={W - R} y1={yOf(v)} y2={yOf(v)} />
            <text className="tk" x={L - 6} y={yOf(v) + 3} textAnchor="end">{fmtN(v)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const h = (d.value / max) * ih;
          const x = L + i * slot + (slot - bw) / 2;
          const y = T + ih - h;
          const r = Math.min(4, h / 2, bw / 2);
          const path = `M${x},${y + h}L${x},${y + r}Q${x},${y} ${x + r},${y}L${x + bw - r},${y}Q${x + bw},${y} ${x + bw},${y + r}L${x + bw},${y + h}Z`;
          return (
            <g
              key={i}
              className="col"
              tabIndex={0}
              aria-label={d.tip}
              onPointerEnter={() => setHot(i)}
              onPointerMove={() => setHot(i)}
              onPointerLeave={() => setHot(null)}
              onFocus={() => setHot(i)}
              onBlur={() => setHot(null)}
            >
              <rect className="hit" x={L + i * slot} y={T} width={slot} height={ih} />
              {h > 0 && <path className="bar" d={path} />}
              {i % every === 0 && <text className="tk" x={L + i * slot + slot / 2} y={H - 8} textAnchor="middle">{d.label}</text>}
            </g>
          );
        })}
      </svg>
      {hot !== null && data[hot] && (
        <div
          className="ea-tip absolute z-10 text-xs"
          style={{
            left: `${((L + (hot + 0.5) * slot) / W) * 100}%`,
            top: `${(yOf(data[hot].value) / H) * 100}%`,
            transform: "translate(-50%, -120%)",
          }}
        >
          <div className="text-sm font-semibold text-foreground">{data[hot].value}</div>
          <div className="text-muted-foreground">{data[hot].tip}</div>
        </div>
      )}
    </div>
  );
}

function HBars({ rows, unit }: { rows: { label: string; value: number; sub?: string }[]; unit?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <p className="py-6 text-center text-sm text-muted-foreground">Sem dados no período.</p>;
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.label} className="flex items-center gap-3 text-sm" title={`${r.label}: ${r.value}${unit ? " " + unit : ""}${r.sub ? " · " + r.sub : ""}`}>
          <span className="w-36 shrink-0 truncate text-muted-foreground sm:w-44">{r.label}</span>
          <span className="relative h-2.5 flex-1">
            <span
              className="absolute left-0 top-0 h-full"
              style={{ width: `${Math.max(2, (r.value / max) * 100)}%`, background: "var(--s1)", borderRadius: "0 4px 4px 0" }}
            />
          </span>
          <span className="w-10 shrink-0 text-right font-medium text-foreground">{r.value}</span>
        </li>
      ))}
    </ul>
  );
}

function SegBar({ items }: { items: { label: string; value: number; color: string }[] }) {
  const total = items.reduce((n, i) => n + i.value, 0);
  if (!total) return <p className="py-6 text-center text-sm text-muted-foreground">Sem dados no período.</p>;
  const shown = items.filter((i) => i.value > 0);
  return (
    <div>
      <div className="flex gap-[2px]" role="img" aria-label={items.map((i) => `${i.label}: ${i.value}`).join(", ")}>
        {shown.map((i, k) => (
          <span
            key={i.label}
            title={`${i.label}: ${i.value} (${pct(i.value, total)}%)`}
            style={{
              flex: i.value, height: 8, background: i.color,
              borderRadius: `${k === 0 ? 4 : 0}px ${k === shown.length - 1 ? 4 : 0}px ${k === shown.length - 1 ? 4 : 0}px ${k === 0 ? 4 : 0}px`,
            }}
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {items.map((i) => (
          <li key={i.label} className="flex items-center gap-2">
            <span style={{ width: 10, height: 10, borderRadius: 2, background: i.color, display: "inline-block" }} />
            <span className="text-muted-foreground">{i.label}</span>
            <span className="font-medium text-foreground">{i.value}</span>
            <span className="text-muted-foreground">({pct(i.value, total)}%)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChartCard({ title, sub, table, children }: { title: string; sub?: string; table: string[][]; children: any }) {
  const [asTable, setAsTable] = useState(false);
  return (
    <section className="ea-glass p-4">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
        <button type="button" onClick={() => setAsTable(!asTable)} className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted">
          {asTable ? "Ver gráfico" : "Ver tabela"}
        </button>
      </header>
      {asTable ? (
        <div className="max-h-56 overflow-auto">
          <table className="w-full text-sm">
            <tbody>
              {table.map((r, i) => (
                <tr key={i} className="border-t border-border first:border-0">
                  {r.map((c, k) => <td key={k} className={`py-1 ${k ? "text-right font-medium text-foreground" : "text-muted-foreground"}`}>{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : children}
    </section>
  );
}

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="ea-glass p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="ea-num mt-1 text-3xl font-semibold text-foreground">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

/* ───────────────────────── Visão geral ───────────────────────── */

const PERIODS = [
  { id: "1", label: "Hoje", days: 1 },
  { id: "7", label: "7 dias", days: 7 },
  { id: "30", label: "30 dias", days: 30 },
  { id: "90", label: "90 dias", days: 90 },
  { id: "all", label: "Tudo", days: 0 },
];

function topN(map: Map<string, number>, n = 6) {
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, n).map(([label, value]) => ({ label, value }));
}
const bump = (m: Map<string, number>, k: string, by = 1) => m.set(k, (m.get(k) ?? 0) + by);

function Overview({ rows, devMap, days }: { rows: Session[]; devMap: Map<string, Device>; days: number }) {
  const s = useMemo(() => {
    const uniq = new Set<string>();
    const perDay = new Map<string, number>();
    const perHour = new Array(24).fill(0) as number[];
    const pagesM = new Map<string, number>();
    const cities = new Map<string, number>();
    const browsers = new Map<string, number>();
    const sources = new Map<string, number>();
    let mobile = 0, desktop = 0, actions = 0, activeSum = 0, activeN = 0;
    for (const r of rows) {
      uniq.add(r.device_id ?? r.visitor_id);
      bump(perDay, dayKey(r.started_at));
      perHour[hourOf(r.started_at)]++;
      if (r.device_kind === "mobile") mobile++; else desktop++;
      actions += r.actions ?? 0;
      if (r.active_s != null) { activeSum += r.active_s; activeN++; }
      bump(cities, r.city ? `${r.city}${r.region ? " — " + r.region : ""}` : "Desconhecido");
      bump(browsers, r.browser ?? "Outro");
      bump(sources, r.referrer || "Direto");
      for (const p of r.summary?.pages ?? []) bump(pagesM, p.p);
    }
    let recurring = 0;
    uniq.forEach((id) => { if ((devMap.get(id)?.visits ?? 0) > 1) recurring++; });

    // série diária contínua (dias sem visita aparecem com zero)
    const end = Date.parse(dayKey(Date.now()) + "T12:00:00-03:00");
    const first = rows.length ? Date.parse(dayKey(rows[rows.length - 1].started_at) + "T12:00:00-03:00") : end;
    const span = days > 0 ? days : Math.min(92, Math.round((end - first) / 86400000) + 1);
    const series: Col[] = [];
    for (let i = span - 1; i >= 0; i--) {
      const k = dayKey(end - i * 86400000);
      const v = perDay.get(k) ?? 0;
      series.push({ label: `${k.slice(8, 10)}/${k.slice(5, 7)}`, value: v, tip: `${k.slice(8, 10)}/${k.slice(5, 7)} · visitas` });
    }
    const hours: Col[] = perHour.map((v, h) => ({ label: `${h}h`, value: v, tip: `${String(h).padStart(2, "0")}:00 às ${String(h).padStart(2, "0")}:59 · visitas` }));
    return {
      visits: rows.length, devices: uniq.size, recurringPct: pct(recurring, uniq.size), actions,
      avgActive: activeN ? Math.round(activeSum / activeN) : 0, mobile, desktop, series, hours,
      pages: topN(pagesM), cities: topN(cities), browsers: topN(browsers), sources: topN(sources),
    };
  }, [rows, devMap, days]);

  const tbl = (r: { label: string; value: number }[]) => r.map((x) => [x.label, String(x.value)]);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Tile label="Visitas" value={fmtN(s.visits)} />
        <Tile label="Aparelhos únicos" value={fmtN(s.devices)} />
        <Tile label="Aparelhos que voltaram" value={`${s.recurringPct}%`} hint="mais de 1 visita" />
        <Tile label="Tempo ativo médio" value={fmtDur(s.avgActive)} />
        <Tile label="Ações de interesse" value={fmtN(s.actions)} hint="demo, contato, link, formulário" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Visitas por dia" sub="Cada coluna é um dia" table={s.series.map((c) => [c.label, String(c.value)])}>
          <Columns data={s.series} aria="Visitas por dia" />
        </ChartCard>
        <ChartCard title="Horário das visitas" sub="Horário de Brasília" table={s.hours.map((c) => [c.label, String(c.value)])}>
          <Columns data={s.hours} aria="Visitas por hora do dia" />
        </ChartCard>
        <ChartCard title="Celular × computador" table={[["Celular", String(s.mobile)], ["Computador", String(s.desktop)]]}>
          <SegBar items={[{ label: "Celular", value: s.mobile, color: "var(--s1)" }, { label: "Computador", value: s.desktop, color: "var(--s2)" }]} />
        </ChartCard>
        <ChartCard title="Páginas mais visitadas" sub="Visitas que passaram pela página" table={tbl(s.pages)}>
          <HBars rows={s.pages} unit="visitas" />
        </ChartCard>
        <ChartCard title="De onde vêm" sub="Cidade" table={tbl(s.cities)}>
          <HBars rows={s.cities} unit="visitas" />
        </ChartCard>
        <ChartCard title="Origem do acesso" sub="Site de onde o visitante veio" table={tbl(s.sources)}>
          <HBars rows={s.sources} unit="visitas" />
        </ChartCard>
        <ChartCard title="Navegadores" table={tbl(s.browsers)}>
          <HBars rows={s.browsers} unit="visitas" />
        </ChartCard>
      </div>
    </div>
  );
}

/* ───────────────────────── Detalhe da visita ───────────────────────── */

function VisitDrawer({ s, dev, source, onClose, onOpenDevice }: { s: Session; dev: Device | undefined; source: Source; onClose: () => void; onOpenDevice: (id: string) => void }) {
  const [evs, setEvs] = useState<Ev[] | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    let alive = true;
    source.events(s.sid)
      .then((r) => alive && setEvs(r ?? []))
      .catch((e) => alive && setErr(String(e.message || e)));
    return () => { alive = false; };
  }, [s.sid, source]);
  useEffect(() => {
    const k = (e: any) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  const timeline = useMemo(() => (evs ? buildTimeline(evs) : []), [evs]);
  const pages = useMemo(() => (evs ? pagesFromEvents(evs) : s.summary?.pages ?? []), [evs, s.summary]);
  const top = s.summary?.interest ?? [];

  return createPortal(
    <div className="ea ea-portal">
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" style={{ zIndex: 9999 }} onClick={onClose}>
      <aside className="h-full w-full max-w-xl overflow-y-auto border-l border-border bg-background p-5 text-foreground" onClick={(e: any) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Visita de {F.full.format(new Date(s.started_at))}</h2>
            <p className="text-sm text-muted-foreground">
              {place(s)} · {s.visit_no ? `${s.visit_no}ª visita do aparelho` : "visita"} · sessão {s.sid.slice(0, 8)}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md border border-border px-2 py-1 text-sm hover:bg-muted" aria-label="Fechar">✕</button>
        </div>

        <div className="mb-4 ea-glass p-4 text-sm">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-semibold">{kindIcon(s.device_kind)} Aparelho {dev ? devName(dev) : "não identificado"}</span>
            {dev && <button type="button" className="text-xs underline text-muted-foreground" onClick={() => onOpenDevice(dev.id)}>ver histórico</button>}
          </div>
          <p className="text-muted-foreground">{[dev?.model, dev?.os ?? s.os, dev?.browser ?? s.browser, dev?.screen].filter(Boolean).join(" · ")}</p>
          <p className="mt-1">
            {withEmoji(CONF_LABEL[s.match_confidence ?? ""] ?? "❔")}
            {s.match_reason ? <span className="text-muted-foreground"> · reconhecido por {s.match_reason}</span> : null}
          </p>
          <p className="text-muted-foreground">Origem: {s.referrer || "Direto"}{s.utm ? ` (utm: ${s.utm})` : ""}</p>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2 text-center text-sm">
          {[
            ["Duração", fmtDur(s.duration_s)], ["Tempo ativo", fmtDur(s.active_s)], ["Interesse", ENG_LABEL[engOf(s)]],
            ["Páginas", String(s.pages ?? "—")], ["Cliques", String(s.clicks ?? "—")], ["Ações", String(s.actions ?? "—")],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-border bg-card p-2">
              <div className="text-xs text-muted-foreground">{k}</div>
              <div className="font-semibold">{withEmoji(v)}</div>
            </div>
          ))}
        </div>

        {pages.length > 0 && (
          <>
            <h3 className="mb-1 text-sm font-semibold">Navegação</h3>
            <table className="mb-4 w-full text-sm">
              <thead><tr className="text-left text-xs text-muted-foreground"><th>Página</th><th className="text-right">Tempo</th><th className="text-right">Rolagem</th></tr></thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.p} className="border-t border-border">
                    <td className="py-1">{p.p}{p.views > 1 ? ` ×${p.views}` : ""}</td>
                    <td className="py-1 text-right">{fmtDur(p.time)}</td>
                    <td className="py-1 text-right">{p.scroll ? `${p.scroll}%` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {top.length > 0 && (
          <>
            <h3 className="mb-1 text-sm font-semibold">Maiores interesses</h3>
            <ul className="mb-4 space-y-1 text-sm">
              {top.map((t) => (
                <li key={t.k}>
                  • {t.k} <span className="text-muted-foreground">— {[t.hover ? `${fmtDur(t.hover / 1000)} de foco` : "", t.clicks ? `${t.clicks} clique${t.clicks > 1 ? "s" : ""}` : ""].filter(Boolean).join(" · ")}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        <h3 className="mb-1 text-sm font-semibold">Linha do tempo</h3>
        {err && <p className="text-sm text-muted-foreground">{err}</p>}
        {!evs && !err && <p className="text-sm text-muted-foreground">Carregando…</p>}
        {evs && !timeline.length && <p className="text-sm text-muted-foreground">Sem eventos (podem ter sido apagados pela retenção).</p>}
        <ol className="space-y-1 text-sm">
          {timeline.map((t, i) => (
            <li key={i} className={`flex gap-3 ${t.important ? "font-medium" : ""}`}>
              <span className="w-16 shrink-0 font-mono text-xs text-muted-foreground">{F.time.format(new Date(t.t))}</span>
              <span>{t.important ? <><Emoji char="🎯" />{" "}</> : null}{t.text}</span>
            </li>
          ))}
        </ol>
      </aside>
    </div>
    </div>,
    document.body
  );
}

/* ───────────────────────── Lista de visitas ───────────────────────── */

function VisitsTab({ rows, devMap, onOpen }: { rows: Session[]; devMap: Map<string, Device>; onOpen: (s: Session) => void }) {
  const [limit, setLimit] = useState(50);
  if (!rows.length) return <p className="ea-glass p-8 text-center text-sm text-muted-foreground">Nenhuma visita com esses filtros.</p>;
  return (
    <div className="ea-glass">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="p-3">Início</th><th>Aparelho</th><th>Local</th><th className="text-right">Duração</th>
              <th className="text-right">Págs.</th><th className="text-right">Ações</th><th>Interesse</th><th className="pr-3">Reconhecimento</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, limit).map((s) => {
              const d = s.device_id ? devMap.get(s.device_id) : undefined;
              return (
                <tr key={s.sid} tabIndex={0} onClick={() => onOpen(s)} onKeyDown={(e: any) => e.key === "Enter" && onOpen(s)}
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none">
                  <td className="whitespace-nowrap p-3">{F.dateTime.format(new Date(s.started_at))}{!s.ended_at && <span className="ml-1 text-xs text-muted-foreground">· em andamento</span>}</td>
                  <td className="whitespace-nowrap">{kindIcon(s.device_kind)} {devName(d)}{s.visit_no ? <span className="text-muted-foreground"> · {s.visit_no}ª</span> : null}{d?.is_owner ? <span className="ml-1 text-xs text-muted-foreground">(seu)</span> : null}</td>
                  <td className="max-w-[200px] truncate text-muted-foreground">{place(s)}</td>
                  <td className="text-right">{s.ended_at ? fmtDur(s.duration_s) : "—"}</td>
                  <td className="text-right">{s.pages ?? "—"}</td>
                  <td className="text-right">{s.actions ?? "—"}</td>
                  <td className="whitespace-nowrap">{s.ended_at ? withEmoji(ENG_LABEL[engOf(s)]) : "—"}</td>
                  <td className="whitespace-nowrap pr-3">{withEmoji(CONF_LABEL[s.match_confidence ?? ""] ?? "—")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length > limit && (
        <div className="border-t border-border p-3 text-center">
          <button type="button" onClick={() => setLimit(limit + 50)} className="rounded-md border border-border px-3 py-1 text-sm hover:bg-muted">Mostrar mais ({rows.length - limit})</button>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Aparelhos ───────────────────────── */

function DeviceRow({ d, source, onSave, onOpenSession, focus }: { d: Device; source: Source; onSave: (id: string, patch: Partial<Pick<Device, "alias" | "notes" | "is_owner">>) => Promise<void>; onOpenSession: (sid: string) => void; focus: boolean }) {
  const [open, setOpen] = useState(focus);
  const [alias, setAlias] = useState(d.alias ?? "");
  const [notes, setNotes] = useState(d.notes ?? "");
  const [hist, setHist] = useState<Session[] | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || hist) return;
    source.history(d.id).then((r) => setHist(r ?? [])).catch(() => setHist([]));
  }, [open, hist, d.id, source]);

  const save = async (patch: Partial<Pick<Device, "alias" | "notes" | "is_owner">>) => {
    setBusy(true);
    try { await onSave(d.id, patch); } finally { setBusy(false); }
  };

  return (
    <div id={`dev-${d.id}`} className={`ea-glass ${focus ? "ea-focus" : ""}`}>
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 p-4 text-left">
        <span className="font-semibold text-foreground">{kindIcon(d.device_kind)} Aparelho #{d.num}{d.alias ? ` · “${d.alias}”` : ""}</span>
        {d.is_owner && <span className="rounded-full border border-border px-2 text-xs">meu aparelho</span>}
        <span className="text-sm text-muted-foreground">{[d.model, d.os, d.browser].filter(Boolean).join(" · ")}</span>
        <span className="ml-auto text-sm text-muted-foreground">{d.visits} visita{d.visits === 1 ? "" : "s"} · última {rel(d.last_seen)}</span>
      </button>
      {open && (
        <div className="space-y-4 border-t border-border p-4 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs text-muted-foreground">Nome do aparelho</span>
              <input value={alias} onChange={(e: any) => setAlias(e.target.value)} onBlur={() => alias !== (d.alias ?? "") && save({ alias: alias.trim() || null })}
                     placeholder="ex.: iPhone da Maria" maxLength={60} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5" />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Anotações</span>
              <input value={notes} onChange={(e: any) => setNotes(e.target.value)} onBlur={() => notes !== (d.notes ?? "") && save({ notes: notes.trim() || null })}
                     placeholder="ex.: recrutador da empresa X" maxLength={200} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5" />
            </label>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={d.is_owner} disabled={busy} onChange={(e: any) => save({ is_owner: e.target.checked })} />
            <span>Este é o <b>meu</b> aparelho <span className="text-muted-foreground">(sem mensagens no Telegram; some das estatísticas se “Ocultar meus aparelhos” estiver ligado)</span></span>
          </label>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-muted-foreground sm:grid-cols-3">
            <div><dt className="text-xs">Primeira visita</dt><dd className="text-foreground">{F.full.format(new Date(d.first_seen))}</dd></div>
            <div><dt className="text-xs">Última visita</dt><dd className="text-foreground">{F.full.format(new Date(d.last_seen))}</dd></div>
            <div><dt className="text-xs">Último local</dt><dd className="text-foreground">{place({ city: d.last_city, region: d.last_region, country: d.last_country })}</dd></div>
            <div><dt className="text-xs">Tela</dt><dd className="text-foreground">{d.screen ?? "—"}</dd></div>
            <div><dt className="text-xs">Placa de vídeo</dt><dd className="truncate text-foreground" title={d.gpu ?? ""}>{d.gpu ?? "—"}</dd></div>
            <div><dt className="text-xs">Fuso · idioma</dt><dd className="text-foreground">{[d.tz, d.lang].filter(Boolean).join(" · ") || "—"}</dd></div>
            <div><dt className="text-xs">Navegadores / redes vistos</dt><dd className="text-foreground">{d.vids?.length ?? 0} / {d.ip_hashes?.length ?? 0}</dd></div>
          </dl>
          <div>
            <h4 className="mb-1 font-semibold text-foreground">Histórico de visitas</h4>
            {!hist && <p className="text-muted-foreground">Carregando…</p>}
            {hist && !hist.length && <p className="text-muted-foreground">Sem visitas registradas (podem ter sido apagadas pela retenção).</p>}
            {hist && hist.length > 0 && (
              <ul className="divide-y divide-border rounded-lg border border-border">
                {hist.map((s) => (
                  <li key={s.sid}>
                    <button type="button" onClick={() => onOpenSession(s.sid)} className="flex w-full flex-wrap items-center gap-x-4 px-3 py-2 text-left hover:bg-muted/60">
                      <span>{F.full.format(new Date(s.started_at))}</span>
                      <span className="text-muted-foreground">{place(s)}</span>
                      <span className="ml-auto text-muted-foreground">{s.ended_at ? `${fmtDur(s.duration_s)} · ${s.pages ?? 0} págs. · ${s.actions ?? 0} ações` : "em andamento"}</span>
                      <span>{withEmoji(CONF_LABEL[s.match_confidence ?? ""] ?? "")}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Painel ───────────────────────── */

export type PanelProps = {
  source: Source;
  /** Chamado quando a fonte avisa que a sessão expirou (só no /admin). */
  onUnauthorized?: () => void;
  /** Botões extras no cabeçalho (ex.: "Sair"). */
  actions?: ReactNode;
  /** Modo demonstração: aviso de dados fictícios e sem atualização automática. */
  demo?: boolean;
  /** Lê ?sid= da URL para abrir uma visita direto (link do Telegram). */
  deepLink?: boolean;
};

export function EspianPanel({ source, onUnauthorized, actions, demo = false, deepLink = false }: PanelProps) {
  const [tab, setTab] = useState<"overview" | "visits" | "devices">("overview");
  const [period, setPeriod] = useState("30");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hideOwner, setHideOwner] = useState(true);
  const [deviceId, setDeviceId] = useState("all");
  const [kind, setKind] = useState("all");
  const [onlyActions, setOnlyActions] = useState(false);
  const [q, setQ] = useState("");
  const [openSid, setOpenSid] = useState<string | null>(() => {
    if (!deepLink) return null;
    try { return new URLSearchParams(location.search).get("sid"); } catch { return null; }
  });
  const [focusDev, setFocusDev] = useState<string | null>(null);
  const [openSession, setOpenSession] = useState<Session | null>(null);

  const days = PERIODS.find((p) => p.id === period)?.days ?? 30;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await source.list(days);
      setSessions(r.sessions ?? []);
      setDevices(r.devices ?? []);
      setError("");
    } catch (e: any) {
      const msg = String(e?.message || e);
      if (/expirada/i.test(msg) && onUnauthorized) onUnauthorized(); else setError(msg);
    } finally {
      setLoading(false);
    }
  }, [days, source, onUnauthorized]);

  useEffect(() => { load(); }, [load]);
  // Atualização automática a cada 60 s — só no painel real
  useEffect(() => {
    if (demo) return;
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load, demo]);

  const devMap = useMemo(() => new Map(devices.map((d) => [d.id, d])), [devices]);

  // Abre a visita pedida em ?sid= (ou clicada no histórico do aparelho)
  useEffect(() => {
    if (!openSid) { setOpenSession(null); return; }
    const hit = sessions.find((s) => s.sid === openSid);
    if (hit) { setOpenSession(hit); return; }
    source.session(openSid).then((r) => setOpenSession(r ?? null)).catch(() => setOpenSession(null));
  }, [openSid, sessions, source]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return sessions.filter((s) => {
      const d = s.device_id ? devMap.get(s.device_id) : undefined;
      if (hideOwner && d?.is_owner) return false;
      if (deviceId !== "all" && s.device_id !== deviceId) return false;
      if (kind !== "all" && s.device_kind !== kind) return false;
      if (onlyActions && !((s.actions ?? 0) > 0)) return false;
      if (needle) {
        const hay = [s.city, s.region, s.country, s.browser, s.os, s.referrer, d?.alias, d?.model, d ? `#${d.num}` : "", ...(s.summary?.pages?.map((p) => p.p) ?? [])]
          .filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [sessions, devMap, hideOwner, deviceId, kind, onlyActions, q]);

  const saveDevice = useCallback(async (id: string, patch: DevicePatch) => {
    try {
      const r = await source.saveDevice(id, patch);
      if (r) setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, ...r } : d)));
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  }, [source]);

  const visibleDevices = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return devices.filter((d) => {
      if (hideOwner && d.is_owner) return false;
      if (kind !== "all" && d.device_kind !== kind) return false;
      if (!needle) return true;
      return [d.alias, d.notes, d.model, d.os, d.browser, d.last_city, `#${d.num}`].filter(Boolean).join(" ").toLowerCase().includes(needle);
    });
  }, [devices, hideOwner, kind, q]);

  const TABS: [typeof tab, string][] = [["overview", "Visão geral"], ["visits", `Visitas (${rows.length})`], ["devices", `Aparelhos (${visibleDevices.length})`]];
  const sel = "rounded-md border border-border bg-background px-2 py-1.5 text-sm";

  return (
    <div className="text-foreground">
      <header className="ea-header">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <h1 className="text-lg font-semibold"><Emoji char="🕵️" /> EspIAn <span className="text-sm font-normal text-muted-foreground">painel</span></h1>
          {demo && <span className="ea-badge"><Emoji char="🔒" /> Dados artificiais para preservar os verdadeiros visitantes do site</span>}
          <div className="ml-auto flex flex-wrap items-center gap-2 text-sm">
            <button type="button" onClick={load} className="rounded-md border border-border px-2 py-1 hover:bg-muted">↻ Atualizar</button>
            {actions}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 px-4 py-5">
        {/* Filtros: uma linha só, acima de tudo; valem para todas as abas */}
        <div className="flex flex-wrap items-center gap-2">
          <select aria-label="Período" value={period} onChange={(e: any) => setPeriod(e.target.value)} className={sel}>
            {PERIODS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <select aria-label="Aparelho" value={deviceId} onChange={(e: any) => setDeviceId(e.target.value)} className={sel}>
            <option value="all">Todos os aparelhos</option>
            {devices.map((d) => <option key={d.id} value={d.id}>{kindChar(d.device_kind)} {devName(d)} — {d.model ?? ""}</option>)}
          </select>
          <select aria-label="Tipo" value={kind} onChange={(e: any) => setKind(e.target.value)} className={sel}>
            <option value="all">Celular e computador</option>
            <option value="mobile">Só celular</option>
            <option value="desktop">Só computador</option>
          </select>
          <input value={q} onChange={(e: any) => setQ(e.target.value)} placeholder="Buscar cidade, página, aparelho…" className={`${sel} w-56`} />
          <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={onlyActions} onChange={(e: any) => setOnlyActions(e.target.checked)} /> Só com ações de interesse</label>
          <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={hideOwner} onChange={(e: any) => setHideOwner(e.target.checked)} /> Ocultar meus aparelhos</label>
        </div>

        <nav className="ea-tabs" role="tablist">
          {TABS.map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} type="button" onClick={() => setTab(id)}
                    className={`ea-tab ${tab === id ? "on" : ""}`}>
              {label}
            </button>
          ))}
        </nav>

        {error && <p role="alert" className="rounded-md border border-border bg-card p-3 text-sm"><Emoji char="⚠️" /> {error}</p>}
        {!demo && !loading && !error && !sessions.length && !devices.length && (
          <p className="rounded-md border border-border bg-card p-3 text-sm text-muted-foreground">
            Nenhum dado ainda. Se já houve visitas, confira se o e-mail da função <code>is_espian_admin()</code> no Supabase é o mesmo deste login.
          </p>
        )}

        <div style={{ opacity: loading ? 0.6 : 1, transition: "opacity .15s" }}>
          {tab === "overview" && <Overview rows={rows} devMap={devMap} days={days} />}
          {tab === "visits" && <VisitsTab rows={rows} devMap={devMap} onOpen={(s) => setOpenSid(s.sid)} />}
          {tab === "devices" && (
            <div className="space-y-3">
              {!visibleDevices.length && <p className="ea-glass p-8 text-center text-sm text-muted-foreground">Nenhum aparelho com esses filtros.</p>}
              {visibleDevices.map((d) => (
                <DeviceRow key={d.id} d={d} source={source} focus={focusDev === d.id} onSave={saveDevice} onOpenSession={(sid) => setOpenSid(sid)} />
              ))}
            </div>
          )}
        </div>
      </main>

      {openSession && (
        <VisitDrawer
          s={openSession}
          dev={openSession.device_id ? devMap.get(openSession.device_id) : undefined}
          source={source}
          onClose={() => setOpenSid(null)}
          onOpenDevice={(id) => { setOpenSid(null); setFocusDev(id); setTab("devices"); }}
        />
      )}
    </div>
  );
}

/* ───────────────────────── Casca com tema próprio ───────────────────────── */
// Tudo vive dentro de .ea, então não mexe no resto do site.
export function EspianShell({ embedded = false, children }: { embedded?: boolean; children: ReactNode }) {
  return (
    <div className={`ea${embedded ? " ea-embedded" : ""}`}>
      <style>{CSS}</style>
      {children}
    </div>
  );
}