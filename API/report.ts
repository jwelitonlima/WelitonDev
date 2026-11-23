import type { VercelRequest, VercelResponse } from "@vercel/node";

const SB_URL = process.env.SUPABASE_URL ?? "";
const SB_KEY = process.env.SUPABASE_SERVICE_KEY ?? "";
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const TG_CHAT = process.env.TELEGRAM_CHAT_ID ?? "";
const GROQ_KEY = process.env.GROQ_API_KEY ?? "";
const CRON_SECRET = process.env.CRON_SECRET ?? "";

const H = SB_KEY.startsWith("sb_") ? { apikey: SB_KEY } : { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` };

async function fetchEvents(sinceIso: string): Promise<any[]> {
  const r = await fetch(`${SB_URL}/rest/v1/events?created_at=gte.${sinceIso}&select=*&order=id.asc`, { headers: H });
  return r.json();
}

const top = (items: string[], n = 8) => {
  const m = new Map();
  items.forEach(i => m.set(i, (m.get(i) || 0) + 1));
  return [...m.entries()].sort((a,b) => b[1]-a[1]).slice(0,n);
};
const fmt = (pairs: any[]) => pairs.map(([k,n]) => `${k} (${n})`).join(", ") || "-";

async function telegram(text: string) {
  if (!TG_TOKEN || !TG_CHAT) return;
  await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TG_CHAT, text: text.slice(0, 4000) }),
  }).catch(() => {});
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!CRON_SECRET || req.headers.authorization !== `Bearer ${CRON_SECRET}`) return res.status(401).end();
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const events = await fetchEvents(since);
    
    if (!events.length) { await telegram("📊 Nenhuma visita nas últimas 24h."); return res.status(200).end(); }

    const sessions = new Set(events.map(e => e.session_id)).size;
    const views = events.filter(e => e.type === "page_view").length;
    const topPages = top(events.filter(e => e.type === "page_view").map(e => e.path));

    const msg = [
      "📊 Resumo Diário (24h)",
      `👥 Visitas: ${sessions} | 📄 Pageviews: ${views}`,
      `🔥 Top Páginas: ${fmt(topPages)}`,
    ].join("\n");

    await telegram(msg);
    return res.status(200).json({ ok: true });
  } catch { return res.status(500).end(); }
}