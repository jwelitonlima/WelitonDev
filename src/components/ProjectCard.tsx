import { motion } from "framer-motion";

interface ProjectCardProps {
  title: string;
  category: string;
  image: string;
  index: number;
}

const ProjectCard = ({ title, category, image, index }: ProjectCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-lg mb-3 sm:mb-4 aspect-[4/3] bg-secondary">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex justify-between items-baseline gap-2">
        <h3 className="font-semibold text-base sm:text-lg truncate">{title}</h3>
        <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">{category}</span>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
