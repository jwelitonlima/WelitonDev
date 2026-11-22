// EspIAn 🕵️ — telemetria própria. Sem IP, sem fingerprint, sem dado pessoal.
export const ENDPOINT = "/api/track";
const SID_KEY = "pf_sid"; // sessão (some ao fechar a aba)
const VID_KEY = "pf_vid"; // visitante (ID aleatório)
const OWNER_KEY = "pf_owner";
const MAX_EVENTS_PER_SESSION = 400; // trava anti-loop

export type EventType =
  | "session_start"
  | "page_view"
  | "page_leave"
  | "click"
  | "rage_click"
  | "scroll_depth"
  | "vital"
  | "video"
  | "fetch"
  | "resource_error"
  | "copy"
  | "error"
  | "function";

export type Meta = Record<string, string | number | boolean>;

interface Extra {
  label?: string;
  value?: number;
  meta?: Meta;
}

let sid = "";
let vid = "";
let sent = 0;

const rid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

const read = (s: Storage, k: string) => {
  try { return s.getItem(k); } catch { return null; }
};
const write = (s: Storage, k: string, v: string) => {
  try { s.setItem(k, v); } catch { /* ignora */ }
};

/** Abra o site com ?owner=1 para NÃO contar suas visitas (?owner=0 volta a contar). */
function checkOwner() {
  const p = new URLSearchParams(window.location.search).get("owner");
  if (p === "1") write(localStorage, OWNER_KEY, "1");
  if (p === "0") { try { localStorage.removeItem(OWNER_KEY); } catch { /* ignora */ } }
}

export function isTrackingEnabled(): boolean {
  if (import.meta.env.DEV) return false;
  return read(localStorage, OWNER_KEY) !== "1";
}

export function initSession() {
  checkOwner();
  let isNewSession = false;
  let isReturning = true;

  sid = read(sessionStorage, SID_KEY) || "";
  if (!sid) {
    sid = rid();
    write(sessionStorage, SID_KEY, sid);
    isNewSession = true;
  }

  vid = read(localStorage, VID_KEY) || "";
  if (!vid) {
    vid = rid();
    write(localStorage, VID_KEY, vid);
    isReturning = false;
  }

  return { isNewSession, isReturning };
}

export function track(type: EventType, path: string, extra: Extra = {}) {
  if (!isTrackingEnabled() || !sid) return;
  if (sent >= MAX_EVENTS_PER_SESSION) return;
  sent++;

  const body = JSON.stringify({ sid, vid, events: [{ type, path, ...extra }] });

  try {
    const ok = navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: "application/json" }));
    if (ok) return;
  } catch { /* cai para o fetch */ }

  fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

/**
 * Envolve uma função para registrar sucesso, falha e duração.
 * Exemplo: const analisar = tracked("analisar_fretes", analisarFretes);
 */
export function tracked<A extends unknown[], R>(name: string, fn: (...args: A) => Promise<R>) {
  return async (...args: A): Promise<R> => {
    const start = performance.now();
    try {
      const result = await fn(...args);
      track("function", window.location.pathname, {
        label: name,
        value: Math.round(performance.now() - start),
        meta: { ok: true },
      });
      return result;
    } catch (err) {
      track("function", window.location.pathname, {
        label: name,
        value: Math.round(performance.now() - start),
        meta: { ok: false },
      });
      throw err;
    }
  };
}