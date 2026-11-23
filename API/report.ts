// api/report.ts — resumo diário do EspIAn no Telegram (cron do vercel.json: "0 11 * * *" = 8h em Teresina)
// Lê as tabelas `sessions` e `devices` (as mesmas do collect.ts) e envia o resumo do DIA ANTERIOR.
// Aparelhos marcados como "meu aparelho" ficam de fora das contas.
//
// Variáveis: SUPABASE_URL, SUPABASE_SERVICE_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (as mesmas do collect.ts)
//   Recomendada: CRON_SECRET  → a Vercel envia "Authorization: Bearer <CRON_SECRET>" no cron; sem ele, qualquer um
//                               que descubra a URL poderia disparar a mensagem.
//   Opcional:    ADMIN_URL    → ex.: https://weliton-dev.vercel.app/admin (vira link nas visitas em destaque)
// Teste manual (sem enviar nada):  GET /api/report?dry=1  (com o cabeçalho Authorization, se CRON_SECRET existir)

import type { VercelRequest, VercelResponse } from "@vercel/node";

export const config = { maxDuration: 30 };

const SB_URL = process.env.SUPABASE_URL ?? "";
const SB_KEY = process.env.SUPABASE_SERVICE_KEY ?? "";
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const TG_CHAT = process.env.TELEGRAM_CHAT_ID ?? "";
const CRON_SECRET = process.env.CRON_SECRET ?? "";
const ADMIN_URL = (process.env.ADMIN_URL ?? "").replace(/\/+$/, "");
const TZ = "America/Fortaleza"; // Teresina (UTC-3, sem horário de verão)
const DAY = 86400000;

const sbHeaders: Record<string, string> = SB_KEY.startsWith("sb_")
  ? { apikey: SB_KEY }
  : { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` };

type Dev = { num: number; alias: string | null; is_owner: boolean; model: string | null } | null;
type Row = {
  sid: string; started_at: string; device_id: string | null; visit_no: number | null; actions: number | null;
  active_s: number | null; city: string | null; region: string | null; referrer: string | null; device_kind: string | null;
  summary: { pages?: { p: string }[] } | null; devices: Dev;
};

/* ───────────────────────── Utilitários ───────────────────────── */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const dayKeyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const fmtDur = (sec: number) => {
  const s = Math.max(0, Math.round(sec));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m}min` : `${Math.floor(m / 60)}h ${m % 60}min`;
};

function top(map: Map<string, number>, n = 3): string[] {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${esc(k)} (${v})`);
}
function bump(map: Map<string, number>, k: string) { map.set(k, (map.get(k) ?? 0) + 1); }

// Variação em relação ao dia anterior: "▲ 3", "▼ 2" ou "= igual"
function delta(a: number, b: number) {
  if (a === b) return "= igual a anteontem";
  return `${a > b ? "▲" : "▼"} ${Math.abs(a - b)} ${a > b ? "a mais" : "a menos"} que anteontem`;
}

/* ───────────────────────── Resumo ───────────────────────── */

export function buildSummary(rows: Row[], startMs: number, endMs: number) {
  const mine = rows.filter((r) => !r.devices?.is_owner);
  const inDay = (r: Row, a: number, b: number) => { const t = Date.parse(r.started_at); return t >= a && t < b; };
  const ontem = mine.filter((r) => inDay(r, startMs, endMs));
  const anteontem = mine.filter((r) => inDay(r, startMs - DAY, startMs));

  const label = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, weekday: "long", day: "2-digit", month: "2-digit" }).format(new Date(startMs + 12 * 3600000));
  const lines: string[] = [`📊 <b>RESUMO DE ONTEM</b> — ${esc(label)}`, ""];

  if (!ontem.length) {
    lines.push("😴 Nenhuma visita registrada.", "", `<i>${esc(delta(0, anteontem.length))}</i>`);
    return lines.join("\n");
  }

  const aparelhos = new Set(ontem.map((r) => r.device_id ?? r.sid));
  const novos = new Set(ontem.filter((r) => (r.visit_no ?? 1) <= 1).map((r) => r.device_id ?? r.sid));
  const interesse = ontem.filter((r) => (r.actions ?? 0) > 0 || (r.active_s ?? 0) >= 120);
  const acoes = ontem.reduce((s, r) => s + (r.actions ?? 0), 0);
  const ativo = ontem.reduce((s, r) => s + (r.active_s ?? 0), 0) / ontem.length;

  lines.push(
    `👁 <b>${ontem.length}</b> ${ontem.length === 1 ? "visita" : "visitas"} · ${esc(delta(ontem.length, anteontem.length))}`,
    `📱 ${aparelhos.size} ${aparelhos.size === 1 ? "aparelho" : "aparelhos"} · 🆕 ${novos.size} ${novos.size === 1 ? "novo" : "novos"} · 🔁 ${aparelhos.size - novos.size} ${aparelhos.size - novos.size === 1 ? "recorrente" : "recorrentes"}`,
    `🔥 ${interesse.length} com interesse alto · 🎯 ${acoes} ${acoes === 1 ? "ação" : "ações"} · ⏱ ${fmtDur(ativo)} de tempo ativo médio`,
  );

  const cidades = new Map<string, number>(), origens = new Map<string, number>(), paginas = new Map<string, number>();
  for (const r of ontem) {
    bump(cidades, [r.city, r.region].filter(Boolean).join(" — ") || "Local desconhecido");
    bump(origens, r.referrer || "Direto");
    for (const p of new Set((r.summary?.pages ?? []).map((x) => x.p))) bump(paginas, p);
  }
  lines.push("", `📍 <b>De onde vieram:</b> ${top(cidades).join(" · ")}`, `🔗 <b>Origem:</b> ${top(origens).join(" · ")}`);
  if (paginas.size) lines.push(`📄 <b>Páginas mais vistas:</b> ${top(paginas).join(" · ")}`);

  const destaque = [...ontem].sort((a, b) => (b.actions ?? 0) - (a.actions ?? 0) || (b.active_s ?? 0) - (a.active_s ?? 0))
    .filter((r) => (r.actions ?? 0) > 0 || (r.active_s ?? 0) >= 120).slice(0, 3);
  if (destaque.length) {
    lines.push("", "⭐ <b>Visitas em destaque:</b>");
    for (const r of destaque) {
      const d = r.devices;
      const nome = d ? `#${d.num}${d.alias ? ` “${esc(d.alias)}”` : ""}` : "aparelho não identificado";
      const onde = r.city ? ` · ${esc(r.city)}` : "";
      const base = `${r.device_kind === "mobile" ? "📱" : "💻"} ${nome}${onde} · ${fmtDur(r.active_s ?? 0)} · ${r.actions ?? 0} ${(r.actions ?? 0) === 1 ? "ação" : "ações"}`;
      lines.push(ADMIN_URL ? `${base} — <a href="${ADMIN_URL}?sid=${encodeURIComponent(r.sid)}">abrir</a>` : base);
    }
  }
  if (ADMIN_URL) lines.push("", `<a href="${ADMIN_URL}">Abrir o painel</a>`);
  return lines.join("\n");
}

/* ───────────────────────── Handler ───────────────────────── */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (CRON_SECRET && req.headers.authorization !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ ok: false, error: "não autorizado" });
  }
  if (!SB_URL || !SB_KEY) return res.status(500).json({ ok: false, error: "Supabase não configurado" });

  // "Ontem" no fuso de Teresina: de 00:00 de ontem até 00:00 de hoje (-03:00)
  const hojeMs = Date.parse(dayKeyFmt.format(new Date()) + "T00:00:00-03:00");
  const inicio = hojeMs - DAY;
  const desde = new Date(inicio - DAY).toISOString(); // inclui anteontem, para comparar

  try {
    const q =
      `sessions?select=sid,started_at,device_id,visit_no,actions,active_s,city,region,referrer,device_kind,summary,devices(num,alias,is_owner,model)` +
      `&started_at=gte.${encodeURIComponent(desde)}&started_at=lt.${encodeURIComponent(new Date(hojeMs).toISOString())}` +
      `&order=started_at.asc&limit=5000`;
    const r = await fetch(`${SB_URL}/rest/v1/${q}`, { headers: sbHeaders });
    if (!r.ok) {
      console.error("❌ Supabase recusou:", r.status, await r.text());
      return res.status(502).json({ ok: false, error: "falha ao ler o Supabase" });
    }
    const rows = (await r.json()) as Row[];
    const texto = buildSummary(rows, inicio, hojeMs);

    if (req.query?.dry) return res.status(200).json({ ok: true, dry: true, texto });
    if (!TG_TOKEN || !TG_CHAT) return res.status(500).json({ ok: false, error: "Telegram não configurado" });

    const tg = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TG_CHAT, text: texto.slice(0, 4000), parse_mode: "HTML", disable_web_page_preview: true }),
    });
    if (!tg.ok) {
      console.error("❌ Telegram recusou:", await tg.text());
      return res.status(502).json({ ok: false, error: "Telegram recusou a mensagem" });
    }
    console.log("✅ Resumo diário enviado");
    return res.status(200).json({ ok: true, visitas: rows.length });
  } catch (e) {
    console.error("❌ Erro no resumo diário:", e);
    return res.status(500).json({ ok: false, error: "erro interno" });
  }
}