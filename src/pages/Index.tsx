import { useState, useEffect } from "react";
import TransitionLink from "@/components/TransitionLink";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown } from "lucide-react";
import heroPortrait1 from "@/assets/hero-memoji.png";
import heroPortrait2 from "@/assets/hero-memoji-2.png";
import heroPortrait3 from "@/assets/hero-memoji-3.png";
import heroPortrait4 from "@/assets/hero-memoji-4.png";
import ProjectCard from "@/components/ProjectCard";
import WavyDivider from "@/components/WavyDivider";
import Footer from "@/components/Footer";
import { allProjects } from "@/data/projects";

const greetings = ["Hello", "Hola", "Bonjour", "Olá", "やあ"];
const heroPortraits = [heroPortrait1, heroPortrait2, heroPortrait3, heroPortrait4];

const homeProjects = allProjects.slice(0, 4);

const Home = () => {
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [portraitIndex, setPortraitIndex] = useState(0);

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
            <div className="mb-4 lg:mb-6 h-[1.2em] text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight relative overflow-hidden">
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
                  className="block text-foreground"
                >
                  {greetings[greetingIndex]}
                </motion.span>
              </AnimatePresence>
            </div>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-1">
              Designer & Desenvolvedor Freelance
            </p>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mb-8 lg:mb-10 leading-relaxed">
              Ajudando marcas a se destacarem no mundo digital através de experiências
              web únicas e produtos digitais de alto nível.
            </p>

            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="relative w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 group"
            >
              {/* Rotating border */}
              <div className="absolute inset-0 rounded-full animate-[spin_6s_linear_infinite] opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-full h-full rounded-full" style={{
                  background: "conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)), transparent 60%)",
                  padding: "2px",
                }}>
                  <div className="w-full h-full rounded-full bg-primary" />
                </div>
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {/* Button */}
              <TransitionLink
                to="/about"
                className="absolute inset-[2px] rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs sm:text-sm font-semibold z-10"
              >
                Sobre mim
              </TransitionLink>
            </motion.div>
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
              A combinação da minha paixão por design, código e interação me posiciona
              em um lugar único no mundo do web design.
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
      </section>

      <WavyDivider direction="light-to-dark" />
      <Footer variant="dark" />
    </main>
  );
};

export default Home;
