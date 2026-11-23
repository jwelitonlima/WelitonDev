export const ENDPOINT = "/api/collect";

const SID_KEY = "espian_sid";
const VID_KEY = "espian_vid";
const SESSION_TTL = 30 * 60 * 1000; 

type EventPayload = { type: string; path: string; label?: string; value?: number; meta?: any; };
type Queued = EventPayload & { ts: number };

let sid = "";
let vid = "";
let queue: Queued[] = [];
let timer: any = null;
let enabled = true;
let flushing = false;

function randomId(len = 24): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  const arr = new Uint8Array(len);
  (globalThis.crypto ?? window.crypto).getRandomValues(arr);
  for (let i = 0; i < len; i++) out += chars[arr[i] % chars.length];
  return out;
}
function safeGet(key: string): string { try { return localStorage.getItem(key) || ""; } catch { return ""; } }
function safeSet(key: string, val: string) { try { localStorage.setItem(key, val); } catch {} }
function isBot(): boolean { return /bot|crawl|spider|slurp|headless|lighthouse/i.test(navigator.userAgent || ""); }

export function isTrackingEnabled() { return enabled; }

export function initSession() {
  if (typeof window === "undefined" || isBot()) { enabled = false; return { isNewSession: false, isReturning: false }; }
  vid = safeGet(VID_KEY);
  const isReturning = !!vid;
  if (!vid) { vid = randomId(); safeSet(VID_KEY, vid); }
  const now = Date.now();
  const existing = safeGet(SID_KEY);
  const isNewSession = !existing || now - Number(safeGet(SID_KEY + "_at") || 0) > SESSION_TTL;

  if (isNewSession) {
    sid = randomId(); safeSet(SID_KEY, sid); safeSet(SID_KEY + "_at", String(now));
  } else {
    sid = existing;
  }

  if (!timer) {
    // Envia a cada 1 segundo para garantir que os eventos cheguem quase em tempo real
    timer = setInterval(() => { if (queue.length) flush(); }, 1000);
  }
  return { isNewSession, isReturning };
}

export function track(type: string, path: string, opts: { label?: string; value?: number; meta?: any } = {}) {
  if (!enabled || !sid) return;
  queue.push({ type, path, ...opts, ts: Date.now() });
  if (queue.length >= 10) flush(); // Envio imediato se encher o buffer
}

export async function flush(): Promise<void> {
  if (flushing || !queue.length || !sid) return;
  flushing = true;
  const batch = queue.splice(0, 20);
  try {
    await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sid, vid, events: batch }),
      keepalive: true,
    });
  } catch {
    queue = batch.concat(queue); // Se falhar (offline), volta pra fila
  } finally {
    flushing = false;
  }
}

/** Disparo de emergência: síncrono, o navegador não pode cancelar */
export function flushNow() {
  if (!sid || !queue.length) return;
  const batch = queue.splice(0, 20);
  const payload = JSON.stringify({ sid, vid, events: batch });
  
  try {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", ENDPOINT, false); // false = SÍNCRONO (trava o navegador por 1ms, mas entrega garantido)
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(payload);
  } catch {
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: "application/json" }));
      }
    } catch {}
  }
}