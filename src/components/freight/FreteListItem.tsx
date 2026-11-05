import { FreightItem } from "@/data/freightData";
import StatusBadge from "./StatusBadge";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FreteListItemProps {
  freight: FreightItem;
  selected?: boolean;
  onClick: (freight: FreightItem) => void;
}

const FreteListItem = ({ freight, selected, onClick }: FreteListItemProps) => {
  const eta = new Date(freight.eta);
  const etaStr = eta.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <button
      onClick={() => onClick(freight)}
      className={cn(
        "w-full text-left p-3 rounded-lg border transition-all",
        selected ? "bg-freight-primary/10 border-freight-primary/30" : "bg-card border-border hover:bg-muted/50"
      )}
      aria-label={`Frete ${freight.code}`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <code className="text-xs font-mono font-semibold">{freight.code}</code>
        <StatusBadge status={freight.status} className="text-[10px] px-2 py-0" />
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="truncate max-w-[80px]">{freight.origin.split(",")[0]}</span>
        <ArrowRight className="w-3 h-3 shrink-0" />
        <span className="truncate max-w-[80px]">{freight.destination.split(",")[0]}</span>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">ETA: {etaStr}</p>
    </button>
  );
};

export default FreteListItem;
