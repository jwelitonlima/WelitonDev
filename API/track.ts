import type { VercelRequest, VercelResponse } from "@vercel/node";

const TYPES = new Set([
  "session_start", "page_view", "page_leave", "click", "rage_click", "scroll_depth",
  "vital", "video", "fetch", "resource_error", "copy", "error", "function",
]);
const ALLOWED_HOSTS = new Set(["weliton-dev.vercel.app", "welitondev.com", "www.welitondev.com", "localhost"]);
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

const sbHeaders = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` };
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const origin = (req.headers.origin as string) || (req.headers.referer as string) || "";
    let host = "";
    try { host = new URL(origin).hostname; } catch { /* ignora */ }
    if (!ALLOWED_HOSTS.has(host)) return res.status(403).end();

    const ua = String(req.headers["user-agent"] || "");
    if (!ua || BOT.test(ua)) return res.status(204).end();
    const { browser, os } = parseUA(ua);

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const sid = body?.sid;
    const vid = body?.vid;
    if (!ID_RE.test(sid) || !ID_RE.test(vid) || !Array.isArray(body?.events)) return res.status(400).end();

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

    const alerts: string[] = [];
    let errorAlerted = false;
    for (const r of rows) {
      if (r.type === "session_start") {
        alerts.push(
          `🌐 Novo acesso: ${r.city || "cidade desconhecida"} - ${r.region || "?"}\n` +
            `${r.meta.device === "mobile" ? "📱 Celular" : "💻 Computador"} | ${r.browser} / ${r.os}\n` +
            `${r.meta.returning ? "↩️ já tinha visitado" : "🆕 primeira visita"} | 🔗 ${r.meta.utm_source || r.meta.referrer || "direto"}`
        );
      }
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

    await fetch(`${SB_URL}/rest/v1/events`, {
      method: "POST",
      headers: { ...sbHeaders, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(rows),
    });

    await Promise.allSettled(alerts.slice(0, 3).map(telegram));

    return res.status(204).end();
  } catch {
    return res.status(204).end();
  }
}