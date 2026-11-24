// src/components/ProjectViews.tsx — alternador Lista/Grade e a lista minimalista de projetos.
// Usado na Home (Trabalhos Recentes) e na página Projetos, para os dois se comportarem igual.

import { motion } from "framer-motion";
import { ArrowUpRight, LayoutGrid, List } from "lucide-react";
import TransitionLink from "@/components/TransitionLink";
import type { Project } from "@/data/projects";
import { ESPIAN_SLUG } from "@/data/espian-project";

export type ViewMode = "grid" | "list";

const ease = [0.16, 1, 0.3, 1] as const;

const OPCOES = [
  { key: "list", label: "Ver em lista", Icon: List },
  { key: "grid", label: "Ver em grade", Icon: LayoutGrid },
] as const;

// Controle segmentado (estilo iOS): a "pílula" branca desliza entre as duas opções
export function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div role="group" aria-label="Modo de visualização" className="inline-flex items-center rounded-full bg-secondary p-1">
      {OPCOES.map(({ key, label, Icon }) => {
        const ativo = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={ativo}
            aria-label={label}
            title={label}
            className="relative flex h-9 w-11 items-center justify-center rounded-full"
          >
            {ativo && (
              <motion.span
                layoutId="view-toggle-pill"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
                className="absolute inset-0 rounded-full bg-background shadow-[0_1px_3px_rgba(0,0,0,0.14)]"
              />
            )}
            <Icon
              className={`relative h-4 w-4 transition-colors duration-300 ${ativo ? "text-foreground" : "text-muted-foreground"}`}
              strokeWidth={ativo ? 2.25 : 1.75}
            />
          </button>
        );
      })}
    </div>
  );
}

// Lista tipográfica: número, nome grande, linha fina entre os itens e seta que anda no hover
export function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <ol className="border-t border-border">
      {projects.map((p, i) => {
        const [nome, ...resto] = p.title.split(" — ");
        const subtitulo = resto.join(" — ") || p.client;
        const demo = !!p.demoUrl || p.slug === ESPIAN_SLUG;
        return (
          <li key={p.slug} className="border-b border-border">
            <TransitionLink to={`/projetos/${p.slug}`} className="group block">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.5, ease }}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 py-6 sm:gap-x-8 sm:py-9"
              >
                <span className="w-6 text-xs tabular-nums text-muted-foreground sm:w-10 sm:text-sm">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0">
                  <h3 className="text-2xl font-semibold leading-[1.05] tracking-[-0.03em] text-foreground transition-transform duration-500 ease-out group-hover:translate-x-2 sm:text-4xl md:text-5xl">
                    {nome}
                  </h3>
                  <p className="mt-2 truncate text-sm text-muted-foreground transition-transform duration-500 ease-out group-hover:translate-x-2">
                    {subtitulo}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground sm:gap-8">
                  {demo && (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                      <span className="hidden sm:inline">Demo</span>
                      <span className="sr-only sm:hidden">Demo ao vivo</span>
                    </span>
                  )}
                  <span className="hidden tabular-nums md:inline">{p.year}</span>
                  <ArrowUpRight className="h-5 w-5 text-foreground/25 transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-foreground sm:h-6 sm:w-6" />
                </div>
              </motion.div>
            </TransitionLink>
          </li>
        );
      })}
    </ol>
  );
}
