import type { VercelRequest, VercelResponse } from "@vercel/node";

const ALLOWED_HOSTS = new Set(["weliton-dev.vercel.app", "localhost"]);
const SB_URL = process.env.SUPABASE_URL ?? "";
const SB_KEY = process.env.SUPABASE_SERVICE_KEY ?? "";
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const TG_CHAT = process.env.TELEGRAM_CHAT_ID ?? "";

const sbHeaders = SB_KEY.startsWith("sb_") ? { apikey: SB_KEY } : { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` };

async function telegram(text: string) {
  if (!TG_TOKEN || !TG_CHAT) {
    console.error("❌ Variáveis do Telegram ausentes!");
    return;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TG_CHAT, text: text.slice(0, 4000) }),
    });
    if (!res.ok) console.error("❌ Telegram recusou:", await res.text());
    else console.log("✅ Telegram enviado!");
  } catch (err) { console.error("❌ Erro Telegram:", err); }
}

async function summarySeenRecently(sid: string) {
  try {
    const since = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const r = await fetch(`${SB_URL}/rest/v1/events?type=eq.session_end&session_id=eq.${sid}&created_at=gte.${since}&select=id&limit=1`, { headers: sbHeaders });
    return (await r.json()).length > 0;
  } catch { return false; }
}

async function getSessionSummary(sid: string) {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/events?session_id=eq.${sid}&select=type,path,value,meta&order=id.asc&limit=100`, { headers: sbHeaders });
    const evs = (await r.json()) as any[];
    if (!Array.isArray(evs) || !evs.length) return "";

    const start = evs.find(e => e.type === "session_start");
    const device = start?.meta?.device === "mobile" ? "📱 Celular" : "💻 Computador";
    let total = 0;
    const pages = new Set<string>();
    evs.forEach(e => {
      if (e.type === "page_view") pages.add(e.path);
      if (e.type === "page_leave") total += Number(e.value || 0);
    });

    return [
      "📋 Fim da visita",
      `⏱️ Tempo: ${total}s | 📄 ${pages.size} páginas`,
      `📱 ${device}`,
      `Páginas: ${Array.from(pages).join(", ")}`
    ].join("\n");
  } catch { return ""; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const origin = (req.headers.origin as string) || (req.headers.referer as string) || "";
    let host = ""; try { host = new URL(origin).hostname; } catch {}
    if (!ALLOWED_HOSTS.has(host)) return res.status(403).end();

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (!body || !body.events) return res.status(400).end();

    // CORREÇÃO CRÍTICA: Garantir que TODAS as chaves existem em TODOS os objetos
    const rows = body.events.map((e: any) => ({
      session_id: body.sid,
      visitor_id: body.vid,
      type: e.type || null,
      path: e.path || null,
      label: e.label ?? null, // força null se undefined
      value: (typeof e.value === "number") ? e.value : null,
      meta: e.meta || {},
    }));

    // 1) Grava no Supabase (com tratamento de erro)
    const dbRes = await fetch(`${SB_URL}/rest/v1/events`, {
      method: "POST", 
      headers: { ...sbHeaders, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(rows),
    });
    
    if (!dbRes.ok) {
      const errText = await dbRes.text();
      console.error("❌ Supabase:", errText);
      // Retorna 500 mas AINDA TENTA MANDAR O TELEGRAM PARA NÃO PERDER ALERTA
    } else {
      console.log("✅ Gravado no Supabase:", rows.length, "eventos");
    }

    // 2) Lógica de alerta no Telegram
    const hasSessionEnd = rows.some((r: any) => r.type === "session_end");
    
    if (hasSessionEnd && !(await summarySeenRecently(body.sid))) {
      console.log("🕵️ Gerando resumo...");
      const summary = await getSessionSummary(body.sid);
      if (summary) await telegram(summary);
    }

    // 3) Alerta de erro imediato (se houver)
    const errors = rows.filter((r: any) => r.type === "error" || r.type === "rage_click");
    for (const err of errors) {
      await telegram(`🚨 Alerta: ${err.label || 'Erro'} em ${err.path}`);
    }

    return res.status(204).end();
  } catch (e) {
    console.error("❌ Erro fatal:", e);
    return res.status(204).end();
  }
}