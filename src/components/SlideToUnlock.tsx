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

  const textOpacity = useTransform(x, [0, 100], [1, 0]);

  const handleDragEnd = () => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const buttonWidth = 56;
    const maxDrag = containerWidth - buttonWidth - 8;

    if (x.get() > maxDrag * 0.6) {
      setIsUnlocked(true);
      setTimeout(() => onComplete(), 300);
    } else {
      x.set(0);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full sm:w-[280px] h-14 bg-foreground/5 border border-foreground/10 rounded-full flex items-center p-1 overflow-hidden select-none"
    >
      <motion.span 
        style={{ opacity: textOpacity }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <span className="shimmer-text text-[10px] sm:text-xs font-semibold tracking-widest uppercase">
          Deslize para acessar
        </span>
      </motion.span>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: containerRef.current ? containerRef.current.offsetWidth - 64 : 216 }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x }}
        animate={isUnlocked ? { x: 300 } : {}}
        className="relative z-10 w-12 h-12 bg-foreground rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md"
      >
        <ChevronRight className="w-5 h-5 text-background" />
      </motion.div>

      <motion.div 
        style={{ width: useTransform(x, (val) => `${val + 56}px`) }}
        className="absolute left-0 top-0 bottom-0 bg-primary/10 pointer-events-none"
      />
    </div>
  );
};