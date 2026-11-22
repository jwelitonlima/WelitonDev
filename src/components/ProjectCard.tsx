import { motion } from "framer-motion";
import TransitionLink from "@/components/TransitionLink";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Project } from "@/data/projects";

interface ProjectCardProps {
  project: Project;
  index: number;
}

const ease = [0.16, 1, 0.3, 1] as const;

const CardMedia = ({ project }: { project: Project }) => {
  if (project.videoUrl) {
    if (project.deviceType === "desktop") {
      return (
        <div className="relative w-[85%] flex flex-col items-center justify-center">
          <div className="relative w-full aspect-video bg-[#1a1a1a] rounded-t-lg p-[4px] pb-[6px] shadow-lg border border-gray-700">
            <div className="relative w-full h-full bg-black rounded-sm overflow-hidden">
              <video
                src={project.videoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="relative w-[110%] h-2 bg-gradient-to-b from-gray-400 to-gray-600 rounded-b-lg shadow-md">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-gray-700 rounded-b-sm" />
          </div>
        </div>
      );
    }

    // Celular: mesmo componente da página de detalhe, só menor
    return <PhoneFrame videoUrl={project.videoUrl} className="h-[92%]" />;
  }

  return (
    <img
      src={project.image}
      alt={project.title}
      loading="lazy"
      className="w-full h-full object-contain"
    />
  );
};

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  return (
    <TransitionLink to={`/projetos/${project.slug}`} className="group block">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.6, ease }}
        className="flex flex-col h-full"
      >
        <div className="relative overflow-hidden rounded-2xl bg-[#f4f4f5] aspect-[4/3] mb-5 border border-border/50 transition-shadow duration-500 group-hover:shadow-lg">
          {project.demoUrl && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-background rounded-full border border-border shadow-sm text-xs font-medium text-foreground">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Demo Live
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
            <CardMedia project={project} />
          </div>
        </div>

        <div className="flex flex-col gap-2 px-1 mt-auto">
          <div className="flex justify-between items-start gap-4">
            <h3 className="font-bold text-lg sm:text-xl text-foreground leading-tight group-hover:text-primary transition-colors">
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
  );
};

export default ProjectCard;