import { useState, useEffect } from "react";
import TransitionLink from "@/components/TransitionLink";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import heroPortrait1 from "@/assets/hero-memoji.png";
import heroPortrait2 from "@/assets/hero-memoji-2.png";
import heroPortrait3 from "@/assets/hero-memoji-3.png";
import heroPortrait4 from "@/assets/hero-memoji-4.png";
import ProjectCard from "@/components/ProjectCard";
import WavyDivider from "@/components/WavyDivider";
import Footer from "@/components/Footer";
import { allProjects } from "@/data/projects";

type Filter = "all" | "development" | "data" | "ai";

const greetings = ["Hello", "Hola", "Bonjour", "Olá", "やあ"];
const heroPortraits = [heroPortrait1, heroPortrait2, heroPortrait3, heroPortrait4];
const ease = [0.16, 1, 0.3, 1] as const;

const homeProjects = allProjects.slice(0, 4);

const Home = () => {
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [portraitIndex, setPortraitIndex] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = filter === "all" ? allProjects : allProjects.filter((p) => p.category === filter);
  const devCount = allProjects.filter((p) => p.category === "development").length;
  const dataCount = allProjects.filter((p) => p.category === "data").length;
  const aiCount = allProjects.filter((p) => p.category === "ai").length;

  useEffect(() => {
    const interval = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % greetings.length);
      setPortraitIndex((prev) => (prev + 1) % heroPortraits.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="min-h-[100svh] relative flex flex-col justify-end lg:justify-center section-light overflow-hidden">
        {/* Mobile: Full-screen memoji background */}
        <div className="absolute inset-0 lg:hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={portraitIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              src={heroPortraits[portraitIndex]}
              alt="Weliton Dev"
              className="w-full h-full object-cover object-top"
            />
          </AnimatePresence>
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="container-wide w-full grid lg:grid-cols-2 gap-8 lg:gap-12 items-end lg:items-center relative z-10 pt-24 pb-12 lg:pb-16">
          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-4 lg:mb-6 relative" style={{ minHeight: '1.2em' }}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={greetingIndex}
                  initial={{ opacity: 0, y: 40, filter: "blur(10px)", scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
                  exit={{ opacity: 0, y: -40, filter: "blur(10px)", scale: 0.9 }}
                  transition={{
                    duration: 0.7,
                    ease: [0.16, 1, 0.3, 1],
                    opacity: { duration: 0.5 },
                  }}
                  className="block text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-foreground"
                >
                  {greetings[greetingIndex]}
                </motion.span>
              </AnimatePresence>
            </div>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-1">
              Front-end Developer Data Analyst & AI/LLM Engineer
            </p>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mb-8 lg:mb-10 leading-relaxed">
              Desenvolvo experiências web modernas com JavaScript e frameworks, 
              análise de dados e IA generativa. Transformando dados complexos 
              em interfaces inteligentes e intuitivas.
            </p>

            <TransitionLink
              to="/about"
              className="btn-primary-circle w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 text-xs sm:text-sm font-semibold"
            >
              Sobre mim
            </TransitionLink>
          </motion.div>

          {/* Right: photo (desktop only) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[3/4] max-w-md ml-auto shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.img
                  key={portraitIndex}
                  initial={{ opacity: 0, scale: 1.08, filter: "blur(12px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.95, filter: "blur(12px)" }}
                  transition={{
                    duration: 0.9,
                    ease: [0.16, 1, 0.3, 1],
                    opacity: { duration: 0.6 },
                    scale: { duration: 1.1 },
                  }}
                  src={heroPortraits[portraitIndex]}
                  alt="Weliton Dev"
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 z-10"
        >
          <ArrowDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </section>

      {/* Description section (mobile Snellenberg style) */}
      <section className="section-light py-16 sm:py-20 md:py-28">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-foreground leading-relaxed mb-6">
              A combinação da minha paixão por código, dados e inteligência artificial
              me permite criar soluções digitais que unem tecnologia de ponta a
              experiências intuitivas e impactantes.
            </p>
            <TransitionLink to="/about" className="text-sm link-underline text-foreground font-medium inline-flex items-center gap-2">
              Sobre mim →
            </TransitionLink>
          </motion.div>
        </div>
      </section>

      {/* Recent Work */}
      <section className="section-light py-16 sm:py-20 md:py-28">
        <div className="container-wide">
          {/* Mobile: Work-page inspired layout */}
          <div className="sm:hidden">
            <motion.h2
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease }}
              className="text-2xl font-bold text-foreground mb-6"
            >
              Projetos que combinam código, dados e IA
            </motion.h2>

            {/* Filters */}
            <div className="flex gap-3 mb-6 border-b border-border pb-3">
              {([["all", "Todos"], ["development", `Dev (${devCount})`], ["data", `Data (${dataCount})`], ["ai", `AI (${aiCount})`]] as const).map(
                ([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`text-sm font-medium transition-colors whitespace-nowrap py-1 ${
                      filter === key ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {filter === key && <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-1.5" />}
                    {label}
                  </button>
                )
              )}
            </div>

            {/* Compact grid */}
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((project, i) => (
                <TransitionLink key={project.slug} to={`/project/${project.slug}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.5, ease }}
                    className="group cursor-pointer"
                  >
                    <div className="relative overflow-hidden rounded-lg aspect-square bg-secondary mb-2">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />
                      <span className="absolute bottom-2 left-2 text-[10px] font-medium text-background/80 uppercase tracking-wider">
                        {project.services.length > 12 ? project.services.slice(0, 12) + "…" : project.services}
                      </span>
                    </div>
                    <h3 className="font-semibold text-xs text-foreground truncate">{project.title}</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {project.client} · {project.year}
                    </p>
                  </motion.div>
                </TransitionLink>
              ))}
            </div>

            <div className="mt-6 text-center">
              <TransitionLink to="/work" className="text-sm link-underline text-foreground font-medium">
                Ver todos os projetos →
              </TransitionLink>
            </div>
          </div>

          {/* Desktop: Original layout */}
          <div className="hidden sm:block">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 sm:mb-12">
              <div>
                <p className="text-xs sm:text-sm uppercase tracking-widest text-muted-foreground mb-2">Portfólio</p>
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-foreground">Trabalhos Recentes</h2>
              </div>
              <TransitionLink to="/work" className="text-sm link-underline text-foreground font-medium">
                Ver todos →
              </TransitionLink>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
              {homeProjects.map((project, i) => (
                <ProjectCard key={project.slug} title={project.title} category={project.services} image={project.image} slug={project.slug} index={i} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <WavyDivider direction="light-to-dark" />
      <Footer variant="dark" />
    </main>
  );
};

export default Home;
