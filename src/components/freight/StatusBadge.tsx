import { cn } from "@/lib/utils";
import { FreightStatus, AlertPriority, statusLabels, priorityLabels } from "@/data/freightData";

interface StatusBadgeProps {
  status?: FreightStatus;
  priority?: AlertPriority;
  className?: string;
}

const statusStyles: Record<FreightStatus, string> = {
  em_transito: "bg-freight-primary/15 text-freight-primary border-freight-primary/30",
  entregue: "bg-freight-success/15 text-freight-success border-freight-success/30",
  atrasado: "bg-freight-warning/15 text-freight-warning border-freight-warning/30",
  critico: "bg-freight-danger/15 text-freight-danger border-freight-danger/30",
  aguardando: "bg-muted text-muted-foreground border-border",
};

const priorityStyles: Record<AlertPriority, string> = {
  critica: "bg-freight-danger/15 text-freight-danger border-freight-danger/30",
  alta: "bg-freight-warning/15 text-freight-warning border-freight-warning/30",
  media: "bg-freight-primary/15 text-freight-primary border-freight-primary/30",
  baixa: "bg-muted text-muted-foreground border-border",
};

const StatusBadge = ({ status, priority, className }: StatusBadgeProps) => {
  const label = status ? statusLabels[status] : priority ? priorityLabels[priority] : "";
  const styles = status ? statusStyles[status] : priority ? priorityStyles[priority] : "";

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", styles, className)}>
      {label}
    </span>
  );
};

export default StatusBadge;
