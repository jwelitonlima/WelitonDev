import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import TransitionLink from "@/components/TransitionLink";
import WavyDivider from "@/components/WavyDivider";
import Footer from "@/components/Footer";
import { allProjects } from "@/data/projects";

const ease = [0.16, 1, 0.3, 1] as const;

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const project = allProjects.find((p) => p.slug === slug);

  if (!project) {
    return (
      <main className="section-light min-h-[100svh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Projeto não encontrado</h1>
          <TransitionLink to="/work" className="text-sm link-underline text-foreground font-medium">
            ← Voltar aos trabalhos
          </TransitionLink>
        </div>
      </main>
    );
  }

  return (
    <main>
      <section className="section-light pt-28 sm:pt-32 pb-16 sm:pb-20">
        <div className="container-wide">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <TransitionLink
              to="/work"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 sm:mb-12"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar aos trabalhos
            </TransitionLink>
          </motion.div>

          {/* Title & meta */}
          <div className="grid lg:grid-cols-[1fr_320px] gap-8 lg:gap-16 mb-10 sm:mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight"
            >
              {project.title}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 0.15, ease }}
              className="flex flex-wrap gap-x-8 gap-y-4 text-sm"
            >
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">Cliente</p>
                <p className="text-foreground font-medium">{project.client}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">Serviços</p>
                <p className="text-foreground font-medium">{project.services}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">Ano</p>
                <p className="text-foreground font-medium">{project.year}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">Local</p>
                <p className="text-foreground font-medium">{project.location}</p>
              </div>
            </motion.div>
          </div>

          {/* Hero image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.2, ease }}
            className="rounded-2xl overflow-hidden mb-16 sm:mb-24 aspect-[16/9] bg-secondary"
          >
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Description */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 mb-16 sm:mb-24">
            <motion.div
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease }}
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Sobre o projeto</p>
              <p className="text-lg sm:text-xl text-foreground leading-relaxed">
                {project.description}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1, ease }}
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Tecnologias</p>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-4 py-2 rounded-full bg-secondary text-foreground text-sm font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Challenge, Solution & Result */}
          <div className="grid lg:grid-cols-2 gap-px bg-border rounded-xl overflow-hidden mb-16 sm:mb-24">
            <motion.div
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease }}
              className="bg-background p-8 sm:p-12"
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">O Desafio</p>
              <p className="text-base sm:text-lg text-foreground leading-relaxed">
                {project.challenge}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1, ease }}
              className="bg-background p-8 sm:p-12"
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">A Solução</p>
              <p className="text-base sm:text-lg text-foreground leading-relaxed">
                {project.solution}
              </p>
            </motion.div>

            {project.result && (
              <motion.div
                initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2, ease }}
                className="bg-background p-8 sm:p-12 lg:col-span-2"
              >
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Resultado</p>
                <p className="text-base sm:text-lg text-primary font-semibold leading-relaxed">
                  {project.result}
                </p>
              </motion.div>
            )}
          </div>

          {/* Next project */}
          {(() => {
            const currentIndex = allProjects.findIndex((p) => p.slug === slug);
            const nextProject = allProjects[(currentIndex + 1) % allProjects.length];
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease }}
                className="text-center"
              >
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Próximo projeto</p>
                <TransitionLink
                  to={`/project/${nextProject.slug}`}
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground hover:text-primary transition-colors"
                >
                  {nextProject.title} →
                </TransitionLink>
              </motion.div>
            );
          })()}
        </div>
      </section>

      <WavyDivider direction="light-to-dark" />
      <Footer variant="dark" />
    </main>
  );
};

export default ProjectDetail;
