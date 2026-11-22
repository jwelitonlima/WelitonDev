import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface SlideToUnlockProps {
  onComplete: () => void;
}

export const SlideToUnlock = ({ onComplete }: SlideToUnlockProps) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  // GARANTIA DE RESET: Se o componente remontar, o X volta para 0 e o estado destrava
  useEffect(() => {
    x.set(0);
    setIsUnlocked(false);
  }, [x]);

  // Opacidade do texto some conforme você arrasta
  const textOpacity = useTransform(x, [0, 100], [1, 0]);

  const handleDragEnd = () => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const buttonWidth = 56; // w-14 = 56px
    const maxDrag = containerWidth - buttonWidth - 8; // 8px de padding

    if (x.get() > maxDrag * 0.6) {
      setIsUnlocked(true);
      setTimeout(() => onComplete(), 300);
    } else {
      x.set(0); // Volta para o início
    }
  };

  return (
    <div 
      ref={containerRef}
      // Adicionado z-10 e relative para não ser cortado pela imagem do notebook
      className="relative z-10 w-full max-w-[280px] h-14 bg-secondary/80 backdrop-blur-md border border-border rounded-full flex items-center p-1 overflow-hidden select-none shadow-sm"
    >
      {/* Texto com Efeito Shimmer */}
      <motion.span 
        style={{ opacity: textOpacity }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <span className="shimmer-text text-[10px] sm:text-xs font-semibold tracking-widest uppercase">
          Deslize para acessar o app
        </span>
      </motion.span>

      {/* Botão Deslizante */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: containerRef.current ? containerRef.current.offsetWidth - 64 : 216 }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x }}
        // Se destravado, esconde o botão animando ele para o final
        animate={isUnlocked ? { x: 300, opacity: 0 } : { x: 0, opacity: 1 }}
        className="relative z-20 w-12 h-12 bg-foreground rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md"
      >
        <ChevronRight className="w-5 h-5 text-background" strokeWidth={2.5} />
      </motion.div>
    </div>
  );
};