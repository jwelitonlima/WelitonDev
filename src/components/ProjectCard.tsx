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
  // Diferencia os projetos Mobile dos projetos Desktop/Apresentação
  const isMobileMockup = slug === "interamed";

  return (
    <TransitionLink to={`/projetos/${slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="group flex flex-col cursor-pointer"
      >
        {/* Fundo do Card com gradiente sutil (padrão do portfólio) */}
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-secondary to-secondary/30 border border-border transition-all duration-500 group-hover:border-primary/30 group-hover:shadow-lg flex items-center justify-center p-6 sm:p-8">
          
          {/* Lógica de Mockup */}
          {isMobileMockup ? (
            /* Mockup Mobile (Celular) - InteraMed */
            <img
              src={image}
              alt={title}
              className="w-auto h-full max-h-[110%] object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            /* Mockup de Apresentação (Monitor/TV) - FreteAI e Delivery */
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              {/* Corpo da TV/Monitor */}
              <div className="relative w-full h-full max-h-[85%] aspect-video bg-[#111] rounded-lg border-[6px] sm:border-[8px] border-[#222] shadow-2xl overflow-hidden transition-transform duration-700 group-hover:scale-105">
                {/* Tela do Monitor */}
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                />
                {/* Reflexo sutil na tela */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none" />
              </div>
              
              {/* Base/Suporte do Monitor */}
              <div className="absolute -bottom-2 w-1/3 h-3 bg-[#222] rounded-b-md shadow-lg" />
              <div className="absolute -bottom-4 w-1/2 h-1.5 bg-[#111] rounded-full shadow-md" />
            </div>
          )}

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