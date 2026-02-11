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
  category: "development" | "design";
  image: string;
  description: string;
  challenge: string;
  solution: string;
  technologies: string[];
}

export const allProjects: Project[] = [
  {
    slug: "foro-estudantil",
    title: "Foro Estudantil",
    client: "Foro Estudantil",
    location: "Remoto",
    services: "Design & Dev",
    year: "2024",
    category: "development",
    image: project1,
    description: "Plataforma de postagens de notícias voltada para o meio estudantil, conectando alunos e instituições através de conteúdo relevante e atualizado.",
    challenge: "Criar uma plataforma intuitiva que engajasse estudantes a consumir e produzir conteúdo jornalístico de qualidade dentro do ambiente acadêmico.",
    solution: "Desenvolvi uma plataforma completa com sistema de publicação, categorização de notícias, perfis de autores e feed personalizado, garantindo uma experiência moderna e acessível.",
    technologies: ["React", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL"],
  },
  {
    slug: "identidade-visual",
    title: "Identidade Visual",
    client: "StartupXYZ",
    location: "Remoto",
    services: "Design",
    year: "2024",
    category: "design",
    image: project2,
    description: "Criação de identidade visual completa para startup de tecnologia, incluindo logo, paleta de cores e guidelines de marca.",
    challenge: "Transmitir inovação e confiança através de uma identidade visual moderna que se destacasse no mercado de tecnologia.",
    solution: "Desenvolvimento de um sistema visual coeso com tipografia marcante, paleta vibrante e aplicações consistentes em todos os pontos de contato da marca.",
    technologies: ["Figma", "Illustrator", "Photoshop"],
  },
  {
    slug: "painel-analytics",
    title: "Painel de Analytics",
    client: "DataCo",
    location: "Rio de Janeiro",
    services: "Desenvolvimento",
    year: "2024",
    category: "development",
    image: project3,
    description: "Dashboard de analytics em tempo real para monitoramento de métricas de negócio e tomada de decisões baseada em dados.",
    challenge: "Apresentar grandes volumes de dados de forma clara e acionável, com atualizações em tempo real e performance otimizada.",
    solution: "Implementação de dashboard interativo com gráficos dinâmicos, filtros avançados e exportação de relatórios, tudo com atualização em tempo real via WebSockets.",
    technologies: ["React", "D3.js", "WebSockets", "Python", "FastAPI"],
  },
  {
    slug: "app-social",
    title: "App Social",
    client: "ConnectApp",
    location: "Curitiba",
    services: "Design",
    year: "2023",
    category: "design",
    image: project4,
    description: "Design de aplicativo social focado em conexões profissionais para jovens entrando no mercado de trabalho.",
    challenge: "Criar uma experiência que fosse profissional sem ser intimidadora para jovens em início de carreira.",
    solution: "Design com linguagem visual amigável, onboarding simplificado e features de networking gamificadas para incentivar interações genuínas.",
    technologies: ["Figma", "Prototyping", "User Research"],
  },
  {
    slug: "landing-page",
    title: "Landing Page",
    client: "AgencyPro",
    location: "Remoto",
    services: "Design & Dev",
    year: "2023",
    category: "development",
    image: project1,
    description: "Landing page de alta conversão para agência de marketing digital.",
    challenge: "Maximizar a taxa de conversão mantendo uma estética premium e diferenciada.",
    solution: "Página com animações envolventes, copy persuasivo e CTAs estrategicamente posicionados, resultando em aumento significativo na conversão.",
    technologies: ["React", "Framer Motion", "Tailwind CSS"],
  },
  {
    slug: "sistema-crm",
    title: "Sistema CRM",
    client: "SalesForce BR",
    location: "São Paulo",
    services: "Desenvolvimento",
    year: "2023",
    category: "development",
    image: project2,
    description: "Sistema CRM personalizado para gestão de relacionamento com clientes.",
    challenge: "Criar um CRM que fosse poderoso mas simples de usar, adaptado às necessidades específicas do cliente.",
    solution: "Sistema modular com pipeline visual, automações de e-mail e relatórios customizáveis, integrado com ferramentas existentes da empresa.",
    technologies: ["React", "Node.js", "MongoDB", "Redis"],
  },
  {
    slug: "site-portfolio",
    title: "Site Portfólio",
    client: "Creative Studio",
    location: "Florianópolis",
    services: "Design",
    year: "2023",
    category: "design",
    image: project3,
    description: "Portfólio digital para estúdio criativo com foco em experiência imersiva.",
    challenge: "Traduzir a criatividade do estúdio em uma experiência web que fosse uma extensão do próprio trabalho.",
    solution: "Site com transições cinematográficas, galeria interativa e microinterações que refletem a atenção aos detalhes do estúdio.",
    technologies: ["Figma", "After Effects", "React", "GSAP"],
  },
];
