import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ENDPOINT, flushNow, initSession, isTrackingEnabled, track } from "@/lib/analytics";

const labelOf = (el: HTMLElement) => el.getAttribute("data-track") || (el.textContent || "").trim().slice(0, 40) || el.tagName.toLowerCase();

export function useAnalytics() {
  const location = useLocation();
  const page = useRef({ path: "", activeMs: 0, resumedAt: null as number | null, maxScroll: 0 });
  const sessionEnded = useRef(false);

  const flushPage = () => {
    const p = page.current;
    if (!p.path) return;
    if (p.resumedAt !== null) { p.activeMs += Date.now() - p.resumedAt; p.resumedAt = null; }
    const seconds = Math.round(p.activeMs / 1000);
    if (seconds > 0) track("page_leave", p.path, { value: seconds });
    if (p.maxScroll > 0) track("scroll_depth", p.path, { value: p.maxScroll });
    p.activeMs = 0;
    p.maxScroll = 0;
  };

  // O evento que diz "a visita acabou / usuário trocou de aba"
  const endSession = () => {
    if (sessionEnded.current) return;
    flushPage();
    sessionEnded.current = true;
    track("session_end", page.current.path || window.location.pathname);
    flushNow(); // <--- Dispara síncrono para o Telegram
  };

  useEffect(() => {
    const { isNewSession, isReturning } = initSession();
    if (!isTrackingEnabled()) return;

    sessionEnded.current = false;

    if (isNewSession) {
      track("session_start", window.location.pathname, {
        meta: {
          returning: isReturning,
          device: window.innerWidth < 768 ? "mobile" : "desktop",
          referrer: document.referrer ? new URL(document.referrer).hostname : "",
          utm_source: new URLSearchParams(window.location.search).get("utm_source") || "",
        },
      });
    }

    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest?.("[data-track], a, button") as HTMLElement | null;
      if (!el) return;
      const tag = el.tagName.toLowerCase();
      const href = tag === "a" ? el.getAttribute("href") || "" : "";
      let outbound = false;
      try { outbound = !!href && new URL(href, window.location.href).hostname !== window.location.hostname; } catch {}
      
      track("click", window.location.pathname, {
        label: labelOf(el),
        meta: { tag, outbound, x: Math.round((e.clientX / window.innerWidth) * 100), y: Math.round(((e.clientY + window.scrollY) / Math.max(document.documentElement.scrollHeight, 1)) * 100) },
      });
    };

    const onScroll = () => {
      const h = document.documentElement;
      const pct = ((window.scrollY + window.innerHeight) / Math.max(h.scrollHeight, 1)) * 100;
      page.current.maxScroll = Math.max(page.current.maxScroll, Math.min(100, Math.round(pct / 10) * 10));
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        endSession(); // Usuário trocou de aba ou minimizou
      } else if (!sessionEnded.current) {
        page.current.resumedAt = Date.now();
      }
    };

    const onPageHide = () => endSession(); // Fechou a aba ou navegou pra fora
    const onBeforeUnload = () => endSession(); // Fechou o navegador

    document.addEventListener("click", onClick, true);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  // Quando muda de página (clique em um link interno)
  useEffect(() => {
    if (!isTrackingEnabled()) return;
    
    // Salva o tempo/scroll da página anterior
    flushPage();
    
    // Inicia a nova página
    page.current = { path: location.pathname, activeMs: 0, resumedAt: Date.now(), maxScroll: 0 };
    sessionEnded.current = false; 
    
    track("page_view", location.pathname);
  }, [location.pathname]);
}