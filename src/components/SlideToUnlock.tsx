import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface SlideToUnlockProps {
  onComplete: () => void;
  /** Muda esse valor para forçar o reset externo (ex.: location.key). */
  resetKey?: string | number;
}

const BUTTON_SIZE = 48; // w-12
const CONTAINER_PADDING = 4; // p-1

export const SlideToUnlock = ({ onComplete, resetKey }: SlideToUnlockProps) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  // Largura reativa do container (não confiar em ref no primeiro render)
  const [maxDrag, setMaxDrag] = useState(216);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    const measure = () => {
      setMaxDrag(Math.max(0, el.offsetWidth - BUTTON_SIZE - CONTAINER_PADDING * 2));
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // RESET ROBUSTO: mount, troca de resetKey, retorno de aba e foco da janela.
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
      // Anima até o fim e some; só então dispara onComplete
      animate(x, maxDrag, { duration: 0.25, ease: "easeOut" }).then(() => {
        // pequeno delay para o fade terminar visualmente
        setTimeout(() => onComplete(), 150);
      });
    } else {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative z-10 w-full max-w-[280px] h-14 bg-secondary/80 backdrop-blur-md border border-border rounded-full flex items-center p-1 overflow-hidden select-none shadow-sm"
    >
      <motion.span
        style={{ opacity: textOpacity }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <span className="shimmer-text text-[10px] sm:text-xs font-semibold tracking-widest uppercase">
          Deslize para acessar o app
        </span>
      </motion.span>

      <motion.div
        drag={isUnlocked ? false : "x"}
        dragConstraints={{ left: 0, right: maxDrag }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        // Só `animate` controla x e opacity — sem style.x para evitar conflito.
        animate={
          isUnlocked
            ? { x: maxDrag, opacity: 0 }
            : { x: 0, opacity: 1 }
        }
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative z-20 w-12 h-12 bg-foreground rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md"
      >
        <ChevronRight className="w-5 h-5 text-background" strokeWidth={2.5} />
      </motion.div>
    </div>
  );
};