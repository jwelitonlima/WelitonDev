import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import heroPortrait from "@/assets/hero-memoji.png";
import ProjectCard from "@/components/ProjectCard";
import WavyDivider from "@/components/WavyDivider";
import Footer from "@/components/Footer";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";
import project4 from "@/assets/project-4.jpg";

const greetings = ["Hello", "Hola", "Bonjour", "Olá", "こんにちは"];

const projects = [
  { title: "Plataforma E-commerce", category: "Desenvolvimento", image: project1 },
  { title: "App Gerenciador de Tarefas", category: "Design & Dev", image: project2 },
  { title: "Painel de Analytics", category: "Desenvolvimento", image: project3 },
  { title: "App Social", category: "Design", image: project4 },
];

const Home = () => {
  const [greetingIndex, setGreetingIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % greetings.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="min-h-screen relative flex items-center section-light overflow-hidden">
        <div className="container-wide w-full grid lg:grid-cols-2 gap-12 items-center pt-24 pb-16">
          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6">
              <motion.span
                key={greetingIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-foreground"
              >
                {greetings[greetingIndex]}
              </motion.span>
            </div>

            <p className="text-lg md:text-xl text-muted-foreground mb-2">
              Designer & Desenvolvedor Freelance
            </p>
            <p className="text-muted-foreground max-w-md mb-10 leading-relaxed">
              Ajudando marcas a se destacarem no mundo digital através de experiências
              web únicas e produtos digitais de alto nível.
            </p>

            <Link
              to="/about"
              className="btn-primary-circle w-36 h-36 text-sm font-semibold"
            >
              Sobre mim
            </Link>
          </motion.div>

          {/* Right: photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[3/4] max-w-md ml-auto shadow-2xl">
              <img
                src={heroPortrait}
                alt="Weliton Dev"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Sidebar label */}
            <div className="absolute -right-6 top-1/2 -translate-y-1/2 rotate-90 origin-center">
              <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground whitespace-nowrap">
                Localizado no Brasil
              </span>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <ArrowDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </section>

      {/* Recent Work */}
      <section className="section-light py-20 md:py-32">
        <div className="container-wide">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">Portfólio</p>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground">Trabalhos Recentes</h2>
            </div>
            <Link to="/work" className="text-sm link-underline text-foreground font-medium">
              Ver todos →
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project, i) => (
              <ProjectCard key={project.title} {...project} index={i} />
            ))}
          </div>
        </div>
      </section>

      <WavyDivider direction="light-to-dark" />
      <Footer variant="dark" />
    </main>
  );
};

export default Home;
