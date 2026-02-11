import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, List } from "lucide-react";
import WavyDivider from "@/components/WavyDivider";
import Footer from "@/components/Footer";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";
import project4 from "@/assets/project-4.jpg";

const allProjects = [
  { title: "Plataforma E-commerce", client: "TechStore", location: "São Paulo", services: "Desenvolvimento", year: "2024", category: "development", image: project1 },
  { title: "Identidade Visual", client: "StartupXYZ", location: "Remoto", services: "Design", year: "2024", category: "design", image: project2 },
  { title: "Painel de Analytics", client: "DataCo", location: "Rio de Janeiro", services: "Desenvolvimento", year: "2024", category: "development", image: project3 },
  { title: "App Social", client: "ConnectApp", location: "Curitiba", services: "Design", year: "2023", category: "design", image: project4 },
  { title: "Landing Page", client: "AgencyPro", location: "Remoto", services: "Design & Dev", year: "2023", category: "development", image: project1 },
  { title: "Sistema CRM", client: "SalesForce BR", location: "São Paulo", services: "Desenvolvimento", year: "2023", category: "development", image: project2 },
  { title: "Site Portfólio", client: "Creative Studio", location: "Florianópolis", services: "Design", year: "2023", category: "design", image: project3 },
];

type Filter = "all" | "design" | "development";

const WorkPage = () => {
  const [filter, setFilter] = useState<Filter>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const filtered = filter === "all" ? allProjects : allProjects.filter((p) => p.category === filter);
  const designCount = allProjects.filter((p) => p.category === "design").length;
  const devCount = allProjects.filter((p) => p.category === "development").length;

  return (
    <main>
      <section className="section-light pt-28 sm:pt-32 pb-16 sm:pb-20">
        <div className="container-wide">
          <motion.h1
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl md:text-6xl font-bold max-w-3xl mb-10 sm:mb-16 text-foreground"
          >
            Criando produtos digitais de outro nível
          </motion.h1>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10 border-b border-border pb-4">
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-1 -mb-1 scrollbar-none">
              {([["all", `Todos`], ["design", `Design (${designCount})`], ["development", `Dev (${devCount})`]] as const).map(
                ([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`text-sm font-medium transition-colors whitespace-nowrap ${
                      filter === key ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {filter === key && <span className="inline-block w-2 h-2 rounded-full bg-accent mr-2" />}
                    {label}
                  </button>
                )
              )}
            </div>
            <div className="flex gap-2 self-end sm:self-auto">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${viewMode === "list" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${viewMode === "grid" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List view */}
          {viewMode === "list" ? (
            <div className="divide-y divide-border">
              {filtered.map((project, i) => (
                <motion.div
                  key={project.title + i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 py-4 sm:py-5 items-center group cursor-pointer hover:bg-secondary/50 transition-colors -mx-4 px-4 rounded gap-2"
                >
                  <span className="font-medium text-sm sm:text-base text-foreground group-hover:text-primary transition-colors col-span-1 sm:col-span-2 md:col-span-1 truncate">
                    {project.client}
                  </span>
                  <span className="text-sm text-muted-foreground hidden md:block">{project.location}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground truncate">{project.services}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground text-right">{project.year}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
              {filtered.map((project, i) => (
                <motion.div
                  key={project.title + i}
                  initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="group cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-lg mb-3 sm:mb-4 aspect-[4/3] bg-secondary">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex justify-between items-baseline gap-2">
                    <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">{project.title}</h3>
                    <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">{project.services}</span>
                  </div>
                </motion.div>
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

export default WorkPage;
