import { motion } from "framer-motion";
import TransitionLink from "./TransitionLink";

interface ProjectCardProps {
  title: string;
  category: string;
  image: string;
  slug: string;
  index: number;
}

const ProjectCard = ({ title, category, image, slug, index }: ProjectCardProps) => {
  return (
    <TransitionLink to={`/projetos/${slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="group flex flex-col cursor-pointer"
      >
        {/* Container do Mockup Premium (Fundo Escuro + Padding Interno) */}
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/10 p-6 sm:p-8 flex items-center justify-center transition-all duration-500 group-hover:border-primary/40 group-hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.15)]">
          
          {/* Imagem com object-contain para não cortar as bordas */}
          <img
            src={image}
            alt={title}
            className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />

          {/* Overlay sutil de gradiente no hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>

        {/* Textos (Título e Categoria) */}
        <div className="mt-4 flex flex-col gap-1 px-1">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors">
              {title}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground truncate font-medium">
            {category}
          </p>
        </div>
      </motion.div>
    </TransitionLink>
  );
};

export default ProjectCard;