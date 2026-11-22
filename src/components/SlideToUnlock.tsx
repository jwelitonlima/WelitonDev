import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface SlideToUnlockProps {
  onComplete: () => void;
  resetKey?: string | number;
}

const BUTTON_SIZE = 48; // w-12
const CONTAINER_PADDING = 4; // p-1 (4px de cada lado)

export const SlideToUnlock = ({ onComplete, resetKey }: SlideToUnlockProps) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  // Largura reativa do container
  const [maxDrag, setMaxDrag] = useState(216);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      setMaxDrag(Math.max(0, el.offsetWidth - BUTTON_SIZE - CONTAINER_PADDING * 2));
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Reset robusto (mount, resetKey, retorno de aba, foco da janela)
  const reset = useCallback(() => {
    x.stop();
    x.set(0);
    setIsUnlocked(false);
  }, [x]);

  useEffect(() => {
    reset();
  }, [reset, resetKey]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") reset();
    };
    const onFocus = () => reset();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
    };
  }, [reset]);

  // Texto some conforme arrasta
  const textOpacity = useTransform(x, [0, 100], [1, 0]);

  const handleDragEnd = () => {
    if (x.get() > maxDrag * 0.6) {
      setIsUnlocked(true);
      // Move até o final e aguarda a animação terminar
      animate(x, maxDrag, { duration: 0.2, ease: "easeOut" }).then(() => {
        setTimeout(() => onComplete(), 100);
      });
    } else {
      // Retorna suavemente ao início se não passar de 60%
      animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative z-10 w-full max-w-[280px] h-14 bg-secondary/80 backdrop-blur-md border border-border rounded-full flex items-center p-1 overflow-hidden select-none shadow-sm"
    >
      {/* 
        CORREÇÃO DE UI: 
        - pl-14 (padding-left) empurra o texto para a direita, tirando de baixo do botão.
        - A opacidade continua reagindo ao arraste.
      */}
      <motion.div
        style={{ opacity: textOpacity }}
        className="absolute inset-0 flex items-center justify-center pl-14 pr-4 pointer-events-none"
      >
        <span className="shimmer-text text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-muted-foreground truncate">
          Deslize para acessar o app
        </span>
      </motion.div>

      {/* Botão Deslizante */}
      <motion.div
        drag={isUnlocked ? false : "x"}
        dragConstraints={{ left: 0, right: maxDrag }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x }}
        animate={isUnlocked ? { opacity: 0, scale: 0.9 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="relative z-20 w-12 h-12 bg-foreground rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md shrink-0"
      >
        <ChevronRight className="w-5 h-5 text-background" strokeWidth={2.5} />
      </motion.div>
    </div>
  );
};