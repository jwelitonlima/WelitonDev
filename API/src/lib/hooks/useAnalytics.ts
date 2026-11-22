import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ENDPOINT, initSession, isTrackingEnabled, track } from "@/lib/analytics";

type PE = PerformanceEntry & { value?: number; hadRecentInput?: boolean };

const labelOf = (el: HTMLElement) => {
  const tag = el.tagName.toLowerCase();
  const custom = el.getAttribute("data-track");
  const href = tag === "a" ? el.getAttribute("href") : null;
  return (
    custom ||
    (href ? `link:${href}`.slice(0, 80) : "") ||
    (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40) ||
    tag
  );
};

/** EspIAn 🕵️ — liga toda a coleta. Chamar UMA vez, dentro do BrowserRouter. */
export function useAnalytics() {
  const location = useLocation();
  const page = useRef({ path: "", activeMs: 0, resumedAt: null as number | null, maxScroll: 0 });

  const flush = () => {
    const p = page.current;
    if (!p.path) return;
    if (p.resumedAt !== null) {
      p.activeMs += Date.now() - p.resumedAt;
      p.resumedAt = null;
    }
    const seconds = Math.round(p.activeMs / 1000);
    if (seconds > 0) track("page_leave", p.path, { value: seconds });
    if (p.maxScroll > 0) track("scroll_depth", p.path, { value: p.maxScroll });
    p.activeMs = 0;
  };

  // ---------- Liga uma única vez ----------
  useEffect(() => {
    const { isNewSession, isReturning } = initSession();
    if (!isTrackingEnabled()) return;

    // 1) Início de sessão: contexto do visitante
    if (isNewSession) {
      let referrer = "";
      try { referrer = document.referrer ? new URL(document.referrer).hostname : ""; } catch { /* ignora */ }
      const q = new URLSearchParams(window.location.search);
      const nav = navigator as Navigator & { connection?: { effectiveType?: string } };
      track("session_start", window.location.pathname, {
        meta: {
          returning: isReturning,
          device: window.innerWidth < 768 ? "mobile" : "desktop",
          referrer,
          screen: `${window.screen.width}x${window.screen.height}`,
          lang: navigator.language || "",
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
          dark: window.matchMedia("(prefers-color-scheme: dark)").matches,
          conn: nav.connection?.effectiveType || "?",
          utm_source: q.get("utm_source") || "",
          utm_medium: q.get("utm_medium") || "",
          utm_campaign: q.get("utm_campaign") || "",
        },
      });
    }

    // 2) Cliques + cliques de raiva
    const recent: { t: number; x: number; y: number }[] = [];
    let lastRage = 0;

    const onClick = (e: MouseEvent) => {
      const now = Date.now();
      recent.push({ t: now, x: e.clientX, y: e.clientY });
      while (recent.length && now - recent[0].t > 1000) recent.shift();
      const near = recent.filter((c) => Math.hypot(c.x - e.clientX, c.y - e.clientY) < 40);
      const target = e.target as HTMLElement | null;

      if (near.length >= 3 && now - lastRage > 5000) {
        lastRage = now;
        const el = target?.closest?.("[data-track], a, button") as HTMLElement | null;
        track("rage_click", window.location.pathname, {
          label: el ? labelOf(el) : (target?.tagName || "?").toLowerCase(),
        });
      }

      const el = target?.closest?.("[data-track], a, button") as HTMLElement | null;
      if (!el) return;
      const tag = el.tagName.toLowerCase();
      const href = tag === "a" ? el.getAttribute("href") || "" : "";
      let outbound = false;
      try { outbound = !!href && new URL(href, window.location.href).hostname !== window.location.hostname; } catch { /* ignora */ }

      const docH = Math.max(document.documentElement.scrollHeight, 1);
      track("click", window.location.pathname, {
        label: labelOf(el),
        meta: {
          tag,
          outbound,
          x: Math.round((e.clientX / window.innerWidth) * 100),
          y: Math.round(((e.clientY + window.scrollY) / docH) * 100),
        },
      });
    };

    // 3) Rolagem
    const onScroll = () => {
      const h = document.documentElement;
      const pct = ((window.scrollY + window.innerHeight) / Math.max(h.scrollHeight, 1)) * 100;
      const step = Math.min(100, Math.round(pct / 10) * 10);
      if (step > page.current.maxScroll) page.current.maxScroll = step;
    };

    // 4) Core Web Vitals (sem biblioteca)
    let lcp = 0, cls = 0, inp = 0, vitalsSent = false;
    const observe = (type: string, cb: (e: PE) => void, extra: object = {}) => {
      try {
        const o = new PerformanceObserver((l) => l.getEntries().forEach((e) => cb(e as PE)));
        o.observe({ type, buffered: true, ...extra } as PerformanceObserverInit);
        return o;
      } catch { return null; }
    };
    const observers = [
      observe("largest-contentful-paint", (e) => { lcp = e.startTime; }),
      observe("layout-shift", (e) => { if (!e.hadRecentInput) cls += e.value || 0; }),
      observe("event", (e) => { if (e.duration > inp) inp = e.duration; }, { durationThreshold: 40 }),
    ];
    const sendVitals = () => {
      if (vitalsSent) return;
      vitalsSent = true;
      const path = window.location.pathname;
      if (lcp) track("vital", path, { label: "LCP", value: Math.round(lcp) });
      track("vital", path, { label: "CLS", value: Math.round(cls * 1000) });
      if (inp) track("vital", path, { label: "INP", value: Math.round(inp) });
    };

    // 5) Visibilidade da aba
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        sendVitals();
        flush();
      } else {
        page.current.resumedAt = Date.now();
      }
    };
    const onPageHide = () => { sendVitals(); flush(); };

    // 6) Erros de JS, recursos que falharam (img/video/script) e promises rejeitadas
    const onError = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (t && t !== (window as unknown as HTMLElement) && t.tagName) {
        const src = (t.getAttribute("src") || t.getAttribute("href") || "").split("?")[0];
        if (["IMG", "VIDEO", "SCRIPT", "LINK", "SOURCE"].includes(t.tagName)) {
          track("resource_error", window.location.pathname, {
            label: `${t.tagName.toLowerCase()}:${src.slice(-80)}`,
          });
        }
        return;
      }
      const ev = e as ErrorEvent;
      track("error", window.location.pathname, {
        label: String(ev.message || "erro desconhecido").slice(0, 200),
        meta: { src: (ev.filename || "").slice(-80), line: ev.lineno || 0 },
      });
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      const r = e.reason as { message?: string } | string | undefined;
      const msg = typeof r === "string" ? r : r?.message || "promise rejeitada";
      track("error", window.location.pathname, { label: `Promise: ${msg}`.slice(0, 200) });
    };

    // 7) Requisições lentas (>2s) ou com falha (inclui o webhook do FreteAI)
    const origFetch = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const start = performance.now();
      let url = "";
      try {
        const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        url = new URL(raw, window.location.href).href;
      } catch { /* ignora */ }
      const skip = url.includes(ENDPOINT);
      const report = (status: number, ok: boolean) => {
        if (skip) return;
        const ms = Math.round(performance.now() - start);
        if (ok && ms <= 2000) return;
        let label = url;
        try { const u = new URL(url); label = u.host + u.pathname; } catch { /* ignora */ }
        track("fetch", window.location.pathname, { label: label.slice(0, 120), value: ms, meta: { status, ok } });
      };
      try {
        const res = await origFetch(input, init);
        report(res.status, res.ok);
        return res;
      } catch (err) {
        report(0, false);
        throw err;
      }
    };

    // 8) Vídeos com controles (página de detalhe): quantos segundos assistiu
    const playing = new WeakMap<HTMLVideoElement, number>();
    const onPlay = (e: Event) => {
      const v = e.target as HTMLVideoElement;
      if (v?.tagName === "VIDEO" && v.controls) playing.set(v, Date.now());
    };
    const onStop = (e: Event) => {
      const v = e.target as HTMLVideoElement;
      const start = v?.tagName === "VIDEO" ? playing.get(v) : undefined;
      if (!start) return;
      playing.delete(v);
      const s = Math.round((Date.now() - start) / 1000);
      if (s >= 1) track("video", window.location.pathname, { label: (v.currentSrc || "").split("/").pop()?.slice(0, 60), value: s });
    };

    // 9) Cópia (só o tipo; nunca o conteúdo)
    const onCopy = () => {
      const t = (window.getSelection()?.toString() || "").trim();
      if (!t) return;
      track("copy", window.location.pathname, {
        label: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t) ? "copy:email" : "copy:texto",
      });
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onRejection);
    document.addEventListener("play", onPlay, true);
    document.addEventListener("pause", onStop, true);
    document.addEventListener("ended", onStop, true);
    document.addEventListener("copy", onCopy);

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("error", onError, true);
      window.removeEventListener("unhandledrejection", onRejection);
      document.removeEventListener("play", onPlay, true);
      document.removeEventListener("pause", onStop, true);
      document.removeEventListener("ended", onStop, true);
      document.removeEventListener("copy", onCopy);
      window.fetch = origFetch;
      observers.forEach((o) => o?.disconnect());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- A cada troca de página ----------
  useEffect(() => {
    if (!isTrackingEnabled()) return;
    flush();
    page.current = {
      path: location.pathname,
      activeMs: 0,
      resumedAt: document.visibilityState === "visible" ? Date.now() : null,
      maxScroll: 0,
    };
    track("page_view", location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
}