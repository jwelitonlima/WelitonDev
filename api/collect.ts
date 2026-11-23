import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHmac, timingSafeEqual } from "crypto";

// O relatório espera alguns segundos para ter certeza de que a visita acabou.
export const config = { maxDuration: 30 };

const SB_URL = process.env.SUPABASE_URL ?? "";
const SB_KEY = process.env.SUPABASE_SERVICE_KEY ?? "";
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const TG_CHAT = process.env.TELEGRAM_CHAT_ID ?? "";
const TZ = "America/Fortaleza"; // Teresina (UTC-3)

// Segredo para assinar o cookie do aparelho e gerar o hash do IP.
// Recomendado: defina ESPIAN_SALT na Vercel (qualquer texto longo e aleatório).
const SECRET = process.env.ESPIAN_SALT || TG_TOKEN || SB_KEY || "espian";
const ADMIN_URL = process.env.ADMIN_URL ?? "https://weliton-dev.vercel.app/admin";

// Tempo de espera antes de gerar o relatório. Se o visitante voltar nesse intervalo
// (trocou de app, recarregou a página), o relatório é adiado.
const GRACE_MS = Number(process.env.REPORT_GRACE_MS ?? 20000);

// Alertas em tempo real. Coloque false nos dois para receber UMA mensagem por visita
// (o relatório final já contém tudo, inclusive as ações de interesse).
const LIVE = { newVisit: true, keyActions: true };

// Aparelhos marcados como "meu aparelho" no painel não geram mensagens no Telegram
// (as visitas continuam gravadas). Coloque NOTIFY_OWNER=1 na Vercel para receber também.
const NOTIFY_OWNER = process.env.NOTIFY_OWNER === "1";

const sbHeaders: Record<string, string> = SB_KEY.startsWith("sb_")
  ? { apikey: SB_KEY }
  : { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` };

const ID_RE = /^[\w-]{6,64}$/;
const TYPE_RE = /^[a-z_]{2,30}$/;
const HASH_RE = /^[a-z0-9]{6,32}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const BOT_RE = /bot|crawl|spider|slurp|lighthouse|headless|facebookexternalhit|vercel-screenshot/i;
const COOKIE = "espian_d";

const ALERT_TITLE: Record<string, string> = {
  outbound_click: "🔗 <b>Link externo acessado</b>",
  outbound_open: "🔗 <b>Nova janela aberta (link externo)</b>",
  window_open: "🪟 <b>Nova janela aberta</b>",
  contact_click: "📨 <b>Ação de contato</b>",
  download: "📥 <b>Download iniciado</b>",
  form_submit: "✉️ <b>Formulário enviado</b>",
  error: "🚨 <b>Erro na aplicação</b>",
  rage_click: "⚠️ <b>Cliques repetidos (possível frustração)</b>",
};
const ALWAYS_LIVE = new Set(["error", "rage_click"]);
const INTEREST_TYPES = new Set(["outbound_click", "outbound_open", "window_open", "contact_click", "download", "form_submit"]);
// Eventos que NÃO indicam que o visitante continua ativo
const PASSIVE_TYPES = "report_sent,tab_hidden,session_end,page_leave";

const BR_UF: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia", CE: "Ceará",
  DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso",
  MS: "Mato Grosso do Sul", MG: "Minas Gerais", PA: "Pará", PB: "Paraíba", PR: "Paraná",
  PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina",
  SP: "São Paulo", SE: "Sergipe", TO: "Tocantins",
};

function isAllowedHost(host: string): boolean {
  if (host === "weliton-dev.vercel.app" || host === "localhost") return true;
  return /^weliton-dev(-[a-z0-9-]+)?\.vercel\.app$/.test(host);
}

/* ───────────── Tipos ───────────── */

type Fp = {
  h: string; hw: string; model: string; plat: string; platv: string; gpu: string;
  scr: string; tz: string; lang: string; cores: number; mem: number; touch: number;
};
type Device = {
  id: string; num: number; alias: string | null; is_owner: boolean; visits: number;
  first_seen: string; last_seen: string; vids: string[]; ip_hashes: string[];
  fp_hash: string | null; hw_hash: string | null; model: string | null; os: string | null;
  browser: string | null; device_kind: string | null; screen: string | null;
};
type Sess = {
  sid: string; device_id: string | null; visit_no: number | null;
  match_confidence: string | null; match_reason: string | null;
  started_at: string; report_mid: number | null; devices: Device | null;
};
type Geo = { city: string | null; region: string | null; country: string | null };
type Ctx = { sess: Sess; created: boolean; similar: Device | null; prevSeen: string | null };

/* ───────────── Utilitários ───────────── */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const enc = encodeURIComponent;

const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

const fmtDur = (sec: number) => {
  const s = Math.max(0, Math.round(sec));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return s % 60 ? `${m}min ${s % 60}s` : `${m}min`;
  return `${Math.floor(m / 60)}h ${m % 60}min`;
};
const fmtMs = (ms: number) => {
  const s = (Number(ms) || 0) / 1000;
  return s < 10 ? `${s.toFixed(1).replace(".", ",")}s` : fmtDur(s);
};

const dtf = (o: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, hourCycle: "h23", ...o } as any);
const fmtClock = (t: number) => dtf({ hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(t));
const fmtHM = (t: number) => dtf({ hour: "2-digit", minute: "2-digit" }).format(new Date(t));
const fmtDay = (t: number) => dtf({ day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(t));
const fmtShort = (t: number) => dtf({ day: "2-digit", month: "2-digit" }).format(new Date(t));

const rel = (iso: string | null | undefined) => {
  const t = Date.parse(String(iso ?? ""));
  if (!Number.isFinite(t)) return "";
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 90) return "há instantes";
  if (s < 3600) return `há ${Math.round(s / 60)}min`;
  if (s < 86400) return `há ${Math.round(s / 3600)}h`;
  const d = Math.round(s / 86400);
  return d === 1 ? "ontem" : `há ${d} dias`;
};

const place = (g: Partial<Geo>) => {
  const loc = [g.city, g.region].filter(Boolean).join(" — ");
  return [loc, g.country].filter(Boolean).join(" · ") || "Local não identificado";
};

function parseUA(ua: string) {
  const browser = /Edg\//.test(ua) ? "Edge"
    : /OPR\/|Opera/.test(ua) ? "Opera"
    : /SamsungBrowser/.test(ua) ? "Samsung Internet"
    : /Firefox\/|FxiOS/.test(ua) ? "Firefox"
    : /CriOS|Chrome\//.test(ua) ? "Chrome"
    : /Safari\//.test(ua) ? "Safari" : "Outro";
  const os = /Windows/.test(ua) ? "Windows"
    : /Android/.test(ua) ? "Android"
    : /iPhone|iPad|iPod/.test(ua) ? "iOS"
    : /Mac OS X|Macintosh/.test(ua) ? "macOS"
    : /Linux/.test(ua) ? "Linux" : "Outro";
  return { browser, os };
}

function cleanMeta(m: any, ts: number) {
  const out: Record<string, string | number | boolean> = {};
  if (m && typeof m === "object") {
    for (const [k, v] of Object.entries(m).slice(0, 20)) {
      const key = k.slice(0, 30);
      if (typeof v === "string") out[key] = v.slice(0, 200);
      else if (typeof v === "number" && Number.isFinite(v)) out[key] = v;
      else if (typeof v === "boolean") out[key] = v;
    }
  }
  out.ts = ts;
  return out;
}

/* ───────────── Identidade do aparelho ───────────── */

const hmac = (s: string) => createHmac("sha256", SECRET).update(s).digest("hex");

// IP nunca é guardado: só um hash com segredo (IPv6 reduzido ao prefixo /64)
function ipHashOf(ip: string): string | null {
  const first = ip.split(",")[0].trim();
  if (!first) return null;
  const norm = first.includes(":") ? first.split(":").slice(0, 4).join(":") : first;
  return hmac("ip|" + norm).slice(0, 16);
}

const signId = (id: string) => `${id}.${hmac("dev|" + id).slice(0, 16)}`;

function verifyCookie(raw: string | undefined): string | null {
  if (!raw) return null;
  const m = raw.split(";").map((s) => s.trim()).find((s) => s.startsWith(COOKIE + "="));
  if (!m) return null;
  const val = decodeURIComponent(m.slice(COOKIE.length + 1));
  const dot = val.lastIndexOf(".");
  if (dot < 0) return null;
  const id = val.slice(0, dot);
  const sig = val.slice(dot + 1);
  if (!UUID_RE.test(id)) return null;
  const want = hmac("dev|" + id).slice(0, 16);
  if (sig.length !== want.length) return null;
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(want)) ? id : null;
  } catch {
    return null;
  }
}

function sanitizeFp(raw: any): Fp | null {
  if (!raw || typeof raw !== "object") return null;
  const s = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : "");
  const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.min(v, 1024)) : 0);
  const h = s(raw.h, 32);
  const hw = s(raw.hw, 32);
  if (!HASH_RE.test(h) || !HASH_RE.test(hw)) return null;
  return {
    h, hw, model: s(raw.model, 60), plat: s(raw.plat, 30), platv: s(raw.platv, 20), gpu: s(raw.gpu, 120),
    scr: s(raw.scr, 30), tz: s(raw.tz, 60), lang: s(raw.lang, 20), cores: n(raw.cores), mem: n(raw.mem), touch: n(raw.touch),
  };
}

function friendlyModel(model: string) {
  if (/^SM-/i.test(model)) return `Samsung ${model}`;
  if (/^Pixel/i.test(model)) return `Google ${model}`;
  return model;
}

// Rótulos legíveis do aparelho a partir do UA + impressão digital
function describeDevice(ua: string, fp: Fp | null, startKind?: string) {
  const { browser, os: osRaw } = parseUA(ua);
  const ipad = osRaw === "macOS" && (fp?.touch ?? 0) > 1; // iPadOS finge ser Mac
  let os = ipad ? "iPadOS" : osRaw;
  const major = (v: string) => parseInt(v.split(".")[0], 10);
  if (os === "Android" && fp?.platv) os = `Android ${major(fp.platv)}`;
  else if (os === "Android") { const m = /Android (\d+)/.exec(ua); if (m) os = `Android ${m[1]}`; }
  else if (os === "iOS") { const m = /OS (\d+)[_.]/.exec(ua); if (m) os = `iOS ${m[1]}`; }
  else if (os === "Windows" && fp?.platv) os = major(fp.platv) >= 13 ? "Windows 11" : "Windows 10";

  const mobileUA = /Mobile|Android|iPhone|iPod/.test(ua);
  const kind = startKind === "mobile" || startKind === "desktop" ? startKind : mobileUA || ipad ? "mobile" : "desktop";
  const label = fp?.model ? friendlyModel(fp.model)
    : ipad || /iPad/.test(ua) ? "iPad"
    : /iPhone/.test(ua) ? "iPhone"
    : /Android/.test(ua) ? "Android"
    : /Windows/.test(ua) ? "PC"
    : /Macintosh/.test(ua) ? "Mac"
    : /Linux/.test(ua) ? "PC" : "Aparelho";
  return { label, os, browser, kind, screen: fp?.scr ?? null };
}

const mergeCap = (arr: string[] | null | undefined, v: string | null | undefined, cap = 12) => {
  const a = Array.isArray(arr) ? arr : [];
  if (!v || a.includes(v)) return a;
  return [...a, v].slice(-cap);
};

/* ───────────── Banco ───────────── */

async function sbReq(method: string, path: string, opts: { body?: unknown; prefer?: string } = {}) {
  try {
    const headers: Record<string, string> = { ...sbHeaders };
    if (opts.body !== undefined) headers["Content-Type"] = "application/json";
    if (opts.prefer) headers.Prefer = opts.prefer;
    const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
      method,
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
    const text = await r.text();
    let data: any = null;
    if (text) { try { data = JSON.parse(text); } catch { data = text; } }
    if (!r.ok) console.error(`❌ Supabase ${method} ${path.split("?")[0]}:`, r.status, text.slice(0, 300));
    return { ok: r.ok, status: r.status, data, range: r.headers.get("content-range") };
  } catch (err) {
    console.error(`❌ Supabase ${method} ${path.split("?")[0]} erro:`, err);
    return { ok: false, status: 0, data: null as any, range: null as string | null };
  }
}

async function sbGet(path: string): Promise<any[] | null> {
  const r = await sbReq("GET", path);
  return r.ok && Array.isArray(r.data) ? r.data : null;
}

const findDevice = async (query: string): Promise<Device | null> =>
  (await sbGet(`devices?${query}&select=*&order=last_seen.desc&limit=1`))?.[0] ?? null;

async function loadCtx(sid: string): Promise<Sess | null> {
  const rows = await sbGet(`sessions?sid=eq.${enc(sid)}&select=*,devices(*)&limit=1`);
  return (rows?.[0] as Sess) ?? null;
}

/* ───────────── Reconhecimento do aparelho ───────────── */

type Match = { dev: Device | null; conf: "alta" | "média" | "nova"; reason: string; similar: Device | null };

async function matchDevice(i: { cookieId: string | null; vid: string; fp: Fp | null; ip: string | null }): Promise<Match> {
  let dev: Device | null = null;

  if (i.cookieId) {
    dev = await findDevice(`id=eq.${enc(i.cookieId)}`);
    if (dev) return { dev, conf: "alta", reason: "cookie do servidor", similar: null };
  }
  dev = await findDevice(`vids=cs.${enc("{" + i.vid + "}")}`);
  if (dev) return { dev, conf: "alta", reason: "ID do navegador", similar: null };

  if (i.fp) {
    const rows = await sbGet(`devices?fp_hash=eq.${enc(i.fp.h)}&select=*&order=last_seen.desc&limit=5`);
    if (rows?.length) {
      const sameNet = i.ip ? rows.find((d: Device) => d.ip_hashes?.includes(i.ip!)) : null;
      if (sameNet) return { dev: sameNet, conf: "alta", reason: "assinatura do aparelho + mesma rede", similar: null };
      return { dev: rows[0], conf: "média", reason: "assinatura do aparelho, rede diferente", similar: null };
    }
    if (i.ip) {
      dev = await findDevice(`hw_hash=eq.${enc(i.fp.hw)}&ip_hashes=cs.${enc("{" + i.ip + "}")}`);
      if (dev) return { dev, conf: "média", reason: "mesmo hardware + mesma rede", similar: null };
    }
    const similar = await findDevice(`hw_hash=eq.${enc(i.fp.hw)}`);
    return { dev: null, conf: "nova", reason: "aparelho novo", similar };
  }
  return { dev: null, conf: "nova", reason: "aparelho novo", similar: null };
}

type SessionInput = {
  sid: string; vid: string; fp: Fp | null; ip: string | null; cookieId: string | null;
  ua: string; geo: Geo; startedAt: number; startRow: any | null;
};

// Cria a sessão (uma única vez por visita) e vincula ao aparelho.
async function ensureSession(i: SessionInput): Promise<Ctx | null> {
  const existing = await loadCtx(i.sid);
  if (existing) {
    // Se o aparelho ainda não tinha assinatura (primeiro envio saiu antes dela), completa agora.
    const d = existing.devices;
    if (d && i.fp && !d.fp_hash) {
      await sbReq("PATCH", `devices?id=eq.${enc(d.id)}`, {
        body: { fp_hash: i.fp.h, hw_hash: i.fp.hw, gpu: i.fp.gpu, tz: i.fp.tz, lang: i.fp.lang, screen: i.fp.scr },
      });
    }
    return { sess: existing, created: false, similar: null, prevSeen: null };
  }

  const sm = i.startRow?.meta ?? {};
  const info = describeDevice(i.ua, i.fp, sm.device);

  // Quem conseguir inserir a linha da sessão é o responsável por resolver o aparelho.
  const ins = await sbReq("POST", "sessions?on_conflict=sid", {
    prefer: "resolution=ignore-duplicates,return=representation",
    body: [{
      sid: i.sid, visitor_id: i.vid, started_at: new Date(i.startedAt).toISOString(),
      city: i.geo.city, region: i.geo.region, country: i.geo.country,
      browser: info.browser, os: info.os, device_kind: info.kind,
      referrer: sm.ref ? String(sm.ref) : null, utm: sm.utm ? String(sm.utm) : null,
      is_returning: typeof sm.returning === "boolean" ? sm.returning : null,
    }],
  });
  if (!ins.ok) return null;
  if (!Array.isArray(ins.data) || !ins.data.length) {
    const again = await loadCtx(i.sid); // outra requisição criou primeiro
    return again ? { sess: again, created: false, similar: null, prevSeen: null } : null;
  }

  const m = await matchDevice({ cookieId: i.cookieId, vid: i.vid, fp: i.fp, ip: i.ip });
  const nowIso = new Date().toISOString();
  const fields = {
    model: info.label, os: info.os, browser: info.browser, device_kind: info.kind, screen: info.screen,
    gpu: i.fp?.gpu || null, tz: i.fp?.tz || null, lang: i.fp?.lang || null,
    last_city: i.geo.city, last_region: i.geo.region, last_country: i.geo.country,
  };

  let dev: Device | null = null;
  let prevSeen: string | null = null;
  if (m.dev) {
    prevSeen = m.dev.last_seen;
    const upd = await sbReq("PATCH", `devices?id=eq.${enc(m.dev.id)}`, {
      prefer: "return=representation",
      body: {
        ...fields, last_seen: nowIso,
        vids: mergeCap(m.dev.vids, i.vid), ip_hashes: mergeCap(m.dev.ip_hashes, i.ip),
        fp_hash: i.fp?.h ?? m.dev.fp_hash, hw_hash: i.fp?.hw ?? m.dev.hw_hash,
      },
    });
    dev = Array.isArray(upd.data) && upd.data[0] ? (upd.data[0] as Device) : m.dev;
  } else {
    const created = await sbReq("POST", "devices", {
      prefer: "return=representation",
      body: [{
        ...fields, first_seen: nowIso, last_seen: nowIso, visits: 0,
        vids: [i.vid], ip_hashes: i.ip ? [i.ip] : [], fp_hash: i.fp?.h ?? null, hw_hash: i.fp?.hw ?? null,
      }],
    });
    dev = Array.isArray(created.data) && created.data[0] ? (created.data[0] as Device) : null;
  }

  let visitNo: number | null = null;
  if (dev) {
    await sbReq("PATCH", `sessions?sid=eq.${enc(i.sid)}`, {
      body: { device_id: dev.id, match_confidence: m.conf, match_reason: m.reason },
    });
    const cnt = await sbReq("GET", `sessions?device_id=eq.${enc(dev.id)}&select=sid&limit=1`, { prefer: "count=exact" });
    const total = Number(cnt.range?.split("/")[1]);
    visitNo = Number.isFinite(total) && total > 0 ? total : (dev.visits || 0) + 1;
    await sbReq("PATCH", `devices?id=eq.${enc(dev.id)}`, { body: { visits: visitNo } });
    await sbReq("PATCH", `sessions?sid=eq.${enc(i.sid)}`, { body: { visit_no: visitNo } });
    dev = { ...dev, visits: visitNo };
  }

  const sess: Sess = {
    sid: i.sid, device_id: dev?.id ?? null, visit_no: visitNo, match_confidence: m.conf, match_reason: m.reason,
    started_at: new Date(i.startedAt).toISOString(), report_mid: null, devices: dev,
  };
  return { sess, created: true, similar: m.similar, prevSeen };
}

/* ───────────── Telegram ───────────── */

async function tgCall(method: string, payload: Record<string, unknown>) {
  const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TG_CHAT, disable_web_page_preview: true, ...payload }),
  });
  const json: any = await res.json().catch(() => null);
  return { ok: res.ok, json };
}

const toPlain = (t: string) =>
  t.replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

// Envia e devolve o id da mensagem (ou null se falhar)
async function telegram(text: string): Promise<number | null> {
  if (!TG_TOKEN || !TG_CHAT) {
    console.error("❌ Variáveis do Telegram ausentes!");
    return null;
  }
  try {
    let r = await tgCall("sendMessage", { text, parse_mode: "HTML" });
    if (!r.ok) {
      console.error("❌ Telegram recusou:", JSON.stringify(r.json));
      r = await tgCall("sendMessage", { text: toPlain(text).slice(0, 4000) }); // nunca perde o alerta
      if (!r.ok) {
        console.error("❌ Telegram (fallback) recusou:", JSON.stringify(r.json));
        return null;
      }
    } else {
      console.log("✅ Telegram enviado!");
    }
    return r.json?.result?.message_id ?? null;
  } catch (err) {
    console.error("❌ Erro Telegram:", err);
    return null;
  }
}

async function telegramEdit(mid: number, text: string): Promise<boolean> {
  try {
    const r = await tgCall("editMessageText", { message_id: mid, text, parse_mode: "HTML" });
    if (r.ok) return true;
    const desc = String(r.json?.description ?? "");
    if (desc.includes("message is not modified")) return true;
    console.error("❌ Telegram edit recusou:", desc);
    return false;
  } catch (err) {
    console.error("❌ Telegram edit erro:", err);
    return false;
  }
}

/* ───────────── Textos do Telegram ───────────── */

const kindIcon = (d: Device | null, fallback?: string | null) => ((d?.device_kind ?? fallback) === "mobile" ? "📱" : "💻");
const tagOf = (d: Device | null) => (d ? `#A${d.num}` : "");
const ordinal = (n: number | null | undefined) => (n ? `${n}ª visita` : "visita");
const confIcon = (c: string | null) => (c === "alta" ? "✅" : c === "média" ? "⚠️" : c === "nova" ? "🆕" : "❔");
const sidShort = (sid: string) => sid.slice(0, 8);

function deviceTitle(d: Device) {
  return `${kindIcon(d)} <b>Aparelho #${d.num}</b>${d.alias ? ` · “${esc(cut(d.alias, 40))}”` : ""}`;
}
const deviceSpecs = (d: Device) =>
  [d.model, d.os, d.browser, d.screen].filter(Boolean).map((v) => esc(v)).join(" · ");

function visitAlert(m: any, g: Geo & { browser: string; os: string }, c: Ctx) {
  const d = c.sess.devices;
  const sid = c.sess.sid;
  const origem = m.ref ? String(m.ref) : "Direto";
  const utm = m.utm ? ` (utm: ${m.utm})` : "";
  const isNew = c.sess.match_confidence === "nova" || (d?.visits ?? 1) <= 1;
  const lines: string[] = [`🌐 <b>NOVO ACESSO</b> — ${isNew ? "🆕 <b>aparelho novo</b>" : "🔁 <b>recorrente</b>"}`, ""];
  if (d) {
    lines.push(deviceTitle(d), `     ${deviceSpecs(d)}`);
  } else {
    lines.push(`${m.device === "mobile" ? "📱" : "💻"} ${esc(g.browser)} / ${esc(g.os)}`);
  }
  lines.push(`📍 ${esc(place(g))}`);
  if (d && !isNew) {
    const prev = c.prevSeen ? ` · última ${rel(c.prevSeen)}` : "";
    lines.push(`🔁 <b>${ordinal(d.visits)}</b> · 1ª em ${fmtShort(Date.parse(d.first_seen))}${prev}`);
  }
  if (d) {
    const why = c.sess.match_reason ?? "";
    lines.push(`${confIcon(c.sess.match_confidence)} ${isNew ? "Primeiro registro deste aparelho" : `Reconhecido por ${esc(why)} · confiança ${c.sess.match_confidence}`}`);
    if (isNew && c.similar) {
      lines.push(`❔ Parecido com o aparelho #${c.similar.num}${c.similar.alias ? ` “${esc(c.similar.alias)}”` : ""} (mesmo hardware)`);
    }
  }
  lines.push(`🔗 Origem: ${esc(origem + utm)}`, "", `<i>${esc(tagOf(d))} · sessão ${esc(sidShort(sid))}</i>`);
  return lines.join("\n");
}

function keyAlert(r: any, g: Geo, c: Ctx | null, sid: string) {
  const m = r.meta || {};
  const d = c?.sess.devices ?? null;
  const lines = [ALERT_TITLE[r.type] ?? "🔔 <b>Evento</b>", ""];
  if (d) lines.push(`${kindIcon(d)} Aparelho #${d.num}${d.alias ? ` · “${esc(cut(d.alias, 30))}”` : ""} · ${ordinal(c?.sess.visit_no ?? d.visits)}`);
  if (r.path) lines.push(`📄 Página: ${esc(r.path)}`);
  if (r.label) {
    const ctx = m.ctx && m.ctx !== r.label ? ` (${cut(String(m.ctx), 40)})` : "";
    lines.push(`🎯 ${r.type === "error" ? "Detalhe" : "Elemento"}: ${esc(cut(String(r.label), 60) + ctx)}`);
  }
  if (m.kind) lines.push(`📌 Tipo: ${esc(m.kind)}`);
  if (m.href) lines.push(`🌐 Destino: ${esc(m.href)}`);
  lines.push(`📍 ${esc(place(g))}`, "", `<i>${esc(tagOf(d))} · sessão ${esc(sidShort(sid))}</i>`);
  return lines.join("\n");
}

/* ───────────── Relatório ───────────── */

// Houve atividade depois do session_end? (o visitante voltou ou recarregou a página)
async function hasActivityAfter(sid: string, endTs: number): Promise<boolean> {
  const rows = await sbGet(
    `events?session_id=eq.${enc(sid)}&type=not.in.(${PASSIVE_TYPES})` +
      `&${enc("meta->>ts")}=gt.${Math.round(endTs)}&select=id&limit=1`
  );
  return !!rows && rows.length > 0;
}

async function getSessionEvents(sid: string): Promise<any[]> {
  const rows = await sbGet(
    `events?session_id=eq.${enc(sid)}` +
      `&select=type,path,label,value,meta,created_at,city,region,country,browser,os&order=id.asc&limit=1000`
  );
  return rows ?? [];
}

function describe(e: any): string | null {
  const m = e.meta || {};
  const lab = e.label ? `"${cut(String(e.label), 50)}"` : "";
  const ctx = m.ctx && m.ctx !== e.label ? ` (${cut(String(m.ctx), 40)})` : "";
  switch (e.type) {
    case "session_start": return "Sessão iniciada";
    case "page_view": return `Abriu a página ${e.path}`;
    case "click": return `Clicou em ${lab}${ctx}`;
    case "hover": return `Passou o mouse em ${lab}${ctx} por ${fmtMs(e.value)}`;
    case "scroll_depth": return `Rolou até ${e.value}% de ${e.path}`;
    case "modal_open": return `Abriu o painel ${lab}`;
    case "outbound_click": return `Abriu link externo ${lab}${ctx} → ${m.href ?? ""}`;
    case "outbound_open": return `Abriu nova janela${e.label ? " " + lab : ""}${ctx} → ${m.href ?? ""}`;
    case "window_open": return `Abriu nova janela${e.label ? " " + lab : ""}${ctx} → ${m.href ?? ""}`;
    case "contact_click": return `Acionou contato ${lab} [${m.kind ?? "contato"}]`;
    case "download": return `Baixou arquivo ${m.href ?? lab}`;
    case "form_focus": return `Iniciou o preenchimento do campo ${lab}`;
    case "form_submit": return `Enviou o formulário ${lab}`;
    case "copy": return `Copiou texto (${e.label})`;
    case "tab_hidden": return "Deixou a aba (outra janela ou segundo plano)";
    case "tab_visible": return `Retornou à aba após ${fmtDur(Number(e.value) || 0)}`;
    case "rage_click": return `Cliques repetidos em ${lab}`;
    case "error": return `Erro registrado: ${e.label ?? ""}`;
    case "session_resume": return "Sessão retomada";
    case "session_end": return "Sessão encerrada";
    default: return null; // page_leave, vital...
  }
}

type Stats = {
  started_at: string; ended_at: string; duration_s: number; active_s: number; pages: number;
  clicks: number; max_scroll: number; actions: number;
  summary: { pages: { p: string; views: number; time: number; scroll: number }[]; interest: { k: string; hover: number; clicks: number }[]; eng: string };
};

function buildReport(raw: any[], c: Ctx | null, prev: string | null): { head: string; timeline: string[]; stats: Stats } | null {
  if (!raw.length) return null;

  const evs = raw
    .map((e) => ({ ...e, meta: e.meta || {}, t: Number(e.meta?.ts) || Date.parse(e.created_at) || 0 }))
    .sort((a, b) => a.t - b.t);

  const start = evs.find((e) => e.type === "session_start");
  const sm = start?.meta ?? {};
  const g = evs.find((e) => e.city || e.country) ?? evs[0];
  const first = evs[0].t;
  const last = evs[evs.length - 1].t;
  const dev = c?.sess.devices ?? null;

  // Páginas
  const pages = new Map<string, { views: number; time: number; scroll: number }>();
  const pg = (p: string) => {
    let x = pages.get(p);
    if (!x) { x = { views: 0, time: 0, scroll: 0 }; pages.set(p, x); }
    return x;
  };
  for (const e of evs) {
    if (!e.path) continue;
    if (e.type === "page_view") pg(e.path).views++;
    else if (e.type === "page_leave") {
      const p = pg(e.path);
      p.time += Number(e.value) || 0;
      p.scroll = Math.max(p.scroll, Number(e.meta.scroll) || 0);
    } else if (e.type === "scroll_depth") {
      const p = pg(e.path);
      p.scroll = Math.max(p.scroll, Number(e.value) || 0);
    }
  }
  let active = 0;
  let maxScroll = 0;
  pages.forEach((p) => { active += p.time; maxScroll = Math.max(maxScroll, p.scroll); });

  const clicks = evs.filter((e) => e.type === "click").length;
  const hovers = evs.filter((e) => e.type === "hover").length;
  const keyEvs = evs.filter((e) => INTEREST_TYPES.has(e.type));

  // Pontos de interesse
  const interest = new Map<string, { hover: number; clicks: number }>();
  for (const e of evs) {
    if ((e.type !== "hover" && e.type !== "click") || !e.label) continue;
    const ctx = e.meta.ctx && e.meta.ctx !== e.label ? `${cut(String(e.meta.ctx), 30)} › ` : "";
    const k = ctx + cut(String(e.label), 45);
    const x = interest.get(k) ?? { hover: 0, clicks: 0 };
    if (e.type === "hover") x.hover += Number(e.value) || 0;
    else x.clicks++;
    interest.set(k, x);
  }
  const top = Array.from(interest.entries())
    .sort((a, b) => b[1].hover + b[1].clicks * 2000 - (a[1].hover + a[1].clicks * 2000))
    .slice(0, 4);

  const engHigh = keyEvs.length > 0 || active >= 120;
  const engMid = active >= 30 || pages.size >= 3;
  const eng = engHigh ? "🔥 Interesse alto" : engMid ? "🙂 Interesse médio" : "💤 Interesse baixo";

  const pad = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s.padEnd(n));
  const rows = Array.from(pages.entries()).slice(0, 12).map(([p, x]) =>
    `${pad(p + (x.views > 1 ? ` ×${x.views}` : ""), 20)}${fmtDur(x.time).padStart(8)}  ${x.scroll ? x.scroll + "%" : "—"}`
  );
  const table = ["Página".padEnd(20) + "Tempo".padStart(8) + "  Rolagem", ...rows].map(esc).join("\n");

  const returning = dev ? (dev.visits ?? 1) > 1 : !!sm.returning;
  const visitNo = c?.sess.visit_no ?? dev?.visits ?? null;
  const head: string[] = [
    `📊 <b>RELATÓRIO DE VISITA</b>${dev ? `  ${esc(tagOf(dev))}` : ""}`,
    `${returning ? `🔁 Recorrente${visitNo ? ` · ${ordinal(visitNo)}` : ""}` : "🆕 Primeira visita"} · ${eng}`,
    `<i>${fmtDay(first)} · ${fmtHM(first)} → ${fmtHM(last)}</i>`,
    "",
  ];

  head.push("<b>APARELHO</b>");
  if (dev) {
    head.push(deviceTitle(dev), `⚙️ ${deviceSpecs(dev) || "—"}`);
    const hist = [`1ª visita ${fmtShort(Date.parse(dev.first_seen))}`];
    if (prev) hist.push(`anterior ${rel(prev)}`);
    head.push(`🕓 ${hist.join(" · ")}`);
    if (c?.sess.match_confidence) {
      head.push(`${confIcon(c.sess.match_confidence)} ${c.sess.match_confidence === "nova" ? "Aparelho novo" : `Reconhecido por ${esc(c.sess.match_reason)} · confiança ${esc(c.sess.match_confidence)}`}`);
    }
  } else {
    head.push(`${sm.device === "mobile" ? "📱 Celular" : "💻 Computador"} · ${esc(g.browser ?? "—")} / ${esc(g.os ?? "—")}${sm.screen ? " · " + esc(sm.screen) : ""}`);
  }
  head.push(`📍 ${esc(place(g))}`, `🔗 Origem: ${esc(sm.ref || "Direto")}${sm.utm ? esc(` (utm: ${sm.utm})`) : ""}`, "");

  head.push(
    "<b>RESUMO</b>",
    `⏱ Duração da sessão: ${fmtDur((last - first) / 1000)}`,
    `👁 Tempo ativo nas páginas: ${fmtDur(active)}`,
    `📄 Páginas distintas: ${pages.size}`,
    `🖱 Cliques: ${clicks} · Foco do mouse: ${hovers}`,
    `📜 Rolagem máxima: ${maxScroll ? maxScroll + "%" : "—"}`,
    `🎯 Ações de interesse: ${keyEvs.length}`,
    "",
    "<b>NAVEGAÇÃO</b>",
    `<pre>${table}</pre>`,
  );

  if (keyEvs.length) {
    head.push("", "<b>AÇÕES DE INTERESSE</b>");
    for (const e of keyEvs.slice(0, 8)) head.push(`• ${fmtClock(e.t)} — ${esc(cut(describe(e) ?? "", 110))}`);
  }
  if (top.length) {
    head.push("", "<b>MAIORES INTERESSES</b>");
    for (const [k, x] of top) {
      const parts: string[] = [];
      if (x.hover) parts.push(`${fmtMs(x.hover)} de foco`);
      if (x.clicks) parts.push(`${x.clicks} clique${x.clicks > 1 ? "s" : ""}`);
      head.push(`• ${esc(k)} — ${parts.join(" · ")}`);
    }
  }
  if (c) head.push("", `🔎 <a href="${esc(ADMIN_URL)}?sid=${esc(c.sess.sid)}">Abrir no painel</a>`);

  // Linha do tempo (linhas já escapadas). Rolagens seguidas viram uma única linha.
  const timeline: string[] = [];
  let prevD = "";
  let prevT = 0;
  let scroll: { idx: number; path: string } | null = null;
  for (const e of evs) {
    const d0 = describe(e);
    if (!d0) continue;
    const d = (e.meta.tab ? `[${e.meta.tab}] ` : "") + d0;
    if (e.type === "scroll_depth") {
      if (scroll && scroll.path === e.path && scroll.idx === timeline.length - 1) {
        timeline[scroll.idx] = `${timeline[scroll.idx].slice(0, 8)}  ${esc(d)}`;
        continue;
      }
      scroll = { idx: timeline.length, path: e.path };
    }
    if (d === prevD && e.t - prevT < 2000) continue;
    prevD = d;
    prevT = e.t;
    timeline.push(`${fmtClock(e.t)}  ${esc(d)}`);
  }

  const stats: Stats = {
    started_at: new Date(first).toISOString(),
    ended_at: new Date(last).toISOString(),
    duration_s: Math.round((last - first) / 1000),
    active_s: Math.round(active),
    pages: pages.size,
    clicks,
    max_scroll: maxScroll,
    actions: keyEvs.length,
    summary: {
      pages: Array.from(pages.entries()).slice(0, 30).map(([p, x]) => ({ p, ...x })),
      interest: top.map(([k, x]) => ({ k, hover: x.hover, clicks: x.clicks })),
      eng,
    },
  };
  return { head: head.join("\n"), timeline, stats };
}

// Cabe no limite de 4096 caracteres do Telegram: se a linha do tempo for muito longa,
// mantém o começo e o fim e informa quantos eventos foram omitidos.
function fitLines(lines: string[], budget: number): string {
  const total = lines.reduce((n, l) => n + l.length + 1, 0);
  if (total <= budget) return lines.join("\n");
  const half = Math.floor((budget - 60) / 2);
  const front: string[] = [];
  let a = 0;
  let i = 0;
  while (i < lines.length && a + lines[i].length + 1 <= half) { front.push(lines[i]); a += lines[i].length + 1; i++; }
  const back: string[] = [];
  let b = 0;
  let j = lines.length - 1;
  while (j >= i && b + lines[j].length + 1 <= half) { back.unshift(lines[j]); b += lines[j].length + 1; j--; }
  return [...front, `… ${j - i + 1} eventos omitidos …`, ...back].join("\n");
}

function composeMessage(r: { head: string; timeline: string[] }) {
  const title = "🕒 <b>LINHA DO TEMPO</b>";
  const budget = Math.max(300, 4000 - r.head.length - title.length - 40);
  return `${r.head}\n\n${title}\n<pre>${fitLines(r.timeline, budget)}</pre>`;
}

// UMA mensagem por visita: se o visitante voltar e sair de novo, a mesma mensagem é atualizada.
// Os números da sessão também vão para a tabela `sessions` (o painel lê dali).
async function sendReport(sid: string) {
  const c = await loadCtx(sid);
  const events = await getSessionEvents(sid);

  // Visita anterior do mesmo aparelho (para "anterior há …")
  let prev: string | null = null;
  if (c?.device_id) {
    const p = await sbGet(`sessions?device_id=eq.${enc(c.device_id)}&sid=neq.${enc(sid)}&select=started_at&order=started_at.desc&limit=1`);
    prev = p?.[0]?.started_at ?? null;
  }

  const full = buildReport(events, c ? { sess: c, created: false, similar: null, prevSeen: null } : null, prev);
  if (!full) {
    console.warn("⚠️ Resumo vazio para", sid);
    return;
  }

  const silent = !!c?.devices?.is_owner && !NOTIFY_OWNER;
  let mid = c?.report_mid ?? null;
  if (!silent) {
    const text = composeMessage(full);
    if (mid && (await telegramEdit(mid, text))) console.log("✏️ Relatório atualizado");
    else mid = await telegram(text);
  } else {
    console.log("🔕 Aparelho marcado como seu: relatório não enviado ao Telegram");
  }

  await sbReq("PATCH", `sessions?sid=eq.${enc(sid)}`, {
    body: { ...full.stats, report_mid: mid ?? c?.report_mid ?? null },
  });
}

/* ───────────── Handler ───────────── */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const origin = (req.headers.origin as string) || (req.headers.referer as string) || "";
    let host = "";
    try { host = new URL(origin).hostname; } catch {}
    if (!isAllowedHost(host)) {
      console.warn("⛔ 403 host não permitido:", host || "(vazio)");
      return res.status(403).end();
    }

    const ua = String(req.headers["user-agent"] ?? "");
    if (BOT_RE.test(ua)) return res.status(204).end();

    let body: any;
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    } catch {
      return res.status(400).end();
    }
    if (!body || !Array.isArray(body.events) || !body.events.length) return res.status(400).end();

    const sid = String(body.sid ?? "");
    const vid = String(body.vid ?? "");
    if (!ID_RE.test(sid) || !ID_RE.test(vid)) {
      console.warn("⛔ 400 sid/vid inválido:", sid, vid);
      return res.status(400).end();
    }

    // Geolocalização (headers da Vercel), dispositivo e identidade
    const hdr = (k: string): string | null => {
      const v = req.headers[k];
      const s = Array.isArray(v) ? v[0] : v;
      if (!s) return null;
      try { return decodeURIComponent(s); } catch { return s; }
    };
    const country = hdr("x-vercel-ip-country");
    const regionCode = hdr("x-vercel-ip-country-region");
    const city = hdr("x-vercel-ip-city");
    const region = country === "BR" && regionCode ? (BR_UF[regionCode] ?? regionCode) : regionCode;
    const { browser, os } = parseUA(ua);
    const geo: Geo = { city, region, country };
    const geoFull = { ...geo, browser, os };

    const fp = sanitizeFp(body.fp);
    const ip = ipHashOf(String(hdr("x-forwarded-for") ?? hdr("x-real-ip") ?? ""));
    const cookieHdr = Array.isArray(req.headers.cookie) ? req.headers.cookie.join("; ") : req.headers.cookie;
    const cookieId = verifyCookie(cookieHdr);

    // Normaliza linhas (todas com as mesmas chaves → evita PGRST102)
    const rows = body.events
      .filter((e: any) => e && typeof e.type === "string" && TYPE_RE.test(e.type))
      .slice(0, 50)
      .map((e: any) => {
        const num = Number(e.value);
        const t = Number(e.ts);
        const ts = Number.isFinite(t) && Math.abs(Date.now() - t) < 24 * 3600 * 1000 ? t : Date.now();
        return {
          session_id: sid,
          visitor_id: vid,
          type: e.type,
          path: e.path ? String(e.path).slice(0, 500) : null,
          label: e.label != null ? String(e.label).slice(0, 500) : null,
          value: e.value != null && Number.isFinite(num) ? num : null,
          meta: cleanMeta(e.meta, ts),
          city, region, country, browser, os,
        };
      });
    if (!rows.length) return res.status(400).end();

    // 1) Grava os eventos
    const dbRes = await sbReq("POST", "events", { body: rows, prefer: "return=minimal" });
    const dbOk = dbRes.ok;
    if (dbOk) console.log("✅ Gravado no Supabase:", rows.length, "eventos");

    // 2) Sessão e aparelho (só quando há algo a decidir: início, fim, alerta ou assinatura nova)
    const startRow = rows.find((r: any) => r.type === "session_start") ?? null;
    const endRow = rows.find((r: any) => r.type === "session_end") ?? null;
    const alerts = rows.filter((r: any) => ALERT_TITLE[r.type]);
    let ctx: Ctx | null = null;
    if (startRow || endRow || alerts.length || fp) {
      const startedAt = Math.min(...rows.map((r: any) => Number(r.meta.ts)));
      ctx = await ensureSession({ sid, vid, fp, ip, cookieId, ua, geo, startedAt, startRow });
    }

    // Cookie do aparelho (assinado, 2 anos): o jeito mais confiável de reconhecer quem volta
    const dev = ctx?.sess.devices ?? null;
    if (dev && cookieId !== dev.id) {
      const secure = host === "localhost" ? "" : "; Secure";
      res.setHeader("Set-Cookie", `${COOKIE}=${enc(signId(dev.id))}; Path=/; Max-Age=63072000; HttpOnly; SameSite=Lax${secure}`);
    }

    // 3) Alertas em tempo real (aparelho do dono fica em silêncio)
    const silent = !!dev?.is_owner && !NOTIFY_OWNER;
    if (!silent) {
      if (ctx?.created && LIVE.newVisit) await telegram(visitAlert(startRow?.meta ?? {}, geoFull, ctx));
      const live = alerts.filter((r: any) => LIVE.keyActions || ALWAYS_LIVE.has(r.type));
      for (const r of live.slice(0, 5)) await telegram(keyAlert(r, geo, ctx, sid));
    }

    // 4) Fim de sessão: espera e só gera o relatório se o visitante não voltou
    if (endRow && dbOk) {
      await sleep(GRACE_MS);
      if (await hasActivityAfter(sid, Number(endRow.meta.ts))) {
        console.log("⏭️ Visitante voltou; relatório adiado para o próximo encerramento");
      } else {
        console.log("🕵️ Gerando relatório...");
        await sendReport(sid);
      }
    }

    return res.status(204).end();
  } catch (e) {
    console.error("❌ Erro fatal:", e);
    return res.status(204).end();
  }
}
