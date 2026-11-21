import projectFreteAI from "@/assets/project-freteai.jpg";
import freteAIVideo from "@/assets/freteai-video.mp4"; 
import mockup1 from "@/assets/interamed-mockup-1.png";
import mockup2 from "@/assets/interamed-mockup-2.png";
import mockup3 from "@/assets/interamed-mockup-3.png";
import mockup4 from "@/assets/interamed-mockup-4.png";
import interamedVideo from "@/assets/interamed-video.mp4";
// --- IMPORTS DO NOVO PROJETO ---
import projectDelivery from "@/assets/delivery-dashboard.jpg"; 
import deliveryVideo from "@/assets/delivery-dashboard-video.mp4";

const projectInteraMed = mockup1;

export interface Project {
  slug: string;
  title: string;
  client: string;
  location: string;
  services: string;
  year: string;
  category: "development" | "design" | "data" | "ai";
  image: string;
  description: string;
  challenge: string;
  solution: string;
  technologies: string[];
  result?: string;
  demoUrl?: string;
  gallery?: string[];
  videoUrl?: string;
  deviceType?: "mobile" | "desktop";
}

export const allProjects: Project[] = [
  {
    slug: "frete-ai",
    title: "FreteAI — Sistema de Monitoramento Logístico com IA",
    client: "Projeto de Inovação Acadêmica",
    location: "Feira de Santana - Bahia",
    services: "Full-Stack Development - AI",
    year: "2025",
    category: "ai",
    image: projectFreteAI,
    description: "Sistema inteligente de monitoramento de fretes em tempo real com agente de IA integrado. Dashboard interativo com métricas, alertas com prioridade, mapa de rastreamento, timeline de eventos e previsões de entrega baseadas em IA.",
    challenge: "Técnicos de logística precisam monitorar dezenas de fretes simultaneamente, identificando atrasos, paradas prolongadas e desvios de rota rapidamente para evitar prejuízos.",
    solution: "Desenvolvi um sistema completo com dashboard de métricas em tempo real, alertas inteligentes categorizados por prioridade, mapa de rastreamento visual, e um agente de IA que sugere ações corretivas automaticamente.",
    technologies: ["React", "TypeScript", "Tailwind CSS", "Framer Motion", "Recharts", "shadcn/ui"],
    result: "Redução de 60% no tempo de resposta a incidentes e 40% menos entregas atrasadas",
    demoUrl: "/dashboard",
    videoUrl: freteAIVideo,
    deviceType: "desktop",
  },
  {
    slug: "interamed",
    title: "InteraMed — Assistente Clínico de Interações Medicamentosas",
    client: "Co-criação com João Victor Pinheiro Acadêmico de Enfermagem - UFPI",
    location: "Picos, Piauí",
    services: "Full-Stack Development - IA",
    year: "2026",
    category: "development",
    image: projectInteraMed,
    description: "Ferramenta mobile-first criada para a equipe de enfermagem na linha de frente. Auxilia na checagem rápida de interações medicamentosas complexas, gestão inteligente de horários de administração e leitura de receitas via IA, reduzindo erros graves no ambiente hospitalar.",
    challenge: "No ambiente hospitalar, especialmente no SUS, enfermeiros lidam com prescrições complexas (10 a 29 medicamentos por paciente). A checagem manual é lenta e suscetível a erros. A dor foi mapeada junto ao aluno de enfermagem João Victor Pinheiro UFPI do campus de Picos, unindo a vivência clínica dele com a minha experiência em tecnologia e no setor de saúde laboratorial.",
    solution: "Desenvolvi um MVP funcional com design premium e mobile-first. Utiliza React, TanStack Start e Tailwind. Integra a API da ANVISA, API da Open FDA e o Llama 4 Scout da (Groq) para OCR de receitas médicas. O motor de aprazamento inteligente sugere horários que respeitam a cronobiologia e fogem da passagem de plantão.",
    technologies: ["React", "TanStack Start", "Tailwind CSS", "Groq", "Llama 4 Scout", "APIs ANVISA", "Open FDA"],
    result: "MVP 100% funcional, com APIs de terceiros integradas, motor de regras clínicas e design validado para reduzir a fadiga cognitiva.",
    demoUrl: "https://interamed-five.vercel.app/",
    gallery: [mockup1, mockup2, mockup3, mockup4],
    videoUrl: interamedVideo,
    deviceType: "mobile",
  },
  // --- NOVO PROJETO ADICIONADO AQUI ---
  {
    slug: "delivery-insights",
    title: "Dashboard Insights — Análise Logística com IA",
    client: "Data Science & Analytics",
    location: "Brasil (Remoto)",
    services: "Data Engineering, Analytics & AI",
    year: "2026",
    category: "data",
    image: projectDelivery,
    description: "Uma ferramenta de inteligência operacional que responde a uma das perguntas mais complexas da logística urbana: 'Por que as entregas atrasam?'. O projeto analisa 50.000 registros de delivery, gera hipóteses baseadas em trânsito, clima e tempo de preparo, e utiliza IA para prescrever soluções de melhoria.",
    challenge: "Gestores de operações precisam identificar a 'causa raiz' dos atrasos em milhares de pedidos diários. Fazer isso manualmente é lento, subjetivo e suscetível a erros, impactando diretamente a satisfação do cliente e o custo operacional da empresa.",
    solution: "Desenvolvi um pipeline completo (ETL + Analytics) em Python e Pandas, visualizado em um dashboard interativo (Streamlit + Plotly). O grande diferencial é a integração com um LLM (Groq API), que atua como um consultor sênior: o usuário clica em um botão e a IA cruza os dados, valida as hipóteses e gera um relatório executivo com ações práticas de melhoria.",
    technologies: ["Python", "Streamlit", "Pandas", "Plotly", "Groq API"],
    result: "Dashboard 100% funcional que transforma dados brutos em um plano de ação executivo em segundos. Simula com perfeição a rotina de um Analista de Dados focado em otimização logística.",
    demoUrl: "https://projeto-delivery-data-gbbnwmrsymsjc8ev2hjudc.streamlit.app/?embed=true",
    videoUrl: deliveryVideo,
    deviceType: "desktop",
  },
];