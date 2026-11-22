import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface SlideToUnlockProps {
  onComplete: () => void;
}

export const SlideToUnlock = ({ onComplete }: SlideToUnlockProps) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  // Opacidade do texto muda conforme você arrasta
  const textOpacity = useTransform(x, [0, 100], [1, 0]);

  const handleDragEnd = () => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const buttonWidth = 56; // Largura do botão (w-14)
    const maxDrag = containerWidth - buttonWidth - 8; // 8px de padding

    // Se arrastou mais da metade do caminho, completa a ação
    if (x.get() > maxDrag * 0.6) {
      setIsUnlocked(true);
      // Pequeno delay para a animação de completar terminar antes de abrir o modal
      setTimeout(() => onComplete(), 300);
    } else {
      // Se não arrastou o suficiente, volta para o início
      x.set(0);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-sm h-14 bg-foreground/5 border border-foreground/10 rounded-full flex items-center p-1 overflow-hidden select-none"
    >
      {/* Texto de Fundo (Deslize) */}
      <motion.span 
        style={{ opacity: textOpacity }}
        className="absolute inset-0 flex items-center justify-center text-sm font-medium text-foreground/50 tracking-widest uppercase pointer-events-none"
      >
        <motion.span 
          animate={{ x: [0, 5, 0] }} 
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          Deslize para acessar
        </motion.span>
      </motion.span>

      {/* Botão Deslizante */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: containerRef.current ? containerRef.current.offsetWidth - 64 : 250 }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x }}
        animate={isUnlocked ? { x: 300 } : {}}
        className="relative z-10 w-12 h-12 bg-foreground rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md"
      >
        <ChevronRight className="w-5 h-5 text-background" />
      </motion.div>

      {/* Fundo que preenche ao arrastar */}
      <motion.div 
        style={{ width: useTransform(x, (val) => `${val + 56}px`) }}
        className="absolute left-0 top-0 bottom-0 bg-primary/10 pointer-events-none"
      />
    </div>
  );
};