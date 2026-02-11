import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";
import project4 from "@/assets/project-4.jpg";

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
}

export const allProjects: Project[] = [
  {
    slug: "foro-estudantil",
    title: "Foro Estudantil",
    client: "Foro Estudantil",
    location: "Remoto",
    services: "Web Development",
    year: "2024",
    category: "development",
    image: project1,
    description: "Plataforma de fórum estudantil desenvolvida com React e Vite. Interface moderna com componentes reutilizáveis, gerenciamento de estado avançado e integração com APIs. Sistema de postagens, comentários e notificações em tempo real.",
    challenge: "Criar uma plataforma intuitiva que engajasse estudantes a consumir e produzir conteúdo dentro do ambiente acadêmico, com performance e responsividade.",
    solution: "Desenvolvi uma aplicação fullstack com React e Vite, componentes reutilizáveis, gerenciamento de estado avançado e integração com APIs REST.",
    technologies: ["React", "Vite", "JavaScript/TypeScript", "HTML/CSS", "APIs REST"],
    result: "Aplicação fullstack com performance otimizada (Lighthouse 95+)",
  },
  {
    slug: "analise-llms-python",
    title: "Análise Inteligente com LLMs e Python",
    client: "Projeto Pessoal",
    location: "Remoto",
    services: "AI & Data Engineering",
    year: "2024",
    category: "ai",
    image: project2,
    description: "Pipeline de dados que integra modelos de linguagem para processamento de textos, análise de sentimentos e extração de insights. Utiliza Python com pandas, requests e integrações com APIs de LLM, com dashboard interativo para visualização.",
    challenge: "Processar grandes volumes de texto de forma automatizada, extraindo insights relevantes com precisão e velocidade.",
    solution: "Criei um pipeline de dados com Python que integra LLMs para análise de sentimentos e extração de insights, com dashboard interativo para visualização dos resultados.",
    technologies: ["Python", "LLMs (OpenAI/Llama)", "APIs", "Google Colab", "SQL"],
    result: "Automação de análise que reduz tempo de processamento em 80%",
  },
  {
    slug: "dashboard-bi",
    title: "Dashboard Interativo em Power BI & Looker Studio",
    client: "Projeto Corporativo",
    location: "Remoto",
    services: "Business Intelligence & Analytics",
    year: "2024",
    category: "data",
    image: project3,
    description: "Criação de dashboards interativos com análise em tempo real, KPIs visuais e relatórios automatizados. Integração de múltiplas fontes de dados com SQL e visualização de insights estratégicos.",
    challenge: "Consolidar dados de múltiplas fontes em dashboards claros e acionáveis para tomada de decisão estratégica.",
    solution: "Desenvolvi dashboards interativos com KPIs visuais, relatórios automatizados e integração de múltiplas fontes de dados via SQL.",
    technologies: ["Power BI", "Looker Studio", "SQL", "Python"],
    result: "Tomada de decisão baseada em dados com 95% de acurácia",
  },
  {
    slug: "app-assistente-ia",
    title: "Aplicação Web com Assistente IA Integrado",
    client: "Projeto Pessoal",
    location: "Remoto",
    services: "Full-Stack Development & AI",
    year: "2024",
    category: "ai",
    image: project4,
    description: "Aplicação web desenvolvida com React/Vite que integra modelos de linguagem para criar um assistente inteligente. Interface responsiva, backend robusto com APIs e integração seamless com LLMs.",
    challenge: "Integrar modelos de linguagem de forma fluida em uma aplicação web, mantendo performance e experiência do usuário otimizadas.",
    solution: "Criei uma aplicação React/Vite com assistente IA integrado, backend robusto com APIs e interface responsiva com UX otimizada.",
    technologies: ["React", "Vite", "JavaScript", "Python", "LLMs", "APIs REST"],
    result: "Plataforma funcional com capacidades de IA e UX otimizada",
  },
  {
    slug: "automacao-python",
    title: "Automação de Processos com Python & APIs",
    client: "Projeto Corporativo",
    location: "Remoto",
    services: "Data & Automation",
    year: "2024",
    category: "data",
    image: project1,
    description: "Scripts em Python para automação de tarefas repetitivas, scraping de dados, integração de APIs e processamento em lote. Inclui análise de dados e geração de relatórios automatizados.",
    challenge: "Eliminar tarefas manuais repetitivas que consumiam horas de trabalho semanalmente.",
    solution: "Desenvolvi scripts Python para automação de scraping, integração de APIs e processamento em lote, com geração de relatórios automatizados.",
    technologies: ["Python", "APIs", "SQL", "Automação", "Pandas"],
    result: "Redução de 15 horas semanais em tarefas manuais",
  },
];
