// src/components/espian/demoData.ts — dados 100% FICTÍCIOS para a demonstração pública do EspIAn.
// Nada aqui vem de visitantes reais: tudo é gerado por um sorteio com semente fixa (mesmo resultado sempre),
// com datas relativas a "hoje" para o painel nunca parecer parado no tempo.
// Cumpre a mesma interface `Source` do painel real, mas em memória (nenhuma chamada de rede).

import type { Device, DevicePatch, Ev, PageStat, Session, Source } from "./EspianPanel";

const TZ = "America/Fortaleza";
const dayKeyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const DAY = 86400000;

/* ───────────────────────── Sorteio com semente (mulberry32) ───────────────────────── */

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ───────────────────────── Catálogo fictício ───────────────────────── */

type DevSpec = {
  kind: "mobile" | "desktop"; model: string; os: string; browser: string; screen: string; gpu: string;
  city: string; region: string; alias?: string; owner?: boolean; weight: number;
};

// Aparelhos inventados. O #1 faz o papel de "meu aparelho" (some do painel com "Ocultar meus aparelhos").
const DEVICES: DevSpec[] = [
  { kind: "desktop", model: "PC", os: "Windows 11", browser: "Chrome 131", screen: "1920x1080@1", gpu: "NVIDIA GeForce RTX 3060", city: "Teresina", region: "Piauí", alias: "Meu notebook", owner: true, weight: 3 },
  { kind: "mobile", model: "Samsung Galaxy S23", os: "Android 14", browser: "Chrome 131", screen: "385x854@2.8", gpu: "Adreno 740", city: "São Paulo", region: "São Paulo", alias: "Recrutadora (exemplo)", weight: 6 },
  { kind: "desktop", model: "Mac", os: "macOS 14", browser: "Safari 17", screen: "1512x982@2", gpu: "Apple M2", city: "São Paulo", region: "São Paulo", alias: "Gestor de TI (exemplo)", weight: 4 },
  { kind: "mobile", model: "iPhone", os: "iOS 17", browser: "Safari 17", screen: "390x844@3", gpu: "Apple GPU", city: "Fortaleza", region: "Ceará", weight: 4 },
  { kind: "desktop", model: "PC", os: "Windows 10", browser: "Edge 130", screen: "1366x768@1", gpu: "Intel UHD Graphics 620", city: "Recife", region: "Pernambuco", weight: 2 },
  { kind: "mobile", model: "Motorola Moto G84", os: "Android 14", browser: "Chrome 131", screen: "393x873@2.75", gpu: "Adreno 619", city: "Teresina", region: "Piauí", alias: "Colega da faculdade (exemplo)", weight: 5 },
  { kind: "desktop", model: "PC", os: "Windows 11", browser: "Chrome 131", screen: "2560x1440@1", gpu: "NVIDIA GeForce RTX 4070", city: "Belo Horizonte", region: "Minas Gerais", weight: 2 },
  { kind: "mobile", model: "Xiaomi Redmi Note 12", os: "Android 13", browser: "Chrome 130", screen: "393x851@2.75", gpu: "Adreno 610", city: "Salvador", region: "Bahia", weight: 3 },
  { kind: "mobile", model: "iPhone", os: "iOS 18", browser: "Safari 18", screen: "393x852@3", gpu: "Apple GPU", city: "Rio de Janeiro", region: "Rio de Janeiro", weight: 3 },
  { kind: "desktop", model: "Linux", os: "Ubuntu", browser: "Firefox 132", screen: "1920x1080@1", gpu: "Mesa Intel UHD", city: "Curitiba", region: "Paraná", weight: 1 },
  { kind: "mobile", model: "Samsung Galaxy A54", os: "Android 14", browser: "Samsung Internet 25", screen: "412x915@2.6", gpu: "Mali-G68", city: "Parnaíba", region: "Piauí", weight: 2 },
  { kind: "desktop", model: "Mac", os: "macOS 15", browser: "Chrome 131", screen: "1728x1117@2", gpu: "Apple M3", city: "Florianópolis", region: "Santa Catarina", weight: 2 },
  { kind: "mobile", model: "iPhone", os: "iOS 17", browser: "Safari 17", screen: "375x812@3", gpu: "Apple GPU", city: "Brasília", region: "Distrito Federal", weight: 2 },
  { kind: "desktop", model: "PC", os: "Windows 11", browser: "Chrome 131", screen: "1536x864@1.25", gpu: "AMD Radeon Graphics", city: "Porto Alegre", region: "Rio Grande do Sul", weight: 1 },
  // Visitantes de passagem (peso baixo): a maioria aparece uma única vez, como num portfólio de verdade
  { kind: "mobile", model: "Samsung Galaxy S21", os: "Android 13", browser: "Chrome 131", screen: "360x800@3", gpu: "Mali-G78", city: "Manaus", region: "Amazonas", weight: 0.3 },
  { kind: "desktop", model: "Mac", os: "macOS 14", browser: "Safari 17", screen: "1440x900@2", gpu: "Apple M1", city: "Goiânia", region: "Goiás", weight: 0.3 },
  { kind: "mobile", model: "iPhone", os: "iOS 18", browser: "Safari 18", screen: "430x932@3", gpu: "Apple GPU", city: "Natal", region: "Rio Grande do Norte", weight: 0.3 },
  { kind: "desktop", model: "PC", os: "Windows 10", browser: "Chrome 130", screen: "1920x1080@1", gpu: "NVIDIA GeForce GTX 1650", city: "Campinas", region: "São Paulo", weight: 0.3 },
  { kind: "mobile", model: "Motorola Moto G54", os: "Android 14", browser: "Chrome 131", screen: "412x915@2.6", gpu: "Mali-G57", city: "São Luís", region: "Maranhão", weight: 0.3 },
  { kind: "desktop", model: "PC", os: "Windows 11", browser: "Edge 131", screen: "1600x900@1", gpu: "Intel Iris Xe", city: "Vitória", region: "Espírito Santo", weight: 0.3 },
  { kind: "mobile", model: "Xiaomi Poco X5", os: "Android 13", browser: "Chrome 130", screen: "393x851@2.75", gpu: "Adreno 619", city: "Belém", region: "Pará", weight: 0.3 },
  { kind: "mobile", model: "iPhone", os: "iOS 17", browser: "Safari 17", screen: "390x844@3", gpu: "Apple GPU", city: "Aracaju", region: "Sergipe", weight: 0.3 },
];

const REFERRERS = [null, null, null, "linkedin.com", "linkedin.com", "github.com", "google.com", "google.com", "instagram.com"];
const PROJECTS = ["Painel de Vendas", "Chatbot de Atendimento", "Previsão de Demanda", "Automação de Relatórios"];
const CONTACTS = [
  { label: "WhatsApp", kind: "whatsapp", href: "https://wa.me/55…" },
  { label: "E-mail", kind: "email", href: "mailto:contato@…" },
  { label: "LinkedIn", kind: "linkedin", href: "https://linkedin.com/in/…" },
];

/* ───────────────────────── Geração ───────────────────────── */

type Built = { sessions: Session[]; devices: Device[]; events: Map<string, Ev[]> };

function fakeHash(r: () => number, n = 10) {
  const c = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < n; i++) s += c[Math.floor(r() * 16)];
  return s;
}

/** Monta um conjunto completo (aparelhos, visitas e eventos) a partir de uma semente. */
export function buildDemo(now = Date.now(), seed = 2027): Built {
  const r = rng(seed);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const midnight = Date.parse(dayKeyFmt.format(new Date(now)) + "T00:00:00-03:00");

  // 1) Sorteia quando cada visita começou e qual aparelho foi
  const totalW = DEVICES.reduce((s, d) => s + d.weight, 0);
  const pickDevice = () => {
    let x = r() * totalW;
    for (let i = 0; i < DEVICES.length; i++) { x -= DEVICES[i].weight; if (x <= 0) return i; }
    return 0;
  };
  const starts: { t: number; dev: number }[] = [];
  for (let d = 29; d >= 0; d--) {
    const dow = new Date(midnight - d * DAY + 12 * 3600000).getUTCDay();
    const base = dow === 0 || dow === 6 ? 2 : 4;          // fim de semana é mais fraco
    const n = base + Math.floor(r() * 4);
    for (let k = 0; k < n; k++) {
      const hour = 8 + Math.floor(Math.pow(r(), 0.8) * 15);  // concentra de manhã e à noite
      const t = midnight - d * DAY + hour * 3600000 + Math.floor(r() * 3600000);
      if (t < now - 10 * 60000) starts.push({ t, dev: pickDevice() });
    }
  }
  starts.sort((a, b) => a.t - b.t);

  // 2) Gera cada visita com seus eventos
  const events = new Map<string, Ev[]>();
  const visitCount = new Map<number, number>();
  const lastNet = new Map<number, string>();
  const sessions: Session[] = [];
  const devState = DEVICES.map((spec, i) => ({
    spec, first: 0, last: 0, visits: 0, vids: [fakeHash(r, 8)], ips: [fakeHash(r, 12)], id: `demo-dev-${i + 1}`,
  }));

  starts.forEach(({ t, dev }, idx) => {
    const spec = DEVICES[dev];
    const st = devState[dev];
    const visitNo = (visitCount.get(dev) ?? 0) + 1;
    visitCount.set(dev, visitNo);
    const sid = `demo-${String(idx + 1).padStart(3, "0")}-${fakeHash(r, 6)}`;

    // perfil de interesse: 45% só olhou a home, 30% explorou, 25% foi fundo
    const roll = r();
    const level: "baixo" | "médio" | "alto" = roll < 0.45 ? "baixo" : roll < 0.75 ? "médio" : "alto";
    const evs: Ev[] = [];
    let ts = t;
    let clicks = 0;
    let actions = 0;
    const add = (type: string, o: Partial<Ev> & { meta?: Record<string, any> } = {}) => {
      evs.push({ type, path: o.path ?? null, label: o.label ?? null, value: o.value ?? null, meta: { ts, ...(o.meta ?? {}) }, created_at: new Date(ts).toISOString() });
    };
    const pages = new Map<string, PageStat>();
    const stat = (p: string) => { let x = pages.get(p); if (!x) { x = { p, views: 0, time: 0, scroll: 0 }; pages.set(p, x); } return x; };
    const interest = new Map<string, { k: string; hover: number; clicks: number }>();
    const mark = (k: string) => { let x = interest.get(k); if (!x) { x = { k, hover: 0, clicks: 0 }; interest.set(k, x); } return x; };

    // visita a uma página: abre, rola, (opcional) interage, sai
    const visit = (path: string, secs: number, scroll: number, body?: () => void) => {
      add("page_view", { path });
      stat(path).views++;
      let seen = 0;
      for (const mark25 of [25, 50, 75, 100]) {
        if (mark25 > scroll) break;
        ts += Math.round((secs * 1000 * 0.5) / 4);
        add("scroll_depth", { path, value: mark25 });
        seen = mark25;
      }
      body?.();
      ts += Math.round(secs * 1000 * 0.5);
      add("page_leave", { path, value: secs, meta: { scroll: seen } });
      const x = stat(path); x.time += secs; x.scroll = Math.max(x.scroll, seen);
      ts += 400;
    };

    add("session_start");
    visit("/", level === "baixo" ? 8 + Math.floor(r() * 30) : 20 + Math.floor(r() * 50), level === "baixo" ? pick([0, 25, 50]) : pick([75, 100]), () => {
      if (level !== "baixo") { const p = pick(PROJECTS); ts += 900; add("hover", { path: "/", label: p, value: 1200 + Math.floor(r() * 3000), meta: { ctx: "Cartão de projeto" } }); mark(p).hover += 2000; }
    });

    if (level !== "baixo") {
      visit("/projetos", 18 + Math.floor(r() * 45), pick([75, 100, 100]), () => {
        const p = pick(PROJECTS);
        ts += 1200; add("hover", { path: "/projetos", label: p, value: 1500 + Math.floor(r() * 4000), meta: { ctx: "Cartão de projeto" } }); mark(p).hover += 2500;
        if (r() < 0.8) { ts += 700; add("click", { path: "/projetos", label: p, meta: { ctx: "Cartão de projeto" } }); clicks++; actions++; mark(p).clicks++; }
      });
    }

    if (level === "alto") {
      const p = pick(PROJECTS);
      const path = `/project/${p.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-")}`;
      visit(path, 45 + Math.floor(r() * 120), 100, () => {
        if (r() < 0.65) {
          ts += 1500; add("click", { path, label: "Abrir demo", meta: { ctx: p } }); clicks++; actions++; mark(p).clicks++;
          ts += 300; add("window_open", { path, label: "Abrir demo", meta: { ctx: p, href: "/demo/" + path.split("/").pop() } });
          ts += 800; add("page_view", { path: "/demo/" + path.split("/").pop(), meta: { tab: "nova janela" } });
          ts += 20000 + Math.floor(r() * 40000);
          actions++;
        }
      });
      if (r() < 0.45) {
        visit("/contato", 12 + Math.floor(r() * 30), pick([50, 100]), () => {
          const c = pick(CONTACTS);
          ts += 2500; add("contact_click", { path: "/contato", label: c.label, meta: { kind: c.kind, href: c.href } }); clicks++; actions++;
        });
      }
    }

    add("session_end");
    const durationS = Math.max(5, Math.round((ts - t) / 1000));
    const activeS = Math.round(durationS * (0.7 + r() * 0.25));
    const referrer = pick(REFERRERS);

    // reconhecimento do aparelho (como o servidor real explicaria)
    let conf: Session["match_confidence"] = "nova";
    let why: string | null = null;
    if (visitNo > 1) {
      const sameNet = lastNet.get(dev) === spec.city;
      const x = r();
      if (x < 0.7) { conf = "alta"; why = "cookie do aparelho"; }
      else if (x < 0.9) { conf = "alta"; why = sameNet ? "assinatura do aparelho + mesma rede" : "assinatura do aparelho"; }
      else { conf = "média"; why = "assinatura do aparelho (rede diferente)"; }
    }
    lastNet.set(dev, spec.city);

    sessions.push({
      sid, visitor_id: st.vids[0], device_id: st.id, match_confidence: conf, match_reason: why, visit_no: visitNo,
      started_at: new Date(t).toISOString(), ended_at: new Date(ts).toISOString(), duration_s: durationS, active_s: activeS,
      pages: pages.size, clicks: clicks + Math.floor(r() * 3), max_scroll: Math.max(0, ...Array.from(pages.values()).map((p) => p.scroll)), actions,
      city: spec.city, region: spec.region, country: "BR", browser: spec.browser.split(" ")[0], os: spec.os, device_kind: spec.kind,
      referrer, utm: null, is_returning: visitNo > 1,
      summary: { pages: Array.from(pages.values()), interest: Array.from(interest.values()).sort((a, b) => b.clicks * 5000 + b.hover - (a.clicks * 5000 + a.hover)) },
    });
    events.set(sid, evs);

    if (!st.first) st.first = t;
    st.last = t; st.visits = visitNo;
  });

  // 3) Aparelhos (só os que apareceram)
  const devices: Device[] = devState.filter((d) => d.visits > 0).map((d) => ({
    id: d.id, num: DEVICES.indexOf(d.spec) + 1, alias: d.spec.alias ?? null, notes: null, is_owner: !!d.spec.owner, visits: d.visits,
    first_seen: new Date(d.first).toISOString(), last_seen: new Date(d.last).toISOString(),
    model: d.spec.model, os: d.spec.os, browser: d.spec.browser, device_kind: d.spec.kind, screen: d.spec.screen, gpu: d.spec.gpu,
    tz: TZ, lang: "pt-BR", last_city: d.spec.city, last_region: d.spec.region, last_country: "BR",
    vids: d.vids, ip_hashes: d.ips,
  })).sort((a, b) => b.last_seen.localeCompare(a.last_seen));

  sessions.reverse(); // mais recentes primeiro, como no banco
  return { sessions, devices, events };
}

/* ───────────────────────── Fonte em memória ───────────────────────── */

/** Cria uma fonte independente: as edições (nome, anotação) valem só para esta aba e somem ao recarregar. */
export function createDemoSource(now = Date.now()): Source {
  const data = buildDemo(now);
  let devices = data.devices;
  return {
    async list(days) {
      const midnight = Date.parse(dayKeyFmt.format(new Date(now)) + "T00:00:00-03:00");
      const since = days > 0 ? midnight - (days - 1) * DAY : 0;
      return { sessions: data.sessions.filter((s) => Date.parse(s.started_at) >= since), devices };
    },
    async events(sid) { return data.events.get(sid) ?? []; },
    async history(deviceId) { return data.sessions.filter((s) => s.device_id === deviceId); },
    async session(sid) { return data.sessions.find((s) => s.sid === sid) ?? null; },
    async saveDevice(id: string, patch: DevicePatch) {
      devices = devices.map((d) => (d.id === id ? { ...d, ...patch } : d));
      return devices.find((d) => d.id === id) ?? null;
    },
  };
}

/* ───────────────────────── Mensagens de exemplo do Telegram ───────────────────────── */
// Mesmo formato das mensagens reais (api/collect.ts), com personagens inventados.
// Marcação aceita: <b>negrito</b> e <i>itálico</i>.

export const DEMO_TELEGRAM: { hora: string; texto: string }[] = [
  {
    hora: "14:02",
    texto: [
      "🌐 <b>NOVO ACESSO</b> — 🆕 <b>aparelho novo</b>", "",
      "📱 <b>#2</b> · Samsung Galaxy S23", "     Android 14 · Chrome 131 · 385x854",
      "📍 São Paulo — São Paulo · BR", "✅ Primeiro registro deste aparelho",
      "🔗 Origem: linkedin.com", "", "<i>#A2 · sessão demo-041</i>",
    ].join("\n"),
  },
  {
    hora: "14:03",
    texto: [
      "🎯 <b>AÇÃO DE INTERESSE</b> — nova janela", "",
      "📱 Aparelho #2 · “Recrutadora (exemplo)” · 1ª visita",
      "📄 Página: /project/painel-de-vendas", "🎯 Elemento: \"Abrir demo\" (Painel de Vendas)",
      "📍 São Paulo — São Paulo · BR", "", "<i>#A2 · sessão demo-041</i>",
    ].join("\n"),
  },
  {
    hora: "14:06",
    texto: [
      "📋 <b>RELATÓRIO DA VISITA</b>", "",
      "📱 Aparelho #2 · “Recrutadora (exemplo)”", "⏱ 3min 48s no site · 🔥 interesse alto",
      "📄 / (24s) → /projetos (41s) → /project/painel-de-vendas (2min 10s)",
      "✨ Abriu a demo do Painel de Vendas em nova janela", "",
      "<i>#A2 · sessão demo-041</i>",
    ].join("\n"),
  },
];
