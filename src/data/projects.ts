import projectFreteAI from "@/assets/project-freteai.jpg";
import mockup1 from "@/assets/optimized/interamed-mockup-1.webp";
import mockup2 from "@/assets/optimized/interamed-mockup-2.webp";
import mockup3 from "@/assets/optimized/interamed-mockup-3.webp";
import mockup4 from "@/assets/optimized/interamed-mockup-4.webp";
import interamedVideo from "@/assets/optimized/interamed-video-web.mp4";
import projectDelivery from "@/assets/delivery-dashboard.jpg"; 
import deliveryVideo from "@/assets/optimized/delivery-dashboard-video-web.mp4";
import freteAiVideo from "@/assets/optimized/frete-ai-web.mp4"; 

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
  repoUrl?: string;
  gallery?: string[];
  videoUrl?: string;
  deviceType?: "mobile" | "desktop";
}

export const allProjects: Project[] = [
  {
    slug: "frete-ai",
    title: "FreteAI — Agente de IA para Monitoramento de Fretes",
    client: "Projeto de Inovação Acadêmica",
    location: "Feira de Santana - Bahia",
    services: "IA, Automação & Full-Stack",
    year: "2025",
    category: "ai",
    image: projectFreteAI,
    description: "Agente autônomo no n8n que analisa o risco de atraso de fretes e avisa o gestor pelo Telegram. Um dashboard em React mostra o diagnóstico e a ação sugerida para cada frete. É um projeto acadêmico feito com dados públicos do Kaggle: não tem usuários reais, mas funciona de ponta a ponta.",
    challenge: "Quem acompanha dezenas de fretes ao mesmo tempo precisa saber quais estão em risco antes de o atraso acontecer. O maior desafio técnico foi a previsibilidade da IA: um modelo solto responde num formato diferente a cada chamada, e o n8n não consegue ler uma resposta que muda.",
    solution: "O fluxo no n8n envia os dados de cada frete a um LLM (Groq) e recebe um diagnóstico de risco. Para o fluxo não quebrar, ajustei o prompt de sistema para exigir um JSON estrito e usei o parâmetro response_format da Groq, assim o n8n faz o parse sempre do mesmo jeito. Quando há risco, o gestor recebe o alerta no Telegram, e o dashboard em React mostra o diagnóstico e a ação sugerida.",
    technologies: ["n8n", "Groq", "JSON estruturado", "Telegram", "React", "TypeScript", "Tailwind CSS", "Recharts"],
    result: "Fluxo completo de ponta a ponta: o n8n analisa, a IA devolve um diagnóstico em JSON válido e o alerta chega ao gestor pelo Telegram. Dados públicos do Kaggle, sem usuários reais. O fluxo roda em um período de teste gratuito do n8n Cloud, então o botão de análise da demo pode estar offline quando você ler isto; o vídeo e o código mostram o agente funcionando.",
    demoUrl: "/dashboard",
    repoUrl: "https://github.com/jwelitonlima/frete-ai-agent",
    videoUrl: freteAiVideo, 
    deviceType: "desktop",
  },
  {
    slug: "interamed",
    title: "InteraMed — Assistente Clínico de Interações Medicamentosas",
    client: "Co-criação com João Victor Pinheiro Acadêmico de Enfermagem - UFPI",
    location: "Picos, Piauí",
    services: "IA & Full-Stack",
    year: "2026",
    category: "development",
    image: projectInteraMed, // <-- Usa o mockup1 como capa
    description: "App mobile-first que ajuda a enfermagem a checar interações entre medicamentos em prescrições grandes. A IA lê a receita, mas quem decide a gravidade de cada interação são regras clínicas e a base do OpenFDA, não o modelo. Também sugere horários de administração (aprazamento) que evitam a troca de plantão.",
    challenge: "No SUS, a enfermagem lida com prescrições de até 29 medicamentos por paciente, e a checagem manual é lenta e sujeita a erro. A dor veio de uma conversa com o João Victor, acadêmico de enfermagem da UFPI em Picos, que unia a vivência clínica dele com a minha experiência em tecnologia e no setor de saúde laboratorial.",
    solution: "Desenvolvi um MVP em React e TanStack Start. O Llama 4 Scout (Groq) faz o OCR da receita, mas, por ser saúde, não deixei o modelo decidir a gravidade: isso vem de regras, da base do OpenFDA e de um dicionário próprio de medicamentos e sinônimos. Aprendi o motivo na prática: o modelo traduzia 'Dipirona' para 'Dipyrone' e devolvia 'Amiodarona' quando minha base só tinha 'Cloridrato de Amiodarona', e o sistema descartava o dado sem avisar o enfermeiro. Resolvi proibindo traduções no prompt e trocando a busca exata por fuzzy matching com dicionário de sinônimos.",
    technologies: ["React", "TanStack Start", "Tailwind CSS", "Groq", "Llama 4 Scout", "Fuzzy matching", "OpenFDA", "Dicionário próprio"],
    result: "MVP funcional, com a base do OpenFDA, um dicionário próprio e um motor de regras clínicas, feito a partir da dor real relatada por um acadêmico de enfermagem.",
    demoUrl: "https://interamed-five.vercel.app/",
    repoUrl: "https://github.com/jwelitonlima/interamed-v-2-0",
    gallery: [mockup1, mockup2, mockup3, mockup4],
    videoUrl: interamedVideo,
    deviceType: "mobile",
  },
  {
    slug: "delivery-insights",
    title: "Dashboard Insights — Análise Logística com IA",
    client: "Data Science & Analytics",
    location: "Brasil (Remoto)",
    services: "Dados & IA",
    year: "2026",
    category: "data",
    image: projectDelivery,
    description: "Dashboard que tenta responder 'Por que as entregas atrasam?'. Analisa 50.000 registros públicos de delivery (dataset do Kaggle), levanta hipóteses sobre trânsito, clima e tempo de preparo, e usa um LLM para sugerir ações de melhoria.",
    challenge: "Achar a causa raiz dos atrasos em milhares de pedidos olhando planilha é lento e subjetivo. A ideia foi automatizar a análise e deixar a conclusão em linguagem que um gestor consegue ler.",
    solution: "Montei o pipeline em Python e Pandas (limpeza, tradução e tratamento dos dados) e um dashboard interativo em Streamlit e Plotly. O botão de relatório envia os resultados a um LLM (Groq API), que cruza os dados, valida as hipóteses e escreve um relatório executivo com ações práticas.",
    technologies: ["Python", "Pandas", "Streamlit", "Plotly", "Groq API", "ETL"],
    result: "Dashboard funcional que transforma dados brutos em um relatório executivo com ações de melhoria em segundos. Feito com dados públicos, como estudo de análise de dados.",
    demoUrl: "https://projeto-delivery-data-gbbnwmrsymsjc8ev2hjudc.streamlit.app/?embed=true",
    repoUrl: "https://github.com/jwelitonlima/projeto-delivery-data",
    videoUrl: deliveryVideo,
    deviceType: "desktop",
  },
];
