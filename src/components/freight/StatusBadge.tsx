import { cn } from "@/lib/utils";
import { FreightStatus, AlertPriority, statusLabels, priorityLabels } from "@/data/freightData";

interface StatusBadgeProps {
  status?: FreightStatus;
  priority?: AlertPriority;
  className?: string;
}

// Cores mais suaves (estilo Linear/Vercel)
const statusStyles: Record<FreightStatus, string> = {
  em_transito: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  entregue: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  atrasado: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  critico: "bg-red-500/10 text-red-500 border-red-500/20",
  aguardando: "bg-muted/50 text-muted-foreground border-border/50",
};

const priorityStyles: Record<AlertPriority, string> = {
  critica: "bg-red-500/10 text-red-500 border-red-500/20",
  alta: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  media: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  baixa: "bg-muted/50 text-muted-foreground border-border/50",
};

const StatusBadge = ({ status, priority, className }: StatusBadgeProps) => {
  const label = status ? statusLabels[status] : priority ? priorityLabels[priority] : "";
  const styles = status ? statusStyles[status] : priority ? priorityStyles[priority] : "";

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium border tracking-wide uppercase", styles, className)}>
      {label}
    </span>
  );
};

export default StatusBadge;