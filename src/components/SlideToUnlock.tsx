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

  // Opacidade do texto some conforme você arrasta
  const textOpacity = useTransform(x, [0, 100], [1, 0]);

  const handleDragEnd = () => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const buttonWidth = 56; // Largura do botão (w-14)
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
      // Fundo escuro translúcido com borda sutil (Estilo Apple Dark)
      className="relative w-full sm:w-[280px] h-14 bg-foreground/[0.03] backdrop-blur-xl border border-foreground/10 rounded-full flex items-center p-1 overflow-hidden select-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]"
    >
      {/* Texto com Efeito Shimmer (Agora usando variáveis do tema para o brilho) */}
      <motion.span 
        style={{ opacity: textOpacity }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <span className="shimmer-text text-[10px] sm:text-xs font-semibold tracking-widest uppercase">
          Deslize para acessar o app
        </span>
      </motion.span>

      {/* Botão Deslizante - Preto Premium com leve efeito Glass */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: containerRef.current ? containerRef.current.offsetWidth - 64 : 216 }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x }}
        animate={isUnlocked ? { x: 300 } : {}}
        // Fundo quase preto, com leve transparência e borda fina para dar volume
        className="relative z-10 w-12 h-12 bg-foreground/90 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg"
      >
        {/* Ícone branco para alto contraste */}
        <ChevronRight className="w-5 h-5 text-background" strokeWidth={2.5} />
      </motion.div>

      {/* Fundo que preenche ao arrastar (Efeito de "luz" que acompanha o dedo) */}
      <motion.div 
        style={{ width: useTransform(x, (val) => `${val + 56}px`) }}
        className="absolute left-0 top-0 bottom-0 bg-foreground/5 pointer-events-none"
      />
    </div>
  );
};