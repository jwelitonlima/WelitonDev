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
  { title: "E-commerce Platform", client: "TechStore", location: "São Paulo", services: "Development", year: "2024", category: "development", image: project1 },
  { title: "Brand Identity", client: "StartupXYZ", location: "Remote", services: "Design", year: "2024", category: "design", image: project2 },
  { title: "Analytics Dashboard", client: "DataCo", location: "Rio de Janeiro", services: "Development", year: "2024", category: "development", image: project3 },
  { title: "Social App", client: "ConnectApp", location: "Curitiba", services: "Design", year: "2023", category: "design", image: project4 },
  { title: "Landing Page", client: "AgencyPro", location: "Remote", services: "Design & Dev", year: "2023", category: "development", image: project1 },
  { title: "CRM System", client: "SalesForce BR", location: "São Paulo", services: "Development", year: "2023", category: "development", image: project2 },
  { title: "Portfolio Website", client: "Creative Studio", location: "Florianópolis", services: "Design", year: "2023", category: "design", image: project3 },
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
      <section className="section-light pt-32 pb-20">
        <div className="container-wide">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold max-w-3xl mb-16 text-foreground"
          >
            Creating next level digital products
          </motion.h1>

          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10 border-b border-border pb-4">
            <div className="flex gap-6">
              {([["all", `All`], ["design", `Design (${designCount})`], ["development", `Development (${devCount})`]] as const).map(
                ([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`text-sm font-medium transition-colors ${
                      filter === key ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {filter === key && <span className="inline-block w-2 h-2 rounded-full bg-accent mr-2" />}
                    {label}
                  </button>
                )
              )}
            </div>
            <div className="flex gap-2">
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
                  className="grid grid-cols-4 md:grid-cols-5 py-5 items-center group cursor-pointer hover:bg-secondary/50 transition-colors -mx-4 px-4 rounded"
                >
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors col-span-2 md:col-span-1">
                    {project.client}
                  </span>
                  <span className="text-sm text-muted-foreground hidden md:block">{project.location}</span>
                  <span className="text-sm text-muted-foreground">{project.services}</span>
                  <span className="text-sm text-muted-foreground text-right">{project.year}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {filtered.map((project, i) => (
                <motion.div
                  key={project.title + i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
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
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-foreground">{project.title}</h3>
                    <span className="text-sm text-muted-foreground">{project.services}</span>
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
