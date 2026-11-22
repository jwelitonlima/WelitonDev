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
      // EFEITO GLASSMORPHISM AQUI: backdrop-blur, fundo branco translúcido e borda suave
      className="relative w-full sm:w-[280px] h-14 bg-white/5 backdrop-blur-md border border-white/20 rounded-full flex items-center p-1 overflow-hidden select-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.05)]"
    >
      {/* Texto com Efeito Shimmer */}
      <motion.span 
        style={{ opacity: textOpacity }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <span className="shimmer-text text-[10px] sm:text-xs font-semibold tracking-widest uppercase drop-shadow-sm">
          Deslize para acessar o app
        </span>
      </motion.span>

      {/* Botão Deslizante em Estilo Vidro (Glass) */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: containerRef.current ? containerRef.current.offsetWidth - 64 : 216 }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x }}
        animate={isUnlocked ? { x: 300 } : {}}
        // Botão de vidro: fundo branco semi-transparente, borda branca e sombra suave
        className="relative z-10 w-12 h-12 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
      >
        {/* Ícone escuro para contrastar com o vidro branco */}
        <ChevronRight className="w-5 h-5 text-foreground/70" strokeWidth={2.5} />
      </motion.div>

      {/* Fundo que preenche ao arrastar (Efeito de "luz" que acompanha o dedo) */}
      <motion.div 
        style={{ width: useTransform(x, (val) => `${val + 56}px`) }}
        className="absolute left-0 top-0 bottom-0 bg-white/10 pointer-events-none"
      />
    </div>
  );
};