// src/pages/Admin.tsx — painel privado do EspIAn (rota /admin)
// Login (Supabase Auth) + fonte de dados real. Toda a parte visual está em
// src/components/espian/EspianPanel.tsx (a mesma que a demo pública usa com dados fictícios).
// Variáveis (Vercel + .env local):  VITE_SUPABASE_URL  e  VITE_SUPABASE_ANON_KEY  (chave "anon"/publishable).
// A segurança está no banco: só o e-mail definido em public.is_espian_admin() enxerga os dados (RLS).

import { useCallback, useEffect, useState } from "react";
import { EspianPanel, EspianShell, type Device, type DevicePatch, type Ev, type Session, type Source } from "@/components/espian/EspianPanel";

// Aceita a URL com ou sem "/rest/v1/" no final (a tela "Data API" do Supabase mostra com esse sufixo)
const SB_URL = (((import.meta as any).env?.VITE_SUPABASE_URL as string | undefined) ?? "")
  .trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
const SB_ANON = (((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined) ?? "").trim();
// Chave "publishable" (sb_publishable_…) ou "anon" legada (JWT, começa com eyJ). Qualquer outra coisa é engano de colagem.
const KEY_OK = /^(sb_publishable_|eyJ)/.test(SB_ANON);

/* ───────────────────────── Autenticação (Supabase Auth via REST) ───────────────────────── */

type Auth = { access_token: string; refresh_token: string; expires_at: number; email: string };
const AUTH_KEY = "espian_admin_auth";
let auth: Auth | null = null;
try { auth = JSON.parse(localStorage.getItem(AUTH_KEY) || "null"); } catch {}

function saveAuth(a: Auth | null) {
  auth = a;
  try { if (a) localStorage.setItem(AUTH_KEY, JSON.stringify(a)); else localStorage.removeItem(AUTH_KEY); } catch {}
}

async function authCall(grant: "password" | "refresh_token", body: Record<string, string>): Promise<Auth> {
  const r = await fetch(`${SB_URL}/auth/v1/token?grant_type=${grant}`, {
    method: "POST",
    headers: { apikey: SB_ANON, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j: any = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = String(j.error_description || j.msg || j.message || "");
    throw new Error(/invalid login/i.test(msg) ? "E-mail ou senha incorretos." : msg || "Não foi possível entrar.");
  }
  return {
    access_token: j.access_token,
    refresh_token: j.refresh_token,
    expires_at: j.expires_at ?? Math.floor(Date.now() / 1000) + (j.expires_in ?? 3600),
    email: j.user?.email ?? "",
  };
}

async function ensureFresh() {
  if (!auth) throw new Error("Sessão expirada");
  if (auth.expires_at - 60 > Date.now() / 1000) return;
  try {
    saveAuth(await authCall("refresh_token", { refresh_token: auth.refresh_token }));
  } catch {
    saveAuth(null);
    throw new Error("Sessão expirada");
  }
}

async function rest<T = any>(path: string, init: { method?: string; body?: unknown; prefer?: string } = {}): Promise<T> {
  await ensureFresh();
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    method: init.method ?? "GET",
    headers: {
      apikey: SB_ANON,
      Authorization: `Bearer ${auth!.access_token}`,
      "Content-Type": "application/json",
      ...(init.prefer ? { Prefer: init.prefer } : {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  if (r.status === 401) { saveAuth(null); throw new Error("Sessão expirada"); }
  const text = await r.text();
  if (!r.ok) throw new Error(`Erro ${r.status}: ${text.slice(0, 160)}`);
  return (text ? JSON.parse(text) : null) as T;
}


/* ───────────────────────── Fonte de dados real (Supabase) ───────────────────────── */

const TZ = "America/Fortaleza";
const dayKeyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const dayKey = (t: number | string | Date) => dayKeyFmt.format(new Date(t));

const supabaseSource: Source = {
  async list(days) {
    let filter = "";
    if (days > 0) {
      // Início do dia (fuso de Fortaleza/Teresina, UTC-3) há `days - 1` dias
      const since = Date.parse(dayKey(Date.now()) + "T00:00:00-03:00") - (days - 1) * 86400000;
      filter = `&started_at=gte.${encodeURIComponent(new Date(since).toISOString())}`;
    }
    const [sessions, devices] = await Promise.all([
      rest<Session[]>(`sessions?select=*${filter}&order=started_at.desc&limit=2000`),
      rest<Device[]>(`devices?select=*&order=last_seen.desc&limit=1000`),
    ]);
    return { sessions: sessions ?? [], devices: devices ?? [] };
  },
  events: (sid) =>
    rest<Ev[]>(`events?session_id=eq.${encodeURIComponent(sid)}&select=type,path,label,value,meta,created_at&order=id.asc&limit=1000`),
  history: (deviceId) =>
    rest<Session[]>(`sessions?device_id=eq.${encodeURIComponent(deviceId)}&select=*&order=started_at.desc&limit=100`),
  session: async (sid) => (await rest<Session[]>(`sessions?sid=eq.${encodeURIComponent(sid)}&select=*&limit=1`))?.[0] ?? null,
  saveDevice: async (id: string, patch: DevicePatch) =>
    (await rest<Device[]>(`devices?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: patch, prefer: "return=representation" }))?.[0] ?? null,
};

/* ───────────────────────── Entrada ───────────────────────── */

function Login({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: any) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try { saveAuth(await authCall("password", { email: email.trim(), password })); onDone(); }
    catch (x: any) { setErr(String(x.message || x)); }
    finally { setBusy(false); }
  };
  return (
    <div className="flex min-h-[100svh] items-center justify-center px-4 text-foreground">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 ea-glass p-6">
        <div>
          <h1 className="text-lg font-semibold">🕵️ EspIAn</h1>
          <p className="text-sm text-muted-foreground">Acesso restrito ao painel.</p>
        </div>
        <label className="block text-sm">E-mail
          <input type="email" required autoComplete="username" value={email} onChange={(e: any) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2" />
        </label>
        <label className="block text-sm">Senha
          <input type="password" required autoComplete="current-password" value={password} onChange={(e: any) => setPassword(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2" />
        </label>
        {err && <p role="alert" className="text-sm">⚠️ {err}</p>}
        <button type="submit" disabled={busy} className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">{busy ? "Entrando…" : "Entrar"}</button>
      </form>
    </div>
  );
}

// Ações do cabeçalho exclusivas do painel real
function AdminActions({ onLogout }: { onLogout: () => void }) {
  const [ignoring, setIgnoring] = useState(() => { try { return localStorage.getItem("espian_ignore") === "1"; } catch { return false; } });
  const toggleIgnore = () => {
    const next = !ignoring;
    try { if (next) localStorage.setItem("espian_ignore", "1"); else localStorage.removeItem("espian_ignore"); } catch {}
    setIgnoring(next);
  };
  return (
    <>
      <button type="button" onClick={toggleIgnore} className="rounded-md border border-border px-2 py-1 hover:bg-muted" title="Quando ligado, este navegador não gera visitas nem mensagens">
        {ignoring ? "✅ Este navegador é ignorado" : "Ignorar este navegador"}
      </button>
      <span className="hidden text-muted-foreground sm:inline">{auth?.email}</span>
      <button type="button" onClick={() => { saveAuth(null); onLogout(); }} className="rounded-md border border-border px-2 py-1 hover:bg-muted">Sair</button>
    </>
  );
}

function AdminInner() {
  const [authed, setAuthed] = useState<boolean>(!!auth);

  // O painel não deve aparecer em buscadores
  useEffect(() => {
    const prev = document.title;
    document.title = "EspIAn · painel";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => { document.title = prev; meta.remove(); };
  }, []);

  const logout = useCallback(() => setAuthed(false), []);

  if (!SB_URL || !SB_ANON || !KEY_OK) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center px-4 text-foreground">
        <div className="max-w-md ea-glass p-6 text-sm">
          <h1 className="mb-2 text-lg font-semibold">Falta configurar o painel</h1>
          <p className="text-muted-foreground">Defina na Vercel (e no <code>.env.local</code> da raiz do projeto) e faça um novo deploy:</p>
          {SB_ANON && !KEY_OK && (
            <p role="alert" className="mt-2">⚠️ O valor de <code>VITE_SUPABASE_ANON_KEY</code> não parece uma chave do Supabase. Use a chave <b>publishable</b> (<code>sb_publishable_…</code>) de Settings → API Keys.</p>
          )}
          <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-3 text-xs">{"VITE_SUPABASE_URL=https://xxxx.supabase.co\nVITE_SUPABASE_ANON_KEY=<chave anon / publishable>"}</pre>
        </div>
      </div>
    );
  }
  return authed
    ? <EspianPanel source={supabaseSource} deepLink onUnauthorized={logout} actions={<AdminActions onLogout={logout} />} />
    : <Login onDone={() => setAuthed(true)} />;
}

export default function Admin() {
  return (
    <EspianShell>
      <AdminInner />
    </EspianShell>
  );
}