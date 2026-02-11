import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "primary" | "success" | "warning" | "danger";
  subtitle?: string;
}

const colorMap = {
  primary: "text-freight-primary bg-freight-primary/10 border-freight-primary/20",
  success: "text-freight-success bg-freight-success/10 border-freight-success/20",
  warning: "text-freight-warning bg-freight-warning/10 border-freight-warning/20",
  danger: "text-freight-danger bg-freight-danger/10 border-freight-danger/20",
};

const iconBg = {
  primary: "bg-freight-primary/15",
  success: "bg-freight-success/15",
  warning: "bg-freight-warning/15",
  danger: "bg-freight-danger/15",
};

const MetricCard = ({ title, value, icon: Icon, color, subtitle }: MetricCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className={cn("rounded-xl border p-4 md:p-5", colorMap[color])}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider opacity-70">{title}</p>
        <p className="text-2xl md:text-3xl font-bold mt-1">{value}</p>
        {subtitle && <p className="text-xs opacity-60 mt-1">{subtitle}</p>}
      </div>
      <div className={cn("p-2.5 rounded-lg", iconBg[color])}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </motion.div>
);

export default MetricCard;
