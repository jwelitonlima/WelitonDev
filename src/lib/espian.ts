// src/lib/espian.ts — rastreador do EspIAn
// Uso: em main.tsx → import { initEspian } from "./lib/espian"; initEspian();
// Para ignorar este navegador por completo: localStorage.setItem("espian_ignore", "1")
// (o painel /admin tem um botão que faz isso). Rotas /admin nunca são rastreadas.

const ENDPOINT = "/api/collect";
const MAX_EVENTS = 500; // limite por sessão
const FLUSH_MS = 3000;
const HOVER_MIN_MS = 700;
const FP_WAIT_MS = 1500; // espera máxima pela impressão digital antes de iniciar a sessão
const HIDE_END_MS = 25000; // computador: tempo com a aba escondida até considerar a visita encerrada

type Ev = {
  type: string;
  path: string;
  label: string | null;
  value: number | null;
  meta?: Record<string, unknown>;
  ts: number;
};
type PushArg = {
  type: string;
  label?: string | null;
  value?: number | null;
  meta?: Record<string, unknown>;
  path?: string;
  ts?: number;
};

/* ── Impressão digital do aparelho ──
   Só hashes e rótulos técnicos (modelo, GPU, tela). Nada de dados pessoais; o servidor
   guarda o IP apenas como hash. */
type Fingerprint = {
  h: string; // hash completo (hardware + canvas + WebGL + fuso + idioma)
  hw: string; // hash só do hardware (resiste a trocar de navegador no mesmo aparelho)
  model: string; // modelo (Android/Chromium via UA-CH)
  plat: string;
  platv: string;
  gpu: string;
  scr: string; // ex.: 385x854@2.8
  tz: string;
  lang: string;
  cores: number;
  mem: number;
  touch: number;
};

function hash53(str: string, seed = 0): string {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

function canvasSig(): string {
  try {
    const c = document.createElement("canvas");
    c.width = 240;
    c.height = 64;
    const x = c.getContext("2d");
    if (!x) return "";
    x.textBaseline = "alphabetic";
    x.fillStyle = "#f60";
    x.fillRect(120, 2, 70, 22);
    x.fillStyle = "#069";
    x.font = "15px Arial, sans-serif";
    x.fillText("EspIAn ✓ <canvas> ç ü 1.0", 2, 16);
    x.fillStyle = "rgba(102,204,0,0.7)";
    x.font = "18px Georgia, serif";
    x.fillText("EspIAn ✓ <canvas> ç ü 1.0", 4, 42);
    x.globalCompositeOperation = "multiply";
    for (const [col, px, py] of [["#f0f", 50, 50], ["#0ff", 80, 50], ["#ff0", 65, 30]] as const) {
      x.fillStyle = col;
      x.beginPath();
      x.arc(px, py, 18, 0, Math.PI * 2);
      x.closePath();
      x.fill();
    }
    return hash53(c.toDataURL());
  } catch {
    return "";
  }
}

function glInfo(): { gpu: string; params: string } {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl") || c.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return { gpu: "", params: "" };
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const gpu = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? "");
    const params = [
      gl.MAX_TEXTURE_SIZE, gl.MAX_VERTEX_ATTRIBS, gl.MAX_VIEWPORT_DIMS, gl.MAX_RENDERBUFFER_SIZE,
      gl.ALIASED_LINE_WIDTH_RANGE, gl.ALIASED_POINT_SIZE_RANGE, gl.MAX_VARYING_VECTORS,
    ].map((p) => String(gl.getParameter(p))).join("|");
    return { gpu: gpu.slice(0, 120), params: params + "|" + (gl.getSupportedExtensions() ?? []).length };
  } catch {
    return { gpu: "", params: "" };
  }
}

async function collectFingerprint(): Promise<Fingerprint> {
  const nav = navigator as any;
  const uad = nav.userAgentData;
  let model = "";
  let plat = String(uad?.platform ?? nav.platform ?? "");
  let platv = "";
  if (uad?.getHighEntropyValues) {
    try {
      const v: any = await Promise.race([
        uad.getHighEntropyValues(["model", "platformVersion"]),
        new Promise((r) => setTimeout(() => r(null), 800)),
      ]);
      if (v) {
        model = String(v.model ?? "");
        platv = String(v.platformVersion ?? "");
        if (v.platform) plat = String(v.platform);
      }
    } catch {}
  }
  const gl = glInfo();
  const dpr = Math.round((window.devicePixelRatio || 1) * 100) / 100;
  const w = Math.min(screen.width, screen.height); // não muda ao girar a tela
  const hgt = Math.max(screen.width, screen.height);
  const scr = `${w}x${hgt}@${dpr}`;
  const touch = nav.maxTouchPoints || 0;
  const cores = nav.hardwareConcurrency || 0;
  const mem = nav.deviceMemory || 0;
  let tz = "";
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch {}
  const lang = String(navigator.language || "");

  const hwStr = [gl.gpu, scr, plat, touch, model].join("|");
  const fullStr = [hwStr, canvasSig(), gl.params, tz, lang, cores, mem, screen.colorDepth].join("|");
  return {
    h: hash53(fullStr),
    hw: hash53(hwStr, 7),
    model: model.slice(0, 60),
    plat: plat.slice(0, 30),
    platv: platv.slice(0, 20),
    gpu: gl.gpu,
    scr,
    tz: tz.slice(0, 60),
    lang: lang.slice(0, 20),
    cores,
    mem,
    touch,
  };
}

export function initEspian() {
  if (typeof window === "undefined" || (window as any).__espian) return;
  (window as any).__espian = true;
  try {
    if (localStorage.getItem("espian_ignore") === "1") return;
  } catch {}

  /* ── Identidade ── */
  const rid = () => {
    const a = new Uint8Array(12);
    crypto.getRandomValues(a);
    return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
  };
  const getId = (s: Storage, k: string) => {
    try {
      let v = s.getItem(k);
      if (!v) { v = rid(); s.setItem(k, v); }
      return v;
    } catch { return rid(); }
  };
  let returning = false;
  let isNewSession = true;
  try { returning = !!localStorage.getItem("espian_vid"); } catch {}
  try { isNewSession = !sessionStorage.getItem("espian_sid"); } catch {}
  const vid = getId(localStorage, "espian_vid");
  const sid = getId(sessionStorage, "espian_sid");
  // Janela aberta pelo próprio site (ex.: demo): herda a sessão e entra no mesmo relatório
  const secondary = !!window.opener && !isNewSession;

  /* ── Fila de envio ── */
  const q: Ev[] = [];
  let sent = 0;
  let ended = false;
  let errCount = 0;
  let anyPushed = false; // houve algum evento real (fora do /admin)?
  let fp: Fingerprint | null = null;
  let fpSent = 0;
  const now = () => Date.now();
  const startTs = now();

  function push(a: PushArg) {
    const path = a.path ?? location.pathname;
    // O painel admin nunca é rastreado (só o encerramento da sessão passa, se já houve visita)
    if (path.startsWith("/admin") && a.type !== "session_end") return;
    if (sent + q.length >= MAX_EVENTS && a.type !== "session_end") return;
    if (a.type !== "session_end") anyPushed = true;
    q.push({
      type: a.type,
      path,
      label: a.label ?? null,
      value: a.value ?? null,
      meta: secondary ? { ...(a.meta ?? {}), tab: "nova janela" } : a.meta,
      ts: a.ts ?? now(),
    });
    if (q.length >= 15) flush();
  }

  function flush(beacon = false) {
    if (!q.length) return;
    const events = q.splice(0, q.length);
    sent += events.length;
    // A impressão digital vai nos primeiros envios e em todo lote de início/fim de sessão
    const needFp = !!fp && (fpSent < 2 || events.some((e) => e.type === "session_start" || e.type === "session_end"));
    if (needFp) fpSent++;
    const body = JSON.stringify({ sid, vid, fp: needFp ? fp : undefined, events });
    try {
      if (beacon && navigator.sendBeacon) {
        if (navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "text/plain" }))) return;
      }
      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    } catch {}
  }
  setInterval(() => flush(), FLUSH_MS);

  /* ── Descrição de elementos ── */
  const SEL = 'a[href],button,[role="button"],[role="tab"],[role="link"],[data-track],input,select,textarea,summary';
  const clean = (s?: string | null, n = 80) => (s ?? "").replace(/\s+/g, " ").trim().slice(0, n);

  function interactive(t: EventTarget | null): HTMLElement | null {
    // Sobe até achar um elemento interativo. Sem ele, usa a região "clicável" (cursor pointer)
    // mais externa, para que o clique em um ícone/vídeo conte como clique no card.
    let n = t instanceof Element ? (t as HTMLElement) : null;
    let top: HTMLElement | null = null;
    for (let i = 0; n && i < 7; i++, n = n.parentElement) {
      if (n.matches(SEL)) return n;
      let pointer = false;
      try { pointer = getComputedStyle(n).cursor === "pointer"; } catch {}
      if (pointer) top = n;
      else if (top) break;
    }
    return top;
  }
  function labelOf(el: Element): string {
    const h = el as HTMLElement;
    const txt = clean((h as any).innerText ?? h.textContent);
    const hd = h.querySelector?.("h1,h2,h3,h4,h5") as HTMLElement | null;
    return (
      clean(h.getAttribute("data-track") || h.getAttribute("aria-label") || (txt.length > 40 && hd ? hd.innerText : txt) ||
        h.getAttribute("title") || (h as HTMLImageElement).alt || h.getAttribute("name") || h.id) || h.tagName.toLowerCase()
    );
  }
  function ctxOf(el: Element): string {
    const box = el.closest('[data-track-group],[role="dialog"],[aria-modal="true"],article,section,li') as HTMLElement | null;
    const hd = box?.querySelector("h1,h2,h3,h4") as HTMLElement | null;
    return clean(box?.getAttribute("data-track-group") || hd?.innerText, 60);
  }

  /* ── Páginas (SPA), tempo ativo e rolagem ── */
  let curPath = location.pathname;
  let pageStart = now();
  let hiddenAt = 0;
  let hiddenMs = 0;
  let maxScroll = 0;
  const hit = new Set<number>();

  const activeSecs = () => {
    const h = hiddenAt ? now() - hiddenAt : 0;
    return Math.max(0, Math.round((now() - pageStart - hiddenMs - h) / 1000));
  };
  function leavePage() {
    push({ type: "page_leave", path: curPath, value: activeSecs(), meta: { scroll: maxScroll } });
  }
  function enterPage() {
    curPath = location.pathname;
    pageStart = now();
    hiddenMs = 0;
    maxScroll = 0;
    hit.clear();
    push({ type: "page_view", path: curPath });
    pushStart(); // se a visita começou no /admin, o início só conta ao entrar no site
  }
  function onRoute() {
    if (location.pathname === curPath) return;
    leavePage();
    enterPage();
  }
  for (const m of ["pushState", "replaceState"] as const) {
    const orig = history[m];
    (history as any)[m] = function (this: History, ...a: any[]) {
      const r = (orig as any).apply(this, a);
      onRoute();
      return r;
    };
  }
  window.addEventListener("popstate", onRoute);

  let raf = 0;
  window.addEventListener(
    "scroll",
    () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const total = document.documentElement.scrollHeight - window.innerHeight;
        if (total <= 20) return;
        const pct = Math.min(100, Math.round((window.scrollY / total) * 100));
        maxScroll = Math.max(maxScroll, pct);
        for (const m of [25, 50, 75, 100]) {
          if (pct >= m && !hit.has(m)) { hit.add(m); push({ type: "scroll_depth", value: m }); }
        }
      });
    },
    { passive: true }
  );

  /* ── Cliques, links externos e contato ── */
  let lastClick: { label: string; ctx: string; t: number } | null = null;

  function classify(a: HTMLAnchorElement) {
    if (a.protocol === "mailto:") return { type: "contact_click", kind: "e-mail", href: "" };
    if (a.protocol === "tel:") return { type: "contact_click", kind: "telefone", href: "" };
    let u: URL;
    try { u = new URL(a.href); } catch { return null; }
    if (/(^|\.)wa\.me$|whatsapp\.com$/.test(u.hostname)) return { type: "contact_click", kind: "WhatsApp", href: u.hostname };
    if (a.hasAttribute("download") || /\.(pdf|docx?|zip)$/i.test(u.pathname))
      return { type: "download", kind: "", href: (u.host === location.host ? "" : u.host) + u.pathname.slice(0, 100) };
    if (u.host !== location.host) return { type: "outbound_click", kind: "", href: (u.host + u.pathname).slice(0, 120) };
    if (a.target === "_blank") return { type: "window_open", kind: "", href: u.pathname.slice(0, 120) };
    return null;
  }

  let rc: { x: number; y: number; t: number }[] = [];
  function rage(e: MouseEvent) {
    const t = now();
    rc = rc.filter((c) => t - c.t < 800);
    rc.push({ x: e.clientX, y: e.clientY, t });
    if (rc.length >= 4 && rc.every((c) => Math.abs(c.x - e.clientX) < 30 && Math.abs(c.y - e.clientY) < 30)) {
      rc = [];
      push({ type: "rage_click", label: labelOf(e.target as Element) });
    }
  }

  document.addEventListener(
    "click",
    (e) => {
      rage(e);
      const el = interactive(e.target);
      if (!el || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      const label = labelOf(el);
      const ctx = ctxOf(el);
      lastClick = { label, ctx, t: now() };

      const a = el.closest("a[href]") as HTMLAnchorElement | null;
      const k = a ? classify(a) : null;
      if (k) {
        const meta: Record<string, unknown> = { ctx };
        if (k.kind) meta.kind = k.kind;
        if (k.href) meta.href = k.href;
        push({ type: k.type, label, meta });
        flush(true);
        return;
      }
      push({ type: "click", label, meta: { ctx, tag: el.tagName.toLowerCase() } });
    },
    true
  );

  // Botões que abrem a demo via window.open(...)
  const nativeOpen = window.open;
  (window as any).open = function (...args: any[]) {
    try {
      if (args[0] && String(args[0]) !== "about:blank") {
        const u = new URL(String(args[0]), location.href);
        const external = u.host !== location.host;
        const lc = lastClick && now() - lastClick.t < 1500 ? lastClick : null;
        push({
          type: external ? "outbound_open" : "window_open",
          label: lc?.label ?? null,
          meta: { ctx: lc?.ctx ?? "", href: (external ? u.host + u.pathname : u.pathname).slice(0, 120) },
        });
        flush(true);
      }
    } catch {}
    return (nativeOpen as any).apply(window, args);
  };

  /* ── Foco do mouse (hover) ── */
  if (matchMedia("(hover: hover)").matches) {
    let cur: HTMLElement | null = null;
    let t0 = 0;
    const endHover = () => {
      if (cur && now() - t0 >= HOVER_MIN_MS)
        push({ type: "hover", label: labelOf(cur), value: now() - t0, meta: { ctx: ctxOf(cur) } });
      cur = null;
    };
    document.addEventListener(
      "mouseover",
      (e) => {
        const el = interactive(e.target);
        if (el === cur) return;
        endHover();
        cur = el;
        t0 = now();
      },
      true
    );
    document.documentElement.addEventListener("mouseleave", endHover);
    window.addEventListener("pagehide", endHover);
  }

  /* ── Painéis/modais (ex.: mini tela do projeto) ── */
  const DLG = '[role="dialog"],[aria-modal="true"],dialog[open]';
  let lastModal = 0;
  new MutationObserver((muts) => {
    for (const m of muts) {
      m.addedNodes.forEach((n) => {
        if (!(n instanceof HTMLElement)) return;
        const d = n.matches(DLG) ? n : n.querySelector<HTMLElement>(DLG);
        if (!d || now() - lastModal < 500) return;
        lastModal = now();
        const h = d.querySelector<HTMLElement>("h1,h2,h3,h4");
        push({ type: "modal_open", label: clean(d.getAttribute("aria-label") || h?.innerText, 80) || "painel" });
      });
    }
  }).observe(document.body, { childList: true, subtree: true });

  /* ── Formulários (nunca envia o conteúdo digitado) ── */
  const seenField = new Set<string>();
  document.addEventListener("focusin", (e) => {
    const el = e.target as HTMLInputElement;
    if (!el.matches?.("input,textarea,select") || el.type === "password") return;
    const name = clean(el.name || el.id || el.placeholder || el.getAttribute("aria-label"), 40) || "campo";
    const k = curPath + "|" + name;
    if (seenField.has(k)) return;
    seenField.add(k);
    push({ type: "form_focus", label: name });
  });
  document.addEventListener(
    "submit",
    (e) => {
      const f = e.target as HTMLFormElement;
      push({ type: "form_submit", label: clean(f.getAttribute("aria-label") || f.getAttribute("name") || f.id, 60) || "formulário" });
      flush(true);
    },
    true
  );

  document.addEventListener("copy", () => {
    push({ type: "copy", label: `${window.getSelection()?.toString().length ?? 0} caracteres` });
  });

  /* ── Erros ── */
  window.addEventListener("error", (e) => {
    if (errCount++ < 5) push({ type: "error", label: clean(e.message, 120) });
  });
  window.addEventListener("unhandledrejection", (e) => {
    if (errCount++ < 5) push({ type: "error", label: clean(String((e as PromiseRejectionEvent).reason), 120) });
  });

  /* ── Visibilidade da aba e fim de sessão ── */
  const isTouch = matchMedia("(pointer: coarse)").matches;

  function endSession(reason: string) {
    if (ended) return;
    ended = true;
    if (!anyPushed) return; // visita só no /admin: nada a relatar
    pushStart(true); // saída muito rápida: garante que o início exista
    leavePage();
    // Toda aba avisa que parou (a janela da demo vai com a marca "nova janela"). O servidor espera e só
    // gera o relatório quando NENHUMA aba da visita está ativa, então a ordem em que as abas fecham não importa.
    push({ type: "session_end", meta: { reason } });
    flush(true);
  }

  // Computador: quem troca de aba pode voltar logo, então espera um pouco antes de encerrar.
  // Sem isso, quem deixa a aba aberta em segundo plano nunca geraria o relatório.
  let hideTimer: ReturnType<typeof setTimeout> | undefined;

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      hiddenAt = now();
      push({ type: "tab_hidden" });
      if (isTouch) endSession("hidden"); // celular: pagehide não é confiável
      else {
        flush(true);
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => endSession("hidden"), HIDE_END_MS);
      }
    } else {
      clearTimeout(hideTimer); // voltou antes do prazo: a visita continua
      if (hiddenAt) {
        const away = now() - hiddenAt;
        hiddenMs += away;
        hiddenAt = 0;
        push({ type: "tab_visible", value: Math.round(away / 1000) });
      }
      if (ended) {
        ended = false;
        pageStart = now();
        hiddenMs = 0;
        push({ type: "session_resume" });
      }
    }
  });
  window.addEventListener("pagehide", () => endSession("pagehide"));

  /* ── Início ── */
  let started = false;
  let startReady = false; // impressão digital pronta (ou tempo esgotado)
  function pushStart(force = false) {
    if (started || !isNewSession || secondary) return;
    if (!force && !startReady) return;
    if (location.pathname.startsWith("/admin")) return;
    started = true;
    const p = new URLSearchParams(location.search);
    let ref = "";
    try { ref = document.referrer ? new URL(document.referrer).hostname : ""; } catch {}
    if (ref === location.hostname) ref = "";
    push({
      type: "session_start",
      ts: startTs,
      meta: {
        device: isTouch || window.innerWidth < 768 ? "mobile" : "desktop",
        screen: `${screen.width}x${screen.height}`,
        lang: navigator.language,
        ref,
        utm: clean(p.get("utm_source"), 40),
        returning,
      },
    });
  }

  const fpReady = collectFingerprint()
    .then((v) => { fp = v; })
    .catch(() => {});
  Promise.race([fpReady, new Promise((r) => setTimeout(r, FP_WAIT_MS))]).then(() => {
    startReady = true;
    pushStart();
  });

  enterPage();
}