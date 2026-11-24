import { useState, useEffect } from "react";
import TransitionLink from "@/components/TransitionLink";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown } from "lucide-react";
import heroPortrait1 from "@/assets/optimized/hero-memoji.webp";
import heroPortrait2 from "@/assets/optimized/hero-memoji-2.webp";
import heroPortrait3 from "@/assets/optimized/hero-memoji-3.webp";
import heroPortrait4 from "@/assets/optimized/hero-memoji-4.webp";
import WavyDivider from "@/components/WavyDivider";
import Footer from "@/components/Footer";
import { catalog, ESPIAN_SLUG } from "@/data/espian-project";
import { ProjectMockup } from "@/components/ProjectMockup";
import { EspianCardPreview } from "@/components/espian/EspianCardPreview";
import { ViewToggle, ProjectList, type ViewMode } from "@/components/ProjectViews";

type Filter = "all" | "development" | "data" | "ai";

const greetings = ["Hello", "Hola", "Bonjour", "Olá", "やあ"];
const heroPortraits = [heroPortrait1, heroPortrait2, heroPortrait3, heroPortrait4];
const ease = [0.16, 1, 0.3, 1] as const;

const Home = () => {
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [portraitIndex, setPortraitIndex] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<ViewMode>("grid");

  // `catalog` = EspIAn + seus projetos (src/data/espian-project.ts)
  const filtered = filter === "all" ? catalog : catalog.filter((p) => p.category === filter);
  const devCount = catalog.filter((p) => p.category === "development").length;
  const dataCount = catalog.filter((p) => p.category === "data").length;
  const aiCount = catalog.filter((p) => p.category === "ai").length;

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
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent" style={{ backgroundSize: '100% 70%', backgroundPosition: 'bottom', backgroundRepeat: 'no-repeat' }} />
        </div>

        <div className="container-wide w-full grid lg:grid-cols-2 gap-8 lg:gap-12 items-end lg:items-center relative z-10 pt-24 pb-12 lg:pb-16">
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
                  className="block text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-semibold tracking-[-0.035em] leading-[1.05] text-foreground"
                >
                  {greetings[greetingIndex]}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
              <span className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs sm:text-sm font-semibold tracking-wide">
                AI Builder
              </span>
              <span className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-foreground/5 text-foreground/80 border border-border text-xs sm:text-sm font-medium">
                Full-Stack Dev
              </span>
              <span className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-foreground/5 text-foreground/80 border border-border text-xs sm:text-sm font-medium">
                Data Analyst
              </span>
            </div>

            <p className="text-base sm:text-lg text-muted-foreground max-w-md mb-8 lg:mb-10 leading-relaxed">
              Construo automações e agentes com IA e as interfaces para usá-los no dia a dia. Os projetos abaixo funcionam de verdade, e em cada um eu conto o que aprendi.</p>

            <TransitionLink
              to="/sobre"
              className="btn-primary-circle w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 text-xs sm:text-sm font-semibold"
            >
              Sobre mim
            </TransitionLink>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-[32px] overflow-hidden aspect-[3/4] max-w-md ml-auto shadow-[0_40px_80px_-30px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
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

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 z-10"
        >
          <ArrowDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </section>

      <section className="section-light py-16 sm:py-20 md:py-28">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-[-0.025em] text-foreground leading-[1.25] text-balance mb-6">
              Gosto de tirar trabalho repetitivo das pessoas: automações, agentes de IA e painéis que mostram o que importa. Aqui estão alguns projetos, do app clínico ao monitor que roda neste próprio site.</p>
            <TransitionLink to="/sobre" className="text-sm link-underline text-foreground font-medium inline-flex items-center gap-2">
              Sobre mim →
            </TransitionLink>
          </motion.div>
        </div>
      </section>

      {/* Recent Work */}
      <section className="section-light py-16 sm:py-20 md:py-28">
        <div className="container-wide">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
            <div>
              <p className="text-xs sm:text-sm uppercase tracking-widest text-muted-foreground mb-2">Portfólio</p>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-semibold tracking-[-0.035em] text-foreground">Trabalhos Recentes</h2>
            </div>
            
            <ViewToggle value={view} onChange={setView} />
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2 mb-10">
            {([["all", "Todos"], ["development", `Dev (${devCount})`], ["data", `Data (${dataCount})`], ["ai", `AI (${aiCount})`]] as const).map(
              ([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`text-sm font-medium transition-all duration-300 rounded-full px-4 py-1.5 ${
                    filter === key ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>

          {/* Grade ou lista */}
          {view === "list" ? (
            <ProjectList projects={filtered} />
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
            {filtered.map((project, i) => (
              <TransitionLink key={project.slug} to={`/projetos/${project.slug}`} className="group block">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6, ease }}
                  className="flex flex-col h-full"
                >
                  {/* Moldura do Card */}
                  <div className="project-frame relative overflow-hidden p-4 sm:p-8 flex items-center justify-center aspect-[4/3] mb-5">
                    
                    {/* Tag Demo Live */}
                    {(project.demoUrl || project.slug === ESPIAN_SLUG) && (
                      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 glass rounded-full border border-border/70 shadow-sm text-xs font-medium text-foreground">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Demo Live
                      </div>
                    )}

                    <div className="w-full h-full flex items-center justify-center">
                       {project.slug === ESPIAN_SLUG ? (
                         <EspianCardPreview />
                       ) : (
                         <ProjectMockup project={project} isDetail={false} />
                       )}
                    </div>
                  </div>

                  {/* Informações */}
                  <div className="flex flex-col gap-2 px-1">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-semibold tracking-tight text-lg sm:text-xl text-foreground leading-tight group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      {project.services && (
                        <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-secondary text-muted-foreground text-[10px] font-medium whitespace-nowrap">
                          {project.services}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-snug">
                      {project.client} · {project.location}
                    </p>
                  </div>
                </motion.div>
              </TransitionLink>
            ))}
          </div>
          )}
        </div>
      </section>

      <WavyDivider direction="light-to-dark" />
      <Footer variant="dark" />
    </main>
  );
};

export default Home;