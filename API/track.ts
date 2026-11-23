import type { VercelRequest, VercelResponse } from "@vercel/node";

const TYPES = new Set([
  "session_start", "session_end", "page_view", "page_leave", "click", "rage_click", "scroll_depth",
  "vital", "video", "fetch", "resource_error", "copy", "error", "function",
]);
// Se um dia usar domínio próprio, adicione-o aqui.
const ALLOWED_HOSTS = new Set(["weliton-dev.vercel.app", "localhost"]);
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|whatsapp|telegram|vercel/i;
const META_KEYS = [
  "returning", "device", "referrer", "tag", "x", "y", "ok", "src", "line", "screen",
  "lang", "tz", "dark", "conn", "utm_source", "utm_medium", "utm_campaign", "status", "outbound",
];
const ID_RE = /^[a-zA-Z0-9-]{8,64}$/;

const BR_STATES: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia", CE: "Ceará",
  DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão",
  MT: "Mato Grosso", MS: "Mato Grosso do Sul", MG: "Minas Gerais", PA: "Pará",
  PB: "Paraíba", PR: "Paraná", PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte", RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima",
  SC: "Santa Catarina", SP: "São Paulo", SE: "Sergipe", TO: "Tocantins",
};

const SB_URL = process.env.SUPABASE_URL ?? "";
const SB_KEY = process.env.SUPABASE_SERVICE_KEY ?? "";
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const TG_CHAT = process.env.TELEGRAM_CHAT_ID ?? "";

// Chave nova (sb_secret_) só vai no cabeçalho apikey; chave legada (JWT) vai nos dois
const sbHeaders: Record<string, string> = SB_KEY.startsWith("sb_")
  ? { apikey: SB_KEY }
  : { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` };

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : undefined);

function parseUA(ua: string) {
  const browser = /edg\//i.test(ua) ? "Edge"
    : /opr\/|opera/i.test(ua) ? "Opera"
    : /firefox|fxios/i.test(ua) ? "Firefox"
    : /chrome|crios/i.test(ua) ? "Chrome"
    : /safari/i.test(ua) ? "Safari" : "Outro";
  const os = /windows/i.test(ua) ? "Windows"
    : /android/i.test(ua) ? "Android"
    : /iphone|ipad|ios/i.test(ua) ? "iOS"
    : /mac os/i.test(ua) ? "macOS"
    : /linux/i.test(ua) ? "Linux" : "Outro";
  return { browser, os };
}

function cleanMeta(m: unknown) {
  const out: Record<string, string | number | boolean> = {};
  if (!m || typeof m !== "object") return out;
  for (const k of META_KEYS) {
    const v = (m as Record<string, unknown>)[k];
    if (typeof v === "string") out[k] = v.slice(0, 100);
    else if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
    else if (typeof v === "boolean") out[k] = v;
  }
  return out;
}

async function telegram(text: string) {
  if (!TG_TOKEN || !TG_CHAT) return;
  await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TG_CHAT, text: text.slice(0, 4000) }),
  }).catch(() => {});
}

/** Anti-spam: não alerta o mesmo evento/label mais de 1x a cada 10 minutos. */
async function seenRecently(type: string, label: string) {
  try {
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const url =
      `${SB_URL}/rest/v1/events?type=eq.${type}&label=eq.${encodeURIComponent(label)}` +
      `&created_at=gte.${since}&select=id&limit=1`;
    const r = await fetch(url, { headers: sbHeaders });
    const d = await r.json();
    return Array.isArray(d) && d.length > 0;
  } catch {
    return false;
  }
}

/** Anti-spam do resumo: no máximo 1 por visita a cada 2 minutos. */
async function summarySeenRecently(sid: string) {
  try {
    const since = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const url = `${SB_URL}/rest/v1/events?type=eq.session_end&session_id=eq.${sid}&created_at=gte.${since}&select=id&limit=1`;
    const r = await fetch(url, { headers: sbHeaders });
    const d = await r.json();
    return Array.isArray(d) && d.length > 0;
  } catch {
    return false;
  }
}

const fmtSec = (s: number) => (s < 60 ? `${s}s` : `${Math.floor(s / 60)}min ${s % 60}s`);
const zone = (y: unknown) => (typeof y !== "number" ? "" : y < 33 ? "topo" : y < 66 ? "meio" : "fim");

/** Monta o resumo completo da visita a partir de tudo que já está gravado. */
async function sessionSummary(sid: string, vid: string, ctx: { city: string; region: string; browser: string; os: string }) {
  try {
    const r = await fetch(
      `${SB_URL}/rest/v1/events?session_id=eq.${sid}&select=type,path,label,value,meta&order=id.asc&limit=600`,
      { headers: sbHeaders }
    );
    const evs = (await r.json()) as Array<{ type: string; path: string; label: string | null; value: number | null; meta: Record<string, any> }>;
    if (!Array.isArray(evs) || !evs.length) return "";

    // Quantas visitas esse visitante já fez (ID aleatório do navegador)
    let visitNumber = 1;
    try {
      const pr = await fetch(
        `${SB_URL}/rest/v1/events?visitor_id=eq.${vid}&type=eq.session_start&select=session_id&limit=100`,
        { headers: sbHeaders }
      );
      const pd = (await pr.json()) as Array<{ session_id: string }>;
      if (Array.isArray(pd)) visitNumber = Math.max(1, new Set(pd.map((x) => x.session_id)).size);
    } catch { /* ignora */ }

    const start = evs.find((e) => e.type === "session_start");
    const returning = visitNumber > 1 || start?.meta?.returning === true;
    const device = start?.meta?.device === "mobile" ? "📱 Celular" : "💻 Computador";
    const origin = start?.meta?.utm_source || start?.meta?.referrer || "direto";

    // Páginas em ordem, com tempo e rolagem
    const order: string[] = [];
    evs.filter((e) => e.type === "page_view").forEach((e) => { if (!order.includes(e.path)) order.push(e.path); });
    const time = new Map<string, number>();
    const scroll = new Map<string, number>();
    let total = 0;
    evs.forEach((e) => {
      if (e.type === "page_leave") {
        time.set(e.path, (time.get(e.path) || 0) + Number(e.value || 0));
        total += Number(e.value || 0);
      }
      if (e.type === "scroll_depth") scroll.set(e.path, Math.max(scroll.get(e.path) || 0, Number(e.value || 0)));
    });
    const pageLines = order.slice(0, 8).map((p) => {
      const t = time.get(p);
      const s = scroll.get(p);
      return `• ${p}${t ? ` — ${fmtSec(t)}` : ""}${s ? `, rolou ${s}%` : ""}`;
    });

    // Cliques: o quê e onde (topo/meio/fim da página)
    const clicks = evs.filter((e) => e.type === "click");
    const byLabel = new Map<string, { n: number; z: string }>();
    clicks.forEach((c) => {
      const k = c.label || "?";
      const cur = byLabel.get(k) ?? { n: 0, z: zone(c.meta?.y) };
      cur.n++;
      byLabel.set(k, cur);
    });
    const clickList = [...byLabel.entries()]
      .sort((a, b) => b[1].n - a[1].n)
      .slice(0, 8)
      .map(([label, v]) => `${label.slice(0, 40)}${v.z || v.n > 1 ? ` (${[v.z, v.n > 1 ? `×${v.n}` : ""].filter(Boolean).join(" ")})` : ""}`);

    const rage = evs.filter((e) => e.type === "rage_click").length;
    const errs = evs.filter((e) => e.type === "error").length;
    const copies = evs.filter((e) => e.type === "copy").length;
    const video = evs.filter((e) => e.type === "video").reduce((a, e) => a + Number(e.value || 0), 0);

    return [
      "📋 Resumo da visita",
      `📍 ${ctx.city || "cidade desconhecida"} - ${ctx.region || "?"}`,
      `${device} | ${ctx.browser} / ${ctx.os} | 🔗 ${origin}`,
      returning
        ? `🔁 ${visitNumber}ª visita (visitante recorrente)`
        : "🆕 Primeira visita",
      `⏱️ Tempo ativo: ${total ? fmtSec(total) : "menos de 1s"} | 📄 ${order.length} página(s)`,
      pageLines.length ? `\nPáginas:\n${pageLines.join("\n")}` : "",
      clicks.length ? `\n🖱️ Cliques (${clicks.length}): ${clickList.join(", ")}` : "\n🖱️ Nenhum clique",
      `😡 Cliques de raiva: ${rage} | 🐞 Erros: ${errs}` +
        (copies ? ` | 📋 Cópias: ${copies}` : "") +
        (video ? ` | ▶️ Vídeo: ${fmtSec(video)}` : ""),
    ].filter(Boolean).join("\n");
  } catch {
    return "";
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    // 1) Só aceita quem vem do seu site
    const origin = (req.headers.origin as string) || (req.headers.referer as string) || "";
    let host = "";
    try { host = new URL(origin).hostname; } catch { /* ignora */ }
    if (!ALLOWED_HOSTS.has(host)) return res.status(403).end();

    // 2) Ignora robôs
    const ua = String(req.headers["user-agent"] || "");
    if (!ua || BOT.test(ua)) return res.status(204).end();
    const { browser, os } = parseUA(ua);

    // 3) Valida o corpo
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const sid = body?.sid;
    const vid = body?.vid;
    if (!ID_RE.test(sid) || !ID_RE.test(vid) || !Array.isArray(body?.events)) return res.status(400).end();

    // 4) Cidade e estado vêm dos cabeçalhos da Vercel. O IP não é lido nem guardado.
    let city = "";
    try { city = decodeURIComponent(String(req.headers["x-vercel-ip-city"] || "")); } catch { /* ignora */ }
    const country = String(req.headers["x-vercel-ip-country"] || "");
    const regionCode = String(req.headers["x-vercel-ip-country-region"] || "");
    const region = country === "BR" ? BR_STATES[regionCode] || regionCode : regionCode;

    const rows = (body.events as unknown[])
      .slice(0, 20)
      .map((e) => {
        const ev = e as Record<string, unknown>;
        const type = str(ev.type, 30);
        const path = str(ev.path, 120);
        if (!type || !TYPES.has(type) || !path || !path.startsWith("/")) return null;
        const value = typeof ev.value === "number" && Number.isFinite(ev.value) ? ev.value : null;
        return {
          session_id: sid,
          visitor_id: vid,
          type,
          path,
          label: str(ev.label, 200) ?? null,
          value,
          meta: cleanMeta(ev.meta),
          city: city || null,
          region: region || null,
          country: country || null,
          browser,
          os,
        };
      })
      .filter(Boolean) as Array<Record<string, any>>;

    if (rows.length === 0) return res.status(204).end();

    // 5) Decide os alertas ANTES de gravar (para o anti-spam funcionar).
    //    A ENTRADA do visitante NÃO gera alerta: só o resumo, quando ele sair.
    const alerts: string[] = [];
    let errorAlerted = false;
    const wantsSummary = rows.some((r) => r.type === "session_end") && !(await summarySeenRecently(sid));

    for (const r of rows) {
      // --- Alertas de PROBLEMA em tempo real (apague estes 3 blocos se quiser só o resumo) ---
      if (r.type === "error" && r.label && !errorAlerted && !(await seenRecently("error", r.label))) {
        errorAlerted = true;
        alerts.push(`🐞 Erro no site\nPágina: ${r.path}\n${r.label}\n${r.city || ""} ${r.region || ""} | ${r.browser}/${r.os}`.trim());
      }
      if (r.type === "rage_click" && r.label && !(await seenRecently("rage_click", r.label))) {
        alerts.push(`😡 Clique de raiva em "${r.label}" (${r.path})\n${r.city || ""} ${r.region || ""} | ${r.browser}/${r.os}`.trim());
      }
      if (r.type === "fetch" && r.meta.ok === false && r.label && !(await seenRecently("fetch", r.label))) {
        alerts.push(`⚠️ Requisição falhou: ${r.label} (status ${r.meta.status ?? 0})\nPágina: ${r.path}`);
      }
    }

    // 6) Grava no caderninho
    await fetch(`${SB_URL}/rest/v1/events`, {
      method: "POST",
      headers: { ...sbHeaders, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(rows),
    });

    // 7) Resumo da visita (depois de gravar, para incluir tudo que chegou neste envio)
    const final = alerts.slice(0, 3);
    if (wantsSummary) {
      const summary = await sessionSummary(sid, vid, { city, region, browser, os });
      if (summary) final.push(summary);
    }

    // 8) Manda os alertas
    await Promise.allSettled(final.map(telegram));

    return res.status(204).end();
  } catch {
    return res.status(204).end(); // métrica nunca derruba o site
  }
}