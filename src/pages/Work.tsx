import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, List, ArrowUpRight } from "lucide-react";
import TransitionLink from "@/components/TransitionLink";
import WavyDivider from "@/components/WavyDivider";
import Footer from "@/components/Footer";
import { allProjects } from "@/data/projects";

type Filter = "all" | "development" | "data" | "ai";

const ease = [0.16, 1, 0.3, 1] as const;

const WorkPage = () => {
  const [filter, setFilter] = useState<Filter>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = filter === "all" ? allProjects : allProjects.filter((p) => p.category === filter);
  const devCount = allProjects.filter((p) => p.category === "development").length;
  const dataCount = allProjects.filter((p) => p.category === "data").length;
  const aiCount = allProjects.filter((p) => p.category === "ai").length;

  return (
    <main>
      <section className="section-light pt-28 sm:pt-32 pb-16 sm:pb-20">
        <div className="container-wide">
          <motion.h1
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease }}
            className="text-3xl sm:text-4xl md:text-6xl font-bold max-w-3xl mb-10 sm:mb-16 text-foreground"
          >
            Projetos que combinam código, dados e IA
          </motion.h1>

          {/* Filters & View Toggle */}
          <div className="flex items-center justify-between gap-4 mb-8 sm:mb-10 border-b border-border pb-4">
            <div className="flex gap-3 sm:gap-6 overflow-x-auto pb-1 -mb-1 scrollbar-none flex-1">
              {([["all", `Todos`], ["development", `Dev (${devCount})`], ["data", `Data (${dataCount})`], ["ai", `AI (${aiCount})`]] as const).map(
                ([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`text-sm font-medium transition-colors whitespace-nowrap py-1.5 min-h-[44px] flex items-center ${
                      filter === key ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {filter === key && <span className="inline-block w-2 h-2 rounded-full bg-accent mr-2" />}
                    {label}
                  </button>
                )
              )}
            </div>
            <div className="hidden sm:flex gap-1 flex-shrink-0">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded ${viewMode === "list" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded ${viewMode === "grid" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile: always card view / Desktop: toggleable */}
          <div className="sm:hidden flex flex-col gap-5">
            {filtered.map((project, i) => (
              <TransitionLink key={project.slug} to={`/project/${project.slug}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: i * 0.08, duration: 0.6, ease }}
                  className="group cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-xl aspect-[16/10] bg-secondary mb-3">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <span className="text-xs font-medium text-background/70 uppercase tracking-wider">
                        {project.services}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowUpRight className="w-4 h-4 text-foreground" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{project.year}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{project.client}</p>
                </motion.div>
              </TransitionLink>
            ))}
          </div>

          {/* Desktop list view */}
          <div className="hidden sm:block">
            {viewMode === "list" ? (
              <div className="divide-y divide-border">
                {filtered.map((project, i) => (
                  <TransitionLink key={project.slug} to={`/project/${project.slug}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="grid grid-cols-4 md:grid-cols-5 py-5 items-center group cursor-pointer hover:bg-secondary/50 transition-colors -mx-4 px-4 rounded gap-2"
                    >
                      <span className="font-medium text-base text-foreground group-hover:text-primary transition-colors col-span-2 md:col-span-1 truncate">
                        {project.client}
                      </span>
                      <span className="text-sm text-muted-foreground hidden md:block">{project.location}</span>
                      <span className="text-sm text-muted-foreground">{project.services}</span>
                      <span className="text-sm text-muted-foreground text-right">{project.year}</span>
                    </motion.div>
                  </TransitionLink>
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-8">
                {filtered.map((project, i) => (
                  <TransitionLink key={project.slug} to={`/project/${project.slug}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ delay: i * 0.1, duration: 0.7, ease }}
                      className="group cursor-pointer"
                    >
                      <div className="relative overflow-hidden rounded-lg mb-4 aspect-[4/3] bg-secondary">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex justify-between items-baseline gap-2">
                        <h3 className="font-semibold text-base text-foreground truncate">{project.title}</h3>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">{project.services}</span>
                      </div>
                    </motion.div>
                  </TransitionLink>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <WavyDivider direction="light-to-dark" />
      <Footer variant="dark" />
    </main>
  );
};

export default WorkPage;
