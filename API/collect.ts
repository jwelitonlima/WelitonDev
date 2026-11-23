import type { VercelRequest, VercelResponse } from "@vercel/node";

const ALLOWED_HOSTS = new Set(["weliton-dev.vercel.app", "localhost"]);
const SB_URL = process.env.SUPABASE_URL ?? "";
const SB_KEY = process.env.SUPABASE_SERVICE_KEY ?? "";
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const TG_CHAT = process.env.TELEGRAM_CHAT_ID ?? "";

const sbHeaders = SB_KEY.startsWith("sb_") ? { apikey: SB_KEY } : { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` };

async function telegram(text: string) {
  if (!TG_TOKEN || !TG_CHAT) {
    console.error("❌ ERRO CRÍTICO: Variáveis do Telegram não configuradas na Vercel!");
    return;
  }
  console.log(`📤 Enviando para o Telegram: ${text.substring(0, 20)}...`);
  try {
    const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TG_CHAT, text: text.slice(0, 4000) }),
    });
    const data = await res.json();
    if (!data.ok) console.error("❌ Telegram recusou a mensagem:", data);
    else console.log("✅ Telegram enviado com sucesso!");
  } catch (err) {
    console.error("❌ Falha na rede ao chamar Telegram:", err);
  }
}

async function summarySeenRecently(sid: string) {
  try {
    const since = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const r = await fetch(`${SB_URL}/rest/v1/events?type=eq.session_end&session_id=eq.${sid}&created_at=gte.${since}&select=id&limit=1`, { headers: sbHeaders });
    const d = await r.json();
    return Array.isArray(d) && d.length > 0;
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
  console.log("--- 🔔 NOVA REQUISIÇÃO RECEBIDA ---");
  if (req.method !== "POST") return res.status(405).end();

  try {
    const origin = (req.headers.origin as string) || (req.headers.referer as string) || "";
    let host = ""; try { host = new URL(origin).hostname; } catch {}
    if (!ALLOWED_HOSTS.has(host)) {
      console.warn(`🚫 Bloqueado por Host: ${host}`);
      return res.status(403).end();
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (!body || !body.events) {
      console.warn("⚠️ Corpo da requisição inválido.");
      return res.status(400).end();
    }

    const rows = body.events.map((e: any) => ({
      session_id: body.sid, visitor_id: body.vid, type: e.type, path: e.path,
      label: e.label, value: e.value, meta: e.meta || {},
    }));
    
    console.log(`📦 Eventos recebidos:`, rows.map((r:any) => r.type).join(", "));

    // 1) Grava imediatamente no Supabase
    const dbRes = await fetch(`${SB_URL}/rest/v1/events`, {
      method: "POST", headers: { ...sbHeaders, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(rows),
    });
    if (!dbRes.ok) console.error("❌ Falha no Supabase:", await dbRes.text());

    // 2) Dispara alertas
    const hasSessionStart = rows.some((r: any) => r.type === "session_start");
    const hasSessionEnd = rows.some((r: any) => r.type === "session_end");

    if (hasSessionEnd && !(await summarySeenRecently(body.sid))) {
      console.log("🕵️ Gerando resumo de fim de sessão...");
      const summary = await getSessionSummary(body.sid);
      if (summary) await telegram(summary);
    } 
    else if (hasSessionStart) {
      // Fallback para garantir que o alerta volte imediatamente
      console.log("👀 Novo visitante detectado, enviando alerta...");
      const start = rows.find((r:any) => r.type === "session_start");
      await telegram(`👀 Novo visitante!\nOrigem: ${start?.meta?.referrer || 'Direto'}\nDispositivo: ${start?.meta?.device || '?'}\nPágina: ${start?.path}`);
    }

    return res.status(204).end();
  } catch (e) {
    console.error("❌ Erro fatal no handler:", e);
    return res.status(204).end();
  }
}