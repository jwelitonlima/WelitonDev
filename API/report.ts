import type { VercelRequest, VercelResponse } from "@vercel/node";

const SB_URL = process.env.SUPABASE_URL ?? "";
const SB_KEY = process.env.SUPABASE_SERVICE_KEY ?? "";
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const TG_CHAT = process.env.TELEGRAM_CHAT_ID ?? "";
const GROQ_KEY = process.env.GROQ_API_KEY ?? "";
const CRON_SECRET = process.env.CRON_SECRET ?? "";

const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` };

type Ev = {
  session_id: string;
  type: string;
  path: string;
  label: string | null;
  value: number | null;
  meta: Record<string, any>;
  city: string | null;
  region: string | null;
  browser: string | null;
  os: string | null;
};

async function fetchEvents(sinceIso: string): Promise<Ev[]> {
  const out: Ev[] = [];
  const pageSize = 1000;
  for (let from = 0; from < 50000; from += pageSize) {
    const r = await fetch(
      `${SB_URL}/rest/v1/events?created_at=gte.${sinceIso}` +
        `&select=session_id,type,path,label,value,meta,city,region,browser,os&order=id.asc`,
      { headers: { ...H, "Range-Unit": "items", Range: `${from}-${from + pageSize - 1}` } }
    );
    if (!r.ok) throw new Error(`Supabase respondeu ${r.status}`);
    const rows = (await r.json()) as Ev[];
    out.push(...rows);
    if (rows.length < pageSize) break;
  }
  return out;
}

const top = (items: string[], n = 8): [string, number][] => {
  const m = new Map<string, number>();
  items.forEach((i) => m.set(i, (m.get(i) || 0) + 1));
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
};
const after = (k: string) => k.slice(k.indexOf("|") + 1);
const p75 = (a: number[]) => {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  return s[Math.min(s.length - 1, Math.floor(s.length * 0.75))];
};
const pageName = (p: string) =>
  p === "/" ? "Home"
  : p.startsWith("/projetos/") || p.startsWith("/project/") ? "Detalhe"
  : p === "/projetos" || p === "/work" ? "Projetos"
  : p === "/contato" || p === "/contact" ? "Contato"
  : p === "/sobre" || p === "/about" ? "Sobre" : p;

/** TODOS os números saem daqui (código puro). A IA só recebe o resultado pronto. */
function aggregate(ev: Ev[]) {
  const starts = ev.filter((e) => e.type === "session_start");
  const views = ev.filter((e) => e.type === "page_view");
  const clicks = ev.filter((e) => e.type === "click");
  const sessions = new Set(ev.map((e) => e.session_id));

  // Tempo ativo por página
  const timeBy = new Map<string, { sum: number; s: Set<string> }>();
  ev.filter((e) => e.type === "page_leave").forEach((e) => {
    const t = timeBy.get(e.path) ?? { sum: 0, s: new Set<string>() };
    t.sum += Number(e.value || 0);
    t.s.add(e.session_id);
    timeBy.set(e.path, t);
  });
  const avg_time_per_page = [...timeBy.entries()]
    .map(([path, t]) => ({ path, avg_seconds: Math.round(t.sum / t.s.size), visits: t.s.size }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 6);

  // Rolagem média
  const sc = new Map<string, number>();
  ev.filter((e) => e.type === "scroll_depth").forEach((e) => {
    const k = `${e.session_id}|${e.path}`;
    sc.set(k, Math.max(sc.get(k) || 0, Number(e.value || 0)));
  });
  const scBy = new Map<string, number[]>();
  sc.forEach((v, k) => scBy.set(after(k), [...(scBy.get(after(k)) || []), v]));
  const avg_scroll_per_page = [...scBy.entries()].map(([path, a]) => ({
    path,
    avg_percent: Math.round(a.reduce((x, y) => x + y, 0) / a.length),
  }));

  // Voltou na mesma página
  const pv = new Map<string, number>();
  views.forEach((e) => {
    const k = `${e.session_id}|${e.path}`;
    pv.set(k, (pv.get(k) || 0) + 1);
  });
  const rv = new Map<string, number>();
  pv.forEach((n, k) => { if (n >= 2) rv.set(after(k), (rv.get(after(k)) || 0) + 1); });
  const revisited_pages = [...rv.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Mapa de calor em grade 3x3
  const row = (y: number) => (y < 33 ? "topo" : y < 66 ? "meio" : "fim");
  const col = (x: number) => (x < 33 ? "esquerda" : x < 66 ? "centro" : "direita");
  const heatmap = top(
    clicks
      .filter((c) => typeof c.meta?.x === "number" && typeof c.meta?.y === "number")
      .map((c) => `${row(c.meta.y)}-${col(c.meta.x)}`),
    5
  );

  // Funil e rejeição
  const pagesBySession = new Map<string, Set<string>>();
  views.forEach((e) => {
    const s = pagesBySession.get(e.session_id) ?? new Set<string>();
    s.add(pageName(e.path));
    pagesBySession.set(e.session_id, s);
  });
  const funnel = ["Home", "Projetos", "Detalhe", "Contato"].map((step) => ({
    step,
    sessions: [...pagesBySession.values()].filter((s) => s.has(step)).length,
  }));
  const viewsPerSession = new Map<string, number>();
  views.forEach((e) => viewsPerSession.set(e.session_id, (viewsPerSession.get(e.session_id) || 0) + 1));
  const bounced = [...viewsPerSession.values()].filter((n) => n === 1).length;
  const bounce_rate_percent = viewsPerSession.size ? Math.round((bounced / viewsPerSession.size) * 100) : 0;

  // Web Vitals (percentil 75)
  const vit = (label: string) =>
    ev.filter((e) => e.type === "vital" && e.label === label).map((e) => Number(e.value || 0));
  const web_vitals = {
    lcp_ms_p75: Math.round(p75(vit("LCP"))),
    inp_ms_p75: Math.round(p75(vit("INP"))),
    cls_p75: Number((p75(vit("CLS")) / 1000).toFixed(3)),
  };

  // Funções monitoradas e requisições
  const fn = new Map<string, { calls: number; fails: number; ms: number }>();
  ev.filter((e) => e.type === "function").forEach((e) => {
    const k = e.label || "?";
    const f = fn.get(k) ?? { calls: 0, fails: 0, ms: 0 };
    f.calls++;
    if (e.meta?.ok === false) f.fails++;
    f.ms += Number(e.value || 0);
    fn.set(k, f);
  });
  const functions = [...fn.entries()].map(([name, f]) => ({
    name, calls: f.calls, fails: f.fails, avg_ms: Math.round(f.ms / f.calls),
  }));
  const slow_or_failed_requests = top(
    ev
      .filter((e) => e.type === "fetch")
      .map((e) => `${e.label} [${e.meta?.ok === false ? "falha " + (e.meta?.status ?? 0) : "lenta"}]`),
    5
  );

  const errors = ev.filter((e) => e.type === "error");
  const videos = ev.filter((e) => e.type === "video");

  return {
    sessions: sessions.size,
    new_visitors: starts.filter((e) => !e.meta?.returning).length,
    returning_visitors: starts.filter((e) => e.meta?.returning).length,
    bounce_rate_percent,
    devices: top(starts.map((e) => String(e.meta?.device || "?")), 3),
    browsers: top(starts.map((e) => e.browser || "?"), 4),
    systems: top(starts.map((e) => e.os || "?"), 4),
    cities: top(starts.map((e) => `${e.city || "?"}-${e.region || "?"}`)),
    referrers: top(starts.map((e) => String(e.meta?.utm_source || e.meta?.referrer || "direto")), 5),
    top_pages: top(views.map((e) => e.path)),
    top_clicks: top(clicks.map((c) => c.label || "?")),
    outbound_clicks: top(clicks.filter((c) => c.meta?.outbound).map((c) => c.label || "?"), 5),
    copies: top(ev.filter((e) => e.type === "copy").map((e) => e.label || "?"), 3),
    heatmap,
    rage_clicks: top(ev.filter((e) => e.type === "rage_click").map((e) => `${e.label} @ ${e.path}`), 5),
    funnel,
    avg_time_per_page,
    avg_scroll_per_page,
    revisited_pages,
    web_vitals,
    video_watch_avg_seconds: videos.length
      ? Math.round(videos.reduce((a, v) => a + Number(v.value || 0), 0) / videos.length)
      : 0,
    functions,
    slow_or_failed_requests,
    resource_errors: top(ev.filter((e) => e.type === "resource_error").map((e) => `${e.label} @ ${e.path}`), 5),
    errors_total: errors.length,
    top_errors: top(errors.map((e) => `${e.label} @ ${e.path}`), 5),
  };
}

type Agg = ReturnType<typeof aggregate>;
const fmt = (pairs: [string, number][]) => pairs.map(([k, n]) => `${k} (${n})`).join(", ") || "-";

function numbersBlock(a: Agg) {
  const failing = a.functions.filter((f) => f.fails > 0).map((f) => `${f.name}: ${f.fails}/${f.calls} falhas`);
  return [
    "📊 EspIAn — relatório das últimas 24h",
    `Visitas: ${a.sessions} (novas: ${a.new_visitors} | voltaram: ${a.returning_visitors}) | Rejeição: ${a.bounce_rate_percent}%`,
    `Funil: ${a.funnel.map((f) => `${f.step} ${f.sessions}`).join(" → ")}`,
    `Cidades: ${fmt(a.cities)}`,
    `Aparelhos: ${fmt(a.devices)} | Navegadores: ${fmt(a.browsers)} | Sistemas: ${fmt(a.systems)}`,
    `Origem: ${fmt(a.referrers)}`,
    `Páginas mais vistas: ${fmt(a.top_pages)}`,
    `Mais clicados: ${fmt(a.top_clicks)}`,
    `Mapa de calor: ${fmt(a.heatmap)}`,
    `Cliques de raiva: ${fmt(a.rage_clicks)}`,
    `Links externos: ${fmt(a.outbound_clicks)} | Cópias: ${fmt(a.copies)}`,
    `Tempo médio: ${a.avg_time_per_page.map((p) => `${p.path} ${p.avg_seconds}s`).join(", ") || "-"}`,
    `Rolagem média: ${a.avg_scroll_per_page.map((p) => `${p.path} ${p.avg_percent}%`).join(", ") || "-"}`,
    `Voltaram na mesma página: ${fmt(a.revisited_pages)}`,
    `Vídeo assistido (média): ${a.video_watch_avg_seconds}s`,
    `Web Vitals p75: LCP ${a.web_vitals.lcp_ms_p75}ms | INP ${a.web_vitals.inp_ms_p75}ms | CLS ${a.web_vitals.cls_p75}`,
    `Erros: ${a.errors_total}${a.errors_total ? " → " + fmt(a.top_errors) : ""}`,
    `Recursos que falharam: ${fmt(a.resource_errors)}`,
    `Requisições lentas/falhas: ${fmt(a.slow_or_failed_requests)}`,
    `Funções com falha: ${failing.join(", ") || "nenhuma"}`,
  ].join("\n");
}

async function aiAnalysis(a: Agg): Promise<string> {
  if (!GROQ_KEY) return "";
  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "Você é um analista de produto sênior. Recebe métricas JÁ CALCULADAS de um portfólio pessoal " +
              "(últimas 24h). Use SOMENTE os números do JSON; nunca invente nem recalcule. Se a amostra for pequena " +
              "(menos de 20 sessões), avise que é pouco dado para conclusões. Responda em português, sem markdown, " +
              "em no máximo 14 linhas, neste formato: 3 DESTAQUES, 2 PROBLEMAS (com a evidência numérica) e 3 AÇÕES " +
              "práticas e priorizadas.",
          },
          { role: "user", content: JSON.stringify(a) },
        ],
      }),
    });
    if (!r.ok) return "";
    const d = await r.json();
    const text = String(d?.choices?.[0]?.message?.content || "").trim();
    return text ? `🤖 Análise da IA\n${text}` : "";
  } catch {
    return "";
  }
}

async function telegram(text: string) {
  for (let i = 0; i < text.length; i += 3800) {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TG_CHAT, text: text.slice(i, i + 3800) }),
    }).catch(() => {});
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Só o cron da Vercel (ou você, com a senha) consegue disparar
  if (!CRON_SECRET || req.headers.authorization !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: "não autorizado" });
  }

  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const events = await fetchEvents(since);

    if (events.length === 0) {
      await telegram("📊 EspIAn — nenhuma visita nas últimas 24h.");
      return res.status(200).json({ ok: true, sessions: 0 });
    }

    const agg = aggregate(events);
    await telegram(numbersBlock(agg));
    const analysis = await aiAnalysis(agg);
    if (analysis) await telegram(analysis);

    return res.status(200).json({ ok: true, sessions: agg.sessions });
  } catch (err) {
    await telegram(`❌ EspIAn: o relatório falhou (${err instanceof Error ? err.message : "erro"})`);
    return res.status(500).json({ ok: false });
  }
}