// src/data/espian-project.ts — entrada do EspIAn no catálogo de projetos
// Mantém o projeto separado de `src/data/projects.ts` para não mexer na sua lista atual:
// `catalog` = EspIAn (primeiro) + todos os projetos existentes. Use `catalog` no lugar de `allProjects`
// em Work.tsx e ProjectDetail.tsx (já está assim nas versões entregues).

import { allProjects, type Project } from "@/data/projects";

export const ESPIAN_SLUG = "espian";

// `as Project`: se o seu tipo tiver campos extras obrigatórios que eu não conheço, preencha-os aqui.
export const espianProject = {
  slug: ESPIAN_SLUG,
  title: "EspIAn — Telemetria e Alertas do Portfólio",
  client: "Projeto próprio",
  location: "Picos, PI",
  year: "2026",
  services: "Automação & Dados",
  category: "data",
  deviceType: "desktop",
  image: "",
  description:
    "Sistema de monitoramento que eu mesmo construí para saber quem visita o meu portfólio e o que a pessoa fez lá. " +
    "Cada visita vira um relatório único no Telegram e fica registrada em um painel privado, com reconhecimento de aparelhos que voltam, " +
    "linha do tempo de ações e gráficos de visitas.",
  challenge:
    "Ferramentas prontas de métricas mostram números agregados, mas não respondem perguntas práticas: esse aparelho já esteve aqui antes? " +
    "Quem abriu a demonstração de um projeto? Ao mesmo tempo, o portfólio é público, então o painel real precisa ficar trancado " +
    "e a vitrine do projeto não pode expor dados de ninguém.",
  solution:
    "Um rastreador leve no front-end envia os eventos para uma função serverless na Vercel, que grava no Supabase (PostgreSQL com segurança por linha) " +
    "e avisa pelo Telegram em tempo real. O reconhecimento de aparelhos combina cookie assinado, identificação do navegador e rede, " +
    "guardando o IP apenas como hash. O painel usa login do Supabase Auth; a demonstração desta página roda o mesmo painel com dados 100% fictícios.",
  result:
    "Cada visita gera um único relatório no Telegram, editado no mesmo balão, e o painel privado mostra o histórico por aparelho. " +
    "Esta página exibe a versão pública, com dados inventados e nenhum visitante real.",
  technologies: ["React", "TypeScript", "Vercel Functions", "Supabase", "PostgreSQL", "Telegram Bot API", "Tailwind CSS", "Framer Motion"],
} as unknown as Project;

/** Catálogo completo: EspIAn primeiro, depois os projetos já existentes (sem duplicar o slug). */
export const catalog: Project[] = [espianProject, ...allProjects.filter((p) => p.slug !== ESPIAN_SLUG)];