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

const colorMap = {
  primary: "border-freight-primary/20",
  success: "border-freight-success/20",
  warning: "border-freight-warning/20",
  danger: "border-freight-danger/20",
};

const glowMap = {
  primary: "shadow-freight-primary/5",
  success: "shadow-freight-success/5",
  warning: "shadow-freight-warning/5",
  danger: "shadow-freight-danger/5",
};

const iconBg = {
  primary: "bg-freight-primary/10 text-freight-primary",
  success: "bg-freight-success/10 text-freight-success",
  warning: "bg-freight-warning/10 text-freight-warning",
  danger: "bg-freight-danger/10 text-freight-danger",
};

const textColor = {
  primary: "text-freight-primary",
  success: "text-freight-success",
  warning: "text-freight-warning",
  danger: "text-freight-danger",
};

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

const MetricCard = ({ title, value, displayValue, icon: Icon, color, subtitle, trend, delay = 0 }: MetricCardProps) => {
  const animatedValue = useAnimatedNumber(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "rounded-2xl border bg-card/50 backdrop-blur-sm p-4 md:p-5 shadow-lg hover:shadow-xl transition-shadow",
        colorMap[color],
        glowMap[color],
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("p-2 rounded-xl", iconBg[color])}>
          <Icon className="w-4 h-4" />
        </div>
        {trend && (
          <div className={cn("flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full",
            trend.value >= 0
              ? "bg-freight-success/10 text-freight-success"
              : "bg-freight-danger/10 text-freight-danger"
          )}>
            {trend.value >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <p className={cn("text-3xl md:text-4xl font-bold tracking-tight", textColor[color])}>
        {displayValue ? displayValue.replace(String(value), String(animatedValue)) : animatedValue}
      </p>
      <p className="text-xs text-muted-foreground mt-1 font-medium">{title}</p>
      {subtitle && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{subtitle}</p>}
    </motion.div>
  );
};

export default MetricCard;
