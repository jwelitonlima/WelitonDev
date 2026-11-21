import { useEffect, useRef, useState } from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number;
  displayValue?: string;
  icon: LucideIcon;
  color: "primary" | "success" | "warning" | "danger";
  subtitle?: string;
  trend?: { value: number; label: string };
  delay?: number;
}

function useAnimatedNumber(target: number, duration = 1200) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    const start = ref.current;
    const diff = target - start;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(start + diff * eased);
      setCurrent(val);
      ref.current = val;
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return current;
}

const MetricCard = ({ title, value, displayValue, icon: Icon, trend, delay = 0 }: MetricCardProps) => {
  const animatedValue = useAnimatedNumber(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6 hover:bg-background/80 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{title}</p>
        <Icon className="w-4 h-4 text-muted-foreground/50" />
      </div>
      
      <div className="flex items-baseline gap-3">
        <p className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
          {displayValue ? displayValue.replace(String(value), String(animatedValue)) : animatedValue}
        </p>
        {trend && (
          <span className={cn(
            "flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded",
            trend.value >= 0 ? "text-emerald-500" : "text-red-500"
          )}>
            {trend.value >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default MetricCard;